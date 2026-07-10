CREATE TABLE "interview_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"applicationId" integer,
	"jobTitle" text NOT NULL,
	"company" text,
	"questions" text DEFAULT '[]' NOT NULL,
	"userAnswers" text DEFAULT '[]' NOT NULL,
	"aiFeedback" text DEFAULT '[]' NOT NULL,
	"overallScore" integer,
	"mode" text DEFAULT 'mock' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_posting" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"salary" text,
	"url" text NOT NULL,
	"description" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"boardId" text,
	"fitScore" integer,
	"applied" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"rawText" text NOT NULL,
	"parsed" text DEFAULT '{}' NOT NULL,
	"optimizedHeadline" text,
	"optimizedAbout" text,
	"optimizedSkills" text DEFAULT '[]' NOT NULL,
	"scanScore" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "linkedin_profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "reminder" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"applicationId" integer NOT NULL,
	"type" text NOT NULL,
	"scheduledAt" timestamp NOT NULL,
	"sentAt" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills_gap_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"targetRole" text NOT NULL,
	"targetIndustry" text,
	"gaps" text DEFAULT '[]' NOT NULL,
	"recommendedLearning" text DEFAULT '[]' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "nextReminderAt" timestamp;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "lastContactAt" timestamp;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "followUpCount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "salaryOffered" text;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "salaryExpected" text;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "offerExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "lastRecruiterReplyAt" timestamp;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "jobSource" text;--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "jobBoardId" text;