/** Language of the generated CV (headings and the editor labels follow it). */
export type CvLanguage = 'spanish' | 'english';

/** Which design the preview shows and the PDF export captures. */
export type CvFormat = 'visual' | 'aws';

/** CV data after validation: optional parts are always present (as empty strings/arrays). */
export interface CvData {
  personal: {
    name: string;
    label: string;
    email: string;
    phone: string;
    website: string;
    summary: string;
  };
  location: {
    city: string;
    country: string;
    postalCode: string;
  };
  profiles: {
    network: string;
    username: string;
    url: string;
  }[];
  work: {
    company: string;
    position: string;
    location: string;
    website: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    studyType: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }[];
  skills: {
    name: string;
    level: string;
    keywords: string[];
  }[];
  languages: {
    language: string;
    fluency: string;
  }[];
}
