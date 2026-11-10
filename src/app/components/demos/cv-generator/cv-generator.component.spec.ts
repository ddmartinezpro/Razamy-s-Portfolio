import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CvGeneratorComponent } from './cv-generator.component';

describe('CvGeneratorComponent', () => {
  let component: CvGeneratorComponent;
  let fixture: ComponentFixture<CvGeneratorComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CvGeneratorComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CvGeneratorComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders the Spanish sample CV by default', () => {
    expect(element.querySelector('#visual-cv h3')?.textContent).toContain('David Díaz Martínez');
    expect(element.querySelector('#visual-cv')?.textContent).toContain('Experiencia');
  });

  it('switches to the English sample while the data is untouched', () => {
    component.setLanguage('english');
    fixture.detectChanges();

    expect(component.cvData().personal.label).toBe('Full Stack Web Developer');
    expect(element.querySelector('#visual-cv')?.textContent).toContain('Experience');
  });

  it('keeps edited data when the language changes', () => {
    const edited = JSON.parse(component.editorText());
    edited.personal.label = 'Edited label';
    component.onEditorChange(JSON.stringify(edited));
    component.setLanguage('english');
    fixture.detectChanges();

    expect(component.cvData().personal.label).toBe('Edited label');
  });

  it('shows the parse error and keeps the last valid preview', () => {
    component.onEditorChange('{ not json');
    fixture.detectChanges();

    expect(element.querySelector('#cv-json-status .field-error')?.textContent).toContain('JSON');
    expect(element.querySelector('#cv-json')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#visual-cv h3')?.textContent).toContain('David Díaz Martínez');
  });

  it('imports a .json file and rejects other file types', async () => {
    const data = JSON.stringify({ personal: { name: 'Ada Lovelace', label: 'Engineer' } });
    await component.importFile(new File([data], 'ada.json', { type: 'application/json' }));
    fixture.detectChanges();
    expect(element.querySelector('#visual-cv h3')?.textContent).toContain('Ada Lovelace');

    await component.importFile(new File(['x'], 'photo.png', { type: 'image/png' }));
    fixture.detectChanges();
    expect(element.querySelector('#cv-json-status')?.textContent).toContain('photo.png');
  });

  it('switches between the visual and AWS designs', () => {
    component.setFormat('aws');
    fixture.detectChanges();

    expect(element.querySelector('#aws-cv')).toBeTruthy();
    expect(element.querySelector('#visual-cv')).toBeNull();
  });
});
