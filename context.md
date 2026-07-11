# MausamOG Context

## Challenge
Build a GenAI-powered monsoon preparedness and citizen assistance solution that provides personalized preparedness plans, weather-aware guidance, emergency checklists, travel advisories, safety recommendations, multilingual assistance, and real-time alerts before, during, and after severe weather events.

## Current Build
Implemented a strong MVP called **MausamOG** with a Stitch-inspired Sentinal Flux visual system and a modular Next.js architecture.

## Delivered Features
- Dashboard landing page with preparedness profile form
- Server Action powered **personalized preparedness plan generation**
- **Deterministic fallback** plan generation when Gemini is unavailable
- **Checklist** route with persisted progress toggles
- **Alerts** route with cached/seeded monsoon alert cards and map-ready layout
- **Travel** route with generated travel advisories
- **Assistant** route with multilingual monsoon guidance and Redis-backed rate limiting
- **Resources** route with shelters, hospitals, and emergency helpdesks

## Stack
- Next.js App Router
- React 19
- Tailwind CSS v4
- Neon Postgres
- Drizzle ORM
- Upstash Redis
- Zod validation
- Vitest tests

## Data + Infra
- Seeded Postgres data for alerts, local resources, and checklist items
- Redis used for alert caching and assistant rate limiting
- Environment contract prepared for optional Gemini and Mapbox integration

## Verification
- `pnpm seed` passed
- `pnpm test` passed
- `pnpm lint` passed
- `pnpm build` passed

## Important Note
- `GEMINI_API_KEY` is now configured, so preparedness plans, travel advisories, and assistant responses can use Gemini with deterministic fallback retained for reliability.
- `NEXT_PUBLIC_MAPBOX_TOKEN` is configured and the alerts page now renders a live interactive Mapbox view with seeded alert markers.
