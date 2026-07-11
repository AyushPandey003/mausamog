import { describe, expect, it } from 'vitest';
import { assistantSchema, loginSchema, preparednessPlanSchema, preparednessSchema, signupSchema, travelAdvisorySchema, travelSchema } from './validation';

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

  it('accepts valid travel, assistant, signup, and login payloads', () => {
    expect(travelSchema.parse({ city: 'Mumbai', route: 'Andheri to Bandra', mode: 'Train', language: 'Hindi' }).mode).toBe('Train');
    expect(assistantSchema.parse({ sessionId: 'demo-session', language: 'English', prompt: 'What should I pack?', city: 'Chennai' }).city).toBe('Chennai');
    expect(signupSchema.parse({ fullName: 'Ayush Pandey', email: 'ayush@example.com', city: 'Bengaluru' }).email).toBe('ayush@example.com');
    expect(loginSchema.parse({ email: 'citizen@mausamog.gov' }).email).toBe('citizen@mausamog.gov');
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
});
