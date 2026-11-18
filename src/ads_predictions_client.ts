/* Adsgram monetization, Sponsors + RFS Bonus, Friendly Ad Gates, Club Owner Profiles, Matchday Predictions League, and National Team Proposals */

interface AppBridge {
  api: (path: string, body?: any) => Promise<any>;
  act: (fn: () => Promise<any>, okMsg?: string | ((d: any) => string)) => Promise<any>;
  e: (s: any) => string;
  toast: (msg: string, isErr?: boolean) => void;
  modal: (html: string, mount?: (el: HTMLElement, close: () => void) => void) => void;
  S: { tok: string; code: string; me: any; st: any };
  teamName: (id: string) => string;
  teamLogo: (id: string) => string;
  compName: (id: string) => string;
  pgClub: (app: HTMLElement) => Promise<void>;
  pgNational: (app: HTMLElement) => Promise<void>;
  pgAdmin: (app: HTMLElement) => Promise<void>;
  getClubTid: () => string;
}

declare global {
  interface Window {
    __RPL_APP__?: AppBridge;
    Adsgram?: {
      init: (opts: { blockId: string }) => {
        show: () => Promise<{ done?: boolean; state?: string; description?: string }>;
      };
    };
    Telegram?: any;
    __RPL_EXT__?: any;
  }
}

function getClientUid(): string {
  try {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id) {
      const id = `tg_${tgUser.id}`;
      localStorage.setItem('rpl_client_uid', id);
      return id;
    }
    let uid = localStorage.getItem('rpl_client_uid') || '';
    if (!uid) {
      uid = 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem('rpl_client_uid', uid);
    }
    return uid;
  } catch {
    return 'u_browser';
  }
}

function getTgUserMeta(): { name: string; photo: string } {
  try {
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!u) return { name: '', photo: '' };
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.username || '';
    const photo = typeof u.photo_url === 'string' ? u.photo_url : '';
    return { name, photo };
  } catch {
    return { name: '', photo: '' };
  }
}

export function getClientHeaders(): Record<string, string> {
  const meta = getTgUserMeta();
  const h: Record<string, string> = { 'X-Client-Id': getClientUid() };
  if (meta.name) h['X-Tg-Name'] = encodeURIComponent(meta.name);
  if (meta.photo) h['X-Tg-Photo'] = meta.photo;
  return h;
}

function B(): AppBridge {
  return window.__RPL_APP__!;
}

function fmtEuro(n: number): string {
  const v = Math.round(Number(n) || 0);
  return v < 0 ? '-€' + Math.abs(v).toLocaleString('ru-RU') : '€' + v.toLocaleString('ru-RU');
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':');
}

/**
 * Executes an Adsgram ad block:
 * - Uses native window.Adsgram.init({ blockId }).show() when SDK is available & real numeric/task blockId is configured.
 * - Falls back to an interactive Adsgram Ad Player modal in web/preview environments, enforcing duration & optional click-through.
 */
