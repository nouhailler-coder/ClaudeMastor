import React, { useState, useEffect } from 'react';
import { TabType, TrickyQuestion, TrainingDurationMode } from '../types';
import { OFFICIAL_CERTIFICATIONS, OFFICIAL_DOMAINS, TRICKY_QUESTIONS, SCHEDULED_SESSIONS } from '../data/mockData';
import {
  loadResumeStore,
  updateResumeCheckpoint,
  resetResumeStoreToDefaults,
  ResumableModuleType,
  ResumeCheckpoint,
} from '../utils/resumeEngine';
import {
  Calendar,
  Timer,
  ListChecks,
  FileCheck2,
  RotateCcw,
  Play,
  ChevronRight,
  Flame,
  Zap,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Plus,
  Clock,
  Check,
  BookMarked,
  Award,
  Layers,
  Compass,
  FileX2,
  AlertTriangle,
} from 'lucide-react';
import { MISTAKES_DOMAIN_COUNTS } from '../data/myMistakesData';

interface DashboardViewProps {
  activeCertId: string;
  onSelectCertification: (certId: string) => void;
  onSelectDomainFlashcards: (domainId: number) => void;
  onNavigateTab: (tab: TabType) => void;
  onSelectTrainingMode?: (mode: TrainingDurationMode) => void;
  onResumeCheckpoint?: (checkpoint: ResumeCheckpoint) => void;
  onRetestConcept: (question: TrickyQuestion) => void;
  onLaunchDrill: (domainId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeCertId,
  onSelectCertification,
  onSelectDomainFlashcards,
  onNavigateTab,
  onSelectTrainingMode,
  onResumeCheckpoint,
  onRetestConcept,
  onLaunchDrill,
}) => {
  const [retestedIds, setRetestedIds] = useState<Record<string, boolean>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [resumeStore, setResumeStore] = useState(() => loadResumeStore());
  const [selectedResumeTab, setSelectedResumeTab] = useState<ResumableModuleType>(() =>
    loadResumeStore().primaryModule
  );

  useEffect(() => {
    const fresh = loadResumeStore();
    setResumeStore(fresh);
  }, []);

  const activeResumeCheckpoint =
    resumeStore.checkpoints[selectedResumeTab] || resumeStore.checkpoints.drill;

  const handleContinueSession = (cp: ResumeCheckpoint) => {
    if (onResumeCheckpoint) {
      onResumeCheckpoint(cp);
      return;
    }
    if (cp.moduleType === 'drill' && cp.payload.domainId) {
      onLaunchDrill(cp.payload.domainId);
    } else if (cp.moduleType === 'flashcards' && cp.payload.domainId) {
      onSelectDomainFlashcards(cp.payload.domainId);
    } else {
      onNavigateTab(cp.targetTab);
    }
  };

  const activeCert =
    OFFICIAL_CERTIFICATIONS.find((c) => c.id === activeCertId) || OFFICIAL_CERTIFICATIONS[0];

  const handleRetest = (q: TrickyQuestion) => {
    setRetestedIds((prev) => ({ ...prev, [q.id]: true }));
    onRetestConcept(q);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Greeting & Target Canvas */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap font-mono text-[11px]">
            <span className="tracking-wider text-[#99462a] uppercase font-bold">
              {activeCert.code} · {activeCert.title}
            </span>
            <span className="text-[#88726c]">·</span>
            <span className="text-[#55433d]">Niveau {activeCert.level}</span>
          </div>
          <h1 className="font-headline text-[38px] lg:text-[44px] text-[#1c1b1b] tracking-tight leading-tight">
            Bienvenue, Éléonore.
          </h1>
          <p className="text-[17px] text-[#55433d] mt-2 leading-relaxed">
            Vous êtes à{' '}
            <span className="text-[#99462a] font-semibold">
              {activeCert.readinessPercentage}%
            </span>{' '}
            de préparation pour la certification{' '}
            <strong className="text-[#1c1b1b]">{activeCert.shortTitle}</strong> (seuil officiel :{' '}
            {activeCert.passingScore}/1000).
          </p>
        </div>

        {/* Exam Countdown Module */}
        <div className="flex items-center gap-4 bg-[#f6f3f2] p-3 rounded-2xl border border-[#eae7e7] shadow-xs shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#f0eded] flex items-center justify-center text-[#99462a] border border-[#eae7e7]">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex flex-col pr-2">
            <span className="font-mono text-[10px] text-[#88726c] uppercase tracking-wider">
              Date d'examen cible ({activeCert.code})
            </span>
            <span className="font-headline text-[18px] text-[#1c1b1b] font-semibold leading-tight">
              14 Novembre 2024
            </span>
          </div>
          <div className="bg-[#99462a] text-white px-3.5 py-2 rounded-xl flex flex-col items-center justify-center shadow-xs">
            <span className="font-mono text-[10px] uppercase font-semibold leading-none">
              Échéance
            </span>
            <span className="font-headline text-[22px] font-bold leading-tight mt-0.5">
              J-12
            </span>
          </div>
        </div>
      </section>

      {/* NEW SECTION 0.5: « Continue where you left off » (Continue training — généralisé à toute l'application) */}
      <section className="mb-10 rounded-3xl bg-white border-2 border-[#99462a]/30 p-6 lg:p-7 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f0eded]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              <RotateCcw className="w-4 h-4" />
              <span>Continue where you left off · Reprise instantanée multi-modules</span>
            </div>
            <h2 className="font-headline text-[26px] lg:text-[30px] text-[#1c1b1b] font-bold leading-tight">
              Continue training
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              const reset = resetResumeStoreToDefaults();
              setResumeStore(reset);
              setSelectedResumeTab('drill');
            }}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#55433d] font-mono text-[11px] font-semibold border border-[#eae7e7] transition-colors cursor-pointer"
          >
            Réinitialiser démo CCA-P200 (Question 37 / 50)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 5 Columns: Exact Featured Card ("Continue training / CCA-P200 / 64 % / Dernière session : Tool Use & MCP / Question 37 / 50 / [ Continuer ]") */}
          <div className="lg:col-span-5 rounded-2xl bg-[#1c1b1b] text-white p-6 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="uppercase tracking-widest text-[#ffb59c] font-bold">
                  Continue training · {activeResumeCheckpoint.moduleBadge}
                </span>
                <span className="text-[#d5c2bc]">{activeResumeCheckpoint.updatedAt}</span>
              </div>

              {/* Cert Code + Progress Bar (CCA-P200 ━━━━━━━━━━━━━━ 64 %) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-headline text-[30px] font-bold text-white tracking-tight leading-none">
                    {activeResumeCheckpoint.certCode}
                  </span>
                  <span className="font-mono text-[18px] font-bold text-[#ffb59c]">
                    {activeResumeCheckpoint.progressPercent} %
                  </span>
                </div>

                <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-[#d97757] to-[#ffb59c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${activeResumeCheckpoint.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Dernière session & Question X / Y */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#d5c2bc]">
                  Dernière session :
                </span>
                <span className="font-headline text-[23px] font-bold text-white leading-snug">
                  {activeResumeCheckpoint.lastSessionTitle}
                </span>
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/10">
                  <span className="font-mono text-[15px] font-bold text-[#ffb59c]">
                    {activeResumeCheckpoint.stepProgressLabel}
                  </span>
                  <span className="font-mono text-[11px] text-[#d5c2bc] truncate max-w-[190px]">
                    {activeResumeCheckpoint.subDetailLabel}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleContinueSession(activeResumeCheckpoint)}
              className="w-full py-3.5 px-6 rounded-xl bg-[#d97757] hover:bg-[#c06142] text-white font-mono text-[13px] font-bold transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Continuer ({activeResumeCheckpoint.stepProgressLabel})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right 7 Columns: All 5 Resumable Modules across the Application */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#55433d] font-bold">
                Vos 5 sessions en cours sauvegardées automatiquement :
              </span>
              <span className="font-mono text-[11px] text-[#88726c]">
                Cliquez pour inspecter ou reprendre
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    key: 'drill' as ResumableModuleType,
                    label: 'Drill ciblé',
                  },
                  {
                    key: 'exam' as ResumableModuleType,
                    label: 'Examen interrompu',
                  },
                  {
                    key: 'flashcards' as ResumableModuleType,
                    label: 'Flashcards SRS',
                  },
                  {
                    key: 'architecture' as ResumableModuleType,
                    label: 'Cas d’architecture',
                  },
                  {
                    key: 'lab' as ResumableModuleType,
                    label: 'Laboratoire pratique',
                  },
                ] as const
              ).map((item) => {
                const cp = resumeStore.checkpoints[item.key];
                const isSelected = selectedResumeTab === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      setSelectedResumeTab(item.key);
                      const updated = updateResumeCheckpoint(item.key, {}, true);
                      setResumeStore(updated);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#fff8f5] border-[#99462a] ring-1 ring-[#99462a]/20 shadow-2xs'
                        : 'bg-[#fcf9f8] border-[#eae7e7] hover:border-[#dbc1b9] hover:bg-white'
                    } ${item.key === 'lab' ? 'sm:col-span-2' : ''}`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between font-mono text-[10.5px]">
                        <span className="uppercase tracking-wider font-bold text-[#99462a]">
                          {cp.moduleBadge} · {cp.certCode}
                        </span>
                        <span className="font-bold text-[#1c1b1b]">{cp.progressPercent} %</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-headline text-[18px] font-bold text-[#1c1b1b] leading-snug">
                          {cp.lastSessionTitle}
                        </span>
                      </div>

                      <span className="font-mono text-[12px] font-semibold text-[#55433d]">
                        {cp.stepProgressLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#eae7e7]">
                      <div className="w-full bg-[#e5e2e1] h-1.5 rounded-full overflow-hidden flex-1">
                        <div
                          className="bg-[#99462a] h-full rounded-full transition-all duration-500"
                          style={{ width: `${cp.progressPercent}%` }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContinueSession(cp);
                        }}
                        className="px-3 py-1 rounded-lg bg-[#1c1b1b] hover:bg-[#99462a] text-white font-mono text-[11px] font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Continuer</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Les Différentes Certifications Officielles Anthropic */}
      <section className="mb-10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#99462a]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                Catalogue Officiel des Certifications
              </span>
            </div>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Parcours de Certifications Claude Architect ({OFFICIAL_CERTIFICATIONS.length})
            </h2>
          </div>
          <span className="font-mono text-[11px] text-[#88726c]">
            Sélectionnez une certification pour adapter les pondérations des 5 domaines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {OFFICIAL_CERTIFICATIONS.map((cert) => {
            const isSelected = cert.id === activeCertId;
            return (
              <div
                key={cert.id}
                onClick={() => onSelectCertification(cert.id)}
                className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-white border-[#99462a] shadow-sm ring-1 ring-[#99462a]/20'
                    : 'bg-[#f6f3f2] border-[#eae7e7] hover:border-[#dbc1b9] hover:bg-[#f0eded]'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#99462a]">{cert.code}</span>
                      <span className="text-[#dbc1b9]">·</span>
                      <span className="text-[#55433d]">{cert.level}</span>
                    </div>
                    <span className="text-[#88726c]">{cert.status}</span>
                  </div>

                  <h3 className="font-headline text-[19px] text-[#1c1b1b] font-semibold leading-snug">
                    {cert.title}
                  </h3>

                  <p className="text-[12.5px] text-[#55433d] leading-relaxed">
                    {cert.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-3 border-t border-[#eae7e7]">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#55433d]">
                    <span>{cert.questionsCount} Qs</span>
                    <span>·</span>
                    <span>{cert.durationMinutes} min</span>
                    <span>·</span>
                    <span>Seuil {cert.passingScore}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#88726c]">Préparation</span>
                      <span className="font-bold text-[#99462a]">
                        {cert.readinessPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#e5e2e1] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#99462a] h-full rounded-full transition-all duration-500"
                        style={{ width: `${cert.readinessPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCertification(cert.id);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-mono text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#99462a] text-white'
                          : 'bg-[#eae7e7] text-[#1c1b1b] hover:bg-[#dbc1b9]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Parcours actif</span>
                        </>
                      ) : (
                        <span>Choisir ce parcours</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCertification(cert.id);
                        onNavigateTab('exam');
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-[#f0eded] border border-[#eae7e7] font-mono text-[11px] text-[#99462a] font-semibold transition-colors"
                      title="Lancer un examen blanc pour cette certification"
                    >
                      Examen →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 1.2: Modes d'Entraînement Quotidiens (⚡ 5 min, 🧠 15 min, 📚 30 min, 🎓 Examen, 🏗️ Architecture) & Today's Challenge */}
      <section className="mb-8 rounded-2xl bg-white border border-[#eae7e7] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#ffdbd0] text-[#7a2f15] font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#d97757] fill-[#d97757]" />
                Habitude Quotidienne & Modes « 10 minutes »
              </span>
              <span className="font-mono text-[12px] font-bold text-[#99462a]">
                Choisissez votre format selon votre temps disponible
              </span>
            </div>

            <h2 className="font-headline text-[24px] sm:text-[26px] text-[#1c1b1b] font-bold leading-tight">
              Modes d’Entraînement Quotidiens & Today’s Challenge
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSelectTrainingMode) {
                onSelectTrainingMode('today-5q');
              } else {
                onNavigateTab('daily-challenge');
              }
            }}
            className="w-full lg:w-auto px-5 py-3 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Today’s Challenge (15 min · 5 Qs)</span>
          </button>
        </div>

        {/* 5 Training Modes Grid: ⚡ 5 min | 🧠 15 min | 📚 30 min | 🎓 Examen | 🏗️ Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() =>
              onSelectTrainingMode
                ? onSelectTrainingMode('5min')
                : onNavigateTab('daily-challenge')
            }
            className="text-left p-4 rounded-xl bg-[#fcf9f8] hover:bg-[#fff8f5] border border-[#eae7e7] hover:border-[#99462a] transition-all flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[22px]">⚡</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] group-hover:text-[#99462a] font-bold">
                  Sprint Express
                </span>
              </div>
              <span className="font-headline text-[21px] font-bold text-[#1c1b1b] mt-1">
                5 minutes
              </span>
            </div>
            <div className="pt-2.5 border-t border-[#eae7e7] flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-[#99462a]">
                3 questions
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#88726c] group-hover:text-[#99462a]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              onSelectTrainingMode
                ? onSelectTrainingMode('15min')
                : onNavigateTab('daily-challenge')
            }
            className="text-left p-4 rounded-xl bg-[#fcf9f8] hover:bg-[#fff8f5] border border-[#eae7e7] hover:border-[#99462a] transition-all flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[22px]">🧠</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] group-hover:text-[#99462a] font-bold">
                  Session Focus
                </span>
              </div>
              <span className="font-headline text-[21px] font-bold text-[#1c1b1b] mt-1">
                15 minutes
              </span>
            </div>
            <div className="pt-2.5 border-t border-[#eae7e7] flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-[#99462a]">
                10 questions
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#88726c] group-hover:text-[#99462a]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              onSelectTrainingMode
                ? onSelectTrainingMode('30min')
                : onNavigateTab('daily-challenge')
            }
            className="text-left p-4 rounded-xl bg-[#fcf9f8] hover:bg-[#fff8f5] border border-[#eae7e7] hover:border-[#99462a] transition-all flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[22px]">📚</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] group-hover:text-[#99462a] font-bold">
                  Approfondi + SRS
                </span>
              </div>
              <span className="font-headline text-[21px] font-bold text-[#1c1b1b] mt-1">
                30 minutes
              </span>
            </div>
            <div className="pt-2.5 border-t border-[#eae7e7] flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-[#99462a]">
                20 questions + révisions
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#88726c] group-hover:text-[#99462a]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('exam')}
            className="text-left p-4 rounded-xl bg-[#fcf9f8] hover:bg-[#fff8f5] border border-[#eae7e7] hover:border-[#99462a] transition-all flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[22px]">🎓</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] group-hover:text-[#99462a] font-bold">
                  60 Questions
                </span>
              </div>
              <span className="font-headline text-[21px] font-bold text-[#1c1b1b] mt-1">
                Examen
              </span>
            </div>
            <div className="pt-2.5 border-t border-[#eae7e7] flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-[#99462a]">
                Simulation complète
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#88726c] group-hover:text-[#99462a]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('architecture-cases')}
            className="text-left p-4 rounded-xl bg-[#fcf9f8] hover:bg-[#fff8f5] border border-[#eae7e7] hover:border-[#99462a] transition-all flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[22px]">🏗️</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#88726c] group-hover:text-[#99462a] font-bold">
                  Cas #027 Bancaire
                </span>
              </div>
              <span className="font-headline text-[21px] font-bold text-[#1c1b1b] mt-1">
                Architecture
              </span>
            </div>
            <div className="pt-2.5 border-t border-[#eae7e7] flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-[#99462a]">
                1 cas complet
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#88726c] group-hover:text-[#99462a]" />
            </div>
          </button>
        </div>

        {/* Today's Challenge 5-question summary strip */}
        <div className="pt-3 border-t border-[#f0eded] flex items-center justify-between gap-3 flex-wrap font-mono text-[11px] text-[#55433d]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#1c1b1b]">Today’s Challenge (5 Qs) :</span>
            <span className="text-[#ba1a1a] font-semibold">2 questions faibles</span>
            <span>·</span>
            <span className="text-[#0d47a1] font-semibold">1 question jamais vue</span>
            <span>·</span>
            <span className="text-[#c65102] font-semibold">1 question piège</span>
            <span>·</span>
            <span className="text-[#55433d] font-semibold">1 question aléatoire</span>
          </div>
          <span className="text-[#99462a] font-bold">
            Objectif quotidien : Score 4/5 · Domaine ciblé : Tool Use & MCP
          </span>
        </div>
      </section>

      {/* Section 1.25: Carnet d'erreurs personnel — « My Mistakes » (127 erreurs analysées) */}
      <section className="mb-8 rounded-3xl bg-white border-2 border-[#ba1a1a]/25 p-6 sm:p-7 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#f0eded]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#ba1a1a] uppercase tracking-wider font-bold">
              <FileX2 className="w-4 h-4 text-[#ba1a1a]" />
              <span>Carnet d’erreurs personnel · Ciblage à haute rentabilité</span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="font-headline text-[28px] sm:text-[32px] text-[#1c1b1b] font-bold tracking-tight">
                My Mistakes
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#fff5f5] text-[#ba1a1a] border border-[#ffdad6] font-mono text-[12px] font-bold">
                127 erreurs analysées
              </span>
            </div>
            <p className="text-[14px] text-[#55433d] max-w-2xl leading-relaxed">
              Conserve l'historique complet de vos faux pas pour réviser de manière chirurgicale. C'est probablement plus utile que de simplement revoir les 2 000 cartes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('my-mistakes')}
              className="px-6 py-3.5 rounded-2xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-mono text-[13px] font-bold shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Réviser mes erreurs (127)</span>
            </button>
          </div>
        </div>

        {/* 6 Domains Breakdown: MCP 31, Prompt Engineering 24, Security 18, Architecture 17, FinOps 15, Production 12 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            onClick={() => onNavigateTab('my-mistakes')}
            className="p-3.5 rounded-2xl bg-[#fff8f5] border border-[#f5dad0] hover:border-[#99462a] transition-all flex flex-col justify-between gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#88726c] group-hover:text-[#99462a] font-semibold">MCP</span>
              <span className="font-headline text-[18px] font-bold text-[#99462a]">31</span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">Tool Use & Servers</span>
          </div>

          <div
            onClick={() => onNavigateTab('my-mistakes')}
            className="p-3.5 rounded-2xl bg-[#f5f9ff] border border-[#d6e4ff] hover:border-[#0d47a1] transition-all flex flex-col justify-between gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#88726c] group-hover:text-[#0d47a1] font-semibold">Prompt Eng.</span>
              <span className="font-headline text-[18px] font-bold text-[#0d47a1]">24</span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">Thinking & Caching</span>
          </div>

          <div
            onClick={() => onNavigateTab('my-mistakes')}
            className="p-3.5 rounded-2xl bg-[#fff5f5] border border-[#ffdad6] hover:border-[#ba1a1a] transition-all flex flex-col justify-between gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#88726c] group-hover:text-[#ba1a1a] font-semibold">Security</span>
              <span className="font-headline text-[18px] font-bold text-[#ba1a1a]">18</span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">Jailbreak & Guardrails</span>
          </div>

          <div
            onClick={() => onNavigateTab('my-mistakes')}
            className="p-3.5 rounded-2xl bg-[#fdf5ff] border border-[#f3d9fa] hover:border-[#6a1b9a] transition-all flex flex-col justify-between gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#88726c] group-hover:text-[#6a1b9a] font-semibold">Architecture</span>
              <span className="font-headline text-[18px] font-bold text-[#6a1b9a]">17</span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">RAG & Multi-Agents</span>
          </div>

          <div
            onClick={() => onNavigateTab('my-mistakes')}
            className="p-3.5 rounded-2xl bg-[#f4faf5] border border-[#d2edd6] hover:border-[#2e7d32] transition-all flex flex-col justify-between gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#88726c] group-hover:text-[#2e7d32] font-semibold">FinOps</span>
              <span className="font-headline text-[18px] font-bold text-[#2e7d32]">15</span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">Batch & Cost Optimization</span>
          </div>

          <div
            onClick={() => onNavigateTab('my-mistakes')}
            className="p-3.5 rounded-2xl bg-[#fffbf5] border border-[#ffe8cc] hover:border-[#c65102] transition-all flex flex-col justify-between gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#88726c] group-hover:text-[#c65102] font-semibold">Production</span>
              <span className="font-headline text-[18px] font-bold text-[#c65102]">12</span>
            </div>
            <span className="font-mono text-[10px] text-[#55433d]">SLA, Latence P95 & Eval</span>
          </div>
        </div>

        {/* 9 Attributes strip */}
        <div className="p-3.5 rounded-xl bg-[#fcf9f8] border border-[#eae7e7] flex items-center justify-between gap-3 flex-wrap font-mono text-[11px]">
          <div className="flex items-center gap-1.5 flex-wrap text-[#55433d]">
            <span className="font-bold text-[#1c1b1b]">Chaque erreur conserve :</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#eae7e7] text-[#1c1b1b]">question</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#ffdad6] text-[#ba1a1a]">réponse donnée</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#c8e6c9] text-[#2e7d32]">bonne réponse</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#eae7e7] text-[#1c1b1b]">explication</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#eae7e7] text-[#99462a]">domaine</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#eae7e7] text-[#1c1b1b]">difficulté</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#eae7e7] text-[#ba1a1a]">nombre d'erreurs</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#eae7e7] text-[#55433d]">dernière erreur</span>
            <span className="bg-white px-2 py-0.5 rounded border border-[#eae7e7] text-[#2e7d32]">prochaine révision</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('my-mistakes')}
            className="text-[#ba1a1a] hover:text-[#93000a] font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Consulter le carnet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Section 1.3: Architecture Cases Spotlight (Cas #027 — Assistant bancaire) */}
      <section className="mb-8 rounded-2xl bg-[#fcf9f8] border border-[#dbc1b9] p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-[#1c1b1b] text-[#ffb59c] font-mono text-[10px] uppercase tracking-widest font-bold">
              Architecture Cases • Design Système
            </span>
            <span className="font-mono text-[12px] font-bold text-[#99462a]">
              Cas #027 — Assistant bancaire
            </span>
          </div>

          <p className="text-[14px] text-[#1c1b1b] font-medium">
            Construisez le graphe <code className="font-mono text-[12px] bg-white px-1.5 py-0.5 rounded border border-[#eae7e7]">User → API Gateway → Agent → [RAG, Tool Server, Memory, Guardrails]</code> et évaluez vos 5 scores (Architecture 78%, Sécurité 91%, Coût 63%, Latence 74%, Résilience 81%).
          </p>

          <div className="flex items-center gap-2 flex-wrap font-mono text-[11px] text-[#55433d]">
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#eae7e7]">
              2 millions d’utilisateurs
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#eae7e7]">
              200k contexte
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#eae7e7]">
              P95 &lt; 2 s
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#eae7e7]">
              données sensibles
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#eae7e7] font-bold text-[#99462a]">
              budget : 50k €/mois
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('architecture-cases')}
          className="w-full lg:w-auto px-5 py-3 rounded-xl bg-[#1c1b1b] hover:bg-[#33302f] text-white font-mono text-[12px] font-bold shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Ouvrir Cas #027 (Studio Architecture)</span>
          <ArrowRight className="w-4 h-4 text-[#ffb59c]" />
        </button>
      </section>

      {/* Section 1.4: Système de Niveaux & Badges liés aux Compétences (MCP Beginner -> Expert) */}
      <section className="mb-8 rounded-2xl bg-white border border-[#eae7e7] p-5 sm:p-6 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-wider font-bold">
              <Award className="w-4 h-4" />
              <span>Système de Niveaux & Badges de Compétences Vérifiées</span>
            </div>
            <h2 className="font-headline text-[24px] sm:text-[26px] text-[#1c1b1b] font-bold leading-tight">
              Compétences Acquises — Focus Tool Use & MCP
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('skills-badges')}
            className="px-4 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Voir tous les Niveaux & Badges (20 compétences)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 7 Cols: 4 MCP Competency Levels */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => onNavigateTab('skills-badges')}
              className="p-4 rounded-xl bg-[#fcf9f8] border border-[#c8e6c9] flex flex-col justify-between gap-2 cursor-pointer hover:border-[#2e7d32] transition-colors"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="uppercase tracking-wider text-[#2e7d32] font-bold">
                  Niveau 1 · Acquis ✓
                </span>
                <span className="text-[#55433d]">4/4 conditions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🔵</span>
                <span className="font-headline text-[19px] font-bold text-[#1c1b1b]">
                  MCP Beginner
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#55433d]">
                20 questions MCP · ≥ 70 % · 1 examen · 1 exercice Lab
              </span>
            </div>

            <div
              onClick={() => onNavigateTab('skills-badges')}
              className="p-4 rounded-xl bg-[#f2faf3] border-2 border-[#2e7d32] flex flex-col justify-between gap-2 cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="uppercase tracking-wider text-[#2e7d32] font-bold">
                  Niveau 2 · Acquis ✓
                </span>
                <span className="text-[#2e7d32] font-bold">Palier Actuel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🟢</span>
                <span className="font-headline text-[19px] font-bold text-[#1c1b1b]">
                  MCP Practitioner
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#1c1b1b] font-semibold">
                50 questions MCP · ≥ 80 % · 3 examens · 2 exercices Lab
              </span>
            </div>

            <div
              onClick={() => onNavigateTab('skills-badges')}
              className="p-4 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] flex flex-col justify-between gap-2 cursor-pointer hover:border-[#99462a]/50 transition-colors"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="uppercase tracking-wider text-[#6a1b9a] font-bold">
                  Niveau 3 · En cours
                </span>
                <span className="text-[#55433d]">Prochain objectif</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🟣</span>
                <span className="font-headline text-[19px] font-bold text-[#1c1b1b]">
                  MCP Advanced
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#55433d]">
                100 questions MCP · ≥ 85 % · 5 examens · 4 exercices Lab
              </span>
            </div>

            <div
              onClick={() => onNavigateTab('skills-badges')}
              className="p-4 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] flex flex-col justify-between gap-2 cursor-pointer hover:border-[#99462a]/50 transition-colors"
            >
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="uppercase tracking-wider text-[#ba1a1a] font-bold">
                  Niveau 4 · Maîtrise Ultime
                </span>
                <span className="text-[#88726c]">Rang Architecte</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[20px]">🔴</span>
                <span className="font-headline text-[19px] font-bold text-[#1c1b1b]">
                  MCP Expert
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#55433d]">
                150 questions MCP · ≥ 90 % · 8 examens · 6 exercices Lab
              </span>
            </div>
          </div>

          {/* Right 5 Cols: Explicit Breakdown of "MCP Practitioner" Conditions */}
          <div className="lg:col-span-5 rounded-xl bg-[#fcf9f8] border border-[#dbc1b9] p-5 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between border-b border-[#eae7e7] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">🟢</span>
                <span className="font-headline text-[20px] font-bold text-[#1c1b1b]">
                  MCP Practitioner
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#2e7d32]">
                ✓ Compétence Validée
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#55433d] font-bold">
                Conditions validées :
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[12px] text-[#1c1b1b] pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-[#eae7e7] flex items-center justify-between">
                  <span className="font-semibold">50 questions MCP</span>
                  <span className="text-[#2e7d32] font-bold">58/50 ✓</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#eae7e7] flex items-center justify-between">
                  <span className="font-semibold">≥ 80 %</span>
                  <span className="text-[#2e7d32] font-bold">82 % ✓</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#eae7e7] flex items-center justify-between">
                  <span className="font-semibold">3 examens réussis</span>
                  <span className="text-[#2e7d32] font-bold">3/3 ✓</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#eae7e7] flex items-center justify-between">
                  <span className="font-semibold">2 exercices pratiques</span>
                  <span className="text-[#2e7d32] font-bold">2/2 ✓</span>
                </div>
              </div>
            </div>

            <span className="font-mono text-[11px] text-[#55433d]">
              Permet de visualiser immédiatement les compétences réellement acquises par domaine.
            </span>
          </div>
        </div>
      </section>

      {/* Section 1.5: Plan de Révision Personnalisé (Système de Coaching Adaptatif) */}
      <section className="mb-10 rounded-2xl bg-white border-2 border-[#99462a]/25 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#1c1b1b] via-[#2b221f] to-[#3a261f] text-white p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-[#d97757] text-white font-mono text-[10px] uppercase tracking-widest font-bold">
                  Système de Coaching Adaptatif
                </span>
                <span className="font-mono text-[11px] text-[#f5dad0]">
                  Généré depuis vos flashcards, examens & scores par domaine
                </span>
              </div>
              <h2 className="font-headline text-[26px] lg:text-[30px] text-white leading-tight">
                Plan de révision personnalisé — Aujourd’hui (35 min)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {activeCertId !== 'cca-p200' && (
                <button
                  type="button"
                  onClick={() => onSelectCertification('cca-p200')}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#ffdbd0] font-mono text-[11px] font-semibold border border-white/15 transition-colors"
                >
                  Simuler objectif CCA-P200 (71% → 80%)
                </button>
              )}
              <button
                type="button"
                onClick={() => onNavigateTab('study-plan')}
                className="px-4 py-2.5 rounded-xl bg-[#d97757] hover:bg-[#c06142] text-white font-mono text-[12px] font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Ouvrir le Coach & Plan Complet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Metric Pills: Objectif, Examen prévu, Niveau actuel estimé, Objectif */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#d5c2bc] block">
                Votre objectif
              </span>
              <span className="font-headline text-[22px] font-bold text-white mt-0.5 block">
                {activeCert.code}
              </span>
              <span className="font-mono text-[11px] text-[#f5dad0] truncate block">
                {activeCert.shortTitle}
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#d5c2bc] block">
                Examen prévu dans
              </span>
              <span className="font-headline text-[22px] font-bold text-[#ffb59c] mt-0.5 block">
                {activeCert.id === 'cca-p200' ? '28 jours' : activeCert.id === 'cca-f100' ? '12 jours' : activeCert.id === 'cca-s300' ? '35 jours' : '42 jours'}
              </span>
              <span className="font-mono text-[11px] text-[#d5c2bc] block">
                Cadence : 35 min / jour
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#d5c2bc] block">
                Niveau actuel estimé
              </span>
              <span className="font-headline text-[22px] font-bold text-white mt-0.5 block">
                {activeCert.id === 'cca-p200' ? '71 %' : `${activeCert.readinessPercentage} %`}
              </span>
              <span className="font-mono text-[11px] text-[#ffb59c] block">
                Écart : +{activeCert.id === 'cca-p200' ? '9' : Math.max(4, 80 - activeCert.readinessPercentage)} pts requis
              </span>
            </div>

            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#d5c2bc] block">
                Objectif de maîtrise
              </span>
              <span className="font-headline text-[22px] font-bold text-[#81c784] mt-0.5 block">
                {activeCert.id === 'cca-E400' ? '85 %' : '80 %'}
              </span>
              <span className="font-mono text-[11px] text-[#d5c2bc] block">
                Seuil examen : {activeCert.passingScore}/1000
              </span>
            </div>
          </div>
        </div>

        {/* Body: Today's 5 Tasks + Why These Exercises */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#fcf9f8]">
          {/* Left 7 cols: Aujourd'hui — 35 min */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#99462a]" />
                <h3 className="font-headline text-[20px] text-[#1c1b1b] font-semibold">
                  Aujourd’hui — 35 min
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#99462a] font-semibold">
                5 activités ciblées
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectDomainFlashcards(3)}
                className="text-left p-3.5 rounded-xl bg-white hover:bg-[#f6f3f2] border border-[#eae7e7] hover:border-[#99462a] transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase text-[#99462a] font-bold">
                    10 min · Flashcards ciblées
                  </span>
                  <span className="text-[13.5px] font-semibold text-[#1c1b1b] group-hover:text-[#99462a]">
                    10 flashcards Domaine 3 — MCP
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#88726c] group-hover:text-[#99462a] shrink-0 mt-1" />
              </button>

              <button
                type="button"
                onClick={() => onLaunchDrill(3)}
                className="text-left p-3.5 rounded-xl bg-white hover:bg-[#f6f3f2] border border-[#eae7e7] hover:border-[#99462a] transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase text-[#ba1a1a] font-bold">
                    8 min · Correction active
                  </span>
                  <span className="text-[13.5px] font-semibold text-[#1c1b1b] group-hover:text-[#99462a]">
                    5 questions sur les erreurs précédentes
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#88726c] group-hover:text-[#99462a] shrink-0 mt-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('lab')}
                className="text-left p-3.5 rounded-xl bg-white hover:bg-[#f6f3f2] border border-[#eae7e7] hover:border-[#99462a] transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase text-[#99462a] font-bold">
                    7 min · Lab Pratique
                  </span>
                  <span className="text-[13.5px] font-semibold text-[#1c1b1b] group-hover:text-[#99462a]">
                    1 exercice Tool Use & JSON Schema
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#88726c] group-hover:text-[#99462a] shrink-0 mt-1" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('study-plan')}
                className="text-left p-3.5 rounded-xl bg-white hover:bg-[#f6f3f2] border border-[#eae7e7] hover:border-[#99462a] transition-all flex items-start justify-between gap-3 group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase text-[#99462a] font-bold">
                    5 min · Architecture
                  </span>
                  <span className="text-[13.5px] font-semibold text-[#1c1b1b] group-hover:text-[#99462a]">
                    1 mini-cas d’architecture
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#88726c] group-hover:text-[#99462a] shrink-0 mt-1" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onSelectDomainFlashcards(3)}
              className="w-full text-left p-3.5 rounded-xl bg-[#f6f3f2] hover:bg-[#f0eded] border border-[#eae7e7] transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#99462a]" />
                <span className="text-[13.5px] font-semibold text-[#1c1b1b]">
                  Révision de 6 cartes arrivant à échéance (répétition espacée J+7)
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#99462a] font-bold shrink-0">
                5 min →
              </span>
            </button>
          </div>

          {/* Right 5 cols: Pourquoi ces exercices ? */}
          <div className="lg:col-span-5 bg-[#fff8f5] border border-[#f5dad0] rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#99462a]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                  Pourquoi ces exercices ?
                </span>
              </div>

              <blockquote className="font-headline text-[19px] text-[#1c1b1b] leading-snug border-l-3 border-[#99462a] pl-3.5 py-0.5">
                « Votre taux d’erreur sur MCP est de 31 %, contre 14 % sur Architecture LLM. »
              </blockquote>

              <p className="text-[13px] text-[#55433d] leading-relaxed">
                Le <strong>Domaine 03 (Tool Use & MCP)</strong> représente la plus forte pondération de l’examen. Réduire votre taux d’erreur de 31 % à moins de 15 % sur ce domaine vous apporte un gain direct estimé à <strong>+4,2 points</strong> sur votre score global.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-[#f5dad0]">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#55433d]">Taux d’erreur Domaine 03 (MCP)</span>
                <span className="text-[#ba1a1a] font-bold">31 % (Priorité #1)</span>
              </div>
              <div className="w-full bg-[#eae7e7] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '31%' }} />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                <span className="text-[#55433d]">Taux d’erreur Domaine 01 (Architecture LLM)</span>
                <span className="text-[#2e7d32] font-bold">14 % (Maîtrisé)</span>
              </div>
              <div className="w-full bg-[#eae7e7] h-2 rounded-full overflow-hidden">
                <div className="bg-[#2e7d32] h-full rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero CTA Banner: Active Mock Exam In-Progress */}
      <div className="relative overflow-hidden rounded-2xl bg-[#f6f3f2] p-6 mb-8 border border-[#eae7e7] shadow-xs">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#d97757]/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#99462a]/10 flex items-center justify-center text-[#99462a] shrink-0 border border-[#d97757]/20">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap font-mono text-[11px]">
                <span className="text-[#99462a] font-bold uppercase">
                  Reprise recommandée · {activeCert.code}
                </span>
                <span className="text-[#dbc1b9]">·</span>
                <span className="text-[#55433d]">
                  Session #3 interrompue à la question 24/{activeCert.questionsCount}
                </span>
              </div>
              <h2 className="font-headline text-[22px] lg:text-[24px] text-[#1c1b1b] leading-snug">
                Examen Blanc {activeCert.shortTitle} : Architectures Multi-Agents & Prompt Caching
              </h2>
              <div className="flex items-center gap-3 mt-2 text-[#55433d] font-mono text-[12px] flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-[#99462a]" /> ~52 min restantes
                </span>
                <span className="text-[#dbc1b9]">·</span>
                <span className="flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-[#99462a]" /> 36 questions à valider
                </span>
                <span className="text-[#dbc1b9]">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#99462a]" /> Format chronométré officiel
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('exam')}
              className="px-4 py-2.5 rounded-xl bg-[#eae7e7] hover:bg-[#e5e2e1] text-[#1c1b1b] font-mono text-[12px] font-medium transition-colors flex items-center justify-center gap-2 flex-1 md:flex-initial border border-[#dbc1b9]"
              type="button"
            >
              <RotateCcw className="w-4 h-4 text-[#88726c]" />
              <span>Recommencer à zéro</span>
            </button>
            <button
              onClick={() => onNavigateTab('exam')}
              className="px-5 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-semibold transition-all shadow-xs flex items-center justify-center gap-2 flex-1 md:flex-initial"
              type="button"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Reprendre l'examen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Grid: 8-Col Syllabus Domain Review + 4-Col Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 8 COLS: The 5 Anthropic Syllabus Domains */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#99462a]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                  Référentiel de Compétences · {activeCert.code}
                </span>
              </div>
              <h2 className="font-headline text-[24px] text-[#1c1b1b]">
                Les 5 Domaines Officiels du Syllabus (500 Flashcards & Drills)
              </h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#55433d]">
              <span>Maîtrisé ≥ 80%</span>
              <span>·</span>
              <span>En cours 70-79%</span>
              <span>·</span>
              <span className="text-[#ba1a1a]">Priorité &lt; 70%</span>
            </div>
          </div>

          {OFFICIAL_DOMAINS.map((domain) => {
            const circumference = 2 * Math.PI * 14;
            const strokeDashoffset = circumference - (domain.percentage / 100) * circumference;
            const certWeight =
              activeCert.domainWeights.find((w) => w.domainId === domain.id)?.weight ?? 20;

            let strokeColor = '#99462a'; // primary
            let barColor = 'bg-[#99462a]';
            if (domain.percentage < 70) {
              strokeColor = '#ba1a1a'; // error
              barColor = 'bg-[#ba1a1a]';
            } else if (domain.percentage < 80) {
              strokeColor = '#fc8d66'; // secondary
              barColor = 'bg-[#fc8d66]';
            }

            return (
              <div
                key={domain.id}
                className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs hover:border-[#dbc1b9] transition-all flex flex-col gap-3.5 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Circular Progress Gauge */}
                    <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          className="stroke-[#e5e2e1]"
                          strokeWidth="3.2"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="3.2"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute font-mono text-[11px] font-bold text-[#1c1b1b]">
                        {domain.percentage}%
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
                        <span className="font-bold text-[#99462a] uppercase">
                          {domain.code}
                        </span>
                        <span className="text-[#dbc1b9]">·</span>
                        <span className="text-[#1c1b1b] font-semibold">
                          Pondération {certWeight}% ({activeCert.code})
                        </span>
                        <span className="text-[#dbc1b9]">·</span>
                        <span className="text-[#55433d]">{domain.status}</span>
                        <span className="text-[#dbc1b9]">·</span>
                        <span className="text-[#88726c]">
                          {domain.flashcardsCount || 100} Flashcards & {domain.questionsCount} Qs
                        </span>
                      </div>
                      <h3 className="font-headline text-[19px] text-[#1c1b1b] mt-1 font-semibold group-hover:text-[#99462a] transition-colors">
                        {domain.title}
                      </h3>
                      <p className="text-[13px] text-[#55433d] mt-0.5 leading-snug">
                        {domain.description}
                      </p>

                      {domain.keyTopics && domain.keyTopics.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mt-2 font-mono text-[10px] text-[#88726c]">
                          <span className="text-[#55433d] font-semibold">Sujets clés :</span>
                          {domain.keyTopics.map((topic, i) => (
                            <React.Fragment key={topic}>
                              <span>{topic}</span>
                              {i < domain.keyTopics!.length - 1 && (
                                <span className="text-[#dbc1b9]">·</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct Action Buttons for this Domain */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <button
                      onClick={() => onSelectDomainFlashcards(domain.id)}
                      className="flex-1 sm:w-40 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f0eded] text-[#99462a] border border-[#eae7e7] font-mono text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                      title={`Réviser les 100 Flashcards du ${domain.code}`}
                      type="button"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>100 Flashcards</span>
                    </button>
                    <button
                      onClick={() => onLaunchDrill(domain.id)}
                      className="flex-1 sm:w-40 px-3 py-1.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                      title={`Lancer un Drill d'examen sur le ${domain.code}`}
                      type="button"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Drill Examen</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Linear progress bar */}
                <div className="w-full bg-[#eae7e7] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${domain.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT 4 COLS: Performance Metrics Sidebar & Study Statistics */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Performance Score Gauge Card */}
          <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#88726c] uppercase tracking-wider">
                Score Moyen Examen Blanc
              </span>
              <span className="font-mono text-[11px] bg-[#ffdbd0] text-[#7a2f15] px-2 py-0.5 rounded-full font-bold">
                Admissible
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline text-[44px] text-[#1c1b1b] font-semibold leading-none">
                  785
                </span>
                <span className="font-headline text-[22px] text-[#88726c]">/1000</span>
              </div>
              <span className="font-mono text-[12px] text-[#99462a] font-bold">
                +35 pts ce mois
              </span>
            </div>

            {/* Cutoff Scale Visual */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[11px] text-[#88726c]">
                <span>0</span>
                <span className="text-[#99462a] font-bold">Seuil: 750</span>
                <span>1000</span>
              </div>
              <div className="relative w-full h-3 bg-[#e5e2e1] rounded-full overflow-hidden">
                {/* Cutoff marker line */}
                <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-[#1c1b1b] z-10" />
                {/* Score bar */}
                <div
                  className="bg-[#99462a] h-full rounded-full transition-all duration-700"
                  style={{ width: '78.5%' }}
                />
              </div>
              <span className="text-[12px] text-[#55433d] mt-1 leading-snug">
                Vous dépassez de 35 points le seuil de certification officiel Anthropic.
              </span>
            </div>

            {/* Sub-grid: Study time & Streak */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#f0eded] p-3 rounded-xl flex flex-col border border-[#eae7e7]">
                <span className="font-mono text-[10px] text-[#88726c] uppercase">
                  Temps d'étude
                </span>
                <span className="font-headline text-[20px] text-[#1c1b1b] font-semibold mt-1">
                  34h <span className="text-[14px] text-[#88726c] font-normal">/ 40h</span>
                </span>
                <span className="font-mono text-[10px] text-[#99462a] mt-0.5 font-medium">
                  85% de l'objectif
                </span>
              </div>

              <div className="bg-[#f0eded] p-3 rounded-xl flex flex-col border border-[#eae7e7]">
                <span className="font-mono text-[10px] text-[#88726c] uppercase">
                  Streak actif
                </span>
                <span className="font-headline text-[20px] text-[#1c1b1b] font-semibold mt-1 flex items-center gap-1.5">
                  14 j
                  <Flame className="w-5 h-5 text-[#d97757] fill-[#d97757]" />
                </span>
                <span className="font-mono text-[10px] text-[#99462a] mt-0.5 font-medium">
                  Record personnel
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action: Focused Weak-Point Flash Review */}
          <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#99462a]" />
                <span className="font-headline text-[19px] text-[#1c1b1b] font-semibold">
                  Drill Ciblé Express
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#88726c]">10 Qs</span>
            </div>
            <p className="text-[13px] text-[#55433d] leading-relaxed">
              Générez une série rapide uniquement focalisée sur le{' '}
              <strong className="text-[#1c1b1b]">Domaine 05 (Batch API & Fallbacks)</strong> pour combler vos lacunes prioritaires.
            </p>
            <button
              onClick={() => onLaunchDrill(5)}
              className="w-full py-2.5 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#1c1b1b] font-mono text-[12px] font-semibold transition-colors flex items-center justify-center gap-2 border border-[#eae7e7]"
              type="button"
            >
              <Zap className="w-4 h-4 text-[#99462a]" />
              <span>Lancer un Drill Domaine 05 (15 min)</span>
            </button>
          </div>

          {/* Architect Blueprint Memo */}
          <div
            onClick={() => onNavigateTab('flashcards')}
            className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2 hover:border-[#dbc1b9] hover:bg-[#f0eded] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#715a3e]">
                <BookOpen className="w-4 h-4" />
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                  Mémo Architecte Clé
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#99462a] font-bold group-hover:underline">
                500 Flashcards (100 / Domaine) →
              </span>
            </div>
            <p className="font-headline text-[16px] text-[#1c1b1b] italic leading-snug">
              "Prefill the assistant response with &lt;response&gt; to guarantee conforming structural output without retry latency."
            </p>
            <span className="font-mono text-[11px] text-[#88726c]">
              Anthropic Best Practices • Section 4.2
            </span>
          </div>

          {/* AI Architecture Encyclopedia & Glossary Card */}
          <div
            onClick={() => onNavigateTab('encyclopedia')}
            className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2 hover:border-[#dbc1b9] hover:bg-[#f0eded] transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#99462a]">
                <BookMarked className="w-4 h-4" />
                <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">
                  Glossaire & Encyclopédie IA
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#99462a] font-bold group-hover:underline">
                15 Traités Officiels →
              </span>
            </div>
            <p className="text-[13px] text-[#55433d] leading-relaxed">
              Consultez les définitions canoniques, schémas de flux et règles de sécurité pour chaque concept examiné.
            </p>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#88726c] pt-1 border-t border-[#eae7e7]">
              <span>Prompt Caching • MCP • Prefill • Constitutional AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Recently Missed Tricky Questions */}
      <section className="mt-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#ba1a1a] font-bold">
              Analyse d'Erreurs Récentes
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Questions pièges récemment manquées
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('scorecard')}
            className="font-mono text-[12px] text-[#99462a] hover:underline flex items-center gap-1.5 font-semibold"
          >
            <span>Voir le diagnostic complet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRICKY_QUESTIONS.map((item) => {
            const isRetested = retestedIds[item.id];
            return (
              <div
                key={item.id}
                className="bg-[#f6f3f2] p-5 rounded-2xl border border-[#eae7e7] shadow-xs flex flex-col justify-between hover:border-[#dbc1b9] transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded font-bold">
                      {item.domainTag}
                    </span>
                    <span className="font-mono text-[10px] text-[#88726c]">{item.timeAgo}</span>
                  </div>

                  <h3 className="font-headline text-[18px] text-[#1c1b1b] font-semibold leading-snug mt-1">
                    {item.title}
                  </h3>

                  <p className="text-[13px] text-[#55433d] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="bg-[#f0eded] p-3 rounded-xl font-mono text-[11px] text-[#55433d] mt-2 border border-[#eae7e7] leading-relaxed">
                    <span className="text-[#ba1a1a] font-bold">Votre réponse :</span> {item.userAnswer}
                    <br />
                    <span className="text-[#99462a] font-bold">Bonne réponse :</span> {item.correctAnswer}
                  </div>
                </div>

                <button
                  onClick={() => handleRetest(item)}
                  disabled={isRetested}
                  className={`mt-4 w-full py-2 rounded-xl font-mono text-[12px] font-medium transition-colors flex items-center justify-center gap-2 ${
                    isRetested
                      ? 'bg-[#d97757] text-white'
                      : 'bg-[#eae7e7] hover:bg-[#99462a] hover:text-white text-[#1c1b1b]'
                  }`}
                  type="button"
                >
                  {isRetested ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Concept validé !</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-tester ce concept</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: Agenda des sessions live & Simulations programmées */}
      <section className="mt-10 bg-[#f6f3f2] p-6 rounded-2xl border border-[#eae7e7] shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
              Planning de Révision
            </span>
            <h2 className="font-headline text-[24px] text-[#1c1b1b]">
              Prochaines Sessions & Examens en Conditions Réelles
            </h2>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#1c1b1b] font-mono text-[12px] font-medium transition-colors flex items-center gap-2 border border-[#eae7e7]"
            type="button"
          >
            <Plus className="w-4 h-4 text-[#88726c]" />
            <span>Planifier un créneau d'étude</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCHEDULED_SESSIONS.map((session, idx) => (
            <div
              key={idx}
              className="bg-[#f0eded] p-4 rounded-xl flex items-start gap-4 border border-[#eae7e7]"
            >
              <div
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl text-center shrink-0 ${
                  session.isOfficialExam
                    ? 'bg-[#99462a] text-white'
                    : 'bg-[#e5e2e1]'
                }`}
              >
                <span
                  className={`font-mono text-[10px] uppercase font-bold ${
                    session.isOfficialExam ? 'text-[#ffdbd0]' : 'text-[#99462a]'
                  }`}
                >
                  {session.dayOfWeek}
                </span>
                <span
                  className={`font-headline text-[22px] font-bold leading-none my-0.5 ${
                    session.isOfficialExam ? 'text-white' : 'text-[#1c1b1b]'
                  }`}
                >
                  {session.dayNumber}
                </span>
                <span
                  className={`font-mono text-[10px] ${
                    session.isOfficialExam ? 'text-[#ffdbd0]' : 'text-[#88726c]'
                  }`}
                >
                  {session.month}
                </span>
              </div>

              <div className="flex flex-col min-w-0">
                <span
                  className={`font-mono text-[11px] font-bold ${
                    session.isOfficialExam
                      ? 'text-[#99462a]'
                      : session.isOfficeHours
                      ? 'text-[#715a3e]'
                      : 'text-[#99462a]'
                  }`}
                >
                  {session.time}
                </span>
                <span className="font-headline text-[16px] text-[#1c1b1b] font-semibold truncate mt-0.5">
                  {session.title}
                </span>
                <span className="text-[12px] text-[#55433d] line-clamp-1">
                  {session.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-[#1c1b1b]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#f6f3f2] max-w-md w-full rounded-2xl p-6 border border-[#eae7e7] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#99462a]" />
                <h3 className="font-headline text-[20px] text-[#1c1b1b] font-semibold">
                  Planifier un créneau d'étude
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-[#88726c] hover:text-[#1c1b1b] text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] text-[#55433d]">
              Réservez une session de révision chronométrée de 45 minutes synchronisée avec votre calendrier Google Calendar / ICS.
            </p>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-[#88726c] uppercase">
                Type de session
              </label>
              <select className="p-2.5 rounded-xl bg-white text-[13px] text-[#1c1b1b] border border-[#eae7e7] outline-none">
                <option>Simulation Blanche Chronométrée (60 Qs - 90 min)</option>
                <option>Drill Spécifique : Domaine 05 Coûts & Batch (15 min)</option>
                <option>Lab Pratique : Tool Calling & MCP Server (30 min)</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl bg-[#f0eded] text-[#1c1b1b] font-mono text-[12px]"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  alert('Session ajoutée à votre agenda de préparation !');
                }}
                className="px-4 py-2 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-semibold"
              >
                Confirmer le créneau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
