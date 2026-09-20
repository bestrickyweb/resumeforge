with open("components/dashboard/cv-detail.tsx", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# Replace Linkedin import with Users (using single quotes as in file)
content = content.replace(
    "import { Send, Linkedin } from 'lucide-react'",
    "import { Send, Users } from 'lucide-react'"
)

# Remove jobDescription from ReferralDialog usage (single quotes)
content = content.replace(
    "<ReferralDialog cvText={cv.tailoredCv || cv.originalCv} jobDescription={cv.jobDescription || undefined} tailoredCvId={cv.id} />",
    "<ReferralDialog cvText={cv.tailoredCv || cv.originalCv} tailoredCvId={cv.id} />"
)

# Remove jobDescription from RoastView usage
content = content.replace(
    "        jobDescription={cv.jobDescription || undefined}\n        open={roastOpen}",
    "        open={roastOpen}"
)

with open("components/dashboard/cv-detail.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed cv-detail.tsx")