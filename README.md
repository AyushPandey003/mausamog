# MausamOG

MausamOG is a GenAI-powered monsoon preparedness and citizen assistance command center. It helps citizens build a localized safety plan, track emergency readiness, inspect city alerts, get route-aware travel advice, and ask a multilingual monsoon safety assistant for practical guidance.

The app is built with Next.js App Router, Server Actions, TypeScript, i18next, React i18next, Neon Postgres, Drizzle ORM, Upstash Redis, Google Gemini, Gmail OAuth, Mapbox, Tailwind CSS, Zod, and Vitest.

## What It Does

- Generates personalized monsoon preparedness plans from city, pincode, landmark, household, language, flood-risk, and travel context.
- Shows a readiness dashboard with active alerts, checklist progress, local resources, and the latest AI-generated plan.
- Provides a multilingual assistant for concise citizen-safety answers.
- Supports persistent UI language switching across English, Hindi, Kannada, and Tamil using i18next.
- Creates travel advisories for routes and travel modes during monsoon conditions.
- Displays localized alert markers on a Mapbox-powered risk map.
- Supports magic-link login/signup through Gmail OAuth, with demo-link fallback when email is not configured.
- Persists users, sessions, plans, checklists, alerts, resources, travel advisories, and assistant messages in Postgres.
- Uses Redis for alert caching and assistant rate limiting.
- Includes deterministic fallbacks so the demo remains usable when external services are unavailable.

## Product Flow

```mermaid
flowchart LR
  A[Citizen opens MausamOG] --> B{Signed in?}
  B -->|No| C[Register or login]
  C --> D[Magic link verification]
  D --> E[Dashboard]
  B -->|Yes| E

  E --> F[Generate preparedness plan]
  E --> G[Track emergency checklist]
  E --> H[View alerts and map]
  E --> I[Find local resources]
  E --> J[Ask safety assistant]
  E --> K[Generate travel advisory]

  F --> L[Gemini structured JSON]
  J --> M[Gemini assistant answer]
  K --> N[Gemini travel advice]

  L --> O[Validated with Zod]
  M --> O
  N --> O
  O --> P[(Neon Postgres)]
```

## Architecture

```mermaid
flowchart TB
  subgraph UI[Next.js App Router UI]
    Home[/Dashboard/]
    Alerts[/Alerts/]
    Assistant[/Assistant/]
    Travel[/Travel/]
    Auth[/Login and Register/]
    I18nProvider[I18n Provider and Language Switcher]
  end

  subgraph Server[Server Actions and Route Handlers]
    Actions[app/actions.ts]
    Verify[app/auth/verify/route.ts]
    GoogleCallback[Google OAuth callback]
    ServerI18n[Server i18n helpers]
  end

  subgraph Core[Domain Services]
    I18nResources[lib/i18n/resources.ts]
    AI[lib/ai.ts]
    Monsoon[lib/monsoon.ts]
    Validation[lib/validation.ts]
    Repo[lib/repository.ts]
    Email[lib/email.ts]
    AuthLib[lib/auth.ts]
  end

  subgraph External[External Services]
    Gemini[Google Gemini API]
    Neon[(Neon Postgres)]
    Redis[(Upstash Redis)]
    Gmail[Gmail API]
    Mapbox[Mapbox GL]
  end

  Home --> Actions
  Alerts --> Actions
  Assistant --> Actions
  Travel --> Actions
  Auth --> Actions
  I18nProvider --> I18nResources

  ServerI18n --> I18nResources
  Actions --> Validation
  Actions --> ServerI18n
  Actions --> AI
  Actions --> Monsoon
  Actions --> Repo
  Actions --> Email
  Verify --> AuthLib
  GoogleCallback --> Email

  AI --> Gemini
  Repo --> Neon
  Repo --> Redis
  Email --> Gmail
  Alerts --> Mapbox
```

## Internationalization Architecture

MausamOG uses i18next as a shared translation layer for both server-rendered pages and client-side interactions.

