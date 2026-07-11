import { preparednessPlanSchema, travelAdvisorySchema } from "./validation";
import type { PreparednessInput, PreparednessPlan, TravelAdvisory, WeatherContext } from "./schema";

export function buildWeatherContext(city: string): WeatherContext {
  const normalized = city.toLowerCase();
  if (normalized.includes("mumbai")) {
    return {
      city,
      rainfallLevel: "very heavy",
      floodRisk: "high",
      alertHeadline: "Coastal flooding and transport disruption likely.",
      updatedAt: new Date().toISOString(),
    };
  }

  if (normalized.includes("chennai")) {
    return {
      city,
      rainfallLevel: "heavy",
      floodRisk: "moderate",
      alertHeadline: "Localized flooding possible in low-lying streets.",
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    city,
    rainfallLevel: "moderate to heavy",
    floodRisk: "moderate",
    alertHeadline: "Waterlogging and commute delays possible during evening rainfall.",
    updatedAt: new Date().toISOString(),
  };
}

export function deterministicPreparednessPlan(input: PreparednessInput, weather: WeatherContext): PreparednessPlan {
  const highRisk = input.household.floodProne || weather.floodRisk === "high";
  return preparednessPlanSchema.parse({
    riskSummary: `${input.city} is currently in a ${weather.floodRisk} monsoon risk band with ${weather.rainfallLevel} rain expected. Focus first on power backup, drainage safety, medicines, and travel caution for ${input.travelRoute}.`,
    beforeMonsoon: [
      "Charge all phones, power banks, torches, and emergency lights before peak rainfall windows.",
      "Move important documents, electronics, and valuables away from floor level and store them in waterproof pouches.",
      `Review the nearest safe route from ${input.landmark} and share it with family members and one trusted contact.`,
      "Store dry food, clean drinking water, and basic sanitation supplies for at least 48 hours.",
    ],
    duringHeavyRain: [
      "Avoid entering flooded underpasses, basement parking zones, or roads where water depth is unclear.",
      "Keep one family member tracking official alerts while another checks device battery and emergency lighting.",
      `If commuting by ${input.travelMode}, delay non-essential movement until rainfall intensity reduces.`,
      "Keep children, elderly people, and pets away from balconies, open drains, and exposed electric points.",
    ],
    afterFlooding: [
      "Use protective footwear and gloves before cleaning water-affected areas.",
      "Discard food exposed to floodwater and sanitize frequently touched surfaces.",
      "Photograph home damage and utility issues early for reporting and claims.",
      "Let electrical systems dry and get inspection help before restarting sensitive appliances.",
    ],
    emergencyKit: [
      "Waterproof document pouch",
      "Charged power bank and cables",
      "Torch and spare batteries",
      "3-5 days of medicine",
      "Dry snacks and drinking water",
      highRisk ? "Plastic sheets and absorbent cloths" : "Umbrella, raincoat, and spare footwear",
    ],
    familySpecificAdvice: [
      `Your household has ${input.household.adults} adults, ${input.household.children} children, ${input.household.elderly} elderly members, and ${input.household.pets} pets, so keep role-based responsibilities simple and visible.`,
      input.household.elderly > 0 || input.household.needs.length > 0
        ? "Keep medicines, emergency contacts, and mobility support items ready in one grab-and-go area."
        : "Assign one person to alerts, one to supplies, and one to transport coordination during heavy rain.",
      highRisk ? "Because the home is flood-prone, prepare for fast elevation of critical items and possible temporary relocation." : "Because flood risk is not marked high, focus on power, food, and safe commuting first.",
    ],
    travelAdvice: [
      `For ${input.travelRoute}, prefer daylight movement and avoid peak-rain windows when visibility and road depth are uncertain.`,
      "Carry a charged phone, small towel, water, and one backup cash or UPI option.",
      highRisk ? "Cancel low-priority travel if alerts intensify or flooding expands near your route." : "Monitor local authority updates before departure and keep one fallback route ready.",
    ],
    localAuthorityMessage: `Follow verified civic, disaster management, and traffic advisories for ${input.city}. Call emergency services immediately if water rises rapidly or electrical hazards appear.`,
    doNotDo: [
      "Do not drive into moving or opaque floodwater.",
      "Do not touch fallen wires, wet switchboards, or unknown electrical equipment.",
      "Do not rely on rumors or unverified forwards instead of official updates.",
      "Do not delay moving children, elders, or medicines if conditions worsen quickly.",
    ],
    language: input.language,
  });
}

export function deterministicTravelAdvisory(city: string, route: string, mode: string): TravelAdvisory {
  const highRisk = city.toLowerCase().includes("mumbai") || route.toLowerCase().includes("coastal");
  return travelAdvisorySchema.parse({
    riskRating: highRisk ? "high" : "moderate",
    summary: `Travel for ${route} in ${city} by ${mode.toLowerCase()} may face waterlogging, delays, and reduced visibility during active monsoon spells.`,
    saferTiming: highRisk ? "Prefer travel only after the most intense rain band passes and official traffic updates improve." : "Prefer daylight travel and avoid the heaviest rainfall window if possible.",
    carryItems: ["charged phone", "power bank", "waterproof pouch", "drinking water"],
    avoidIf: [
      "roads are already waterlogged or closed by authorities",
      "visibility is sharply reduced or lightning activity is active nearby",
      "you cannot confirm an alternate route or safe shelter point",
    ],
  });
}

export function parseJsonCandidate(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(trimmed) as unknown;
}
