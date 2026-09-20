with open("components/dashboard/roast-view.tsx", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# Fix the type check - replace "res.ok && !res.error" with just "res.ok"
content = content.replace(
    "if (res.ok && !res.error) {",
    "if (res.ok) {"
)
with open("components/dashboard/roast-view.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed roast-view.tsx")