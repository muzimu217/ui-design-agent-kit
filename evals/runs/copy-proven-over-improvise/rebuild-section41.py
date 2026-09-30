import json, re
KEYS = [k for k in json.load(open('evals/results.json'))['runs'].keys()]
doc = open('docs/eval-report-2026-09.md').read()
rows = dict(re.findall(r'^\| \d+ \| `([a-z0-9-]+)` \| ([^|]+) \|$', doc, re.M))
FAMILY = dict(rows)
FAMILY['copy-proven-over-improvise'] = '抄 proven 纪律'
missing = [k for k in KEYS if k not in FAMILY]
assert not missing, f'unmapped: {missing}'
assert len(KEYS) == len(FAMILY) >= 64
new_rows = '\n'.join(f'| {i+1} | `{k}` | {FAMILY[k]} |' for i, k in enumerate(KEYS))
pat = re.compile(r'(\| # \| 场景 \| 族群 \|\n\| --- \| --- \| --- \|\n)(?:\| \d+ \| `[a-z0-9-]+` \| [^|]+ \|\n)+')
doc2, n = pat.subn(lambda m: m.group(1) + new_rows + '\n', doc)
assert n == 1
doc2 = doc2.replace('已执行 63 条逐条清单', '已执行 64 条逐条清单')
doc2 = doc2.replace('品味档案更新纪律 / 夹具反豁免纪律 各 **1**。', '品味档案更新纪律 / 夹具反豁免纪律 / 抄 proven 纪律 各 **1**。')
doc2, n2 = re.subn(r'\*\*63/71（8\d%）\*\*', '**64/71（90%）**', doc2)
assert n2 == 1
doc2, n3 = re.subn(r'剩余 \d+ 条', '剩余 7 条', doc2)
assert n3 >= 1
open('docs/eval-report-2026-09.md', 'w').write(doc2)
print(f'rebuilt {len(KEYS)} rows')
