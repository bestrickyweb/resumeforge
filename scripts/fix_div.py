with open("components/dashboard/cv-detail.tsx", "r", encoding="utf-8") as f:
    content = f.read()
content = content.replace("<div className=\"mt-6\":", "<div className=\"mt-6\">")
with open("components/dashboard/cv-detail.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed div tag")