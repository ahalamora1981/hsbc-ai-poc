# HSBC AI Campaign Assistant POC

A Next.js POC for an AI-assisted campaign creation system for Hang Seng Bank.

## Features

- **AI Chat Assistant**: Guides users through campaign field configuration
- **5 Module Workflow**: Basic Info → Extension Info → Delivery Channel → Opt-In Flag → Bounce Back
- **Smart Field Extraction**: AI extracts fields from natural language descriptions
- **Reference Use Cases**: Matches historical campaigns for reference
- **Auto-fill with Statistics**: Pre-fills fields based on historical data

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
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
campaign-ai-poc/
├── app/
│   ├── api/chat/route.ts    # Chat API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── ChatPanel.tsx         # AI chat interface
│   ├── FormPanel.tsx         # Form fields display
│   ├── ModuleSidebar.tsx     # Module navigation
│   └── ...
├── data/
│   ├── field-definitions.ts  # 48 field definitions
│   ├── mock-use-cases.json   # Reference use cases
│   └── historical-stats.json # Historical statistics
└── lib/
    ├── llm.ts               # DeepSeek client
    ├── functions.ts          # Function calling definitions
    └── prompts.ts            # System prompts
```

## License

Internal POC - Hang Seng Bank
