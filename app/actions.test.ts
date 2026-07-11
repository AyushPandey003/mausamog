import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
  cookiesMock: vi.fn(),
  headersMock: vi.fn(),
  generatePreparednessPlanMock: vi.fn(),
  generateTravelAdviceMock: vi.fn(),
  generateAssistantAnswerMock: vi.fn(),
  sendMagicLinkEmailMock: vi.fn(),
  buildWeatherContextMock: vi.fn(),
  getRedisMock: vi.fn(),
  createMagicLinkMock: vi.fn(),
  deleteSessionByTokenHashMock: vi.fn(),
  findOrCreateUserMock: vi.fn(),
  getUserByEmailMock: vi.fn(),
  getAlertsMock: vi.fn(),
  getAssistantMessagesMock: vi.fn(),
  getChecklistMock: vi.fn(),
  getLatestPlanMock: vi.fn(),
  getLatestTravelAdvisoryMock: vi.fn(),
  getPeerAlertReportsMock: vi.fn(),
  getResourcesMock: vi.fn(),
  saveAssistantMessageMock: vi.fn(),
  savePeerAlertReportMock: vi.fn(),
  savePreparednessPlanMock: vi.fn(),
  saveTravelAdvisoryMock: vi.fn(),
  toggleChecklistItemMock: vi.fn(),
  buildMagicLinkMock: vi.fn(),
  createOpaqueTokenMock: vi.fn(),
  hashTokenMock: vi.fn(),
  getSessionUserMock: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePathMock }));
vi.mock('next/navigation', () => ({ redirect: mocks.redirectMock }));
vi.mock('next/headers', () => ({ cookies: mocks.cookiesMock, headers: mocks.headersMock }));
vi.mock('@/lib/ai', () => ({
  generatePreparednessPlan: mocks.generatePreparednessPlanMock,
  generateTravelAdvice: mocks.generateTravelAdviceMock,
  generateAssistantAnswer: mocks.generateAssistantAnswerMock,
}));
vi.mock('@/lib/email', () => ({ sendMagicLinkEmail: mocks.sendMagicLinkEmailMock }));
vi.mock('@/lib/monsoon', () => ({ buildWeatherContext: mocks.buildWeatherContextMock }));
vi.mock('@/lib/redis', () => ({ getRedis: mocks.getRedisMock }));
vi.mock('@/lib/repository', () => ({
  createMagicLink: mocks.createMagicLinkMock,
  deleteSessionByTokenHash: mocks.deleteSessionByTokenHashMock,
  findOrCreateUser: mocks.findOrCreateUserMock,
  getUserByEmail: mocks.getUserByEmailMock,
  getAlerts: mocks.getAlertsMock,
  getAssistantMessages: mocks.getAssistantMessagesMock,
  getChecklist: mocks.getChecklistMock,
  getLatestPlan: mocks.getLatestPlanMock,
  getLatestTravelAdvisory: mocks.getLatestTravelAdvisoryMock,
  getPeerAlertReports: mocks.getPeerAlertReportsMock,
  getResources: mocks.getResourcesMock,
  saveAssistantMessage: mocks.saveAssistantMessageMock,
  savePeerAlertReport: mocks.savePeerAlertReportMock,
  savePreparednessPlan: mocks.savePreparednessPlanMock,
  saveTravelAdvisory: mocks.saveTravelAdvisoryMock,
  toggleChecklistItem: mocks.toggleChecklistItemMock,
}));
vi.mock('@/lib/auth', () => ({
  SESSION_COOKIE_NAME: 'session_token',
  buildMagicLink: mocks.buildMagicLinkMock,
  createOpaqueToken: mocks.createOpaqueTokenMock,
  hashToken: mocks.hashTokenMock,
  getSessionUser: mocks.getSessionUserMock,
}));

import {
  assistantAction,
  generatePreparednessPlanAction,
  generateTravelAdviceAction,
  getAssistantData,
  getHomeData,
  getPeerAlertData,
  getTravelData,
  loginAction,
  logoutAction,
  reportPeerAlertAction,
  signupAction,
  toggleChecklistAction,
  type PlanActionState,
} from './actions';

const initialState: PlanActionState = { status: 'idle', message: '' };

function formDataFrom(entries: Record<string, string | string[]>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.set(key, value);
    }
  }
  return formData;
}

