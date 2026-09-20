import sys

with open('components/dashboard/cv-detail.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_import = "import { cn, interviewBand, bandBadgeClass, bandBarClass, bandLabel, type InterviewBand } from '@/lib/utils'\n"
new_imports = old_import + "import { Send, Linkedin } from 'lucide-react'\nimport { RoastView } from './roast-view'\nimport { ReferralDialog } from './referral-dialog'\n"
content = content.replace(old_import, new_imports)

old_state = 'const [coverageScore, setCoverageScore] = useState<number | null>(null)\n'
new_state = old_state + '  const [roastOpen, setRoastOpen] = useState(false)\n'
content = content.replace(old_state, new_state)

old_track = """          <Button onClick={() => setTrackOpen(true)} variant="outline" size="sm">
            <KanbanSquare className="mr-2 h-4 w-4" /> Track application
          </Button>
"""
new_track = old_track + """          <Button onClick={() => setRoastOpen(true)} variant="outline" size="sm">
            <Sparkles className="mr-2 h-4 w-4" /> Roast my CV
          </Button>
"""
content = content.replace(old_track, new_track)

old_ach = '      <Dialog open={achievementsOpen} onOpenChange={setAchievementsOpen}>'
new_ach = """      <RoastView
        cvText={cv.tailoredCv || cv.originalCv}
        jobDescription={cv.jobDescription || undefined}
        open={roastOpen}
        onOpenChange={setRoastOpen}
      />

      <Dialog open={achievementsOpen} onOpenChange={setAchievementsOpen}>"""
content = content.replace(old_ach, new_ach)

old_btn_close = """        </div>
      </div>

      <div className=\"mt-6\">"""
new_btn_close = """        </div>
        <ReferralDialog cvText={cv.tailoredCv || cv.originalCv} jobDescription={cv.jobDescription || undefined} tailoredCvId={cv.id} />
      </div>

      <div className=\"mt-6\">"""
content = content.replace(old_btn_close, new_btn_close)

with open('components/dashboard/cv-detail.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('cv-detail.tsx updated')