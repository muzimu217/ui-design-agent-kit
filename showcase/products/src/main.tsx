import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, MotionConfig, useInView, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Blocks, Check, CodeXml, Compass, Copy, FileText, FolderGit2, Gamepad2, Globe, Layers3, Maximize2, Monitor, NotebookPen, PackageCheck, PanelsTopLeft, Plug, ScanEye, Search, Settings2, Smartphone, Timer, Workflow, X } from 'lucide-react';
import desktop from '../../../demo/brick-workshop/screenshots/desktop.webp';
import mobile from '../../../demo/brick-workshop/screenshots/mobile.webp';
import house from '../../../demo/brick-workshop/screenshots/house.webp';
import rocket from '../../../demo/brick-workshop/screenshots/rocket.webp';
import castle from '../../../demo/brick-workshop/screenshots/castle.webp';
import inventory from '../media/inventory.webp';
import obsidian from '../media/obsidian.webp';
import blog from '../media/blog.webp';
import nodegrid from '../media/nodegrid.webp';
import subway from '../media/subway.webp';
import forma from '../media/forma.webp';
import tempo from '../media/tempo.webp';
import './styles.css';

const BASE = import.meta.env.BASE_URL;
const DEMO_URL = `${BASE}demos/brick-workshop/`;
const INVENTORY_URL = `${BASE}demos/inventory-console/`;
const NODEGRID_URL = `${BASE}demos/nodegrid/`;
const SUBWAY_URL = `${BASE}demos/subway-runner/`;
const FORMA_URL = `${BASE}demos/forma-phone-ui/`;
const TEMPO_URL = `${BASE}demos/tempo-day/`;
const PLAYABLE_URLS: Record<string, string> = { nodegrid: NODEGRID_URL, subway: SUBWAY_URL, forma: FORMA_URL, tempo: TEMPO_URL };
const REPOSITORY_URL = 'https://github.com/muzimu217/ui-design-agent-kit';
const SHOWCASE_REPOSITORY_URL = 'https://github.com/muzimu217/ui-design-agent-showcase';
const FEEDBACK_URL = 'https://github.com/muzimu217/ui-design-agent-showcase/issues/new/choose';
const RELEASE = import.meta.env.VITE_RELEASE_ID || 'local-preview';
const SNAPPY = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 } as const;
const ELEGANT = { type: 'spring', stiffness: 100, damping: 20, mass: 1 } as const;
const PROJECTS = [
  { id: 'inventory', name: '库存运营台', category: '运营工具', image: inventory, icon: Monitor, status: '可体验 demo', kind: '演示库存数据', alt: '库存运营台截图，包含演示数据提示、筛选控件与库存表格', description: '从既有工作流案例整理为在线体验，覆盖库存列表、筛选、排序与详情。所有库存都是演示数据，不连接真实业务系统。' },
  { id: 'obsidian', name: '曜石 X1', category: '产品展示', image: obsidian, icon: Smartphone, status: '历史截图', kind: '虚构产品', alt: '曜石 X1 虚构手机产品展示的历史截图', description: '虚构手机产品的展示案例。品牌、型号与规格均为演示设定，不构成真实产品或购买信息。' },
  { id: 'blog', name: '一舟札记', category: '内容站点', image: blog, icon: NotebookPen, status: '历史截图', kind: '虚构博客', alt: '一舟札记虚构个人博客的历史截图，包含作者介绍与文章入口', description: '以作者介绍与文章阅读为核心的内容站点案例。博客人物与内容为演示设定。' },
  { id: 'brick', name: '积木小工坊', category: '3D 交互', image: desktop, icon: Blocks, status: '可试玩 demo', kind: '浏览器交互', alt: '积木小工坊的 3D 搭建工作区和多彩积木盒', description: '本次发布包中的可试玩 3D 交互案例。实时作品与截图来自同一套工坊实现。' },
  { id: 'nodegrid', name: 'NODEGRID', category: '3D 交互', image: nodegrid, icon: Globe, status: '可试玩 demo', kind: '地理数据可视化', alt: 'NODEGRID 世界地图节点可视化首页，深色底与地球网络连线', description: '全球云节点网络的世界地图可视化。拖动、缩放查看 21 座城市的节点分布与演示延迟，节点详情包含机房演示配图与规格。' },
  { id: 'subway', name: '地铁疾行', category: '3D 交互', image: subway, icon: Gamepad2, status: '可试玩 demo', kind: '3D 跑酷游戏', alt: '地铁疾行 3D 跑酷游戏的第三人称追尾视角、跑道与障碍物', description: 'Three.js 实现的无尽跑酷。左右变道、跳跃回避障碍，支持桌面键盘与手机滑动，素材使用 Kenney CC0 开源资源。' },
  { id: 'forma', name: 'FORMA One', category: '产品展示', image: forma, icon: Smartphone, status: '可体验 demo', kind: '虚构手机配置页', alt: 'FORMA One 虚构手机的釉色与容量配置界面，钴蓝陶瓷机身渲染图', description: '虚构手机的釉色选购页。四种微晶陶瓷釉色与三档容量实时联动价格与规格，窑变视频与机身渲染均为演示设定，不产生真实订单。' },
  { id: 'tempo', name: 'Tempo 今日节奏', category: '效率工具', image: tempo, icon: Timer, status: '可体验 demo', kind: '当日任务与专注计时', alt: 'Tempo 今日节奏的工作台视图：时间分布条、任务队列与专注计时器', description: '当日计划与专注计时工具。任务按深度工作、日常事务、休息片刻分类，时间分布与专注计时实时联动，数据保存在本机浏览器。' },
] as const;
type Project = typeof PROJECTS[number];
const FILTERS = ['全部', '运营工具', '产品展示', '内容站点', '3D 交互', '效率工具'] as const;
type Filter = typeof FILTERS[number];
const STAGES = [
  { id: 'brief', name: '需求与方向', icon: Compass, summary: '确认用户、主要任务、页面范围与视觉方向。', output: '需求说明 / 方向记录', decision: '方向由用户确认', gate: true },
  { id: 'reference', name: '参考素材', icon: Search, summary: '选定可采用的参考、组件和素材，记录来源与使用边界。', output: '参考清单 / 来源记录', decision: '采用素材前确认', gate: true },
  { id: 'contract', name: '原型与契约', icon: PanelsTopLeft, summary: '确认原型，再固定布局、交互、动效与验收条件。', output: '原型 / 设计契约', decision: '原型与契约由用户确认', gate: true },
  { id: 'build', name: '交互实现', icon: CodeXml, summary: '围绕设计契约完成界面、状态与交互，复用项目既有能力。', output: '可运行界面 / 交互状态', decision: '按授权范围实现', gate: false },
  { id: 'verify', name: '浏览器验证', icon: ScanEye, summary: '检查桌面、手机、键盘、减少动态效果与主要操作流程。', output: '截图 / 交互检查 / 问题记录', decision: '修复问题后复核', gate: false },
  { id: 'deliver', name: '交付与迭代', icon: PackageCheck, summary: '交付成果与实际检查记录，明确尚未验证的部分。', output: '交付说明 / 已知限制', decision: '由用户确认接收', gate: true },
] as const;
const EVIDENCE = [
  { name: '指令已安装', icon: FileText, meaning: '相关技能与说明已存在，不代表运行结果。' },
  { name: '工具已配置', icon: Settings2, meaning: '连接配置有效，不等于服务已连接或调用成功。' },
  { name: '调用已验证', icon: Plug, meaning: '有具体工具调用及返回记录，不等于页面可用。' },
  { name: '页面已检查', icon: ScanEye, meaning: '有指定页面、设备尺寸与交互检查的浏览器证据。' },
] as const;
const SHOTS = [
  { id: 'desktop', label: '自由搭建', detail: '桌面工坊', src: desktop, alt: '积木小工坊的桌面工作区，左侧积木盒与中央彩顶房屋' },
  { id: 'house', label: '彩顶小屋', detail: '小挑战', src: house, alt: '完成彩顶小屋挑战后的积木作品与工坊界面' },
  { id: 'rocket', label: '启航火箭', detail: '小挑战', src: rocket, alt: '完成启航火箭挑战后的红白蓝积木火箭与工坊界面' },
  { id: 'castle', label: '迷你城堡', detail: '小挑战', src: castle, alt: '完成迷你城堡挑战后的蓝顶积木城堡与工坊界面' },
  { id: 'mobile', label: '随身工坊', detail: '移动端', src: mobile, alt: '积木小工坊在手机竖屏上的完整操作界面' },
] as const;

