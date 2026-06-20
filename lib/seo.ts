import type { Metadata } from 'next'

export const SITE_URL = 'https://resumeforgestrategy.vercel.app'
export const SEO_TITLE = 'ATS Resume Builder | AI Resume Tailoring for Every Job'
export const SEO_DESCRIPTION =
  'Build ATS optimized resumes in seconds. ResumeForge AI tailors your CV to any job description, improves keyword matching, and helps you land more interviews.'
export const SEO_KEYWORDS = [
  'ATS resume builder',
  'AI resume builder',
  'resume tailoring tool',
  'resume optimizer',
  'job specific resume',
  'CV generator',
  'resume matching',
  'ATS optimized resume',
  'resume scanner',
  'resume improvement tool',
  'resume keyword optimizer',
  'AI CV builder',
  'job application tool',
  'resume customization',
  'resume enhancement',
  'career tools',
  'interview preparation',
  'resume score checker',
  'professional resume builder',
  'resume maker online',
]
export const GOOGLE_SITE_VERIFICATION =
  'FhB1pmAlgd8FdgXXc3EGMiEZtyhnxq31zzqHfDir1G8'

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ResumeForge AI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'AI powered ATS resume builder that tailors resumes to job descriptions.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
}

export type SeoLandingPageConfig = {
  path: string
  title: string
  h1: string
  description: string
  primaryKeyword: string
  h2s: string[]
  benefits: string[]
  steps: { title: string; description: string }[]
  faqs: { question: string; answer: string }[]
}

