import { Component, computed, inject, signal } from '@angular/core';
import {FormsModule} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { portfolioContent } from '../../../data/portfolio-content';
import { PortfolioLanguageService } from '../../../services/portfolio-language.service';
import { CvViewToggleComponent } from './cv-view-toggle.component';


interface ICvJson {
  personal: {
    name: string;
    label: string;
    picture?: string;
    email: string;
    phone: string;
    website?: string;
    summary: string;
  };
  location: {
    postalCode: string;
    city: string;
    country: string;
  };
  profiles: {
    network: string;
    username: string
    url: string
  }[];
  work: {
    company: string;
    location: string;
    position: string;
    website?: string;
    startDate: string;
    endDate: string;
    sumary: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    studyType: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }[];
  skills: {
    name: string;
    level: 'Basic' | 'Advanced' | 'Expert';
    keywords: string[];
  }[];
  languages: {
    language: string;
    fluency: string;
  }[];
}

type Language = 'spanish' | 'english';

const POPPINS_STYLESHEET = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap';

function loadStylesheetOnce(href: string): void {
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

@Component({
  selector: 'app-cv-generator',
  imports: [
    FormsModule,
    RouterLink,
    CvViewToggleComponent,
  ],
  templateUrl: './cv-generator.component.html',
  styleUrl: './cv-generator.component.css',
  standalone: true,
})
export class CvGeneratorComponent {
  private readonly languageService = inject(PortfolioLanguageService);
  /** Site-level copy (back link); the CV itself keeps its own language selector. */
  readonly siteNav = computed(() => portfolioContent[this.languageService.language()].nav);

  constructor() {
    // Poppins is only used by the visual CV: load it with this page instead of on every page of the site.
    loadStylesheetOnce(POPPINS_STYLESHEET);
  }

  // Variable para rellenar el CV
  readonly cvData = signal<ICvJson>({
    "personal": {
      "name": "David Díaz Martínez",
      "label": "Desarrollador Web Full Stack",
      "email": "lnkddmartinez@gmail.com",
      "phone": "+53 59283769",
      "summary": "Desarrollador Web con más de 3 años de experiencia especializado en Angular y ecosistema TypeScript. He trabajado en proyectos de gestión empresarial, software de cadena de suministro y sistemas de tickets. Enfoque en calidad de código, experiencia de usuario y soluciones escalables."
    },
    "location": {
      "postalCode": "50100",
      "city": "Villa Clara",
      "country": "Cuba"
    },
    "profiles": [
      {
        "network": "LinkedIn",
        "username": "lnkddmartinez",
        "url": "https://linkedin.com/in/david-díaz-martínez-3b0b71321"
      }
    ],
    "work": [
      {
        "company": "Mojito360",
        "location": "Remoto",
        "position": "Desarrollador Frontend",
        "website": "https://www.mojito360.com/en/",
        "startDate": "Noviembre 2025",
        "endDate": "Actualidad",
        "sumary": "Desarrollo frontend con Angular para software de gestión de cadena de suministro.",
        "highlights": [
          "Creación de nuevas vistas y flujos para clientes",
          "Gestión de envíos, documentación y personal"
        ]
      },
      {
        "company": "HelpDesk (Proyecto para Mojito360)",
        "location": "Remoto",
        "position": "Desarrollador Full Stack",
        "website": "https://help-desk-mojito360.vercel.app/",
        "startDate": "Enero 2026",
        "endDate": "Enero 2026",
        "sumary": "Aplicación independiente de gestión de tickets con integración a Mojito360.",
        "highlights": [
          "Arquitectura completa con Supabase (BD, autenticación)",
          "Sistema de chats, notificaciones y configuraciones de SLA",
          "Despliegue y CI/CD con Vercel"
        ]
      },
      {
        "company": "SourTrack",
        "location": "Remoto",
        "position": "Desarrollador Frontend",
        "website": "https://app.sourtrack.com/",
        "startDate": "Febrero 2025",
        "endDate": "Noviembre 2025",
        "sumary": "Aplicación web Angular para gestión de proyectos y flujos analíticos.",
        "highlights": [
          "Gestión de proyectos: Servicios → Órdenes → Operaciones",
          "Generación de Estados de Pago y Órdenes de Compra",
          "Soporte y mantenimiento continuo"
        ]
      },
      {
        "company": "LogicPlaces",
        "location": "Valencia (En remoto)",
        "position": "Desarrollador Web",
        "website": "https://app.logicplaces.com",
        "startDate": "Enero 2023",
        "endDate": "Enero 2025",
        "sumary": "Herramienta web de inmobiliaria con desarrollo full-stack.",
        "highlights": [
          "Desarrollo responsivo con Angular, Bootstrap y NgZorro",
          "APIs REST con Node.js, Sequelize y PostgreSQL",
          "Aplicaciones híbridas con Capacitor"
        ]
      }
    ],
    "education": [
      {
        "institution": "Universidad Central 'Marta Abreu' de las Villas",
        "studyType": "Título universitario de Ingeniería en Automatización",
        "startDate": "Septiembre 2018",
        "endDate": "Diciembre 2023",
        "gpa": "4.3"
      }
    ],
    "skills": [
      {
        "name": "Frontend",
        "level": "Expert",
        "keywords": [
          "Angular",
          "RxJS",
          "TypeScript",
          "HTML/CSS/SASS",
          "Jest",
          "NgZorro",
          "Bootstrap",
          "Tabulator"
        ]
      },
      {
        "name": "Backend",
        "level": "Advanced",
        "keywords": [
          "Node.js",
          "Supabase",
          "PostgreSQL",
          "Sequelize",
          "API Rest",
          "OAuth/OIDC",
          "Webhooks"
        ]
      },
      {
        "name": "Herramientas",
        "level": "Advanced",
        "keywords": [
          "Git",
          "Docker",
          "Vercel",
          "Figma",
          "Capacitor",
          "Postman"
        ]
      }
    ],
    "languages": [
      {
        "language": "Español",
        "fluency": "Nativo"
      },
      {
        "language": "Inglés",
        "fluency": "B2"
      }
    ]
  });

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

  // Variable auxiliar para mostrar la información como texto JSON
  readonly cvDataString = signal(JSON.stringify(this.cvData(), null, 2));

  readonly spanishText = {
    spanish: 'Español',
    english: 'Inglés',
    awsFormat: 'Formato AWS',
    visualFormat: 'Formato Visual',
    download: 'Descargar',
    downloadBtnTooltip: 'Descarga el diseño que se previsualiza como PDF',
    summary: 'Resumen',
    education: 'Educación',
    experience: 'Experiencia',
    skills: 'Habilidades',
    language: 'Idiomas',
    contacts: 'Contactos',
    upload: 'Subir img',
  };
  readonly englishText = {
    spanish: 'Spanish',
    english: 'English',
    awsFormat: 'AWS format',
    visualFormat: 'Visual format',
    download: 'Download',
    downloadBtnTooltip: 'Download the design being previewed as a PDF.',
    summary: 'Summary',
    education: 'Education',
    experience: 'Experience',
    skills: 'Skills',
    language: 'Languages',
    contacts: 'Contacts',
    upload: 'Upload img',
  };

  readonly selectedLanguage = signal<Language>('spanish');
  readonly texts = computed(() => (this.selectedLanguage() === 'english' ? this.englishText : this.spanishText));

  // Variable para mostrar el formato sencillo o el visual
  readonly isAwsShow = signal(false);

  readonly profilePicture = signal('assets/img/profile-640.jpg');


  toggleView(value: boolean): void {
    this.isAwsShow.set(value);
  }

  changeLanguage(language: Language): void {
    this.selectedLanguage.set(language);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.setProfilePicture(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.setProfilePicture(file);
    }
  }

  private setProfilePicture(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicture.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  onCvDataChange(newValue: string): void {
    this.cvDataString.set(newValue);
    try {
      this.cvData.set(JSON.parse(newValue) as ICvJson);
    } catch (error) {
      console.error('Error al analizar el JSON:', error);
    }
  }

  async downloadPDF(): Promise<void> {
    const element = document.getElementById(this.isAwsShow() ? 'aws-cv' : 'visual-cv');
    if (!element) return;

    const options = {
      margin: 0,
      filename: 'CV_David_Diaz.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        ignoreElements: (element: HTMLElement) => element.tagName === 'CANVAS',
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    const { default: html2pdf } = await import('html2pdf.js');
    html2pdf().set(options as any).from(element as any).save();
  }
}
