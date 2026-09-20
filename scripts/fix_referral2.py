with open("components/dashboard/referral-dialog.tsx", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()
content = content.replace("Linkedin", "Users")
with open("components/dashboard/referral-dialog.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed referral-dialog.tsx JSX")