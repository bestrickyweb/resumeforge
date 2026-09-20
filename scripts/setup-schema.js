const fs = require('fs');
const path = 'lib/db/schema.ts';
let content = fs.readFileSync(path, 'utf8');
const tables = `export const roastSession = pgTable('roast_session', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  cvText: text('cvText').notNull(),
  jobDescription: text('jobDescription'),
  score: integer('score').notNull(),
  grade: text('grade').notNull(),
  issues: text('issues').notNull().default('[]'),
  fixedIssueIds: text('fixedIssueIds').notNull().default('[]'),
  fixedCvId: integer('fixedCvId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const referralRequest = pgTable('referral_request', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  tailoredCvId: integer('tailoredCvId'),
  applicationId: integer('applicationId'),
  referrerName: text('referrerName'),
  referrerLinkedInUrl: text('referrerLinkedInUrl'),
  referrerRole: text('referrerRole'),
  connectionMessage: text('connectionMessage'),
  followUpMessage: text('followUpMessage'),
  sentAt: timestamp('sentAt'),
  respondedAt: timestamp('respondedAt'),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

`;
if (!content.includes('export const roastSession')) {
  content = content.replace(
    "export const careerSprint = pgTable('career_sprint', {",
    tables + "export const careerSprint = pgTable('career_sprint', {"
  );
  fs.writeFileSync(path, content);
  console.log('Schema updated');
} else {
  console.log('Schema already updated');
}