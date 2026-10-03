# API_CONTRACT（接口契约草案）

> 数据单口：mock_data.json。业务工程师接手顺序=替换数据源 → 接接口 → 删 mock。

## 实体：items（库存条目列表）← GET /api/parts

| 字段 | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| items[].name | string | 备件名称 | "伺服电机 750W" |
| items[].code | string | 备件编号（唯一） | "SV-0750" |
| items[].qty | number | 现存数量（≤10 触发库存预警 pill） | 24 |

## 实体：stats（统计卡）← GET /api/parts/summary

| 字段 | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| stats.total | number | 备件种类总数 | 4 |
| stats.low | number | 库存预警条目数（qty≤10） | 2 |
| stats.ok | number | 状态正常条目数 | 2 |

## 渲染依赖

- 正常态/骨架态共用以上全部字段；骨架行数=items.length，骨架卡数=stats 键数。
- 错误态=mock_data.json 请求失败；空态=items 为空数组（后端返回 `{"items": [], "stats": {...}}` 即触发）。
