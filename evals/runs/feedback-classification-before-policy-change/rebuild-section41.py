import json, re
KEYS = [k for k in json.load(open('evals/results.json'))['runs'].keys()]
doc = open('docs/eval-report-2026-09.md').read()
rows = dict(re.findall(r'^\| \d+ \| `([a-z0-9-]+)` \| ([^|]+) \|$', doc, re.M))
FAMILY = dict(rows)
FAMILY['feedback-classification-before-policy-change'] = '反馈分诊纪律'
missing = [k for k in KEYS if k not in FAMILY]
assert not missing, f'unmapped: {missing}'
assert len(KEYS) == len(FAMILY) >= 57
new_rows = '\n'.join(f'| {i+1} | `{k}` | {FAMILY[k]} |' for i, k in enumerate(KEYS))
pat = re.compile(r'(\| # \| 场景 \| 族群 \|\n\| --- \| --- \| --- \|\n)(?:\| \d+ \| `[a-z0-9-]+` \| [^|]+ \|\n)+')
doc2, n = pat.subn(lambda m: m.group(1) + new_rows + '\n', doc)
assert n == 1
doc2 = doc2.replace('已执行 56 条逐条清单', '已执行 57 条逐条清单')
doc2 = doc2.replace('知识库纳新效能前置 / 发布边界纪律 各 **1**。', '知识库纳新效能前置 / 发布边界纪律 / 反馈分诊纪律 各 **1**。')
doc2 = doc2.replace('**56/71（79%）**', '**57/71（80%）**')
doc2 = doc2.replace('剩余 15 条', '剩余 14 条')
open('docs/eval-report-2026-09.md', 'w').write(doc2)
print(f'rebuilt {len(KEYS)} rows')
