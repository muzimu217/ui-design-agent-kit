import { PandaMark } from '../components/PandaMark';
import { TagChip } from '../components/TagPill';

const SKILLS = ['Rust', 'TypeScript', 'React', 'Vite', 'Tailwind CSS', 'WebAssembly', '独立开发'];

/** 关于（§2.1 /about）：作者介绍、技能、联系方式、授权致谢。 */
export default function AboutPage() {
  return (
    <div className="content-col pt-6 md:pt-10">
      <div className="article-col">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border-ink bg-surface">
            <PandaMark size={52} title="小墨的几何熊猫头像" />
          </span>
          <div>
            <h1 className="m-0 font-kai text-h1 font-bold text-text">小墨</h1>
            <p className="m-0 mt-1 text-body text-text-secondary">成都独立开发者 · 竹与墨博主</p>
          </div>
        </div>

        <section aria-labelledby="about-intro" className="mt-8">
          <h2 id="about-intro" className="font-kai text-h2 font-bold text-text">
            关于我
          </h2>
          <p className="mt-3 text-body-article text-text">
            大家好，我是小墨，住在成都的独立开发者。白天写 Rust 和
            TypeScript，晚上看番、写「追番周记」。这个博客记录我做技术的手账：
            异步、类型体操、浏览器里的小实验，偶尔夹杂一些成都的咖啡馆。
          </p>
          <p className="mt-3 text-body-article text-text">
            「竹与墨」是 2026 年搭起来的：想要一张安静的水墨宣纸，把文章放在中间，
            熊猫和墨竹守在边上——它们是身份，不是噪声。
          </p>
        </section>

        <section aria-labelledby="about-skills" className="mt-10">
          <h2 id="about-skills" className="font-kai text-h2 font-bold text-text">
            在用的东西
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <TagChip key={s} label={s} />
            ))}
          </div>
        </section>

        <section aria-labelledby="about-contact" className="mt-10">
          <h2 id="about-contact" className="font-kai text-h2 font-bold text-text">
            联系
          </h2>
          <p className="mt-3 text-body-article text-text">
            邮箱：xiaomo@example.com（演示数据）｜ GitHub：@xiaomo（演示数据）
          </p>
        </section>

        <section aria-labelledby="about-license" className="mt-10 mb-8">
          <h2 id="about-license" className="font-kai text-h2 font-bold text-text">
            授权与致谢
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-1 pl-6 text-body text-text">
            <li>插画：いらすとや https://www.irasutoya.com/ （商用免费·条件制，感谢！）</li>
            <li>标题字体：霞鹜文楷 LXGW WenKai（SIL OFL-1.1 授权，见其仓库许可）</li>
            <li>正文字体：思源黑体 Noto Sans SC（SIL OFL 1.1）</li>
            <li>代码字体：JetBrains Mono（OFL-1.1）</li>
            <li>熊猫吉祥物、墨竹背景、图标：本项目原创 SVG</li>
            <li>本站全部文章与数据均为演示数据</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
