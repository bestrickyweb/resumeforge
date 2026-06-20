# ResumeForge

An AI-powered career platform that helps candidates tailor their CVs to specific job descriptions, optimise them for Applicant Tracking Systems (ATS), and track every stage of the job application process — all in one place.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Runtime**: Node.js
- **Database**: PostgreSQL via Drizzle ORM
- **AI Engine**: Vercel AI SDK (`ai`), powered by Google Gemini or OpenAI
- **Authentication**: Better Auth
- **Payments**: Paystack
- **File Processing**: unpdf (PDF), Mammoth (DOCX)
- **Styling**: Tailwind CSS + shadcn/ui
- **Package Manager**: npm

## Core Features

### CV Tailoring

Paste a job description alongside a current CV (plain text, PDF, or DOCX). ResumeForge uses AI to rewrite the candidate's experience for that specific role without fabricating facts. It reorders sections, rephrases bullet points with quantified impact, and weaves in keywords pulled directly from the job post.

Every tailored CV is tagged with an estimated ATS match score before and after tailoring, so candidates can see exactly how much alignment improved.

### Cover Letter Generation

A tailored cover letter is generated alongside every CV, keeping the same factual base but matching the tone and requirements of the target role.

### Application Tracker

Candidates can transfer any tailored CV directly into an application tracker. The tracker supports status management across the full hiring pipeline:

| Status | Description |
|--------|-------------|
| Saved | Job saved for later |
| Applied | Application submitted |
| Interview | Interview stage |
| Offer | Offer received |
| Rejected | Application closed |

The dashboard surfaces counts for total CVs generated, total applications, interviews and offers combined, and jobs currently in progress.

### Usage & Billing

Free-tier users receive three tailored CVs per month. Paid tiers unlock higher monthly limits and cover letters. Payments are handled through Paystack. Usage is tracked per calendar month for paying users, while free-tier usage is tracked across the lifetime of the account.

### File Upload & Extraction

Resumes can be uploaded or pasted directly. Supported formats include PDF, DOCX, and TXT. Files are parsed on the server side and the extracted text is normalised before being sent to the AI model. Uploads are limited to 8 MB and must contain a minimum number of readable characters.

## Project Structure

```
resumeforge/
├── app/
│   ├── actions/
│   │   ├── applications.ts
│   │   ├── extract.ts
│   │   ├── queries.ts
│   │   └── tailor.ts
│   ├── dashboard/
│   │   ├── applications/
│   │   ├── billing/
│   │   ├── cvs/
│   │   │   └── [id]/
│   │   └── tailor/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── sign-in/
│   └── sign-up/
├── components/
│   └── dashboard/
│       ├── application-dialog.tsx
│       ├── applications-board.tsx
│       ├── billing-plans.tsx
│       ├── cv-detail.tsx
│       ├── cv-upload.tsx
│       ├── dashboard-nav.tsx
│       ├── mobile-nav.tsx
│       ├── page-header.tsx
│       ├── tailor-form.tsx
│       └── usage-card.tsx
├── components/ui/
├── lib/
│   ├── auth-client.ts
│   ├── auth.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── plans.ts
│   ├── session.ts
│   └── utils.ts
├── package.json
├── next.config.mjs
├── tailwind.config.*
└── tsconfig.json
```

## Key Architecture Decisions

### Server Actions

All data mutations — CV tailoring, file extraction, application CRUD, and usage queries — are implemented as Next.js Server Actions. This keeps sensitive operations and database access strictly on the server.

### AI Model Selection

The application detects whether a Google Generative AI API key is available at runtime. If present, it uses `gemini-2.5-flash`; otherwise, it falls back to `openai/gpt-5-mini` via the Vercel AI Gateway.

### Schema Design

Every application and tailored CV record is explicitly scoped to a `userId`. The database schema uses nullable foreign keys by convention rather than foreign-key constraints, keeping joins lightweight and migrations straightforward.

### ATS Scoring

Match scores are estimated by the AI model and stored as integers from 0 to 100. Untailored CVs typically score between 30 and 55 before optimisation, reflecting a realistic baseline for generic resumes applied to specific roles.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- PostgreSQL database
- Google Generative AI API key (optional)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/<your-org>/resumeforge.git
cd resumeforge
npm install
```

### Environment Variables

Create a `.env` file in the project root. Required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — Secret key for session signing
- `BETTER_AUTH_URL` — Base URL of the application
- `GOOGLE_GENERATIVE_AI_API_KEY` — Optional; enables Google Gemini as the AI provider
- `PAYSTACK_SECRET_KEY` — Paystack API key for billing
- `PAYSTACK_PUBLIC_KEY` — Paystack public key for client-side checkout

### Paystack Webhook

Configure your Paystack webhook to point to `/api/paystack/webhook` to receive asynchronous payment events (charge.success, charge.failed). The webhook verifies the signature using `PAYSTACK_SECRET_KEY`.

### Database Setup

Apply the schema migrations using the configured database connection. The project uses Drizzle ORM with a PostgreSQL adapter. Ensure the database referenced in `DATABASE_URL` exists before running migrations.

### Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to load the application.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the project |
