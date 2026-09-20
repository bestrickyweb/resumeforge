# Fix referral-dialog.tsx - Replace Linkedin with Users
with open("components/dashboard/referral-dialog.tsx", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()
content = content.replace(
    "import { Copy, Check, Linkedin, Mail, Send, MessageSquare } from \"lucide-react\"",
    "import { Copy, Check, Users, Mail, Send, MessageSquare } from \"lucide-react\""
)
# Also check single quotes
content = content.replace(
    "import { Copy, Check, Linkedin, Mail, Send, MessageSquare } from 'lucide-react'",
    "import { Copy, Check, Users, Mail, Send, MessageSquare } from 'lucide-react'"
)
with open("components/dashboard/referral-dialog.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed referral-dialog.tsx")