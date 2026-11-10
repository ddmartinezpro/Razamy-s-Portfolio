import { CvLanguage } from './cv.model';
import { CvParseErrorCode } from '../cv-parser';

/** Copy for the CV headings and the editor panel; both follow the CV language selector. */
export interface CvTexts {
  // Language selector
  cvLanguage: string;
  spanish: string;
  english: string;
  // Format selector
  format: string;
  awsFormat: string;
  visualFormat: string;
  // CV headings
  summary: string;
  education: string;
  experience: string;
  skills: string;
  language: string;
  contacts: string;
  // Photo
  upload: string;
  uploadHint: string;
  photoAlt: string;
  // JSON editor
  editorLabel: string;
  editorHint: string;
  importJson: string;
  exportJson: string;
  // PDF
  download: string;
  downloadHint: string;
  generating: string;
  printPdf: string;
  printHint: string;
  // Mobile tabs
  tabEditor: string;
  tabPreview: string;
  // Messages ({path}, {detail} and {file} are replaced)
  errors: Record<CvParseErrorCode, string> & {
    fileType: string;
    fileTooLarge: string;
    readFailed: string;
    photoType: string;
    pdfFailed: string;
  };
  typeNames: Record<'text' | 'list' | 'textList' | 'object', string>;
  imported: string;
  overflow: string;
}

const spanish: CvTexts = {
  cvLanguage: 'Idioma del CV',
  spanish: 'Español',
  english: 'Inglés',
  format: 'Formato',
  awsFormat: 'Formato AWS',
  visualFormat: 'Formato visual',
  summary: 'Resumen',
  education: 'Educación',
  experience: 'Experiencia',
  skills: 'Habilidades',
  language: 'Idiomas',
  contacts: 'Contactos',
  upload: 'Cambiar foto',
  uploadHint: 'o arrastra una imagen aquí',
  photoAlt: 'Foto de perfil',
  editorLabel: 'Datos del CV (JSON)',
  editorHint: 'Edita el texto, pégalo o importa un archivo .json/.txt (también puedes arrastrarlo aquí).',
  importJson: 'Importar JSON',
  exportJson: 'Exportar JSON',
  download: 'Descargar PDF',
  downloadHint: 'PDF como imagen: idéntico a la vista previa.',
  generating: 'Generando…',
  printPdf: 'PDF con texto',
  printHint: 'Abre el diálogo de impresión: elige «Guardar como PDF» y desactiva encabezados y pies de página. El texto se puede seleccionar y lo leen los filtros de CV (ATS).',
  tabEditor: 'Editor',
  tabPreview: 'Vista previa',
  errors: {
    invalidJson: 'El JSON no es válido: {detail}',
    notAnObject: 'El JSON debe ser un objeto con los datos del CV.',
    missingField: 'Falta el campo obligatorio «{path}».',
    wrongType: 'El campo «{path}» debe ser {detail}.',
    fileType: '«{file}» no es un archivo .json o .txt.',
    fileTooLarge: '«{file}» es demasiado grande (máximo 1 MB).',
    readFailed: 'No se pudo leer «{file}».',
    photoType: '«{file}» no es una imagen.',
    pdfFailed: 'No se pudo generar el PDF. Inténtalo de nuevo.',
  },
  typeNames: { text: 'un texto', list: 'una lista', textList: 'una lista de textos', object: 'un objeto' },
  imported: 'Importado «{file}».',
  overflow: 'El contenido no cabe en una página A4: la parte inferior quedará fuera del PDF.',
};

const english: CvTexts = {
  cvLanguage: 'CV language',
  spanish: 'Spanish',
  english: 'English',
  format: 'Format',
  awsFormat: 'AWS format',
  visualFormat: 'Visual format',
  summary: 'Summary',
  education: 'Education',
  experience: 'Experience',
  skills: 'Skills',
  language: 'Languages',
  contacts: 'Contacts',
  upload: 'Change photo',
  uploadHint: 'or drop an image here',
  photoAlt: 'Profile photo',
  editorLabel: 'CV data (JSON)',
  editorHint: 'Edit the text, paste it or import a .json/.txt file (you can also drop it here).',
  importJson: 'Import JSON',
  exportJson: 'Export JSON',
  download: 'Download PDF',
  downloadHint: 'Image PDF: identical to the preview.',
  generating: 'Generating…',
  printPdf: 'Text PDF',
  printHint: 'Opens the print dialog: choose “Save as PDF” and turn off headers and footers. The text is selectable and readable by CV filters (ATS).',
  tabEditor: 'Editor',
  tabPreview: 'Preview',
  errors: {
    invalidJson: 'The JSON is not valid: {detail}',
    notAnObject: 'The JSON must be an object with the CV data.',
    missingField: 'The required field “{path}” is missing.',
    wrongType: 'The field “{path}” must be {detail}.',
    fileType: '“{file}” is not a .json or .txt file.',
    fileTooLarge: '“{file}” is too large (1 MB max).',
    readFailed: 'Could not read “{file}”.',
    photoType: '“{file}” is not an image.',
    pdfFailed: 'The PDF could not be generated. Please try again.',
  },
  typeNames: { text: 'text', list: 'a list', textList: 'a list of texts', object: 'an object' },
  imported: 'Imported “{file}”.',
  overflow: 'The content does not fit on one A4 page: the bottom part will be cut from the PDF.',
};

export const CV_TEXTS: Record<CvLanguage, CvTexts> = { spanish, english };

/** Replaces `{name}` placeholders in a message. */
export function format(message: string, values: Record<string, string | undefined>): string {
  return message.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}
