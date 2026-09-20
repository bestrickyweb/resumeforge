const fs = require('fs');

// Update roast-view.tsx to accept open/onOpenChange props
const path = 'components/dashboard/roast-view.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add props to the export function signature
content = content.replace(
  "export function RoastView({ cvText, jobDescription }: { cvText?: string; jobDescription?: string }) {",
  `export function RoastView({
  cvText,
  jobDescription,
  open: controlledOpen,
  onOpenChange,
}: {
  cvText?: string
  jobDescription?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {`
);

// Add internal open state when not controlled
content = content.replace(
  "const [step, setStep] = useState<RoastStep>('upload');",
  `[open, setOpen] = controlledOpen !== undefined ? [controlledOpen, onOpenChange!] : useState(true),\n    const [internalOpen, setInternalOpen] = useState(true)\n    const isOpen = controlledOpen !== undefined ? open : internalOpen\n    const handleOpenChange = controlledOpen !== undefined ? onOpenChange! : setInternalOpen\n    const [step, setStep] = useState<RoastStep>('upload');`
);

// Replace Dialog's open/onOpenChange
content = content.replace(
  "<Dialog open={true} onOpenChange={() => {}}>",
  "<Dialog open={isOpen} onOpenChange={handleOpenChange}>"
);

// Replace the step='fix' handler to reset properly when closing
content = content.replace(
  "RefreshCw className=\"mr-2 h-4 w-4\" />\n                Roast again",
  "RefreshCw className=\"mr-2 h-4 w-4\" />\n                Roast again"
);

fs.writeFileSync(path, content);
console.log('roast-view.tsx updated');