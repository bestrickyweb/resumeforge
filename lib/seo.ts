import type { Metadata } from 'next'

export const SITE_URL = 'https://tailorvance.com'
export const SEO_TITLE = 'Resume Builder | ATS-Optimized Resume Tailoring to Beat the Bots'
export const SEO_DESCRIPTION =
  'Tailorvance helps you build ATS-optimized resumes that get interviews. Our AI resume builder tailors your CV to any job description, improves keyword matching, fixes formatting for ATS scanners, and helps you land more interviews.'
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

export const organizationData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Tailorvance',
  url: SITE_URL,
  description:
    'Tailorvance helps you build ATS-optimized resumes that get interviews. Tailored resumes, ATS-ready applications, and a LinkedIn profile that gets noticed.',
  logo: `${SITE_URL}/tailorvance.png`,
  sameAs: [
    'https://www.linkedin.com/company/tailorvance',
    'https://twitter.com/tailorvance',
    'https://www.tiktok.com/@tailorvance',
    'https://www.instagram.com/tailorvance',
  ],
}

export const webSiteData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Tailorvance',
  url: SITE_URL,
  description:
    'Tailorvance helps you build ATS-optimized resumes that get interviews.',
  publisher: {
    '@type': 'Organization',
    name: 'Tailorvance',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export const faqPageData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this a free resume builder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Tailorvance offers a free resume builder with 3 tailored resumes per week. Upgrade for more resumes, templates, and advanced AI features.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will employers know I used Tailorvance?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Tailorvance tailors your real experience to the role — it never invents jobs or qualifications. The result reads like a sharper version of your own resume, written by you.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is an ATS, and why does my resume need to pass it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An Applicant Tracking System is software recruiters use to filter resumes before a human reviews them. If your resume does not match the job keywords, it can be rejected automatically — even if you are qualified.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I tailor one resume for multiple jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Paste each job description and Tailorvance creates a separate job-specific version of your resume for every application.',
      },
    },
  ],
}

export const breadcrumbData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Resume Builder',
      item: `${SITE_URL}/resume-builder`,
    },
  ],
}

