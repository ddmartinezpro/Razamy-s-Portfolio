import { CvData } from './data/cv.model';

export type CvParseErrorCode = 'invalidJson' | 'notAnObject' | 'missingField' | 'wrongType';

export interface CvParseError {
  code: CvParseErrorCode;
  /** Dotted path of the offending field, e.g. `work[1].company`. */
  path?: string;
  /** Expected type for `wrongType`, or the parser message for `invalidJson`. */
  detail?: string;
}

export type CvParseResult = { ok: true; data: CvData } | { ok: false; error: CvParseError };

type Json = Record<string, unknown>;

/** Thrown internally to stop at the first problem; converted into a CvParseError by normalizeCv. */
class CvShapeError extends Error {
  constructor(readonly error: CvParseError) {
    super(error.code);
  }
}

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

function text(source: Json, key: string, path: string, required: boolean): string {
  const value = source[key];
  if (value === undefined || value === null) {
    if (required) throw new CvShapeError({ code: 'missingField', path: `${path}${key}` });
    return '';
  }
  if (typeof value === 'number') return String(value);
  if (typeof value !== 'string') throw new CvShapeError({ code: 'wrongType', path: `${path}${key}`, detail: 'text' });
  return value;
}

function list<T>(source: Json, key: string, path: string, map: (item: Json, itemPath: string) => T): T[] {
  const value = source[key];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new CvShapeError({ code: 'wrongType', path: `${path}${key}`, detail: 'list' });
  return value.map((item, index) => {
    const itemPath = `${path}${key}[${index}].`;
    if (!isObject(item)) throw new CvShapeError({ code: 'wrongType', path: itemPath.slice(0, -1), detail: 'object' });
    return map(item, itemPath);
  });
}

function texts(source: Json, key: string, path: string): string[] {
  const value = source[key];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new CvShapeError({ code: 'wrongType', path: `${path}${key}`, detail: 'textList' });
  }
  return value as string[];
}

function object(source: Json, key: string, path: string, required: boolean): Json {
  const value = source[key];
  if (value === undefined || value === null) {
    if (required) throw new CvShapeError({ code: 'missingField', path: `${path}${key}` });
    return {};
  }
  if (!isObject(value)) throw new CvShapeError({ code: 'wrongType', path: `${path}${key}`, detail: 'object' });
  return value;
}

/**
 * Validates an already-parsed value and fills every optional part, so templates never hit `undefined`.
 * Accepts the legacy `work[].sumary` key (typo in early versions of the format) as `summary`.
 */
export function normalizeCv(value: unknown): CvParseResult {
  try {
    if (!isObject(value)) throw new CvShapeError({ code: 'notAnObject' });

    const personal = object(value, 'personal', '', true);
    const location = object(value, 'location', '', false);

    const data: CvData = {
      personal: {
        name: text(personal, 'name', 'personal.', true),
        label: text(personal, 'label', 'personal.', true),
        email: text(personal, 'email', 'personal.', false),
        phone: text(personal, 'phone', 'personal.', false),
        website: text(personal, 'website', 'personal.', false),
        summary: text(personal, 'summary', 'personal.', false),
      },
      location: {
        city: text(location, 'city', 'location.', false),
        country: text(location, 'country', 'location.', false),
        postalCode: text(location, 'postalCode', 'location.', false),
      },
      profiles: list(value, 'profiles', '', (item, path) => ({
        network: text(item, 'network', path, false),
        username: text(item, 'username', path, false),
        url: text(item, 'url', path, false),
      })),
      work: list(value, 'work', '', (item, path) => ({
        company: text(item, 'company', path, true),
        position: text(item, 'position', path, false),
        location: text(item, 'location', path, false),
        website: text(item, 'website', path, false),
        startDate: text(item, 'startDate', path, false),
        endDate: text(item, 'endDate', path, false),
        summary: item['summary'] !== undefined ? text(item, 'summary', path, false) : text(item, 'sumary', path, false),
        highlights: texts(item, 'highlights', path),
      })),
      education: list(value, 'education', '', (item, path) => ({
        institution: text(item, 'institution', path, true),
        studyType: text(item, 'studyType', path, false),
        startDate: text(item, 'startDate', path, false),
        endDate: text(item, 'endDate', path, false),
        gpa: text(item, 'gpa', path, false),
      })),
      skills: list(value, 'skills', '', (item, path) => ({
        name: text(item, 'name', path, true),
        level: text(item, 'level', path, false),
        keywords: texts(item, 'keywords', path),
      })),
      languages: list(value, 'languages', '', (item, path) => ({
        language: text(item, 'language', path, true),
        fluency: text(item, 'fluency', path, false),
      })),
    };
    return { ok: true, data };
  } catch (error) {
    if (error instanceof CvShapeError) return { ok: false, error: error.error };
    throw error;
  }
}

/** Parses the editor text: JSON syntax first, then the CV shape. */
export function parseCv(source: string): CvParseResult {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    return { ok: false, error: { code: 'invalidJson', detail: error instanceof Error ? error.message : String(error) } };
  }
  return normalizeCv(value);
}
