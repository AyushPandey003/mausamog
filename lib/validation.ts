import { z } from "zod";

export const preparednessSchema = z.object({
  city: z.string().trim().min(2).max(80),
  pincode: z.string().trim().min(4).max(12),
  landmark: z.string().trim().min(2).max(160),
  language: z.string().trim().min(2).max(24),
  travelMode: z.string().trim().min(2).max(24),
  travelRoute: z.string().trim().min(2).max(160),
  household: z.object({
    adults: z.coerce.number().int().min(1).max(12),
    children: z.coerce.number().int().min(0).max(12),
    elderly: z.coerce.number().int().min(0).max(12),
    pets: z.coerce.number().int().min(0).max(12),
    housingType: z.string().trim().min(2).max(60),
    floodProne: z.boolean(),
    needs: z.array(z.string().trim().min(1).max(60)).max(8),
  }),
});

export const travelSchema = z.object({
  city: z.string().trim().min(2).max(80),
  route: z.string().trim().min(2).max(160),
  mode: z.string().trim().min(2).max(24),
  language: z.string().trim().min(2).max(24),
});

export const assistantSchema = z.object({
  sessionId: z.string().trim().min(2).max(120),
  language: z.string().trim().min(2).max(24),
  prompt: z.string().trim().min(4).max(600),
  city: z.string().trim().min(2).max(80),
});

export const preparednessPlanSchema = z.object({
  riskSummary: z.string().trim().min(10).max(400),
  beforeMonsoon: z.array(z.string().trim().min(4).max(180)).min(3).max(8),
  duringHeavyRain: z.array(z.string().trim().min(4).max(180)).min(3).max(8),
  afterFlooding: z.array(z.string().trim().min(4).max(180)).min(3).max(8),
  emergencyKit: z.array(z.string().trim().min(2).max(120)).min(4).max(12),
  familySpecificAdvice: z.array(z.string().trim().min(4).max(180)).min(2).max(8),
  travelAdvice: z.array(z.string().trim().min(4).max(180)).min(2).max(8),
  localAuthorityMessage: z.string().trim().min(8).max(220),
  doNotDo: z.array(z.string().trim().min(4).max(180)).min(3).max(8),
  language: z.string().trim().min(2).max(24),
});

export const travelAdvisorySchema = z.object({
  riskRating: z.enum(["low", "moderate", "high"]),
  summary: z.string().trim().min(8).max(280),
  saferTiming: z.string().trim().min(4).max(160),
  carryItems: z.array(z.string().trim().min(2).max(120)).min(3).max(8),
  avoidIf: z.array(z.string().trim().min(4).max(180)).min(2).max(6),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(120),
  city: z.string().trim().min(2).max(80),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(120),
});

export const peerAlertReportSchema = z.object({
  city: z.string().trim().min(2).max(80),
  type: z.enum(["landslide", "road_block", "waterlogging", "tree_fall", "power_line", "other"]),
  severity: z.enum(["low", "moderate", "high"]),
  description: z.string().trim().min(8).max(220),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracyMeters: z.coerce.number().min(0).max(5000).optional(),
});