describe('app actions integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('returns a generic success when logging in with an unknown email', async () => {
    mocks.getUserByEmailMock.mockResolvedValue(null);

    const result = await loginAction(initialState, formDataFrom({ email: 'unknown@example.com' }));

    expect(result.status).toBe('success');
    expect(result.message).toContain('If that email has a MausamOG account');
    expect(mocks.sendMagicLinkEmailMock).not.toHaveBeenCalled();
  });

  it('generates a fallback magic link when email sending is not configured', async () => {
    mocks.getUserByEmailMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });
    mocks.createOpaqueTokenMock.mockReturnValue('opaque-token');
    mocks.hashTokenMock.mockReturnValue('hashed-token');
    mocks.buildMagicLinkMock.mockReturnValue('http://localhost:3000/auth/verify?token=opaque-token');
    mocks.sendMagicLinkEmailMock.mockResolvedValue({ sent: false, reason: 'not_configured' });

    const result = await loginAction(initialState, formDataFrom({ email: 'citizen@mausamog.gov' }));

    expect(mocks.createMagicLinkMock).toHaveBeenCalledWith('user-1', 'hashed-token', 'login');
    expect(result.magicLink).toContain('/auth/verify');
    expect(result.message).toContain('Use the demo magic link below');
  });

  it('creates signup magic links for new users', async () => {
    mocks.findOrCreateUserMock.mockResolvedValue({ id: 'user-2', email: 'new@example.com', fullName: 'New User' });
    mocks.createOpaqueTokenMock.mockReturnValue('signup-token');
    mocks.hashTokenMock.mockReturnValue('signup-hash');
    mocks.buildMagicLinkMock.mockReturnValue('http://localhost:3000/auth/verify?token=signup-token');
    mocks.sendMagicLinkEmailMock.mockResolvedValue({ sent: true });

    const result = await signupAction(initialState, formDataFrom({ fullName: 'New User', email: 'new@example.com', city: 'Bengaluru' }));

    expect(mocks.findOrCreateUserMock).toHaveBeenCalledWith('New User', 'new@example.com');
    expect(result).toEqual({ status: 'success', message: 'Magic link sent. Check your email to finish signup.' });
  });

  it('requires authentication before generating preparedness plans', async () => {
    mocks.getSessionUserMock.mockResolvedValue(null);

    const result = await generatePreparednessPlanAction(initialState, new FormData());

    expect(result).toEqual({ status: 'error', message: 'You must be logged in.' });
  });

  it('generates and persists preparedness plans for authenticated users', async () => {
    mocks.getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });
    mocks.buildWeatherContextMock.mockReturnValue({ city: 'Bengaluru', floodRisk: 'moderate', rainfallLevel: 'heavy', alertHeadline: 'Watch for waterlogging', updatedAt: '2026-01-01T00:00:00.000Z' });
    mocks.generatePreparednessPlanMock.mockResolvedValue({
      source: 'gemini',
      plan: {
        riskSummary: 'Moderate risk summary for Bengaluru.',
        beforeMonsoon: ['Charge devices', 'Store documents safely', 'Check drains'],
        duringHeavyRain: ['Avoid flooded roads', 'Stay indoors', 'Track official alerts'],
        afterFlooding: ['Sanitize surfaces', 'Discard contaminated food', 'Inspect wiring'],
        emergencyKit: ['Torch', 'Water', 'Medicines', 'Power bank'],
        familySpecificAdvice: ['Keep medicines ready', 'Assign alert monitoring'],
        travelAdvice: ['Delay non-essential travel', 'Carry waterproof covers'],
        localAuthorityMessage: 'Follow official city advisories.',
        doNotDo: ['Do not drive through floodwater', 'Do not touch wires', 'Do not trust rumors'],
        language: 'English',
      },
    });

    const result = await generatePreparednessPlanAction(initialState, formDataFrom({
      city: 'Bengaluru',
      pincode: '560034',
      landmark: 'Koramangala',
      language: 'English',
      travelMode: 'Car',
      travelRoute: 'Koramangala to Whitefield',
      adults: '2',
      children: '1',
      elderly: '0',
      pets: '0',
      housingType: 'Apartment',
      floodProne: 'on',
      needs: ['medication', 'power backup'],
    }));

    expect(mocks.savePreparednessPlanMock).toHaveBeenCalled();
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/');
    expect(result.message).toContain('gemini');
  });

  it('toggles checklist items for authenticated users only', async () => {
    mocks.getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });

    await toggleChecklistAction(formDataFrom({ city: 'Bengaluru', itemKey: 'ids' }));

    expect(mocks.toggleChecklistItemMock).toHaveBeenCalledWith('Bengaluru', 'ids', 'user-1');
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/checklist');
  });

  it('rate limits assistant requests using redis', async () => {
    mocks.getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });
    mocks.getRedisMock.mockReturnValue({ incr: vi.fn().mockResolvedValue(7), expire: vi.fn() });

    const result = await assistantAction(initialState, formDataFrom({ sessionId: 'session-1', language: 'English', prompt: 'What should I pack?', city: 'Bengaluru' }));

    expect(result.status).toBe('error');
    expect(result.message).toContain('Slow down a bit');
    expect(mocks.generateAssistantAnswerMock).not.toHaveBeenCalled();
  });

  it('generates assistant responses and persists them when under limit', async () => {
    const expire = vi.fn();
    mocks.getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });
    mocks.getRedisMock.mockReturnValue({ incr: vi.fn().mockResolvedValue(1), expire });
    mocks.generateAssistantAnswerMock.mockResolvedValue({ answer: 'Keep devices charged and avoid flooded roads.', source: 'gemini' });

    const result = await assistantAction(initialState, formDataFrom({ sessionId: 'session-1', language: 'English', prompt: 'What should I pack?', city: 'Bengaluru' }));

    expect(expire).toHaveBeenCalledWith('ratelimit:assistant:user-1', 60);
    expect(mocks.saveAssistantMessageMock).toHaveBeenCalledWith('user-1', 'session-1', 'What should I pack?', 'Keep devices charged and avoid flooded roads.', 'English', 'gemini');
    expect(result.message).toContain('gemini');
  });

  it('creates travel advisories for authenticated users', async () => {
    mocks.getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });
    mocks.generateTravelAdviceMock.mockResolvedValue({
      source: 'fallback',
      result: {
        riskRating: 'moderate',
        summary: 'Expect delays and waterlogging.',
        saferTiming: 'Travel after the strongest rainfall window.',
        carryItems: ['Power bank', 'Water', 'Waterproof pouch'],
        avoidIf: ['roads are closed', 'visibility is very poor'],
      },
    });

    const result = await generateTravelAdviceAction(initialState, formDataFrom({ city: 'Bengaluru', route: 'Koramangala to Whitefield', mode: 'Car', language: 'English' }));

    expect(mocks.saveTravelAdvisoryMock).toHaveBeenCalled();
    expect(result.message).toContain('fallback');
  });

  it('requires authentication before accepting peer alerts', async () => {
    mocks.getSessionUserMock.mockResolvedValue(null);

    const result = await reportPeerAlertAction(initialState, formDataFrom({
      city: 'Bengaluru',
      type: 'road_block',
      severity: 'moderate',
      description: 'Road blocked by a fallen tree near the flyover.',
      latitude: '12.9352',
      longitude: '77.6205',
    }));

    expect(result.status).toBe('error');
    expect(mocks.savePeerAlertReportMock).not.toHaveBeenCalled();
  });

  it('saves peer alerts and revalidates the alerts page', async () => {
    mocks.getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });
    mocks.getRedisMock.mockReturnValue(null);

    const result = await reportPeerAlertAction(initialState, formDataFrom({
      city: 'Bengaluru',
      type: 'road_block',
      severity: 'high',
      description: 'Road blocked by a landslide near the service road.',
      latitude: '12.9352',
      longitude: '77.6205',
      accuracyMeters: '42',
    }));

    expect(mocks.savePeerAlertReportMock).toHaveBeenCalledWith({
      city: 'Bengaluru',
      type: 'road_block',
      severity: 'high',
      description: 'Road blocked by a landslide near the service road.',
      latitude: 12.9352,
      longitude: 77.6205,
      accuracyMeters: 42,
    }, 'user-1');
    expect(mocks.revalidatePathMock).toHaveBeenCalledWith('/alerts');
    expect(result.status).toBe('success');
  });

  it('returns empty home data for anonymous users', async () => {
    mocks.getSessionUserMock.mockResolvedValue(null);

    const result = await getHomeData();

    expect(result).toEqual({ city: 'Bengaluru', plan: null, alerts: [], checklist: [], resources: [], user: null });
  });

  it('aggregates home, assistant, and travel data for authenticated users', async () => {
    mocks.getSessionUserMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });
    mocks.getLatestPlanMock.mockResolvedValue({ input: { city: 'Mumbai' } });
    mocks.getAlertsMock.mockResolvedValue([{ title: 'Flood Watch' }]);
    mocks.getChecklistMock.mockResolvedValue([{ itemKey: 'ids', done: false }]);
    mocks.getResourcesMock.mockResolvedValue([{ name: 'Relief Center' }]);
    mocks.getAssistantMessagesMock.mockResolvedValue([{ id: 'msg-1', prompt: 'Test', response: 'Reply' }]);
    mocks.getLatestTravelAdvisoryMock.mockResolvedValue({ id: 'travel-1' });

    const home = await getHomeData();
    const assistant = await getAssistantData();
    const travel = await getTravelData();

    expect(home.city).toBe('Mumbai');
    expect(home.alerts).toHaveLength(1);
    expect(assistant.sessionId).toBe('session-user-1');
    expect(assistant.messages).toHaveLength(1);
    expect(travel.advisory).toEqual({ id: 'travel-1' });
  });

  it('returns peer alert data for a city', async () => {
    mocks.getPeerAlertReportsMock.mockResolvedValue([{ id: 'peer-1', city: 'Bengaluru' }]);

    const result = await getPeerAlertData('Bengaluru');

    expect(result.peerReports).toEqual([{ id: 'peer-1', city: 'Bengaluru' }]);
  });

  it('deletes the session cookie and redirects on logout', async () => {
    const deleteFn = vi.fn();
    mocks.cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: 'session-token' }), delete: deleteFn });
    mocks.hashTokenMock.mockReturnValue('session-hash');

    await logoutAction();

    expect(mocks.deleteSessionByTokenHashMock).toHaveBeenCalledWith('session-hash');
    expect(deleteFn).toHaveBeenCalledWith('session_token');
    expect(mocks.redirectMock).toHaveBeenCalledWith('/login');
  });
});