```mermaid
flowchart TB
  Resources[lib/i18n/resources.ts]
  ServerHelper[lib/i18n/server.ts]
  ClientHelper[lib/i18n/client.ts]
  Provider[app/components/i18n-provider.tsx]
  Switcher[app/components/language-switcher.tsx]
  Layout[app/layout.tsx]
  ServerPages[Server pages]
  ClientForms[Client forms and auth screens]
  Actions[app/actions.ts]
  Cookie[(mausamog-language cookie)]
  LocalStorage[(mausamog.language localStorage)]

  Resources --> ServerHelper
  Resources --> ClientHelper
  ServerHelper --> Layout
  ServerHelper --> ServerPages
  ServerHelper --> Actions
  ClientHelper --> Provider
  Provider --> ClientForms
  Switcher --> Cookie
  Switcher --> LocalStorage
  Switcher --> Provider
  Cookie --> ServerHelper
  LocalStorage --> Provider
  ClientForms --> Actions
```

Key decisions:

- `lib/i18n/resources.ts` is the single source for supported locales, labels, form language mappings, and translation dictionaries.
- `lib/i18n/server.ts` reads the `mausamog-language` cookie and creates a per-request i18next instance for Server Components and Server Actions.
- `lib/i18n/client.ts` initializes the browser i18next instance used by `react-i18next`.
- `app/components/i18n-provider.tsx` wraps the app, keeps `<html lang>` in sync, and hydrates from `localStorage` when available.
- `app/components/language-switcher.tsx` persists language selection to both cookie and `localStorage`, then refreshes the router so server-rendered text updates.
- Forms submit a hidden `locale` field so Server Actions can return localized validation and status messages even before the next page refresh.
- Generated AI content, seed alert text, and persisted checklist/resource records are not machine-translated at render time; they remain source content and are localized through generation inputs or future data-level translations.

## AI Request Lifecycle

```mermaid
sequenceDiagram
  actor User
  participant Form as Next.js Form
  participant Action as Server Action
  participant Zod as Zod Validation
  participant Weather as Weather Context
  participant Gemini as Gemini API
  participant Fallback as Deterministic Fallback
  participant DB as Neon Postgres

  User->>Form: Submit city, household, language, route
  Form->>Action: generatePreparednessPlanAction
  Action->>Zod: Parse and validate input
  Zod-->>Action: Typed preparedness input
  Action->>Weather: Build monsoon risk context
  Action->>Gemini: Request structured JSON plan
  alt Gemini returns valid JSON
    Gemini-->>Action: Plan JSON
  else API unavailable or invalid response
    Action->>Fallback: Generate safe deterministic plan
    Fallback-->>Action: Plan JSON
  end
  Action->>Zod: Validate generated plan shape
  Action->>DB: Save profile and plan
  Action-->>User: Revalidated dashboard with latest plan
```

## Data Model

```mermaid
erDiagram
  APP_USERS ||--o{ AUTH_MAGIC_LINKS : owns
  APP_USERS ||--o{ AUTH_SESSIONS : owns
  APP_USERS ||--o{ CITIZEN_PROFILES : owns
  APP_USERS ||--o{ PREPAREDNESS_PLANS : creates
  APP_USERS ||--o{ CHECKLIST_PROGRESS : tracks
  APP_USERS ||--o{ ASSISTANT_MESSAGES : sends
  CITIZEN_PROFILES ||--o{ PREPAREDNESS_PLANS : informs

  APP_USERS {
    uuid id PK
    varchar full_name
    varchar email
    timestamp created_at
  }

  AUTH_MAGIC_LINKS {
    uuid id PK
    uuid user_id FK
    text token_hash
    varchar intent
    timestamp expires_at
    timestamp consumed_at
  }

  AUTH_SESSIONS {
    uuid id PK
    uuid user_id FK
    text token_hash
    timestamp expires_at
  }

  CITIZEN_PROFILES {
    uuid id PK
    uuid user_id FK
    varchar city
    varchar pincode
    text landmark
    varchar language
    jsonb household
  }

  PREPAREDNESS_PLANS {
    uuid id PK
    uuid user_id FK
    uuid profile_id FK
    varchar source
    varchar risk_level
    jsonb input
    jsonb weather_context
    jsonb plan
  }

  CHECKLIST_PROGRESS {
    uuid id PK
    uuid user_id FK
    varchar city
    varchar category
    varchar item_key
    text label
    boolean done
  }

  WEATHER_ALERTS {
    uuid id PK
    varchar city
    varchar severity
    text title
    text summary
    varchar source
    jsonb meta
  }

  LOCAL_RESOURCES {
    uuid id PK
    varchar city
    text name
    varchar kind
    text address
    varchar phone
  }

  TRAVEL_ADVISORIES {
    uuid id PK
    varchar city
    text route
    varchar mode
    varchar source
    jsonb result
  }

  ASSISTANT_MESSAGES {
    uuid id PK
    uuid user_id FK
    varchar session_id
    text prompt
    text response
    varchar language
    varchar source
  }
```

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js App Router, React, TypeScript |
| Internationalization | i18next, React i18next, cookie and localStorage language persistence |
| Styling | Tailwind CSS, custom CSS variables |
| AI | Google Gemini API, deterministic fallback generators |
| Validation | Zod schemas for form input and AI output |
| Database | Neon Postgres with Drizzle ORM |
| Cache and limits | Upstash Redis |
| Email auth | Gmail API with OAuth refresh token |
| Maps | Mapbox GL |
| Tests | Vitest |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Main readiness dashboard |
| `/alerts` | Alert list and Mapbox risk view |
| `/assistant` | Multilingual monsoon safety assistant |
| `/checklist` | Emergency readiness checklist |
| `/resources` | Local shelters, hospitals, helplines, and support points |
| `/travel` | Route and commute safety advisory |
| `/login` | Magic-link login |
| `/register` | Magic-link signup |

