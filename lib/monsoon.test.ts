import { describe, expect, it } from 'vitest';
import { buildWeatherContext, deterministicPreparednessPlan, deterministicTravelAdvisory } from './monsoon';
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

  it('builds deterministic preparedness plans', () => {
    const plan = deterministicPreparednessPlan(input, buildWeatherContext('Bengaluru'));
    expect(plan.beforeMonsoon.length).toBeGreaterThanOrEqual(3);
    expect(plan.doNotDo.length).toBeGreaterThanOrEqual(3);
    expect(plan.language).toBe('English');
  });

  it('builds deterministic travel advisories', () => {
    const advisory = deterministicTravelAdvisory('Mumbai', 'coastal road', 'Car');
    expect(advisory.riskRating).toBe('high');
    expect(advisory.carryItems.length).toBeGreaterThan(2);
  });
});
