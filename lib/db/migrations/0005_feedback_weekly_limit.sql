ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "feedbackSubmittedAt" timestamp;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
