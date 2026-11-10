import { normalizeCv, parseCv } from './cv-parser';
import cvDavidEs from './data/cv-david.es.json';
import cvDavidEn from './data/cv-david.en.json';

const minimal = { personal: { name: 'Ada Lovelace', label: 'Engineer' } };

describe('parseCv', () => {
  it('accepts both bundled CVs', () => {
    expect(normalizeCv(cvDavidEs).ok).toBeTrue();
    expect(normalizeCv(cvDavidEn).ok).toBeTrue();
  });

  it('reports invalid JSON syntax', () => {
    const result = parseCv('{ "personal": ');
    expect(result.ok).toBeFalse();
    if (!result.ok) expect(result.error.code).toBe('invalidJson');
  });

  it('rejects values that are not an object', () => {
    const result = parseCv('[1, 2, 3]');
    expect(result.ok).toBeFalse();
    if (!result.ok) expect(result.error.code).toBe('notAnObject');
  });

  it('names the missing required field', () => {
    const result = parseCv(JSON.stringify({ personal: { label: 'Engineer' } }));
    expect(result.ok).toBeFalse();
    if (!result.ok) expect(result.error).toEqual({ code: 'missingField', path: 'personal.name' });
  });

  it('names fields with the wrong type, including list items', () => {
    const result = parseCv(JSON.stringify({ ...minimal, work: [{ company: 'A' }, { company: 42, highlights: 'x' }] }));
    expect(result.ok).toBeFalse();
    if (!result.ok) expect(result.error).toEqual({ code: 'wrongType', path: 'work[1].highlights', detail: 'textList' });
  });

  it('fills optional parts so the templates never read undefined', () => {
    const result = parseCv(JSON.stringify(minimal));
    expect(result.ok).toBeTrue();
    if (result.ok) {
      expect(result.data.profiles).toEqual([]);
      expect(result.data.work).toEqual([]);
      expect(result.data.location).toEqual({ city: '', country: '', postalCode: '' });
      expect(result.data.personal.website).toBe('');
    }
  });

  it('reads the legacy "sumary" key of work items as summary', () => {
    const result = parseCv(JSON.stringify({ ...minimal, work: [{ company: 'A', sumary: 'Old key' }] }));
    expect(result.ok).toBeTrue();
    if (result.ok) expect(result.data.work[0].summary).toBe('Old key');
  });
});
