import React, { useState } from 'react';
import { IntelligentReadiness, TabType } from '../types';
import {
  computeIntelligentReadiness,
  saveStoredReadiness,
} from '../utils/readinessEngine';
import {
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Gauge,
  HelpCircle,
  Target,
} from 'lucide-react';

interface ReadinessScoreWidgetProps {
  initialReadiness: IntelligentReadiness;
  onNavigateTab: (tab: TabType) => void;
  variant?: 'hero' | 'compact' | 'detailed';
  onLaunchDrill?: (domainId: number) => void;
}

export const ReadinessScoreWidget: React.FC<ReadinessScoreWidgetProps> = ({
  initialReadiness,
  onNavigateTab,
  variant = 'hero',
  onLaunchDrill,
}) => {
  const [readiness, setReadiness] = useState<IntelligentReadiness>(initialReadiness);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simValues, setSimValues] = useState({
    knowledge: initialReadiness.dimensions.knowledge.score,
    retention: initialReadiness.dimensions.retention.score,
    speed: initialReadiness.dimensions.speed.score,
    practice: initialReadiness.dimensions.practice.score,
    mockExams: initialReadiness.dimensions.mockExams.score,
  });

  const handleSimChange = (key: keyof typeof simValues, val: number) => {
    const next = { ...simValues, [key]: val };
    setSimValues(next);
    const updated = computeIntelligentReadiness(readiness.certId, next);
    setReadiness(updated);
    saveStoredReadiness(updated);
  };

  const handleResetSimulation = () => {
    const defaults = computeIntelligentReadiness(readiness.certId);
    setSimValues({
      knowledge: defaults.dimensions.knowledge.score,
      retention: defaults.dimensions.retention.score,
      speed: defaults.dimensions.speed.score,
      practice: defaults.dimensions.practice.score,
      mockExams: defaults.dimensions.mockExams.score,
    });
    setReadiness(defaults);
    saveStoredReadiness(defaults);
  };

  const confidenceBadgeMeta = {
    faible: {
      bg: 'bg-[#ffdad6]',
      text: 'text-[#ba1a1a]',
      border: 'border-[#ffb4ab]',
      dot: 'bg-[#ba1a1a]',
      label: 'Confiance : Faible',
    },
    moyenne: {
      bg: 'bg-[#fff4e5]',
      text: 'text-[#b25e00]',
      border: 'border-[#ffd8a8]',
      dot: 'bg-[#d97706]',
      label: 'Confiance : Moyenne',
    },
    élevée: {
      bg: 'bg-[#e8f5e9]',
      text: 'text-[#1b5e20]',
      border: 'border-[#c8e6c9]',
      dot: 'bg-[#2e7d32]',
      label: 'Confiance : Élevée',
    },
    'très élevée': {
      bg: 'bg-[#e0f2f1]',
      text: 'text-[#004d40]',
      border: 'border-[#b2dfdb]',
      dot: 'bg-[#00796b]',
      label: 'Confiance : Très Élevée',
    },
  }[readiness.confidence];

  const dimensionsList = [
    { key: 'knowledge' as const, data: readiness.dimensions.knowledge, icon: '🧠', help: 'Quiz & syllabus' },
    { key: 'retention' as const, data: readiness.dimensions.retention, icon: '🔄', help: 'Répétition SRS' },
    { key: 'speed' as const, data: readiness.dimensions.speed, icon: '⚡', help: 'Rythme & cadence' },
    { key: 'practice' as const, data: readiness.dimensions.practice, icon: '🏗️', help: 'Design d’architecture' },
    { key: 'mockExams' as const, data: readiness.dimensions.mockExams, icon: '🎓', help: 'Simulations 60 Qs' },
  ];

  return (
    <div className="w-full rounded-3xl bg-white border-2 border-[#99462a]/25 p-6 sm:p-7 shadow-xs flex flex-col gap-6 font-body">
      {/* Top Header: Badge, Title & Simulator Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0eded]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#99462a] uppercase tracking-wider font-bold">
            <Gauge className="w-4 h-4 text-[#99462a]" />
            <span>Moteur d'évaluation multidimensionnel · Indice de préparation réel</span>
          </div>
          <h2 className="font-headline text-[26px] sm:text-[30px] text-[#1c1b1b] font-bold tracking-tight">
            Readiness Score Intelligent
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSimulatorOpen((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isSimulatorOpen
                ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] shadow-xs'
                : 'bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#55433d] border-[#eae7e7]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isSimulatorOpen ? 'Fermer le simulateur' : 'Simuler des scores'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (5 cols): Exact READINESS Hero Display asked by user */}
        <div className="lg:col-span-5 rounded-2xl bg-[#1c1b1b] text-white p-6 flex flex-col justify-between gap-6 shadow-sm">
          {/* Header & Score Display */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="uppercase tracking-widest text-[#ffb59c] font-bold">
                READINESS
              </span>
              <span className="text-[#d5c2bc]">{readiness.certCode}</span>
            </div>

            {/* Ascii-style separator */}
            <div className="text-[#ffb59c]/50 font-mono text-[12px] tracking-tighter leading-none select-none">
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            </div>

            {/* 78 / 100 Score Hero */}
            <div className="flex items-baseline justify-center py-2 gap-2">
              <span className="font-headline text-[58px] sm:text-[68px] font-bold text-white tracking-tight leading-none">
                {readiness.globalScore}
              </span>
              <span className="font-mono text-[22px] text-[#ffb59c] font-bold">
                / {readiness.maxScore}
              </span>
            </div>

            {/* 5 Dimensions breakdown with direct numbers (Connaissances 84, Rétention 76, etc.) */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10 font-mono text-[13px]">
              {dimensionsList.map((dim) => (
                <div
                  key={dim.key}
                  className="flex items-center justify-between text-[#f5dad0] hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">{dim.icon}</span>
                    <span className="font-sans font-medium text-white">{dim.data.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-white/15 h-1.5 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-[#ffb59c] h-full rounded-full transition-all duration-300"
                        style={{ width: `${dim.data.score}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#ffb59c] w-7 text-right">
                      {dim.data.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Badge & Core Pedagogical Rationale */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#d5c2bc] uppercase tracking-wider">
                Indice de fiabilité :
              </span>
              <div
                className={`px-3 py-1 rounded-full text-[11.5px] font-mono font-bold flex items-center gap-2 border ${confidenceBadgeMeta.bg} ${confidenceBadgeMeta.text} ${confidenceBadgeMeta.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${confidenceBadgeMeta.dot}`} />
                <span>{confidenceBadgeMeta.label}</span>
              </div>
            </div>

            {/* User's exact prompt quote highlighted */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[12.5px] text-[#f5dad0] italic leading-relaxed">
              « {readiness.confidenceReason} »
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Pedagogical Diagnostics, Asymmetry Analysis & Dimension Cards */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          {/* Diagnostic Note: Why this score is smart */}
          <div className="p-4 rounded-2xl bg-[#fff8f5] border border-[#ffdad6] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#99462a] font-mono text-[11.5px] font-bold">
              <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
              <span>Pourquoi le Readiness Score ne se résume pas aux bonnes réponses ?</span>
            </div>
            <p className="text-[13px] text-[#55433d] leading-relaxed">
              {readiness.confidenceDetail}
            </p>
          </div>

          {/* 5 Interactive Dimension Cards with Target & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dimensionsList.map((dim) => {
              const isBelowTarget = dim.data.score < dim.data.targetScore;
              return (
                <div
                  key={dim.key}
                  className="p-3.5 rounded-2xl bg-[#fcf9f8] border border-[#eae7e7] hover:border-[#dbc1b9] transition-all flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[16px]">{dim.icon}</span>
                      <span className="font-semibold text-[13.5px] text-[#1c1b1b]">
                        {dim.data.label}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[12.5px] font-bold px-2 py-0.5 rounded-md ${
                        dim.data.score >= 80
                          ? 'bg-[#e8f5e9] text-[#1b5e20]'
                          : dim.data.score >= 72
                          ? 'bg-[#fff4e5] text-[#b25e00]'
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}
                    >
                      {dim.data.score} / 100
                    </span>
                  </div>

                  <p className="text-[11.5px] text-[#55433d] leading-snug">
                    {dim.data.detail}
                  </p>

                  <div className="pt-2 border-t border-[#f0eded] flex items-center justify-between font-mono text-[10.5px] text-[#88726c]">
                    <span>Pondération : {dim.data.weight}%</span>
                    <span className={isBelowTarget ? 'text-[#b25e00] font-semibold' : 'text-[#2e7d32]'}>
                      {isBelowTarget
                        ? `Objectif ${dim.data.targetScore} (+${dim.data.targetScore - dim.data.score})`
                        : `Objectif ${dim.data.targetScore} ✓`}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Asymmetry / Bottleneck Spotlight Card */}
            {readiness.asymmetryAlert && (
              <div className="p-3.5 rounded-2xl bg-[#fffbf5] border border-[#ffd8a8] flex flex-col justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[#b25e00] font-mono text-[11px] font-bold">
                  <ShieldAlert className="w-4 h-4 text-[#d97706]" />
                  <span>Alerte d’Asymétrie de Compétence</span>
                </div>
                <p className="text-[12px] text-[#78350f] leading-snug font-medium">
                  {readiness.asymmetryAlert.warning}
                </p>
                <div className="pt-2 border-t border-[#fde68a] flex items-center justify-between">
                  <span className="font-mono text-[10.5px] text-[#92400e]">
                    Écart : {readiness.asymmetryAlert.gap} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('architecture-cases')}
                    className="text-[#b25e00] hover:text-[#78350f] font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Combler le gap</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons to train the weak links */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('exam-readiness')}
              className="px-4 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Ouvrir la page « Exam Readiness »</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('architecture-cases')}
              className="px-4 py-2.5 rounded-xl bg-[#1c1b1b] hover:bg-[#33302f] text-white font-mono text-[12px] font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Atelier Architecture (Cas #027)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ffb59c]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('daily-challenge')}
              className="px-4 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Entraîner la Vitesse (Daily Sprint)</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('scorecard')}
              className="px-4 py-2.5 rounded-xl bg-[#f6f3f2] hover:bg-[#eae7e7] text-[#55433d] font-mono text-[12px] font-semibold border border-[#eae7e7] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Voir le Scorecard Détaillé</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#88726c]" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Drawer / Sliders (Allows user to test the prompt thesis interactively!) */}
      {isSimulatorOpen && (
        <section className="bg-[#fcf9f8] p-5 sm:p-6 rounded-2xl border border-[#dbc1b9] flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[#eae7e7]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#99462a]" />
              <h3 className="font-headline text-[18px] text-[#1c1b1b] font-bold">
                Simulateur de Readiness & Confiance
              </h3>
            </div>
            <button
              type="button"
              onClick={handleResetSimulation}
              className="text-[#88726c] hover:text-[#1c1b1b] font-mono text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Réinitialiser (78 / 100)</span>
            </button>
          </div>

          <p className="text-[12.5px] text-[#55433d]">
            Ajustez les curseurs ci-dessous pour observer comment l'indice de confiance évolue en fonction de l'équilibre entre vos 5 compétences.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {dimensionsList.map((dim) => (
              <div key={dim.key} className="bg-white p-3 rounded-xl border border-[#eae7e7] flex flex-col gap-2">
                <div className="flex items-center justify-between font-mono text-[11.5px]">
                  <span className="font-semibold text-[#1c1b1b]">{dim.data.label}</span>
                  <span className="font-bold text-[#99462a]">{simValues[dim.key]}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={simValues[dim.key]}
                  onChange={(e) => handleSimChange(dim.key, parseInt(e.target.value, 10))}
                  className="w-full accent-[#99462a] cursor-pointer"
                />
                <span className="font-mono text-[10px] text-[#88726c] truncate">
                  {dim.help}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
