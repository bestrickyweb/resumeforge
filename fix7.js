const fs = require("fs");

// Fix sprint-dashboard.tsx - pass weekNumber to CheckinModal
const dashPath = "C:\\Users\\Marvellous Ogunleke\\Desktop\\workspace\\resumeforge\\components\\dashboard\\sprint-dashboard.tsx";
let dash = fs.readFileSync(dashPath, "utf8");

// Update CheckinModal call to pass weekNumber
dash = dash.replace(
  "<CheckinModal\n        open={showCheckin}\n        onOpenChange={setShowCheckin}\n        sprintId={sprint.id}\n        milestones={milestones}\n        onSubmitted={handleCheckinSubmitted}\n      />",
  "<CheckinModal\n        open={showCheckin}\n        onOpenChange={setShowCheckin}\n        sprintId={sprint.id}\n        sprintStartDate={sprint.startDate}\n        currentWeek={currentWeek}\n        milestones={milestones}\n        onSubmitted={handleCheckinSubmitted}\n      />"
);

fs.writeFileSync(dashPath, dash);
console.log("sprint-dashboard.tsx updated");

// Fix checkin-modal.tsx - add sprintStartDate prop and use currentWeek
const modalPath = "C:\\Users\\Marvellous Ogunleke\\Desktop\\workspace\\resumeforge\\components\\dashboard\\checkin-modal.tsx";
let modal = fs.readFileSync(modalPath, "utf8");

// Update props
modal = modal.replace(
  `sprintId: number\n  milestones: any[]\n  onSubmitted: () => void`,
  `sprintId: number\n  sprintStartDate: string\n  currentWeek: number\n  milestones: any[]\n  onSubmitted: () => void`
);

// Remove sprintId from destructuring and add new props
modal = modal.replace(
  `sprintId,\n  milestones,\n  onSubmitted,`,
  `sprintId,\n  sprintStartDate,\n  currentWeek,\n  milestones,\n  onSubmitted,`
);

// Fix week number calculation
modal = modal.replace(
  /const weekNumber = Math\.max\(1, Math\.ceil\(\(Date\.now\(\) - sprintId \* 86400000\) \/ \(1000 \* 60 \* 60 \* 24 \* 7\)\) \|\| 1\)/,
  "const weekNumber = Math.max(1, currentWeek)"
);

fs.writeFileSync(modalPath, modal);
console.log("checkin-modal.tsx updated");
console.log("All fixes applied");
