import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { BatteryFull, Camera, Cpu } from "lucide-react";

const VARIANTS = [
  { id: "obsidian", name: "曜石黑", screen: "linear-gradient(160deg, #2b3441 0%, #12161d 70%)", chip: "#2b3441" },
  { id: "moss", name: "苔原绿", screen: "linear-gradient(160deg, #31402f 0%, #131a14 70%)", chip: "#31402f" },
  { id: "frost", name: "霜银", screen: "linear-gradient(160deg, #46505c 0%, #1a2027 70%)", chip: "#46505c" },
] as const;

type Variant = (typeof VARIANTS)[number];

const SPECS = [
  { icon: Camera, k: "主摄", v: "100MP·演示" },
  { icon: Cpu, k: "制程", v: "3nm·演示" },
  { icon: BatteryFull, k: "电池", v: "5400mAh·演示" },
];

function DeviceClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 20_000);
    return () => window.clearInterval(timer);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return (
    <div className="device__clock">
      <span className="mono device__time">{hh}:{mm}</span>
      <span className="device__date">{now.getMonth() + 1}月{now.getDate()}日 · 演示屏幕</span>
    </div>
  );
}

export default function App() {
  const [variant, setVariant] = useState<Variant>(VARIANTS[0]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <span className="wordmark">曜石</span>
        <span className="badge-demo">DEMO · 演示数据</span>
      </header>

      <main className="hero">
        <motion.div
          className="device-col"
          {...(reduced
            ? {}
            : {
                whileHover: { y: -6, scale: 1.02 },
                transition: { type: "spring", bounce: 0.25, visualDuration: 0.4 },
              })}
        >
          <div className="device" style={{ ["--screen" as string]: variant.screen }}>
            <i className="device__camera" aria-hidden="true" />
            <DeviceClock />
          </div>
        </motion.div>

        <section className="content" aria-label="产品信息">
          <p className="eyebrow">曜石 · 影像 + 性能双旗舰</p>
          <h1>曜石 X1</h1>
          <p className="lede">
            一眼理解的产品主张：影像与性能不分先后。变体、规格与价格均为演示数据。
          </p>

          <div className="variants" role="group" aria-label="配色变体">
            {VARIANTS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={variant.id === option.id}
                className={variant.id === option.id ? "chip is-active" : "chip"}
                onClick={() => setVariant(option)}
              >
                <i className="chip__dot" style={{ background: option.chip }} aria-hidden="true" />
                {option.name}
              </button>
            ))}
          </div>

          <dl className="specs">
            {SPECS.map(({ icon: Icon, k, v }) => (
              <div className="spec" key={k}>
                <dt>
                  <Icon size={15} aria-hidden="true" />
                  {k}
                </dt>
                <dd className="mono">{v}</dd>
              </div>
            ))}
          </dl>

          <motion.button
            type="button"
            className="cta"
            {...(reduced ? {} : { whileTap: { scale: 0.97 } })}
            onClick={() => showToast("演示环境：「锁定首发优惠」未接入真实系统")}
          >
            锁定首发优惠
          </motion.button>
          <p className="fineprint">
            本页面为虚构品牌演示页（品牌与型号致敬仓库内 phone-demo 契约），
            规格与价格均为演示数据，不构成任何购买要约。
          </p>
        </section>
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
