import React, { useState, useEffect } from 'react';
import { ExamQuestion } from '../types';
import { MOCK_EXAM_QUESTIONS } from '../data/mockData';
import { updateResumeCheckpoint } from '../utils/resumeEngine';
import { AITutorFeedback } from './AITutorFeedback';
import {
  Timer,
  Bookmark,
  Bot,
  Calculator,
  Keyboard,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileCheck,
  AlertTriangle,
  GitBranch,
  X,
  Play,
  RotateCcw
} from 'lucide-react';

interface ExamSimulatorViewProps {
  onFinishExam: () => void;
  initialQuestionId?: number;
}

export const ExamSimulatorView: React.FC<ExamSimulatorViewProps> = ({
  onFinishExam,
  initialQuestionId = 24,
}) => {
  const [currentQuestionId, setCurrentQuestionId] = useState<number>(initialQuestionId);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({
    1: 'B', 2: 'A', 3: 'B', 4: 'C', 5: 'B', 6: 'A', 7: 'B', 8: 'D', 9: 'B', 10: 'A',
    11: 'B', 12: 'C', 13: 'B', 14: 'A', 15: 'B', 16: 'D', 17: 'B', 18: 'B', 19: 'A', 20: 'B',
    21: 'C', 22: 'A', 23: 'B', 24: 'B',
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({
    3: true,
    13: true,
    41: true,
  });
  const [notes, setNotes] = useState<Record<number, string>>({
    24: "Hypothèse Option B : prompt caching sur dernier tool_manifest indexe automatiquement la liste des outils entière. Parallélisme activé réduit 2 RT à 1 seul round d'inférence (gagne environ ~1200ms).",
  });

  // Countdown timer: 74 minutes and 18 seconds (4458 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(74 * 60 + 18);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // AI Tutor Socratic state
  const [isAiTutorEnabled, setIsAiTutorEnabled] = useState<boolean>(true);
  const [attemptsByQuestion, setAttemptsByQuestion] = useState<Record<number, string[]>>({});
  const [secondTrySuccessByQuestion, setSecondTrySuccessByQuestion] = useState<Record<number, boolean>>({});

  // Modals state
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showTokenModal, setShowTokenModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(18400);

  // Format time HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Current Question
  const currentQuestion = MOCK_EXAM_QUESTIONS.find((q) => q.id === currentQuestionId) || MOCK_EXAM_QUESTIONS[23];

  // Auto-save checkpoint for "Continue where you left off"
  useEffect(() => {
    const answeredTotal = Object.keys(selectedAnswers).length;
    const isDrillSession = currentQuestionId === 37 || initialQuestionId === 37;
    if (isDrillSession) {
      updateResumeCheckpoint(
        'drill',
        {
          progressPercent: Math.min(100, Math.round((currentQuestionId / 50) * 100)),
          lastSessionTitle: 'Tool Use & MCP',
          stepProgressLabel: `Question ${currentQuestionId} / 50`,
          subDetailLabel: currentQuestion.domainTitle,
          payload: {
            questionId: currentQuestionId,
            domainId: currentQuestion.domainId,
          },
        },
        true
      );
    } else {
      updateResumeCheckpoint(
        'exam',
        {
          progressPercent: Math.min(100, Math.round((currentQuestionId / 60) * 100)),
          lastSessionTitle: `Simulation CCA-P200 (${answeredTotal} répondues)`,
          stepProgressLabel: `Question ${currentQuestionId} / 60`,
          subDetailLabel: `${currentQuestion.domainTitle} · ${Object.values(flaggedQuestions).filter(Boolean).length} marquées`,
          payload: {
            questionId: currentQuestionId,
            timeLeftSeconds: timeLeft,
          },
        },
        true
      );
    }
  }, [currentQuestionId, selectedAnswers]);

  const handleSelectOption = (optionId: string) => {
    const previousAttempts = attemptsByQuestion[currentQuestionId] || [];
    if (previousAttempts.length > 0 && optionId === currentQuestion.correctOptionId) {
      setSecondTrySuccessByQuestion((prev) => ({ ...prev, [currentQuestionId]: true }));
    }
    setAttemptsByQuestion((prev) => ({
      ...prev,
      [currentQuestionId]: [...previousAttempts, optionId],
    }));

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionId]: optionId,
    }));
  };

  const handleRetryQuestion = () => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestionId];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestionId]: !prev[currentQuestionId],
    }));
  };

  const handlePrevQuestion = () => {
    if (currentQuestionId > 1) {
      setCurrentQuestionId((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionId < 60) {
      setCurrentQuestionId((prev) => prev + 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (['1', 'a', 'A'].includes(e.key)) handleSelectOption('A');
      if (['2', 'b', 'B'].includes(e.key)) handleSelectOption('B');
      if (['3', 'c', 'C'].includes(e.key)) handleSelectOption('C');
      if (['4', 'd', 'D'].includes(e.key)) handleSelectOption('D');
      if (['f', 'F'].includes(e.key)) handleToggleFlag();
      if (e.key === 'ArrowRight') handleNextQuestion();
      if (e.key === 'ArrowLeft') handlePrevQuestion();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionId]);

  // Compute counts
  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = 60 - answeredCount;

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Exam Top Command Bar */}
      <header className="w-full bg-[#f6f3f2] rounded-2xl p-4 mb-6 border border-[#eae7e7] shadow-xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#fdddb9] text-[#281803] font-mono text-[10px] font-bold uppercase tracking-wider">
              Session Officielle Étalonnée
            </span>
            <span className="text-[#88726c] text-xs">/</span>
            <span className="font-mono text-[11px] text-[#55433d] font-medium">
              Session #CCA-2025-04A9
            </span>
          </div>
          <h1 className="font-headline text-[20px] lg:text-[22px] text-[#1c1b1b] font-semibold tracking-tight">
            Examen Blanc Officiel #3 — Claude Certified Architect - Foundations
          </h1>
        </div>

        {/* Telemetry & Tools */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
          {/* Question progress badge */}
          <div className="flex items-center gap-2 bg-[#f0eded] px-3 py-1.5 rounded-xl border border-[#eae7e7]">
            <span className="font-mono text-[11px] text-[#88726c] uppercase">Progression</span>
            <span className="font-mono text-[12px] text-[#1c1b1b] font-bold">
              {currentQuestionId} / 60
            </span>
            <span className="font-mono text-[10px] text-[#99462a] font-bold bg-[#ffdbd0] px-2 py-0.5 rounded-full">
              {Math.round((answeredCount / 60) * 100)}%
            </span>
          </div>

          {/* Live Count Down Timer */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#eae7e7] shadow-xs">
            <Timer className="w-4 h-4 text-[#99462a]" />
            <span className="font-mono text-[14px] text-[#99462a] font-bold tracking-tight">
              {formatTime(timeLeft)}
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">/ 90m</span>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAiTutorEnabled((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[12px] transition-colors border cursor-pointer ${
                isAiTutorEnabled
                  ? 'bg-[#f2faf3] text-[#2e7d32] border-[#c8e6c9] font-bold shadow-2xs'
                  : 'bg-white hover:bg-[#f0eded] text-[#88726c] border-[#eae7e7]'
              }`}
              title="Activer ou mettre en pause l'AI Tutor ClaudeMastor"
              type="button"
            >
              <Bot className="w-4 h-4 text-[#2e7d32]" />
              <span className="hidden sm:inline">AI Tutor</span>
              <span className="text-[10px] uppercase font-bold">{isAiTutorEnabled ? 'Actif' : 'Off'}</span>
            </button>

            <button
              onClick={handleToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[12px] transition-colors border cursor-pointer ${
                flaggedQuestions[currentQuestionId]
                  ? 'bg-[#ffdbd0] text-[#7a2f15] border-[#ffb59e] font-semibold'
                  : 'bg-white hover:bg-[#f0eded] text-[#55433d] border-[#eae7e7]'
              }`}
              type="button"
            >
              <Bookmark className={`w-4 h-4 ${flaggedQuestions[currentQuestionId] ? 'fill-current text-[#99462a]' : 'text-[#715a3e]'}`} />
              <span>{flaggedQuestions[currentQuestionId] ? 'Marquée' : 'Marquer pour révision'}</span>
            </button>

            <button
              onClick={() => setShowTokenModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#f0eded] text-[#55433d] font-mono text-[12px] transition-colors border border-[#eae7e7]"
              type="button"
            >
              <Calculator className="w-4 h-4 text-[#88726c]" />
              <span className="hidden sm:inline">Calculateur tokens</span>
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-1.5 rounded-xl bg-white hover:bg-[#f0eded] text-[#55433d] transition-colors border border-[#eae7e7]"
              title="Raccourcis & Instructions"
              type="button"
            >
              <Keyboard className="w-4 h-4 text-[#88726c]" />
            </button>
          </div>
        </div>
      </header>

      {/* Dual-Pane Architecture Workspace (12-Col Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Scenario & Code Snippet (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3 border-[#eae7e7]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#fc8d66]/20 text-[#732606] font-mono text-[10px] font-bold uppercase tracking-wider">
                  {currentQuestion.domainCode}
                </span>
                <span className="text-xs text-[#88726c]">•</span>
                <span className="font-mono text-[11px] text-[#55433d]">
                  {currentQuestion.category}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#715a3e] font-semibold">
                Pondération : {currentQuestion.weight} pts
              </span>
            </div>

            {/* Mise en situation système */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#88726c] uppercase tracking-wider font-semibold">
                <GitBranch className="w-4 h-4 text-[#99462a]" />
                <span>Mise en situation système</span>
              </div>
              <p className="font-headline text-[19px] text-[#1c1b1b] leading-relaxed">
                {currentQuestion.scenario}
              </p>
              <p className="text-[15px] text-[#55433d] leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Technical Payload Schema Snippet */}
            {currentQuestion.codeSnippet && (
              <div className="flex flex-col rounded-xl overflow-hidden bg-[#21201D] text-[#FAF9F5] shadow-inner mt-1 border border-[#313030]">
                {/* Code Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#1A1916] text-[#e5e2e1] border-b border-[#313030]">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d97757]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a88d6d]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#55433d]" />
                    <span className="ml-2 text-[#e5e2e1]">
                      {currentQuestion.codeFilename || 'anthropic_orchestrator.py'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#dbc1b9] uppercase tracking-wider">
                    Anthropic SDK v0.34+
                  </span>
                </div>

                {/* Code Body */}
                <pre className="p-4 font-mono text-[12px] leading-relaxed overflow-x-auto text-[#fcf9f8] whitespace-pre selection:bg-[#99462a] selection:text-white">
                  {currentQuestion.codeSnippet}
                </pre>
              </div>
            )}

            {/* Latency & Target Callouts */}
            <div className="grid grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-[#eae7e7]">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] text-[#88726c] uppercase">SLA Latence</span>
                <span className="font-mono text-[14px] text-[#1c1b1b] font-bold">
                  {currentQuestion.slaLatency || '< 2 500 ms'}
                </span>
              </div>
              <div className="flex flex-col border-l border-[#eae7e7] pl-3">
                <span className="font-mono text-[10px] text-[#88726c] uppercase">Tokens Contexte</span>
                <span className="font-mono text-[14px] text-[#715a3e] font-bold">
                  {currentQuestion.tokensContext || '~14 200 tks'}
                </span>
              </div>
              <div className="flex flex-col border-l border-[#eae7e7] pl-3">
                <span className="font-mono text-[10px] text-[#88726c] uppercase">Cache Hit Cible</span>
                <span className="font-mono text-[14px] text-[#99462a] font-bold">
                  {currentQuestion.cacheHitTarget || '≥ 92%'}
                </span>
              </div>
            </div>
          </div>

          {/* Architecture Diagram Snapshot Visual */}
          <div className="bg-[#f6f3f2] rounded-2xl p-4 border border-[#eae7e7] shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#ffdbd0] flex items-center justify-center text-[#7a2f15] shrink-0 border border-[#ffb59e]">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] text-[#1c1b1b] font-semibold">
                  Diagramme de flux d'exécution simultanée
                </span>
                <span className="text-[12px] text-[#55433d]">
                  {currentQuestion.diagramNote || 'Claude émet `tool_use` multiple en un seul aller-retour inférence.'}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white border border-[#eae7e7] font-mono text-[10px] text-[#55433d]">
                JSON Schema v4
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-[#eae7e7] font-mono text-[10px] text-[#99462a] font-bold">
                Parallélisme natif
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Multiple-Choice Options & Candidate Scratchpad (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#f6f3f2] rounded-2xl p-6 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#1c1b1b] uppercase font-bold tracking-wider">
                Sélectionnez la meilleure réponse (Unique)
              </span>
              <span className="font-mono text-[11px] text-[#88726c]">
                Question {currentQuestionId}/60
              </span>
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswers[currentQuestionId] === opt.id;
                const hasTriedThisOption = (attemptsByQuestion[currentQuestionId] || []).includes(opt.id);
                const isWrongPreviousAttempt = hasTriedThisOption && opt.id !== currentQuestion.correctOptionId;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`group cursor-pointer rounded-xl p-4 transition-all flex items-start gap-3 border ${
                      isSelected
                        ? opt.id === currentQuestion.correctOptionId
                          ? 'bg-[#f2faf3] border-[#2e7d32] shadow-sm ring-1 ring-[#2e7d32]/30'
                          : 'bg-white border-[#d97757] shadow-md ring-1 ring-[#d97757]/40 bg-gradient-to-r from-[#ffdbd0]/30 to-transparent'
                        : isWrongPreviousAttempt
                        ? 'bg-[#f6f3f2]/60 border-[#eae7e7] opacity-65 hover:opacity-90'
                        : 'bg-white border-[#eae7e7] hover:border-[#dbc1b9] hover:bg-[#faf7f6]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold shrink-0 transition-colors ${
                        isSelected
                          ? opt.id === currentQuestion.correctOptionId
                            ? 'bg-[#2e7d32] text-white'
                            : 'bg-[#99462a] text-white shadow-xs'
                          : isWrongPreviousAttempt
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : 'bg-[#f0eded] text-[#1c1b1b] group-hover:bg-[#eae7e7]'
                      }`}
                    >
                      {isWrongPreviousAttempt && !isSelected ? '✗' : opt.id}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[14px] leading-snug ${isSelected ? 'text-[#1c1b1b] font-semibold' : 'text-[#1c1b1b] font-normal'}`}>
                          {opt.text}
                        </span>
                        {isSelected && (
                          <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${opt.id === currentQuestion.correctOptionId ? 'text-[#2e7d32]' : 'text-[#99462a]'}`} />
                        )}
                      </div>

                      {opt.subtext && (
                        <span className="font-mono text-[11px] text-[#715a3e] mt-1 leading-snug">
                          {opt.subtext}
                        </span>
                      )}

                      {isWrongPreviousAttempt && !isSelected && (
                        <span className="font-mono text-[11px] text-[#ba1a1a] mt-1 font-semibold">
                          (Essai précédent infructueux — écarté par l’indice socratique)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Tutor Socratic Feedback Workflow */}
            {isAiTutorEnabled && selectedAnswers[currentQuestionId] && (
              <div className="pt-2">
                <AITutorFeedback
                  questionId={currentQuestion.id}
                  questionText={currentQuestion.question}
                  selectedOptionId={selectedAnswers[currentQuestionId]}
                  selectedOptionText={
                    currentQuestion.options.find((o) => o.id === selectedAnswers[currentQuestionId])?.text || ''
                  }
                  correctOptionId={currentQuestion.correctOptionId}
                  correctOptionText={
                    currentQuestion.options.find((o) => o.id === currentQuestion.correctOptionId)?.text
                  }
                  fullExplanation={currentQuestion.rationale}
                  domainName={currentQuestion.domainTitle}
                  isSecondTrySuccess={!!secondTrySuccessByQuestion[currentQuestionId]}
                  onRetry={handleRetryQuestion}
                />
              </div>
            )}
          </div>

          {/* Candidate Scratchpad */}
          <div className="bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#1c1b1b] font-bold uppercase tracking-wider">
                Brouillon candidat (Privé & Non évalué)
              </span>
              <span className="font-mono text-[10px] text-[#88726c]">Auto-enregistré</span>
            </div>
            <textarea
              value={notes[currentQuestionId] || ''}
              onChange={(e) =>
                setNotes((prev) => ({
                  ...prev,
                  [currentQuestionId]: e.target.value,
                }))
              }
              rows={3}
              placeholder="Notez ici vos hypothèses de latence, calculs de tokens ou points de vigilance..."
              className="w-full p-3 rounded-xl bg-white text-[13px] text-[#1c1b1b] placeholder:text-[#dbc1b9] outline-none border border-[#eae7e7] focus:border-[#d97757] transition-colors resize-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Bottom Navigation & Exam Question Grid Footer */}
      <footer className="mt-8 bg-[#f6f3f2] rounded-2xl p-5 border border-[#eae7e7] shadow-xs flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
          {/* Previous / Next buttons */}
          <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-start">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionId === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#f0eded] disabled:opacity-50 text-[#1c1b1b] font-mono text-[12px] font-semibold border border-[#eae7e7] shadow-xs transition-colors"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Question Précédente ({Math.max(1, currentQuestionId - 1)})</span>
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionId === 60}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] disabled:opacity-50 text-white font-mono text-[12px] font-semibold shadow-xs transition-colors"
              type="button"
            >
              <span>Question Suivante ({Math.min(60, currentQuestionId + 1)})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Legend Indicator */}
          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#55433d]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#dcd9d9] inline-block" />
              <span>Répondu ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#e0c29f] inline-block border border-[#715a3e]" />
              <span>Marqué ({flaggedCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-white inline-block border border-[#dbc1b9]" />
              <span>Non répondu ({unansweredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#99462a] text-white inline-flex items-center justify-center text-[9px] font-bold">
                {currentQuestionId}
              </span>
              <span>Active</span>
            </div>
          </div>

          {/* Submit Exam Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full xl:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#715a3e] text-white hover:bg-[#584329] transition-colors font-mono text-[12px] font-bold shadow-md"
            type="button"
          >
            <FileCheck className="w-4 h-4" />
            <span>Terminer et soumettre l'examen</span>
          </button>
        </div>

        {/* 60-Question Matrix Palette */}
        <div className="w-full bg-white p-3 rounded-xl border border-[#eae7e7] overflow-x-auto">
          <div className="flex flex-wrap gap-1.5 min-w-[700px] justify-between">
            {Array.from({ length: 60 }, (_, idx) => {
              const qId = idx + 1;
              const isCurrent = qId === currentQuestionId;
              const isAnswered = selectedAnswers[qId] !== undefined;
              const isFlagged = flaggedQuestions[qId];

              let btnClass = 'bg-[#f0eded] text-[#55433d] hover:bg-[#eae7e7]';
              if (isFlagged) {
                btnClass = 'bg-[#e0c29f] text-[#281803] font-bold border border-[#715a3e]';
              } else if (isCurrent) {
                btnClass = 'bg-[#99462a] text-white font-bold shadow-xs scale-110 z-10';
              } else if (isAnswered) {
                btnClass = 'bg-[#dcd9d9] text-[#1c1b1b] font-medium';
              }

              return (
                <button
                  key={qId}
                  onClick={() => setCurrentQuestionId(qId)}
                  className={`w-7 h-7 rounded text-[11px] font-mono transition-transform ${btnClass}`}
                  title={`Question ${qId}${isFlagged ? ' (Marquée)' : isAnswered ? ' (Répondue)' : ''}`}
                >
                  {qId}
                </button>
              );
            })}
          </div>
        </div>
      </footer>

      {/* MODAL: Confirmation de fin d'examen */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-[#1c1b1b]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#f6f3f2] max-w-lg w-full rounded-2xl p-6 border border-[#eae7e7] shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#ffdad6] text-[#93000a] flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline text-[20px] text-[#1c1b1b] font-semibold">
                  Soumettre l'Examen Blanc ?
                </h2>
                <span className="font-mono text-[11px] text-[#88726c]">
                  Vérification de complétude des réponses
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#eae7e7] flex flex-col gap-2 font-mono text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#55433d]">Questions répondues :</span>
                <span className="font-bold text-[#1c1b1b]">{answeredCount} / 60</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55433d]">Questions restantes sans réponse :</span>
                <span className="font-bold text-[#ba1a1a]">{unansweredCount} questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#55433d]">Questions marquées pour révision :</span>
                <span className="font-bold text-[#715a3e]">{flaggedCount} questions</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#eae7e7]">
                <span className="text-[#55433d]">Temps restant :</span>
                <span className="font-bold text-[#99462a]">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <p className="text-[13px] text-[#55433d] leading-relaxed">
              Attention : Une fois le test finalisé, votre scorecard et le diagnostic de maîtrise par domaine seront calculés immédiatement. Vous ne pourrez plus modifier vos sélections.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-[#f0eded] text-[#1c1b1b] font-mono text-[12px] hover:bg-[#eae7e7]"
              >
                Reprendre l'examen
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  onFinishExam();
                }}
                className="px-5 py-2 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-bold hover:bg-[#7a2f15] shadow-xs"
              >
                Confirmer et générer la Scorecard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Calculateur de Tokens rapide */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-[#1c1b1b]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#f6f3f2] max-w-md w-full rounded-2xl p-6 border border-[#eae7e7] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#99462a]" />
                <h3 className="font-headline text-[19px] text-[#1c1b1b] font-semibold">
                  Estimateur de Tokens Prompt
                </h3>
              </div>
              <button
                onClick={() => setShowTokenModal(false)}
                className="p-1 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[13px] text-[#55433d] leading-relaxed">
              Ratio standard Claude 3.5 Sonnet : ~3,75 caractères par token pour le français/anglais technique et le JSON structuré.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] text-[#88726c] uppercase">
                Nombre de caractères bruts
              </label>
              <input
                type="number"
                value={charCount}
                onChange={(e) => setCharCount(Number(e.target.value) || 0)}
                className="p-3 rounded-xl bg-white font-mono text-[14px] text-[#1c1b1b] outline-none border border-[#eae7e7]"
              />
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#eae7e7] flex items-center justify-between">
              <span className="font-mono text-[12px] text-[#55433d]">Tokens estimés :</span>
              <span className="font-mono text-[16px] font-bold text-[#99462a]">
                ~ {Math.round(charCount / 3.75).toLocaleString('fr-FR')} tokens
              </span>
            </div>

            <button
              onClick={() => setShowTokenModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#f0eded] text-[#1c1b1b] font-mono text-[12px] font-medium hover:bg-[#eae7e7]"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Raccourcis Clavier */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-[#1c1b1b]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#f6f3f2] max-w-md w-full rounded-2xl p-6 border border-[#eae7e7] shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#715a3e]" />
                <h3 className="font-headline text-[19px] text-[#1c1b1b] font-semibold">
                  Raccourcis Clavier Candidat
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-[#88726c] hover:bg-[#f0eded]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 font-mono text-[12px] text-[#1c1b1b]">
              <div className="flex items-center justify-between py-1.5 border-b border-[#eae7e7]">
                <span>Sélectionner Option A, B, C, D</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-[#eae7e7] text-xs">
                  1 / 2 / 3 / 4 ou A / B / C / D
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#eae7e7]">
                <span>Question Suivante</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-[#eae7e7] text-xs">→</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#eae7e7]">
                <span>Question Précédente</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-[#eae7e7] text-xs">←</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#eae7e7]">
                <span>Marquer / Démarquer question</span>
                <kbd className="px-2 py-0.5 rounded bg-white border border-[#eae7e7] text-xs">F</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-semibold hover:bg-[#7a2f15]"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
