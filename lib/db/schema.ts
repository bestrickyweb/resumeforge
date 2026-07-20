import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
} from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Better Auth tables (do not rename columns)
// ---------------------------------------------------------------------------
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// ---------------------------------------------------------------------------
// App tables (scoped by userId — no FK by convention)
// ---------------------------------------------------------------------------
export const tailoredCv = pgTable('tailored_cv', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  userName: text('userName').notNull(),
  jobTitle: text('jobTitle').notNull(),
  company: text('company'),
  jobDescription: text('jobDescription').notNull(),
  originalCv: text('originalCv').notNull(),
  tailoredCv: text('tailoredCv').notNull(),
  coverLetter: text('coverLetter'),
  summary: text('summary'),
  keywords: text('keywords'),
  matchBefore: integer('matchBefore').notNull().default(0),
  matchAfter: integer('matchAfter').notNull().default(0),
  keywordMatchPct: integer('keywordMatchPct').notNull().default(0),
  formatScore: integer('formatScore').notNull().default(0),
  quantScore: integer('quantScore').notNull().default(0),
  titleMatch: boolean('titleMatch').notNull().default(false),
  interviewBand: text('interviewBand'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const application = pgTable('application', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  company: text('company').notNull(),
  role: text('role').notNull(),
  status: text('status').notNull().default('saved'),
  jobUrl: text('jobUrl'),
  location: text('location'),
  salary: text('salary'),
  notes: text('notes'),
  cvId: integer('cvId'),
  appliedAt: timestamp('appliedAt'),
  nextReminderAt: timestamp('nextReminderAt'),
  lastContactAt: timestamp('lastContactAt'),
  followUpCount: integer('followUpCount').default(0),
  salaryOffered: text('salaryOffered'),
  salaryExpected: text('salaryExpected'),
  offerExpiresAt: timestamp('offerExpiresAt'),
  lastRecruiterReplyAt: timestamp('lastRecruiterReplyAt'),
  jobSource: text('jobSource'),
  jobBoardId: text('jobBoardId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const subscription = pgTable('subscription', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  status: text('status').notNull().default('active'),
  paystackReference: text('paystackReference'),
  authorizationCode: text('authorizationCode'),
  paystackCustomerId: text('paystackCustomerId'),
  currentPeriodEnd: timestamp('currentPeriodEnd'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const interviewSession = pgTable('interview_session', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  applicationId: integer('applicationId'),
  jobTitle: text('jobTitle').notNull(),
  company: text('company'),
  questions: text('questions').notNull().default('[]'),
  userAnswers: text('userAnswers').notNull().default('[]'),
  aiFeedback: text('aiFeedback').notNull().default('[]'),
  overallScore: integer('overallScore'),
  mode: text('mode').notNull().default('mock'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const linkedinProfile = pgTable('linkedin_profile', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull().unique(),
  rawText: text('rawText').notNull(),
  parsed: text('parsed').notNull().default('{}'),
  optimizedHeadline: text('optimizedHeadline'),
  optimizedAbout: text('optimizedAbout'),
  optimizedSkills: text('optimizedSkills').notNull().default('[]'),
  scanScore: integer('scanScore'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const jobPosting = pgTable('job_posting', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  salary: text('salary'),
  url: text('url').notNull(),
  description: text('description'),
  source: text('source').notNull().default('manual'),
  boardId: text('boardId'),
  fitScore: integer('fitScore'),
  applied: boolean('applied').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const reminder = pgTable('reminder', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  applicationId: integer('applicationId').notNull(),
  type: text('type').notNull(),
  scheduledAt: timestamp('scheduledAt').notNull(),
  sentAt: timestamp('sentAt'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const skillsGapAnalysis = pgTable('skills_gap_analysis', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  targetRole: text('targetRole').notNull(),
  targetIndustry: text('targetIndustry'),
  gaps: text('gaps').notNull().default('[]'),
  recommendedLearning: text('recommendedLearning').notNull().default('[]'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
