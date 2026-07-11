import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateAssistantAnswer, generatePreparednessPlan, generateTravelAdvice } from "./ai";
import type { PreparednessInput, PreparednessPlan, TravelAdvisory, WeatherContext } from "./schema";

const preparednessInput: PreparednessInput = {
  city: "Bengaluru",
  pincode: "560034",
  landmark: "Koramangala",
  language: "English",
  travelMode: "Car",
  travelRoute: "Koramangala to Whitefield",
  household: {
    adults: 2,
    children: 1,
    elderly: 0,
    pets: 0,
    housingType: "Apartment",
    floodProne: false,
    needs: ["medication"],
  },
};

const weather: WeatherContext = {
  city: "Bengaluru",
  rainfallLevel: "heavy",
  floodRisk: "moderate",
  alertHeadline: "Waterlogging possible.",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const generatedPlan: PreparednessPlan = {
  riskSummary: "Moderate monsoon risk with likely waterlogging near low-lying streets.",
  beforeMonsoon: ["Charge devices", "Move documents safely", "Clear balcony drains"],
  duringHeavyRain: ["Avoid flooded underpasses", "Track official alerts", "Keep phones charged"],
  afterFlooding: ["Sanitize floors", "Discard contaminated food", "Inspect wiring"],
  emergencyKit: ["Torch", "Water", "Medicines", "Power bank"],
  familySpecificAdvice: ["Keep medicines visible", "Assign one person to monitor alerts"],
  travelAdvice: ["Delay non-essential travel", "Carry waterproof covers"],
  localAuthorityMessage: "Follow verified city and disaster management advisories.",
  doNotDo: ["Do not drive through floodwater", "Do not touch fallen wires", "Do not trust rumors"],
  language: "English",
};

const generatedTravelAdvisory: TravelAdvisory = {
  riskRating: "moderate",
  summary: "Expect delays, waterlogging, and reduced visibility on this route.",
  saferTiming: "Prefer daylight travel after the strongest rain passes.",
  carryItems: ["Power bank", "Water", "Waterproof pouch"],
  avoidIf: ["roads are closed", "visibility is very poor"],
};

function stubGeminiText(text: string, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue({
      candidates: [{ content: { parts: [{ text }] } }],
    }),
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("AI generation helpers", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "test-model";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
  });

  it("uses Gemini text when the assistant response shape is valid", async () => {
    const fetchMock = stubGeminiText(" Keep devices charged and avoid flooded roads. ");

    const result = await generateAssistantAnswer("Bengaluru", "English", "What should I pack?");

    expect(result).toEqual({
      answer: "Keep devices charged and avoid flooded roads.",
      source: "gemini",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/test-model:generateContent?key=test-key",
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    );
  });

  it("falls back when Gemini is not configured", async () => {
    delete process.env.GEMINI_API_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateTravelAdvice("Mumbai", "coastal road", "Car", "English");

    expect(result.source).toBe("fallback");
    expect(result.result.riskRating).toBe("high");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back when Gemini returns malformed assistant content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ candidates: [{ content: { parts: [{ inlineData: {} }] } }] }),
      }),
    );

    const result = await generateAssistantAnswer("Bengaluru", "English", "What should I pack?");

    expect(result.source).toBe("fallback");
    expect(result.answer).toContain("For Bengaluru");
  });

  it("parses structured Gemini preparedness plans", async () => {
    stubGeminiText(JSON.stringify(generatedPlan));

    const result = await generatePreparednessPlan(preparednessInput, weather);

    expect(result).toEqual({ plan: generatedPlan, source: "gemini" });
  });

  it("falls back when structured Gemini travel output fails validation", async () => {
    stubGeminiText(JSON.stringify({ ...generatedTravelAdvisory, riskRating: "severe" }));

    const result = await generateTravelAdvice("Bengaluru", "Ring Road", "Car", "English");

    expect(result.source).toBe("fallback");
    expect(result.result.riskRating).toBe("moderate");
  });
});