function ActionLink({ children, className = '', href, external = false }: { children: ReactNode; className?: string; href: string; external?: boolean }) {
  const reducedMotion = useReducedMotion();
  return <motion.a className={`action-link ${className}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
    whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} transition={SNAPPY}>
    {children}{href.startsWith('#') ? <ArrowDown size={18} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}
  </motion.a>;
}

function LiveWork() {
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const inView = useInView(hostRef, { initial: true, amount: 0.05 });
  const reducedMotion = useReducedMotion() ?? false;
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const publish = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({
      type: 'brick-workshop:presentation', visible: inView && pageVisible, reducedMotion,
    }, window.location.origin);
  }, [inView, pageVisible, reducedMotion]);

  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  useEffect(() => {
    const receive = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      if (!event.data || typeof event.data !== 'object' || !('type' in event.data) || event.data.type !== 'brick-workshop:ready') return;
      setReady(true);
      setFailed(false);
      publish();
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [publish]);
  useEffect(publish, [publish]);
  useEffect(() => {
    if (ready) return;
    const timeout = window.setTimeout(() => setFailed(true), 15000);
    return () => window.clearTimeout(timeout);
  }, [ready, revision]);

  return <div className="live-work" ref={hostRef} data-ready={ready}>
    <iframe key={revision} ref={frameRef} src={`${DEMO_URL}?presentation=1`} title="积木小工坊：真实 3D 作品展示"
      className="work-frame" onLoad={publish} allow="fullscreen" />
    {!ready && <div className="live-placeholder">
      {failed ? <><img src={desktop} alt="积木小工坊桌面截图" /><div className="live-retry"><p>作品展示未能加载</p><button type="button" onClick={() => { setFailed(false); setReady(false); setRevision((value) => value + 1); }}>重新加载<ArrowRight size={16} /></button></div></>
        : <span role="status">作品加载中</span>}
    </div>}
  </div>;
}

function ScreenshotGallery() {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openerRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const shot = SHOTS[active];
  const change = (index: number) => setActive((index + SHOTS.length) % SHOTS.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (expanded && !dialog.open) dialog.showModal();
    if (!expanded && dialog.open) dialog.close();
  }, [expanded]);
  const close = () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    setExpanded(false);
    openerRef.current?.focus();
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % SHOTS.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + SHOTS.length) % SHOTS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = SHOTS.length - 1;
    if (next === null) return;
    event.preventDefault();
    change(next);
    tabRefs.current[next]?.focus();
  };

  return <section className="gallery-band" id="screenshots" aria-labelledby="gallery-heading">
    <div className="section-heading content-width">
      <h2 id="gallery-heading">工坊实录</h2>
      <span className="section-aside">积木小工坊</span>
    </div>
    <div className="gallery-body content-width">
      <div className="gallery-view" role="tabpanel" id="gallery-panel" aria-labelledby={`shot-tab-${shot.id}`} tabIndex={0}>
        <button type="button" className={`screenshot-open ${shot.id === 'mobile' ? 'is-mobile' : ''}`} ref={openerRef}
          onClick={() => setExpanded(true)} aria-label={`放大查看${shot.label}截图`}>
          <motion.img key={shot.id} src={shot.src} alt={shot.alt} width={shot.id === 'mobile' ? 390 : 1440} height={shot.id === 'mobile' ? 844 : 900}
            initial={reducedMotion ? false : { opacity: 0.65 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} />
          <span className="zoom-affordance"><Maximize2 size={18} aria-hidden="true" /></span>
        </button>
      </div>
      <div className="gallery-caption">
        <div><strong>{shot.label}</strong><span>{shot.detail}</span></div>
        <span className="gallery-count">{String(active + 1).padStart(2, '0')}<span>/</span>{String(SHOTS.length).padStart(2, '0')}</span>
      </div>
      <div className="gallery-tabs" role="tablist" aria-label="选择工坊截图">
        {SHOTS.map((item, index) => <button key={item.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab"
          id={`shot-tab-${item.id}`} aria-controls="gallery-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1}
          onClick={() => change(index)} onKeyDown={(event) => onTabKey(event, index)} className={active === index ? 'is-active' : ''}>
          <span className="thumbnail-wrap"><img src={item.src} alt="" loading="lazy" width="144" height="90" />{active === index && <span className="thumbnail-check"><Check size={12} aria-hidden="true" /></span>}</span>
          <span>{item.label}</span>
          {active === index && <motion.span className="gallery-tab-line" layoutId="gallery-selection" transition={reducedMotion ? { duration: 0 } : SNAPPY} />}
        </button>)}
      </div>
    </div>
    <dialog className="image-dialog" ref={dialogRef} aria-labelledby="image-dialog-title" onCancel={(event) => { event.preventDefault(); event.stopPropagation(); close(); }} onClose={() => setExpanded(false)}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }} onKeyDown={(event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); change(active + 1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); change(active - 1); }
      }}>
      <div className="image-dialog-inner">
        <header><h2 id="image-dialog-title">{shot.label}</h2><a className="original-image-link" href={shot.src} target="_blank" rel="noreferrer" aria-label={`在新标签页查看${shot.label}截图原图`}>查看原图<ArrowUpRight size={16} aria-hidden="true" /></a><button type="button" className="icon-button" onClick={close} title="关闭截图" aria-label="关闭截图" autoFocus><X size={22} /></button></header>
        <img src={shot.src} alt={shot.alt} />
        <footer><button className="icon-button" type="button" onClick={() => change(active - 1)} title="上一张截图" aria-label="上一张截图"><ArrowLeft size={21} /></button>
          <span>{active + 1} / {SHOTS.length}</span><button className="icon-button" type="button" onClick={() => change(active + 1)} title="下一张截图" aria-label="下一张截图"><ArrowRight size={21} /></button></footer>
      </div>
    </dialog>
  </section>;
}

const INSTALL_CMD = [
  'git clone https://github.com/muzimu217/ui-design-agent-kit.git',
  '  && cd ui-design-agent-kit',
  '  && npm ci --ignore-scripts',
  '  && npm run verify',
].join(' \\\n');

function InstallSection() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch { /* 剪贴板被拒绝时，访客可手动选中复制 */ }
  };
  return <section className="install-band" id="install" aria-labelledby="install-heading"><div className="content-width">
    <div className="section-heading"><div><h2 id="install-heading">一条指令安装。</h2><p>克隆、安装依赖、跑自检，一次完成。</p></div><FolderGit2 size={28} strokeWidth={1.5} aria-hidden="true" /></div>
    <div className="install-command">
      <code>{INSTALL_CMD}</code>
      <button type="button" className={`copy-button${copied ? ' is-copied' : ''}`} onClick={copy} aria-label={copied ? '安装指令已复制' : '复制安装指令'} aria-live="polite">
        {copied ? <><Check size={15} aria-hidden="true" />已复制</> : <><Copy size={15} aria-hidden="true" />复制</>}
      </button>
    </div>
    <ol className="install-steps">
      <li><strong>克隆自检</strong><span>需要 Node.js 20.18 以上。<code>npm run verify</code> 通过说明指令、配置与测试就位。</span></li>
      <li><strong>仓库内直接用</strong><span>Codex 等宿主会自动读取 AGENTS.md，输入 <code>$ui-design-agent …</code> 开始 UI 任务。</span></li>
      <li><strong>外部工作区注入</strong><span>运行 <code>npm run prompt:build</code> 得到单文件提示词，粘贴到目标项目的 AGENTS.md 或系统提示词。</span></li>
    </ol>
    <p className="install-note">Agent 宿主仍需自行接入 MCP 与 skills；导出的提示词内含门禁与验收约定，但不会自动安装或登录任何服务。</p>
  </div></section>;
}

function WorkflowSection() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const stage = STAGES[active];
  const StageIcon = stage.icon;
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % STAGES.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + STAGES.length) % STAGES.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = STAGES.length - 1;
    if (next === null) return;
    event.preventDefault(); setActive(next); tabRefs.current[next]?.focus();
  };
  return <section className="workflow-band" id="workflow" aria-labelledby="workflow-heading"><div className="content-width">
    <div className="section-heading"><div><h2 id="workflow-heading">从需求，到交付。</h2><p>一条有确认节点的 UI 设计与实现流程。</p></div><Workflow size={28} strokeWidth={1.5} aria-hidden="true" /></div>
    <div className="workflow-rail" role="tablist" aria-label="工作流阶段">{STAGES.map((item, index) => { const Icon = item.icon; return <button key={item.id} id={`stage-${item.id}`} type="button" role="tab" aria-selected={active === index} aria-controls="stage-panel" tabIndex={active === index ? 0 : -1} className={active === index ? 'is-active' : ''} onClick={() => setActive(index)} ref={(element) => { tabRefs.current[index] = element; }} onKeyDown={(event) => onKey(event, index)}><span className="stage-node"><Icon size={21} strokeWidth={1.8} /></span><span>{item.name}</span>{active === index && <motion.span className="stage-selection" layoutId="workflow-stage" transition={reducedMotion ? { duration: 0 } : SNAPPY} />}</button>; })}</div>
    <div className="stage-panel" role="tabpanel" tabIndex={0} id="stage-panel" aria-labelledby={`stage-${stage.id}`}><motion.div key={stage.id} className="stage-description" initial={reducedMotion ? false : { opacity: 0.65, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={ELEGANT}><h3><StageIcon size={23} strokeWidth={1.6} />{stage.name}</h3><p>{stage.summary}</p></motion.div><div className="stage-delivery"><div><span>阶段产出</span><strong>{stage.output}</strong></div><span className={stage.gate ? 'human-gate' : 'stage-boundary'}>{stage.gate && <Compass size={15} />}{stage.decision}</span></div></div>
  </div></section>;
}

function CaseDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = dialogRef.current; if (!dialog) return; if (project && !dialog.open) dialog.showModal(); if (!project && dialog.open) dialog.close(); }, [project]);
  const close = () => { if (dialogRef.current?.open) dialogRef.current.close(); onClose(); };
  return <dialog className="case-dialog" ref={dialogRef} aria-labelledby="case-heading" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    {project && <div className="case-dialog-content"><header className="case-header"><div><span>{project.category}</span><h2 id="case-heading">{project.name}</h2></div><button type="button" className="icon-button" onClick={close} title="关闭案例" aria-label="关闭案例" autoFocus><X size={22} /></button></header><div className="case-summary"><p>{project.description}</p><span className="case-status">{project.status}<span>·</span>{project.kind}</span></div>
      {project.id === 'brick' ? <><div className="case-live"><LiveWork /></div><div className="case-play"><span>积木小工坊 / 可试玩 demo</span><ActionLink href={DEMO_URL}>进入工坊</ActionLink></div><ScreenshotGallery /></> : project.id in PLAYABLE_URLS ? <><img className="case-history-image" src={project.image} alt={project.alt} /><a className="original-image-link case-history-link" href={project.image} target="_blank" rel="noreferrer" aria-label={`在新标签页查看${project.name}原图`}>查看原图<ArrowUpRight size={16} aria-hidden="true" /></a><div className="case-play"><span>{project.name} / 可试玩 demo</span><ActionLink href={PLAYABLE_URLS[project.id]}>进入体验</ActionLink></div></> : <><img className="case-history-image" src={project.image} alt={project.alt} /><a className="original-image-link case-history-link" href={project.image} target="_blank" rel="noreferrer" aria-label={`在新标签页查看${project.name}原图`}>查看原图<ArrowUpRight size={16} aria-hidden="true" /></a>{project.id === 'inventory' ? <div className="case-play"><span>库存运营台 / 演示数据</span><ActionLink href={INVENTORY_URL}>体验运营台</ActionLink></div> : <p className="case-evidence-note">历史界面截图。本案例未在此发布包中提供在线试玩。</p>}</>}
    </div>}
  </dialog>;
}

function App() {
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<Filter>('全部');
  const [project, setProject] = useState<Project | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const filterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const projects = PROJECTS.filter((item) => filter === '全部' || item.category === filter);
  const openProject = (item: Project, opener: HTMLButtonElement) => { openerRef.current = opener; setProject(item); };
  const closeProject = () => { setProject(null); openerRef.current?.focus(); };
  const onFilterKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = (index + 1) % FILTERS.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + FILTERS.length) % FILTERS.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = FILTERS.length - 1;
    if (next === null) return;
    event.preventDefault(); setFilter(FILTERS[next]); filterRefs.current[next]?.focus();
  };
  return <>
    <a className="skip-link" href="#projects">跳到成果项目</a>
    <header className="site-header content-width"><a className="brand" href={BASE} aria-label="UI Design Agent Kit 首页"><Workflow size={24} strokeWidth={1.8} /><span>UI Design<br />Agent Kit</span></a><nav aria-label="主导航"><a href="#workflow">工作流</a><a href="#projects">成果项目</a><a href="#install">获取 kit</a><a href="#verification">验证</a><a className="github-link" href={SHOWCASE_REPOSITORY_URL} target="_blank" rel="noreferrer" aria-label="公开成果展示仓库"><FolderGit2 size={17} /><span>仓库</span></a></nav></header>
    <main>
      <section className="hero" aria-labelledby="hero-heading"><div className="hero-title content-width"><h1 id="hero-heading"><motion.span initial={reducedMotion ? false : { y: 16, opacity: 0.8 }} animate={{ y: 0, opacity: 1 }} transition={ELEGANT}>UI Design</motion.span><motion.span initial={reducedMotion ? false : { y: 16, opacity: 0.8 }} animate={{ y: 0, opacity: 1 }} transition={{ ...ELEGANT, delay: 0.06 }}>Agent Kit<span className="title-stop">.</span></motion.span></h1><p className="hero-descriptor">UI 设计智能体工作流</p><p className="hero-description">从需求与参考，到交互实现与浏览器验证。</p><div className="hero-actions"><ActionLink href="#projects">浏览成果</ActionLink><ActionLink href="#workflow" className="secondary-action">查看工作流</ActionLink></div></div>
        <div className="hero-strip content-width" aria-label="工作流成果预览">{PROJECTS.map((item, index) => <motion.button key={item.id} type="button" className="hero-preview" onClick={(event) => openProject(item, event.currentTarget)} aria-label={`查看${item.name}案例`} initial={reducedMotion ? false : { y: 18, opacity: 0.8 }} animate={{ y: 0, opacity: 1, transition: { ...ELEGANT, delay: index * 0.06 } }} whileHover={reducedMotion ? undefined : { y: -5, transition: SNAPPY }} whileTap={reducedMotion ? undefined : { scale: 0.99, transition: SNAPPY }} transition={ELEGANT}><img src={item.image} alt={item.alt} width={item.id === 'blog' || item.id === 'brick' ? 1440 : 1280} height={item.id === 'blog' || item.id === 'brick' ? 900 : 800} /><span><span>{item.category}</span><ArrowUpRight size={16} aria-hidden="true" /></span></motion.button>)}</div>
      </section>
      <WorkflowSection />
      <section className="projects-band" id="projects" aria-labelledby="projects-heading"><div className="content-width"><div className="section-heading"><div><h2 id="projects-heading">工作流成果</h2><p>不同的任务，不同的界面表达。</p></div><Layers3 size={28} strokeWidth={1.5} aria-hidden="true" /></div><div className="project-filters" role="tablist" aria-label="成果项目类型">{FILTERS.map((item, index) => <button key={item} id={`filter-${index}`} type="button" role="tab" aria-selected={filter === item} aria-controls="projects-panel" className={filter === item ? 'is-active' : ''} tabIndex={filter === item ? 0 : -1} onClick={() => setFilter(item)} ref={(element) => { filterRefs.current[index] = element; }} onKeyDown={(event) => onFilterKey(event, index)}><span>{item}</span>{filter === item && <motion.span className="filter-selection" layoutId="project-filter" transition={reducedMotion ? { duration: 0 } : SNAPPY} />}</button>)}</div>
        <div className="projects-grid" id="projects-panel" role="tabpanel" aria-labelledby={`filter-${FILTERS.indexOf(filter)}`} tabIndex={0}>{projects.map((item) => { const Icon = item.icon; return <motion.article key={item.id} className="project-item" layout transition={reducedMotion ? { duration: 0 } : ELEGANT}><button type="button" className="project-image" onClick={(event) => openProject(item, event.currentTarget)} aria-label={`查看${item.name}案例`}><img src={item.image} alt={item.alt} loading="lazy" width={1440} height={900} /><span className="project-open"><Maximize2 size={19} aria-hidden="true" /></span></button><div className="project-meta"><span><Icon size={16} />{item.category}</span><span>{item.status}</span></div><div className="project-title"><div><h3>{item.name}</h3><p>{item.kind}</p></div><button type="button" onClick={(event) => openProject(item, event.currentTarget)} className="case-open-link">{item.id === 'brick' || item.id === 'inventory' || item.id in PLAYABLE_URLS ? '查看 demo' : '查看截图'}<ArrowUpRight size={17} /></button></div></motion.article>; })}</div>
      </div></section>
      <section className="verification-band" id="verification" aria-labelledby="verification-heading"><div className="content-width"><div className="section-heading"><div><h2 id="verification-heading">验证，有据可查。</h2><p>四种证据层级，不能相互替代。</p></div><ScanEye size={28} strokeWidth={1.5} aria-hidden="true" /></div><dl className="evidence-definitions">{EVIDENCE.map((item) => { const Icon = item.icon; return <div key={item.name}><dt><Icon size={22} strokeWidth={1.6} />{item.name}</dt><dd>{item.meaning}</dd></div>; })}</dl><p className="evidence-disclaimer">以上为证据定义，不是所有项目均已通过的状态声明。历史截图与可试玩成果已分别标注。</p></div></section>
      <InstallSection />
      <section className="closing-band" id="testing" aria-labelledby="closing-heading"><div className="content-width closing-content"><div><h2 id="closing-heading">参与公开测试</h2><p>成果与源码已公开。反馈请注明版本、复现步骤，以及 demo 体验或工作流执行测试。</p></div><ActionLink href={FEEDBACK_URL} external>提交测试反馈</ActionLink></div></section>
    </main>
    <footer className="site-footer content-width"><a href={BASE}>UI 设计智能体工作流</a><span>{RELEASE}</span><a href={FEEDBACK_URL} target="_blank" rel="noreferrer">测试反馈<ArrowUpRight size={14} /></a><a href={`${BASE}THIRD_PARTY_LICENSES.txt`}>依赖许可</a><a href={SHOWCASE_REPOSITORY_URL} target="_blank" rel="noreferrer">公开展示仓库<ArrowUpRight size={14} /></a><a href={REPOSITORY_URL} target="_blank" rel="noreferrer">Agent 源码<ArrowUpRight size={14} /></a></footer><CaseDialog project={project} onClose={closeProject} />
  </>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><MotionConfig reducedMotion="user"><App /></MotionConfig></StrictMode>);
