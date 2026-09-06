import { useState, useId, type FormEvent } from "react";

/**
 * 个人博客展示页 Demo —— 依据 DESIGN.md 设计契约实现。
 * 全部内容为示例数据（demo data），与 DESIGN.md「Rules: Don't / 页脚声明」一致。
 * 无外部图片/字体/依赖；TypeScript strict，无 any。
 */

type Post = {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  readingTime: string;
};

const POSTS: Post[] = [
  {
    id: "sunlight",
    tag: "生活观察",
    title: "把下午四点的光，收进一句句子里",
    excerpt: "阳光、茶与键盘声：一个写作者如何把日常的慢动作，变成可读的素材。",
    body: "下午四点，光会从西窗斜进来，在桌面上慢慢挪动。我并不急着写，只是把这一刻放慢：茶的热气、键盘的敲击、楼下孩子的喊声——它们各有各的节奏，而句子只是替它们排队。这篇记录的是，我如何把十分钟的安静，变成一页能反复读的纸。",
    date: "2026-03-12",
    readingTime: "6 分钟",
  },
  {
    id: "reading",
    tag: "读书笔记",
    title: "重读《乡土中国》：差序格局在今天的互联网里",
    excerpt: "七十年后的社交网络，仍然是那个差序格局的放大镜。",
    body: "费孝通说的差序格局，是像水波纹一样一圈圈推开的人际关系。把这张图换成今天的关注列表、朋友圈分组与信息茧房，会发现结构惊人地相似。我们离熟悉的人越来越近，离陌生人越来越远——这未必是坏事，但值得被看见。",
    date: "2026-02-27",
    readingTime: "9 分钟",
  },
  {
    id: "writing",
    tag: "写作方法",
    title: "我的三个月写作工作流：从零到一篇文章的完整路径",
    excerpt: "主题、提纲、初稿、冷却、改稿——每一步的工具与判断。",
    body: "过去三个月我固定了一套流程：随时丢入灵感箱 → 每周五整理成主题池 → 写一页提纲 → 一次性完成初稿 → 冷却三天 → 只改「读者会卡住的地方」。这篇把每步的时间成本与常见弯路拆开讲，供同样在写作的人参考。",
    date: "2026-02-03",
    readingTime: "8 分钟",
  },
  {
    id: "season",
    tag: "随笔",
    title: "南方冬天的湿度与写字的手",
    excerpt: "关于季节如何渗进句子，以及为什么我总在冬天改写旧稿。",
    body: "南方的冬天没有雪，只有晾不干的衣服和手指尖的凉。奇怪的是，我在这样的季节里总想回头改旧稿——也许是天气让人更愿意慢下来。这篇文章写的不是天气，而是天气如何改写了写字的速度。",
    date: "2026-01-18",
    readingTime: "4 分钟",
  },
];

type NavLink = {
  href: string;
  label: string;
  cta?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { href: "#journal", label: "文章" },
  { href: "#about", label: "关于" },
  { href: "#subscribe", label: "订阅", cta: true },
];

const HERO_STATS = [
  { label: "已发布", value: "36 篇" },
  { label: "更新频率", value: "每月 1–2 篇" },
  { label: "订阅", value: "RSS 可用" },
] as const;

