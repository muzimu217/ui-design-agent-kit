import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion, type Transition } from 'motion/react';
import { ArrowLeft, ArrowRight, AudioLines, Check, CheckCheck, ChevronDown, CircleCheck, Clock3, Coffee, Focus, HardDrive, LayoutDashboard, ListTodo, Pause, Pencil, Play, Plus, RotateCcw, Sparkles, Sunrise, Trash2, X } from 'lucide-react';
import { createInitialState, formatTime, kindLabels, parseSavedState, pauseSession, remainingSeconds, startSession, STORAGE_KEY, type DayState, type Task, type TaskKind } from './model';

const snappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 } satisfies Transition;
const dateFormat = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
type Notice = { id: number; message: string; undo?: () => void };
type EditorState = { task: Task | null } | null;

function App() {
  const [state, setState] = useState<DayState>(() => {
    try { return parseSavedState(localStorage.getItem(STORAGE_KEY)) ?? createInitialState(); }
    catch { return createInitialState(); }
  });
  const [now, setNow] = useState(Date.now);
  const [view, setView] = useState<'day' | 'focus'>('day');
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [editor, setEditor] = useState<EditorState>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [storageError, setStorageError] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const transition: Transition = reduceMotion ? { duration: 0 } : snappy;
  const current = state.tasks.find(task => task.id === state.selectedId) ?? null;
  const running = state.session?.taskId === current?.id;
  const remaining = current ? remainingSeconds(current, state.session, now) : 0;
  const completed = state.tasks.filter(task => task.completed);
  const pending = state.tasks.filter(task => !task.completed);
  const allDone = state.tasks.length > 0 && pending.length === 0;
  const totalMinutes = state.tasks.reduce((sum, task) => sum + task.minutes, 0);
  const focusedSeconds = state.tasks.reduce((sum, task) => sum + (task.kind === 'break' ? 0 : task.minutes * 60 - remainingSeconds(task, state.session, now)), 0);
  const finishedMinutes = completed.reduce((sum, task) => sum + task.minutes, 0);
  const completionRatio = state.tasks.length ? completed.length / state.tasks.length : 0;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    const sync = () => setNow(Date.now());
    document.addEventListener('visibilitychange', sync);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', sync); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [state]);

  useEffect(() => {
    if (state.session && state.session.endAt <= now) {
      setState(previous => pauseSession(previous, Date.now()));
      setNotice({ id: Date.now(), message: '时间到。完成这一项，或再专注 5 分钟。' });
    }
  }, [state.session, now]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 7000);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => { document.title = running && current ? `${formatTime(remaining)} · ${current.title} · Tempo` : 'Tempo Day · 今日节奏'; }, [running, current, remaining]);

  function selectTask(id: string) {
    setNow(Date.now());
    setState(previous => ({ ...pauseSession(previous, Date.now()), selectedId: id }));
  }

  function toggleTimer() {
    if (!current) return;
    const timestamp = Date.now();
    setNow(timestamp);
    setState(previous => previous.session ? pauseSession(previous, timestamp) : startSession(previous, current.id, timestamp));
  }

  function finishTask() {
    if (!current || current.completed) return;
    const timestamp = Date.now();
    const id = current.id;
    setState(previous => {
      const paused = pauseSession(previous, timestamp);
      const nextTask = paused.tasks.find(task => task.id !== id && !task.completed);
      return { ...paused, tasks: paused.tasks.map(task => task.id === id ? { ...task, completed: true } : task), selectedId: nextTask?.id ?? id };
    });
    setNotice({ id: timestamp, message: `已完成「${current.title}」`, undo: () => {
      setState(previous => ({ ...pauseSession(previous, Date.now()), tasks: previous.tasks.map(task => task.id === id ? { ...task, completed: false } : task), selectedId: id }));
    } });
  }

  function reopenTask(id: string) {
    setState(previous => ({ ...pauseSession(previous, Date.now()), tasks: previous.tasks.map(task => task.id === id ? { ...task, completed: false } : task), selectedId: id }));
  }

  function removeTask(task: Task) {
    const timestamp = Date.now();
    const savedTask = { ...task, remaining: remainingSeconds(task, state.session, timestamp) };
    const index = state.tasks.findIndex(item => item.id === task.id);
    setState(previous => {
      const paused = pauseSession(previous, timestamp);
      const tasks = paused.tasks.filter(item => item.id !== task.id);
      return { ...paused, tasks, selectedId: previous.selectedId === task.id ? tasks.find(item => !item.completed)?.id ?? tasks[0]?.id ?? null : previous.selectedId };
    });
    setNotice({ id: timestamp, message: `已移除「${task.title}」`, undo: () => {
      setState(previous => {
        if (previous.tasks.some(item => item.id === savedTask.id)) return previous;
        const tasks = [...previous.tasks];
        tasks.splice(Math.min(index, tasks.length), 0, savedTask);
        return { ...previous, tasks, selectedId: previous.selectedId ?? savedTask.id };
      });
    } });
  }

  function openEditor(task: Task | null = null) {
    if (task && state.session?.taskId === task.id) setState(previous => pauseSession(previous, Date.now()));
    setEditor({ task: task ? { ...task, remaining: remainingSeconds(task, state.session, Date.now()) } : null });
  }

  function saveTask(values: Pick<Task, 'title' | 'note' | 'kind' | 'minutes'>) {
    const existing = editor?.task;
    const newId = crypto.randomUUID();
    setState(previous => {
      if (existing) {
        return { ...previous, tasks: previous.tasks.map(task => {
          if (task.id !== existing.id) return task;
          const spent = task.minutes * 60 - task.remaining;
          return { ...task, ...values, remaining: Math.max(0, values.minutes * 60 - spent) };
        }) };
      }
      const task: Task = { ...values, id: newId, completed: false, remaining: values.minutes * 60 };
      return { ...previous, tasks: [...previous.tasks, task], selectedId: previous.selectedId ?? newId };
    });
    setFilter('all');
    setNotice({ id: Date.now(), message: existing ? '任务已更新' : '新任务已加入今日节奏' });
    setEditor(null);
  }

  function addFiveMinutes() {
    if (!current) return;
    setState(previous => ({ ...previous, tasks: previous.tasks.map(task => task.id === current.id ? { ...task, minutes: task.minutes + 5, remaining: 300 } : task) }));
  }

  const visibleTasks = state.tasks.filter(task => filter === 'all' || (filter === 'done' ? task.completed : !task.completed));

  return <MotionConfig reducedMotion="user" transition={transition}>
    <div className={`app ${view === 'focus' ? 'is-focus-view' : ''}`} data-motion={reduceMotion ? 'reduced' : 'normal'}>
      <a href="#current-session" className="skip-link">跳到当前任务</a>
      <header className="app-header">
        <a className="brand" href="#" aria-label="Tempo Day 首页" onClick={event => { event.preventDefault(); setView('day'); }}>
          <span className="brand-mark"><AudioLines size={23} strokeWidth={2.4} /></span>
          <span>Tempo<span className="brand-day">Day</span></span>
        </a>
        <span className="header-date"><Sunrise size={18} />{dateFormat.format(now)}</span>
        <span className={`save-state ${storageError ? 'is-error' : ''}`}><HardDrive size={15} />{storageError ? '本机保存不可用' : '已保存到本机'}</span>
      </header>

      <main className="workspace">
        <div className="workspace-heading">
          <div><h1>{view === 'focus' ? '此刻，只做一件事。' : '今日节奏'}</h1><p className="heading-detail">{pending.length ? `${pending.length} 项待办 · ${totalMinutes} 分钟计划` : state.tasks.length ? '今天的计划，已全部完成' : '今天，还有新的可能'}</p></div>
          <LayoutGroup id="view-mode">
            <div className="view-switch" role="group" aria-label="工作视图">
              {([['day', '工作台', LayoutDashboard], ['focus', '专注', Focus]] as const).map(([id, label, Icon]) => <button key={id} aria-pressed={view === id} onClick={() => setView(id)} className={view === id ? 'selected' : ''}>
                {view === id && <motion.span className="view-indicator" layoutId={reduceMotion ? undefined : 'view'} transition={transition} />}
                <Icon size={17} /><span>{label}</span>
              </button>)}
            </div>
          </LayoutGroup>
        </div>

        {storageError && <p className="storage-warning" role="alert">浏览器未能保存这次更改。当前页面仍可使用，刷新前请保留你的任务内容。</p>}

        {view === 'day' && state.tasks.length > 0 && <section className="day-map" aria-label="今日计划时间分布">
          <div className="day-map-label"><span>今天的时间</span><span>{finishedMinutes} / {totalMinutes} 分钟计划已完成</span></div>
          <div className="time-blocks">
            {state.tasks.map(task => <button key={task.id} onClick={() => selectTask(task.id)} aria-label={`${task.title}，${task.minutes} 分钟${task.completed ? '，已完成' : ''}`} className={`time-block ${task.kind} ${task.completed ? 'is-done' : ''} ${current?.id === task.id ? 'is-active' : ''}`} style={{ flexGrow: task.minutes }} title={task.title}>
              {task.completed ? <Check size={14} /> : task.kind === 'break' ? <Coffee size={14} /> : <span className="block-dot" />}
              <span>{task.minutes}<span className="minute-unit"> 分钟</span></span>
            </button>)}
          </div>
          <div className="map-legend"><span><i className="legend-dot focus" />深度工作</span><span><i className="legend-dot admin" />日常事务</span><span><i className="legend-dot break" />休息片刻</span></div>
        </section>}

        <div className="work-grid">
          {view === 'day' && <section className="queue" aria-labelledby="queue-title">
            <div className="section-heading"><h2 id="queue-title">任务队列 <span>{state.tasks.length}</span></h2><button className="icon-button add-task-button" aria-label="新增任务" title="新增任务" onClick={() => openEditor()}><Plus size={20} /></button></div>
            <div className="task-filter" role="group" aria-label="筛选任务">
              {([['all', '全部'], ['pending', '待办'], ['done', '已完成']] as const).map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}{id === 'done' && completed.length > 0 && <span>{completed.length}</span>}</button>)}
            </div>
            {state.tasks.some(task => task.id.startsWith('sample-')) && <p className="sample-label">示例计划</p>}
            <motion.ul className="task-list" layout={!reduceMotion}>
              <AnimatePresence initial={false} mode="popLayout">
                {visibleTasks.map(task => <motion.li key={task.id} layout={!reduceMotion} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }} className={`task-row ${current?.id === task.id ? 'is-selected' : ''} ${task.completed ? 'is-complete' : ''}`}>
                  <button className="task-select" onClick={() => selectTask(task.id)} aria-pressed={current?.id === task.id}>
                    <span className={`task-status ${task.kind}`}>{task.completed ? <Check size={16} /> : state.session?.taskId === task.id ? <AudioLines size={16} /> : task.kind === 'break' ? <Coffee size={16} /> : <span className="task-unchecked" />}</span>
                    <span className="task-copy"><strong>{task.title}</strong><span>{kindLabels[task.kind]}<i />{task.minutes} 分钟{state.session?.taskId === task.id ? ' · 进行中' : ''}</span></span>
                  </button>
                  <button className="task-edit icon-button" title={`编辑${task.title}`} aria-label={`编辑${task.title}`} onClick={() => openEditor(task)}><Pencil size={15} /></button>
                </motion.li>)}
              </AnimatePresence>
            </motion.ul>
            {visibleTasks.length === 0 && <div className="queue-empty"><ListTodo size={25} /><p>{filter === 'done' ? '还没有已完成的任务' : filter === 'pending' ? '没有待办任务了' : '任务队列还是空的'}</p></div>}
            <button className="add-task-inline" onClick={() => openEditor()}><Plus size={17} />添加一项任务</button>
            <div className="queue-footer"><Clock3 size={15} /><span>{pending.reduce((sum, task) => sum + Math.ceil(remainingSeconds(task, state.session, now) / 60), 0)} 分钟待安排</span></div>
          </section>}

          <section id="current-session" className="session-region" aria-labelledby="session-title" tabIndex={-1}>
            <div className="session-topline"><h2 id="session-title">{allDone ? '今日已完成' : '当前任务'}</h2><span className={`session-status ${running ? 'running' : ''}`}><span />{allDone ? '收工' : running ? '专注中' : current?.completed ? '已完成' : current && remaining === 0 ? '时间到' : current && remaining < current.minutes * 60 ? '已暂停' : '准备开始'}</span></div>
            <div className={`session-tool ${allDone ? 'all-done' : ''}`}>
              {allDone ? <div className="complete-state"><span className="completion-symbol"><CheckCheck size={34} /></span><h3>今天，做得刚刚好。</h3><p>{completed.length} 项计划已完成</p><div className="completed-strip">{completed.map(task => <span key={task.id} title={task.title}><Check size={16} /></span>)}</div><button className="primary-button" onClick={() => openEditor()}><Plus size={18} />添加下一项</button></div> : !current ? <div className="complete-state empty-state"><span className="completion-symbol"><Sunrise size={34} /></span><h3>从一件事开始。</h3><p>今天最想完成什么？</p><button className="primary-button" onClick={() => openEditor()}><Plus size={18} />添加第一项任务</button></div> : <>
                <div className="current-copy-wrap"><AnimatePresence initial={false} mode="popLayout"><motion.div className="current-copy" key={current.id} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}><span className={`kind-tag ${current.kind}`}>{current.kind === 'break' ? <Coffee size={14} /> : current.kind === 'focus' ? <Focus size={14} /> : <ListTodo size={14} />}{kindLabels[current.kind]}</span><h3>{current.title}</h3><p>{current.note || `${current.minutes} 分钟，留给这件事。`}</p></motion.div></AnimatePresence></div>
                <div className="timer-area"><span className="timer" role="timer" aria-label={`剩余 ${Math.floor(remaining / 60)} 分 ${remaining % 60} 秒`}>{formatTime(remaining)}</span><span className="timer-caption">{current.completed ? '这项任务已完成' : remaining === 0 ? '这个节奏，已经走完' : '剩余时间'}</span></div>
                <div className="session-track" role="progressbar" aria-label="当前任务时间进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((1 - remaining / (current.minutes * 60)) * 100)}><motion.div initial={false} animate={{ scaleX: 1 - remaining / (current.minutes * 60) }} style={{ transformOrigin: 'left' }} transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }} /></div>
                <div className="session-controls">
                  {current.completed ? <button className="primary-button" onClick={() => reopenTask(current.id)}><RotateCcw size={18} />重新打开任务</button> : remaining === 0 ? <><motion.button whileTap={reduceMotion ? undefined : { scale: 0.98 }} className="primary-button" onClick={finishTask}><Check size={20} />完成任务</motion.button><button className="secondary-button" disabled={current.minutes > 175} onClick={addFiveMinutes}><Plus size={18} />5 分钟</button></> : <><motion.button whileTap={reduceMotion ? undefined : { scale: 0.98 }} className={`primary-button ${running ? 'pause-button' : ''}`} onClick={toggleTimer}>{running ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}{running ? '暂停' : remaining < current.minutes * 60 ? '继续专注' : '开始专注'}</motion.button><motion.button whileTap={reduceMotion ? undefined : { scale: 0.98 }} className="secondary-button" onClick={finishTask}><Check size={19} />完成</motion.button></>}
                </div>
                <div className="session-bottom"><span><Clock3 size={15} />本次 {current.minutes} 分钟</span><button onClick={() => openEditor(current)}><Pencil size={14} />编辑任务</button></div>
              </>}
            </div>
            {view === 'focus' ? <button className="back-to-day" onClick={() => setView('day')}><ArrowLeft size={17} />回到今日工作台</button> : pending.length > 1 && <div className="up-next"><span>接下来</span><button onClick={() => selectTask(pending.find(task => task.id !== current?.id)!.id)}><strong>{pending.find(task => task.id !== current?.id)?.title}</strong><ArrowRight size={17} /></button></div>}
          </section>

          {view === 'day' && <aside className="day-summary" aria-labelledby="summary-title">
            <h2 id="summary-title">今日概览</h2>
            <div className="summary-metric"><span className="metric-label"><CircleCheck size={17} />已完成</span><p><strong>{completed.length}</strong><span>/ {state.tasks.length} 项</span></p><div className="summary-progress" role="progressbar" aria-label="今日任务完成进度" aria-valuemin={0} aria-valuemax={state.tasks.length || 1} aria-valuenow={completed.length}><motion.span initial={false} animate={{ scaleX: completionRatio }} style={{ transformOrigin: 'left' }} /></div></div>
            <div className="summary-metric"><span className="metric-label"><Focus size={17} />实际专注</span><p><strong>{Math.floor(focusedSeconds / 60)}</strong><span>分钟</span></p></div>
            <div className="summary-metric"><span className="metric-label"><Coffee size={17} />计划休息</span><p><strong>{state.tasks.filter(task => task.kind === 'break').reduce((sum, task) => sum + task.minutes, 0)}</strong><span>分钟</span></p></div>
            <div className="summary-note"><Sparkles size={20} /><p>{allDone ? '把这一刻，留给自己。' : completed.length ? '一步一步，正在向前。' : '专注于过程，进度自然发生。'}</p></div>
          </aside>}
        </div>
        <footer className="workspace-footer"><span>Tempo Day</span><span>你的时间，你的节奏。</span></footer>
      </main>

      {editor && <TaskEditor task={editor.task} onSave={saveTask} onClose={() => setEditor(null)} onDelete={task => { removeTask(task); setEditor(null); }} />}

      <AnimatePresence>{notice && <motion.div key={notice.id} className="toast" role="status" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}><CircleCheck size={18} /><span>{notice.message}</span>{notice.undo && <button onClick={() => { notice.undo?.(); setNotice(null); }}>撤销</button>}<button className="toast-close" aria-label="关闭通知" onClick={() => setNotice(null)}><X size={16} /></button></motion.div>}</AnimatePresence>
    </div>
  </MotionConfig>;
}

