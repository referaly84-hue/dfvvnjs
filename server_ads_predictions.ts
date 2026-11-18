import type { Express, Request, Response } from 'express';
import crypto from 'crypto';

export interface AdsgramBlockDef {
  key: string;
  label: string;
  category: 'sponsors' | 'friendly' | 'predictions' | 'national';
  format: 'long' | 'short' | 'banner' | 'click_long';
  durationSec: number;
  requiresClick: boolean;
  defaultBlockId: string;
  maxPerCycle: number;
}

export const ADSGRAM_BLOCKS: AdsgramBlockDef[] = [
  {
    key: 'sponsor_long',
    label: 'Спонсор 1 (Газпром Нефть) — Длинная реклама (30с, €750)',
    category: 'sponsors',
    format: 'long',
    durationSec: 30,
    requiresClick: false,
    defaultBlockId: 'int-sponsor-long',
    maxPerCycle: 10,
  },
  {
    key: 'sponsor_short',
    label: 'Спонсор 2 (Т-Банк) — Короткая реклама (5с, €500)',
    category: 'sponsors',
    format: 'short',
    durationSec: 5,
    requiresClick: false,
    defaultBlockId: 'int-sponsor-short',
    maxPerCycle: 10,
  },
  {
    key: 'sponsor_banner',
    label: 'Спонсор 3 (Аэрофлот) — Баннерная реклама (€250)',
    category: 'sponsors',
    format: 'banner',
    durationSec: 5,
    requiresClick: false,
    defaultBlockId: 'int-sponsor-banner',
    maxPerCycle: 10,
  },
  {
    key: 'rfs_bonus',
    label: 'Бонус от РФС — Премиум-реклама (€1 000 после 30/30)',
    category: 'sponsors',
    format: 'long',
    durationSec: 15,
    requiresClick: false,
    defaultBlockId: 'int-rfs-bonus',
    maxPerCycle: 30,
  },
  {
    key: 'friendly_request',
    label: 'Товарищеский матч — Подать заявку (большая реклама + клик)',
    category: 'friendly',
    format: 'click_long',
    durationSec: 30,
    requiresClick: true,
    defaultBlockId: 'int-friendly-req',
    maxPerCycle: 9,
  },
  {
    key: 'friendly_accept',
    label: 'Товарищеский матч — Принять приглашение (РПЛ)',
    category: 'friendly',
    format: 'short',
    durationSec: 10,
    requiresClick: false,
    defaultBlockId: 'int-friendly-acc',
    maxPerCycle: 30,
  },
  {
    key: 'coins_short',
    label: 'Прогнозы — Короткая реклама 5с (+1 монета)',
    category: 'predictions',
    format: 'short',
    durationSec: 5,
    requiresClick: false,
    defaultBlockId: 'int-coins-short',
    maxPerCycle: 30,
  },
  {
    key: 'coins_banner',
    label: 'Прогнозы — Баннерная реклама (+2 монеты)',
    category: 'predictions',
    format: 'banner',
    durationSec: 5,
    requiresClick: false,
    defaultBlockId: 'int-coins-banner',
    maxPerCycle: 30,
  },
  {
    key: 'coins_long',
    label: 'Прогнозы — Длинная реклама 30с (+3 монеты)',
    category: 'predictions',
    format: 'long',
    durationSec: 30,
    requiresClick: false,
    defaultBlockId: 'int-coins-long',
    maxPerCycle: 30,
  },
  {
    key: 'nt_propose_player',
    label: 'Сборная России — Предложить игрока в сборную',
    category: 'national',
    format: 'short',
    durationSec: 10,
    requiresClick: false,
    defaultBlockId: 'int-nt-prop-player',
    maxPerCycle: 30,
  },
  {
    key: 'nt_vote_player',
    label: 'Сборная России — Голосовать за игрока в сборную',
    category: 'national',
    format: 'short',
    durationSec: 5,
    requiresClick: false,
    defaultBlockId: 'int-nt-vote-player',
    maxPerCycle: 30,
  },
  {
    key: 'nt_propose_opp',
    label: 'Сборная России — Предложить соперника на матч',
    category: 'national',
    format: 'short',
    durationSec: 10,
    requiresClick: false,
    defaultBlockId: 'int-nt-prop-opp',
    maxPerCycle: 30,
  },
  {
    key: 'nt_vote_opp',
    label: 'Сборная России — Голосовать за соперника сборной',
    category: 'national',
    format: 'short',
    durationSec: 5,
    requiresClick: false,
    defaultBlockId: 'int-nt-vote-opp',
    maxPerCycle: 30,
  },
];

export interface SponsorConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  blockKey: 'sponsor_long' | 'sponsor_short' | 'sponsor_banner';
  formatLabel: string;
  rewardEur: number;
  maxViews: number;
  approvalRate: number;
  accentColor: string;
}

export const SPONSORS: SponsorConfig[] = [
  {
    id: 'gazprom_neft',
    name: 'Газпром Нефть',
    tagline: 'Генеральный энергетический партнёр',
    description: 'Крупный спонсорский транш за просмотр длинной рекламы. Высокая выплата при одобрении заявки.',
    blockKey: 'sponsor_long',
    formatLabel: 'Длинная реклама (30с)',
    rewardEur: 750,
    maxViews: 10,
    approvalRate: 0.95,
    accentColor: '#0284c7',
  },
  {
    id: 'tbank',
    name: 'Т-Банк',
    tagline: 'Официальный финансовый партнёр',
    description: 'Быстрое финансирование клуба за короткую 5-секундную рекламу. Оптимально по времени.',
    blockKey: 'sponsor_short',
    formatLabel: 'Короткая реклама (5с)',
    rewardEur: 500,
    maxViews: 10,
    approvalRate: 0.95,
  accentColor: '#ca8a04',
  },
  {
    id: 'aeroflot',
    name: 'Аэрофлот',
    tagline: 'Официальный авиаперевозчик лиги',
    description: 'Базовая спонсорская поддержка за просмотр рекламного баннера перед выездными матчами.',
    blockKey: 'sponsor_banner',
    formatLabel: 'Баннерная реклама',
    rewardEur: 250,
    maxViews: 10,
    approvalRate: 0.95,
    accentColor: '#1d4ed8',
  },
];

const CYCLE_MS = 24 * 60 * 60 * 1000;
const FRIENDLY_BREAK_LIMIT = 9;
const STARTER_COINS = 5;

const SEASON_PRIZES = [
  { place: 1, label: '1 место', prizeEur: 5_000_000, prizeCoins: 50, badge: '🥇 Золото Лиги прогнозов' },
  { place: 2, label: '2 место', prizeEur: 3_000_000, prizeCoins: 30, badge: '🥈 Серебро Лиги прогнозов' },
  { place: 3, label: '3 место', prizeEur: 1_500_000, prizeCoins: 15, badge: '🥉 Бронза Лиги прогнозов' },
];

