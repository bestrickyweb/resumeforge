CREATE INDEX IF NOT EXISTS idx_tailored_cv_userId_createdAt ON "tailored_cv"("userId", "createdAt" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_application_userId_updatedAt ON "application"("userId", "updatedAt" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_feedback_userId ON "feedback"("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_reminder_userId_scheduledAt ON "reminder"("userId", "scheduledAt");