export async function runAdsgramBlock(
  blockKey: string,
  title: string,
  subtitle?: string
): Promise<{ adProof: string; blockKey: string; clicked: boolean } | null> {
  const { api, e, toast, modal } = B();
  let session: any;
  try {
    session = await api('/ads/start', { blockKey });
  } catch (err: any) {
    toast(err?.message || 'Не удалось запустить рекламный блок', true);
    return null;
  }

  const blockId = String(session.blockId || '');
  const requiresClick = !!session.requiresClick;
  const isRealAdsgramBlock = typeof window.Adsgram?.init === 'function' && (/^\d+$/.test(blockId) || blockId.startsWith('task-'));

  if (isRealAdsgramBlock) {
    try {
      const controller = window.Adsgram!.init({ blockId });
      const res = await controller.show();
      const completed = await api('/ads/complete', {
        sessionToken: session.sessionToken,
        clicked: requiresClick ? true : !!res?.done,
        sdkCompleted: true,
      });
      return { adProof: completed.adProof, blockKey, clicked: !!completed.clicked };
    } catch (err: any) {
      toast(err?.description || err?.message || 'Просмотр рекламы Adsgram отменён', true);
      return null;
    }
  }

  // Interactive preview/web player (supports both timer and required click-through)
  const previewSec = session.format === 'long' || session.format === 'click_long' ? 6 : 4;
  return new Promise((resolve) => {
    let resolved = false;
    let timerId: any = null;
    let remaining = previewSec;
    let clickedAd = false;

    const finishResolve = (val: { adProof: string; blockKey: string; clicked: boolean } | null) => {
      if (resolved) return;
      resolved = true;
      if (timerId) clearInterval(timerId);
      resolve(val);
    };

    const html = `
      <div style="max-width:460px;margin:0 auto">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:#5b7064">Adsgram Network · Блок <code>${e(blockId)}</code></div>
          <span id="ad_timer_badge" style="font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;color:#0d2f21;background:#fef3c7;padding:3px 9px;border-radius:6px">${remaining} сек</span>
        </div>
        <h3 style="margin:0 0 6px;font-size:17px">${e(title)}</h3>
        ${subtitle ? `<div class="small muted" style="margin-bottom:12px">${e(subtitle)}</div>` : ''}
        <div style="background:linear-gradient(135deg,#0d2f21 0%,#1b5c3f 100%);color:#fff;border-radius:10px;padding:18px;margin-bottom:12px;border:1px solid #2f7d55">
          <div style="font-size:11px;color:#cfe3d6;margin-bottom:6px">${session.format === 'banner' ? 'Рекламный баннер' : session.format === 'click_long' ? 'Большой рекламный ролик (требуется переход)' : session.format === 'long' ? 'Длинный видеоролик (30с)' : 'Короткий видеоролик (5с)'}</div>
          <div style="font-weight:700;font-size:16px;margin-bottom:6px">Официальная реклама партнёров лиги</div>
          <div style="font-size:13px;color:#e8eee9;line-height:1.45;margin-bottom:12px">
            ${requiresClick
              ? 'Для подачи заявки на товарищеский матч дождитесь окончания таймера и обязательно нажмите на рекламное предложение ниже.'
              : 'Дождитесь завершения просмотра рекламного блока, чтобы получить награду.'}
          </div>
          <div style="height:6px;background:rgba(255,255,255,0.2);border-radius:99px;overflow:hidden;margin-bottom:${requiresClick ? '12px' : '0'}">
            <div id="ad_prog_bar" style="height:100%;width:0%;background:#f0c419;transition:width 0.35s linear"></div>
          </div>
          ${requiresClick ? `
            <button type="button" id="ad_click_cta" class="btn" style="width:100%;background:#f0c419;color:#0d2f21;font-weight:700;min-height:44px">
              Перейти по рекламе (обязательный клик)
            </button>
            <div id="ad_click_status" style="font-size:12px;color:#fef08a;margin-top:6px;text-align:center">Клик по рекламе ещё не выполнен</div>
          ` : ''}
        </div>
        <div class="row" style="gap:8px;justify-content:flex-end">
          <button type="button" id="ad_cancel_btn" class="btn alt sm" style="min-height:42px">Отмена</button>
          <button type="button" id="ad_done_btn" class="btn sm" disabled style="min-height:42px;opacity:0.55">Подождите (${remaining}с)</button>
        </div>
        <div class="small muted" style="margin-top:8px;font-size:11px">В Telegram Mini App здесь запускается нативный контроллер Adsgram с Block ID «${e(blockId)}».</div>
      </div>
    `;

    modal(html, (el, close) => {
      const timerBadge = el.querySelector('#ad_timer_badge') as HTMLElement;
      const progBar = el.querySelector('#ad_prog_bar') as HTMLElement;
      const doneBtn = el.querySelector('#ad_done_btn') as HTMLButtonElement;
      const cancelBtn = el.querySelector('#ad_cancel_btn') as HTMLButtonElement;
      const ctaBtn = el.querySelector('#ad_click_cta') as HTMLButtonElement | null;
      const clickStatus = el.querySelector('#ad_click_status') as HTMLElement | null;

      const syncDoneState = () => {
        const timerReady = remaining <= 0;
        const clickReady = !requiresClick || clickedAd;
        if (timerReady && clickReady) {
          doneBtn.disabled = false;
          doneBtn.style.opacity = '1';
          doneBtn.textContent = 'Подтвердить просмотр';
        } else if (timerReady && !clickReady) {
          doneBtn.disabled = true;
          doneBtn.style.opacity = '0.55';
          doneBtn.textContent = 'Нажмите по рекламе выше';
        } else {
          doneBtn.disabled = true;
          doneBtn.style.opacity = '0.55';
          doneBtn.textContent = `Подождите (${remaining}с)`;
        }
      };

      if (ctaBtn) {
        ctaBtn.onclick = () => {
          clickedAd = true;
          ctaBtn.textContent = 'Переход выполнен ✓';
          ctaBtn.style.background = '#bbf7d0';
          if (clickStatus) {
            clickStatus.textContent = 'Клик по рекламе подтверждён ✓';
            clickStatus.style.color = '#86efac';
          }
          syncDoneState();
        };
      }

      const updateProgress = () => {
        const pct = Math.min(100, Math.round(((previewSec - remaining) / previewSec) * 100));
        if (progBar) progBar.style.width = `${pct}%`;
        if (timerBadge) timerBadge.textContent = remaining > 0 ? `${remaining} сек` : 'Готово';
        syncDoneState();
      };

      updateProgress();
      timerId = setInterval(() => {
        remaining = Math.max(0, remaining - 1);
        updateProgress();
        if (remaining <= 0) {
          clearInterval(timerId);
          timerId = null;
        }
      }, 1000);

      cancelBtn.onclick = () => {
        close();
        finishResolve(null);
      };

      doneBtn.onclick = async () => {
        doneBtn.disabled = true;
        doneBtn.textContent = 'Проверка…';
        try {
          const completed = await api('/ads/complete', {
            sessionToken: session.sessionToken,
            clicked: clickedAd,
            sdkCompleted: false,
          });
          close();
          finishResolve({ adProof: completed.adProof, blockKey, clicked: !!completed.clicked });
        } catch (err: any) {
          toast(err?.message || 'Ошибка подтверждения рекламы', true);
          doneBtn.disabled = false;
          syncDoneState();
        }
      };

      // Also handle clicking backdrop to cancel
      const observer = new MutationObserver(() => {
        if (!document.body.contains(el)) {
          observer.disconnect();
          finishResolve(null);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  });
}

// ─── Owner Profile Modal (used in Predictions Leaderboard & Club) ─────────────
export async function openOwnerProfileModal(actorKey: string) {
  const { api, e, modal, toast } = B();
  try {
    const data = await api('/profile/' + encodeURIComponent(actorKey));
    const p = data.profile;
    const st = data.stats || {};
    const tm = data.team;
    const initials = (p.displayName || 'В').slice(0, 2).toUpperCase();
    const avatarHtml = p.photoUrl
      ? `<img src="${e(p.photoUrl)}" alt="${e(p.displayName)}" referrerpolicy="no-referrer" style="width:76px;height:76px;border-radius:14px;object-fit:cover;border:2px solid var(--line)" onerror="this.style.display='none'"/>`
      : `<div style="width:76px;height:76px;border-radius:14px;background:#0d2f21;color:#fff;display:flex;align-items:center;justify-content:center;font:700 24px Unbounded,sans-serif">${e(initials)}</div>`;

    modal(`
      <div style="max-width:520px;margin:0 auto">
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">
          ${avatarHtml}
          <div style="flex:1;min-width:0">
            <h2 style="margin:0 0 4px">${e(p.displayName)}</h2>
            <div class="small muted">
              ${tm ? `${e(tm.name)} · ${e(tm.compName)}` : 'Участник Лиги прогнозов'}
              ${st.rank ? ` · #${st.rank} в рейтинге` : ''}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:14px;font-variant-numeric:tabular-nums">
          <div style="background:var(--soft);padding:10px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#15803d">${st.correct || 0}</div>
            <div class="small muted">Угадал</div>
          </div>
          <div style="background:var(--soft);padding:10px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#b91c1c">${st.wrong || 0}</div>
            <div class="small muted">Не угадал</div>
          </div>
          <div style="background:var(--soft);padding:10px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700">${st.kpd || 0}%</div>
            <div class="small muted">КПД</div>
          </div>
          <div style="background:var(--soft);padding:10px;border-radius:8px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:var(--deep)">${st.points || 0}</div>
            <div class="small muted">Очки</div>
          </div>
        </div>

        ${p.bio ? `<div style="margin-bottom:10px"><div style="font-weight:600;font-size:13px;margin-bottom:2px">О владельце</div><div class="small" style="line-height:1.45">${e(p.bio)}</div></div>` : ''}
        ${p.career ? `<div style="margin-bottom:12px"><div style="font-weight:600;font-size:13px;margin-bottom:2px">Карьера</div><div class="small" style="line-height:1.45;white-space:pre-line">${e(p.career)}</div></div>` : ''}

        <div>
          <div style="font-weight:600;font-size:13px;margin-bottom:6px">Успехи и трофеи (${(p.trophies || []).length})</div>
          ${(p.trophies || []).length
            ? p.trophies.map((tr: any) => `
              <div style="padding:8px 10px;border:1px solid var(--line);border-radius:8px;margin-bottom:6px;background:var(--panel)">
                <div style="font-weight:600;font-size:13px">${e(tr.title)}</div>
                <div class="small muted">${e(tr.detail || '')} · ${e(tr.date || '')}</div>
              </div>`).join('')
            : '<div class="small muted">Пока нет завоёванных сезонных наград.</div>'}
        </div>
      </div>
    `);
  } catch (err: any) {
    toast(err?.message || 'Не удалось загрузить профиль', true);
  }
}

// ─── Club Tab 1: Sponsors + RFS Bonus ─────────────────────────────────────────
let sponsorTimerHandle: any = null;

export function renderClubSponsorsTab(cb: HTMLElement, c: any, reloadClub: () => void) {
  const { api, e, toast, S, getClubTid } = B();
  const sp = c.sponsors;
  if (!sp) {
    cb.innerHTML = '<div class="panel">Данные спонсоров недоступны.</div>';
    return;
  }
  const teamParam = S.me?.role === 'admin' ? { teamId: getClubTid() } : {};
  const pct = Math.min(100, Math.round((sp.totalViews / sp.totalRequired) * 100));

  const sponsorCards = sp.sponsors
    .map((s: any) => {
      const done = s.views >= s.maxViews;
      return `
      <div class="panel" style="margin-bottom:0;display:flex;flex-direction:column;justify-content:space-between;border-top:3px solid ${s.accentColor}">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px">
            <div>
              <div style="font:700 16px Unbounded,sans-serif">${e(s.name)}</div>
              <div class="small muted">${e(s.tagline)}</div>
            </div>
            <div style="font-variant-numeric:tabular-nums;font-weight:700;font-size:15px;color:#15803d;white-space:nowrap">+${fmtEuro(s.rewardEur)}</div>
          </div>
          <div class="small" style="margin-bottom:10px;line-height:1.4">${e(s.description)}</div>
          <div class="small muted" style="margin-bottom:10px;font-variant-numeric:tabular-nums">
            ${e(s.formatLabel)} · Одобрение 95/5 · Блок: <code>${e(s.blockId)}</code>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:4px;font-variant-numeric:tabular-nums">
            <span>Показы за цикл</span>
            <span>${s.views} / ${s.maxViews} (одобрено: ${s.approvedCount}${s.declinedCount ? `, отказ: ${s.declinedCount}` : ''})</span>
          </div>
          <div style="height:7px;background:var(--soft);border-radius:99px;overflow:hidden;margin-bottom:12px">
            <div style="height:100%;width:${Math.round((s.views / s.maxViews) * 100)}%;background:${s.accentColor}"></div>
          </div>
          <button class="btn" data-sp-ask="${e(s.id)}" data-sp-block="${e(s.blockKey)}" data-sp-name="${e(s.name)}" ${done ? 'disabled' : ''} style="width:100%;min-height:44px;${done ? 'opacity:0.55' : ''}">
            ${done ? 'Лимит 10/10 выполнен' : `Попросить деньги (${fmtEuro(s.rewardEur)})`}
          </button>
        </div>
      </div>`;
    })
    .join('');

  cb.innerHTML = `
    <div class="panel">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
        <div>
          <h2 style="margin:0 0 4px">Спонсорская программа клуба</h2>
          <div class="small muted">Запросите финансирование у 3 спонсоров (вероятность одобрения 95/5). Всего 30 показов (10 + 10 + 10) открывают бонус от РФС.</div>
        </div>
        <div style="text-align:right;font-variant-numeric:tabular-nums">
          <div class="small muted">Сброс 24-часового цикла</div>
          <div id="sp_reset_timer" style="font:700 18px Unbounded,sans-serif;color:var(--deep)">${sp.resetAt ? fmtCountdown(sp.remainingMs) : 'Цикл не начат'}</div>
        </div>
      </div>

      <div style="background:var(--soft);border-radius:10px;padding:12px 14px;border:1px solid var(--line);margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;margin-bottom:6px;font-variant-numeric:tabular-nums">
          <span>Прогресс до бонуса РФС</span>
          <span>${sp.totalViews} / ${sp.totalRequired} реклам · Заработано в цикле: ${fmtEuro(sp.earnedEurCycle + sp.rfsEarnedEur)}</span>
        </div>
        <div style="height:10px;background:#dce6de;border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--green);transition:width 0.3s"></div>
        </div>
        <div class="small muted" style="margin-top:6px">
          Важно: если не успеть посмотреть все 30 реклам за 24 часа с момента первого просмотра (даже если не хватило 1 рекламы), прогресс сбросится на 0/30.
        </div>
      </div>

      <div class="grid g3">${sponsorCards}</div>
    </div>

    <div class="panel" style="border:1.5px solid ${sp.rfsUnlocked ? '#15803d' : 'var(--line)'};background:${sp.rfsUnlocked ? '#f0fdf4' : 'var(--panel)'}">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
        <div style="flex:1;min-width:240px">
          <h3 style="margin:0 0 4px">Бонус от РФС — Премиум-финансирование</h3>
          <div class="small" style="line-height:1.45">
            ${sp.rfsUnlocked
              ? `Все 30 реклам просмотрены! ${sp.rfsClaimed
                  ? `Бонус активирован. Каждая дополнительная реклама в этом блоке приносит +€1 000 в бюджет клуба (просмотрено: ${sp.rfsExtraViews}/${sp.rfsMaxViews}, заработано: ${fmtEuro(sp.rfsEarnedEur)}).`
                  : 'Нажмите кнопку и посмотрите 1 бонусную рекламу РФС, чтобы получить +€1 000 и открыть режим выплат по €1 000 за каждый следующий показ до сброса 24ч!'}`
              : `Откроется после просмотра всех 30 реклам у 3 спонсоров (осталось ${sp.totalRequired - sp.totalViews}). После активации каждая дополнительная реклама приносит по €1 000 до конца 24-часового цикла.`}
          </div>
          <div class="small muted" style="margin-top:4px">Рекламный блок Adsgram: <code>${e(sp.rfsBlockId)}</code></div>
        </div>
        <button class="btn" id="sp_rfs_btn" ${!sp.rfsUnlocked || sp.rfsExtraViews >= sp.rfsMaxViews ? 'disabled' : ''} style="min-height:46px;${!sp.rfsUnlocked ? 'opacity:0.5' : ''}">
          ${!sp.rfsUnlocked
            ? `Заблокировано (${sp.totalViews}/30)`
            : sp.rfsExtraViews >= sp.rfsMaxViews
              ? 'Лимит блока 30/30 исчерпан'
              : sp.rfsClaimed
                ? 'Смотреть рекламу РФС (+€1 000)'
                : 'Получить бонус от РФС (+€1 000)'}
        </button>
      </div>
    </div>

    <div class="panel">
      <h3 style="margin:0 0 10px">История обращений к спонсорам и РФС</h3>
      ${sp.history.length
        ? `<div class="wrap"><table><thead><tr><th class="l">Источник</th><th class="l">Решение</th><th>Сумма</th><th class="l">Время</th></tr></thead><tbody>
          ${sp.history.map((h: any) => `
            <tr>
              <td class="l"><b>${e(h.sponsorName)}</b></td>
              <td class="l">${h.approved ? '<span style="color:#15803d;font-weight:600">Одобрено</span>' : '<span style="color:#b91c1c;font-weight:600">Отказ (5%)</span>'}</td>
              <td style="font-variant-numeric:tabular-nums">${h.approved ? `+${fmtEuro(h.amount)}` : '€0'}</td>
              <td class="l small muted">${new Date(h.date).toLocaleString('ru-RU')}</td>
            </tr>`).join('')}
        </tbody></table></div>`
        : '<div class="small muted">Обращений в этом цикле пока нет.</div>'}
    </div>
  `;

  if (sponsorTimerHandle) clearInterval(sponsorTimerHandle);
  if (sp.resetAt) {
    sponsorTimerHandle = setInterval(() => {
      const el = document.getElementById('sp_reset_timer');
      if (!el) {
        clearInterval(sponsorTimerHandle);
        return;
      }
      const left = sp.resetAt - Date.now();
      el.textContent = left > 0 ? fmtCountdown(left) : 'Сброс…';
    }, 1000);
  }

  cb.querySelectorAll('[data-sp-ask]').forEach((btn) => {
    (btn as HTMLButtonElement).onclick = async () => {
      const sponsorId = (btn as HTMLElement).dataset.spAsk!;
      const blockKey = (btn as HTMLElement).dataset.spBlock!;
      const spName = (btn as HTMLElement).dataset.spName!;
      const adRes = await runAdsgramBlock(blockKey, `Запрос к спонсору «${spName}»`, 'После просмотра спонсор рассмотрит заявку (вероятность одобрения 95/5).');
      if (!adRes) return;
      try {
        const res = await api('/club/sponsors/request', { ...teamParam, sponsorId, adProof: adRes.adProof });
        toast(res.message, !res.approved);
        reloadClub();
      } catch (err: any) {
        toast(err?.message || 'Ошибка обращения к спонсору', true);
      }
    };
  });

  const rfsBtn = document.getElementById('sp_rfs_btn') as HTMLButtonElement | null;
  if (rfsBtn && !rfsBtn.disabled) {
    rfsBtn.onclick = async () => {
      const adRes = await runAdsgramBlock('rfs_bonus', 'Бонус от РФС (+€1 000)', 'Премиум-показ после выполнения 30/30 реклам спонсоров.');
      if (!adRes) return;
      try {
        const res = await api('/club/sponsors/rfs-claim', { ...teamParam, adProof: adRes.adProof });
        toast(res.message);
        reloadClub();
      } catch (err: any) {
        toast(err?.message || 'Ошибка получения бонуса РФС', true);
      }
    };
  }
}

// ─── Club Tab 2: Owner Profile ────────────────────────────────────────────────
export async function renderClubOwnerProfileTab(cb: HTMLElement, c: any, reloadClub: () => void) {
  const { api, e, toast, S, getClubTid } = B();
  const teamParam = S.me?.role === 'admin' ? `?teamId=${encodeURIComponent(getClubTid())}` : '';
  let data: any;
  try {
    data = await api('/profile' + teamParam);
  } catch (err: any) {
    cb.innerHTML = `<div class="panel warn">${e(err?.message || 'Ошибка загрузки профиля')}</div>`;
    return;
  }
  const p = data.profile;
  const st = data.stats || {};
  const initials = (p.displayName || 'В').slice(0, 2).toUpperCase();

  cb.innerHTML = `
    <div class="grid g2">
      <div class="panel">
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">
          ${p.photoUrl
            ? `<img id="op_prev_img" src="${e(p.photoUrl)}" alt="${e(p.displayName)}" referrerpolicy="no-referrer" style="width:76px;height:76px;border-radius:14px;object-fit:cover;border:2px solid var(--line)" onerror="this.style.display='none'"/>`
            : `<div id="op_prev_ph" style="width:76px;height:76px;border-radius:14px;background:var(--deep);color:#fff;display:flex;align-items:center;justify-content:center;font:700 22px Unbounded,sans-serif">${e(initials)}</div>`}
          <div>
            <h2 style="margin:0 0 4px">${e(p.displayName)}</h2>
            <div class="small muted">${e(c.team.name)} · ${e(B().compName(c.team.comp))}</div>
            <div class="small" style="margin-top:4px;font-variant-numeric:tabular-nums">
              Прогнозы: <b>${st.correct || 0}</b> угад. / <b>${st.wrong || 0}</b> пром. · КПД <b>${st.kpd || 0}%</b> · Очки: <b>${st.points || 0}</b>
            </div>
          </div>
        </div>

        <label class="small" style="display:block;margin-bottom:10px">Имя владельца (отображается в рейтинге ставок)
          <input id="op_name" value="${e(p.displayName)}" maxlength="60" style="width:100%;margin-top:4px" placeholder="Например: Алексей Смирнов">
        </label>

        <label class="small" style="display:block;margin-bottom:10px">Ссылка на фотографию (или загрузите файл ниже)
          <input id="op_photo_url" value="${e(p.photoUrl && !p.photoUrl.startsWith('data:') ? p.photoUrl : '')}" style="width:100%;margin-top:4px" placeholder="https://...">
        </label>

        <div class="row" style="gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
          <label class="btn alt sm" style="cursor:pointer;display:inline-flex;align-items:center">
            Загрузить фото с устройства
            <input type="file" id="op_photo_file" accept="image/*" style="display:none">
          </label>
          ${p.photoUrl ? '<button type="button" class="btn alt sm" id="op_photo_clear">Удалить фото</button>' : ''}
          <span id="op_photo_hint" class="small muted">${p.photoUrl ? 'Фото установлено' : 'Фото не выбрано'}</span>
        </div>

        <label class="small" style="display:block;margin-bottom:10px">О владельце / футбольная философия
          <textarea id="op_bio" rows="2" maxlength="400" style="width:100%;margin-top:4px" placeholder="Кратко о себе и стиле управления клубом">${e(p.bio || '')}</textarea>
        </label>

        <label class="small" style="display:block;margin-bottom:12px">Карьера и достижения
          <textarea id="op_career" rows="4" maxlength="800" style="width:100%;margin-top:4px" placeholder="Этапы карьеры, ключевые победы, трансферные успехи...">${e(p.career || '')}</textarea>
        </label>

        <button class="btn" id="op_save_btn" style="min-height:44px">Сохранить профиль</button>
      </div>

      <div class="panel">
        <h3 style="margin:0 0 10px">Успехи и трофеи</h3>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:14px;font-variant-numeric:tabular-nums">
          <div style="background:var(--soft);padding:12px;border-radius:8px">
            <div class="small muted">Бюджет клуба</div>
            <div style="font-size:18px;font-weight:700">${fmtEuro(c.budget || 0)}</div>
          </div>
          <div style="background:var(--soft);padding:12px;border-radius:8px">
            <div class="small muted">Монеты прогнозов</div>
            <div style="font-size:18px;font-weight:700">${st.coins ?? 5} мон.</div>
          </div>
        </div>
        ${(p.trophies || []).length
          ? p.trophies.map((tr: any) => `
            <div style="padding:10px 12px;border:1px solid var(--line);border-radius:8px;margin-bottom:8px;background:var(--soft)">
              <div style="font-weight:700;font-size:14px">${e(tr.title)}</div>
              <div class="small muted">${e(tr.detail || '')} · ${e(tr.date || '')}</div>
            </div>`).join('')
          : '<div class="small muted">Занимайте Топ-3 в Лиге прогнозов по итогам сезона или выигрывайте трофеи с клубом, чтобы пополнить зал славы.</div>'}
      </div>
    </div>
  `;

  let pendingPhotoData: string | undefined = undefined;
  const fileInp = document.getElementById('op_photo_file') as HTMLInputElement;
  const hint = document.getElementById('op_photo_hint') as HTMLElement;
  fileInp.onchange = () => {
    const file = fileInp.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 160;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        pendingPhotoData = canvas.toDataURL('image/jpeg', 0.82);
        hint.textContent = 'Фото готово к сохранению ✓';
      };
      img.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const clrBtn = document.getElementById('op_photo_clear');
  if (clrBtn) {
    clrBtn.onclick = () => {
      pendingPhotoData = '';
      (document.getElementById('op_photo_url') as HTMLInputElement).value = '';
      hint.textContent = 'Фото будет удалено после сохранения';
    };
  }

  document.getElementById('op_save_btn')!.onclick = async () => {
    const urlVal = (document.getElementById('op_photo_url') as HTMLInputElement).value.trim();
    const photoUrl = pendingPhotoData !== undefined ? pendingPhotoData : (urlVal || p.photoUrl || '');
    try {
      const res = await api('/profile', {
        ...(S.me?.role === 'admin' ? { teamId: getClubTid() } : {}),
        displayName: (document.getElementById('op_name') as HTMLInputElement).value.trim(),
        bio: (document.getElementById('op_bio') as HTMLTextAreaElement).value.trim(),
        career: (document.getElementById('op_career') as HTMLTextAreaElement).value.trim(),
        photoUrl,
      });
      toast(res.message || 'Профиль сохранён');
      reloadClub();
    } catch (err: any) {
      toast(err?.message || 'Ошибка сохранения профиля', true);
    }
  };
}

// ─── Predictions Page (#/predictions) ─────────────────────────────────────────
let PRED_SUBTAB: 'matches' | 'leagues' | 'history' = 'matches';
let SELECTED_LEAGUE_ID = 'global';

export async function renderPredictionsPage(app: HTMLElement) {
  const { api, e, toast } = B();
  app.innerHTML = '<div class="panel">Загрузка Лиги прогнозов…</div>';
  let data: any;
  try {
    data = await api('/predictions');
  } catch (err: any) {
    app.innerHTML = `<div class="panel warn">${e(err?.message || 'Ошибка загрузки прогнозов')}</div>`;
    return;
  }

  const wallet = data.wallet;
  const prof = data.profile;
  const myPredByFixture = new Map<string, any>();
  for (const p of data.myPredictions || []) myPredByFixture.set(p.fixtureId, p);

  const renderMatchesTab = () => {
    if (!data.fixtures.length) {
      return '<div class="panel"><div class="empty">На данный момент нет открытых матчей для прогноза. Как только появятся новые туры РПЛ, Кубка или товарищеские матчи — они появятся здесь.</div></div>';
    }
    return `
      <div class="grid g2">
        ${data.fixtures.map((f: any) => {
          const existing = myPredByFixture.get(f.id);
          return `
          <div class="panel" style="margin-bottom:0">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
              <span class="small muted">${e(f.compName)} · ${e(f.label)}</span>
              <span class="small muted" style="font-variant-numeric:tabular-nums">${e(f.date)} ${e(f.time)}</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">
                ${f.homeLogo ? `<img src="${e(f.homeLogo)}" alt="" style="width:28px;height:28px;object-fit:contain;flex-shrink:0">` : ''}
                <b style="truncate;font-size:14px">${e(f.homeName)}</b>
              </div>
              <span class="muted small">vs</span>
              <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:1;min-width:0;text-align:right">
                <b style="truncate;font-size:14px">${e(f.awayName)}</b>
                ${f.awayLogo ? `<img src="${e(f.awayLogo)}" alt="" style="width:28px;height:28px;object-fit:contain;flex-shrink:0">` : ''}
              </div>
            </div>
            ${existing
              ? `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:10px 12px;font-size:13px">
                  <b>Ваш прогноз принят:</b> ${existing.pick === '1' ? e(f.homeName) : existing.pick === '2' ? e(f.awayName) : 'Ничья (Х)'}
                  ${existing.exactHome !== null && existing.exactAway !== null ? ` · Точный счёт ${existing.exactHome}:${existing.exactAway}` : ''}
                  · Ставка: ${existing.stake} мон.
                </div>`
              : `
                <div class="row" style="gap:6px;margin-bottom:8px">
                  <button type="button" class="btn alt sm" data-pick-btn="${e(f.id)}" data-pick="1" style="flex:1;min-height:42px">П1 (${e(f.homeName.split(' ')[0])})</button>
                  <button type="button" class="btn alt sm" data-pick-btn="${e(f.id)}" data-pick="X" style="min-width:64px;min-height:42px">Ничья</button>
                  <button type="button" class="btn alt sm" data-pick-btn="${e(f.id)}" data-pick="2" style="flex:1;min-height:42px">П2 (${e(f.awayName.split(' ')[0])})</button>
                </div>
                <div class="row" style="gap:8px;align-items:center;flex-wrap:wrap">
                  <label class="small muted">Ставка:
                    <select id="stake_${e(f.id)}" style="width:78px;padding:4px 6px">
                      <option value="1">1 мон.</option>
                      <option value="2">2 мон.</option>
                      <option value="3">3 мон.</option>
                      <option value="5">5 мон.</option>
                    </select>
                  </label>
                  <label class="small muted">Точный счёт (бонус +5 очк.):
                    <input id="eh_${e(f.id)}" type="number" min="0" max="15" placeholder="-" style="width:48px;padding:4px;text-align:center"> :
                    <input id="ea_${e(f.id)}" type="number" min="0" max="15" placeholder="-" style="width:48px;padding:4px;text-align:center">
                  </label>
                  <button type="button" class="btn sm" data-bet-submit="${e(f.id)}" style="margin-left:auto;min-height:40px" disabled>Выберите исход</button>
                </div>`}
          </div>`;
        }).join('')}
      </div>`;
  };

  const renderLeaguesTab = () => {
    const activeLeague = SELECTED_LEAGUE_ID === 'global'
      ? null
      : (data.leagues || []).find((l: any) => l.id === SELECTED_LEAGUE_ID);
    const board = activeLeague ? activeLeague.leaderboard : data.leaderboard;

    return `
      <div class="grid g2" style="margin-bottom:14px">
        <div class="panel" style="margin-bottom:0">
          <h3 style="margin:0 0 8px">Создать свою лигу пользователей</h3>
          <div class="row" style="gap:8px;flex-wrap:wrap">
            <input id="lg_name" placeholder="Название лиги (например: Друзья Спартака)" style="flex:1;min-width:190px">
            <button class="btn sm" id="lg_create_btn" style="min-height:42px">Создать лигу</button>
          </div>
          <input id="lg_desc" placeholder="Описание лиги (необязательно)" style="width:100%;margin-top:8px">
        </div>
        <div class="panel" style="margin-bottom:0">
          <h3 style="margin:0 0 8px">Вступить в лигу по коду</h3>
          <div class="row" style="gap:8px;flex-wrap:wrap">
            <input id="lg_join_code" placeholder="Код приглашения (например: A1B2C3)" style="flex:1;min-width:170px">
            <button class="btn alt sm" id="lg_join_btn" style="min-height:42px">Вступить</button>
          </div>
          <div class="small muted" style="margin-top:8px">Выберите лигу ниже для просмотра её таблицы:</div>
          <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
            <button class="btn sm ${SELECTED_LEAGUE_ID === 'global' ? '' : 'alt'}" data-sel-lg="global">Общая лига (${data.leaderboard.length})</button>
            ${(data.leagues || []).map((lg: any) => `
              <button class="btn sm ${SELECTED_LEAGUE_ID === lg.id ? '' : 'alt'}" data-sel-lg="${e(lg.id)}">${e(lg.name)} (${lg.membersCount})</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
          <div>
            <h3 style="margin:0">${activeLeague ? e(activeLeague.name) : 'Общая лига прогнозистов РПЛ'}</h3>
            <div class="small muted">${activeLeague ? `Код приглашения: <b>${e(activeLeague.code)}</b>${activeLeague.description ? ' · ' + e(activeLeague.description) : ''}` : 'Нажмите на любого участника, чтобы открыть профиль владельца клуба и его успехи.'}</div>
          </div>
          ${activeLeague ? (activeLeague.isMember
            ? `<button class="btn alt sm" id="lg_leave_btn" data-lid="${e(activeLeague.id)}">Выйти из лиги</button>`
            : `<button class="btn sm" id="lg_join_direct" data-lid="${e(activeLeague.id)}">Вступить в лигу</button>`) : ''}
        </div>
        <div class="wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th class="l">Участник / Владелец</th>
                <th>Угадал</th>
                <th>Не угадал</th>
                <th>КПД</th>
                <th>Очки</th>
              </tr>
            </thead>
            <tbody style="font-variant-numeric:tabular-nums">
              ${board.map((r: any) => `
                <tr data-open-prof="${e(r.actorKey)}" style="cursor:pointer" title="Открыть профиль">
                  <td><b>${r.rank <= 3 ? (r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : '🥉') : r.rank}</b></td>
                  <td class="l">
                    <div style="display:flex;align-items:center;gap:8px">
                      ${r.photoUrl
                        ? `<img src="${e(r.photoUrl)}" alt="" referrerpolicy="no-referrer" style="width:30px;height:30px;border-radius:8px;object-fit:cover" onerror="this.style.display='none'">`
                        : r.teamLogo
                          ? `<img src="${e(r.teamLogo)}" alt="" style="width:26px;height:26px;object-fit:contain">`
                          : `<div style="width:28px;height:28px;border-radius:8px;background:var(--deep);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${e((r.displayName || 'И').slice(0, 1))}</div>`}
                      <div>
                        <div style="font-weight:600">${e(r.displayName)}</div>
                        <div class="small muted">${r.teamName ? e(r.teamName) : 'Игрок лиги'}</div>
                      </div>
                    </div>
                  </td>
                  <td style="color:#15803d;font-weight:700">${r.correct}</td>
                  <td style="color:#b91c1c">${r.wrong}</td>
                  <td><b>${r.kpd}%</b></td>
                  <td><b>${r.points}</b></td>
                </tr>`).join('') || '<tr><td colspan="6" class="empty">Участников пока нет</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  const renderHistoryTab = () => `
    <div class="panel">
      <h3 style="margin:0 0 10px">Мои прогнозы (${(data.myPredictions || []).length})</h3>
      ${(data.myPredictions || []).length
        ? `<div class="wrap"><table><thead><tr><th class="l">Матч</th><th class="l">Прогноз</th><th>Ставка</th><th class="l">Результат</th><th>Очки / Монеты</th></tr></thead><tbody style="font-variant-numeric:tabular-nums">
          ${data.myPredictions.map((p: any) => `
            <tr>
              <td class="l"><b>${e(p.homeName)} — ${e(p.awayName)}</b><div class="small muted">${e(p.label)} · ${e(p.date)}</div></td>
              <td class="l">${p.pick === '1' ? 'П1' : p.pick === '2' ? 'П2' : 'Ничья (Х)'}${p.exactHome !== null && p.exactAway !== null ? ` (${p.exactHome}:${p.exactAway})` : ''}</td>
              <td>${p.stake} мон.</td>
              <td class="l">${p.status === 'won' ? `<span style="color:#15803d;font-weight:700">Угадал (${e(p.actualScore || '')})</span>` : p.status === 'lost' ? `<span style="color:#b91c1c">Не угадал (${e(p.actualScore || '')})</span>` : '<span class="muted">Ожидание матча</span>'}</td>
              <td>${p.status === 'won' ? `+${p.pointsAwarded} очк. / +${p.coinsWon} мон.` : '—'}</td>
            </tr>`).join('')}
        </tbody></table></div>`
        : '<div class="empty">Вы ещё не делали прогнозов в этом сезоне.</div>'}
    </div>
  `;

  app.innerHTML = `
    <div class="comp-banner" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px">
      <div>
        <h1 class="comp-banner-title" style="margin:0">Прогноз на тур · Сезон ${e(data.season)}</h1>
        <div class="comp-banner-sub">Угадывайте исходы матчей за монеты, соревнуйтесь в своей лиге по КПД и выигрывайте призы сезона</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);padding:8px 14px;border-radius:10px;text-align:right;font-variant-numeric:tabular-nums">
          <div style="font-size:11px;color:#cfe3d6">Ваш баланс (только за рекламу)</div>
          <div style="font:700 20px Unbounded,sans-serif;color:#f0c419">${wallet.coins} монет</div>
        </div>
        <button class="btn alt sm" id="pred_edit_profile" style="min-height:42px;background:#fff;color:var(--deep)">Профиль: ${e(prof.displayName)}</button>
      </div>
    </div>

    <div class="panel">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px">
        <div>
          <h3 style="margin:0 0 2px">Заработать монеты (Adsgram)</h3>
          <div class="small muted">На старте даётся 5 бесплатных монет. Дальнейшее пополнение — только за просмотр рекламы (каждая кнопка — отдельный блок).</div>
        </div>
      </div>
      <div class="grid g3">
        ${data.coinOffers.map((o: any) => `
          <button type="button" class="btn alt" data-earn-coins="${e(o.blockKey)}" ${o.views >= o.maxViews ? 'disabled' : ''} style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;min-height:52px;text-align:left">
            <div>
              <div style="font-weight:700">${e(o.label)}</div>
              <div class="small muted" style="font-variant-numeric:tabular-nums">Блок ${e(o.blockId)} · ${o.views}/${o.maxViews}</div>
            </div>
            <span style="font:700 15px Unbounded,sans-serif;color:#15803d;white-space:nowrap;margin-left:8px">+${o.rewardCoins} мон.</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="panel" style="background:linear-gradient(90deg,#fefce8 0%,#f0fdf4 100%);border:1px solid #fde68a">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px">
        <div>
          <h3 style="margin:0 0 4px">Призы Топ-3 по итогам сезона</h3>
          <div class="small">🥇 <b>1 место:</b> €5 000 000 + 50 монет · 🥈 <b>2 место:</b> €3 000 000 + 30 монет · 🥉 <b>3 место:</b> €1 500 000 + 15 монет (и трофей в профиль владельца)</div>
        </div>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:14px">
      <button data-pred-tab="matches" class="${PRED_SUBTAB === 'matches' ? 'on' : ''}">Матчи тура (${data.fixtures.length})</button>
      <button data-pred-tab="leagues" class="${PRED_SUBTAB === 'leagues' ? 'on' : ''}">Рейтинг и Лиги (${data.leaderboard.length})</button>
      <button data-pred-tab="history" class="${PRED_SUBTAB === 'history' ? 'on' : ''}">Мои прогнозы (${(data.myPredictions || []).length})</button>
    </div>

    ${PRED_SUBTAB === 'matches' ? renderMatchesTab() : PRED_SUBTAB === 'leagues' ? renderLeaguesTab() : renderHistoryTab()}
  `;

  app.querySelectorAll('[data-pred-tab]').forEach((b) => {
    (b as HTMLElement).onclick = () => {
      PRED_SUBTAB = (b as HTMLElement).dataset.predTab as any;
      renderPredictionsPage(app);
    };
  });

  document.getElementById('pred_edit_profile')!.onclick = () => {
    if (B().S.me?.role === 'club') {
      location.hash = '#/club';
      return;
    }
    B().modal(`
      <div style="max-width:440px;margin:0 auto">
        <h3 style="margin:0 0 10px">Мой профиль в Лиге прогнозов</h3>
        <label class="small" style="display:block;margin-bottom:8px">Имя / Никнейм
          <input id="up_name" value="${e(prof.displayName)}" maxlength="60" style="width:100%;margin-top:4px">
        </label>
        <label class="small" style="display:block;margin-bottom:8px">Ссылка на фото (необязательно)
          <input id="up_photo" value="${e(prof.photoUrl || '')}" style="width:100%;margin-top:4px" placeholder="https://...">
        </label>
        <label class="small" style="display:block;margin-bottom:12px">О себе / карьера прогнозиста
          <textarea id="up_bio" rows="3" maxlength="400" style="width:100%;margin-top:4px">${e(prof.bio || '')}</textarea>
        </label>
        <button class="btn" id="up_save" style="width:100%;min-height:44px">Сохранить</button>
      </div>
    `, (el, close) => {
      el.querySelector('#up_save')!.addEventListener('click', async () => {
        try {
          await api('/profile', {
            displayName: (el.querySelector('#up_name') as HTMLInputElement).value.trim(),
            photoUrl: (el.querySelector('#up_photo') as HTMLInputElement).value.trim(),
            bio: (el.querySelector('#up_bio') as HTMLTextAreaElement).value.trim(),
          });
          toast('Профиль обновлён');
          close();
          renderPredictionsPage(app);
        } catch (err: any) {
          toast(err?.message || 'Ошибка', true);
        }
      });
    });
  };

  app.querySelectorAll('[data-earn-coins]').forEach((b) => {
    (b as HTMLButtonElement).onclick = async () => {
      const blockKey = (b as HTMLElement).dataset.earnCoins!;
      const label = blockKey === 'coins_short' ? '+1 монета (5 сек)' : blockKey === 'coins_banner' ? '+2 монеты (баннер)' : '+3 монеты (30 сек)';
      const adRes = await runAdsgramBlock(blockKey, `Пополнение баланса: ${label}`);
      if (!adRes) return;
      try {
        const res = await api('/predictions/earn-coins', { blockKey, adProof: adRes.adProof });
        toast(res.message);
        renderPredictionsPage(app);
      } catch (err: any) {
        toast(err?.message || 'Ошибка начисления монет', true);
      }
    };
  });

  // Match pick selection & submission
  const pickedMap = new Map<string, string>();
  app.querySelectorAll('[data-pick-btn]').forEach((b) => {
    (b as HTMLButtonElement).onclick = () => {
      const fid = (b as HTMLElement).dataset.pickBtn!;
      const pick = (b as HTMLElement).dataset.pick!;
      pickedMap.set(fid, pick);
      app.querySelectorAll(`[data-pick-btn="${fid}"]`).forEach((btn) => {
        const isSel = (btn as HTMLElement).dataset.pick === pick;
        btn.className = isSel ? 'btn sm' : 'btn alt sm';
      });
      const sub = app.querySelector(`[data-bet-submit="${fid}"]`) as HTMLButtonElement | null;
      if (sub) {
        sub.disabled = false;
        sub.textContent = 'Поставить';
      }
    };
  });

  app.querySelectorAll('[data-bet-submit]').forEach((b) => {
    (b as HTMLButtonElement).onclick = async () => {
      const fid = (b as HTMLElement).dataset.betSubmit!;
      const pick = pickedMap.get(fid);
      if (!pick) return;
      const stake = Number((document.getElementById(`stake_${fid}`) as HTMLSelectElement)?.value || 1);
      const exactHome = (document.getElementById(`eh_${fid}`) as HTMLInputElement)?.value;
      const exactAway = (document.getElementById(`ea_${fid}`) as HTMLInputElement)?.value;
      try {
        const res = await api('/predictions/bet', { fixtureId: fid, pick, stake, exactHome, exactAway });
        toast(res.message);
        renderPredictionsPage(app);
      } catch (err: any) {
        toast(err?.message || 'Ошибка ставки', true);
      }
    };
  });

  // League actions
  const lgCreate = document.getElementById('lg_create_btn');
  if (lgCreate) {
    lgCreate.onclick = async () => {
      try {
        const res = await api('/predictions/league/create', {
          name: (document.getElementById('lg_name') as HTMLInputElement).value.trim(),
          description: (document.getElementById('lg_desc') as HTMLInputElement).value.trim(),
        });
        toast(res.message);
        SELECTED_LEAGUE_ID = res.league.id;
        renderPredictionsPage(app);
      } catch (err: any) {
        toast(err?.message || 'Ошибка создания лиги', true);
      }
    };
  }

  const lgJoin = document.getElementById('lg_join_btn');
  if (lgJoin) {
    lgJoin.onclick = async () => {
      try {
        const res = await api('/predictions/league/join', {
          codeOrId: (document.getElementById('lg_join_code') as HTMLInputElement).value.trim(),
        });
        toast(res.message);
        SELECTED_LEAGUE_ID = res.leagueId;
        renderPredictionsPage(app);
      } catch (err: any) {
        toast(err?.message || 'Лига не найдена', true);
      }
    };
  }

  app.querySelectorAll('[data-sel-lg]').forEach((b) => {
    (b as HTMLElement).onclick = () => {
      SELECTED_LEAGUE_ID = (b as HTMLElement).dataset.selLg!;
      renderPredictionsPage(app);
    };
  });

  const lgLeave = document.getElementById('lg_leave_btn');
  if (lgLeave) {
    lgLeave.onclick = async () => {
      try {
        const res = await api('/predictions/league/leave', { leagueId: lgLeave.dataset.lid });
        toast(res.message);
        SELECTED_LEAGUE_ID = 'global';
        renderPredictionsPage(app);
      } catch (err: any) {
        toast(err?.message || 'Ошибка', true);
      }
    };
  }

  const lgJoinDirect = document.getElementById('lg_join_direct');
  if (lgJoinDirect) {
    lgJoinDirect.onclick = async () => {
      try {
        const res = await api('/predictions/league/join', { codeOrId: lgJoinDirect.dataset.lid });
        toast(res.message);
        renderPredictionsPage(app);
      } catch (err: any) {
        toast(err?.message || 'Ошибка', true);
      }
    };
  }

  app.querySelectorAll('[data-open-prof]').forEach((tr) => {
    (tr as HTMLElement).onclick = () => {
      const key = (tr as HTMLElement).dataset.openProf!;
      openOwnerProfileModal(key);
    };
  });
}

// ─── National Team Proposals & Voting Enhancement ─────────────────────────────
export async function renderNationalProposalsSection(
  container: HTMLElement,
  cur: any,
  isAdmin: boolean,
  reloadNational: () => void
) {
  const { api, e, toast, S } = B();
  const isClub = S.me?.role === 'club';
  let clubRoster: any[] = [];
  if (isClub) {
    try {
      const c = await api('/club');
      clubRoster = (c.roster || c.squad || []).filter(
        (p: any) => !p.nat || p.nat === 'RUS' || p.nat === 'Россия' || p.nation === 'Россия'
      );
    } catch {
      clubRoster = [];
    }
  }

  const playerProps = cur.playerProposals || [];
  const oppProps = cur.opponentProposals || [];

  container.innerHTML = `
    <div class="grid g2" style="margin-top:16px">
      <div class="panel" style="margin-bottom:0">
        <h3 style="margin:0 0 6px">Предложить игрока в сборную России</h3>
        <div class="small muted" style="margin-bottom:10px;line-height:1.45">
          За просмотр рекламы можно предложить своего российского игрока и голосовать за кандидатов. Больше голосов даёт приоритет при равной хорошей форме (например, 4 голоса важнее 1), но провально играющий игрок не займёт место сильного кандидата.
        </div>

        ${isClub && clubRoster.length
          ? `<div style="background:var(--soft);padding:10px;border-radius:8px;border:1px solid var(--line);margin-bottom:12px">
              <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
                <select id="nt_prop_pid" style="flex:1;min-width:190px">
                  ${clubRoster.map((p: any) => `<option value="${e(p.id)}">${e(p.name)} (${e(p.pos)} · Рейт ${Number(p.rating || 0).toFixed(1)})</option>`).join('')}
                </select>
                <button class="btn sm" id="nt_prop_player_btn" style="min-height:42px">Предложить (реклама)</button>
              </div>
              <input id="nt_prop_note" maxlength="160" placeholder="Почему достоин вызова (необязательно)" style="width:100%">
            </div>`
          : !isClub && !isAdmin
            ? '<div class="small muted" style="margin-bottom:10px">Войдите по коду клуба, чтобы предложить игрока своего клуба. Голосовать за кандидатов могут все!</div>'
            : ''}

        ${playerProps.length
          ? `<div class="wrap"><table><thead><tr><th class="l">Кандидат</th><th>Стат.</th><th>Голоса</th><th></th></tr></thead><tbody style="font-variant-numeric:tabular-nums">
            ${playerProps.map((pr: any) => `
              <tr>
                <td class="l">
                  <b>${e(pr.playerName)}</b> <span class="small muted">(${e(pr.pos)}, ${e(pr.teamName)})</span>
                  <div class="small muted">
                    ${pr.inActiveSquad ? '<span style="color:#15803d;font-weight:700">В составе сборной</span>' : 'Кандидат'}
                    ${pr.note ? ' · ' + e(pr.note) : ''}
                  </div>
                </td>
                <td class="small">М:${pr.matches} Г:${pr.goals} Р:${Number(pr.rating || 0).toFixed(1)}</td>
                <td><b>${pr.votes}</b></td>
                <td><button class="btn alt sm" data-nt-vote-pl="${e(pr.pid)}" style="min-height:38px">+1 (реклама)</button></td>
              </tr>`).join('')}
          </tbody></table></div>`
          : '<div class="small muted">На этот сбор клубы ещё не предлагали кандидатов.</div>'}
      </div>

      <div class="panel" style="margin-bottom:0">
        <h3 style="margin:0 0 6px">Соперник для товарищеского матча сборной</h3>
        <div class="small muted" style="margin-bottom:10px;line-height:1.45">
          Предложите сборную-соперника за рекламу или проголосуйте за уже созданный вариант. Голосование открыто для всех пользователей.
        </div>

        <div style="background:var(--soft);padding:10px;border-radius:8px;border:1px solid var(--line);margin-bottom:12px">
          <div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <input id="nt_prop_opp_name" list="nat_list" maxlength="60" placeholder="Страна / Сборная (например: Сербия, Египет)" style="flex:1;min-width:190px">
            <button class="btn sm" id="nt_prop_opp_btn" style="min-height:42px">Предложить (реклама)</button>
          </div>
          <input id="nt_prop_opp_comment" maxlength="140" placeholder="Комментарий (например: матч на ВТБ Арене)" style="width:100%">
        </div>

        ${oppProps.length
          ? `<div class="wrap"><table><thead><tr><th class="l">Сборная</th><th>Голоса</th><th></th></tr></thead><tbody style="font-variant-numeric:tabular-nums">
            ${oppProps.map((op: any) => `
              <tr>
                <td class="l">
                  <b>${e(op.opponent)}</b>
                  <div class="small muted">От: ${e(op.proposedByName)}${op.comment ? ' · ' + e(op.comment) : ''}</div>
                </td>
                <td><b>${op.votes}</b></td>
                <td>
                  <div class="row" style="gap:4px;justify-content:flex-end">
                    <button class="btn alt sm" data-nt-vote-opp="${e(op.id)}" style="min-height:38px">Голос (реклама)</button>
                    ${isAdmin ? `<button class="btn sm" data-nt-pick-opp="${e(op.opponent)}" title="Подставить соперника в форму матча">Выбрать</button>` : ''}
                  </div>
                </td>
              </tr>`).join('')}
          </tbody></table></div>`
          : '<div class="small muted">Предложений соперника пока нет — будьте первым!</div>'}
      </div>
    </div>
  `;

  const propPlBtn = document.getElementById('nt_prop_player_btn');
  if (propPlBtn) {
    propPlBtn.onclick = async () => {
      const pid = (document.getElementById('nt_prop_pid') as HTMLSelectElement).value;
      const note = (document.getElementById('nt_prop_note') as HTMLInputElement).value.trim();
      if (!pid) return;
      const adRes = await runAdsgramBlock('nt_propose_player', 'Предложение игрока в сборную России');
      if (!adRes) return;
      try {
        const res = await api('/national/propose-player', { pid, note, adProof: adRes.adProof });
        toast(res.message);
        reloadNational();
      } catch (err: any) {
        toast(err?.message || 'Ошибка предложения игрока', true);
      }
    };
  }

  container.querySelectorAll('[data-nt-vote-pl]').forEach((b) => {
    (b as HTMLButtonElement).onclick = async () => {
      const pid = (b as HTMLElement).dataset.ntVotePl!;
      const adRes = await runAdsgramBlock('nt_vote_player', 'Голосование за игрока в сборную России');
      if (!adRes) return;
      try {
        const res = await api('/national/vote-player', { pid, adProof: adRes.adProof });
        toast(res.message);
        reloadNational();
      } catch (err: any) {
        toast(err?.message || 'Ошибка голосования', true);
      }
    };
  });

  const propOppBtn = document.getElementById('nt_prop_opp_btn');
  if (propOppBtn) {
    propOppBtn.onclick = async () => {
      const opponent = (document.getElementById('nt_prop_opp_name') as HTMLInputElement).value.trim();
      const comment = (document.getElementById('nt_prop_opp_comment') as HTMLInputElement).value.trim();
      if (opponent.length < 2) {
        toast('Укажите название сборной-соперника', true);
        return;
      }
      const adRes = await runAdsgramBlock('nt_propose_opp', `Предложить соперника: ${opponent}`);
      if (!adRes) return;
      try {
        const res = await api('/national/propose-opponent', { opponent, comment, adProof: adRes.adProof });
        toast(res.message);
        reloadNational();
      } catch (err: any) {
        toast(err?.message || 'Ошибка предложения соперника', true);
      }
    };
  }

  container.querySelectorAll('[data-nt-vote-opp]').forEach((b) => {
    (b as HTMLButtonElement).onclick = async () => {
      const proposalId = (b as HTMLElement).dataset.ntVoteOpp!;
      const adRes = await runAdsgramBlock('nt_vote_opp', 'Голосование за соперника сборной России');
      if (!adRes) return;
      try {
        const res = await api('/national/vote-opponent', { proposalId, adProof: adRes.adProof });
        toast(res.message);
        reloadNational();
      } catch (err: any) {
        toast(err?.message || 'Ошибка голосования', true);
      }
    };
  });

  container.querySelectorAll('[data-nt-pick-opp]').forEach((b) => {
    (b as HTMLButtonElement).onclick = () => {
      const inp = document.getElementById('nt_opp') as HTMLInputElement | null;
      if (inp) {
        inp.value = (b as HTMLElement).dataset.ntPickOpp!;
        inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast(`Соперник «${inp.value}» подставлен в форму матча`);
      }
    };
  });
}

// ─── Admin Settings Adsgram Block Panel ───────────────────────────────────────
export function renderAdminAdsSettingsHtml(ov: any, e: (s: any) => string): string {
  const defs = ov.settings?.adsgramBlockDefs || [];
  const blocks = ov.settings?.adsgramBlocks || {};
  if (!defs.length) return '';
  return `
    <div class="panel" style="margin-top:16px">
      <h3>Рекламная сеть Adsgram (отдельный Block ID для каждой кнопки)</h3>
      <p class="small muted" style="margin:0 0 10px">Укажите реальные Block ID из личного кабинета Adsgram для каждой кнопки. В предпросмотре при строковых ID работает интерактивная эмуляция.</p>
      <div class="grid g2">
        ${defs.map((d: any) => `
          <label class="small" style="display:block">${e(d.label)}
            <input id="ads_blk_${e(d.key)}" value="${e(blocks[d.key] || d.defaultBlockId)}" style="width:100%;margin-top:4px;font-family:monospace">
          </label>
        `).join('')}
      </div>
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div class="small muted">Наградить Топ-3 Лиги прогнозов по итогам текущего сезона (€5M / €3M / €1.5M + монеты + трофеи)</div>
        <button type="button" class="btn alt sm" id="btn_award_pred_season">Выдать призы Лиги прогнозов</button>
      </div>
    </div>
  `;
}

export function collectAdminAdsBlocks(ov: any): Record<string, string> {
  const defs = ov.settings?.adsgramBlockDefs || [];
  const out: Record<string, string> = {};
  for (const d of defs) {
    const inp = document.getElementById('ads_blk_' + d.key) as HTMLInputElement | null;
    if (inp && inp.value.trim()) out[d.key] = inp.value.trim();
  }
  return out;
}

window.__RPL_EXT__ = {
  getClientHeaders,
  runAdsgramBlock,
  openOwnerProfileModal,
  renderClubSponsorsTab,
  renderClubOwnerProfileTab,
  renderPredictionsPage,
  renderNationalProposalsSection,
  renderAdminAdsSettingsHtml,
  collectAdminAdsBlocks,
};
