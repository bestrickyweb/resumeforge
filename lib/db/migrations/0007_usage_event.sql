CREATE TABLE IF NOT EXISTS "usage_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"feature" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_usage_event_userId_createdAt ON "usage_event"("userId", "createdAt" DESC);
