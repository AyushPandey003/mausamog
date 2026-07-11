# Monsoon Preparedness & Citizen Assistance Plan

## Challenge Brief

Build a GenAI-powered solution that helps individuals, families, and communities prepare for the monsoon season. The solution must use Generative AI to provide personalized preparedness plans, weather-aware guidance, emergency checklists, travel advisories, safety recommendations, multilingual assistance, and real-time alerts before, during, and after severe weather events.

## Product Direction

Working name: **MausamOG**

Core idea: a practical monsoon command center where a citizen enters location, household details, mobility constraints, travel plans, language, and risk concerns. The app generates a personalized readiness plan, tracks checklist progress, shows relevant local alerts, and provides an emergency assistant for what to do next.

The MVP should feel useful even without live government integrations. Real weather, map, and alert sources can be layered in as adapters, with deterministic fallback data for demo reliability.

## Judging Priorities

1. Strong problem alignment: every major screen should map to monsoon preparedness or citizen assistance.
2. Dynamic behavior: plan generation, checklist progress, alert refresh, multilingual assistant, saved profiles.
3. Code quality: clear app structure, typed data contracts, server-only secrets, reusable services.
4. Security: input validation, rate limits, safe AI output parsing, no client-side secrets.
5. Efficiency: cache weather/geocoding/AI-heavy operations, avoid unnecessary client rendering.
6. Accessibility: keyboard-friendly flows, readable contrast, semantic status indicators.
7. Testing: schema tests, server action tests, fallback tests, basic UI smoke checks.

## MVP Feature Set

### 1. Citizen Preparedness Profile

Collect:

- Location: city, pin code, landmark, optional coordinates
- Household: adults, children, elderly, pets
- Housing: apartment, ground-floor home, flood-prone area, informal settlement, rural home
- Needs: medication, disability support, pregnancy, power backup, drinking water, transport
- Communication: preferred language and emergency contact
- Travel: commute route, upcoming journey, school or office dependency

Output:

- Risk level summary
- Family-specific preparation plan
- Priority actions for next 24 hours, 3 days, and post-event recovery

### 2. GenAI Preparedness Plan

Server-side generation returns structured JSON:

- `riskSummary`
- `beforeMonsoon`
- `duringHeavyRain`
- `afterFlooding`
- `emergencyKit`
- `familySpecificAdvice`
- `travelAdvice`
- `localAuthorityMessage`
- `doNotDo`
- `language`

Use a strict schema and normalize model output before saving or rendering.

Fallback: deterministic rule-based plan if the AI API fails.

### 3. Emergency Checklist

Interactive checklist grouped by:

- Documents and IDs
- Food and water
- Medical needs
- Power and communication
- Home safety
- Evacuation readiness
- Post-rain sanitation

Store progress per user/profile in Postgres. Keep a fast recent-state cache in Redis if useful.

### 4. Weather-Aware Alert Center

Show alert cards for:

- Heavy rainfall
- Flood risk
- Thunderstorm/lightning
- Road closure or commute disruption
- Waterlogging
- Heat/humidity after rain

Implementation:

- Initial demo can use seeded alerts plus optional weather API adapter.
- Cache external weather responses in Upstash Redis by location and time window.
- Save important user-facing alert snapshots in Postgres for audit/demo continuity.

### 5. Multilingual Citizen Assistant

Chat-style assistant for practical questions:

- "What should I pack if we may evacuate?"
- "Is it safe to drive through waterlogged roads?"
- "My power is out and phone battery is low, what first?"
- "Translate my checklist to Hindi/Marathi/Tamil/Bengali."

Safety rule: assistant gives practical preparedness guidance, not medical diagnosis, legal guarantees, or official emergency dispatch. For emergencies, it should direct users to local emergency services.

### 6. Travel Advisory

User enters route intent:

- From/to city or locality
- Travel date/time
- Transport mode: walking, bike, car, bus, train

Output:

- Risk rating
- Delay/flooding cautions
- Safer timing recommendation
- Items to carry
- "Avoid if..." conditions

Mapbox GL can enhance this with visual routes and risk overlays, but route guidance should still work as text in the MVP.

## Optional Mapbox GL Layer

Keep Mapbox GL as a high-impact optional feature, not a blocker.

Possible map features:

- Location picker with geocoding
- User location marker
- Alert zones as colored circles or polygons
- Flood-prone/waterlogging markers from seeded local data
- Emergency centers: shelters, hospitals, police, fire stations
- Route visualization for travel advisory

Practical approach:

- Build text-first alert and travel advisory flows first.
- Add Mapbox only behind a `NEXT_PUBLIC_MAPBOX_TOKEN` check.
- If no token exists, show a normal location input and list-based local resources.
- Keep all Mapbox token usage client-side and restrict the token in Mapbox dashboard.

## Technical Stack

### Frontend

- Next.js App Router
- React Server Components where useful
- Client components for checklist state, map, assistant UI, and interactive forms
- Tailwind CSS for fast UI

