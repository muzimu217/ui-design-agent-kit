import { Link } from 'react-router-dom';

/** 404（§7.12）：irasutoya 迷路熊猫 200px + display「404」+ 文案 + 返回首页。 */
export function NotFoundPage({ message = '这一页好像被熊猫啃掉了' }: { message?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <img
        src="/irasutoya/animal_panda_back.png"
        alt="いらすとや插画：背对镜头、迷了路的熊猫"
        width={200}
        height={211}
        className="w-[200px] max-w-full"
      />
      <p className="m-0 mt-4 font-kai text-display font-bold text-text" aria-hidden="true">
        404
      </p>
      <h1 className="sr-only">页面不存在（404）</h1>
      <p className="mt-2 text-body text-text-secondary">{message}</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-[var(--z-link)] px-5 py-2.5 text-body font-medium text-on-brand transition-colors duration-150 hover:bg-[var(--z-link-hover)]"
      >
        返回首页
      </Link>
    </div>
  );
}

export default NotFoundPage;
