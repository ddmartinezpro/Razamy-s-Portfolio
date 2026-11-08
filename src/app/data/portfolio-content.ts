export type PortfolioLanguage = 'es' | 'en';

export interface PortfolioProject {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  images: string[];
  tags: string[];
  externalLink?: string;
  internalLink?: string;
  /** Demo not public yet: the card shows the "coming soon" badge instead of the demo link. */
  comingSoon?: boolean;
}

export interface PortfolioExperience {
  company: string;
  role: string;
  period: string;
  link?: string;
  highlights: string[];
}

export type StackAccentIcon = 'sparkles' | 'gear' | 'rocket';

export interface StackItem {
  name: string;
  description: string;
}

export interface PortfolioContent {
  /** Document <title> and meta description for this language. */
  meta: {
    title: string;
    description: string;
  };
  nav: {
    home: string;
    stack: string;
    experience: string;
    projects: string;
    services: string;
    contact: string;
    cv: string;
    cvFile: string;
    cvDownloadLabel: string;
    menuOpen: string;
    menuClose: string;
    language: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    mainNavLabel: string;
    homeLabel: string;
    backToPortfolio: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    cvCta: string;
  };
  stats: { value: string; label: string }[];
  sections: {
    stackEyebrow: string;
    stackTitle: string;
    experienceEyebrow: string;
    experienceTitle: string;
    experienceCvCta: string;
    statsLabel: string;
    projectsEyebrow: string;
    projectsTitle: string;
    projectCta: string;
    galleryCta: string;
    demoCta: string;
    closeModal: string;
    comingSoon: string;
    servicesEyebrow: string;
    servicesTitle: string;
    contactEyebrow: string;
    contactTitle: string;
    contactText: string;
  };
  stack: { title: string; icon: string; accentIcon: StackAccentIcon; items: StackItem[] }[];
  experience: PortfolioExperience[];
  projects: PortfolioProject[];
  services: { title: string; description: string }[];
  contactActions: {
    email: string;
    copyEmail: string;
    emailCopied: string;
    copyFailed: string;
    phone: string;
    linkedin: string;
    github: string;
  };
}

export const portfolioContact = {
  name: 'David Díaz Martínez',
  email: 'lnkddmartinez@gmail.com',
  phone: '+53 59283769',
  location: 'Villa Clara, Cuba',
  linkedinUrl: 'https://www.linkedin.com/in/david-d%C3%ADaz-mart%C3%ADnez-3b0b71321/',
  githubUrl: 'https://github.com/ddmartinezpro',
};

