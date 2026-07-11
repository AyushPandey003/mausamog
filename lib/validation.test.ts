import { describe, expect, it } from 'vitest';
import {
  assistantSchema,
  loginSchema,
  peerAlertReportSchema,
  preparednessPlanSchema,
  preparednessSchema,
  signupSchema,
  travelAdvisorySchema,
  travelSchema,
} from './validation';

describe('validation schemas', () => {
  it('accepts a valid preparedness input payload', () => {
    const parsed = preparednessSchema.parse({
      city: 'Bengaluru',
      pincode: '560034',
      landmark: 'Koramangala',
      language: 'English',
      travelMode: 'Car',
      travelRoute: 'Koramangala to Whitefield',
      household: {
        adults: 2,
        children: 1,
        elderly: 0,
        pets: 1,
        housingType: 'Apartment',
        floodProne: false,
        needs: ['medication', 'power backup'],
      },
    });

    expect(parsed.city).toBe('Bengaluru');
    expect(parsed.household.needs).toHaveLength(2);
  });

  it('coerces preparedness household numbers from form-like strings', () => {
    const parsed = preparednessSchema.parse({
      city: 'Bengaluru',
      pincode: '560034',
      landmark: 'Koramangala',
      language: 'English',
      travelMode: 'Car',
      travelRoute: 'Koramangala to Whitefield',
      household: {
        adults: '2',
        children: '1',
        elderly: '0',
        pets: '0',
        housingType: 'Apartment',
        floodProne: true,
        needs: ['medication'],
      },
    });

    expect(parsed.household.adults).toBe(2);
    expect(parsed.household.children).toBe(1);
    expect(parsed.household.floodProne).toBe(true);
  });

  it('rejects invalid preparedness input', () => {
    expect(() =>
      preparednessSchema.parse({
        city: 'B',
        pincode: '12',
        landmark: '',
        language: 'E',
        travelMode: '',
        travelRoute: '',
        household: {
          adults: 0,
          children: -1,
          elderly: -1,
          pets: -1,
          housingType: '',
          floodProne: false,
          needs: [],
        },
      }),
    ).toThrow();
  });

  it('rejects preparedness payloads with too many special needs', () => {
    expect(() =>
      preparednessSchema.parse({
        city: 'Bengaluru',
        pincode: '560034',
        landmark: 'Koramangala',
        language: 'English',
        travelMode: 'Car',
        travelRoute: 'Koramangala to Whitefield',
        household: {
          adults: 2,
          children: 1,
          elderly: 0,
          pets: 0,
          housingType: 'Apartment',
          floodProne: false,
          needs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
        },
      }),
    ).toThrow();
  });

  it('accepts valid travel, assistant, signup, and login payloads', () => {
    expect(travelSchema.parse({ city: 'Mumbai', route: 'Andheri to Bandra', mode: 'Train', language: 'Hindi' }).mode).toBe('Train');
    expect(assistantSchema.parse({ sessionId: 'demo-session', language: 'English', prompt: 'What should I pack?', city: 'Chennai' }).city).toBe('Chennai');
    expect(signupSchema.parse({ fullName: 'Ayush Pandey', email: 'ayush@example.com', city: 'Bengaluru' }).email).toBe('ayush@example.com');
    expect(loginSchema.parse({ email: 'citizen@mausamog.gov' }).email).toBe('citizen@mausamog.gov');
  });

  it('trims login and signup payloads', () => {
    expect(loginSchema.parse({ email: ' citizen@mausamog.gov ' }).email).toBe('citizen@mausamog.gov');
    expect(signupSchema.parse({ fullName: ' Ayush Pandey ', email: ' ayush@example.com ', city: ' Bengaluru ' }).city).toBe('Bengaluru');
  });

  it('validates generated plan and travel advisory structures', () => {
    const plan = preparednessPlanSchema.parse({
      riskSummary: 'Moderate monsoon risk with waterlogging expected in low-lying areas.',
      beforeMonsoon: ['Charge devices', 'Store documents safely', 'Check drainage'],
      duringHeavyRain: ['Avoid flooded roads', 'Stay indoors if possible', 'Track official alerts'],
      afterFlooding: ['Sanitize surfaces', 'Discard contaminated food', 'Inspect electric systems'],
      emergencyKit: ['Torch', 'Water', 'Medicines', 'Power bank'],
      familySpecificAdvice: ['Keep medicines ready', 'Assign one family member to alerts'],
      travelAdvice: ['Delay non-essential travel', 'Carry waterproof covers'],
      localAuthorityMessage: 'Follow official city advisories and emergency services.',
      doNotDo: ['Do not drive through floodwater', 'Do not touch fallen wires', 'Do not trust rumors'],
      language: 'English',
    });

    const travel = travelAdvisorySchema.parse({
      riskRating: 'moderate',
      summary: 'Expect delays and waterlogging on the route.',
      saferTiming: 'Travel after the strongest rainfall window passes.',
      carryItems: ['Power bank', 'Water', 'Waterproof pouch'],
      avoidIf: ['roads are closed', 'visibility is very poor'],
    });

    expect(plan.language).toBe('English');
    expect(travel.riskRating).toBe('moderate');
  });

  it('accepts valid peer alert reports and coerces coordinates', () => {
    const parsed = peerAlertReportSchema.parse({
      city: 'Bengaluru',
      type: 'road_block',
      severity: 'high',
      description: 'Road blocked by a fallen tree near the flyover.',
      latitude: '12.9352',
      longitude: '77.6205',
      accuracyMeters: '15',
    });

    expect(parsed.latitude).toBe(12.9352);
    expect(parsed.longitude).toBe(77.6205);
    expect(parsed.accuracyMeters).toBe(15);
  });

  it('rejects invalid peer alert coordinates and short descriptions', () => {
    expect(() =>
      peerAlertReportSchema.parse({
        city: 'Bengaluru',
        type: 'road_block',
        severity: 'high',
        description: 'short',
        latitude: '120',
        longitude: '77.6205',
      }),
    ).toThrow();
  });
});
