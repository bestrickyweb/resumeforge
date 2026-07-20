ALTER TABLE "tailored_cv" ADD COLUMN IF NOT EXISTS "keywordMatchPct" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tailored_cv" ADD COLUMN IF NOT EXISTS "formatScore" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tailored_cv" ADD COLUMN IF NOT EXISTS "quantScore" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tailored_cv" ADD COLUMN IF NOT EXISTS "titleMatch" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tailored_cv" ADD COLUMN IF NOT EXISTS "interviewBand" text;