function TaskEditor({ task, onSave, onClose, onDelete }: { task: Task | null; onSave: (values: Pick<Task, 'title' | 'note' | 'kind' | 'minutes'>) => void; onClose: () => void; onDelete: (task: Task) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(task?.title ?? '');
  const [note, setNote] = useState(task?.note ?? '');
  const [minutes, setMinutes] = useState(String(task?.minutes ?? 25));
  const [kind, setKind] = useState<TaskKind>(task?.kind ?? 'focus');
  const [errors, setErrors] = useState<{ title?: string; minutes?: string }>({});
  useEffect(() => { const dialog = dialogRef.current; dialog?.showModal(); titleRef.current?.focus(); return () => dialog?.close(); }, []);
  const close = () => { dialogRef.current?.close(); onClose(); };
  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = '请输入任务名称。';
    if (!Number.isInteger(Number(minutes)) || Number(minutes) < 1 || Number(minutes) > 180) nextErrors.minutes = '时长需要是 1–180 之间的整数。';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { if (nextErrors.title) titleRef.current?.focus(); return; }
    dialogRef.current?.close();
    onSave({ title: title.trim(), note: note.trim(), minutes: Number(minutes), kind });
  }
  return <dialog ref={dialogRef} className="task-dialog" aria-labelledby="editor-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } }}>
    <form onSubmit={submit} noValidate>
      <div className="dialog-heading"><h2 id="editor-title">{task ? '编辑任务' : '添加任务'}</h2><button className="icon-button" type="button" aria-label="关闭编辑" onClick={close}><X size={20} /></button></div>
      <div className="field"><label htmlFor="task-title">任务名称</label><input ref={titleRef} id="task-title" value={title} onChange={event => setTitle(event.target.value)} maxLength={100} placeholder="例如：完成网站首页提案" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />{errors.title && <p id="title-error" className="field-error">{errors.title}</p>}</div>
      <div className="editor-row"><div className="field"><label htmlFor="task-kind">任务类型</label><div className="select-wrap"><select id="task-kind" value={kind} onChange={event => setKind(event.target.value as TaskKind)}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={16} /></div></div><div className="field"><label htmlFor="task-minutes">预计时长（分钟）</label><input id="task-minutes" type="number" min="1" max="180" step="1" value={minutes} onChange={event => setMinutes(event.target.value)} aria-invalid={!!errors.minutes} aria-describedby={errors.minutes ? 'minutes-error' : undefined} />{errors.minutes && <p id="minutes-error" className="field-error">{errors.minutes}</p>}</div></div>
      <div className="field"><label htmlFor="task-note">备注 <span>选填</span></label><textarea id="task-note" rows={3} maxLength={300} value={note} onChange={event => setNote(event.target.value)} placeholder="这次想推进到哪里？" /></div>
      <div className="dialog-actions">{task && <button className="delete-button" type="button" onClick={() => { dialogRef.current?.close(); onDelete(task); }}><Trash2 size={17} />删除</button>}<div><button className="secondary-button" type="button" onClick={close}>取消</button><button className="primary-button" type="submit"><Check size={17} />{task ? '保存更改' : '添加任务'}</button></div></div>
    </form>
  </dialog>;
}

export default App;
