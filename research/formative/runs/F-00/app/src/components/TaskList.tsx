import { useRef, useState, type KeyboardEvent } from 'react';
import type { Task } from '../lib/types';

export interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  focusToday: number;
  onAdd: (name: string, est: number) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onInspiration: () => void;
}

export function TaskList(props: TaskListProps) {
  const { tasks, activeTaskId, focusToday } = props;
  const [name, setName] = useState('');
  const [est, setEst] = useState(1);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    props.onAdd(trimmed, Math.min(24, Math.max(1, est || 1)));
    setName('');
    nameInputRef.current?.focus();
  };

  const onNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'Escape') {
      setName('');
      nameInputRef.current?.blur();
    }
  };

  return (
    <section className="task-card" aria-label="任务清单">
      <div className="task-head">
        <h2>任务</h2>
        <div className="meta">
          <button
            type="button"
            className="inspire-btn"
            onClick={props.onInspiration}
            title="把今日灵感任务加入列表"
          >
            ✦ 每日灵感
          </button>
          <span>{tasks.length} 项</span>
          <span className="today-chip" title="今日完成番茄数">
            今日 {focusToday} 番茄
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="empty-hint">还没有任务。按 T 或在下方输入框写下第一个专注目标。</p>
      ) : (
        <ul className="task-list">
          {tasks.map((t) => {
            const active = t.id === activeTaskId;
            return (
              <li
                key={t.id}
                className={`task-row${active ? ' task-row--active' : ''}${t.completed ? ' task-row--done' : ''}`}
              >
                <input
                  id={`task-check-${t.id}`}
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => props.onToggle(t.id)}
                  aria-label={`完成 ${t.name}`}
                />
                <label className="task-name" htmlFor={`task-check-${t.id}`}>
                  {t.name}
                </label>
                <button
                  type="button"
                  className="task-count"
                  aria-pressed={active}
                  aria-label={`设为当前任务：${t.name}，已完成 ${t.done}，计划 ${t.est} 番茄`}
                  onClick={() => props.onActivate(t.id)}
                >
                  {t.done}/{t.est}
                </button>
                <button
                  type="button"
                  className="task-del"
                  aria-label={`删除任务 ${t.name}`}
                  onClick={() => props.onDelete(t.id)}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="task-add">
        <input
          ref={nameInputRef}
          name="task-name"
          data-new-task=""
          type="text"
          value={name}
          placeholder="添加任务（按 T 聚焦，Enter 确认，Esc 取消）"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onNameKeyDown}
          maxLength={80}
        />
        <input
          name="task-est"
          type="number"
          min={1}
          max={24}
          value={est}
          onChange={(e) => setEst(Number(e.target.value))}
          aria-label="计划番茄数"
        />
        <button type="button" onClick={submit}>
          添加
        </button>
      </div>
    </section>
  );
}
