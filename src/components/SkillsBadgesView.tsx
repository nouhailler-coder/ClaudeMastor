import React, { useState, useMemo, useEffect } from 'react';
import { TabType } from '../types';
import {
  DOMAIN_SKILL_TRACKS,
  TIER_VISUAL_META,
  DomainSkillTrack,
  SkillBadgeLevel,
  SkillTierId,
} from '../data/skillBadgesData';
import { loadLocalSRSRecords } from '../utils/srsEngine';
import {
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Terminal,
  FileQuestion,
  Layers,
  Network,
  Flame,
  RotateCcw,
  Plus,
  ShieldCheck,
  TrendingUp,
  Check,
} from 'lucide-react';

interface SkillsBadgesViewProps {
  onNavigateTab: (tab: TabType) => void;
  onSelectDomainFlashcards: (domainId: number) => void;
  onLaunchDomainDrill: (domainId: number) => void;
}

interface DomainLiveStats {
  questionsAnswered: number;
  accuracyPercent: number;
  examsPassed: number;
  practicalLabsPassed: number;
}

const STORAGE_KEY_SKILL_STATS = 'claudemastor_skill_badge_stats_v1';

export const SkillsBadgesView: React.FC<SkillsBadgesViewProps> = ({
  onNavigateTab,
  onSelectDomainFlashcards,
  onLaunchDomainDrill,
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<number>(2); // Default: Domaine 2 (MCP)
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('mcp-practitioner');
  const [tierFilter, setTierFilter] = useState<SkillTierId | 'all'>('all');

  // Load or initialize live stats per domain
  const [domainStats, setDomainStats] = useState<Record<number, DomainLiveStats>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SKILL_STATS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    const initial: Record<number, DomainLiveStats> = {};
    for (const track of DOMAIN_SKILL_TRACKS) {
      initial[track.domainId] = { ...track.defaultStats };
    }
    return initial;
  });

  // Enrich with SRS flashcard reviews if user reviewed cards in a domain
  const srsBonusByDomain = useMemo(() => {
    const records = loadLocalSRSRecords();
    const counts: Record<number, number> = {};
    Object.values(records).forEach((rec) => {
      if (rec.stage !== 'new') {
        counts[rec.domainId] = (counts[rec.domainId] || 0) + 1;
      }
    });
    return counts;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SKILL_STATS, JSON.stringify(domainStats));
    } catch {
      // ignore
    }
  }, [domainStats]);

  const getEffectiveStats = (track: DomainSkillTrack): DomainLiveStats => {
    const base = domainStats[track.domainId] || track.defaultStats;
    const srsExtra = srsBonusByDomain[track.domainId] || 0;
    return {
      questionsAnswered: base.questionsAnswered + srsExtra,
      accuracyPercent: base.accuracyPercent,
      examsPassed: base.examsPassed,
      practicalLabsPassed: base.practicalLabsPassed,
    };
  };

  const evaluateBadgeProgress = (level: SkillBadgeLevel, stats: DomainLiveStats) => {
    const qMet = stats.questionsAnswered >= level.conditions.questionsRequired;
    const accMet = stats.accuracyPercent >= level.conditions.minAccuracyPercent;
    const examsMet = stats.examsPassed >= level.conditions.examsPassedRequired;
    const labsMet = stats.practicalLabsPassed >= level.conditions.practicalLabsRequired;

    const metCount = [qMet, accMet, examsMet, labsMet].filter(Boolean).length;
    const isUnlocked = qMet && accMet && examsMet && labsMet;

    const qRatio = Math.min(1, stats.questionsAnswered / level.conditions.questionsRequired);
    const accRatio = Math.min(1, stats.accuracyPercent / level.conditions.minAccuracyPercent);
    const examsRatio = Math.min(1, stats.examsPassed / level.conditions.examsPassedRequired);
    const labsRatio = Math.min(1, stats.practicalLabsPassed / level.conditions.practicalLabsRequired);

    const overallPercent = Math.round(((qRatio + accRatio + examsRatio + labsRatio) / 4) * 100);

    return {
      isUnlocked,
      metCount,
      overallPercent,
      qMet,
      accMet,
      examsMet,
      labsMet,
    };
  };

  const activeTrack =
    DOMAIN_SKILL_TRACKS.find((t) => t.domainId === selectedDomainId) || DOMAIN_SKILL_TRACKS[0];
  const activeStats = getEffectiveStats(activeTrack);

  const activeBadge =
    activeTrack.levels.find((l) => l.id === selectedBadgeId) || activeTrack.levels[1];
  const activeBadgeEval = evaluateBadgeProgress(activeBadge, activeStats);

  // Compute global summary across all 20 badges (5 domains x 4 levels)
  const globalBadgeSummary = useMemo(() => {
    let totalUnlocked = 0;
    const highestByDomain: Record<number, SkillBadgeLevel | null> = {};

    for (const track of DOMAIN_SKILL_TRACKS) {
      const st = getEffectiveStats(track);
      let highest: SkillBadgeLevel | null = null;
      for (const lvl of track.levels) {
        const ev = evaluateBadgeProgress(lvl, st);
        if (ev.isUnlocked) {
          totalUnlocked += 1;
          highest = lvl;
        }
      }
      highestByDomain[track.domainId] = highest;
    }

    return {
      totalUnlocked,
      totalBadges: DOMAIN_SKILL_TRACKS.length * 4,
      highestByDomain,
    };
  }, [domainStats, srsBonusByDomain]);

  const handleSelectTrack = (domainId: number, defaultBadgeId?: string) => {
    setSelectedDomainId(domainId);
    const track = DOMAIN_SKILL_TRACKS.find((t) => t.domainId === domainId);
    if (track) {
      if (defaultBadgeId) {
        setSelectedBadgeId(defaultBadgeId);
      } else {
        // Pick highest unlocked or Practitioner
        const st = getEffectiveStats(track);
        let target = track.levels[1];
        for (const lvl of track.levels) {
          if (evaluateBadgeProgress(lvl, st).isUnlocked) {
            target = lvl;
          }
        }
        setSelectedBadgeId(target.id);
      }
    }
  };

  const handleApplyPresetForActiveDomain = (preset: SkillTierId) => {
    const targetLevel =
      activeTrack.levels.find((l) => l.tier === preset) || activeTrack.levels[1];
    setDomainStats((prev) => ({
      ...prev,
      [activeTrack.domainId]: {
        questionsAnswered: targetLevel.conditions.questionsRequired,
        accuracyPercent: Math.max(
          targetLevel.conditions.minAccuracyPercent + 2,
          activeTrack.defaultStats.accuracyPercent
        ),
        examsPassed: targetLevel.conditions.examsPassedRequired,
        practicalLabsPassed: targetLevel.conditions.practicalLabsRequired,
      },
    }));
    setSelectedBadgeId(targetLevel.id);
  };

  const handleIncrementStat = (
    field: keyof DomainLiveStats,
    delta: number,
    maxCap?: number
  ) => {
    setDomainStats((prev) => {
      const current = prev[activeTrack.domainId] || activeTrack.defaultStats;
      const nextVal = current[field] + delta;
      return {
        ...prev,
        [activeTrack.domainId]: {
          ...current,
          [field]: maxCap ? Math.min(maxCap, nextVal) : nextVal,
        },
      };
    });
  };

  const handleResetDefaults = () => {
    const initial: Record<number, DomainLiveStats> = {};
    for (const track of DOMAIN_SKILL_TRACKS) {
      initial[track.domainId] = { ...track.defaultStats };
    }
    setDomainStats(initial);
    setSelectedDomainId(2);
    setSelectedBadgeId('mcp-practitioner');
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Header Banner */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono text-[11px]">
            <Award className="w-4 h-4 text-[#99462a]" />
            <span className="tracking-wider text-[#99462a] uppercase font-bold">
              Système de Niveaux & Badges de Compétences Vérifiées
            </span>
            <span className="text-[#88726c]">·</span>
            <span className="text-[#55433d]">
              {globalBadgeSummary.totalUnlocked} / {globalBadgeSummary.totalBadges} badges acquis
            </span>
          </div>

          <h1 className="font-headline text-[36px] lg:text-[42px] text-[#1c1b1b] tracking-tight leading-tight">
            Compétences Acquises & Niveaux Techniques
          </h1>

          <p className="text-[16px] text-[#55433d] mt-2 leading-relaxed">
            Pas simplement des badges décoratifs : chaque niveau (
            <strong className="text-[#1565c0]">🔵 Beginner</strong>,{' '}
            <strong className="text-[#2e7d32]">🟢 Practitioner</strong>,{' '}
            <strong className="text-[#6a1b9a]">🟣 Advanced</strong>,{' '}
            <strong className="text-[#ba1a1a]">🔴 Expert</strong>) exige la validation simultanée
            de <strong>4 preuves mesurables</strong> : volume de questions, précision minimale,
            examens réussis et exercices pratiques Lab validés.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#55433d] font-mono text-[11px] font-semibold border border-[#eae7e7] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser l’état initial</span>
          </button>
        </div>
      </section>

      {/* Section 1: Les 4 Paliers de Compétence MCP (Mise en avant directe de l'exemple utilisateur) */}
      <section className="mb-10 rounded-3xl bg-white border-2 border-[#99462a]/25 p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#eae7e7]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-wider font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Progression par Compétence · Exemple Phare : Tool Use & MCP</span>
            </div>
            <h2 className="font-headline text-[26px] lg:text-[30px] text-[#1c1b1b] leading-tight">
              Échelle de Maîtrise : {activeTrack.shortTag} ({activeTrack.domainTitle})
            </h2>
          </div>

          {/* Quick Domain Switcher Pills */}
          <div className="flex items-center gap-1.5 flex-wrap bg-[#f6f3f2] p-1.5 rounded-xl border border-[#eae7e7]">
            {DOMAIN_SKILL_TRACKS.map((track) => {
              const isSelected = track.domainId === selectedDomainId;
              return (
                <button
                  key={track.domainId}
                  type="button"
                  onClick={() => handleSelectTrack(track.domainId)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1c1b1b] text-white shadow-xs'
                      : 'text-[#55433d] hover:text-[#1c1b1b] hover:bg-white/70'
                  }`}
                >
                  {track.shortTag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Badge Cards Row: 🔵 Beginner | 🟢 Practitioner | 🟣 Advanced | 🔴 Expert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {activeTrack.levels.map((lvl) => {
            const ev = evaluateBadgeProgress(lvl, activeStats);
            const meta = TIER_VISUAL_META[lvl.tier];
            const isSelected = lvl.id === activeBadge.id;

            return (
              <div
                key={lvl.id}
                onClick={() => setSelectedBadgeId(lvl.id)}
                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-[#fcf9f8] border-[#99462a] ring-2 ring-[#99462a]/15 shadow-sm'
                    : ev.isUnlocked
                    ? 'bg-white border-[#c8e6c9] hover:border-[#99462a]/60'
                    : 'bg-[#f6f3f2]/80 border-[#eae7e7] hover:border-[#dbc1b9]'
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#55433d]">
                      Niveau {meta.rankNumber}/4 · {lvl.tierLabel}
                    </span>
                    {ev.isUnlocked ? (
                      <span className="font-mono text-[11px] font-bold text-[#2e7d32] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Acquis
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-[#88726c] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        {ev.metCount}/4
                      </span>
                    )}
                  </div>

                  {/* Badge Title with colored indicator */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-[22px] leading-none" aria-hidden="true">
                      {lvl.dotEmoji}
                    </span>
                    <h3 className="font-headline text-[21px] font-bold text-[#1c1b1b] leading-snug">
                      {lvl.badgeName}
                    </h3>
                  </div>

                  <p className="text-[12.5px] text-[#55433d] leading-relaxed">
                    {lvl.shortDescription}
                  </p>
                </div>

                {/* Compact 4-condition summary list */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-[#eae7e7] font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#55433d]">
                      {lvl.conditions.questionsRequired} questions {activeTrack.shortTag}
                    </span>
                    <span className={ev.qMet ? 'text-[#2e7d32] font-bold' : 'text-[#88726c]'}>
                      {activeStats.questionsAnswered}/{lvl.conditions.questionsRequired}{' '}
                      {ev.qMet ? '✓' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#55433d]">
                      Score ≥ {lvl.conditions.minAccuracyPercent} %
                    </span>
                    <span className={ev.accMet ? 'text-[#2e7d32] font-bold' : 'text-[#88726c]'}>
                      {activeStats.accuracyPercent} % {ev.accMet ? '✓' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#55433d]">
                      {lvl.conditions.examsPassedRequired} examen
                      {lvl.conditions.examsPassedRequired > 1 ? 's' : ''} réussi
                      {lvl.conditions.examsPassedRequired > 1 ? 's' : ''}
                    </span>
                    <span className={ev.examsMet ? 'text-[#2e7d32] font-bold' : 'text-[#88726c]'}>
                      {activeStats.examsPassed}/{lvl.conditions.examsPassedRequired}{' '}
                      {ev.examsMet ? '✓' : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#55433d]">
                      {lvl.conditions.practicalLabsRequired} exercice
                      {lvl.conditions.practicalLabsRequired > 1 ? 's' : ''} pratique
                      {lvl.conditions.practicalLabsRequired > 1 ? 's' : ''}
                    </span>
                    <span className={ev.labsMet ? 'text-[#2e7d32] font-bold' : 'text-[#88726c]'}>
                      {activeStats.practicalLabsPassed}/{lvl.conditions.practicalLabsRequired}{' '}
                      {ev.labsMet ? '✓' : ''}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#e5e2e1] h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ev.isUnlocked ? 'bg-[#2e7d32]' : 'bg-[#99462a]'
                      }`}
                      style={{ width: `${ev.overallPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Inspection of Selected Badge (Default: 🟢 MCP Practitioner) */}
        <div className="rounded-2xl bg-[#fcf9f8] border border-[#dbc1b9] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Columns: Exact Specification Card ("Exemple : MCP Practitioner -> Conditions") */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="uppercase tracking-wider text-[#99462a] font-bold">
                  Fiche de Compétence Sélectionnée
                </span>
                <span
                  className={`font-bold ${
                    activeBadgeEval.isUnlocked ? 'text-[#2e7d32]' : 'text-[#99462a]'
                  }`}
                >
                  {activeBadgeEval.isUnlocked
                    ? '✓ COMPÉTENCE ACQUISE'
                    : `EN COURS (${activeBadgeEval.metCount}/4 conditions)`}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-[32px] leading-none">{activeBadge.dotEmoji}</span>
                <div>
                  <h3 className="font-headline text-[28px] font-bold text-[#1c1b1b] leading-none">
                    {activeBadge.badgeName}
                  </h3>
                  <span className="font-mono text-[11px] text-[#55433d] mt-1 block">
                    {activeTrack.domainCode} · {activeTrack.domainTitle}
                  </span>
                </div>
              </div>

              {/* Clean Box displaying the exact conditions structure requested by the user */}
              <div className="mt-2 p-4 rounded-xl bg-[#f6f3f2] border border-[#eae7e7]">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#55433d] font-bold block mb-2.5">
                  Conditions d’obtention ({activeBadge.badgeName}) :
                </span>
                <ul className="space-y-2 font-mono text-[13px] text-[#1c1b1b]">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                          activeBadgeEval.qMet
                            ? 'bg-[#2e7d32] text-white'
                            : 'bg-[#e5e2e1] text-[#55433d]'
                        }`}
                      >
                        {activeBadgeEval.qMet ? '✓' : '1'}
                      </span>
                      {activeBadge.conditions.questionsRequired} questions {activeTrack.shortTag}
                    </span>
                    <span className="text-[12px] text-[#55433d]">
                      ({activeStats.questionsAnswered} / {activeBadge.conditions.questionsRequired})
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                          activeBadgeEval.accMet
                            ? 'bg-[#2e7d32] text-white'
                            : 'bg-[#e5e2e1] text-[#55433d]'
                        }`}
                      >
                        {activeBadgeEval.accMet ? '✓' : '2'}
                      </span>
                      ≥ {activeBadge.conditions.minAccuracyPercent} % de réussite
                    </span>
                    <span className="text-[12px] text-[#55433d]">
                      (Actuel : {activeStats.accuracyPercent} %)
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                          activeBadgeEval.examsMet
                            ? 'bg-[#2e7d32] text-white'
                            : 'bg-[#e5e2e1] text-[#55433d]'
                        }`}
                      >
                        {activeBadgeEval.examsMet ? '✓' : '3'}
                      </span>
                      {activeBadge.conditions.examsPassedRequired} examen
                      {activeBadge.conditions.examsPassedRequired > 1 ? 's' : ''} réussi
                      {activeBadge.conditions.examsPassedRequired > 1 ? 's' : ''}
                    </span>
                    <span className="text-[12px] text-[#55433d]">
                      ({activeStats.examsPassed} / {activeBadge.conditions.examsPassedRequired})
                    </span>
                  </li>

                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                          activeBadgeEval.labsMet
                            ? 'bg-[#2e7d32] text-white'
                            : 'bg-[#e5e2e1] text-[#55433d]'
                        }`}
                      >
                        {activeBadgeEval.labsMet ? '✓' : '4'}
                      </span>
                      {activeBadge.conditions.practicalLabsRequired} exercice
                      {activeBadge.conditions.practicalLabsRequired > 1 ? 's' : ''} pratique
                      {activeBadge.conditions.practicalLabsRequired > 1 ? 's' : ''} réussi
                      {activeBadge.conditions.practicalLabsRequired > 1 ? 's' : ''}
                    </span>
                    <span className="text-[12px] text-[#55433d]">
                      ({activeStats.practicalLabsPassed} /{' '}
                      {activeBadge.conditions.practicalLabsRequired})
                    </span>
                  </li>
                </ul>
              </div>

              {/* Skills proven by this badge */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#88726c] font-bold">
                  Compétences techniques certifiées par ce badge :
                </span>
                <ul className="space-y-1.5 text-[13px] text-[#1c1b1b]">
                  {activeBadge.skillsValidated.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Simulator preset buttons to test unlocking any tier immediately */}
            <div className="pt-4 border-t border-[#eae7e7] flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c]">
                Simuler un palier de progression pour {activeTrack.shortTag} :
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['beginner', 'practitioner', 'advanced', 'expert'] as SkillTierId[]).map(
                  (tier) => {
                    const m = TIER_VISUAL_META[tier];
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => handleApplyPresetForActiveDomain(tier)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#eae7e7] font-mono text-[11px] font-semibold text-[#1c1b1b] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{m.dot}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Interactive Progress Bars + Direct Actions to Earn Missing Conditions */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                  Vérification en temps réel des 4 critères
                </span>
                <h3 className="font-headline text-[22px] text-[#1c1b1b] font-bold">
                  Comment valider ou consolider « {activeBadge.badgeName} » ?
                </h3>
              </div>
              <span className="font-mono text-[12px] font-bold text-[#1c1b1b]">
                Progression globale : {activeBadgeEval.overallPercent} %
              </span>
            </div>

            {/* 4 Interactive Requirement Cards */}
            <div className="grid grid-cols-1 gap-3.5">
              {/* Condition 1: Questions */}
              <div className="p-4 rounded-2xl bg-white border border-[#eae7e7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="font-bold text-[#1c1b1b]">
                      1. Volume : {activeBadge.conditions.questionsRequired} questions{' '}
                      {activeTrack.shortTag}
                    </span>
                    <span
                      className={`font-bold ${
                        activeBadgeEval.qMet ? 'text-[#2e7d32]' : 'text-[#99462a]'
                      }`}
                    >
                      {activeStats.questionsAnswered} / {activeBadge.conditions.questionsRequired}{' '}
                      questions
                    </span>
                  </div>
                  <div className="w-full bg-[#e5e2e1] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeBadgeEval.qMet ? 'bg-[#2e7d32]' : 'bg-[#99462a]'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (activeStats.questionsAnswered /
                              activeBadge.conditions.questionsRequired) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[12px] text-[#55433d]">
                    {activeBadgeEval.qMet
                      ? 'Condition validée — Quota de questions atteint sur ce domaine.'
                      : `Encore ${
                          activeBadge.conditions.questionsRequired - activeStats.questionsAnswered
                        } questions à traiter via Drill ou Flashcards SRS.`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleIncrementStat('questionsAnswered', 10, 200)}
                    className="px-2.5 py-2 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#eae7e7] font-mono text-[11px] font-bold text-[#1c1b1b] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Simuler +10 questions répondues"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>10 Qs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onLaunchDomainDrill(activeTrack.domainId)}
                    className="px-3.5 py-2 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileQuestion className="w-3.5 h-3.5" />
                    <span>Drill {activeTrack.shortTag}</span>
                  </button>
                </div>
              </div>

              {/* Condition 2: Accuracy >= 80% */}
              <div className="p-4 rounded-2xl bg-white border border-[#eae7e7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="font-bold text-[#1c1b1b]">
                      2. Précision : ≥ {activeBadge.conditions.minAccuracyPercent} % de réussite
                    </span>
                    <span
                      className={`font-bold ${
                        activeBadgeEval.accMet ? 'text-[#2e7d32]' : 'text-[#99462a]'
                      }`}
                    >
                      Actuel : {activeStats.accuracyPercent} % (cible ≥{' '}
                      {activeBadge.conditions.minAccuracyPercent} %)
                    </span>
                  </div>
                  <div className="w-full bg-[#e5e2e1] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeBadgeEval.accMet ? 'bg-[#2e7d32]' : 'bg-[#99462a]'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (activeStats.accuracyPercent /
                              activeBadge.conditions.minAccuracyPercent) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[12px] text-[#55433d]">
                    {activeBadgeEval.accMet
                      ? `Condition validée — Votre taux de réussite (${activeStats.accuracyPercent} %) dépasse le seuil requis.`
                      : `Il manque +${
                          activeBadge.conditions.minAccuracyPercent - activeStats.accuracyPercent
                        } pts de précision sur ce domaine.`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleIncrementStat('accuracyPercent', 3, 99)}
                    className="px-2.5 py-2 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#eae7e7] font-mono text-[11px] font-bold text-[#1c1b1b] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Simuler +3 % de précision"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+3 %</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectDomainFlashcards(activeTrack.domainId)}
                    className="px-3.5 py-2 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#eae7e7] text-[#1c1b1b] font-mono text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#99462a]" />
                    <span>Flashcards SRS</span>
                  </button>
                </div>
              </div>

              {/* Condition 3: Exams Passed */}
              <div className="p-4 rounded-2xl bg-white border border-[#eae7e7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="font-bold text-[#1c1b1b]">
                      3. Validation d’examen : {activeBadge.conditions.examsPassedRequired} examen
                      {activeBadge.conditions.examsPassedRequired > 1 ? 's' : ''} réussi
                      {activeBadge.conditions.examsPassedRequired > 1 ? 's' : ''}
                    </span>
                    <span
                      className={`font-bold ${
                        activeBadgeEval.examsMet ? 'text-[#2e7d32]' : 'text-[#99462a]'
                      }`}
                    >
                      {activeStats.examsPassed} / {activeBadge.conditions.examsPassedRequired}{' '}
                      examens
                    </span>
                  </div>
                  <div className="w-full bg-[#e5e2e1] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeBadgeEval.examsMet ? 'bg-[#2e7d32]' : 'bg-[#99462a]'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (activeStats.examsPassed /
                              activeBadge.conditions.examsPassedRequired) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[12px] text-[#55433d]">
                    {activeBadgeEval.examsMet
                      ? 'Condition validée — Examens blancs réussis avec un score ≥ 720/1000.'
                      : `Passez encore ${
                          activeBadge.conditions.examsPassedRequired - activeStats.examsPassed
                        } examen(s) blanc(s) pour débloquer ce palier.`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleIncrementStat('examsPassed', 1, 15)}
                    className="px-2.5 py-2 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#eae7e7] font-mono text-[11px] font-bold text-[#1c1b1b] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Simuler +1 examen réussi"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>1 Examen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('exam')}
                    className="px-3.5 py-2 rounded-xl bg-[#1c1b1b] hover:bg-[#33302f] text-white font-mono text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Examen Blanc</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Condition 4: Practical Labs Passed */}
              <div className="p-4 rounded-2xl bg-white border border-[#eae7e7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="flex items-center justify-between font-mono text-[12px]">
                    <span className="font-bold text-[#1c1b1b]">
                      4. Pratique : {activeBadge.conditions.practicalLabsRequired} exercice
                      {activeBadge.conditions.practicalLabsRequired > 1 ? 's' : ''} pratique
                      {activeBadge.conditions.practicalLabsRequired > 1 ? 's' : ''} réussi
                      {activeBadge.conditions.practicalLabsRequired > 1 ? 's' : ''}
                    </span>
                    <span
                      className={`font-bold ${
                        activeBadgeEval.labsMet ? 'text-[#2e7d32]' : 'text-[#99462a]'
                      }`}
                    >
                      {activeStats.practicalLabsPassed} /{' '}
                      {activeBadge.conditions.practicalLabsRequired} exercices Lab
                    </span>
                  </div>
                  <div className="w-full bg-[#e5e2e1] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        activeBadgeEval.labsMet ? 'bg-[#2e7d32]' : 'bg-[#99462a]'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (activeStats.practicalLabsPassed /
                              activeBadge.conditions.practicalLabsRequired) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-[12px] text-[#55433d]">
                    {activeBadgeEval.labsMet
                      ? 'Condition validée — Exercices Lab (ex: book_hotel JSON Schema) et Architecture Cases réussis.'
                      : `Réussissez encore ${
                          activeBadge.conditions.practicalLabsRequired -
                          activeStats.practicalLabsPassed
                        } exercice(s) dans le Lab Pratique (Score ≥ 75/100).`}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleIncrementStat('practicalLabsPassed', 1, 12)}
                    className="px-2.5 py-2 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] border border-[#eae7e7] font-mono text-[11px] font-bold text-[#1c1b1b] transition-colors flex items-center gap-1 cursor-pointer"
                    title="Simuler +1 exercice pratique réussi"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>1 Lab</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('lab')}
                    className="px-3.5 py-2 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Lab Pratique</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Matrice Complète des 20 Badges de Compétences (5 Domaines × 4 Niveaux) */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              Panorama Immédiat des Compétences Acquises
            </span>
            <h2 className="font-headline text-[28px] text-[#1c1b1b] leading-tight">
              Matrice des 5 Domaines Officiels (20 Badges de Compétences)
            </h2>
          </div>

          {/* Filter by Tier */}
          <div className="flex items-center gap-1 bg-[#f6f3f2] p-1 rounded-xl border border-[#eae7e7]">
            <button
              type="button"
              onClick={() => setTierFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                tierFilter === 'all'
                  ? 'bg-white text-[#1c1b1b] shadow-xs'
                  : 'text-[#55433d] hover:text-[#1c1b1b]'
              }`}
            >
              Tous (20)
            </button>
            {(['beginner', 'practitioner', 'advanced', 'expert'] as SkillTierId[]).map((t) => {
              const meta = TIER_VISUAL_META[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTierFilter(t)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    tierFilter === t
                      ? 'bg-white text-[#1c1b1b] shadow-xs'
                      : 'text-[#55433d] hover:text-[#1c1b1b]'
                  }`}
                >
                  <span>{meta.dot}</span>
                  <span className="hidden sm:inline">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {DOMAIN_SKILL_TRACKS.map((track) => {
            const st = getEffectiveStats(track);
            const highestUnlocked = globalBadgeSummary.highestByDomain[track.domainId];
            const filteredLevels =
              tierFilter === 'all'
                ? track.levels
                : track.levels.filter((l) => l.tier === tierFilter);

            return (
              <div
                key={track.domainId}
                className="rounded-2xl bg-white border border-[#eae7e7] p-5 sm:p-6 shadow-xs flex flex-col gap-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#eae7e7]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="font-bold text-[#99462a]">{track.domainCode}</span>
                      <span className="text-[#dbc1b9]">·</span>
                      <span className="text-[#55433d]">
                        {st.questionsAnswered} questions · {st.accuracyPercent} % réussite ·{' '}
                        {st.examsPassed} examens · {st.practicalLabsPassed} exercices Lab
                      </span>
                    </div>
                    <h3 className="font-headline text-[22px] font-bold text-[#1c1b1b]">
                      {track.domainTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {highestUnlocked ? (
                      <div className="px-3.5 py-2 rounded-xl bg-[#f2faf3] border border-[#c8e6c9] flex items-center gap-2">
                        <span className="text-[18px]">{highestUnlocked.dotEmoji}</span>
                        <div className="flex flex-col">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#2e7d32] font-bold">
                            Niveau Actuel Validé
                          </span>
                          <span className="font-mono text-[12px] font-bold text-[#1c1b1b]">
                            {highestUnlocked.badgeName}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-[#88726c]">
                        Aucun palier débloqué
                      </span>
                    )}
                  </div>
                </div>

                {/* 4 Badges Row for this Domain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {filteredLevels.map((lvl) => {
                    const ev = evaluateBadgeProgress(lvl, st);
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          setSelectedDomainId(track.domainId);
                          setSelectedBadgeId(lvl.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                          ev.isUnlocked
                            ? 'bg-[#fcf9f8] border-[#c8e6c9] hover:border-[#2e7d32]'
                            : 'bg-[#f6f3f2]/60 border-[#eae7e7] hover:border-[#99462a]/40'
                        }`}
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="uppercase tracking-wider text-[#55433d] font-bold">
                              {lvl.tierLabel}
                            </span>
                            <span
                              className={`font-bold ${
                                ev.isUnlocked ? 'text-[#2e7d32]' : 'text-[#88726c]'
                              }`}
                            >
                              {ev.isUnlocked ? '✓ Acquis' : `${ev.metCount}/4 conditions`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[18px]">{lvl.dotEmoji}</span>
                            <span className="font-headline text-[18px] font-bold text-[#1c1b1b]">
                              {lvl.badgeName}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 pt-2 border-t border-[#eae7e7] font-mono text-[10.5px] text-[#55433d]">
                          <span>
                            • {lvl.conditions.questionsRequired} questions {track.shortTag}
                          </span>
                          <span>• ≥ {lvl.conditions.minAccuracyPercent} % réussite</span>
                          <span>
                            • {lvl.conditions.examsPassedRequired} examen
                            {lvl.conditions.examsPassedRequired > 1 ? 's' : ''} &{' '}
                            {lvl.conditions.practicalLabsRequired} exercice
                            {lvl.conditions.practicalLabsRequired > 1 ? 's' : ''} Lab
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