export const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Tailorvance AI Resume Builder',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'AI powered ATS resume builder that tailors resumes to job descriptions and beats ATS filters.',
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
      'Create an ATS resume builder workflow that scans job descriptions, optimizes keywords, and generates a targeted CV in under a minute with Tailorvance.',
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
           'Tailorvance rewrites your CV to align with the role and improve keyword matching.',
      },
    ],
    faqs: [
      {
        question: 'What makes this an ATS resume builder?',
        answer:
           'Tailorvance scans the job description, identifies important keywords, and rewrites your CV so it aligns with the language recruiters and ATS software look for.',
      },
      {
        question: 'Can I tailor one resume for multiple jobs?',
        answer:
           'Yes. Paste each job description and Tailorvance creates a separate job-specific version of your CV for every application.',
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
           'Use an existing resume or paste your experience directly into Tailorvance.',
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
           'Yes. Tailorvance rewrites and reorders your real experience to match the role, but it does not invent jobs, skills, or qualifications.',
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
           'Paste the job description so Tailorvance knows what the role needs.',
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
           'Yes. Tailorvance improves wording, structure, and keyword alignment while keeping your actual experience as the source of truth.',
      },
      {
         question: 'Does Tailorvance create generic templates?',
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
           'Tailorvance adds relevant keywords naturally and improves CV structure.',
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
           'Tailorvance prioritizes natural wording. Keywords are added in context so your CV still reads like a polished human-written resume.',
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
           'Add the full role posting so Tailorvance can extract requirements and keywords.',
      },
      {
        title: 'Compare your CV',
        description:
           'Tailorvance checks how closely your current resume matches the role.',
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
           'Yes. Tailorvance works with local, remote, and international job descriptions because it matches your CV to the posting itself.',
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
           'Start with your current resume so Tailorvance can read your experience.',
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
           'No ATS score can guarantee an outcome, but Tailorvance gives a practical estimate that helps you improve keyword matching and relevance.',
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
         question: 'Is Tailorvance a CV builder or only a checker?',
        answer:
           'It is both. Tailorvance helps you build, check, optimize, and tailor your CV for specific job applications.',
      },
      {
        question: 'Can I use it for different industries?',
        answer:
           'Yes. Paste the job description for any industry and Tailorvance tailors your CV around the requirements of that role.',
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
           'Upload your CV so Tailorvance can understand your current keyword coverage.',
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
           'No. Tailorvance adds keywords naturally and keeps your CV readable for both ATS software and human recruiters.',
      },
     ],
  },
  {
    path: '/resume-builder',
    title: 'Resume Builder | AI Resume Builder That Beats ATS Filters',
    h1: 'Resume Builder That Creates ATS-Optimized Resumes Automatically',
    description:
      'Use Tailorvance resume builder to create ATS-friendly resumes in seconds. AI rewrites your experience, adds keywords, and formats your resume to pass ATS scanners and land interviews.',
    primaryKeyword: 'resume builder',
    h2s: [
      'ATS-Optimized Resume Builder for Every Job',
      'AI Resume Formatting That Passes ATS Filters',
      'Download Your Resume as DOCX or PDF',
    ],
    benefits: [
      'ATS-friendly formatting that passes 90%+ of resume scanners',
      'AI rewrites your experience to match the job description',
      'Built-in keyword optimization for every role',
      'Real-time match score before and after tailoring',
    ],
    steps: [
      {
        title: 'Start your resume',
        description:
          'Paste your current resume or start fresh with a proven template.',
      },
      {
        title: 'Add the job description',
        description:
          'Tailorvance scans the job post for required skills and keywords.',
      },
      {
        title: 'Download your ATS-optimized resume',
        description:
          'Get a polished, role-specific resume that beats ATS filters and impresses recruiters.',
      },
    ],
    faqs: [
      {
        question: 'Is this a free resume builder?',
        answer:
          'Yes. Tailorvance offers a free resume builder with 3 tailored resumes per week. Upgrade for more resumes, templates, and advanced AI features.',
      },
      {
        question: 'Can I download my resume as a Word document?',
        answer:
          'Yes. Tailorvance exports your resume as both DOCX and PDF, fully formatted for ATS systems.',
      },
    ],
  },
  {
    path: '/resume-tailoring',
    title: 'Resume Tailoring | AI Tailored Resume for Every Job Description',
    h1: 'AI Resume Tailoring — Resumes Tailored to Every Job Description',
    description:
      'Tailor your resume to any job description with Tailorvance. Our AI resume tailor rewrites your experience, adds keyword matching, and creates a tailored resume that gets past ATS filters.',
    primaryKeyword: 'resume tailoring',
    h2s: [
      'Resume Tailored to Job Description — Automatically',
      'AI Resume Tailoring Without Fabricating Experience',
      'Match Score Improvements for Every Application',
    ],
    benefits: [
      'Role-specific resume rewrites for every application',
      'Keyword matching optimized for the exact job post',
      'ATS-friendly formatting and before/after match scores',
      'No fabricated experience — only truthful tailoring',
    ],
    steps: [
      {
        title: 'Upload your resume',
        description:
          'Start with your current resume in PDF, DOCX, or plain text.',
      },
      {
        title: 'Paste the job description',
        description:
          'Tailorvance extracts keywords and requirements automatically.',
      },
      {
        title: 'Get your tailored resume',
        description:
          'Download a job-specific resume optimized for ATS and recruiters.',
      },
    ],
    faqs: [
      {
        question: 'What is resume tailoring?',
        answer:
          'Resume tailoring adapts your resume to each job description by aligning keywords, reordering achievements, and adjusting your summary to match the role requirements.',
      },
      {
        question: 'Is tailored resume writing worth it?',
        answer:
          'Yes. Tailored resumes perform significantly better — they pass ATS filters and catch the recruiter’s attention by addressing the exact role requirements.',
      },
    ],
  },
  {
    path: '/ats-resume-checker',
    title: 'ATS Resume Checker | Free Resume Score Checker — Tailorvance',
    h1: 'ATS Resume Checker — Free Resume Score Before You Apply',
    description:
      'Check your ATS resume score instantly with Tailorvance. Free ATS resume checker finds missing keywords, formatting issues, and optimization gaps before you apply.',
    primaryKeyword: 'ATS resume checker',
    h2s: [
      'Check Your ATS Score Before Submitting Your Resume',
      'Find Missing Keywords That ATS Scanners Look For',
      'Free Resume Review — No Signup Required',
    ],
    benefits: [
      'Instant ATS compatibility score (0-100 scale)',
      'Missing keyword detection against the job description',
      'Formatting audit for ATS-friendly resumes',
      'Actionable fix recommendations',
    ],
    steps: [
      {
        title: 'Upload your resume',
        description:
          'Paste or upload your resume to check against any job description.',
      },
      {
        title: 'Add the job description',
        description:
          'Tailorvance analyzes ATS match, keywords, and formatting in seconds.',
      },
      {
        title: 'See how to improve',
        description:
          'Get a clear score, keyword gaps, and step-by-step recommendations.',
      },
    ],
    faqs: [
      {
        question: 'Is the ATS resume checker free?',
        answer:
          'Yes. Tailorvance offers a free ATS resume checker with instant results. No signup required.',
      },
      {
        question: 'How accurate is the ATS score?',
        answer:
          'Tailorvance uses industry-standard keyword matching and formatting heuristics modeled on real ATS systems used by Nigerian and international recruiters.',
      },
    ],
  },
  {
    path: '/cover-letter-generator',
    title: 'Cover Letter Generator | AI Cover Letter Writer for Job Applications',
    h1: 'AI Cover Letter Generator — Write Your Cover Letter for Any Job',
    description:
      'Generate a tailored cover letter with Tailorvance. Our AI cover letter writer creates custom cover letters that match your resume to the job description and company.',
    primaryKeyword: 'cover letter generator',
    h2s: [
      'AI Cover Letter for Every Job Application',
      'Cover Letter Writer That Matches Your Resume',
      'Professional Cover Letters in Under 60 Seconds',
    ],
    benefits: [
      'AI-written cover letters tailored to each job',
      'Cover letter matches your resume and the job description',
      'ATS-friendly formatting and keyword integration',
      'Download as DOCX or copy-paste ready',
    ],
    steps: [
      {
        title: 'Upload your resume',
        description:
          'Tailorvance reads your resume to write a relevant cover letter.',
      },
      {
        title: 'Paste the job description',
        description:
          'Our AI identifies the company culture and role requirements.',
      },
      {
        title: 'Get your cover letter',
        description:
          'Download a tailored cover letter that impresses hiring managers.',
      },
    ],
    faqs: [
      {
        question: 'Do you need a cover letter for every job?',
        answer:
          'Not always, but it helps. Tailorvance makes it effortless to generate a tailored cover letter for roles where it matters most.',
      },
      {
        question: 'Can I edit the AI-generated cover letter?',
        answer:
          'Yes. Every cover letter is editable. Tailorvance keeps your real experience as the basis, so you can tweak tone or add personal touches.',
      },
    ],
  },
  {
    path: '/linkedin-profile-optimization',
    title: 'LinkedIn Profile Optimization | AI LinkedIn Profile Writer',
    h1: 'LinkedIn Profile Optimization — Get Noticed by Recruiters',
    description:
      'Optimize your LinkedIn profile with Tailorvance. Our AI LinkedIn profile writer crafts headlines, summaries, and experience sections that get you found by recruiters and hiring managers.',
    primaryKeyword: 'LinkedIn profile optimization',
    h2s: [
      'LinkedIn Headline That Gets You Discovered',
      'AI-Optimized Summary and Experience Sections',
      'LinkedIn SEO for Recruiter Searches',
    ],
    benefits: [
      'LinkedIn headline optimization for recruiter keyword searches',
      'AI-crafted summary that showcases your value proposition',
      'Experience sections optimized for profile views',
      'Before and after keyword analysis',
    ],
    steps: [
      {
        title: 'Connect your LinkedIn',
        description:
          'Tailorvance reads your profile to identify gaps and opportunities.',
      },
      {
        title: 'Set your target role',
        description:
          'Add the job description to align your profile with the right keywords.',
      },
      {
        title: 'Optimize and apply',
        description:
          'Get an optimized LinkedIn profile that recruiters find and engage with.',
      },
    ],
    faqs: [
      {
        question: 'Do you rewrite my entire LinkedIn profile?',
        answer:
          'Tailorvance suggests optimizations for your headline, summary, and experience sections while preserving your authentic voice and real achievements.',
      },
      {
        question: 'Will optimization help me get more messages from recruiters?',
        answer:
          'Yes. A keyword-optimized LinkedIn profile appears in more recruiter searches and gets significantly more profile views and connection requests.',
      },
    ],
  },
  {
    path: '/resume-templates',
    title: 'Resume Templates | 5 ATS-Friendly Professional Resume Templates',
    h1: 'Professional Resume Templates — 5 ATS-Optimized Designs',
    description:
      'Choose from 5 industry-specific resume templates at Tailorvance. Each ATS-friendly template is optimized for different roles and designed to pass ATS scanners.',
    primaryKeyword: 'resume templates',
    h2s: [
      '5 ATS-Friendly Resume Templates for Every Industry',
      'Templates Optimized for ATS and Recruiters',
      'Industry-Specific Resume Designs',
    ],
    benefits: [
      '5 professionally designed ATS-friendly templates',
      'Templates for tech, finance, consulting, startups, and more',
      'Optimized for both ATS scanners and human recruiters',
      'Export as DOCX or PDF',
    ],
    steps: [
      {
        title: 'Choose your template',
        description:
          'Select from 5 ATS-optimized resume templates based on your industry.',
      },
      {
        title: 'Customize for the job',
        description:
          'Tailorvance rewrites your content to match the template and job description.',
      },
      {
        title: 'Download and apply',
        description:
          'Export your resume as a perfectly formatted DOCX or PDF.',
      },
    ],
    faqs: [
      {
        question: 'Are the resume templates free?',
        answer:
          'The free plan includes 2 templates. Pro (4 of 5) and Unlimited (all 5 + future releases) unlock the full library.',
      },
      {
        question: 'Are these templates ATS-friendly?',
        answer:
          'Yes. All 5 Tailorvance resume templates are designed with clean formatting and ATS-compatible structures that pass 90%+ of ATS scanners.',
      },
    ],
  },
  {
    path: '/pricing',
    title: 'Resume Builder Pricing | Affordable Resume & ATS Tools',
    h1: 'Resume Builder Pricing — Start Free, Upgrade When Applying',
    description:
      'Tailorvance pricing built for Nigerian job seekers. Start with 3 free tailored resumes, then upgrade to Pro or Unlimited for more resumes, templates, and AI features.',
    primaryKeyword: 'resume builder pricing',
    h2s: [
      '3 Free Resumes — No Card Required',
      'Pro Plan: 30 Resumes/Month + All Templates',
      'Unlimited: Everything Forever',
    ],
    benefits: [
      'No credit card required to start',
      'Paystack secure payments (card, bank transfer, USSD)',
      'Cancel anytime',
      '30-day money-back guarantee',
    ],
    steps: [
      {
        title: 'Start for free',
        description:
          'Sign up and build 3 tailored resumes per week with no payment required.',
      },
      {
        title: 'Upgrade when ready',
        description:
          'Upgrade to Pro (₦3,500/month) or Unlimited (₦6,500/month) for more resumes and features.',
      },
      {
        title: 'Apply with confidence',
        description:
          'Use all Tailorvance tools to tailor your resume and land more interviews.',
      },
    ],
    faqs: [
      {
        question: 'Do I need a credit card to start?',
        answer:
          'No. Tailorvance is free to start — get 3 tailored resumes per week with no card required. Upgrade to Pro or Unlimited only when you are applying seriously.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept Paystack — debit cards, bank transfer, and USSD. All payments are secure and encrypted.',
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

const relatedLinksMap: Record<string, Array<{ href: string; label: string }>> = {
  '/resume-builder': [
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
    { href: '/resume-templates', label: 'Resume Templates' },
    { href: '/cover-letter-generator', label: 'Cover Letter Generator' },
  ],
  '/resume-tailoring': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-optimizer', label: 'Resume Optimizer' },
    { href: '/resume-keyword-optimizer', label: 'Resume Keyword Optimizer' },
  ],
  '/ats-resume-builder': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-checker', label: 'ATS Resume Checker' },
    { href: '/resume-optimizer', label: 'Resume Optimizer' },
    { href: '/resume-keyword-optimizer', label: 'Resume Keyword Optimizer' },
  ],
  '/ats-resume-checker': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-optimizer', label: 'Resume Optimizer' },
    { href: '/resume-keyword-optimizer', label: 'Resume Keyword Optimizer' },
  ],
  '/ai-resume-builder': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
    { href: '/cv-builder', label: 'CV Builder' },
  ],
  '/resume-optimizer': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
    { href: '/resume-keyword-optimizer', label: 'Resume Keyword Optimizer' },
  ],
  '/resume-keyword-optimizer': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-optimizer', label: 'Resume Optimizer' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
  ],
  '/resume-tailoring-tool': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
    { href: '/resume-optimizer', label: 'Resume Optimizer' },
  ],
  '/cover-letter-generator': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
    { href: '/linkedin-profile-optimization', label: 'LinkedIn Optimization' },
  ],
  '/linkedin-profile-optimization': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/cover-letter-generator', label: 'Cover Letter Generator' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
  ],
  '/resume-templates': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/cv-builder', label: 'CV Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-optimizer', label: 'Resume Optimizer' },
  ],
  '/cv-builder': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
    { href: '/resume-templates', label: 'Resume Templates' },
  ],
  '/job-description-matcher': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Builder' },
    { href: '/resume-keyword-optimizer', label: 'Resume Keyword Optimizer' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
  ],
  '/pricing': [
    { href: '/resume-builder', label: 'Resume Builder' },
    { href: '/ats-resume-builder', label: 'ATS Resume Checker' },
    { href: '/resume-tailoring', label: 'Resume Tailoring Tool' },
    { href: '/cover-letter-generator', label: 'Cover Letter Generator' },
  ],
}

export function getRelatedLinks(path: string): Array<{ href: string; label: string }> {
  return relatedLinksMap[path] ?? []
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

