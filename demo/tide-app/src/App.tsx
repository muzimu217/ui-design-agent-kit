/**
 * 潮汐 TIDE 产品页 —— 单页五个纵向 section（契约第 8 节 Output structure）。
 *
 *   1 Hero        品牌 + 主张 + 今日潮位读数 + 主 CTA        （A2：375×812 不滚动可见读数）
 *   2 TideCurve   自绘 SVG 曲线 + input[type=range] 时间轴   （A4 / B3 / B1）
 *   3 CurveInUse  基于同一份演示数据的用法判断，不解释潮汐原理（B2）
 *   4 Scenarios   海钓 / 赶海 / 摄影 三张场景卡
 *   5 Footer      下载引导 + 演示数据声明
 */

import { useCallback, useMemo, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { MapPin, Sun, Waves } from 'lucide-react';
import {
  AXIS_MAX,
  SAMPLE_COUNT,
  buildCurveInUse,
  buildScenarioValues,
  createTideDay,
  formatClock,
  formatLevel,
  levelAtMinutes,
  readoutSentence,
  stepForDate,
  trendAtMinutes,
  trendLabel,
  type TideDay,
  type TideTrend,
} from './model.ts';
import { TideCurve, type CurveStatus } from './TideCurve.tsx';
import {
  DemoDataBadge,
  NumericText,
  PressableLink,
  STAGGER_SECONDS,
  UnitLabel,
  elegant,
  useReducedMotionPreference,
} from './ui.tsx';

/**
 * 演示数据是同步生成的，没有真实异步源，因此默认路径下不存在真实的加载时序。
 * 契约 9.1 / 9.2 / 9.3 / 9.6 要求实现「加载」与「空」两个状态，
 * 于是用 URL 参数把这两条真实代码路径显式打开，便于逐条核对；不引入任何假延时、假 handler：
 *   ?state=loading  停在加载态（骨架 + 不渲染时间轴 + 占位读数）
 *   ?state=empty    生成器返回不足 2 个采样点 → 空态（不画假曲线）
 *   ?state=ready（或省略）  真实路径：直接装配演示数据。
 * 默认路径在首次渲染就给出读数，满足 A2「读数是静态渲染的，不依赖滚动触发或动画完成」。
 */
function readRequestedState(): CurveStatus | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('state');
  return value === 'loading' || value === 'empty' || value === 'ready' ? value : null;
}

type Loaded = { status: CurveStatus; day: TideDay | null };

/** 装配一天的演示数据。空态来自生成器本身返回不足的数据，不是靠抛错或假延时伪造的。 */
function loadTideDay(requested: CurveStatus | null): Loaded {
  if (requested === 'loading') return { status: 'loading', day: null };
  const day = createTideDay(requested === 'empty' ? 0 : SAMPLE_COUNT);
  return { status: day.points.length > 1 && day.summary ? 'ready' : 'empty', day };
}

function useTideDay(): Loaded {
  return useMemo(() => loadTideDay(readRequestedState()), []);
}

