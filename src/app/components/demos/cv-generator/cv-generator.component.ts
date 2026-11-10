import { Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { portfolioContent } from '../../../data/portfolio-content';
import { PortfolioLanguageService } from '../../../services/portfolio-language.service';
import { CvViewToggleComponent } from './cv-view-toggle.component';
import { CvParseError, normalizeCv, parseCv } from './cv-parser';
import { CvData, CvFormat, CvLanguage } from './data/cv.model';
import { CV_TEXTS, format } from './data/cv-texts';
import cvDavidEs from './data/cv-david.es.json';
import cvDavidEn from './data/cv-david.en.json';

const POPPINS_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';

/** Outer size of the A4 sheet (`.page-format`, border-box) in CSS px: 764×1080 has the A4 aspect ratio. */
const SHEET_WIDTH = 764;
const SHEET_HEIGHT = 1080;
const MAX_IMPORT_BYTES = 1024 * 1024;

type Panel = 'editor' | 'preview';

interface Notice {
  kind: 'error' | 'info';
  message: string;
}

function loadStylesheetOnce(href: string): void {
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function bundledCv(json: unknown): CvData {
  const result = normalizeCv(json);
  if (!result.ok) throw new Error(`Invalid bundled CV data: ${result.error.code} ${result.error.path ?? ''}`);
  return result.data;
}

/** Sample CVs shown on load, one per CV language (source of David's own PDFs, see data/). */
const DEFAULT_CV: Record<CvLanguage, CvData> = {
  spanish: bundledCv(cvDavidEs),
  english: bundledCv(cvDavidEn),
};

const toJson = (data: CvData): string => JSON.stringify(data, null, 2);

/** "David Díaz Martínez" -> "David_Diaz_Martinez" (safe file names). */
const fileSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'CV';

@Component({
  selector: 'app-cv-generator',
  imports: [FormsModule, RouterLink, CvViewToggleComponent],
  templateUrl: './cv-generator.component.html',
  styleUrl: './cv-generator.component.css',
  standalone: true,
})
export class CvGeneratorComponent {
  private readonly languageService = inject(PortfolioLanguageService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly previewPanel = viewChild.required<ElementRef<HTMLElement>>('previewPanel');
  private readonly sheet = viewChild<ElementRef<HTMLElement>>('sheet');

  /** Site-level copy (back link); the CV itself keeps its own language selector. */
  readonly siteNav = computed(() => portfolioContent[this.languageService.language()].nav);

  readonly cvLanguage = signal<CvLanguage>('spanish');
  readonly cvFormat = signal<CvFormat>('visual');
  readonly texts = computed(() => CV_TEXTS[this.cvLanguage()]);

  readonly cvData = signal<CvData>(DEFAULT_CV.spanish);
  readonly editorText = signal(toJson(DEFAULT_CV.spanish));
  /** True until the user edits or imports: switching the CV language then swaps in that language's sample. */
  private readonly usingDefaultData = signal(true);
  readonly parseError = signal<CvParseError | null>(null);
  readonly parseErrorMessage = computed(() => {
    const error = this.parseError();
    return error ? this.describe(error) : '';
  });
  readonly editorNotice = signal<Notice | null>(null);
  readonly photoError = signal('');
  readonly pdfError = signal('');
  readonly profilePicture = signal('assets/img/profile-640.jpg');

  readonly activePanel = signal<Panel>('editor');
  private readonly previewScale = signal(1);
  /** While capturing the PDF the sheet is rendered at full size (html2canvas measures the transformed box). */
  private readonly exporting = signal(false);
  readonly sheetScale = computed(() => (this.exporting() ? 1 : this.previewScale()));
  readonly sheetWidth = SHEET_WIDTH;
  readonly sheetHeight = SHEET_HEIGHT;
  readonly generating = signal(false);
  readonly overflowing = signal(false);

  constructor() {
    // Poppins is only used by the visual CV: load it with this page instead of on every page of the site.
    loadStylesheetOnce(POPPINS_STYLESHEET);
    this.applyQueryParams();

    afterNextRender(() => {
      // Fit the A4 sheet to the preview column (phones, narrow windows); never upscale.
      const observer = new ResizeObserver(() => this.updateScale());
      observer.observe(this.previewPanel().nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
      this.checkOverflow();
    });
  }

  // --- Language, format and panels ------------------------------------------------

  setLanguage(language: CvLanguage): void {
    this.cvLanguage.set(language);
    if (this.usingDefaultData()) {
      this.loadData(DEFAULT_CV[language]);
    }
  }

  setFormat(cvFormat: CvFormat): void {
    this.cvFormat.set(cvFormat);
    this.scheduleOverflowCheck();
  }

  showPanel(panel: Panel): void {
    this.activePanel.set(panel);
    // The preview was display:none (0 px wide): measure it again once it is shown.
    afterNextRender(() => this.updateScale(), { injector: this.injector });
  }

  // --- JSON editor, import and export -------------------------------------------------

  onEditorChange(value: string): void {
    this.editorText.set(value);
    this.usingDefaultData.set(false);
    this.editorNotice.set(null);
    this.applyText(value);
  }

  onImportSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.importFile(file);
    input.value = ''; // the same file can be imported again after editing
  }

  onEditorDragOver(event: DragEvent): void {
    if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
  }

  onEditorDrop(event: DragEvent): void {
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    event.preventDefault();
    void this.importFile(file);
  }

  async importFile(file: File): Promise<void> {
    const texts = this.texts();
    const looksLikeText = /\.(json|txt)$/i.test(file.name) || ['application/json', 'text/plain'].includes(file.type);
    if (!looksLikeText) {
      this.editorNotice.set({ kind: 'error', message: format(texts.errors.fileType, { file: file.name }) });
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      this.editorNotice.set({ kind: 'error', message: format(texts.errors.fileTooLarge, { file: file.name }) });
      return;
    }

    let content: string;
    try {
      content = await file.text();
    } catch {
      this.editorNotice.set({ kind: 'error', message: format(texts.errors.readFailed, { file: file.name }) });
      return;
    }

    this.editorText.set(content);
    this.usingDefaultData.set(false);
    const ok = this.applyText(content);
    this.editorNotice.set(ok ? { kind: 'info', message: format(texts.imported, { file: file.name }) } : null);
  }

  exportJson(): void {
    const blob = new Blob([toJson(this.cvData()) + '\n'], { type: 'application/json' });
    this.downloadBlob(blob, `cv-${fileSlug(this.cvData().personal.name).toLowerCase()}.json`);
  }

  // --- Photo ----------------------------------------------------------------------

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setProfilePicture(file);
    input.value = '';
  }

  onPhotoDragOver(event: DragEvent): void {
    if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
  }

  onPhotoDrop(event: DragEvent): void {
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    event.preventDefault();
    this.setProfilePicture(file);
  }

  private setProfilePicture(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.photoError.set(format(this.texts().errors.photoType, { file: file.name }));
      return;
    }
    this.photoError.set('');
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicture.set(reader.result as string);
      this.scheduleOverflowCheck();
    };
    reader.onerror = () => this.photoError.set(format(this.texts().errors.readFailed, { file: file.name }));
    reader.readAsDataURL(file);
  }

  // --- PDF --------------------------------------------------------------------------

  /** Image PDF (html2pdf): pixel-identical to the preview, but the text is not selectable. */
  async downloadPdf(): Promise<void> {
    if (this.generating()) return;
    this.generating.set(true);
    this.pdfError.set('');

    try {
      await document.fonts.ready;
      this.exporting.set(true);
      await this.nextFrame();

      const element = this.sheet()?.nativeElement;
      if (!element) return;
      const languageCode = this.cvLanguage() === 'english' ? 'EN' : 'ES';
      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf()
        .set({
          margin: 0,
          filename: `CV_${fileSlug(this.cvData().personal.name)}_${languageCode}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, ignoreElements: (node: Element) => node.tagName === 'CANVAS' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
    } catch (error) {
      console.error('CV PDF export failed', error);
      this.pdfError.set(this.texts().errors.pdfFailed);
    } finally {
      this.exporting.set(false);
      this.generating.set(false);
    }
  }

  /** Text PDF: the browser's print dialog ("Save as PDF"); print styles keep only the A4 sheet. */
  printPdf(): void {
    window.print();
  }

  // --- Internals ----------------------------------------------------------------------

  /** Returns whether the text was a valid CV (the preview keeps the last valid data otherwise). */
  private applyText(value: string): boolean {
    const result = parseCv(value);
    if (!result.ok) {
      this.parseError.set(result.error);
      return false;
    }
    this.parseError.set(null);
    this.cvData.set(result.data);
    this.scheduleOverflowCheck();
    return true;
  }

  private loadData(data: CvData): void {
    this.cvData.set(data);
    this.editorText.set(toJson(data));
    this.parseError.set(null);
    this.editorNotice.set(null);
    this.scheduleOverflowCheck();
  }

  private describe(error: CvParseError): string {
    const texts = this.texts();
    const detail =
      error.code === 'wrongType' ? texts.typeNames[error.detail as keyof typeof texts.typeNames] : error.detail;
    return format(texts.errors[error.code], { path: error.path, detail });
  }

  /** `?lang=en|es` and `?format=aws|visual` open the demo in that state (handy to share or to render PDFs). */
  private applyQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('lang') === 'en') this.setLanguage('english');
    if (params.get('format') === 'aws') this.cvFormat.set('aws');
  }

  private updateScale(): void {
    const panel = this.previewPanel().nativeElement;
    const styles = getComputedStyle(panel);
    const available = panel.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    if (available > 0) {
      this.previewScale.set(Math.min(1, available / SHEET_WIDTH));
    }
  }

  private scheduleOverflowCheck(): void {
    afterNextRender(() => this.checkOverflow(), { injector: this.injector });
  }

  /** The sheet has a fixed A4 height: warn when the content runs past it (it would be cut from the PDF). */
  private checkOverflow(): void {
    const element = this.sheet()?.nativeElement;
    this.overflowing.set(!!element && element.scrollHeight > element.clientHeight + 2);
  }

  /** Resolves once the new scale is rendered; the timeout covers background tabs, where rAF is paused. */
  private nextFrame(): Promise<void> {
    return new Promise((resolve) =>
      afterNextRender(
        () => {
          requestAnimationFrame(() => resolve());
          window.setTimeout(resolve, 150);
        },
        { injector: this.injector },
      ),
    );
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Enana
  // cvData: ICvJson = {
  //   personal: {
  //     name: 'Laury Machado Espinosa',
  //     label: 'Desarrolladora web y administradora de redes',
  //     email: 'lauryespinosa1505@gmail.com',
  //     phone: '+53 56419770',
  //     summary: 'Ingeniera en Telecomunicaciones con experiencia en desarrollo web y administración de redes. Especialista en Laravel, diseño de interfaces con Blade y Livewire, APIs REST y bases de datos relacionales. Competente en virtualización de servidores, gestión de infraestructuras de TI y control de versiones.',
  //   },
  //   location: {
  //     postalCode: '50100',
  //     city: 'Villa Clara',
  //     country: 'Cuba',
  //   },
  //   profiles: [
  //     {
  //       network: 'LinkedIn',
  //       username: 'lauryespinosa1505',
  //       url: 'https://www.linkedin.com/in/laury-rosa-machado-espinosa-8a0821253',
  //     },
  //   ],
  //   work: [
  //     {
  //       company: 'CUPET',
  //       location: 'Villa Clara',
  //       position: 'Desarrolladora web y administradora de redes',
  //       website: undefined,
  //       startDate: 'Enero 2022',
  //       endDate: 'Actualidad',
  //       sumary: 'Desarrollo de varias herramientas web internas y administración de redes.',
  //       highlights: [
  //         'Desarrollo y mantenimiento de páginas web funcionales con Laravel',
  //         'Diseño e implementación de UI con Blade y Livewire.',
  //         'Diseño e implementación de APIs REST y gestión de modelos de bases de datos relacionales utilizando Eloquent, HeidiSQL y SQL Server.',
  //         'Gestión de usuarios del directorio activo y virtualización de servidores con Proxmox, Exsi y VMware Workstation Pro.',
  //         'Gestión de control de versiones con Git para colaboración en equipo y seguimiento de cambios.',
  //         'Instalación y mantenimiento de firewalls, proxys, antivirus y servidores.',
  //       ],
  //     },
  //   ],
  //   education: [
  //     {
  //       institution: "Universidad Central 'Marta Abreu' de las Villas",
  //       studyType: 'Título universitario de Ingeniería en Telecomunicaciones',
  //       startDate: 'Septiembre 2017',
  //       endDate: 'Diciembre 2022',
  //       gpa: '4.6',
  //     },
  //   ],
  //   skills: [
  //     {
  //       name: 'Desarrollo web',
  //       level: 'Expert',
  //       keywords: ['PHP', 'Laravel', 'HTML', 'CSS', 'JavaScript', 'Eloquent', 'Livewire', 'Blade', 'Jetstream', 'Breeze'],
  //     },
  //     {
  //       name: 'Administración de redes y sistemas',
  //       level: 'Expert',
  //       keywords: ['Proxmox', 'Exsi', 'VMware Workstation Pro', 'PfSense', 'SQL Server', 'HeidiSQL'],
  //     },
  //     {
  //       name: 'Control de versiones y otros',
  //       level: 'Advanced',
  //       keywords: ['Git', 'GitHub', 'Postman', 'PuTTY'],
  //     },
  //   ],
  //   languages: [
  //     {language: 'Español', fluency: 'Nativo'},
  //     {language: 'Inglés', fluency: 'B2'},
  //   ],
  // };
}
