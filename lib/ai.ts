import { z } from "zod";
import { deterministicPreparednessPlan, deterministicTravelAdvisory, parseJsonCandidate } from "./monsoon";
import { preparednessPlanSchema, travelAdvisorySchema } from "./validation";
import type { PreparednessInput, PreparednessPlan, TravelAdvisory, WeatherContext } from "./schema";

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";
const ASSISTANT_MAX_RESPONSE_LENGTH = 900;

type GeminiRequestOptions = {
  mimeType?: string;
  temperature: number;
};

const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z.array(z.object({ text: z.string().optional() })).optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

function extractText(payload: unknown) {
  const parsed = geminiResponseSchema.safeParse(payload);
  if (!parsed.success) return "";

  return parsed.data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

async function callGemini(prompt: string, options: GeminiRequestOptions) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const generationConfig = {
    temperature: options.temperature,
    ...(options.mimeType ? { responseMimeType: options.mimeType } : {}),
  };
  const response = await fetch(`${GEMINI_ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    }),
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json() as Promise<unknown>;
}

export async function generatePreparednessPlan(input: PreparednessInput, weather: WeatherContext): Promise<{ plan: PreparednessPlan; source: string }> {
  const prompt = `Generate a structured monsoon preparedness plan as valid JSON only.\nCity: ${input.city}\nPincode: ${input.pincode}\nLandmark: ${input.landmark}\nLanguage: ${input.language}\nTravel mode: ${input.travelMode}\nTravel route: ${input.travelRoute}\nHousehold: ${JSON.stringify(input.household)}\nWeather context: ${JSON.stringify(weather)}\nFields: riskSummary, beforeMonsoon, duringHeavyRain, afterFlooding, emergencyKit, familySpecificAdvice, travelAdvice, localAuthorityMessage, doNotDo, language.\nRequirements: practical citizen-safe advice, localized tone, no markdown, no hallucinated official numbers.`;

  try {
    const raw = await callGemini(prompt, { mimeType: "application/json", temperature: 0.5 });
    if (!raw) {
      return { plan: deterministicPreparednessPlan(input, weather), source: "fallback" };
    }

    const plan = preparednessPlanSchema.parse(parseJsonCandidate(extractText(raw)));
    return { plan, source: "gemini" };
  } catch {
    return { plan: deterministicPreparednessPlan(input, weather), source: "fallback" };
  }
}

export async function generateTravelAdvice(city: string, route: string, mode: string, language: string): Promise<{ result: TravelAdvisory; source: string }> {
  const prompt = `Generate a valid JSON travel advisory for monsoon conditions.\nCity: ${city}\nRoute: ${route}\nMode: ${mode}\nLanguage: ${language}\nFields: riskRating, summary, saferTiming, carryItems, avoidIf.\nNo markdown, JSON only.`;

  try {
    const raw = await callGemini(prompt, { mimeType: "application/json", temperature: 0.5 });
    if (!raw) {
      return { result: deterministicTravelAdvisory(city, route, mode), source: "fallback" };
    }

    const result = travelAdvisorySchema.parse(parseJsonCandidate(extractText(raw)));
    return { result, source: "gemini" };
  } catch {
    return { result: deterministicTravelAdvisory(city, route, mode), source: "fallback" };
  }
}

export async function generateAssistantAnswer(city: string, language: string, prompt: string) {
  const fallback = {
    answer: `For ${city}, prioritize official weather alerts, charged devices, clean drinking water, medicines, and avoiding flooded roads. In ${language}, keep instructions short, practical, and family-safe.`,
    source: "fallback",
  };

  try {
    const raw = await callGemini(
      `You are a multilingual monsoon safety assistant. City: ${city}. Language: ${language}. Question: ${prompt}. Give concise practical preparedness guidance. Do not claim to dispatch emergency services. Encourage contacting official emergency numbers for active emergencies.`,
      { temperature: 0.4 },
    );

    if (!raw) return fallback;
    const answer = extractText(raw).trim().slice(0, ASSISTANT_MAX_RESPONSE_LENGTH);
    return answer ? { answer, source: "gemini" } : fallback;
  } catch {
    return fallback;
  }
}
