import React, { useState } from 'react';
import { TabType, TrickyQuestion } from '../types';
import { OFFICIAL_CERTIFICATIONS, OFFICIAL_DOMAINS, TRICKY_QUESTIONS, SCHEDULED_SESSIONS } from '../data/mockData';
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
} from 'lucide-react';

interface DashboardViewProps {
  activeCertId: string;
  onSelectCertification: (certId: string) => void;
  onSelectDomainFlashcards: (domainId: number) => void;
  onNavigateTab: (tab: TabType) => void;
  onRetestConcept: (question: TrickyQuestion) => void;
  onLaunchDrill: (domainId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeCertId,
  onSelectCertification,
  onSelectDomainFlashcards,
  onNavigateTab,
  onRetestConcept,
  onLaunchDrill,
}) => {
  const [retestedIds, setRetestedIds] = useState<Record<string, boolean>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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
