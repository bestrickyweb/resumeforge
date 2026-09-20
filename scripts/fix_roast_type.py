with open("app/actions/roast.ts", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()

# Add return type to roastCv
old_sig = "export async function roastCv(input: { cvText: string; jobDescription?: string }) {"
new_sig = """export type RoastResult = {
  ok: true
  score: number
  grade: string
  roastLines: { severity: string; category: string; quote: string; critique: string; fix: string }[]
  topFixes: string[]
  hiddenKiller?: string
  roastId: number
} | {
  ok: false
  error: string
}

export async function roastCv(input: { cvText: string; jobDescription?: string }): Promise<RoastResult> {"""
content = content.replace(old_sig, new_sig)
with open("app/actions/roast.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed roast.ts return type")