function App() {
  const { status, day } = useTideDay();
  // 当前时刻在页面打开时取一次快照：时间轴初值 = 当前时刻步数（契约 9.2），
  // 当前时刻标记也用它，避免停留期间游标基准漂移。
  const [now] = useState(() => new Date());
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const [step, setStep] = useState(() => stepForDate(now));

  const handleStepChange = useCallback((next: number) => {
    setStep(Math.min(AXIS_MAX, Math.max(0, Math.round(next))));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#tide-curve">
        跳到今天的潮汐曲线
      </a>

      <Hero status={status} nowMinutes={nowMinutes} />
      <TideCurve status={status} day={day} step={step} onStepChange={handleStepChange} nowMinutes={nowMinutes} />
      <CurveInUse status={status} day={day} />
      <Scenarios status={status} day={day} />
      <Footer />
    </MotionConfig>
  );
}

/* ---------------------------------------------------------------- 1 · Hero */

type HeroProps = { status: CurveStatus; nowMinutes: number };

/** 第一屏。导出是为了让测试能用显式 status 直接核对 A2 要求的读数块内容。 */
export function Hero({ status, nowMinutes }: HeroProps) {
  const ready = status === 'ready';
  const level = ready ? levelAtMinutes(nowMinutes) : null;
  const trend: TideTrend = trendAtMinutes(nowMinutes);

  return (
    <header className="section hero" aria-labelledby="hero-title">
      <div className="section-inner hero-inner">
        <p className="brand">
          <Waves size={22} strokeWidth={2.2} aria-hidden="true" />
          <span className="brand-name">潮汐 TIDE</span>
        </p>

        <h1 id="hero-title" className="hero-title">
          今天什么时候能下水，打开就知道。
        </h1>

        {/* A2：这个读数块必须在 375×812 与 1440×900 首屏完整可见，不依赖滚动或动画完成。 */}
        <div className="hero-readout">
          <div className="hero-readout-head">
            <p className="readout-caption">今日潮位 · 现在</p>
            <DemoDataBadge />
          </div>
          <p className="hero-level">
            <span className="hero-level-value num" lang="en">
              {level === null ? (status === 'loading' ? '—.—' : '暂无数据') : formatLevel(level)}
            </span>
            {level !== null ? <UnitLabel /> : null}
          </p>
          <p className="hero-meta">
            <span className="num" lang="en">
              {formatClock(nowMinutes)}
            </span>
            <span className="meta-separator" aria-hidden="true">
              ·
            </span>
            <span>{level === null ? (status === 'loading' ? '正在载入' : '数据不可用') : trendLabel(trend)}</span>
          </p>
          <span className="visually-hidden">
            {level === null ? '今日潮位数据暂不可用。' : readoutSentence(nowMinutes, level)}
          </span>
        </div>

        <div className="hero-actions">
          <PressableLink className="primary-cta" href="#tide-curve">
            看今天的潮汐
          </PressableLink>
        </div>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------- 3 · CurveInUse */

type CurveInUseProps = { status: CurveStatus; day: TideDay | null };

function CurveInUse({ status, day }: CurveInUseProps) {
  const reduceMotion = useReducedMotionPreference();
  const items = day ? buildCurveInUse(day) : [];

  return (
    <section className="section use-section" id="curve-in-use" aria-labelledby="use-title">
      <div className="section-inner">
        <div className="section-heading">
          <div>
            <h2 id="use-title">这条曲线怎么用</h2>
            <p className="section-detail">下面三个时刻都由上面的曲线算出，数值与曲线同源。</p>
          </div>
          <DemoDataBadge variant="outline" />
        </div>

        {status === 'ready' && items.length > 0 ? (
          <ul className="use-list">
            {items.map((item, index) => (
              <motion.li
                key={item.id}
                className="use-item"
                initial={reduceMotion ? false : { opacity: 0, y: 12, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.4 }}
                transition={reduceMotion ? { duration: 0 } : { ...elegant, delay: index * STAGGER_SECONDS }}
              >
                <p className="use-title">{item.title}</p>
                <p className="use-body">{item.body}</p>
                <p className="use-value">
                  <NumericText>{item.value}</NumericText>
                </p>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="section-empty">
            {status === 'loading' ? '正在载入今日潮位…' : '今日示例数据不可用，刷新页面可重新生成。'}
          </p>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ 4 · Scenarios */

type ScenariosProps = { status: CurveStatus; day: TideDay | null };

function Scenarios({ status, day }: ScenariosProps) {
  const reduceMotion = useReducedMotionPreference();
  const values = day ? buildScenarioValues(day) : null;
  const unavailable = '今日示例数据不可用';

  const cards = [
    {
      id: 'fishing',
      icon: Waves,
      title: '海钓',
      benefit: '涨潮最急的两小时，水跟着鱼一起动。',
      value: values?.fishing ?? unavailable,
    },
    {
      id: 'foraging',
      icon: MapPin,
      title: '赶海',
      benefit: '低潮前两小时上滩，回程还留得出时间。',
      value: values?.foraging ?? unavailable,
    },
    {
      id: 'photography',
      icon: Sun,
      title: '摄影',
      benefit: '当日最高潮位，礁石线整个没过。',
      value: values?.photography ?? unavailable,
    },
  ];

  return (
    <section className="section scenario-section" id="scenarios" aria-labelledby="scenarios-title">
      <div className="section-inner">
        <div className="section-heading">
          <div>
            <h2 id="scenarios-title">三个场景</h2>
            <p className="section-detail">每张卡上的数值都取自同一天的演示数据。</p>
          </div>
        </div>

        <ul className="scenario-grid">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.li
                key={card.id}
                className="scenario-item"
                initial={reduceMotion ? false : { opacity: 0, y: 12, filter: 'blur(4px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.3 }}
                transition={reduceMotion ? { duration: 0 } : { ...elegant, delay: index * STAGGER_SECONDS }}
              >
                <PressableLink className="scenario-card" href="#tide-curve">
                  <span className="scenario-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="scenario-title">{card.title}</span>
                  <span className="scenario-benefit">{card.benefit}</span>
                  <span className="scenario-value">
                    <NumericText>{card.value}</NumericText>
                  </span>
                  <span className="scenario-badge">
                    <DemoDataBadge variant="outline" />
                  </span>
                </PressableLink>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- 5 · Footer */

function Footer() {
  return (
    <footer className="section footer" id="download">
      <div className="section-inner footer-inner">
        <div className="footer-copy">
          <h2 className="footer-title">把潮汐放进手机，出海前看一眼。</h2>
          {/* 契约第 5 节：全站默认不使用「预报」字样。这句话因此改用直接陈述，
              把「不是真实数据」讲清楚，同时避开一个需要额外标注的词。 */}
          <p className="footer-note">
            潮位由本地正弦模型生成（半日潮 M2 + S2 叠加，共 145 个采样点），不是真实观测数据，页面不连接任何数据源。
          </p>
        </div>
        {/* A3 必标位置 ④：页脚下载区 */}
        <div className="footer-actions">
          <a className="secondary-cta" href="#tide-curve">
            下载 App（演示）
          </a>
          <DemoDataBadge variant="outline" />
        </div>
      </div>
    </footer>
  );
}

export default App;
