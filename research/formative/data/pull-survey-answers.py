#!/usr/bin/env python3
"""增量拉取腾讯问卷回答并落盘到 research/formative/data/survey-<id>/。

遵循 data/README.md 的存储规范：原始件 verbatim、只增不改、按 answer_id 去重。
"""
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path

SURVEY_ID = 28072993
DATA_DIR = Path("/Users/blackevil/Documents/ChatGPT/ai/research/formative/data")
SDIR = DATA_DIR / f"survey-{SURVEY_ID}"
RAW = SDIR / "raw"
TRANS = DATA_DIR / "answers"          # 统一阅览区：Q-/E- 全部可读稿并置于此


def call(tool, args):
    r = subprocess.run(
        ["mcporter", "call", f"tencent-survey.{tool}", "--args", json.dumps(args, ensure_ascii=False)],
        capture_output=True, text=True,
    )
    out = r.stdout.strip()
    m = re.search(r"\{.*\}", out, re.S)
    if not m:
        raise RuntimeError(f"{tool} 返回无法解析: {out[:300]}")
    return json.loads(m.group(0))


def clean(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def duration(a, b):
    try:
        fmt = "%Y-%m-%d %H:%M:%S"
        d = datetime.strptime(b, fmt) - datetime.strptime(a, fmt)
        s = int(d.total_seconds())
        return f"{s // 60} 分 {s % 60} 秒"
    except Exception:
        return "未知"


def render_answer(q):
    opts = q.get("options")
    if opts:
        parts = []
        for o in opts:
            parts.append(clean(o.get("text")) if isinstance(o, dict) else str(o))
        return " / ".join([p for p in parts if p]) or "（空）"
    return clean(q.get("text")) or "（空）"


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    TRANS.mkdir(parents=True, exist_ok=True)

    # 1) 拉全部回答
    d = call("list_answers", {"survey_id": SURVEY_ID, "per_page": 100})
    items = d.get("list") or []
    total = d.get("total")
    print(f"接口 total={total}，本次拉到 {len(items)} 条")

    # 2) 读 manifest / 结构快照
    man_path = SDIR / "manifest.json"
    man = json.loads(man_path.read_text(encoding="utf-8")) if man_path.exists() else {
        "survey_id": SURVEY_ID, "channel": "Q = 腾讯问卷回收通道（真人自填）", "pulls": [], "answers": [],
    }
    landed = {a["answer_id"] for a in man.get("answers", [])}
    print("已落盘 answer_id:", sorted(landed))

    snap_path = RAW / f"survey-{SURVEY_ID}.json"
    snap = json.loads(snap_path.read_text(encoding="utf-8")) if snap_path.exists() else None
    qs = []
    if snap:
        for p in snap.get("pages", []):
            qs.extend(p.get("questions", []))
    qtitle = {q["id"]: clean(q.get("title")) for q in qs}
    order = [q["id"] for q in qs]

    # 3) 结构是否变了（题干被改过就要另存一份快照，不覆盖旧件）
    live = call("get_survey", {"survey_id": SURVEY_ID})
    live_qs = []
    for p in live.get("pages", []):
        live_qs.extend(p.get("questions", []))
    live_map = [(q["id"], clean(q.get("title"))) for q in live_qs]
    old_map = [(q["id"], qtitle.get(q["id"], "")) for q in qs]
    structure_changed = live_map != old_map

    now = datetime.now().astimezone()
    ts = now.strftime("%Y-%m-%dT%H:%M:%S%z")
    ts = ts[:-2] + ":" + ts[-2:] if len(ts) > 5 else ts

    if structure_changed:
        new_snap = RAW / f"survey-{SURVEY_ID}-{now.strftime('%Y%m%dT%H%M%S')}.json"
        new_snap.write_text(json.dumps(live, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"⚠️ 问卷结构已变，另存快照: {new_snap.name}")
        # 结构变化后以新结构为准渲染
        qs = live_qs
        qtitle = {q["id"]: clean(q.get("title")) for q in qs}
        order = [q["id"] for q in qs]
        snap_ref = new_snap.name
    else:
        snap_ref = snap_path.name

    # 4) 增量落盘
    next_idx = max([int(re.sub(r"\D", "", a["local_id"]) or 0) for a in man.get("answers", [])] or [0]) + 1
    added = []
    for it in items:
        aid = it.get("answer_id")
        if aid in landed:
            continue
        raw_file = RAW / f"answer-{aid}.json"
        raw_file.write_text(json.dumps(it, ensure_ascii=False, indent=2), encoding="utf-8")

        local_id = f"Q-{next_idx:02d}"
        next_idx += 1

        ans_page = (it.get("answer") or [{}])[0]
        ans_map = {q["id"]: q for q in (ans_page.get("questions") or [])}

        lines = [
            f"# {local_id} ｜ 腾讯问卷填写表回收（逐题稿）",
            "",
            f"> 来源通道：**Q = 腾讯问卷回收（真人自填，非合成）**。原文件 `raw/answer-{aid}.json`，本页仅为可读渲染，以原始 JSON 为准。",
            "",
            "## 会话元数据",
            "",
            "| 项 | 值 |",
            "| --- | --- |",
            f"| 本地编号 | `{local_id}` |",
            f"| answer_id | {aid} |",
            f"| 开始 / 结束 | {it.get('started_at')} / {it.get('ended_at')} |",
            f"| 时长 | {duration(it.get('started_at'), it.get('ended_at'))} |",
            f"| 地区（回收端记录） | {it.get('country') or ''} {it.get('province') or ''} {it.get('city') or ''} |".replace("  ", " "),
            f"| 题目版本 | `raw/{snap_ref}`（拉取于 {ts}） |",
            "| 录入方式 | 线上填写（无访谈者、无录音/屏幕录制） |",
            "| 类型 A/B | **待定**（A 前端 / B 非专家，按第 1 题自述判定） |",
            "| 实验池重叠核对 | 当前未知（P4 建池前） |",
            "",
            "## 逐题回答",
            "",
        ]
        for qid in order:
            if qid not in ans_map:
                continue
            num = qtitle.get(qid, "").split(".")[0] or "?"
            lines += [
                f"### 题 {num} ｜ `{qid}`",
                "",
                f"**问**：{qtitle.get(qid, '')}",
                "",
                f"**答**：{render_answer(ans_map[qid])}",
                "",
            ]
        missing = [qid for qid in order if qid not in ans_map]
        if missing:
            lines += ["## 未作答题目", ""]
            for qid in missing:
                lines += [f"- 题 {qtitle.get(qid, '').split('.')[0]}：{qtitle.get(qid, '')}"]
            lines += [""]
        tfile = TRANS / f"{local_id}.md"
        tfile.write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(f"新增 {local_id} (answer_id={aid}) → {raw_file.name}, {tfile.name}")

        added.append({
            "local_id": local_id,
            "answer_id": aid,
            "ended_at": it.get("ended_at"),
            "raw": f"raw/answer-{aid}.json",
            "transcript": f"answers/{local_id}.md",
        })

    # 5) 更新 manifest
    man["survey_id"] = SURVEY_ID
    man["title"] = clean(live.get("title"))
    man["url"] = f"https://wj.qq.com/s2/{SURVEY_ID}/{live.get('hash')}"
    man["state"] = live.get("state")
    man["answer_count_at_pull"] = live.get("answer_count")
    man.setdefault("pulls", []).append({
        "pulled_at": ts,
        "tool": "tencent-survey.list_answers",
        "per_page": 100,
        "total": total,
        "last_answer_id": d.get("last_answer_id"),
        "added": [a["local_id"] for a in added],
        "structure_changed": structure_changed,
    })
    man.setdefault("answers", []).extend(added)
    man["answers"].sort(key=lambda a: a["answer_id"])
    man_path.write_text(json.dumps(man, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print("---")
    print(f"本地累计已落盘: {len(man['answers'])} 份 →", [a['local_id'] for a in man['answers']])
    print(f"问卷 state={live.get('state')}, 服务端 answer_count={live.get('answer_count')}")
    print(f"目录: {SDIR}")


if __name__ == "__main__":
    main()
