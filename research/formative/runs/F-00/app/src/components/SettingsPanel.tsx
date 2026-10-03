import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { BACKGROUNDS } from '../lib/backgrounds';
import { fileToBackgroundDataUrl } from '../lib/imageScale';
import { fetchPicsumPage, picsumThumb, randomPicsumPage, type PicsumPhoto } from '../lib/picsum';
import type { BgId, Durations, RemoteBackground } from '../lib/types';

/** dataURL 上限 2.5MB（超出拒绝写入 localStorage） */
const CUSTOM_BG_LIMIT = 2.5 * 1024 * 1024;

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  durations: Durations;
  onDurations: (d: Durations) => void;
  soundOn: boolean;
  onSound: (on: boolean) => void;
  bgId: BgId;
  customBg: string | null;
  remoteBg: RemoteBackground | null;
  onSelectBg: (id: BgId) => void;
  onCustomBg: (dataUrl: string) => void;
  onRemotePick: (photo: PicsumPhoto) => void;
}

const FIELDS: Array<{ key: keyof Durations; label: string; min: number; max: number }> = [
  { key: 'focus', label: '番茄时长（分）', min: 1, max: 180 },
  { key: 'short', label: '短休时长（分）', min: 1, max: 180 },
  { key: 'long', label: '长休时长（分）', min: 1, max: 180 },
];

export function SettingsPanel(props: SettingsPanelProps) {
  const firstInputRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgError, setBgError] = useState('');

  /* ---------- 素材工坊 ---------- */
  const [photos, setPhotos] = useState<PicsumPhoto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const lastPageRef = useRef(0);
  const bootedRef = useRef(false);

  const loadWorkshop = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const page = randomPicsumPage(lastPageRef.current || undefined);
    setLoading(true);
    setFetchError('');
    try {
      const list = await fetchPicsumPage(page, controller.signal);
      lastPageRef.current = page;
      setPhotos(list);
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setFetchError('拉取失败，请检查网络后重试');
      }
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  // 首次展开自动拉随机页（面板常挂载，booted 保证只自动拉一次）
  useEffect(() => {
    if (props.open && !bootedRef.current) {
      bootedRef.current = true;
      void loadWorkshop();
    }
  }, [props.open, loadWorkshop]);

  useEffect(() => {
    if (props.open) firstInputRef.current?.querySelector<HTMLInputElement>('input')?.focus();
  }, [props.open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') props.onClose();
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = ''; // 允许重选同一文件
    if (!file) return;
    setBgError('');
    try {
      const dataUrl = await fileToBackgroundDataUrl(file);
      if (dataUrl.length > CUSTOM_BG_LIMIT) {
        setBgError('图片过大，请换小图');
        return;
      }
      props.onCustomBg(dataUrl);
    } catch {
      setBgError('图片解析失败，请换一张');
    }
  };

  if (!props.open) return null;

  return (
    <div
      ref={firstInputRef}
      className="settings-panel"
      role="dialog"
      aria-label="设置"
      onKeyDown={onKeyDown}
    >
      <h2>设置</h2>
      {FIELDS.map((f) => (
        <label key={f.key}>
          <span>{f.label}</span>
          <input
            type="number"
            min={f.min}
            max={f.max}
            value={props.durations[f.key]}
            onChange={(e) => {
              const v = Math.min(f.max, Math.max(f.min, Number(e.target.value) || f.min));
              props.onDurations({ ...props.durations, [f.key]: v });
            }}
          />
        </label>
      ))}
      <label>
        <span>完成提示音</span>
        <input
          type="checkbox"
          checked={props.soundOn}
          onChange={(e) => props.onSound(e.target.checked)}
        />
      </label>

      <div className="settings-bg">
        <span className="settings-heading">背景</span>
        <div className="bg-grid" role="group" aria-label="背景选择">
          {BACKGROUNDS.map((b) => {
            const active = props.bgId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                className="bg-tile"
                data-active={active}
                aria-pressed={active}
                title={b.label}
                onClick={() => props.onSelectBg(b.id)}
              >
                {b.url ? <img src={b.url} alt="" loading="lazy" decoding="async" /> : null}
                <span className="bg-tile-label">{b.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            className="bg-tile bg-tile--custom"
            data-active={props.bgId === 'custom'}
            aria-pressed={props.bgId === 'custom'}
            aria-label={props.customBg ? '使用自定义背景' : '上传自定义背景'}
            onClick={() => (props.customBg ? props.onSelectBg('custom') : fileInputRef.current?.click())}
          >
            {props.customBg ? <img src={props.customBg} alt="" /> : null}
            <span className="bg-tile-label">自定义</span>
          </button>
        </div>
        <label className="upload-btn">
          上传自定义背景
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={handleFile}
          />
        </label>
        {bgError && (
          <p className="bg-error" role="alert">
            {bgError}
          </p>
        )}
      </div>

      {/* 素材工坊：Picsum（Unsplash 免费库）在线选图 */}
      <div className="workshop">
        <div className="workshop-head">
          <span className="settings-heading">素材工坊</span>
          <div className="workshop-actions">
            <button
              type="button"
              className="inspire-btn"
              disabled={loading}
              onClick={() => void loadWorkshop()}
            >
              拉取一批
            </button>
            <button
              type="button"
              className="inspire-btn"
              disabled={loading || photos === null}
              onClick={() => void loadWorkshop()}
            >
              换一批
            </button>
          </div>
        </div>
        {props.bgId === 'remote' && props.remoteBg && (
          <p className="workshop-source">
            当前来源：{props.remoteBg.author} ·{' '}
            <a href={props.remoteBg.page} target="_blank" rel="noreferrer">
              Unsplash 原页
            </a>
          </p>
        )}
        {loading && <p className="workshop-status">拉取中…</p>}
        {fetchError && (
          <p className="workshop-error" role="alert">
            {fetchError}
          </p>
        )}
        {photos && photos.length > 0 && (
          <div className="workshop-grid" role="group" aria-label="在线素材">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                className="bg-tile"
                title={`作者 ${p.author}`}
                aria-label={`应用素材背景，作者 ${p.author}`}
                onClick={() => props.onRemotePick(p)}
              >
                <img src={picsumThumb(p.id)} alt="" loading="lazy" decoding="async" />
                <span className="bg-tile-label">{p.author}</span>
              </button>
            ))}
          </div>
        )}
        {photos && photos.length === 0 && !loading && !fetchError && (
          <p className="workshop-status">这一批没有可用素材，换一批试试。</p>
        )}
      </div>

      <button type="button" className="btn-ghost" onClick={props.onClose}>
        关闭
      </button>
    </div>
  );
}
