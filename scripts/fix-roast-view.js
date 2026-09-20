const fs = require("fs");
const path = "components/dashboard/roast-view.tsx";
let content = fs.readFileSync(path, "utf8");
const insertion = "  const [isOpen, setIsOpen] = useState(true)\n  const handleOpenChange = (open: boolean) => {\n    setIsOpen(open)\n    onOpenChange?.(open)\n    if (open) setStep(\"upload\")\n  }\n";
content = content.replace(
  "  const [copying, setCopying] = useState(false)\n",
  "  const [copying, setCopying] = useState(false)\n" + insertion
);
fs.writeFileSync(path, content);
console.log("Fixed roast-view.tsx state");