export interface AdServerContext {
  getDb: () => any;
  save: () => void;
  S: () => string;
  team: (id: string) => any;
  tn: (id: string) => string;
  teamLogo: (id: string) => string;
  player: (id: string) => any;
  uid: () => string;
  needClub: (req: Request, res: Response, next: () => void) => void;
  admin: (req: Request, res: Response, next: () => void) => void;
  fail: (res: Response, msg: string, code?: number) => void;
  cleanTxt: (v: any, max?: number) => string;
  ensureNationalTeam: () => any;
  ensureInitialBudgets: () => void;
  compName: (id: string) => string;
}

interface PendingAdSession {
  token: string;
  blockKey: string;
  actorKey: string;
  startedAt: number;
  requiresClick: boolean;
  clicked: boolean;
  verified: boolean;
  consumed: boolean;
}

const adSessions = new Map<string, PendingAdSession>();

function pruneAdSessions() {
  const now = Date.now();
  for (const [k, v] of adSessions.entries()) {
    if (now - v.startedAt > 30 * 60 * 1000) adSessions.delete(k);
  }
}

export function getAdsgramBlocks(db: any): Record<string, string> {
  db.settings ||= {};
  const saved = db.settings.adsgramBlocks && typeof db.settings.adsgramBlocks === 'object' ? db.settings.adsgramBlocks : {};
  const out: Record<string, string> = {};
  for (const b of ADSGRAM_BLOCKS) {
    out[b.key] = String(saved[b.key] || b.defaultBlockId).trim() || b.defaultBlockId;
  }
  return out;
}