const INTERESTS = ["写作", "读书", "城市漫游", "茶与咖啡", "旧报纸"] as const;

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="nav-inner">
        <a className="brand" href="#top">
          一舟札记
        </a>
        <nav className="nav" aria-label="主导航">
          <ul className="nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  className={link.cta ? "nav-link nav-cta" : "nav-link"}
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-avatar" aria-hidden="true">
        林
      </div>
      <p className="hero-eyebrow">个人博客 · 写作与生活观察</p>
      <h1 className="hero-title" id="hero-title">
        你好，我是林一舟。
      </h1>
      <p className="hero-lead">
        我在这里记录写作方法、读书笔记与城市日常。不追热点，只写真正想过的问题，
        每个月更新一到两篇。
      </p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#journal">
          阅读最新文章
        </a>
        <a className="btn btn-ghost" href="#subscribe">
          订阅更新
        </a>
      </div>
      <dl className="hero-stats">
        {HERO_STATS.map((stat) => (
          <div className="hero-stat" key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function PostCard({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const bodyId = `post-${post.id}-body`;

  return (
    <article className="post-card">
      <p className="post-meta">
        {post.date} · {post.readingTime} 阅读
      </p>
      <span className="post-tag">{post.tag}</span>
      <h3 className="post-title">{post.title}</h3>
      <p className="post-excerpt">{post.excerpt}</p>
      <button
        className="post-more"
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "收起" : "阅读全文"}
        <span aria-hidden="true">{open ? " ↑" : " →"}</span>
      </button>
      <p className="post-full" id={bodyId} hidden={!open}>
        {post.body}
      </p>
    </article>
  );
}

function Journal() {
  return (
    <section className="section journal" id="journal" aria-labelledby="journal-title">
      <div className="section-head">
        <p className="section-eyebrow">精选文章</p>
        <h2 className="section-title" id="journal-title">
          最近写的
        </h2>
      </div>
      <ul className="post-grid">
        {POSTS.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function About() {
  return (
    <section className="section about" id="about" aria-labelledby="about-title">
      <div className="about-inner">
        <p className="section-eyebrow">关于</p>
        <h2 className="section-title" id="about-title">
          写慢一点，想清楚再下笔
        </h2>
        <p className="about-text">
          我是一名独立写作者，白天做技术文档，晚上写自己的札记。这里没有热点速递，
          只有我对写作这件事本身的反省，以及翻书、散步时冒出来的念头。
        </p>
        <p className="about-text">
          如果你也相信「慢是一种生产力」，欢迎留下来读几篇，再决定要不要订阅。
        </p>
        <ul className="interests" aria-label="兴趣标签">
          {INTERESTS.map((item) => (
            <li className="chip" key={item}>
              {item}
            </li>
          ))}
        </ul>
        <p className="about-links">
          <a className="text-link" href="mailto:yizhou@example.com">
            写信给我（yizhou@example.com）
          </a>
          <a className="text-link" href="#subscribe">
            订阅更新
          </a>
        </p>
      </div>
    </section>
  );
}

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputId = useId();
  const errorId = useId();

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed === "") return "请先填写邮箱地址。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      return "邮箱格式看起来不对，再检查一下？";
    }
    return null;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = validate(email);
    setError(problem);
    if (problem === null) {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div className="subscribe-success" role="status">
        <p className="subscribe-success-title">已订阅，欢迎你。</p>
        <p className="subscribe-success-text">
          以后每个月会收到一封包含最新文章的邮件（这是 demo，不会真的发送）。
        </p>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            setEmail("");
            setError(null);
            setDone(false);
          }}
        >
          换一个邮箱
        </button>
      </div>
    );
  }

  return (
    <form className="subscribe-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="field-label" htmlFor={inputId}>
          邮箱地址
        </label>
        <input
          className="field-input"
          id={inputId}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error !== null) setError(null);
          }}
          aria-invalid={error !== null}
          aria-describedby={error !== null ? errorId : undefined}
        />
        {error !== null && (
          <p className="field-error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </div>
      <button className="btn btn-primary" type="submit">
        订阅
      </button>
    </form>
  );
}

function Subscribe() {
  return (
    <section className="section subscribe" id="subscribe" aria-labelledby="subscribe-title">
      <div className="subscribe-inner">
        <p className="section-eyebrow">订阅</p>
        <h2 className="section-title" id="subscribe-title">
          每个月，一封信
        </h2>
        <p className="subscribe-note">
          不写营销，只把当月最重要的一两篇文章装进邮件。随时可退。
        </p>
        <SubscribeForm />
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-note">
          © 2026 一舟札记 · 本页为个人博客展示 Demo，文章与数据均为示例内容。
        </p>
        <a className="back-top" href="#top">
          回到顶部 ↑
        </a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="page" id="top">
      <a className="skip-link" href="#main">
        跳到正文
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Journal />
        <About />
        <Subscribe />
      </main>
      <SiteFooter />
    </div>
  );
}
