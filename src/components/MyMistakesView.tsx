import React, { useState, useMemo, useEffect } from 'react';
import { TabType } from '../types';
import {
  PersonalMistake,
  MistakeDomain,
  MISTAKES_DOMAIN_COUNTS,
  INITIAL_PERSONAL_MISTAKES,
} from '../data/myMistakesData';
import { AITutorFeedback } from './AITutorFeedback';
import {
  FileX2,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Layers,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Calendar,
  Sparkles,
  Bot,
  Flame,
  Check,
  X,
} from 'lucide-react';

interface MyMistakesViewProps {
  onNavigateTab: (tab: TabType) => void;
  onLaunchDrill?: (domainId: number) => void;
  onSelectDomainFlashcards?: (domainId: number) => void;
}

const STORAGE_KEY_MISTAKES = 'claudemastor_personal_mistakes_v1';

export const MyMistakesView: React.FC<MyMistakesViewProps> = ({
  onNavigateTab,
  onLaunchDrill,
  onSelectDomainFlashcards,
}) => {
  const [mistakes, setMistakes] = useState<PersonalMistake[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MISTAKES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_PERSONAL_MISTAKES;
  });

  const [selectedDomain, setSelectedDomain] = useState<MistakeDomain | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'dueToday' | 'frequent' | 'unresolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Review Session mode state
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [reviewAnswers, setReviewAnswers] = useState<Record<string, string>>({});
  const [reviewedSuccessIds, setReviewedSuccessIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));
    } catch {
      // ignore
    }
  }, [mistakes]);

  // Filtered list
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((m) => {
      if (selectedDomain !== 'all' && m.domain !== selectedDomain) return false;
      if (urgencyFilter === 'dueToday' && m.nextReviewDue !== 'Aujourd’hui') return false;
      if (urgencyFilter === 'frequent' && m.errorCount < 2) return false;
      if (urgencyFilter === 'unresolved' && m.isResolved) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = m.question.toLowerCase().includes(q);
        const matchExp = m.explanation.toLowerCase().includes(q);
        const matchAns = m.userAnswer.toLowerCase().includes(q) || m.correctAnswer.toLowerCase().includes(q);
        return matchQ || matchExp || matchAns;
      }

      return true;
    });
  }, [mistakes, selectedDomain, urgencyFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalAnalyses = 127;
    const resolvedCount = mistakes.filter((m) => m.isResolved).length;
    const dueTodayCount = mistakes.filter((m) => m.nextReviewDue === 'Aujourd’hui' && !m.isResolved).length;
    const highFrequencyCount = mistakes.filter((m) => m.errorCount >= 3).length;

    return {
      totalAnalyses,
      resolvedCount,
      dueTodayCount,
      highFrequencyCount,
    };
  }, [mistakes]);

  // Start review session on current filtered subset
  const handleStartReviewSession = (targetDomain?: MistakeDomain) => {
    if (targetDomain) {
      setSelectedDomain(targetDomain);
    }
    setReviewIdx(0);
    setReviewAnswers({});
    setIsReviewing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentReviewItem = filteredMistakes[reviewIdx] || filteredMistakes[0];
  const selectedAnswerForCurrent = currentReviewItem ? reviewAnswers[currentReviewItem.id] : undefined;

  const handleSelectReviewOption = (optionId: string) => {
    if (!currentReviewItem) return;
    setReviewAnswers((prev) => ({
      ...prev,
      [currentReviewItem.id]: optionId,
    }));

    const correctOpt = currentReviewItem.options.find((o) => o.isCorrect);
    if (correctOpt && optionId === correctOpt.id) {
      setReviewedSuccessIds((prev) => ({ ...prev, [currentReviewItem.id]: true }));
      // Mark mistake as resolved in state
      setMistakes((prev) =>
        prev.map((m) => (m.id === currentReviewItem.id ? { ...m, isResolved: true, srsStage: 'Acquise' } : m))
      );
    }
  };

  const handleRetryReviewQuestion = () => {
    if (!currentReviewItem) return;
    setReviewAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentReviewItem.id];
      return copy;
    });
  };

  const handleNextReviewQuestion = () => {
    if (reviewIdx < filteredMistakes.length - 1) {
      setReviewIdx((prev) => prev + 1);
    } else {
      setIsReviewing(false);
    }
  };

  const handleToggleResolve = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isResolved: !m.isResolved, srsStage: !m.isResolved ? 'Acquise' : 'À revoir' } : m))
    );
  };

  const handleResetMistakes = () => {
    setMistakes(INITIAL_PERSONAL_MISTAKES);
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-16 flex flex-col gap-6 font-body">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-widest font-bold">
          <FileX2 className="w-4 h-4 text-[#ba1a1a]" />
          <span>Carnet d’erreurs personnel · Diagnostic Intelligent</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-[#fff8f5] border border-[#ffdad6] text-[#ba1a1a] font-mono text-[11px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ba1a1a]" />
            <span>{stats.dueTodayCount} erreurs dues aujourd’hui</span>
          </div>
          <button
            type="button"
            onClick={handleResetMistakes}
            className="px-2.5 py-1 rounded-lg bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#55433d] font-mono text-[11px] transition-colors cursor-pointer"
            title="Réinitialiser le carnet d'erreurs initial"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Hero Header: My Mistakes / 127 erreurs analysées */}
      <section className="bg-white rounded-3xl border-2 border-[#99462a]/25 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-[#eae7e7]">
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#99462a] font-bold">
              Méthodologie Active · Ciblage des Faiblesses
            </span>
            <h1 className="font-headline text-[34px] sm:text-[42px] text-[#1c1b1b] font-bold tracking-tight leading-none">
              My Mistakes
            </h1>
            <p className="text-[15px] text-[#55433d] mt-1 max-w-2xl leading-relaxed">
              Conserve l’historique chirurgical de vos erreurs d’examens, de drills et de flashcards.
              Plutôt que de relire passivement 2 000 cartes, focalisez vos révisions sur vos{' '}
              <strong className="text-[#1c1b1b]">127 erreurs analysées</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleStartReviewSession()}
              className="px-6 py-3.5 rounded-2xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[13px] font-bold shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Réviser mes erreurs ({filteredMistakes.length})</span>
            </button>
          </div>
        </div>

        {/* 6-Domain Breakdown Grid (The exact numbers requested: MCP 31, Prompt 24, Security 18, Arch 17, FinOps 15, Prod 12) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="uppercase tracking-wider text-[#88726c] font-bold">
              Répartition des 127 erreurs par domaine d’examen :
            </span>
            <span className="text-[#55433d]">Cliquez sur un domaine pour filtrer</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {(
              [
                { domain: 'MCP' as MistakeDomain, count: MISTAKES_DOMAIN_COUNTS.MCP, label: 'Tool Use & MCP', color: '#99462a' },
                { domain: 'Prompt Engineering' as MistakeDomain, count: MISTAKES_DOMAIN_COUNTS['Prompt Engineering'], label: 'Prompt Eng.', color: '#0d47a1' },
                { domain: 'Security' as MistakeDomain, count: MISTAKES_DOMAIN_COUNTS.Security, label: 'Security & Gov.', color: '#ba1a1a' },
                { domain: 'Architecture' as MistakeDomain, count: MISTAKES_DOMAIN_COUNTS.Architecture, label: 'Architecture', color: '#6a1b9a' },
                { domain: 'FinOps' as MistakeDomain, count: MISTAKES_DOMAIN_COUNTS.FinOps, label: 'FinOps & Coûts', color: '#2e7d32' },
                { domain: 'Production' as MistakeDomain, count: MISTAKES_DOMAIN_COUNTS.Production, label: 'Production SLA', color: '#c65102' },
              ]
            ).map((item) => {
              const isSelected = selectedDomain === item.domain;
              return (
                <button
                  key={item.domain}
                  type="button"
                  onClick={() => setSelectedDomain(isSelected ? 'all' : item.domain)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] shadow-xs'
                      : 'bg-[#fcf9f8] border-[#eae7e7] hover:border-[#dbc1b9] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className={isSelected ? 'text-[#ffb59c] font-bold' : 'text-[#88726c]'}>
                      {item.domain}
                    </span>
                    <span
                      className={`text-[15px] font-bold font-headline ${
                        isSelected ? 'text-white' : 'text-[#1c1b1b]'
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] truncate font-medium ${
                      isSelected ? 'text-[#d5c2bc]' : 'text-[#55433d]'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE REVIEW SESSION MODAL / OVERLAY RUNNER */}
      {isReviewing && currentReviewItem && (
        <section className="bg-white rounded-3xl border-2 border-[#99462a] p-6 sm:p-8 shadow-md flex flex-col gap-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#eae7e7] pb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#ffdad6] text-[#ba1a1a] font-mono text-[11px] font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-[#ba1a1a]" />
                <span>Session de Révision d’Erreurs ({reviewIdx + 1} / {filteredMistakes.length})</span>
              </span>
              <span className="font-mono text-[11px] text-[#88726c]">
                · Domaine : {currentReviewItem.domain}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#f6f3f2] font-mono text-[10px] text-[#55433d]">
                Échouée {currentReviewItem.errorCount} fois
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewing(false)}
              className="p-1.5 rounded-xl hover:bg-[#f6f3f2] text-[#88726c] transition-colors cursor-pointer"
              title="Quitter la session de révision"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question Text */}
          <div className="flex flex-col gap-2">
            <h2 className="font-headline text-[22px] sm:text-[24px] text-[#1c1b1b] font-bold leading-snug">
              {currentReviewItem.question}
            </h2>

            {currentReviewItem.codeSnippet && (
              <pre className="p-3.5 rounded-xl bg-[#21201d] text-[#faf9f5] font-mono text-[11.5px] overflow-x-auto leading-relaxed border border-[#313030]">
                {currentReviewItem.codeSnippet}
              </pre>
            )}
          </div>

          {/* Interactive Options with AI Tutor */}
          <div className="flex flex-col gap-2.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#88726c] font-bold">
              Sélectionnez la bonne réponse pour corriger votre carnet :
            </span>

            {currentReviewItem.options.map((opt) => {
              const isSelected = selectedAnswerForCurrent === opt.id;
              const correctOpt = currentReviewItem.options.find((o) => o.isCorrect);
              const isCorrectOpt = opt.id === correctOpt?.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectReviewOption(opt.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? isCorrectOpt
                        ? 'bg-[#f2faf3] border-[#2e7d32] ring-1 ring-[#2e7d32]/30'
                        : 'bg-[#fff8f5] border-[#ba1a1a] ring-1 ring-[#ba1a1a]/30'
                      : 'bg-[#fcf9f8] border-[#eae7e7] hover:bg-white hover:border-[#dbc1b9]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg font-mono text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? isCorrectOpt
                          ? 'bg-[#2e7d32] text-white'
                          : 'bg-[#ba1a1a] text-white'
                        : 'bg-[#eae7e7] text-[#55433d]'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="text-[14px] text-[#1c1b1b] leading-relaxed">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* AI Tutor Feedback Workflow */}
          {selectedAnswerForCurrent && (
            <AITutorFeedback
              questionId={currentReviewItem.id}
              questionText={currentReviewItem.question}
              selectedOptionId={selectedAnswerForCurrent}
              selectedOptionText={
                currentReviewItem.options.find((o) => o.id === selectedAnswerForCurrent)?.text || ''
              }
              correctOptionId={currentReviewItem.options.find((o) => o.isCorrect)?.id || 'B'}
              correctOptionText={currentReviewItem.correctAnswer}
              fullExplanation={currentReviewItem.explanation}
              domainName={currentReviewItem.domain}
              isSecondTrySuccess={!!reviewedSuccessIds[currentReviewItem.id]}
              onRetry={handleRetryReviewQuestion}
            />
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#eae7e7]">
            <button
              type="button"
              onClick={() => reviewIdx > 0 && setReviewIdx((p) => p - 1)}
              disabled={reviewIdx === 0}
              className="px-4 py-2.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] disabled:opacity-40 text-[#55433d] font-mono text-[12px] font-semibold cursor-pointer"
            >
              ← Précédente
            </button>

            <button
              type="button"
              disabled={!selectedAnswerForCurrent}
              onClick={handleNextReviewQuestion}
              className={`px-6 py-3 rounded-xl font-mono text-[12px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedAnswerForCurrent
                  ? 'bg-[#99462a] hover:bg-[#7a2f15] text-white shadow-xs'
                  : 'bg-[#eae7e7] text-[#88726c] cursor-not-allowed'
              }`}
            >
              <span>
                {reviewIdx < filteredMistakes.length - 1
                  ? 'Erreur suivante'
                  : 'Terminer la session de révision'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* FILTER BAR & SEARCH */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#eae7e7] shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#f6f3f2] p-1 rounded-xl border border-[#eae7e7]">
            <button
              type="button"
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedDomain === 'all'
                  ? 'bg-white text-[#1c1b1b] shadow-2xs font-bold'
                  : 'text-[#55433d] hover:text-[#1c1b1b]'
              }`}
            >
              Tous ({mistakes.length})
            </button>
            {(['MCP', 'Prompt Engineering', 'Security', 'Architecture', 'FinOps', 'Production'] as MistakeDomain[]).map(
              (dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedDomain === dom
                      ? 'bg-white text-[#99462a] shadow-2xs font-bold'
                      : 'text-[#55433d] hover:text-[#1c1b1b]'
                  }`}
                >
                  {dom}
                </button>
              )
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#88726c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] text-[13px] text-[#1c1b1b] placeholder:text-[#88726c] outline-none focus:border-[#99462a] transition-colors"
          />
        </div>
      </section>

      {/* MISTAKE CARDS LIST */}
      <section className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-[#55433d] px-1">
          <span>
            Affichage de <strong>{filteredMistakes.length}</strong> erreur
            {filteredMistakes.length > 1 ? 's' : ''} sur 127
          </span>
          <span className="text-[#88726c]">
            Format complet : Question · Réponse donnée · Bonne réponse · Explication · SRS
          </span>
        </div>

        {filteredMistakes.map((mistake) => (
          <div
            key={mistake.id}
            className={`rounded-2xl border p-5 sm:p-6 transition-all flex flex-col gap-4 shadow-xs ${
              mistake.isResolved
                ? 'bg-[#fcfdfc] border-[#c8e6c9]'
                : 'bg-white border-[#eae7e7] hover:border-[#dbc1b9]'
            }`}
          >
            {/* Header: Domain, Error count, Next review */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#f0eded]">
              <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
                <span className="px-2.5 py-0.5 rounded-md bg-[#fff8f5] border border-[#ffdad6] text-[#ba1a1a] font-bold">
                  {mistake.domain}
                </span>
                <span className="text-[#dbc1b9]">·</span>
                <span className="text-[#55433d]">Difficulté : {mistake.difficulty}</span>
                <span className="text-[#dbc1b9]">·</span>
                <span className="px-2 py-0.5 rounded bg-[#f6f3f2] text-[#ba1a1a] font-bold">
                  Échouée {mistake.errorCount} fois
                </span>
                <span className="text-[#dbc1b9]">·</span>
                <span className="text-[#88726c]">Dernière erreur : {mistake.lastErrorDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    mistake.isResolved
                      ? 'bg-[#e8f5e9] text-[#1b5e20]'
                      : mistake.nextReviewDue === 'Aujourd’hui'
                      ? 'bg-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#fff3e0] text-[#c65102]'
                  }`}
                >
                  Prochaine révision : {mistake.nextReviewDue}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleToggleResolve(mistake.id, e)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    mistake.isResolved
                      ? 'bg-[#2e7d32] border-[#2e7d32] text-white'
                      : 'bg-white border-[#eae7e7] text-[#88726c] hover:text-[#2e7d32]'
                  }`}
                  title={mistake.isResolved ? 'Marquer comme non résolue' : 'Marquer comme maîtrisée'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question */}
            <div className="flex flex-col gap-1">
              <h3 className="font-headline text-[18px] sm:text-[20px] font-bold text-[#1c1b1b] leading-snug">
                {mistake.question}
              </h3>
              {mistake.codeSnippet && (
                <pre className="p-3 rounded-xl bg-[#21201d] text-[#faf9f5] font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#313030] mt-1">
                  {mistake.codeSnippet}
                </pre>
              )}
            </div>

            {/* 2-Column Comparison: Réponse donnée VS Bonne réponse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Réponse donnée (Erreur de l'utilisateur) */}
              <div className="p-3.5 rounded-xl bg-[#fff8f6] border border-[#ffdad6] flex flex-col gap-1">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#ba1a1a] font-bold flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  <span>Réponse donnée (Erreur) :</span>
                </span>
                <p className="text-[13.5px] text-[#7a2f15] leading-relaxed font-medium">
                  {mistake.userAnswer}
                </p>
              </div>

              {/* Bonne réponse officielle */}
              <div className="p-3.5 rounded-xl bg-[#f2faf3] border border-[#c8e6c9] flex flex-col gap-1">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#2e7d32] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bonne réponse :</span>
                </span>
                <p className="text-[13.5px] text-[#1b5e20] leading-relaxed font-semibold">
                  {mistake.correctAnswer}
                </p>
              </div>
            </div>

            {/* Explication technique */}
            <div className="p-4 rounded-xl bg-[#fcf9f8] border border-[#eae7e7] flex flex-col gap-1 text-[13px] leading-relaxed">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#99462a] font-bold">
                Explication & Règle d’architecture officielle :
              </span>
              <p className="text-[#1c1b1b]">{mistake.explanation}</p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <span className="font-mono text-[11px] text-[#88726c]">
                Palier SRS actuel : <strong className="text-[#1c1b1b]">{mistake.srsStage}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const idx = filteredMistakes.findIndex((m) => m.id === mistake.id);
                    if (idx >= 0) setReviewIdx(idx);
                    setIsReviewing(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1c1b1b] hover:bg-[#33302f] text-white font-mono text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#ffb59c]" />
                  <span>Re-tester ce concept</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
