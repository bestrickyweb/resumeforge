CREATE TABLE "roast_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"cvText" text NOT NULL,
	"jobDescription" text,
	"score" integer NOT NULL,
	"grade" text NOT NULL,
	"issues" text DEFAULT '[]' NOT NULL,
	"fixedIssueIds" text DEFAULT '[]' NOT NULL,
	"fixedCvId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_request" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tailoredCvId" integer,
	"applicationId" integer,
	"referrerName" text,
	"referrerLinkedInUrl" text,
	"referrerRole" text,
	"connectionMessage" text,
	"followUpMessage" text,
	"sentAt" timestamp,
	"respondedAt" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_sprint" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"goalRole" text NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"targetApplications" integer DEFAULT 10,
	"targetInterviews" integer DEFAULT 3,
	"status" text DEFAULT 'active' NOT NULL,
	"weeklyCheckins" text DEFAULT '[]' NOT NULL,
	"milestoneLog" text DEFAULT '[]' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_checkin" (
	"id" serial PRIMARY KEY NOT NULL,
	"sprintId" integer NOT NULL,
	"userId" text NOT NULL,
	"weekNumber" integer NOT NULL,
	"submittedAt" timestamp,
	"applicationsSent" integer DEFAULT 0,
	"interviewsAttended" integer DEFAULT 0,
	"offersReceived" integer DEFAULT 0,
	"skillsCompleted" text DEFAULT '[]' NOT NULL,
	"blockers" text,
	"nextWeekFocus" text,
	"mood" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
