import chardet
with open("app/actions/roast.ts", "rb") as f:
    raw = f.read()
result = chardet.detect(raw)
print("Detected encoding:", result)