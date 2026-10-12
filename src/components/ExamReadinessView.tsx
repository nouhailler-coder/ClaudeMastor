import React, { useState, useEffect, useMemo } from 'react';
import { TabType } from '../types';
import {
  CCA_P200_READINESS_REPORT,
  ExamReadinessReport,
  DayTaskItem,
} from '../data/examReadinessData';
import { OFFICIAL_CERTIFICATIONS } from '../data/mockData';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calendar,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  FileQuestion,
  Terminal,
  ShieldCheck,
  Zap,
  Check,
  ChevronRight,
  TrendingUp,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface ExamReadinessViewProps {
  onNavigateTab: (tab: TabType) => void;
  onLaunchDrill?: (domainId: number) => void;
  onSelectDomainFlashcards?: (domainId: number) => void;
  activeCertId: string;
  onSelectCertification: (certId: string) => void;
}

const STORAGE_KEY_PROGRAM_TASKS = 'claudemastor_readiness_program_tasks_v1';

export const ExamReadinessView: React.FC<ExamReadinessViewProps> = ({
  onNavigateTab,
  onLaunchDrill,
  onSelectDomainFlashcards,
  activeCertId,
  onSelectCertification,
}) => {
  const [report, setReport] = useState<ExamReadinessReport>(CCA_P200_READINESS_REPORT);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRAM_TASKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      't-1-1': true, // Task 1 done by default for realistic progress
    };
  });

  const [activeDayTab, setActiveDayTab] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRAM_TASKS, JSON.stringify(completedTasks));
    } catch {
      // ignore
    }
  }, [completedTasks]);

  const activeCert =
    OFFICIAL_CERTIFICATIONS.find((c) => c.id === activeCertId) || OFFICIAL_CERTIFICATIONS[0];

  const totalTasksCount = useMemo(() => {
    return report.fourDaysProgram.reduce((acc, day) => acc + day.tasks.length, 0);
  }, [report]);

  const completedCount = useMemo(() => {
    return Object.values(completedTasks).filter(Boolean).length;
  }, [completedTasks]);

  const progressPct = Math.round((completedCount / totalTasksCount) * 100);

  // Dynamic simulation if all tasks or many tasks are completed
  const simulatedScore = useMemo(() => {
    const base = report.scorePercentage;
    const gain = Math.round((completedCount / totalTasksCount) * 7); // up to +7%
    return Math.min(92, base + gain);
  }, [report.scorePercentage, completedCount, totalTasksCount]);

  const isSimulatedReady = simulatedScore >= 83;

  const dynamicProgressBar = useMemo(() => {
    if (simulatedScore >= 85) return '█████████████████░ 85%';
    if (simulatedScore >= 82) return '███████████████░░░ 82%';
    return report.asciiProgressBar;
  }, [simulatedScore, report.asciiProgressBar]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleExecuteTaskAction = (task: DayTaskItem) => {
    if (task.targetDomainId && onLaunchDrill && task.category === 'Drill') {
      onLaunchDrill(task.targetDomainId);
      return;
    }
    if (task.targetDomainId && onSelectDomainFlashcards && task.category === 'Flashcards') {
      onSelectDomainFlashcards(task.targetDomainId);
      return;
    }
    onNavigateTab(task.targetTab);
  };

  const handleCompleteAllSprint = () => {
    const all: Record<string, boolean> = {};
    report.fourDaysProgram.forEach((day) => {
      day.tasks.forEach((t) => {
        all[t.id] = true;
      });
    });
    setCompletedTasks(all);
  };

  const handleResetSprint = () => {
    setCompletedTasks({});
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16 flex flex-col gap-8 font-body">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-wider font-bold">
            <Target className="w-4 h-4 text-[#99462a]" />
            <span>Audit de Préparation Certifiante · Anthropic Certified Claude Architect</span>
          </div>
          <h1 className="font-headline text-[34px] sm:text-[40px] text-[#1c1b1b] font-bold tracking-tight leading-tight">
            Exam Readiness
          </h1>
        </div>

        {/* Cert Selector Switcher */}
        <div className="flex items-center gap-2">
          {OFFICIAL_CERTIFICATIONS.map((cert) => {
            const isSelected = cert.id === activeCertId;
            return (
              <button
                key={cert.id}
                type="button"
                onClick={() => onSelectCertification(cert.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[11.5px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#1c1b1b] text-white shadow-xs'
                    : 'bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#55433d] border border-[#eae7e7]'
                }`}
              >
                {cert.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* HERO SECTION: The exact block requested by user */}
      {/* CCA-P200 / ██████████████░░░░ 78% / Prêt pour l'examen : probablement */}
      <section className="bg-[#1c1b1b] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md flex flex-col gap-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[12px] uppercase tracking-widest text-[#ffb59c] font-bold">
                Bilan d'admissibilité officiel
              </span>
              <span className="text-[#88726c]">·</span>
              <span className="font-mono text-[12px] text-[#d5c2bc]">
                Session prévue dans {report.daysUntilExam} jours
              </span>
            </div>

            {/* Cert Code */}
            <h2 className="font-headline text-[44px] sm:text-[54px] font-bold text-white tracking-tight leading-none">
              {report.certCode}
            </h2>

            <p className="text-[14px] text-[#d5c2bc] max-w-xl">
              {report.certTitle} · Seuil de qualification officiel :{' '}
              <strong className="text-white font-mono">{report.officialPassingThreshold} / 1000 pts</strong>
            </p>
          </div>

          {/* Verdict Card */}
          <div className="flex flex-col items-start lg:items-end gap-2.5">
            <div
              className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 font-mono text-[13px] font-bold shadow-xs ${
                isSimulatedReady
                  ? 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]'
                  : 'bg-[#fff4e5] text-[#b25e00] border-[#ffd8a8]'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  isSimulatedReady ? 'bg-[#2e7d32]' : 'bg-[#d97706]'
                }`}
              />
              <span>
                {isSimulatedReady
                  ? "Prêt pour l'examen : OUI (Admis avec marge)"
                  : report.verdictLabel}
              </span>
            </div>

            <span className="font-mono text-[11px] text-[#d5c2bc]">
              Score simulé estimé :{' '}
              <strong className="text-[#ffb59c] text-[13px]">
                {Math.round(simulatedScore * 10)} pts
              </strong>{' '}
              (+{Math.round(simulatedScore * 10) - report.officialPassingThreshold} pts vs seuil)
            </span>
          </div>
        </div>

        {/* ASCII PROGRESS BAR & GRADIENT SLIDER */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
            <span className="text-[18px] sm:text-[22px] tracking-tight text-[#ffb59c] font-bold select-all">
              {dynamicProgressBar}
            </span>
            <span className="text-[12px] text-[#d5c2bc]">
              Marge de sécurité :{' '}
              <strong className={isSimulatedReady ? 'text-[#81c784]' : 'text-[#ffb59c]'}>
                +{Math.round(simulatedScore * 10) - report.officialPassingThreshold} points
              </strong>{' '}
              ({isSimulatedReady ? 'Confortable' : 'Vulnérable'})
            </span>
          </div>

          <div className="w-full bg-white/10 h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-[#d97757] via-[#ffb59c] to-[#81c784] h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${simulatedScore}%` }}
            />
          </div>

          <p className="text-[13.5px] text-[#f5dad0] leading-relaxed mt-1">
            {report.verdictExplanation}
          </p>
        </div>
      </section>

      {/* 2-COLUMN SECTION: Domaines solides VS À renforcer */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT COLUMN: Domaines solides */}
        <div className="rounded-3xl bg-white border-2 border-[#2e7d32]/25 p-6 sm:p-7 shadow-xs flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eded]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#2e7d32]" />
                <h3 className="font-headline text-[22px] text-[#1c1b1b] font-bold">
                  Domaines solides
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#2e7d32] font-bold bg-[#e8f5e9] px-2.5 py-0.5 rounded-full border border-[#c8e6c9]">
                ✓ 2 domaines certifiés
              </span>
            </div>

            <p className="text-[13px] text-[#55433d]">
              Ces domaines constituent votre socle de points garanti le jour J. Une simple révision d’entretien suffit.
            </p>

            <div className="flex flex-col gap-4">
              {report.solidDomains.map((domain) => (
                <div
                  key={domain.id}
                  className="p-4 rounded-2xl bg-[#f2faf3] border border-[#c8e6c9] flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[16px] text-[#2e7d32] font-bold">✓</span>
                      <span className="font-headline text-[18px] font-bold text-[#1c1b1b]">
                        {domain.name}
                      </span>
                    </div>
                    <span className="font-mono text-[12px] font-bold text-[#1b5e20] bg-white px-2.5 py-0.5 rounded-lg border border-[#c8e6c9]">
                      {domain.scorePct}% de maîtrise
                    </span>
                  </div>

                  <p className="text-[12.5px] text-[#2b4c2d] leading-relaxed">
                    {domain.description}
                  </p>

                  <div className="flex flex-col gap-1 pt-1">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#1b5e20] font-bold">
                      Points forts validés :
                    </span>
                    <ul className="space-y-0.5 text-[12px] text-[#335635]">
                      {domain.keyConcepts.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#2e7d32]">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#c8e6c9] flex items-center justify-between">
                    <span className="font-mono text-[10.5px] text-[#55433d] truncate max-w-[240px]">
                      {domain.docRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab(domain.actionTab)}
                      className="text-[#1b5e20] hover:text-[#2e7d32] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{domain.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#fcf9f8] border border-[#eae7e7] flex items-center justify-between text-mono text-[11px] text-[#55433d]">
            <span>Recommandation : Maintien hebdomadaire (10 min de flashcards)</span>
            <Check className="w-4 h-4 text-[#2e7d32]" />
          </div>
        </div>

        {/* RIGHT COLUMN: À renforcer */}
        <div className="rounded-3xl bg-white border-2 border-[#b25e00]/25 p-6 sm:p-7 shadow-xs flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0eded]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#b25e00]" />
                <h3 className="font-headline text-[22px] text-[#1c1b1b] font-bold">
                  À renforcer
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#b25e00] font-bold bg-[#fff4e5] px-2.5 py-0.5 rounded-full border border-[#ffd8a8]">
                ⚠ 3 sujets prioritaires
              </span>
            </div>

            <p className="text-[13px] text-[#55433d]">
              C'est sur ces 3 points précis que se joue votre admissibilité. Corriger ces faiblesses garantit le passage au-dessus des 820 points.
            </p>

            <div className="flex flex-col gap-3.5">
              {report.reinforceTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 rounded-2xl bg-[#fffbf5] border border-[#ffd8a8] flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[16px] text-[#b25e00] font-bold">⚠</span>
                      <span className="font-headline text-[18px] font-bold text-[#1c1b1b]">
                        {topic.name}
                      </span>
                    </div>
                    <span className="font-mono text-[12px] font-bold text-[#b25e00] bg-white px-2.5 py-0.5 rounded-lg border border-[#ffd8a8]">
                      {topic.scorePct}% actuel
                    </span>
                  </div>

                  <p className="text-[12.5px] text-[#6b3c00] leading-relaxed">
                    {topic.description}
                  </p>

                  <div className="flex flex-col gap-1 pt-1">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#b25e00] font-bold">
                      Notions clés à sécuriser :
                    </span>
                    <ul className="space-y-0.5 text-[12px] text-[#784300]">
                      {topic.keyConcepts.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#b25e00]">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#ffd8a8] flex items-center justify-between">
                    <span className="font-mono text-[10.5px] text-[#88726c] truncate max-w-[220px]">
                      {topic.docRef}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab(topic.actionTab)}
                      className="px-3 py-1 rounded-lg bg-[#1c1b1b] hover:bg-[#99462a] text-white font-mono text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{topic.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 text-[#ffb59c]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#ffdad6] flex items-center justify-between text-mono text-[11px] text-[#ba1a1a]">
            <span>Risque identifié : 4 mauvaises réponses suffisent à faire basculer le score</span>
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          </div>
        </div>
      </section>

      {/* SECTION: PROGRAMME RECOMMANDÉ — 4 JOURS */}
      <section className="bg-white rounded-3xl border-2 border-[#99462a]/25 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#f0eded]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-wider font-bold">
              <Calendar className="w-4 h-4 text-[#99462a]" />
              <span>Sprint de Révision Chirurgicale · Utilisation des Données Existantes</span>
            </div>
            <h2 className="font-headline text-[28px] sm:text-[32px] text-[#1c1b1b] font-bold tracking-tight">
              Programme recommandé — 4 jours
            </h2>
            <p className="text-[14px] text-[#55433d] max-w-2xl leading-relaxed">
              Plan d'attaque optimisé pour combler les 3 faiblesses prioritaires (MCP, Agentic loops, Tool Use) et sécuriser votre passage à{' '}
              <strong className="text-[#1c1b1b]">« Prêt pour l'examen : OUI »</strong>.
            </p>
          </div>

          {/* Sprint Progress Summary & Action Buttons */}
          <div className="flex flex-col items-start lg:items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-[#55433d]">
                Progression : <strong>{completedCount} / {totalTasksCount}</strong> ({progressPct}%)
              </span>
              <button
                type="button"
                onClick={handleCompleteAllSprint}
                className="px-3 py-1 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#1c1b1b] font-mono text-[11px] font-semibold border border-[#eae7e7] transition-colors cursor-pointer"
              >
                Tout cocher
              </button>
              <button
                type="button"
                onClick={handleResetSprint}
                className="px-3 py-1 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#88726c] font-mono text-[11px] transition-colors cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>

            <div className="w-48 bg-[#eae7e7] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2e7d32] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Day Tabs Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {report.fourDaysProgram.map((day) => {
            const isDaySelected = activeDayTab === day.dayNumber;
            const dayCompletedTasks = day.tasks.filter((t) => completedTasks[t.id]).length;
            const isDayFinished = dayCompletedTasks === day.tasks.length;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => setActiveDayTab(day.dayNumber)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isDaySelected
                    ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] shadow-xs'
                    : 'bg-[#fcf9f8] border-[#eae7e7] hover:border-[#dbc1b9] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className={isDaySelected ? 'text-[#ffb59c] font-bold' : 'text-[#99462a] font-bold'}>
                    {day.dayTitle}
                  </span>
                  <span className={isDaySelected ? 'text-[#d5c2bc]' : 'text-[#88726c]'}>
                    {day.totalDurationMinutes} min
                  </span>
                </div>

                <span
                  className={`text-[13px] font-bold truncate leading-tight ${
                    isDaySelected ? 'text-white' : 'text-[#1c1b1b]'
                  }`}
                >
                  {day.theme}
                </span>

                <div className="flex items-center justify-between font-mono text-[10.5px] pt-1 border-t border-white/10">
                  <span className={isDaySelected ? 'text-[#81c784]' : 'text-[#2e7d32]'}>
                    {day.estimatedGainText}
                  </span>
                  {isDayFinished && <Check className="w-3.5 h-3.5 text-[#81c784]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Day Detail Card & Task Checklist */}
        {(() => {
          const currentDay =
            report.fourDaysProgram.find((d) => d.dayNumber === activeDayTab) ||
            report.fourDaysProgram[0];

          return (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fcf9f8] border border-[#eae7e7] flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eae7e7]">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-[#1c1b1b] text-white font-mono text-[12px] font-bold">
                    {currentDay.dayTitle} : {currentDay.theme}
                  </span>
                  <span className="font-mono text-[11px] text-[#99462a] font-semibold">
                    Durée totale : {currentDay.totalDurationMinutes} min
                  </span>
                </div>

                <span className="font-mono text-[11.5px] text-[#2e7d32] font-bold">
                  {currentDay.estimatedGainText}
                </span>
              </div>

              <p className="text-[13.5px] text-[#55433d] italic leading-relaxed">
                Objectif de la journée : « {currentDay.objective} »
              </p>

              {/* Tasks List */}
              <div className="flex flex-col gap-3">
                {currentDay.tasks.map((task, idx) => {
                  const isChecked = !!completedTasks[task.id];

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isChecked
                          ? 'bg-[#f2faf3] border-[#c8e6c9]'
                          : 'bg-white border-[#eae7e7] hover:border-[#dbc1b9]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-[#2e7d32] border-[#2e7d32] text-white'
                              : 'bg-white border-[#dbc1b9] hover:border-[#99462a]'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[14px] font-bold leading-snug ${
                                isChecked ? 'text-[#1b5e20] line-through' : 'text-[#1c1b1b]'
                              }`}
                            >
                              Étape {idx + 1} : {task.title}
                            </span>
                            <span className="px-2 py-0.2 rounded bg-[#f6f3f2] font-mono text-[10px] text-[#55433d]">
                              {task.category}
                            </span>
                            <span className="font-mono text-[11px] text-[#88726c]">
                              ~{task.estimatedMinutes} min
                            </span>
                          </div>

                          <p className="text-[12.5px] text-[#55433d] leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteTaskAction(task)}
                        className="px-4 py-2 rounded-xl bg-[#1c1b1b] hover:bg-[#99462a] text-white font-mono text-[11px] font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-2xs"
                      >
                        <span>Exécuter</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#ffb59c]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
};
