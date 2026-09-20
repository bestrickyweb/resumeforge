
const fs = require("fs");
const path = "components/dashboard/cv-detail.tsx";
let content = fs.readFileSync(path, "utf8");

const importAddition = "import { Send, Linkedin } from \"lucide-react\"\nimport { RoastView } from \"./roast-view\"\nimport { ReferralDialog } from \"./referral-dialog\"\n";
content = content.replace(
  "import { cn, interviewBand, bandBadgeClass, bandBarClass, bandLabel, type InterviewBand } from \x27@/lib/utils\x27\n",
  "import { cn, interviewBand, bandBadgeClass, bandBarClass, bandLabel, type InterviewBand } from \x27@/lib/utils\x27\n" + importAddition
);

content = content.replace(
  "const [coverageScore, setCoverageScore] = useState<number | null>(null)\n",
  "const [coverageScore, setCoverageScore] = useState<number | null>(null)\n  const [roastOpen, setRoastOpen] = useState(false)\n"
);

const roastButtonHtml = "          <Button onClick={() => setRoastOpen(true)} variant=\"outline\" size=\"sm\">\n            <Sparkles className=\"mr-2 h-4 w-4\" /> Roast my CV\n          </Button>\n";

// Find the Track application button and add Roast button after it
content = content.replace(
  /(<Button onClick=\{() => setTrackOpen\(true)\} variant="outline" size="sm">[\s\S]*?<\/Button>\n)/,
  "$1" + roastButtonHtml
);

// Add ReferralDialog after the button bar div
content = content.replace(
  /(          >\n            \{deleting \? \(.*?<\/Button>\n        <\/div>\n      <\/div>\n)/,
  "$1          <ReferralDialog cvText={cv.tailoredCv || cv.originalCv} jobDescription={cv.jobDescription || undefined} tailoredCvId={cv.id} />\n      </div>\n"
);

// Add RoastView before the achievements dialog
content = content.replace(
  /(      <Dialog open=\{achievementsOpen\} onOpenChange=\{setAchievementsOpen\})/,
  "      <RoastView\n        cvText={cv.tailoredCv || cv.originalCv}\n        jobDescription={cv.jobDescription || undefined}\n        open={roastOpen}\n        onOpenChange={setRoastOpen}\n      />\n\n$1"
);

fs.writeFileSync(path, content);
console.log("cv-detail.tsx updated");
