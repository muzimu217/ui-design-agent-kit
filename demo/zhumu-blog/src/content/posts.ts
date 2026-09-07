import type { Post } from './types';

/**
 * 演示数据（demo 内容，非真实发布文章）。标题与主题贴近真实技术圈，
 * 正文为演示撰写；页脚与 /about 均有「演示数据」声明。
 */
export const posts: Post[] = [
  {
    slug: 'rust-async-future-tokio',
    title: 'Rust 异步入门：从 Future 到 tokio 运行时',
    date: '2026-08-24',
    minutes: 12,
    tags: ['Rust', '独立开发'],
    pinned: true,
    summary:
      'async fn 背后到底生成了什么？从 std::future::Future 的 poll 讲起，亲手摸一次 Waker，再看 tokio 为什么需要 reactor 与 worker 线程。',
    blocks: [
      {
        type: 'paragraph',
        text: '很多 Rust 异步教程第一句话就是「async fn 让异步变得简单」，但对我这样的学习者来说，简单的语法反而遮住了真正发生的事情。这篇文章按我自己的学习路径，从零开始拆一次 Future：先手写一个 trait 实现，再解释 executor 在哪里轮询它，最后才回到 tokio。',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Future 是一棵还没算完的表达式',
      },
      {
        type: 'paragraph',
        text: 'Future 只有一个方法 poll。它不 represent 一段正在执行的代码，而是 represent 一个「可能完成的值」：每次 poll，要么返回 Ready 带着结果，要么返回 Pending 并且把 Waker 交给底层事件源。理解了这一点，async/await 就只是编译器替你写的状态机糖。',
      },
      {
        type: 'code',
        lang: 'Rust',
        code: `use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

struct YieldOnce(bool);

impl Future for YieldOnce {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        if self.0 {
            Poll::Ready(())
        } else {
            self.0 = true;
            // 把唤醒句柄交给调度器，下次它再叫我们
            cx.waker().wake_by_ref();
            Poll::Pending
        }
    }
}`,
      },
      {
        type: 'heading',
        level: 2,
        text: 'tokio 在替你做什么',
      },
      {
        type: 'paragraph',
        text: 'tokio 的运行时由两部分组成：reactor 负责把 epoll/kqueue 的就绪事件翻译成 waker 的唤醒，worker 线程负责跑真正被唤醒的任务。你写的每个 spawn 出去的 async 块，最终都是 worker 队列里的一个任务；await 的点就是让出 CPU 的点。',
      },
      {
        type: 'list',
        items: [
          'CPU 密集任务不要占着异步线程，用 spawn_blocking 或 rayon',
          'select! 分支里的 future 会被同时 poll，注意副作用',
          'CancellationToken 比往 channel 里塞毒丸体面得多',
        ],
      },
      {
        type: 'paragraph',
        text: '把这三块拼起来再看 async fn，你会发现 Rust 异步没有魔法：它是把「等待」编码进类型系统，再把调度还给你自己选择。下一篇我打算写写 tokio 的 task 树与取消传播，那才是真正容易踩坑的地方。',
      },
    ],
  },
  {
    slug: 'react19-actions-in-practice',
    title: 'React 19 Actions 实战：把表单还给框架',
    date: '2026-08-10',
    minutes: 9,
    tags: ['前端', 'React'],
    summary:
      'useActionState、useOptimistic 与 form action 属性，把「提交中/乐观更新/错误回滚」这三件琐事从手写状态里删掉。',
    blocks: [
      {
        type: 'paragraph',
        text: '我给博客后台写了个评论管理页，正好拿来试 React 19 的 Actions。结论先说：过去一个表单要写的 isSubmitting、optimisticList、rollback 三套状态，现在大概只需要原来一半的代码，而且可读性更好。',
      },
      {
        type: 'heading',
        level: 2,
        text: '一个最小可用的 action',
      },
      {
        type: 'code',
        lang: 'TSX',
        code: `function DeleteButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev, formData: FormData) => {
      const err = await deleteComment(String(formData.get('id')));
      return err ? { error: err } : null;
    },
    null,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button disabled={pending}>
        {pending ? '删除中…' : '删除'}
      </button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}`,
      },
      {
        type: 'paragraph',
        text: '注意 form action 接的是表单序列化结果，而不是 onClick 事件。这意味着渐进增强是免费的：就算 JS 还没水合，原生表单提交也能把请求发出去。',
      },
      {
        type: 'heading',
        level: 2,
        text: '乐观更新与回滚',
      },
      {
        type: 'paragraph',
        text: 'useOptimistic 的心智模型是「先画大饼，失败自己收」。列表渲染读 optimistic 值，action 完成后用真实数据覆盖。Actions 最大的价值不是少打字，而是把异步边界收拢到一个有类型的位置，错误处理不再散落在各个 setState 里。',
      },
      {
        type: 'list',
        items: [
          'action 内抛错会进最近的 error boundary，别在按钮外裸奔',
          'pending 状态由框架管理，不要再自己写 isSubmitting',
          '多个 action 并发时注意 useActionState 的 prev 参数语义',
        ],
      },
    ],
  },
  {
    slug: 'ts-type-gymnastics-pick',
    title: 'TypeScript 类型体操入门：手写 Pick 与模板字面量',
    date: '2026-07-28',
    minutes: 10,
    tags: ['TypeScript', '前端'],
    summary:
      '从映射类型开始，一步步手写 Pick、Omit、Get，最后用模板字面量类型实现一个路由路径解析器，理解「类型层面的函数」。',
    blocks: [
      {
        type: 'paragraph',
        text: '类型体操最怕一上来就读 FaCC 式的四层条件类型。这篇从最小例子开始：先理解映射类型就是一个「类型层面的 for 循环」，后面的所有工具类型都是这个循环加不同的过滤条件。',
      },
      {
        type: 'code',
        lang: 'TypeScript',
        code: `type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 条件类型：类型层面的 if
type IsString<T> = T extends string ? true : false;

// infer：在 extends 里「解构」出感兴趣的部分
type ReturnTypeOf<F> = F extends (...args: never[]) => infer R ? R : never;`,
      },
      {
        type: 'heading',
        level: 2,
        text: '实战：解析路由路径',
      },
      {
        type: 'paragraph',
        text: '假设路由是 /posts/:slug 这样的字符串，我们让 TS 自动推导出参数对象类型。核心是模板字面量类型加 infer 的递归拆分。',
      },
      {
        type: 'code',
        lang: 'TypeScript',
        code: `type ExtractParams<Route extends string> =
  Route extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [k in Param | keyof ExtractParams<Rest>]: string }
    : Route extends \`\${string}:\${infer Param}\`
      ? { [k in Param]: string }
      : Record<string, never>;

type Params = ExtractParams<'/posts/:slug/comments/:cid'>;
// { slug: string; cid: string }`,
      },
      {
        type: 'paragraph',
        text: '写体操类型的三条经验：先写出运行时版本再翻译成类型；每个 infer 只解构一层；卡住时用 satisfies 而不是 any 去验证中间结果。体操是手段不是目的，能被 IDE 一个悬停解释清楚的类型，才是好类型。',
      },
    ],
  },
  {
    slug: 'chengdu-indie-three-months',
    title: '在成都做独立开发的三个月：节奏、收入与咖啡馆',
    date: '2026-07-12',
    minutes: 8,
    tags: ['独立开发', '成都'],
    summary:
      '从大厂离职满三个月：接了两单外包、写了一个没人用的小工具、把博客从 Figma 画到了上线。一些真实数字和一些反思。',
    blocks: [
      {
        type: 'paragraph',
        text: '五月初从软件园的那份工作离职时，我给自己定的目标是「六个月内不接活也不焦虑」。现在三个月过去，先汇报数字：外包收入刚好覆盖社保加房租的七成，自己的小产品月收入还没过三位数，但博客的订阅数从 40 涨到了 460。',
      },
      {
        type: 'heading',
        level: 2,
        text: '节奏比自律重要',
      },
      {
        type: 'paragraph',
        text: '在家工作的头两周我把日程排得很满，结果第三周就崩了。现在的节奏是：上午三个小时写代码，下午看资料或者出门，晚上只做记录不做产出。玉林和望平街的咖啡馆轮流坐，人多但吵得均匀，反而比安静的共享办公室更容易进入状态。',
      },
      {
        type: 'list',
        items: [
          '外包报价按「预估工时 × 2」报，留出沟通成本',
          '每周留一个「垃圾日」，专门写不会发布的东西',
          '把最想拖的事放在上午第一件，下午只配做简单事',
        ],
      },
      {
        type: 'heading',
        level: 2,
        text: '关于孤独',
      },
      {
        type: 'paragraph',
        text: '独立开发最意外的成本是没有人跟你 review。我的土办法是把每篇技术文章当作公开的 pull request：写清楚动机、写清楚取舍，评论区偶尔真的会有人来指出问题。这套博客就是我给自己搭的 code review 流程，慢，但有效。',
      },
    ],
  },
  {
    slug: 'vite7-tailwind4-blog-refactor',
    title: '用 Vite 7 与 Tailwind 4 重构博客：一次迁移记录',
    date: '2026-06-20',
    minutes: 11,
    tags: ['前端', 'TypeScript'],
    summary:
      '从 webpack 老项目迁到 Vite 7 + Tailwind 4：@theme 内联令牌、CSS-first 配置、以及内容体积对比。附迁移 checklist。',
    blocks: [
      {
        type: 'paragraph',
        text: '老博客是 2021 年配的 webpack 5，配置文件七百多行，我早就不敢动了。这次趁 Tailwind 4 的 CSS-first 配置稳定下来，花一个周末整体迁到 Vite 7，冷启动从 11 秒变成 0.4 秒，构建产物从 312KB 降到 187KB。',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Tailwind 4 的 @theme 是令牌系统的正确形态',
      },
      {
        type: 'paragraph',
        text: '过去要在 tailwind.config.js 里维护一份 design token，再想办法同步到 CSS 变量。现在令牌直接写在 CSS 里，@theme inline 让工具类引用运行时变量，暗色主题就是换一组变量的事，不需要 dark: 前缀刷屏。',
      },
      {
        type: 'code',
        lang: 'CSS',
        code: `@import 'tailwindcss';

@theme inline {
  --color-ink: var(--z-ink);
  --color-paper: var(--z-paper);
  --text-body: 16px;
  --text-body--line-height: 1.75;
}

[data-theme='dark'] {
  --z-ink: #e8e6dd;
  --z-paper: #16201b;
}`,
      },
      {
        type: 'list',
        items: [
          '先迁 Vite 再迁 Tailwind，一次只动一个变量',
          'PostCSS 插件换成 @tailwindcss/vite 后删掉 autoprefixer',
          '旧项目里的 @apply 能少用就少用，迁完再清理',
        ],
      },
      {
        type: 'paragraph',
        text: '唯一的坑是第三方组件库里的深度选择器：v4 的层级选择语法变了，几个 :deep() 要重写。迁移 checklist 我整理在了仓库 wiki，有需要的自取。',
      },
    ],
  },
  {
    slug: 'wasm-panda-first-try',
    title: '把 Rust 编译进浏览器：WASM 初试，一个掉帧的小Demo',
    date: '2026-05-30',
    minutes: 13,
    tags: ['Rust', 'WebAssembly'],
    summary:
      '用 Rust 写一个墨迹笔刷效果的内核，编译成 WASM 在 Canvas 上跑。经历三次掉帧、两次内存泄漏之后，总结出的 wasm-bindgen 实践。',
    blocks: [
      {
        type: 'paragraph',
        text: '博客里的墨迹笔刷最初是纯 JS 实现的，粒子一多就掉帧。我把它的一部分（噪声场和粒子积分）搬进 Rust 编译成 WASM，单帧耗时从 4.1ms 降到 1.6ms。这篇文章记录完整过程，包括我踩过的两个经典内存坑。',
      },
      {
        type: 'heading',
        level: 2,
        text: '数据怎么过边界',
      },
      {
        type: 'code',
        lang: 'Rust',
        code: `use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct BrushField {
    width: usize,
    height: usize,
    noise: Vec<f32>,
}

#[wasm_bindgen]
impl BrushField {
    #[wasm_bindgen(getter)]
    pub fn ptr(&self) -> *const f32 {
        self.noise.as_ptr()
    }

    pub fn step(&mut self, dt: f32) {
        for v in self.noise.iter_mut() {
            *v = (*v + dt * 0.5).clamp(0.0, 1.0);
        }
    }
}`,
      },
      {
        type: 'paragraph',
        text: '第一次我是每帧 copy 一个新 Vec 过去的，GC 压力直接把帧率打崩。正确姿势是 JS 侧持有一块固定长度的 Float32Array 视图，Rust 只往里写。第二个坑是忘记把 ImageData 的 buffer 与 WASM 内存对齐，颜色通道全错位。',
      },
      {
        type: 'list',
        items: [
          '分配一次、反复写入，避免每帧跨界拷贝',
          '用 wasm-pack 构建，target 选 web 而不是 bundler',
          '性能基线先在 JS 里测清楚，别为了 0.3ms 上 WASM',
        ],
      },
      {
        type: 'paragraph',
        text: '坦白说这个 demo 最终没有上线，因为 60fps 的收益撑不起 90KB 的 wasm 体积。但过程让我对浏览器里的性能预算有了具体的手感，这 90KB 买的不是性能，是测量能力。',
      },
    ],
  },
];
