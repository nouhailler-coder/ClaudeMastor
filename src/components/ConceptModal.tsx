import React, { useState } from 'react';
import { TrickyQuestion } from '../types';
import { AITutorFeedback } from './AITutorFeedback';
import { CheckCircle, XCircle, RotateCcw, X, BookOpen, ArrowRight } from 'lucide-react';

interface ConceptModalProps {
  question: TrickyQuestion | null;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export const ConceptModal: React.FC<ConceptModalProps> = ({
  question,
  onClose,
  onSuccess,
}) => {
  if (!question) return null;

  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [attemptedOptionIds, setAttemptedOptionIds] = useState<string[]>([]);
  const [isSecondTrySuccess, setIsSecondTrySuccess] = useState(false);

  // Generate 3 realistic options for this concept
  const options = [
    { id: 'opt1', text: question.correctAnswer, isCorrect: true },
    { id: 'opt2', text: question.userAnswer, isCorrect: false },
    { id: 'opt3', text: 'Option non supportée sans garantie formelle SLA', isCorrect: false },
  ].sort((a, b) => (a.id > b.id ? 1 : -1));

  const handleValidate = () => {
    if (!selected) return;
    setSubmitted(true);
    setAttemptedOptionIds((prev) => [...prev, selected]);
    const chosen = options.find((o) => o.id === selected);
    if (chosen?.isCorrect) {
      if (attemptedOptionIds.length > 0) {
        setIsSecondTrySuccess(true);
      }
      onSuccess(question.id);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setSelected(null);
  };

  const selectedOpt = options.find((o) => o.id === selected);
  const isRight = submitted && selectedOpt?.isCorrect;

  return (
    <div className="fixed inset-0 bg-[#1c1b1b]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#f6f3f2] max-w-lg w-full rounded-2xl p-6 border border-[#eae7e7] shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-[#eae7e7]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-[#99462a] text-white px-2 py-0.5 rounded font-bold uppercase">
              {question.domainTag}
            </span>
            <span className="font-mono text-[11px] text-[#88726c]">Flash Concept Review · AI Tutor</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#88726c] hover:bg-[#f0eded] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-[20px] text-[#1c1b1b] font-semibold leading-snug">
            {question.title}
          </h3>
          <p className="text-[14px] text-[#55433d] leading-relaxed">
            {question.description}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {options.map((opt) => {
            const isPicked = selected === opt.id;
            const hasBeenAttempted = attemptedOptionIds.includes(opt.id);
            const isWrongAttempt = hasBeenAttempted && !opt.isCorrect;

            let borderStyle = 'bg-white border-[#eae7e7] hover:border-[#dbc1b9]';
            if (submitted) {
              if (opt.isCorrect) {
                borderStyle = 'bg-[#f2faf3] border-[#2e7d32] text-[#1b5e20] font-semibold';
              } else if (isPicked && !opt.isCorrect) {
                borderStyle = 'bg-[#ffdad6] border-[#ba1a1a] text-[#ba1a1a]';
              }
            } else if (isWrongAttempt) {
              borderStyle = 'bg-[#f6f3f2]/60 border-[#eae7e7] opacity-65';
            } else if (isPicked) {
              borderStyle = 'bg-[#ffdbd0]/30 border-[#99462a] shadow-xs';
            }

            return (
              <div
                key={opt.id}
                onClick={() => !submitted && setSelected(opt.id)}
                className={`p-3.5 rounded-xl border text-[13px] cursor-pointer transition-all flex items-start gap-3 ${borderStyle}`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    isPicked ? 'border-[#99462a] bg-[#99462a] text-white' : isWrongAttempt ? 'border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a]' : 'border-[#dbc1b9]'
                  }`}
                >
                  {isPicked ? (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  ) : isWrongAttempt ? (
                    <span className="text-[10px] font-bold">✗</span>
                  ) : null}
                </div>
                <div className="flex flex-col flex-1">
                  <span className="leading-snug">{opt.text}</span>
                  {isWrongAttempt && !submitted && (
                    <span className="font-mono text-[11px] text-[#ba1a1a] mt-0.5">
                      (Essai précédent écarté par l’indice)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Tutor Socratic Feedback */}
        {submitted && selected && (
          <AITutorFeedback
            questionId={question.id}
            questionText={`${question.title} : ${question.description}`}
            selectedOptionId={selected}
            selectedOptionText={selectedOpt?.text || ''}
            correctOptionId={options.find((o) => o.isCorrect)?.id || 'opt1'}
            correctOptionText={question.correctAnswer}
            fullExplanation={`La réponse correcte est : "${question.correctAnswer}". Ce concept est un pilier de la certification et prévient les erreurs de conception en production.`}
            domainName={question.domainTag}
            isSecondTrySuccess={isSecondTrySuccess}
            onRetry={handleRetry}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#eae7e7]">
          {!submitted ? (
            <button
              onClick={handleValidate}
              disabled={!selected}
              className="px-5 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] disabled:opacity-50 text-white font-mono text-[12px] font-bold shadow-xs transition-all cursor-pointer"
            >
              Valider ma réponse
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold shadow-xs transition-all cursor-pointer"
            >
              Fermer et continuer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
