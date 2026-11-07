import os
import re

ROOT = r"E:/Work/Hackathons/learn ar with specs/lens/Assets/Scripts"
PAT = re.compile(r"requireAsset\(\s*[\"']([^\"']+)[\"']")
fails = []
count = 0
for root, _, files in os.walk(ROOT):
    for f in files:
        if not f.endswith(".ts"):
            continue
        ts = os.path.join(root, f)
        with open(ts, encoding="utf-8") as fh:
            src = fh.read()
        for m in PAT.finditer(src):
            count += 1
            target = os.path.normpath(os.path.join(os.path.dirname(ts), m.group(1)))
            if not os.path.exists(target):
                fails.append(f"{f}: {m.group(1)} MISSING")
print("\n".join(fails) if fails else f"All {count} requireAsset paths resolve.")