/** Whole years since the first professional role (January 2023), so the stat never goes stale. */
const yearsOfExperience = Math.floor((Date.now() - new Date(2023, 0, 1).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

export const portfolioContent: Record<PortfolioLanguage, PortfolioContent> = {
  es: {
    meta: {
      title: 'David Díaz Martínez | Desarrollador Full Stack',
      description:
        'Portfolio de David Díaz Martínez, desarrollador web Full Stack especializado en Angular y TypeScript.',
    },
    nav: {
      home: 'Inicio',
      stack: 'Stack',
      experience: 'Experiencia',
      projects: 'Proyectos',
      services: 'Servicios',
      contact: 'Contacto',
      cv: 'CV',
      cvFile: 'assets/cv/David-Diaz-Martinez-CV-ES.pdf',
      cvDownloadLabel: 'Descargar CV en PDF',
      menuOpen: 'Abrir menú',
      menuClose: 'Cerrar menú',
      language: 'Idioma',
      theme: 'Tema',
      themeLight: 'Claro',
      themeDark: 'Oscuro',
      mainNavLabel: 'Navegación principal',
      homeLabel: 'Ir al inicio del portfolio',
      backToPortfolio: 'Volver al portfolio',
    },
    hero: {
      eyebrow: 'Full Stack Developer · Angular · TypeScript',
      title: 'Desarrollo aplicaciones web de calidad.',
      subtitle:
        'Desarrollador web con experiencia en sistemas de gestión, supply chain, tickets y herramientas internas.',
      primaryCta: 'Ver proyectos',
      secondaryCta: 'Contactar',
      cvCta: 'Descargar CV',
    },
    stats: [
      { value: `${yearsOfExperience}+`, label: 'años de experiencia' },
      { value: 'Angular', label: 'frontend principal' },
      { value: 'Full Stack', label: 'APIs, datos y UI' },
      { value: 'Remoto', label: 'empleo y freelance' },
    ],
    sections: {
      stackEyebrow: 'Herramientas',
      stackTitle: 'Stack enfocado en productos escalables',
      experienceEyebrow: 'Trayectoria',
      experienceTitle: 'Experiencia reciente',
      experienceCvCta: 'Descargar CV completo',
      statsLabel: 'Datos destacados',
      projectsEyebrow: 'Trabajo visual',
      projectsTitle: 'Proyectos y demos destacados',
      projectCta: 'Abrir proyecto',
      galleryCta: 'Ver imágenes',
      demoCta: 'Ver demo',
      closeModal: 'Cerrar',
      comingSoon: 'Próximamente',
      servicesEyebrow: 'Colaboración',
      servicesTitle: 'Cómo puedo aportar',
      contactEyebrow: 'Contacto',
      contactTitle: 'Hablemos de una vacante o proyecto.',
      contactText: 'Disponible para oportunidades remotas, colaboraciones freelance y productos web con Angular.',
    },
    stack: [
      {
        title: 'Frontend',
        icon: 'assets/icons/angular.svg',
        accentIcon: 'sparkles',
        items: [
          { name: 'Angular', description: 'Framework de Google para construir aplicaciones web completas y ordenadas.' },
          { name: 'TypeScript', description: 'JavaScript con tipos: ayuda a detectar errores antes de ejecutar el código.' },
          { name: 'RxJS', description: 'Librería para manejar datos que llegan con el tiempo, como eventos o respuestas de un servidor.' },
          { name: 'HTML/CSS/SASS', description: 'La estructura (HTML) y el diseño visual (CSS/SASS) de cualquier página web.' },
          { name: 'NgZorro', description: 'Colección de componentes visuales listos para usar en Angular: tablas, formularios, menús…' },
          { name: 'Bootstrap', description: 'Kit de estilos y componentes para crear interfaces adaptables a cualquier pantalla.' },
          { name: 'Jest', description: 'Herramienta para escribir pruebas automáticas que verifican que el código funciona.' },
        ],
      },
      {
        title: 'Backend',
        icon: 'assets/icons/brand-nodejs.svg',
        accentIcon: 'gear',
        items: [
          { name: 'Node.js', description: 'Permite ejecutar JavaScript en el servidor para crear APIs y servicios.' },
          { name: 'C# / .NET', description: 'Lenguaje y plataforma de Microsoft para crear APIs robustas con ASP.NET Core.' },
          { name: 'EF Core', description: 'ORM de .NET: trabaja con la base de datos usando clases de C# y migraciones.' },
          { name: 'Supabase', description: 'Plataforma que ofrece base de datos, usuarios y almacenamiento listos para usar.' },
          { name: 'PostgreSQL', description: 'Base de datos robusta donde se guarda la información de una aplicación.' },
          { name: 'Sequelize', description: 'Traduce objetos de JavaScript a tablas de base de datos sin escribir SQL a mano.' },
          { name: 'REST APIs', description: 'La forma estándar en que el frontend y el servidor se comunican e intercambian datos.' },
          { name: 'OAuth/OIDC', description: 'Estándares para iniciar sesión de forma segura, como “Entrar con Google”.' },
        ],
      },
      {
        title: 'Producto',
        icon: 'assets/icons/brand-figma.svg',
        accentIcon: 'rocket',
        items: [
          { name: 'Figma', description: 'Herramienta de diseño para crear y prototipar interfaces antes de programarlas.' },
          { name: 'Vercel', description: 'Servicio para publicar aplicaciones web en internet de forma rápida.' },
          { name: 'Docker', description: 'Empaqueta una aplicación con todo lo que necesita para que funcione igual en cualquier equipo.' },
          { name: 'Capacitor', description: 'Convierte una aplicación web en una app móvil para Android e iOS.' },
          { name: 'Postman', description: 'Herramienta para probar y documentar APIs enviando peticiones de prueba.' },
          { name: 'Git', description: 'Sistema de control de versiones: guarda el historial de cambios del código.' },
        ],
      },
    ],
    experience: [
      {
        company: 'Mojito360',
        role: 'Desarrollador Frontend',
        period: 'Nov 2025 - Actualidad',
        link: 'https://www.mojito360.com/en/',
        highlights: ['Vistas y flujos para clientes', 'Envíos, documentación y gestión de personal'],
      },
      {
        company: 'HelpDesk',
        role: 'Desarrollador Full Stack',
        period: 'Ene 2026',
        link: 'https://help-desk-mojito360.vercel.app/',
        highlights: ['Supabase, autenticación y base de datos', 'Chats, notificaciones y SLA'],
      },
      {
        company: 'SourTrack',
        role: 'Desarrollador Frontend',
        period: 'Feb 2025 - Nov 2025',
        link: 'https://app.sourtrack.com/',
        highlights: ['Gestión de proyectos y operaciones', 'Estados de pago y órdenes de compra'],
      },
      {
        company: 'LogicPlaces',
        role: 'Desarrollador Web',
        period: 'Ene 2023 - Ene 2025',
        link: 'https://app.logicplaces.com',
        highlights: ['Angular, Bootstrap y NgZorro', 'APIs REST con Node.js y PostgreSQL'],
      },
    ],
    projects: [
      {
        title: 'Mojito360',
        eyebrow: 'Plataforma de supply chain',
        description: 'Flujos de envíos, documentación, mapas y operaciones para equipos logísticos.',
        image: 'assets/img/projects/mojito360-map.png',
        images: [
          'assets/img/projects/mojito360-map.png',
          'assets/img/projects/mojito360-shipments.png',
          'assets/img/projects/mojito360-service-order.png',
        ],
        tags: ['Angular', 'TypeScript', 'Dashboards'],
        externalLink: 'https://www.mojito360.com/en/',
      },
      {
        title: 'HelpDesk',
        eyebrow: 'Sistema de tickets',
        description: 'Gestión de tickets con tableros, estados, chats, notificaciones y reglas SLA.',
        image: 'assets/img/projects/helpdesk-kanban.png',
        images: ['assets/img/projects/helpdesk-kanban.png', 'assets/img/projects/helpdesk-list.png'],
        tags: ['Angular', 'Supabase', 'Vercel'],
        externalLink: 'https://help-desk-mojito360.vercel.app/',
      },
      {
        title: 'SourTrack',
        eyebrow: 'Operaciones de proyectos',
        description: 'Gestión de proyectos, servicios, órdenes, operaciones y estados de pago.',
        image: 'assets/img/projects/sourtrack-projects.png',
        images: ['assets/img/projects/sourtrack-projects.png'],
        tags: ['Angular', 'UX', 'Data tables'],
        externalLink: 'https://app.sourtrack.com/',
      },
      {
        title: 'CV Generator',
        eyebrow: 'Demo interactiva',
        description: 'Editor visual de CV con cambio de idioma, formatos y descarga en PDF.',
        image: 'assets/img/projects/cv-generator-preview.svg',
        images: ['assets/img/projects/cv-generator-preview.svg'],
        tags: ['Angular', 'Signals', 'PDF'],
        internalLink: '/demos/cv-generator',
      },
      {
        title: 'Gestión de Ventas',
        eyebrow: 'Demo administrativa',
        description: 'CRUD administrativo para catálogos, productos, proveedores y ventas.',
        image: 'assets/img/projects/admin-orders.png',
        images: ['assets/img/projects/admin-orders.png'],
        tags: ['Angular', 'REST API', 'Forms'],
        internalLink: '/demos/ventas',
        comingSoon: true,
      },
    ],
    services: [
      { title: 'Apps Angular', description: 'Interfaces mantenibles, componentes claros y flujos responsivos.' },
      { title: 'Herramientas internas', description: 'Dashboards, CRUDs, tablas, permisos y procesos administrativos.' },
      { title: 'Integraciones', description: 'APIs REST, autenticación, bases de datos y despliegues.' },
      { title: 'MVPs freelance', description: 'Versiones iniciales enfocadas en validar rápido sin perder calidad.' },
    ],
    contactActions: {
      email: 'Enviar email',
      copyEmail: 'Copiar email',
      emailCopied: '¡Email copiado!',
      copyFailed: 'No se pudo copiar',
      phone: 'Llamar',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
  },
  en: {
    meta: {
      title: 'David Díaz Martínez | Full Stack Developer',
      description:
        'Portfolio of David Díaz Martínez, a Full Stack web developer specialized in Angular and TypeScript.',
    },
    nav: {
      home: 'Home',
      stack: 'Stack',
      experience: 'Experience',
      projects: 'Projects',
      services: 'Services',
      contact: 'Contact',
      cv: 'CV',
      cvFile: 'assets/cv/David-Diaz-Martinez-CV-EN.pdf',
      cvDownloadLabel: 'Download CV as PDF',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      language: 'Language',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      mainNavLabel: 'Main navigation',
      homeLabel: 'Go to the portfolio home',
      backToPortfolio: 'Back to portfolio',
    },
    hero: {
      eyebrow: 'Full Stack Developer · Angular · TypeScript',
      title: 'I build high-quality web applications.',
      subtitle:
        'Web developer experienced in management systems, supply chain platforms, ticketing apps and internal tools.',
      primaryCta: 'View projects',
      secondaryCta: 'Contact',
      cvCta: 'Download CV',
    },
    stats: [
      { value: `${yearsOfExperience}+`, label: 'years of experience' },
      { value: 'Angular', label: 'main frontend stack' },
      { value: 'Full Stack', label: 'APIs, data and UI' },
      { value: 'Remote', label: 'jobs and freelance' },
    ],
    sections: {
      stackEyebrow: 'Tools',
      stackTitle: 'Stack focused on scalable products',
      experienceEyebrow: 'Background',
      experienceTitle: 'Recent experience',
      experienceCvCta: 'Download full CV',
      statsLabel: 'Highlights',
      projectsEyebrow: 'Visual work',
      projectsTitle: 'Featured projects and demos',
      projectCta: 'Open project',
      galleryCta: 'View images',
      demoCta: 'View demo',
      closeModal: 'Close',
      comingSoon: 'Coming soon',
      servicesEyebrow: 'Collaboration',
      servicesTitle: 'How I can help',
      contactEyebrow: 'Contact',
      contactTitle: "Let's talk about a role or project.",
      contactText: 'Available for remote opportunities, freelance collaboration and Angular-based web products.',
    },
    stack: [
      {
        title: 'Frontend',
        icon: 'assets/icons/angular.svg',
        accentIcon: 'sparkles',
        items: [
          { name: 'Angular', description: 'Google\'s framework for building complete, well-structured web applications.' },
          { name: 'TypeScript', description: 'JavaScript with types: it helps catch errors before the code runs.' },
          { name: 'RxJS', description: 'Library for handling data that arrives over time, like events or server responses.' },
          { name: 'HTML/CSS/SASS', description: 'The structure (HTML) and visual design (CSS/SASS) of any web page.' },
          { name: 'NgZorro', description: 'Ready-to-use visual components for Angular: tables, forms, menus…' },
          { name: 'Bootstrap', description: 'Styles and components kit to build interfaces that adapt to any screen.' },
          { name: 'Jest', description: 'Tool for writing automated tests that check the code works as expected.' },
        ],
      },
      {
        title: 'Backend',
        icon: 'assets/icons/brand-nodejs.svg',
        accentIcon: 'gear',
        items: [
          { name: 'Node.js', description: 'Runs JavaScript on the server to build APIs and services.' },
          { name: 'C# / .NET', description: "Microsoft's language and platform for building robust APIs with ASP.NET Core." },
          { name: 'EF Core', description: '.NET ORM: works with the database through C# classes and migrations.' },
          { name: 'Supabase', description: 'Platform that provides a database, user accounts and storage out of the box.' },
          { name: 'PostgreSQL', description: 'Robust database where an application\'s information is stored.' },
          { name: 'Sequelize', description: 'Maps JavaScript objects to database tables without writing SQL by hand.' },
          { name: 'REST APIs', description: 'The standard way the frontend and the server talk and exchange data.' },
          { name: 'OAuth/OIDC', description: 'Standards for secure sign-in, like “Sign in with Google”.' },
        ],
      },
      {
        title: 'Product',
        icon: 'assets/icons/brand-figma.svg',
        accentIcon: 'rocket',
        items: [
          { name: 'Figma', description: 'Design tool to create and prototype interfaces before coding them.' },
          { name: 'Vercel', description: 'Service to publish web applications on the internet quickly.' },
          { name: 'Docker', description: 'Packages an app with everything it needs so it runs the same on any machine.' },
          { name: 'Capacitor', description: 'Turns a web application into a mobile app for Android and iOS.' },
          { name: 'Postman', description: 'Tool for testing and documenting APIs by sending sample requests.' },
          { name: 'Git', description: 'Version control system: it keeps the history of the code\'s changes.' },
        ],
      },
    ],
    experience: [
      {
        company: 'Mojito360',
        role: 'Frontend Developer',
        period: 'Nov 2025 - Present',
        link: 'https://www.mojito360.com/en/',
        highlights: ['Client-facing views and flows', 'Shipments, documentation and staff management'],
      },
      {
        company: 'HelpDesk',
        role: 'Full Stack Developer',
        period: 'Jan 2026',
        link: 'https://help-desk-mojito360.vercel.app/',
        highlights: ['Supabase, authentication and database', 'Chats, notifications and SLA settings'],
      },
      {
        company: 'SourTrack',
        role: 'Frontend Developer',
        period: 'Feb 2025 - Nov 2025',
        link: 'https://app.sourtrack.com/',
        highlights: ['Project and operation management', 'Payment statements and purchase orders'],
      },
      {
        company: 'LogicPlaces',
        role: 'Web Developer',
        period: 'Jan 2023 - Jan 2025',
        link: 'https://app.logicplaces.com',
        highlights: ['Angular, Bootstrap and NgZorro', 'REST APIs with Node.js and PostgreSQL'],
      },
    ],
    projects: [
      {
        title: 'Mojito360',
        eyebrow: 'Supply chain platform',
        description: 'Shipment, documentation, map and operation flows for logistics teams.',
        image: 'assets/img/projects/mojito360-map.png',
        images: [
          'assets/img/projects/mojito360-map.png',
          'assets/img/projects/mojito360-shipments.png',
          'assets/img/projects/mojito360-service-order.png',
        ],
        tags: ['Angular', 'TypeScript', 'Dashboards'],
        externalLink: 'https://www.mojito360.com/en/',
      },
      {
        title: 'HelpDesk',
        eyebrow: 'Ticketing system',
        description: 'Ticket management with boards, statuses, chats, notifications and SLA rules.',
        image: 'assets/img/projects/helpdesk-kanban.png',
        images: ['assets/img/projects/helpdesk-kanban.png', 'assets/img/projects/helpdesk-list.png'],
        tags: ['Angular', 'Supabase', 'Vercel'],
        externalLink: 'https://help-desk-mojito360.vercel.app/',
      },
      {
        title: 'SourTrack',
        eyebrow: 'Project operations',
        description: 'Project, service, order, operation and payment statement management.',
        image: 'assets/img/projects/sourtrack-projects.png',
        images: ['assets/img/projects/sourtrack-projects.png'],
        tags: ['Angular', 'UX', 'Data tables'],
        externalLink: 'https://app.sourtrack.com/',
      },
      {
        title: 'CV Generator',
        eyebrow: 'Interactive demo',
        description: 'Visual CV editor with language switching, format selection and PDF download.',
        image: 'assets/img/projects/cv-generator-preview.svg',
        images: ['assets/img/projects/cv-generator-preview.svg'],
        tags: ['Angular', 'Signals', 'PDF'],
        internalLink: '/demos/cv-generator',
      },
      {
        title: 'Sales Management',
        eyebrow: 'Admin demo',
        description: 'Admin CRUD for catalogs, products, providers and sales workflows.',
        image: 'assets/img/projects/admin-orders.png',
        images: ['assets/img/projects/admin-orders.png'],
        tags: ['Angular', 'REST API', 'Forms'],
        internalLink: '/demos/ventas',
        comingSoon: true,
      },
    ],
    services: [
      { title: 'Angular apps', description: 'Maintainable interfaces, clear components and responsive flows.' },
      { title: 'Internal tools', description: 'Dashboards, CRUDs, tables, permissions and admin workflows.' },
      { title: 'Integrations', description: 'REST APIs, authentication, databases and deployments.' },
      { title: 'Freelance MVPs', description: 'Initial versions focused on fast validation without losing quality.' },
    ],
    contactActions: {
      email: 'Send email',
      copyEmail: 'Copy email',
      emailCopied: 'Email copied!',
      copyFailed: "Couldn't copy",
      phone: 'Call',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
  },
};
