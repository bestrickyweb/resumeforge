with open("app/actions/roast.ts", "r", encoding="utf-8", errors="replace") as f:
    content = f.read()
content = content.replace(
    "experimental_output: z.object({ fixedCv: z.string() }).object(),",
    "experimental_output: Output.object({ schema: z.object({ fixedCv: z.string() }) }),"
)
with open("app/actions/roast.ts", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed roast.ts")