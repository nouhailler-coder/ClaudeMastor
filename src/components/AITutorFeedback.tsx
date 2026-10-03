import React, { useState } from 'react';
import {
  AI_TUTOR_KNOWLEDGE_BASE,
  generateAITutorDiagnostic,
  AITutorDiagnostic,
} from '../utils/aiTutorEngine';
import {
  Bot,
  RotateCcw,
  Eye,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export interface AITutorFeedbackProps {
  questionId: string | number;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText?: string;
  fullExplanation: string;
  domainName: string;
  isSecondTrySuccess?: boolean;
  onRetry: () => void;
  onContinueNext?: () => void;
}

export const AITutorFeedback: React.FC<AITutorFeedbackProps> = ({
  questionId,
  questionText,
  selectedOptionId,
  selectedOptionText,
  correctOptionId,
  correctOptionText,
  fullExplanation,
  domainName,
  isSecondTrySuccess,
  onRetry,
  onContinueNext,
}) => {
  const isCorrect = selectedOptionId === correctOptionId;
  const [showFullExplanation, setShowFullExplanation] = useState(isCorrect);
  const [activeDialogueQuery, setActiveDialogueQuery] = useState<string | null>(null);

  // Look up specific diagnostic from knowledge base or fallback to generator
  const qKey = String(questionId);
  const knownQuestionMap = AI_TUTOR_KNOWLEDGE_BASE[qKey];
  const diagnostic: AITutorDiagnostic =
    knownQuestionMap && knownQuestionMap[selectedOptionId]
      ? knownQuestionMap[selectedOptionId]
      : generateAITutorDiagnostic(
          questionText,
          selectedOptionText,
          correctOptionId,
          domainName
        );

  // When answer is correct on first or second try
  if (isCorrect) {
    return (
      <div className="rounded-2xl border border-[#2e7d32]/30 bg-[#f2faf3] p-5 shadow-xs flex flex-col gap-3 transition-all animate-fadeIn">
        <div className="flex items-center justify-between border-b border-[#c8e6c9] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2e7d32]" />
            <span className="font-mono text-[12px] font-bold text-[#1b5e20] uppercase tracking-wider">
              {isSecondTrySuccess
                ? '🎉 Bravo ! Deuxième essai validé'
                : '✅ Bonne réponse'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#c8e6c9] font-mono text-[11px] text-[#2e7d32] font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Tutor ClaudeMastor</span>
          </div>
        </div>

        {isSecondTrySuccess && (
          <p className="text-[13.5px] text-[#1b5e20] font-medium leading-relaxed">
            Tu as su identifier la bonne nuance grâce à l’indice socratique. C’est exactement le réflexe méthodologique attendu le jour de l’examen officiel !
          </p>
        )}

        <div className="flex flex-col gap-1.5 pt-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#55433d] font-bold">
            Explication technique complète :
          </span>
          <p className="text-[13.5px] text-[#1c1b1b] leading-relaxed">
            {fullExplanation}
          </p>
        </div>

        {diagnostic.followUpPrompt && (
          <div className="mt-1 p-3 rounded-xl bg-white border border-[#c8e6c9] text-[12.5px] text-[#2e7d32]">
            <strong className="font-mono text-[11px] uppercase block mb-0.5">
              Règle d’or à mémoriser :
            </strong>
            {diagnostic.followUpPrompt}
          </div>
        )}
      </div>
    );
  }

  // INCORRECT ANSWER: Socratic AI Tutor Workflow as requested by user
  return (
    <div className="rounded-2xl border-2 border-[#99462a]/30 bg-[#fff8f5] p-5 sm:p-6 shadow-sm flex flex-col gap-4 transition-all">
      {/* 1. Header: ❌ Incorrect + AI Tutor Badge */}
      <div className="flex items-center justify-between border-b border-[#f5dad0] pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[18px] leading-none" aria-hidden="true">
            ❌
          </span>
          <span className="font-headline text-[18px] sm:text-[20px] font-bold text-[#ba1a1a]">
            Incorrect
          </span>
          <span className="font-mono text-[11px] text-[#88726c] ml-1">
            (Option choisie : {selectedOptionId})
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#f5dad0] shadow-2xs font-mono text-[11px] text-[#99462a] font-bold">
          <Bot className="w-4 h-4 text-[#d97757]" />
          <span>AI Tutor ClaudeMastor</span>
        </div>
      </div>

      {/* 2. Pourquoi ? (Explaining the conceptual confusion directly) */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Pourquoi ?</span>
        </span>
        <p className="font-headline text-[17px] text-[#1c1b1b] font-semibold leading-snug">
          {diagnostic.whyExplanation}
        </p>
      </div>

      {/* 3. Indice (Guiding Socratic Hint) */}
      <div className="p-4 rounded-xl bg-white border border-[#f5dad0] shadow-2xs flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[#d97757] font-mono text-[11px] uppercase tracking-wider font-bold">
          <Lightbulb className="w-4 h-4 text-[#d97757] fill-[#d97757]/20" />
          <span>Indice Socratique</span>
        </div>
        <p className="text-[14px] text-[#1c1b1b] leading-relaxed italic">
          « {diagnostic.socraticHint} »
        </p>
      </div>

      {/* 4. Action: [ Réessaie ] button + [ Voir l'explication complète ] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#f5dad0]">
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réessaie</span>
        </button>

        <button
          type="button"
          onClick={() => setShowFullExplanation((prev) => !prev)}
          className="px-4 py-2 rounded-xl bg-white hover:bg-[#f6f3f2] border border-[#eae7e7] text-[#55433d] hover:text-[#1c1b1b] font-mono text-[11.5px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#88726c]" />
          <span>
            {showFullExplanation
              ? 'Masquer l’explication complète'
              : 'Voir l’explication complète'}
          </span>
          {showFullExplanation ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Interactive Micro-Dialogue with AI Tutor */}
      <div className="pt-2 border-t border-[#f5dad0]/60 flex flex-col gap-2">
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#88726c]">
          Dialogue avec ClaudeMastor :
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() =>
              setActiveDialogueQuery(
                activeDialogueQuery === 'nuance' ? null : 'nuance'
              )
            }
            className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-colors border cursor-pointer ${
              activeDialogueQuery === 'nuance'
                ? 'bg-[#1c1b1b] text-white border-[#1c1b1b]'
                : 'bg-white text-[#55433d] border-[#eae7e7] hover:border-[#dbc1b9]'
            }`}
          >
            💬 La nuance clé d’examen
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveDialogueQuery(
                activeDialogueQuery === 'mnemonic' ? null : 'mnemonic'
              )
            }
            className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-colors border cursor-pointer ${
              activeDialogueQuery === 'mnemonic'
                ? 'bg-[#1c1b1b] text-white border-[#1c1b1b]'
                : 'bg-white text-[#55433d] border-[#eae7e7] hover:border-[#dbc1b9]'
            }`}
          >
            🧠 Moyen mnémotechnique
          </button>
        </div>

        {activeDialogueQuery === 'nuance' && (
          <div className="p-3.5 rounded-xl bg-white border border-[#eae7e7] text-[13px] text-[#1c1b1b] leading-relaxed animate-fadeIn">
            <strong className="text-[#99462a] block mb-1 font-mono text-[11px] uppercase">
              Nuance clé identifiée par l’AI Tutor :
            </strong>
            {diagnostic.followUpPrompt ||
              `À l'examen officiel, le distracteur "${selectedOptionText.slice(0, 45)}..." est fréquemment employé pour tester si le candidat maîtrise la frontière entre contrôle passif et action exécutable.`}
          </div>
        )}

        {activeDialogueQuery === 'mnemonic' && (
          <div className="p-3.5 rounded-xl bg-white border border-[#eae7e7] text-[13px] text-[#1c1b1b] leading-relaxed animate-fadeIn">
            <strong className="text-[#99462a] block mb-1 font-mono text-[11px] uppercase">
              Astuce mnémotechnique ClaudeMastor :
            </strong>
            « <strong>R</strong>esources = <strong>R</strong>ead-only (données passives par URI) · <strong>T</strong>ools = <strong>T</strong>rigger actions (effets de bord actifs commandés par Claude). »
          </div>
        )}
      </div>

      {/* 5. Full explanation expanded only when user asks */}
      {showFullExplanation && (
        <div className="mt-2 p-4 rounded-xl bg-white border border-[#eae7e7] flex flex-col gap-2 text-[13px] leading-relaxed animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#f0eded] pb-2">
            <span className="font-mono text-[11px] uppercase font-bold text-[#99462a]">
              Explication officielle de l’architecture (Réponse : Option {correctOptionId})
            </span>
          </div>
          <p className="text-[#1c1b1b]">{fullExplanation}</p>
        </div>
      )}
    </div>
  );
};
