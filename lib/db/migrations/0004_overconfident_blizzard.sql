CREATE TABLE "career_roadmap" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"jobFitId" integer,
	"targetRole" text NOT NULL,
	"targetCompany" text,
	"readinessScore" integer DEFAULT 0 NOT NULL,
	"hoursPerWeek" integer DEFAULT 5 NOT NULL,
	"estimatedWeeks" integer,
	"projectedFitScore" integer,
	"completionDate" timestamp,
	"phases" text DEFAULT '[]' NOT NULL,
	"missingSkills" text DEFAULT '[]' NOT NULL,
	"learningPlan" text DEFAULT '[]' NOT NULL,
	"portfolioProjects" text DEFAULT '[]' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"submittedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"fullName" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text,
	"linkedinUrl" text,
	"portfolioUrl" text,
	"githubUrl" text,
	"summary" text,
	"workExperience" text DEFAULT '[]' NOT NULL,
	"education" text DEFAULT '[]' NOT NULL,
	"skills" text DEFAULT '[]' NOT NULL,
	"certifications" text DEFAULT '[]' NOT NULL,
	"projects" text DEFAULT '[]' NOT NULL,
	"languages" text DEFAULT '[]' NOT NULL,
	"awards" text DEFAULT '[]' NOT NULL,
	"volunteering" text DEFAULT '[]' NOT NULL,
	"references" text DEFAULT '[]' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resume_profile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "roadmap_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"roadmapId" integer NOT NULL,
	"userId" text NOT NULL,
	"skillName" text NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"hoursSpent" integer DEFAULT 0,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "feedbackSubmittedAt" timestamp;