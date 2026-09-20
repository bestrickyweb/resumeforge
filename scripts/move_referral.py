with open("components/dashboard/cv-detail.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Remove ReferralDialog from metrics grid
content = content.replace(
    "        <ReferralDialog cvText={cv.tailoredCv || cv.originalCv} jobDescription={cv.jobDescription || undefined} tailoredCvId={cv.id} />\n      </div>\n\n      <div className=\"mt-6\">",
    "      </div>\n\n      <div className=\"mt-6\":"
)

# Add ReferralDialog to the action bar (after Roast my CV button)
content = content.replace(
    '          <Button onClick={() => setRoastOpen(true)} variant="outline" size="sm">\n            <Sparkles className="mr-2 h-4 w-4" /> Roast my CV\n          </Button>\n',
    '          <Button onClick={() => setRoastOpen(true)} variant="outline" size="sm">\n            <Sparkles className="mr-2 h-4 w-4" /> Roast my CV\n          </Button>\n          <ReferralDialog cvText={cv.tailoredCv || cv.originalCv} jobDescription={cv.jobDescription || undefined} tailoredCvId={cv.id} />\n'
)

with open("components/dashboard/cv-detail.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("ReferralDialog moved to action bar")