function cleanClientId(raw: any): string {
  const s = String(raw || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return s || 'anon';
}

export function resolveActor(req: any): {
  actorKey: string;
  type: 'club' | 'admin' | 'user';
  teamId: string | null;
  clientId: string;
} {
  const cid = cleanClientId(req.headers?.['x-client-id'] || req.body?.clientId || req.query?.clientId);
  if (req.me?.role === 'club' && req.me.teamId) {
    return { actorKey: `club:${req.me.teamId}`, type: 'club', teamId: req.me.teamId, clientId: cid };
  }
  if (req.me?.role === 'admin') {
    const qTid = String(req.body?.teamId || req.query?.teamId || '').trim();
    if (qTid) {
      return { actorKey: `club:${qTid}`, type: 'club', teamId: qTid, clientId: cid };
    }
    return { actorKey: `admin:${cid}`, type: 'admin', teamId: null, clientId: cid };
  }
  return { actorKey: `user:${cid}`, type: 'user', teamId: null, clientId: cid };
}

function ensureSponsorState(db: any, teamId: string) {
  db.sponsorCycles ||= {};
  const now = Date.now();
  let st = db.sponsorCycles[teamId];
  if (!st || typeof st !== 'object') {
    st = {
      cycleStartedAt: 0,
      views: { gazprom_neft: 0, tbank: 0, aeroflot: 0 },
      approved: { gazprom_neft: 0, tbank: 0, aeroflot: 0 },
      declined: { gazprom_neft: 0, tbank: 0, aeroflot: 0 },
      earnedEur: 0,
      rfsClaimed: false,
      rfsExtraViews: 0,
      rfsEarnedEur: 0,
      history: [],
    };
    db.sponsorCycles[teamId] = st;
  }
  if (st.cycleStartedAt > 0 && now - st.cycleStartedAt >= CYCLE_MS) {
    st.cycleStartedAt = 0;
    st.views = { gazprom_neft: 0, tbank: 0, aeroflot: 0 };
    st.approved = { gazprom_neft: 0, tbank: 0, aeroflot: 0 };
    st.declined = { gazprom_neft: 0, tbank: 0, aeroflot: 0 };
    st.earnedEur = 0;
    st.rfsClaimed = false;
    st.rfsExtraViews = 0;
    st.rfsEarnedEur = 0;
  }
  st.views ||= { gazprom_neft: 0, tbank: 0, aeroflot: 0 };
  st.approved ||= { gazprom_neft: 0, tbank: 0, aeroflot: 0 };
  st.declined ||= { gazprom_neft: 0, tbank: 0, aeroflot: 0 };
  st.history ||= [];
  return st;
}

export function buildSponsorSummary(ctx: AdServerContext, teamId: string) {
  const db = ctx.getDb();
  const st = ensureSponsorState(db, teamId);
  const blocks = getAdsgramBlocks(db);
  const now = Date.now();
  const totalViews = SPONSORS.reduce((acc, s) => acc + Math.min(s.maxViews, Number(st.views[s.id] || 0)), 0);
  const totalRequired = SPONSORS.reduce((acc, s) => acc + s.maxViews, 0);
  const resetAt = st.cycleStartedAt > 0 ? st.cycleStartedAt + CYCLE_MS : null;
  const remainingMs = resetAt ? Math.max(0, resetAt - now) : 0;
  const rfsUnlocked = totalViews >= totalRequired;

  return {
    cycleStartedAt: st.cycleStartedAt || null,
    resetAt,
    remainingMs,
    totalViews,
    totalRequired,
    rfsUnlocked,
    rfsClaimed: !!st.rfsClaimed,
    rfsExtraViews: Number(st.rfsExtraViews || 0),
    rfsMaxViews: 30,
    rfsRewardPerAd: 1000,
    rfsEarnedEur: Number(st.rfsEarnedEur || 0),
    earnedEurCycle: Number(st.earnedEur || 0),
    rfsBlockId: blocks.rfs_bonus,
    sponsors: SPONSORS.map((s) => ({
      ...s,
      blockId: blocks[s.blockKey],
      views: Math.min(s.maxViews, Number(st.views[s.id] || 0)),
      approvedCount: Number(st.approved[s.id] || 0),
      declinedCount: Number(st.declined[s.id] || 0),
      remaining: Math.max(0, s.maxViews - Number(st.views[s.id] || 0)),
    })),
    history: (st.history || []).slice(0, 15),
  };
}

export function ensureOwnerProfile(ctx: AdServerContext, actorKey: string, hintName?: string, hintPhoto?: string) {
  const db = ctx.getDb();
  db.ownerProfiles ||= {};
  const isClub = actorKey.startsWith('club:');
  const teamId = isClub ? actorKey.slice(5) : null;
  const t = teamId ? ctx.team(teamId) : null;
  let prof = db.ownerProfiles[actorKey];
  if (!prof) {
    prof = {
      actorKey,
      type: isClub ? 'club' : 'user',
      teamId: teamId || null,
      displayName: hintName || (t ? `Владелец ФК «${t.name}»` : actorKey.startsWith('admin:') ? 'Администратор лиги' : 'Болельщик РПЛ'),
      photoUrl: hintPhoto || '',
      bio: '',
      career: t ? `Руководство клубом «${t.name}» в лиге ${ctx.compName(t.comp || 'rpl')}.` : 'Участник лиги прогнозов РПЛ.',
      trophies: [],
      updatedAt: new Date().toISOString(),
    };
    db.ownerProfiles[actorKey] = prof;
  } else {
    if (hintName && (!prof.displayName || prof.displayName.startsWith('Болельщик РПЛ'))) {
      prof.displayName = hintName;
    }
    if (hintPhoto && !prof.photoUrl) {
      prof.photoUrl = hintPhoto;
    }
    if (teamId && !prof.teamId) prof.teamId = teamId;
  }
  prof.trophies ||= [];
  return prof;
}

export function ensureWallet(db: any, actorKey: string) {
  db.predictionWallets ||= {};
  let w = db.predictionWallets[actorKey];
  const now = Date.now();
  if (!w) {
    w = {
      coins: STARTER_COINS,
      totalEarnedCoins: STARTER_COINS,
      cycleStartedAt: 0,
      adCounts: { coins_short: 0, coins_banner: 0, coins_long: 0 },
    };
    db.predictionWallets[actorKey] = w;
  }
  if (w.cycleStartedAt > 0 && now - w.cycleStartedAt >= CYCLE_MS) {
    w.cycleStartedAt = 0;
    w.adCounts = { coins_short: 0, coins_banner: 0, coins_long: 0 };
  }
  w.adCounts ||= { coins_short: 0, coins_banner: 0, coins_long: 0 };
  return w;
}

export function verifyAndConsumeAdProof(
  adProof: string | undefined,
  expectedBlockKey: string,
  actorKey: string,
  requireClick = false
): { ok: true } | { ok: false; error: string } {
  if (!adProof) return { ok: false, error: 'Необходимо просмотреть рекламу Adsgram перед выполнением действия.' };
  const s = adSessions.get(String(adProof));
  if (!s) return { ok: false, error: 'Рекламная сессия не найдена или истекла. Посмотрите рекламу заново.' };
  if (s.consumed) return { ok: false, error: 'Этот просмотр рекламы уже использован.' };
  if (!s.verified) return { ok: false, error: 'Просмотр рекламы не завершён.' };
  if (s.blockKey !== expectedBlockKey) return { ok: false, error: 'Несоответствие рекламного блока Adsgram.' };
  if (s.actorKey !== actorKey) return { ok: false, error: 'Сессия рекламы принадлежит другому пользователю.' };
  if (requireClick && !s.clicked) {
    return { ok: false, error: 'Для подачи заявки на товарищеский матч необходимо не только посмотреть рекламу, но и кликнуть по ней.' };
  }
  s.consumed = true;
  return { ok: true };
}

export function getFriendlyBreakUsage(db: any, teamId: string): Record<string, number> {
  db.friendlyAdUsage ||= {};
  const rec = db.friendlyAdUsage[teamId];
  return rec && typeof rec === 'object' ? { ...rec } : {};
}

export function checkAndConsumeFriendlyRequestAd(
  db: any,
  teamId: string,
  breakId: string,
  actorKey: string,
  adProof?: string
): { ok: true; used: number; limit: number } | { ok: false; error: string } {
  db.friendlyAdUsage ||= {};
  db.friendlyAdUsage[teamId] ||= {};
  const used = Number(db.friendlyAdUsage[teamId][breakId] || 0);
  if (used >= FRIENDLY_BREAK_LIMIT) {
    return {
      ok: false,
      error: `Достигнут лимит заявок на товарищеские матчи за этот перерыв на сборные (${FRIENDLY_BREAK_LIMIT}/${FRIENDLY_BREAK_LIMIT}).`,
    };
  }
  const v = verifyAndConsumeAdProof(adProof, 'friendly_request', actorKey, true);
  if (!v.ok) return v;
  db.friendlyAdUsage[teamId][breakId] = used + 1;
  return { ok: true, used: used + 1, limit: FRIENDLY_BREAK_LIMIT };
}

export function checkAndConsumeFriendlyAcceptAd(
  actorKey: string,
  adProof?: string
): { ok: true } | { ok: false; error: string } {
  return verifyAndConsumeAdProof(adProof, 'friendly_accept', actorKey, false);
}

export function settlePredictionsForFixture(ctx: AdServerContext, f: any): number {
  if (!f || f.status !== 'done') return 0;
  const db = ctx.getDb();
  if (!Array.isArray(db.predictions) || !db.predictions.length) return 0;
  const hg = Number(f.hg);
  const ag = Number(f.ag);
  if (!Number.isFinite(hg) || !Number.isFinite(ag)) return 0;
  const actual: '1' | 'X' | '2' = hg > ag ? '1' : hg < ag ? '2' : 'X';
  let settledCount = 0;
  const nowIso = new Date().toISOString();

  for (const p of db.predictions) {
    if (p.fixtureId !== f.id || p.status !== 'pending') continue;
    const stake = Math.max(1, Number(p.stake || 1));
    const won = p.pick === actual;
    const exactMatch =
      won &&
      p.exactHome !== null &&
      p.exactHome !== undefined &&
      p.exactAway !== null &&
      p.exactAway !== undefined &&
      Number(p.exactHome) === hg &&
      Number(p.exactAway) === ag;
    p.status = won ? 'won' : 'lost';
    p.actualOutcome = actual;
    p.actualScore = `${hg}:${ag}`;
    p.settledAt = nowIso;
    if (won) {
      const pts = 3 * stake + (exactMatch ? 5 : 0);
      const coinsBack = stake * 2 + (exactMatch ? 2 : 0);
      p.pointsAwarded = pts;
      p.coinsWon = coinsBack;
      p.exactHit = exactMatch;
      const w = ensureWallet(db, p.actorKey);
      w.coins = Number(w.coins || 0) + coinsBack;
      w.totalEarnedCoins = Number(w.totalEarnedCoins || 0) + coinsBack;
    } else {
      p.pointsAwarded = 0;
      p.coinsWon = 0;
      p.exactHit = false;
    }
    settledCount++;
  }
  return settledCount;
}

export function computePredictionLeaderboard(ctx: AdServerContext, season: string, filterMembers?: Set<string>) {
  const db = ctx.getDb();
  const preds = (Array.isArray(db.predictions) ? db.predictions : []).filter((p: any) => p.season === season);
  const wallets = db.predictionWallets || {};
  const profiles = db.ownerProfiles || {};

  const map = new Map<string, any>();
  const ensureEntry = (actorKey: string) => {
    if (map.has(actorKey)) return map.get(actorKey);
    const prof = ensureOwnerProfile(ctx, actorKey);
    const tid = prof.teamId || (actorKey.startsWith('club:') ? actorKey.slice(5) : null);
    const t = tid ? ctx.team(tid) : null;
    const entry = {
      actorKey,
      displayName: prof.displayName || (t ? `Владелец ${t.name}` : 'Игрок'),
      photoUrl: prof.photoUrl || '',
      teamId: tid,
      teamName: t?.name || null,
      teamLogo: tid ? ctx.teamLogo(tid) : null,
      correct: 0,
      wrong: 0,
      pending: 0,
      exactHits: 0,
      total: 0,
      kpd: 0,
      points: 0,
      coinsWon: 0,
      coins: Number(wallets[actorKey]?.coins ?? STARTER_COINS),
    };
    map.set(actorKey, entry);
    return entry;
  };

  for (const key of Object.keys(wallets)) {
    if (!filterMembers || filterMembers.has(key)) ensureEntry(key);
  }
  for (const key of Object.keys(profiles)) {
    if (!filterMembers || filterMembers.has(key)) ensureEntry(key);
  }
  if (filterMembers) {
    for (const key of filterMembers) ensureEntry(key);
  }

  for (const p of preds) {
    if (filterMembers && !filterMembers.has(p.actorKey)) continue;
    const row = ensureEntry(p.actorKey);
    if (p.status === 'won') {
      row.correct++;
      row.total++;
      row.points += Number(p.pointsAwarded || 0);
      row.coinsWon += Number(p.coinsWon || 0);
      if (p.exactHit) row.exactHits++;
    } else if (p.status === 'lost') {
      row.wrong++;
      row.total++;
    } else if (p.status === 'pending') {
      row.pending++;
    }
  }

  const list = Array.from(map.values()).map((r) => ({
    ...r,
    kpd: r.total > 0 ? Math.round((r.correct / r.total) * 1000) / 10 : 0,
  }));

  list.sort(
    (a, b) =>
      b.points - a.points ||
      b.correct - a.correct ||
      b.kpd - a.kpd ||
      a.wrong - b.wrong ||
      a.displayName.localeCompare(b.displayName, 'ru')
  );

  return list.map((r, idx) => ({ ...r, rank: idx + 1 }));
}

export function awardSeasonPredictionPrizes(ctx: AdServerContext, season?: string) {
  const db = ctx.getDb();
  const targetSeason = season || ctx.S();
  db.predictionSeasonAwards ||= [];
  if (db.predictionSeasonAwards.some((a: any) => a.season === targetSeason)) {
    return { alreadyAwarded: true, season: targetSeason, winners: [] };
  }
  ctx.ensureInitialBudgets();
  const board = computePredictionLeaderboard(ctx, targetSeason).filter((r) => r.total > 0 || r.points > 0);
  const top3 = board.slice(0, 3);
  if (!top3.length) {
    return { alreadyAwarded: false, season: targetSeason, winners: [] };
  }
  const nowIso = new Date().toISOString();
  const winners: any[] = [];

  top3.forEach((row, idx) => {
    const prize = SEASON_PRIZES[idx];
    const w = ensureWallet(db, row.actorKey);
    w.coins = Number(w.coins || 0) + prize.prizeCoins;
    w.totalEarnedCoins = Number(w.totalEarnedCoins || 0) + prize.prizeCoins;

    let awardedEur = 0;
    if (row.teamId) {
      const t = ctx.team(row.teamId);
      if (t) {
        t.budget = Number(t.budget || 0) + prize.prizeEur;
        awardedEur = prize.prizeEur;
        db.budgetHistory ||= [];
        db.budgetHistory.push({
          id: 'bh_' + ctx.uid(),
          teamId: t.id,
          amount: prize.prizeEur,
          type: 'prediction_prize',
          typeLabel: 'Приз Лиги прогнозов',
          description: `${prize.badge} (Сезон ${targetSeason}): +€${prize.prizeEur.toLocaleString('ru-RU')}`,
          date: nowIso,
        });
      }
    }

    const prof = ensureOwnerProfile(ctx, row.actorKey);
    prof.trophies ||= [];
    prof.trophies.unshift({
      id: 'tr_' + ctx.uid(),
      title: `${prize.badge} — Сезон ${targetSeason}`,
      detail: `Очки: ${row.points} · Угадано: ${row.correct}/${row.total} · КПД: ${row.kpd}%`,
      date: nowIso.slice(0, 10),
    });

    winners.push({
      place: prize.place,
      badge: prize.badge,
      actorKey: row.actorKey,
      displayName: row.displayName,
      teamId: row.teamId,
      teamName: row.teamName,
      points: row.points,
      correct: row.correct,
      wrong: row.wrong,
      kpd: row.kpd,
      prizeEur: awardedEur,
      prizeCoins: prize.prizeCoins,
    });
  });

  const record = { season: targetSeason, awardedAt: nowIso, winners };
  db.predictionSeasonAwards.unshift(record);
  ctx.save();
  return { alreadyAwarded: false, ...record };
}

export function getNationalProposals(ntCurrent: any) {
  ntCurrent.playerProposals ||= [];
  ntCurrent.opponentProposals ||= [];
  return {
    playerProposals: ntCurrent.playerProposals as Array<{
      pid: string;
      proposedBy: string;
      proposedByTeamId: string | null;
      proposedByName: string;
      note: string;
      votes: number;
      voters: string[];
      createdAt: string;
    }>,
    opponentProposals: ntCurrent.opponentProposals as Array<{
      id: string;
      opponent: string;
      comment: string;
      proposedBy: string;
      proposedByName: string;
      votes: number;
      voters: string[];
      createdAt: string;
    }>,
  };
}

/**
 * Applies fan/club proposal vote priority to the national team pool:
 * - Good-form players receive a bounded tie-breaker bonus proportional to votes
 *   so 4 votes beats 1 vote when both played well.
 * - Terrible-form players (matches > 0 and rating < 5.9) get ZERO vote boost so
 *   a terribly performing player with 4 votes will still lose to a solid player with 1 vote.
 */
export function scoreNationalCandidateWithVotes(p: any, votesMap: Map<string, number>): number {
  const rating = Number(p.rating || 0);
  const goals = Number(p.goals || 0);
  const assists = Number(p.assists || 0);
  const ovr = Number(p.ovr || 70);
  const matches = Number(p.matches || 0);
  const baseScore = rating * 10 + goals * 3 + assists * 2 + ovr * 0.2;
  const votes = votesMap.get(p.id) || 0;
  if (votes <= 0) return baseScore;
  const terribleForm = matches > 0 && rating > 0 && rating < 5.9;
  if (terribleForm) return baseScore;
  const voteBonus = Math.min(votes, 15) * 2.5;
  return baseScore + voteBonus;
}

export function buildNationalProposalAiLines(ntCurrent: any): {
  votesMap: Map<string, number>;
  notesByPid: Map<string, string>;
  aiInstructionSuffix: string;
} {
  const { playerProposals } = getNationalProposals(ntCurrent);
  const votesMap = new Map<string, number>();
  const notesByPid = new Map<string, string>();
  for (const prop of playerProposals) {
    votesMap.set(prop.pid, Number(prop.votes || 1));
    if (prop.note) notesByPid.set(prop.pid, prop.note);
  }
  const aiInstructionSuffix = playerProposals.length
    ? ' Клубы и болельщики предложили часть кандидатов через голосование (указано [ПРЕДЛОЖЕН: X гол.]). Если два игрока показывают сопоставимые хорошие результаты и осталось спорное место в заявке — отдавай приоритет игроку с большим числом голосов (например 4 голоса важнее 1). Но если игрок с высоким числом голосов играет откровенно плохо (низкий рейтинг < 5.9 или провальная форма), бери достойно играющего кандидата даже с 1 голосом.'
    : '';
  return { votesMap, notesByPid, aiInstructionSuffix };
}

export function registerAdsAndPredictionsRoutes(app: Express, ctx: AdServerContext) {
  // ─── Adsgram Config & Ad Session Lifecycle ────────────────────────────────────
  app.get('/api/ads/config', (req, res) => {
    const db = ctx.getDb();
    res.json({
      blocks: getAdsgramBlocks(db),
      defs: ADSGRAM_BLOCKS,
      sponsors: SPONSORS,
      seasonPrizes: SEASON_PRIZES,
    });
  });

  app.post('/api/ads/start', (req, res) => {
    pruneAdSessions();
    const blockKey = String(req.body?.blockKey || '').trim();
    const def = ADSGRAM_BLOCKS.find((b) => b.key === blockKey);
    if (!def) return ctx.fail(res, 'Неизвестный рекламный блок Adsgram');
    const actor = resolveActor(req);
    const token = 'ad_' + crypto.randomBytes(14).toString('hex');
    adSessions.set(token, {
      token,
      blockKey,
      actorKey: actor.actorKey,
      startedAt: Date.now(),
      requiresClick: def.requiresClick,
      clicked: false,
      verified: false,
      consumed: false,
    });
    const blocks = getAdsgramBlocks(ctx.getDb());
    res.json({
      ok: 1,
      sessionToken: token,
      blockKey,
      blockId: blocks[blockKey],
      format: def.format,
      durationSec: def.durationSec,
      requiresClick: def.requiresClick,
    });
  });

  app.post('/api/ads/complete', (req, res) => {
    const token = String(req.body?.sessionToken || '').trim();
    const clicked = !!req.body?.clicked;
    const s = adSessions.get(token);
    if (!s) return ctx.fail(res, 'Рекламная сессия не найдена');
    const actor = resolveActor(req);
    if (s.actorKey !== actor.actorKey) return ctx.fail(res, 'Сессия не принадлежит текущему пользователю');
    if (s.requiresClick && !clicked) {
      return ctx.fail(res, 'Необходимо кликнуть по рекламному предложению во время показа.');
    }
    s.clicked = clicked;
    s.verified = true;
    res.json({ ok: 1, adProof: token, blockKey: s.blockKey, clicked: s.clicked });
  });

  // ─── Club Sponsors & RFS Bonus ────────────────────────────────────────────────
  app.get('/api/club/sponsors', ctx.needClub, (req: any, res) => {
    res.json(buildSponsorSummary(ctx, req.tid));
  });

  app.post('/api/club/sponsors/request', ctx.needClub, (req: any, res) => {
    const db = ctx.getDb();
    const sponsorId = String(req.body?.sponsorId || '').trim();
    const sp = SPONSORS.find((x) => x.id === sponsorId);
    if (!sp) return ctx.fail(res, 'Спонсор не найден');
    const actor = resolveActor(req);
    const st = ensureSponsorState(db, req.tid);
    const currentViews = Number(st.views[sp.id] || 0);
    if (currentViews >= sp.maxViews) {
      return ctx.fail(res, `Лимит показов у спонсора «${sp.name}» исчерпан (${sp.maxViews}/${sp.maxViews}) в этом 24-часовом цикле.`);
    }
    const v = verifyAndConsumeAdProof(req.body?.adProof, sp.blockKey, actor.actorKey, false);
    if (!v.ok) return ctx.fail(res, v.error);

    if (!st.cycleStartedAt) st.cycleStartedAt = Date.now();
    st.views[sp.id] = currentViews + 1;

    // 95% approve, 5% decline
    const approved = Math.random() < sp.approvalRate;
    const t = ctx.team(req.tid);
    ctx.ensureInitialBudgets();
    const nowIso = new Date().toISOString();

    if (approved) {
      st.approved[sp.id] = Number(st.approved[sp.id] || 0) + 1;
      st.earnedEur = Number(st.earnedEur || 0) + sp.rewardEur;
      if (t) {
        t.budget = Number(t.budget || 0) + sp.rewardEur;
        db.budgetHistory ||= [];
        db.budgetHistory.push({
          id: 'bh_' + ctx.uid(),
          teamId: t.id,
          amount: sp.rewardEur,
          type: 'sponsor_ad',
          typeLabel: `Спонсор: ${sp.name}`,
          description: `${sp.name} (${sp.formatLabel}): +€${sp.rewardEur.toLocaleString('ru-RU')}`,
          date: nowIso,
        });
      }
    } else {
      st.declined[sp.id] = Number(st.declined[sp.id] || 0) + 1;
    }

    st.history.unshift({
      id: 'sph_' + ctx.uid(),
      sponsorId: sp.id,
      sponsorName: sp.name,
      approved,
      amount: approved ? sp.rewardEur : 0,
      date: nowIso,
    });
    st.history = st.history.slice(0, 30);

    ctx.save();
    const summary = buildSponsorSummary(ctx, req.tid);
    res.json({
      ok: 1,
      approved,
      amount: approved ? sp.rewardEur : 0,
      newBudget: t?.budget || 0,
      message: approved
        ? `Спонсор «${sp.name}» одобрил заявку! Начислено +€${sp.rewardEur.toLocaleString('ru-RU')}.`
        : `Спонсор «${sp.name}» отклонил запрос на финансирование (шанс отказа 5%), но просмотр засчитан в прогресс к бонусу РФС!`,
      summary,
    });
  });

  app.post('/api/club/sponsors/rfs-claim', ctx.needClub, (req: any, res) => {
    const db = ctx.getDb();
    const actor = resolveActor(req);
    const st = ensureSponsorState(db, req.tid);
    const totalViews = SPONSORS.reduce((acc, s) => acc + Math.min(s.maxViews, Number(st.views[s.id] || 0)), 0);
    if (totalViews < 30) {
      return ctx.fail(res, `Сначала нужно просмотреть все 30 реклам у 3 спонсоров (сейчас ${totalViews}/30).`);
    }
    if (Number(st.rfsExtraViews || 0) >= 30) {
      return ctx.fail(res, 'Достигнут дневной лимит блока Adsgram для бонуса РФС (30/30). Дождитесь сброса 24-часового таймера.');
    }
    const v = verifyAndConsumeAdProof(req.body?.adProof, 'rfs_bonus', actor.actorKey, false);
    if (!v.ok) return ctx.fail(res, v.error);

    ctx.ensureInitialBudgets();
    const t = ctx.team(req.tid);
    const reward = 1000;
    const isActivation = !st.rfsClaimed;
    st.rfsClaimed = true;
    st.rfsExtraViews = Number(st.rfsExtraViews || 0) + 1;
    st.rfsEarnedEur = Number(st.rfsEarnedEur || 0) + reward;
    const nowIso = new Date().toISOString();

    if (t) {
      t.budget = Number(t.budget || 0) + reward;
      db.budgetHistory ||= [];
      db.budgetHistory.push({
        id: 'bh_' + ctx.uid(),
        teamId: t.id,
        amount: reward,
        type: 'rfs_bonus_ad',
        typeLabel: 'Бонус от РФС',
        description: isActivation
          ? `Бонус от РФС активирован (после 30/30 реклам): +€${reward.toLocaleString('ru-RU')}`
          : `Бонусная реклама РФС #${st.rfsExtraViews}: +€${reward.toLocaleString('ru-RU')}`,
        date: nowIso,
      });
    }

    st.history.unshift({
      id: 'sph_' + ctx.uid(),
      sponsorId: 'rfs',
      sponsorName: 'Бонус от РФС',
      approved: true,
      amount: reward,
      date: nowIso,
    });
    st.history = st.history.slice(0, 30);

    ctx.save();
    res.json({
      ok: 1,
      amount: reward,
      isActivation,
      newBudget: t?.budget || 0,
      message: isActivation
        ? 'Бонус от РФС получен! +€1 000 на счёт, теперь каждая следующая реклама РФС приносит €1 000 до сброса таймера!'
        : `Бонусная реклама РФС засчитана: +€1 000 в бюджет клуба!`,
      summary: buildSponsorSummary(ctx, req.tid),
    });
  });

  // ─── Owner Profiles ───────────────────────────────────────────────────────────
  app.get('/api/profile', (req: any, res) => {
    const actor = resolveActor(req);
    const db = ctx.getDb();
    const prof = ensureOwnerProfile(ctx, actor.actorKey);
    const board = computePredictionLeaderboard(ctx, ctx.S());
    const stats = board.find((x) => x.actorKey === actor.actorKey) || {
      rank: null,
      correct: 0,
      wrong: 0,
      pending: 0,
      total: 0,
      kpd: 0,
      points: 0,
      coins: ensureWallet(db, actor.actorKey).coins,
    };
    const t = prof.teamId ? ctx.team(prof.teamId) : null;
    res.json({
      profile: prof,
      stats,
      team: t ? { id: t.id, name: t.name, comp: t.comp, compName: ctx.compName(t.comp), logo: ctx.teamLogo(t.id), budget: t.budget || 0 } : null,
    });
  });

  app.get('/api/profile/:actorKey', (req, res) => {
    const targetKey = decodeURIComponent(String(req.params.actorKey || ''));
    if (!targetKey) return ctx.fail(res, 'Профиль не указан');
    const db = ctx.getDb();
    const prof = ensureOwnerProfile(ctx, targetKey);
    const board = computePredictionLeaderboard(ctx, ctx.S());
    const stats = board.find((x) => x.actorKey === targetKey) || {
      rank: null,
      correct: 0,
      wrong: 0,
      pending: 0,
      total: 0,
      kpd: 0,
      points: 0,
      coins: Number(db.predictionWallets?.[targetKey]?.coins ?? STARTER_COINS),
    };
    const t = prof.teamId ? ctx.team(prof.teamId) : null;
    res.json({
      profile: prof,
      stats,
      team: t ? { id: t.id, name: t.name, comp: t.comp, compName: ctx.compName(t.comp), logo: ctx.teamLogo(t.id), budget: t.budget || 0 } : null,
    });
  });

  app.post('/api/profile', (req: any, res) => {
    const actor = resolveActor(req);
    const prof = ensureOwnerProfile(ctx, actor.actorKey);
    const displayName = ctx.cleanTxt(req.body?.displayName, 60);
    const bio = ctx.cleanTxt(req.body?.bio, 400);
    const career = ctx.cleanTxt(req.body?.career, 800);
    const rawPhoto = String(req.body?.photoUrl || '').trim();
    if (displayName) prof.displayName = displayName;
    if (req.body?.bio !== undefined) prof.bio = bio;
    if (req.body?.career !== undefined) prof.career = career;
    if (req.body?.photoUrl !== undefined) {
      if (!rawPhoto) {
        prof.photoUrl = '';
      } else if (/^(https?:\/\/|data:image\/(png|jpeg|jpg|webp);base64,)/i.test(rawPhoto) && rawPhoto.length <= 220_000) {
        prof.photoUrl = rawPhoto;
      } else {
        return ctx.fail(res, 'Некорректное фото или слишком большой файл (макс. 200 КБ).');
      }
    }
    prof.updatedAt = new Date().toISOString();
    ctx.save();
    res.json({ ok: 1, profile: prof, message: 'Профиль владельца обновлён' });
  });

  // ─── Predictions Tab & Coin Economy ───────────────────────────────────────────
  app.get('/api/predictions', (req: any, res) => {
    const db = ctx.getDb();
    const season = ctx.S();

    // Ensure any recently finished matches settle pending predictions
    for (const f of db.fixtures || []) {
      if (f.status === 'done') settlePredictionsForFixture(ctx, f);
    }

    const tgName = ctx.cleanTxt(req.headers?.['x-tg-name'], 60);
    const tgPhoto = String(req.headers?.['x-tg-photo'] || '').trim();
    const actor = resolveActor(req);
    const profile = ensureOwnerProfile(ctx, actor.actorKey, tgName || undefined, /^https?:\/\//.test(tgPhoto) ? tgPhoto : undefined);
    const wallet = ensureWallet(db, actor.actorKey);
    const blocks = getAdsgramBlocks(db);

    const openFixtures = (db.fixtures || [])
      .filter((f: any) => (f.season || season) === season && f.status === 'scheduled' && (f.comp === 'rpl' || f.comp === 'cup' || f.comp === 'supercup' || f.comp === 'friendly_match'))
      .sort((a: any, b: any) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')))
      .slice(0, 32)
      .map((f: any) => ({
        id: f.id,
        comp: f.comp,
        compName: ctx.compName(f.comp),
        round: f.round,
        label: f.label || `Тур ${f.round || 1}`,
        date: f.gameDate || f.date,
        time: f.gameTime || f.time || '19:00',
        realDate: f.realDate || f.date,
        realTime: f.realTime || f.time || '19:00',
        homeId: f.home,
        awayId: f.away,
        homeName: ctx.tn(f.home),
        awayName: ctx.tn(f.away),
        homeLogo: ctx.teamLogo(f.home),
        awayLogo: ctx.teamLogo(f.away),
      }));

    const allPreds = Array.isArray(db.predictions) ? db.predictions : [];
    const myPredictions = allPreds
      .filter((p: any) => p.actorKey === actor.actorKey && p.season === season)
      .slice(-40)
      .reverse()
      .map((p: any) => {
        const fxObj = (db.fixtures || []).find((f: any) => f.id === p.fixtureId);
        return {
          ...p,
          homeName: fxObj ? ctx.tn(fxObj.home) : p.homeName || 'Хозяева',
          awayName: fxObj ? ctx.tn(fxObj.away) : p.awayName || 'Гости',
          label: fxObj?.label || p.label || '',
          date: fxObj?.date || p.date || '',
        };
      });

    const leaderboard = computePredictionLeaderboard(ctx, season);

    const leagues = (Array.isArray(db.predictionLeagues) ? db.predictionLeagues : []).map((lg: any) => {
      const memberSet = new Set<string>(Array.isArray(lg.members) ? lg.members : []);
      const board = computePredictionLeaderboard(ctx, season, memberSet);
      return {
        id: lg.id,
        name: lg.name,
        description: lg.description || '',
        code: lg.code,
        isPublic: lg.isPublic !== false,
        ownerKey: lg.ownerKey,
        isMember: memberSet.has(actor.actorKey),
        membersCount: memberSet.size,
        leaderboard: board,
      };
    });

    res.json({
      season,
      actorKey: actor.actorKey,
      profile,
      wallet: {
        coins: wallet.coins,
        totalEarnedCoins: wallet.totalEarnedCoins,
        adCounts: wallet.adCounts,
        resetAt: wallet.cycleStartedAt ? wallet.cycleStartedAt + CYCLE_MS : null,
      },
      coinOffers: [
        { blockKey: 'coins_short', blockId: blocks.coins_short, label: 'Короткая реклама (5 сек)', rewardCoins: 1, maxViews: 30, views: Number(wallet.adCounts.coins_short || 0) },
        { blockKey: 'coins_banner', blockId: blocks.coins_banner, label: 'Баннерная реклама', rewardCoins: 2, maxViews: 30, views: Number(wallet.adCounts.coins_banner || 0) },
        { blockKey: 'coins_long', blockId: blocks.coins_long, label: 'Длинная реклама (30 сек)', rewardCoins: 3, maxViews: 30, views: Number(wallet.adCounts.coins_long || 0) },
      ],
      fixtures: openFixtures,
      myPredictions,
      leaderboard,
      leagues,
      seasonPrizes: SEASON_PRIZES,
      seasonAwards: db.predictionSeasonAwards || [],
    });
  });

  app.post('/api/predictions/earn-coins', (req: any, res) => {
    const db = ctx.getDb();
    const blockKey = String(req.body?.blockKey || '').trim() as 'coins_short' | 'coins_banner' | 'coins_long';
    const rewardMap: Record<string, number> = { coins_short: 1, coins_banner: 2, coins_long: 3 };
    const reward = rewardMap[blockKey];
    if (!reward) return ctx.fail(res, 'Неверный тип рекламы для получения монет');

    const actor = resolveActor(req);
    const wallet = ensureWallet(db, actor.actorKey);
    const cur = Number(wallet.adCounts[blockKey] || 0);
    if (cur >= 30) {
      return ctx.fail(res, 'Достигнут лимит рекламного блока (30/30 за 24 часа). Выберите другой формат или дождитесь сброса.');
    }

    const v = verifyAndConsumeAdProof(req.body?.adProof, blockKey, actor.actorKey, false);
    if (!v.ok) return ctx.fail(res, v.error);

    if (!wallet.cycleStartedAt) wallet.cycleStartedAt = Date.now();
    wallet.adCounts[blockKey] = cur + 1;
    wallet.coins = Number(wallet.coins || 0) + reward;
    wallet.totalEarnedCoins = Number(wallet.totalEarnedCoins || 0) + reward;
    ctx.save();

    res.json({
      ok: 1,
      coinsAdded: reward,
      coins: wallet.coins,
      message: `Начислено +${reward} ${reward === 1 ? 'монета' : 'монеты'} за просмотр рекламы!`,
    });
  });

  app.post('/api/predictions/bet', (req: any, res) => {
    const db = ctx.getDb();
    const fixtureId = String(req.body?.fixtureId || '').trim();
    const pick = String(req.body?.pick || '').trim() as '1' | 'X' | '2';
    const stake = Math.max(1, Math.min(10, Math.round(Number(req.body?.stake || 1))));
    if (!['1', 'X', '2'].includes(pick)) return ctx.fail(res, 'Выберите исход: П1, Х или П2');

    const f = (db.fixtures || []).find((x: any) => x.id === fixtureId);
    if (!f) return ctx.fail(res, 'Матч не найден');
    if (f.status !== 'scheduled') return ctx.fail(res, 'Приём прогнозов на этот матч уже закрыт');

    const actor = resolveActor(req);
    ensureOwnerProfile(ctx, actor.actorKey);
    const wallet = ensureWallet(db, actor.actorKey);
    db.predictions ||= [];

    const season = f.season || ctx.S();
    const existing = db.predictions.find((p: any) => p.fixtureId === fixtureId && p.actorKey === actor.actorKey);
    if (existing) {
      return ctx.fail(res, 'Вы уже сделали прогноз на этот матч.');
    }
    if (Number(wallet.coins || 0) < stake) {
      return ctx.fail(res, `Недостаточно монет (нужно ${stake}, на балансе ${wallet.coins}). Посмотрите рекламу, чтобы заработать монеты!`);
    }

    const rawEh = req.body?.exactHome;
    const rawEa = req.body?.exactAway;
    const hasExact = rawEh !== '' && rawEh !== null && rawEh !== undefined && rawEa !== '' && rawEa !== null && rawEa !== undefined;
    const exactHome = hasExact ? Math.max(0, Math.min(20, Math.round(Number(rawEh)))) : null;
    const exactAway = hasExact ? Math.max(0, Math.min(20, Math.round(Number(rawEa)))) : null;

    wallet.coins = Number(wallet.coins) - stake;
    const pred = {
      id: 'pr_' + ctx.uid(),
      season,
      actorKey: actor.actorKey,
      teamId: actor.teamId,
      fixtureId: f.id,
      homeName: ctx.tn(f.home),
      awayName: ctx.tn(f.away),
      label: f.label || `Тур ${f.round || 1}`,
      date: f.date,
      pick,
      exactHome,
      exactAway,
      stake,
      status: 'pending',
      pointsAwarded: 0,
      coinsWon: 0,
      createdAt: new Date().toISOString(),
    };
    db.predictions.push(pred);
    ctx.save();

    res.json({
      ok: 1,
      prediction: pred,
      coins: wallet.coins,
      message: `Прогноз «${pick === '1' ? ctx.tn(f.home) : pick === '2' ? ctx.tn(f.away) : 'Ничья'}» принят (${stake} мон.)!`,
    });
  });

  app.post('/api/predictions/league/create', (req: any, res) => {
    const db = ctx.getDb();
    const name = ctx.cleanTxt(req.body?.name, 50);
    if (name.length < 2) return ctx.fail(res, 'Введите название лиги (от 2 символов)');
    const description = ctx.cleanTxt(req.body?.description, 160);
    const isPublic = req.body?.isPublic !== false;
    const actor = resolveActor(req);
    ensureOwnerProfile(ctx, actor.actorKey);
    ensureWallet(db, actor.actorKey);

    db.predictionLeagues ||= [];
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const lg = {
      id: 'plg_' + ctx.uid(),
      name,
      description,
      code,
      isPublic,
      ownerKey: actor.actorKey,
      members: [actor.actorKey],
      createdAt: new Date().toISOString(),
    };
    db.predictionLeagues.unshift(lg);
    ctx.save();
    res.json({ ok: 1, league: lg, message: `Лига «${name}» создана! Код приглашения: ${code}` });
  });

  app.post('/api/predictions/league/join', (req: any, res) => {
    const db = ctx.getDb();
    const q = String(req.body?.codeOrId || '').trim();
    if (!q) return ctx.fail(res, 'Укажите код или ID лиги');
    const actor = resolveActor(req);
    ensureOwnerProfile(ctx, actor.actorKey);
    ensureWallet(db, actor.actorKey);

    db.predictionLeagues ||= [];
    const lg = db.predictionLeagues.find(
      (x: any) => x.id === q || String(x.code || '').toUpperCase() === q.toUpperCase()
    );
    if (!lg) return ctx.fail(res, 'Лига с таким кодом не найдена');
    lg.members ||= [];
    if (!lg.members.includes(actor.actorKey)) {
      lg.members.push(actor.actorKey);
      ctx.save();
    }
    res.json({ ok: 1, leagueId: lg.id, message: `Вы вступили в лигу «${lg.name}»!` });
  });

  app.post('/api/predictions/league/leave', (req: any, res) => {
    const db = ctx.getDb();
    const leagueId = String(req.body?.leagueId || '').trim();
    const actor = resolveActor(req);
    const lg = (db.predictionLeagues || []).find((x: any) => x.id === leagueId);
    if (!lg) return ctx.fail(res, 'Лига не найдена');
    lg.members = (lg.members || []).filter((m: string) => m !== actor.actorKey);
    ctx.save();
    res.json({ ok: 1, message: `Вы покинули лигу «${lg.name}»` });
  });

  app.post('/api/admin/predictions/award-season', ctx.admin, (req, res) => {
    const season = String(req.body?.season || ctx.S()).trim();
    const out = awardSeasonPredictionPrizes(ctx, season);
    if (out.alreadyAwarded) {
      return ctx.fail(res, `Призы за сезон ${season} уже были выданы.`);
    }
    if (!out.winners.length) {
      return ctx.fail(res, `Нет завершённых прогнозов за сезон ${season} для награждения.`);
    }
    res.json({ ok: 1, ...out, message: `Призы Топ-3 Лиги прогнозов за сезон ${season} успешно выданы!` });
  });

  // ─── National Team Proposals & Voting ─────────────────────────────────────────
  app.post('/api/national/propose-player', ctx.needClub, (req: any, res) => {
    const nt = ctx.ensureNationalTeam();
    const pid = String(req.body?.pid || '').trim();
    const note = ctx.cleanTxt(req.body?.note, 180);
    const p = ctx.player(pid);
    if (!p) return ctx.fail(res, 'Игрок не найден');
    if (req.me?.role !== 'admin' && p.teamId !== req.tid) {
      return ctx.fail(res, 'Предложить в сборную можно только игрока своего клуба.');
    }
    const isRus = !p.nat || p.nat === 'RUS' || p.nat === 'Россия' || p.nation === 'Россия';
    if (!isRus) {
      return ctx.fail(res, 'В сборную России можно предложить только игрока с российским гражданством.');
    }

    const actor = resolveActor(req);
    const { playerProposals } = getNationalProposals(nt.current);
    const existing = playerProposals.find((x) => x.pid === pid);
    if (existing) {
      return ctx.fail(res, 'Этот игрок уже предложен на текущий сбор — вы можете поддержать его голосом.');
    }

    const v = verifyAndConsumeAdProof(req.body?.adProof, 'nt_propose_player', actor.actorKey, false);
    if (!v.ok) return ctx.fail(res, v.error);

    const prof = ensureOwnerProfile(ctx, actor.actorKey);
    playerProposals.push({
      pid,
      proposedBy: actor.actorKey,
      proposedByTeamId: req.tid,
      proposedByName: `${ctx.tn(req.tid)} (${prof.displayName})`,
      note,
      votes: 1,
      voters: [actor.actorKey],
      createdAt: new Date().toISOString(),
    });
    ctx.save();
    res.json({ ok: 1, message: `${p.name} предложен в сборную России (1 голос)!` });
  });

  app.post('/api/national/vote-player', (req: any, res) => {
    const nt = ctx.ensureNationalTeam();
    const pid = String(req.body?.pid || '').trim();
    const actor = resolveActor(req);
    const { playerProposals } = getNationalProposals(nt.current);
    const prop = playerProposals.find((x) => x.pid === pid);
    if (!prop) return ctx.fail(res, 'Кандидат не найден среди предложенных');
    prop.voters ||= [];
    if (prop.voters.includes(actor.actorKey)) {
      return ctx.fail(res, 'Вы уже отдали свой голос за этого кандидата в текущем сборе.');
    }

    const v = verifyAndConsumeAdProof(req.body?.adProof, 'nt_vote_player', actor.actorKey, false);
    if (!v.ok) return ctx.fail(res, v.error);

    prop.voters.push(actor.actorKey);
    prop.votes = prop.voters.length;
    ctx.save();
    res.json({ ok: 1, votes: prop.votes, message: `Голос учтён! У кандидата теперь ${prop.votes} гол.` });
  });

  app.post('/api/national/propose-opponent', (req: any, res) => {
    const nt = ctx.ensureNationalTeam();
    const opponent = ctx.cleanTxt(req.body?.opponent, 60);
    const comment = ctx.cleanTxt(req.body?.comment, 160);
    if (opponent.length < 2) return ctx.fail(res, 'Укажите название сборной-соперника');

    const actor = resolveActor(req);
    const { opponentProposals } = getNationalProposals(nt.current);
    if (opponentProposals.some((x) => x.opponent.toLowerCase() === opponent.toLowerCase())) {
      return ctx.fail(res, `Сборная «${opponent}» уже есть в списке — проголосуйте за готовый вариант!`);
    }

    const v = verifyAndConsumeAdProof(req.body?.adProof, 'nt_propose_opp', actor.actorKey, false);
    if (!v.ok) return ctx.fail(res, v.error);

    const prof = ensureOwnerProfile(ctx, actor.actorKey);
    opponentProposals.push({
      id: 'ntop_' + ctx.uid(),
      opponent,
      comment,
      proposedBy: actor.actorKey,
      proposedByName: prof.teamId ? `${ctx.tn(prof.teamId)} · ${prof.displayName}` : prof.displayName,
      votes: 1,
      voters: [actor.actorKey],
      createdAt: new Date().toISOString(),
    });
    ctx.save();
    res.json({ ok: 1, message: `Соперник «${opponent}» предложен для голосования!` });
  });

  app.post('/api/national/vote-opponent', (req: any, res) => {
    const nt = ctx.ensureNationalTeam();
    const proposalId = String(req.body?.proposalId || '').trim();
    const actor = resolveActor(req);
    const { opponentProposals } = getNationalProposals(nt.current);
    const prop = opponentProposals.find((x) => x.id === proposalId);
    if (!prop) return ctx.fail(res, 'Вариант соперника не найден');
    prop.voters ||= [];
    if (prop.voters.includes(actor.actorKey)) {
      return ctx.fail(res, `Вы уже голосовали за сборную «${prop.opponent}».`);
    }

    const v = verifyAndConsumeAdProof(req.body?.adProof, 'nt_vote_opp', actor.actorKey, false);
    if (!v.ok) return ctx.fail(res, v.error);

    prop.voters.push(actor.actorKey);
    prop.votes = prop.voters.length;
    ctx.save();
    res.json({ ok: 1, votes: prop.votes, message: `Голос за матч со сборной «${prop.opponent}» учтён!` });
  });
}
