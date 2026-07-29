# HSBC AI Campaign Assistant POC

A Next.js POC for an AI-assisted campaign creation system for Hang Seng Bank.

## Features

- **AI Chat Assistant**: Guides users through campaign field configuration
- **5 Module Workflow**: Basic Info → Extension Info → Delivery Channel → Opt-In Flag → Bounce Back
- **Smart Field Extraction**: AI extracts fields from natural language descriptions
- **AI Reference Matching**: The first requirement is scored against the historical use-case
  catalogue by the LLM (`/api/match`), with a deterministic heuristic fallback
- **Ownership Auto-Populate**: Selecting a message owner (dropdown or chat) auto-fills the
  full ownership hierarchy from the organizational directory (`users.csv`)
- **Business-Rule Enforcement**: BR-01 (high-risk → dual vendor) is auto-enforced; BR-02..08
  surface as advisories; value constraints (VC-01..06) validate inline
- **Channel Detection**: Automatically detects channels (Push, SMS, Email, Letter) from user messages
- **Dynamic Field Visibility**: Shows/hides fields based on channel selection and dependencies
- **Scroll-to-Module**: Click sidebar module to scroll to it in the form

## Data Model

Reference data is sourced from the customer CSVs in `docs/` and converted to typed TypeScript
modules at build time. **Do not hand-edit the generated files** — edit the CSVs and regenerate:

```bash
npm run gen:data   # docs/*.csv → data/reference/*.ts
```

| Source CSV | Generated module | Contents |
| --- | --- | --- |
| `docs/users.csv` | `data/reference/users.ts` | Org directory (14 users, ownership hierarchy) |
| `docs/use-cases.csv` | `data/reference/use-cases.ts` | 5 reference use cases (UC-001..005) |
| `docs/use-case-channel-rules.csv` | `data/reference/channel-rules.ts` | Per-channel routing/sender rules |

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- DeepSeek API (OpenAI-compatible)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` with your DeepSeek API key:
   ```
   DEEPSEEK_API_KEY=[YOUR_DEEPSEEK_API_KEY]
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-chat
   ```

3. Generate reference data from the CSVs:
   ```bash
   npm run gen:data
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
campaign-ai-poc/
├── app/
│   ├── api/chat/route.ts     # Chat API endpoint
│   ├── api/match/route.ts    # AI reference-matching endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page (state, matching, prefill, BR-01)
├── components/
│   ├── ChatPanel.tsx         # AI chat interface
│   ├── FormPanel.tsx         # Form fields + owner dropdown + BR advisories
│   ├── FieldRow.tsx          # Field row with inline value validation
│   ├── ModuleSidebar.tsx     # Module navigation
│   └── ...
├── data/
│   ├── field-definitions.ts  # 48 field definitions + dependency logic
│   ├── reference/            # AUTO-GENERATED from docs/*.csv (do not edit)
│   └── sample-messages.json  # Sample requirement prompts
├── lib/
│   ├── llm.ts                # DeepSeek client
│   ├── functions.ts          # Function calling definitions
│   ├── prompts.ts            # System prompts
│   ├── org-directory.ts      # Ownership lookup / auto-populate
│   ├── reference-matching.ts # Match helpers + heuristic fallback
│   └── validation.ts         # VC-01..06 + BR-01..09 rules
└── scripts/
    └── convert-csv.mjs       # CSV → typed data generator
```

## Key Features

### AI Reference Matching
The first requirement message is POSTed to `/api/match`, which asks the LLM to score each
historical use case (0–100). If the LLM is unavailable, a deterministic heuristic ranks by
channel/keyword overlap. The top matches render as selectable reference cards.

### Ownership Auto-Populate
Ownership is derived from `users.csv`. Selecting a message owner (via the dropdown or chat)
fills entity, market, line of business, service line, department/team head, business lines,
business team/contact and cost owner — without overwriting values the user has edited.

### Business Rules & Validation
`lib/validation.ts` implements the BRD §7 rules: value constraints validate inline in each
field row, and cross-field business rules surface as advisories in the form panel. BR-01
(high-risk messages require dual vendor) is auto-enforced in the app state.

### Channel Detection
The AI automatically detects channels mentioned in user messages (Push, SMS, Email, Letter) and activates relevant fields in other modules (Opt-In Flag, Bounce Back).

### Dynamic Field Visibility
Fields are shown/hidden based on channel selection and other field dependencies. The sidebar shows accurate missing counts that update as channels are selected.

### Scroll-to-Module
Clicking a module in the sidebar scrolls to that module in the form area and expands it automatically.

## License

Internal POC - Hang Seng Bank
