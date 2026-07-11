import { describe, expect, it } from 'vitest';
import { buildWeatherContext, deterministicPreparednessPlan, deterministicTravelAdvisory, parseJsonCandidate } from './monsoon';
import type { PreparednessInput } from './schema';

const input: PreparednessInput = {
  city: 'Bengaluru',
  pincode: '560034',
  landmark: 'Koramangala',
  language: 'English',
  travelMode: 'Car',
  travelRoute: 'Koramangala to Whitefield',
  household: {
    adults: 2,
    children: 1,
    elderly: 1,
    pets: 0,
    housingType: 'Apartment',
    floodProne: false,
    needs: ['medication'],
  },
};

describe('monsoon helpers', () => {
  it('builds weather context by city', () => {
    expect(buildWeatherContext('Mumbai').floodRisk).toBe('high');
    expect(buildWeatherContext('Bengaluru').floodRisk).toBe('moderate');
  });

  it('builds a Chennai-specific weather context and keeps original city casing', () => {
    const context = buildWeatherContext('Chennai');

    expect(context.city).toBe('Chennai');
    expect(context.rainfallLevel).toBe('heavy');
    expect(context.alertHeadline).toContain('Localized flooding');
  });

  it('falls back to the default weather context for other cities', () => {
    const context = buildWeatherContext('Pune');

    expect(context.floodRisk).toBe('moderate');
    expect(context.alertHeadline).toContain('Waterlogging');
  });

  it('builds deterministic preparedness plans', () => {
    const plan = deterministicPreparednessPlan(input, buildWeatherContext('Bengaluru'));
    expect(plan.beforeMonsoon.length).toBeGreaterThanOrEqual(3);
    expect(plan.doNotDo.length).toBeGreaterThanOrEqual(3);
    expect(plan.language).toBe('English');
  });

  it('adds high-risk relocation guidance for flood-prone households', () => {
    const floodProneInput: PreparednessInput = {
      ...input,
      household: {
        ...input.household,
        floodProne: true,
      },
    };

    const plan = deterministicPreparednessPlan(floodProneInput, buildWeatherContext('Bengaluru'));

    expect(plan.emergencyKit).toContain('Plastic sheets and absorbent cloths');
    expect(plan.familySpecificAdvice.join(' ')).toContain('temporary relocation');
    expect(plan.travelAdvice.join(' ')).toContain('Cancel low-priority travel');
  });

  it('builds deterministic travel advisories', () => {
    const advisory = deterministicTravelAdvisory('Mumbai', 'coastal road', 'Car');
    expect(advisory.riskRating).toBe('high');
    expect(advisory.carryItems.length).toBeGreaterThan(2);
  });

  it('keeps non-coastal routes at moderate travel risk', () => {
    const advisory = deterministicTravelAdvisory('Bengaluru', 'Koramangala to Whitefield', 'Metro');

    expect(advisory.riskRating).toBe('moderate');
    expect(advisory.summary).toContain('metro');
  });

  it('parses plain and fenced JSON candidates', () => {
    expect(parseJsonCandidate('{"ok":true}')).toEqual({ ok: true });
    expect(parseJsonCandidate('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it('throws when the JSON candidate is invalid', () => {
    expect(() => parseJsonCandidate('not-json')).toThrow();
  });
});