## Environment Variables

Create `.env` in the project root. Use real values for production, and omit optional integrations locally if you want to rely on fallbacks.

```bash
DATABASE_URL=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAPBOX_TOKEN=

GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
GMAIL_REFRESH_TOKEN=
GMAIL_FROM="MausamOG <your-gmail-address@gmail.com>"
```

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Seed demo data:

```bash
pnpm seed
```

Run tests:

```bash
pnpm test
```

Build for production:

```bash
pnpm build
pnpm start
```

## Gmail OAuth Helper

Generate a Gmail consent URL:

```bash
pnpm gmail:auth-url
```

Exchange an authorization code for a refresh token:

```bash
$env:GMAIL_AUTH_CODE="paste-code-here"; pnpm gmail:exchange
```

The app can still run without Gmail configuration. In that case, login and signup return a demo magic link instead of sending an email.

## AI Safety and Reliability

- Gemini responses are requested as structured JSON for preparedness plans and travel advisories.
- Generated responses are parsed and validated before being saved.
- The assistant response is capped before persistence.
- Fallback generators provide safe, practical monsoon guidance when Gemini is unavailable.
- Assistant calls can be rate-limited with Redis.
- The app avoids pretending to dispatch emergency services and directs users to official emergency channels for active emergencies.

## Project Structure

```text
app/
  actions.ts                  Server actions for auth, plans, checklist, travel, assistant
  components/                 Reusable dashboard, map, i18n, and form components
  alerts/                     Alert and risk-map page
  assistant/                  Multilingual assistant page
  checklist/                  Emergency checklist page
  resources/                  Local resources page
  travel/                     Travel advisory page
lib/
  ai.ts                       Gemini calls and AI fallback routing
  auth.ts                     Magic-link tokens and session helpers
  db.ts                       Neon/Drizzle connection
  email.ts                    Gmail OAuth email sender
  monsoon.ts                  Weather context and deterministic plan logic
  redis.ts                    Upstash Redis client
  repository.ts               Data access layer and schema bootstrap
  schema.ts                   Drizzle tables and shared domain types
  validation.ts               Zod input and output schemas
  i18n/
    resources.ts              Supported languages and translation resources
    server.ts                 Cookie-backed server translation helper
    client.ts                 Browser i18next initialization helper
scripts/
  seed.ts                     Seed alerts, checklists, and resources
  gmail-oauth.ts              Gmail OAuth URL and token exchange helper
data/seed/
  alerts.json
  checklist.json
  resources.json
```

## Submission Notes

Copy-ready submission answers are included in:

- `submission-deployed-version-updates.txt`
- `submission-genai-services-utilized.txt`

They are written to fit a 1024-character form field limit.
