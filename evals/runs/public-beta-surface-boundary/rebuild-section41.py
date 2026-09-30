import json, re, sys
KEYS = [k for k in json.load(open('evals/results.json'))['runs'].keys()]
doc = open('docs/eval-report-2026-09.md').read()
# parse existing rows id->family (authoritative from last rebuild)
rows = dict(re.findall(r'^\| \d+ \| `([a-z0-9-]+)` \| ([^|]+) \|$', doc, re.M))
FAMILY = dict(rows)
FAMILY['public-beta-surface-boundary'] = '发布边界纪律'
missing = [k for k in KEYS if k not in FAMILY]
assert not missing, f'unmapped families: {missing}'
assert len(KEYS) == len(FAMILY) >= 56, f'count mismatch: keys={len(KEYS)} family={len(FAMILY)}'
new_rows = '\n'.join(f'| {i+1} | `{k}` | {FAMILY[k]} |' for i, k in enumerate(KEYS))
# replace table body (rows) between header and next non-row line
pat = re.compile(r'(\| # \| 场景 \| 族群 \|\n\| --- \| --- \| --- \|\n)(?:\| \d+ \| `[a-z0-9-]+` \| [^|]+ \|\n)+')
doc2, n = pat.subn(lambda m: m.group(1) + new_rows + '\n', doc)
assert n == 1, f'table subn={n}'
doc2 = doc2.replace('已执行 55 条逐条清单', '已执行 56 条逐条清单')
old_sum = re.search(r'族群汇总：([^\n]+)\n', doc2).group(1)
assert old_sum.count('各 **1**') >= 1
doc2 = doc2.replace('知识库纳新效能前置 各 **1**。', '知识库纳新效能前置 / 发布边界纪律 各 **1**。')
doc2 = doc2.replace('**55/71（77%）**', '**56/71（79%）**')
doc2 = doc2.replace('剩余 20 条', '剩余 15 条')
open('docs/eval-report-2026-09.md', 'w').write(doc2)
print(f'rebuilt: {len(KEYS)} rows; family count unique={len(set(FAMILY.values()))}')
