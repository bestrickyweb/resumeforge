const SELECTORS = {
  linkedin: {
    title: ".top-card-layout__title, .job-title, h1[data-automation-id=\"jobTitle\"]",
    company: ".top-card-layout__company, .job-company, a[data-automation-id=\"jobCompany\"]",
    location: ".top-card-layout__location, .job-location, [data-automation-id=\"jobLocation\"]",
    description: ".description__text, .jobs-description__content, [data-automation-id=\"jobDescription\"]",
  },
  indeed: {
    title: "[data-testid=\"jobsearch-JobInfoHeader-title\"], .jobsearch-JobInfoHeader-title, h1.icl-u-xs-mb--xs",
    company: "[data-testid=\"inlineHeader-companyName\"], .jobsearch-CompanyInfoContainer a, .icl-u-lg-mr--sm",
    location: "[data-testid=\"inlineHeader-companyLocation\"], .jobsearch-JobInfoHeader-location",
    description: "#jobDescriptionText, .jobsearch-jobDescriptionText",
  },
  glassdoor: {
    title: "[data-test=\"job-title\"], .JobDetails_jobTitle__Rw_gn",
    company: "[data-test=\"employer-name\"], .JobDetails_employerName__13q2H",
    location: "[data-test=\"location\"], .JobDetails_location__mS_24",
    description: "[data-test=\"job-description\"], .JobDetails_jobDescription__uW_fK",
  },
  greenhouse: {
    title: ".app-title, h1#job-title",
    company: ".company-name, .app-company",
    location: ".location, .job-location",
    description: "#content, .job-description",
  },
  lever: {
    title: ".posting-headline h2, h1.posting-headline",
    company: ".posting-company, .company-name",
    location: ".posting-categories .location, .location",
    description: ".posting-description, .section.description",
  },
  workday: {
    title: "[data-automation-id=\"jobPostingHeader\"], h1[data-automation-id=\"jobTitle\"]",
    company: "[data-automation-id=\"companyName\"]",
    location: "[data-automation-id=\"locations\"]",
    description: "[data-automation-id=\"jobPostingDescription\"]",
  },
};

const GENERIC_SELECTORS = {
  title: "h1, [itemprop=\"title\"], .job-title, .position-title, .role-title",
  company: "[itemprop=\"hiringOrganization\"] [itemprop=\"name\"], .company, .employer, .organization",
  location: "[itemprop=\"jobLocation\"] [itemprop=\"address\"], [itemprop=\"addressLocality\"], .location, .job-location",
  description: "[itemprop=\"description\"], .job-description, .description, #job-description, .posting-description",
};

function getHostType() {
  const hostname = window.location.hostname;
  if (hostname.includes("linkedin.com")) return "linkedin";
  if (hostname.includes("indeed.com")) return "indeed";
  if (hostname.includes("glassdoor.com")) return "glassdoor";
  if (hostname.includes("greenhouse.io")) return "greenhouse";
  if (hostname.includes("lever.co")) return "lever";
  if (hostname.includes("workday.com") || hostname.includes("myworkdayjobs.com")) return "workday";
  return "generic";
}

function trySelectors(selectors, root = document) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return null;
}

function extractFromSchemaOrg() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] === "JobPosting" || (Array.isArray(item["@type"]) && item["@type"].includes("JobPosting"))) {
          return {
            title: item.title,
            company: item.hiringOrganization?.name,
            location: item.jobLocation?.address?.addressLocality || item.jobLocation?.address?.streetAddress,
            description: item.description,
            url: item.url || window.location.href,
          };
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  return null;
}

function extractJobData() {
  const hostType = getHostType();
  const specific = SELECTORS[hostType] || {};
  const generic = GENERIC_SELECTORS;

  const title = trySelectors([specific.title, generic.title].filter(Boolean));
  const company = trySelectors([specific.company, generic.company].filter(Boolean));
  const location = trySelectors([specific.location, generic.location].filter(Boolean));
  const description = trySelectors([specific.description, generic.description].filter(Boolean));

  const schemaData = extractFromSchemaOrg();

  return {
    title: title || schemaData?.title || "",
    company: company || schemaData?.company || "",
    location: location || schemaData?.location || "",
    description: description || schemaData?.description || "",
    url: schemaData?.url || window.location.href,
    source: hostType,
  };
}

function looksLikeJobPage() {
  const text = document.body.innerText.toLowerCase();
  const jobKeywords = ["job description", "requirements", "qualifications", "responsibilities", "apply now", "full-time", "part-time", "salary", "benefits", "experience"];
  const keywordCount = jobKeywords.filter(kw => text.includes(kw)).length;
  const hasTitle = document.querySelector("h1, [itemprop=\"title\"]");
  const hasSchemaOrg = document.querySelector('script[type="application/ld+json"]');
  return keywordCount >= 2 || hasTitle || hasSchemaOrg;
}

function createFloatingButton() {
  if (document.getElementById("ResumePrime-save-btn")) return;

  const btn = document.createElement("button");
  btn.id = "ResumePrime-save-btn";
  btn.textContent = "Save to ResumePrime";
  btn.setAttribute("aria-label", "Save this job to ResumePrime");
  document.body.appendChild(btn);

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Saving...";
    const jobData = extractJobData();

    if (!jobData.title || !jobData.company) {
      btn.disabled = false;
      btn.textContent = "Save to ResumePrime";
      alert("Could not extract job title and company. Please try from the extension popup.");
      return;
    }

    chrome.runtime.sendMessage({ type: "SAVE_JOB", data: jobData }, (response) => {
      if (response?.success) {
        btn.textContent = "Saved!";
        btn.style.background = "#059669";
        setTimeout(() => {
          btn.textContent = "Save to ResumePrime";
          btn.style.background = "";
          btn.disabled = false;
        }, 2000);
      } else {
        btn.disabled = false;
        btn.textContent = "Save to ResumePrime";
        alert(response?.error || "Failed to save job. Try from the extension popup.");
      }
    });
  });
}

function init() {
  if (looksLikeJobPage()) {
    createFloatingButton();
    chrome.runtime.sendMessage({ type: "JOB_DETECTED", url: window.location.href });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXTRACT_JOB") {
    const jobData = extractJobData();
    if (jobData.title && jobData.company) {
      sendResponse({ success: true, data: jobData });
    } else {
      sendResponse({ success: false, error: "Could not extract job title and company" });
    }
    return true;
  }
});