export const seoLandingPages: SeoLandingPageConfig[] = [
  {
    path: '/ats-resume-builder',
    title: 'ATS Resume Builder | AI Resume Tailoring for Every Job',
    h1: 'ATS Resume Builder That Tailors Your CV to Any Job Description',
    description:
      'Create an ATS resume builder workflow that scans job descriptions, optimizes keywords, and generates a targeted CV in under a minute with ResumeForge AI.',
    primaryKeyword: 'ATS resume builder',
    h2s: [
      'Tailor Your Resume to Any Job Description',
      'Increase ATS Match Scores Instantly',
      'Create Job Specific CVs in Under 60 Seconds',
    ],
    benefits: [
      'ATS keyword matching for every role',
      'Job-specific resume rewriting without fabricating experience',
      'Before and after match scores for every tailored CV',
    ],
    steps: [
      {
        title: 'Upload or paste your CV',
        description:
          'Start with your current resume in PDF, DOCX, or plain text format.',
      },
      {
        title: 'Paste the job description',
        description:
          'Add the exact role requirements, skills, and keywords you want to match.',
      },
      {
        title: 'Generate your ATS optimized resume',
        description:
          'ResumeForge rewrites your CV to align with the role and improve keyword matching.',
      },
    ],
    faqs: [
      {
        question: 'What makes this an ATS resume builder?',
        answer:
          'ResumeForge scans the job description, identifies important keywords, and rewrites your CV so it aligns with the language recruiters and ATS software look for.',
      },
      {
        question: 'Can I tailor one resume for multiple jobs?',
        answer:
          'Yes. Paste each job description and ResumeForge creates a separate job-specific version of your CV for every application.',
      },
    ],
  },
  {
    path: '/resume-tailoring-tool',
    title: 'Resume Tailoring Tool | AI CV Tailoring for Job Descriptions',
    h1: 'AI Resume Tailoring Tool for Every Job Application',
    description:
      'Use a resume tailoring tool that adapts your CV to each job description, improves keyword relevance, and helps you apply with confidence.',
    primaryKeyword: 'resume tailoring tool',
    h2s: [
      'Tailor Your Resume to Any Job Description',
      'Get More Interviews With AI Powered Resume Optimization',
      'Create Job Specific CVs in Under 60 Seconds',
    ],
    benefits: [
      'Role-specific summaries and bullet points',
      'Keyword gaps highlighted before you apply',
      'Tailored CVs ready for real job applications',
    ],
    steps: [
      {
        title: 'Add your current CV',
        description:
          'Use an existing resume or paste your experience directly into ResumeForge.',
      },
      {
        title: 'Add the target role',
        description:
          'Paste the job description so the AI understands the exact requirements.',
      },
      {
        title: 'Download your tailored CV',
        description:
          'Get a polished, job-specific resume that sounds like your own experience.',
      },
    ],
    faqs: [
      {
        question: 'Does the resume tailoring tool rewrite my real experience?',
        answer:
          'Yes. ResumeForge rewrites and reorders your real experience to match the role, but it does not invent jobs, skills, or qualifications.',
      },
      {
        question: 'Is resume tailoring worth it for every application?',
        answer:
          'For competitive roles, yes. A tailored CV usually performs better because it matches the job description and ATS keyword filters more closely.',
      },
    ],
  },
  {
    path: '/ai-resume-builder',
    title: 'AI Resume Builder | Generate Job Specific CVs Faster',
    h1: 'AI Resume Builder That Creates Job Specific CVs',
    description:
      'Build a stronger CV with an AI resume builder that turns your experience and a job description into a targeted resume in seconds.',
    primaryKeyword: 'AI resume builder',
    h2s: [
      'Professional Resume Builder for Modern Job Seekers',
      'Tailor Your Resume to Any Job Description',
      'Create Job Specific CVs in Under 60 Seconds',
    ],
    benefits: [
      'AI-assisted resume writing that keeps your facts intact',
      'Job-specific CV generation for faster applications',
      'ATS-focused keyword matching and scoring',
    ],
    steps: [
      {
        title: 'Enter your background',
        description:
          'Upload your resume or paste your work history, education, and skills.',
      },
      {
        title: 'Choose the target job',
        description:
          'Paste the job description so ResumeForge knows what the role needs.',
      },
      {
        title: 'Generate a tailored CV',
        description:
          'Create a polished, role-specific CV with stronger wording and keyword alignment.',
      },
    ],
    faqs: [
      {
        question: 'Can an AI resume builder improve my existing CV?',
        answer:
          'Yes. ResumeForge improves wording, structure, and keyword alignment while keeping your actual experience as the source of truth.',
      },
      {
        question: 'Does ResumeForge create generic templates?',
        answer:
          'No. Each output is tailored to the job description you paste, so your CV is specific to the role instead of generic.',
      },
    ],
  },
  {
    path: '/resume-optimizer',
    title: 'Resume Optimizer | ATS Resume Optimization and Keyword Matching',
    h1: 'Resume Optimizer That Improves Your ATS Match Score',
    description:
      'Optimize your resume for ATS systems with keyword matching, stronger bullet points, and a clear before and after match score.',
    primaryKeyword: 'resume optimizer',
    h2s: [
      'Increase ATS Match Scores Instantly',
      'Tailor Your Resume to Any Job Description',
      'Get More Interviews With AI Powered Resume Optimization',
    ],
    benefits: [
      'Keyword gaps identified against the job post',
      'Stronger achievement wording for ATS and recruiters',
      'Match score improvements tracked before and after tailoring',
    ],
    steps: [
      {
        title: 'Check your baseline',
        description:
          'Upload your CV and see how it currently matches a specific role.',
      },
      {
        title: 'Optimize for the role',
        description:
          'ResumeForge adds relevant keywords naturally and improves CV structure.',
      },
      {
        title: 'Apply with a stronger score',
        description:
          'Use the optimized version for the application where keyword fit matters most.',
      },
    ],
    faqs: [
      {
        question: 'What does a resume optimizer do?',
        answer:
          'A resume optimizer compares your CV with a job description, improves keyword relevance, and rewrites sections so your application is easier for ATS software to rank.',
      },
      {
        question: 'Will optimization make my CV sound unnatural?',
        answer:
          'ResumeForge prioritizes natural wording. Keywords are added in context so your CV still reads like a polished human-written resume.',
      },
    ],
  },
  {
    path: '/job-description-matcher',
    title: 'Job Description Matcher | Resume Keyword Matching Software',
    h1: 'Job Description Matcher for ATS Keyword Optimization',
    description:
      'Match your resume to any job description with AI keyword analysis, ATS scoring, and role-specific CV improvements.',
    primaryKeyword: 'job description matcher',
    h2s: [
      'Tailor Your Resume to Any Job Description',
      'Increase ATS Match Scores Instantly',
      'Resume Matching Software for Smarter Applications',
    ],
    benefits: [
      'Job description keyword analysis',
      'Resume-to-role gap detection',
      'Application-ready keyword recommendations',
    ],
    steps: [
      {
        title: 'Paste the job description',
        description:
          'Add the full role posting so ResumeForge can extract requirements and keywords.',
      },
      {
        title: 'Compare your CV',
        description:
          'ResumeForge checks how closely your current resume matches the role.',
      },
      {
        title: 'Generate the matched version',
        description:
          'Create a resume that addresses the strongest requirements in the posting.',
      },
    ],
    faqs: [
      {
        question: 'How does job description matching help?',
        answer:
          'It shows which requirements your CV already covers and which important terms are missing, then helps you close those gaps before applying.',
      },
      {
        question: 'Can I use this for remote jobs?',
        answer:
          'Yes. ResumeForge works with local, remote, and international job descriptions because it matches your CV to the posting itself.',
      },
    ],
  },
  {
    path: '/ats-resume-checker',
    title: 'ATS Resume Checker | Free Resume Score Checker',
    h1: 'ATS Resume Checker That Scores Your CV Before You Apply',
    description:
      'Check your ATS resume score, find missing keywords, and improve your CV before sending it to recruiters or hiring teams.',
    primaryKeyword: 'ATS resume checker',
    h2s: [
      'Increase ATS Match Scores Instantly',
      'Get More Interviews With AI Powered Resume Optimization',
      'Professional Resume Builder for Modern Job Seekers',
    ],
    benefits: [
      'ATS score visibility before you apply',
      'Missing keyword detection for each role',
      'Clear improvement guidance for your CV',
    ],
    steps: [
      {
        title: 'Upload your CV',
        description:
          'Start with your current resume so ResumeForge can read your experience.',
      },
      {
        title: 'Add the role',
        description:
          'Paste the job description to score your CV against the right requirements.',
      },
      {
        title: 'Improve and apply',
        description:
          'Use the optimized version to improve keyword fit and application confidence.',
      },
    ],
    faqs: [
      {
        question: 'What is an ATS resume checker?',
        answer:
          'An ATS resume checker compares your CV with a job description and estimates how well your resume matches the keywords and requirements recruiters may filter on.',
      },
      {
        question: 'Is the ATS score exact?',
        answer:
          'No ATS score can guarantee an outcome, but ResumeForge gives a practical estimate that helps you improve keyword matching and relevance.',
      },
    ],
  },
  {
    path: '/cv-builder',
    title: 'CV Builder | Professional Resume Builder for Modern Job Seekers',
    h1: 'Professional CV Builder for Modern Job Seekers',
    description:
      'Use a professional CV builder to create polished, ATS-friendly resumes tailored to the exact role you want.',
    primaryKeyword: 'CV builder',
    h2s: [
      'Professional Resume Builder for Modern Job Seekers',
      'Tailor Your Resume to Any Job Description',
      'Create Job Specific CVs in Under 60 Seconds',
    ],
    benefits: [
      'Clean CV structure for recruiters and ATS systems',
      'Job-specific wording for every application',
      'Professional formatting guidance for modern roles',
    ],
    steps: [
      {
        title: 'Start with your experience',
        description:
          'Upload your current CV or paste your background into the builder.',
      },
      {
        title: 'Select the target role',
        description:
          'Add the job description to guide the CV structure and keyword focus.',
      },
      {
        title: 'Create your professional CV',
        description:
          'Generate a polished CV designed for both ATS screening and human review.',
      },
    ],
    faqs: [
      {
        question: 'Is ResumeForge a CV builder or only a checker?',
        answer:
          'It is both. ResumeForge helps you build, check, optimize, and tailor your CV for specific job applications.',
      },
      {
        question: 'Can I use it for different industries?',
        answer:
          'Yes. Paste the job description for any industry and ResumeForge tailors your CV around the requirements of that role.',
      },
    ],
  },
  {
    path: '/resume-keyword-optimizer',
    title: 'Resume Keyword Optimizer | AI Resume Scanner and Matcher',
    h1: 'Resume Keyword Optimizer for Stronger ATS Matching',
    description:
      'Optimize resume keywords with an AI resume scanner that finds gaps, improves matching, and helps your CV align with job descriptions.',
    primaryKeyword: 'resume keyword optimizer',
    h2s: [
      'Increase ATS Match Scores Instantly',
      'Tailor Your Resume to Any Job Description',
      'Get More Interviews With AI Powered Resume Optimization',
    ],
    benefits: [
      'Keyword gap detection against job descriptions',
      'Natural keyword integration in your CV',
      'ATS-focused resume improvements before applying',
    ],
    steps: [
      {
        title: 'Scan your resume',
        description:
          'Upload your CV so ResumeForge can understand your current keyword coverage.',
      },
      {
        title: 'Compare the job post',
        description:
          'Paste the job description to identify must-have terms and requirements.',
      },
      {
        title: 'Optimize and apply',
        description:
          'Generate a keyword-optimized version that stays truthful to your experience.',
      },
    ],
    faqs: [
      {
        question: 'What is a resume keyword optimizer?',
        answer:
          'A resume keyword optimizer identifies important terms from a job description and helps you include them naturally in your CV.',
      },
      {
        question: 'Should I stuff keywords into my resume?',
        answer:
          'No. ResumeForge adds keywords naturally and keeps your CV readable for both ATS software and human recruiters.',
      },
    ],
  },
]

export function getLandingPageConfig(path: string) {
  const config = seoLandingPages.find((page) => page.path === path)
  if (!config) {
    throw new Error(`SEO landing page not found: ${path}`)
  }
  return config
}

export function getLandingPageMetadata(path: string): Metadata {
  const config = getLandingPageConfig(path)
  const url = `${SITE_URL}${config.path}`
  const image = `${SITE_URL}/og-image.png`

  return {
    title: config.title,
    description: config.description,
    keywords: [config.primaryKeyword, ...SEO_KEYWORDS],
    alternates: { canonical: url },
    openGraph: {
      title: config.title,
      description: config.description,
      type: 'website',
      url,
      images: [{ url: image, width: 1200, height: 630, alt: config.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [image],
    },
  }
}