### Database

- Neon Postgres for durable data
- Drizzle ORM for schema, migrations, and typed queries

Suggested tables:

- `app_users`
- `citizen_profiles`
- `preparedness_plans`
- `checklist_items`
- `checklist_progress`
- `weather_alerts`
- `travel_advisories`
- `assistant_messages`
- `local_resources`

### Cache / Rate Limit

- Upstash Redis for:
  - weather/geocoding cache
  - AI generation rate limits
  - session or anonymous visitor throttling
  - recent alert cache by location

### AI Service

Server-only AI calls:

- Prepare structured plan generation
- Translate selected advice/checklists
- Summarize alert impact in plain language
- Generate travel advisory text
- Assistant responses with guardrails

Never render raw model output directly. Parse, validate, and sanitize.

## App Routes

Recommended route structure:

- `/` - dashboard-style landing experience with location/profile entry and current alert summary
- `/prepare` - profile form and AI preparedness plan generation
- `/checklist` - saved emergency checklist and progress
- `/alerts` - weather-aware alert center
- `/travel` - travel advisory generator
- `/assistant` - multilingual citizen assistant
- `/resources` - local emergency resources and saved contacts

If time is tight, combine `/prepare`, `/checklist`, and `/alerts` into one strong dashboard page.

## Data Flow

1. User enters location and household details.
2. Server validates input with a schema.
3. Server checks Redis for recent weather/geocoding/alert context.
4. If cache misses, fetch or synthesize weather context, then cache it.
5. AI service generates a structured preparedness plan.
6. Server validates model JSON and saves it to Neon via Drizzle.
7. UI renders plan, checklist, alerts, and travel advice from typed server data.
8. User checklist updates are persisted and reflected immediately in UI.

## Security Plan

- Keep `DATABASE_URL`, Redis credentials, AI keys, and server secrets out of client bundles.
- Use `NEXT_PUBLIC_MAPBOX_TOKEN` only for Mapbox GL client rendering.
- Validate all form inputs before database, AI, or external API use.
- Use Drizzle parameterized queries instead of raw SQL string interpolation.
- Rate-limit AI and alert-refresh endpoints with Upstash Redis.
- Add model-output validation before rendering or saving generated JSON.
- Avoid storing precise live location unless needed; allow city/pin-code mode.
- Add basic abuse limits for anonymous users.

## Demo Reliability Plan

Because live weather and government feeds can fail during judging:

- Seed sample cities and monsoon alert scenarios.
- Provide deterministic fallback plans.
- Cache external responses.
- Show clear "demo data" labels only where needed.
- Ensure the full flow works with only database, Redis, and AI configured.
- Ensure a limited fallback still works if AI is unavailable.

## Implementation Phases

### Phase 1: Foundation

- Install Drizzle, Neon driver, Upstash Redis, validation library, and Mapbox dependency if used.
- Create environment variable contract.
- Create database schema and seed script.
- Add shared validation schemas and typed service boundaries.

### Phase 2: Core Preparedness Flow

- Build `/prepare` profile form.
- Implement server action for plan generation.
- Add deterministic fallback generator.
- Save and render generated plans.
- Add multilingual output selector.

### Phase 3: Checklist and Alerts

- Add checklist tables and UI.
- Persist checklist progress.
- Build alert center with seeded plus cached alert data.
- Add Redis rate limits and alert cache.

### Phase 4: Travel and Assistant

- Build travel advisory form and result view.
- Add assistant route with scoped prompts and safety constraints.
- Store chat history per profile/session.

### Phase 5: Optional Mapbox GL

- Add map component behind token check.
- Add location marker and local resource markers.
- Add alert zone overlays.
- Add route visualization only if time remains.

### Phase 6: Polish and Verification

- Replace starter Next.js UI and metadata.
- Add responsive dashboard layout.
- Add loading, empty, error, and fallback states.
- Run lint/build.
- Add focused tests for schema parsing, fallback generation, rate limit behavior, and data normalization.

## Environment Variables

Required:

```env
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
AI_API_KEY=
```

Optional:

```env
AI_MODEL=
NEXT_PUBLIC_MAPBOX_TOKEN=
WEATHER_API_KEY=
```

## Submission Framing

Describe the project as:

"MausamOG is a GenAI-powered monsoon preparedness and citizen assistance app. It creates personalized readiness plans, emergency checklists, travel advisories, multilingual safety guidance, and weather-aware alerts using a secure Next.js, Neon Postgres, Drizzle, and Upstash Redis architecture. Mapbox GL is supported as an optional visual layer for location, local resources, and risk overlays."

## Build Priority If Time Is Limited

1. Preparedness profile plus AI-generated plan
2. Emergency checklist with saved progress
3. Alert center with seeded/cached weather context
4. Multilingual assistant
5. Travel advisory
6. Mapbox GL visual layer

