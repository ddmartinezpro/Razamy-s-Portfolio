import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
// @ts-ignore
import html2pdf from 'html2pdf.js';


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
    website: string;
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

@Component({
  selector: 'app-cv-generator',
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
  ],
  templateUrl: './cv-generator.component.html',
  styleUrl: './cv-generator.component.css',
  standalone: true,
})
export class CvGeneratorComponent {

  // Variable para rellenar el CV
  cvData: ICvJson = {
    personal: {
      name: 'David Díaz Martínez',
      label: 'Desarrollador Web',
      email: 'lnkddmartinez@gmail.com',
      phone: '+53 59283769',
      summary:
        'Desarrollador Web con experiencia en LogicPlaces, especializado en la creación de sitios web responsivos utilizando Angular. Destacado en la optimización de procesos mediante RxJS y en el diseño de interfaces de usuario, demostrando sólidas habilidades de resolución de problemas y diseño. Experiencia comprobada en desarrollo full-stack, depuración de aplicaciones y experiencia de usuario.',
    },
    location: {
      postalCode: '50100',
      city: 'Villa Clara',
      country: 'Cuba',
    },
    profiles: [
      {
        network: 'LinkedIn',
        username: 'lnkddmartinez',
        url: 'https://linkedin.com/in/david-díaz-martínez-3b0b71321',
      },
    ],
    work: [
      {
        company: 'LogicPlaces',
        location: 'Valencia (En remoto)',
        position: 'Desarrollador Web',
        website: 'https://app.logicplaces.com',
        startDate: 'Enero 2023',
        endDate: 'Enero 2025',
        sumary: 'Desarrollo full-stack y edición de diseño en una herramienta web de inmobiliaria.',
        highlights: [
          'Desarrollo y mantenimiento de páginas web funcionales y responsivas utilizando Angular, Bootstrap y NgZorro.',
          'Optimización de procesos mediante RxJS, guards, interceptors y servicios, además de pruebas unitarias e integradas con Jest.',
          'Diseño e implementación de APIs REST y gestión de modelos de bases de datos relacionales utilizando Sequelize, Postman y PostgreSQL.',
          'Edición y personalización de diseños empleando Figma.',
          'Gestión de control de versiones con Git para colaboración en equipo y seguimiento de cambios.',
        ],
      },
    ],
    education: [
      {
        institution: "Universidad Central 'Marta Abreu' de las Villas",
        studyType: 'Título universitario de Ingeniería en Automatización',
        startDate: 'Septiembre 2018',
        endDate: 'Diciembre 2023',
        gpa: '4.3',
      },
    ],
    skills: [
      {
        name: 'Frontend',
        level: 'Expert',
        keywords: ['Angular', 'RxJS', 'HTML', 'CSS', 'SASS', 'JavaScript', 'TypeScript', 'Jest', 'NgZorro', 'Bootstrap', 'NgPrime'],
      },
      {
        name: 'Backend',
        level: 'Advanced',
        keywords: ['Node.js', 'Sequelize', 'API Rest', 'Puppeteer', 'PostgresSQL', 'OAuth'],
      },
      {
        name: 'Diseño web',
        level: 'Advanced',
        keywords: ['Figma', 'Inkscape'],
      },
      {
        name: 'Control de versiones y otros',
        level: 'Advanced',
        keywords: ['Git', 'GitHub', 'Docker', 'Postman'],
      },
    ],
    languages: [
      {language: 'Español', fluency: 'Nativo'},
      {language: 'Inglés', fluency: 'B2'},
    ],
  };

  // Variable auxiliar para mostrar la información como texto JSON
  cvDataString = JSON.stringify(this.cvData, null, 2); // Formateado para mayor legibilidad

  spanishText = {
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
  englishText = {
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

  // variable de los textos en pantalla
  texts = this.spanishText;
  selectedLanguage = 'spanish';

  // Variable para mostrar el formato sencillo o el visual
  isAwsShow = false;

  profilePicture = 'assets/img/profile_picture.jpg';

  toggleView(value: boolean): void {
    this.isAwsShow = value;
  }

  // Cambia el idioma según la selección
  changeLanguage() {
    if (this.selectedLanguage === 'spanish') {
      this.texts = this.spanishText;
    } else if (this.selectedLanguage === 'english') {
      this.texts = this.englishText;
    }
  }

  // Manejar el arrastre de archivos sobre el área
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Evita que el navegador abra el archivo
  }

  // Manejar la acción de soltar un archivo
  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.setProfilePicture(file);
    }
  }

  // Manejar la selección de archivo desde el navegador
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.setProfilePicture(file);
    }
  }

  // Actualizar la imagen de perfil
  private setProfilePicture(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.profilePicture = reader.result as string; // Convertir el archivo a un blob URL
    };
    reader.readAsDataURL(file); // Leer el archivo como una URL de datos
  }

  // Método para actualizar cvData cuando cambia el contenido del input
  onCvDataChange(newValue: string): void {
    try {
      this.cvData = JSON.parse(newValue); // Convierte el texto JSON a un objeto
    } catch (error) {
      console.error('Error al analizar el JSON:', error);
    }
  }

  downloadPDF(): void {
    // Seleccionar el elemento que deseas convertir
    const element = document.getElementById(this.isAwsShow ? 'aws-cv' : 'visual-cv');

    // Configurar las opciones para html2pdf.js
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

    // Generar y descargar el PDF
    html2pdf().set(options).from(element).save();
  }
}
