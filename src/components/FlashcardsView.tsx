import React, { useState, useEffect, useMemo } from 'react';
import { OFFICIAL_FLASHCARDS, getFlashcardsByCertification } from '../data/flashcardsData';
import { OFFICIAL_CERTIFICATIONS } from '../data/mockData';
import { getRelatedArticleForFlashcard } from '../data/encyclopediaData';
import {
  Flashcard,
  EncyclopediaArticle,
  SRSCardRecord,
  SRSRating,
  SRSStage,
} from '../types';
import { useAuth } from '../context/AuthContext';
import { saveFlashcardStatus, loadUserSRSProgress } from '../firebase';
import { updateResumeCheckpoint } from '../utils/resumeEngine';
import {
  SRS_STAGE_META,
  SRS_RATING_OPTIONS,
  SRS_INTERVAL_LADDER,
  computeNextSRSState,
  formatIntervalLabel,
  isCardDueForReview,
  getDaysUntilDue,
  loadLocalSRSRecords,
  saveLocalSRSRecord,
  resetLocalSRSRecords,
} from '../utils/srsEngine';
import {
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Shuffle,
  Layers,
  ExternalLink,
  Flame,
  Check,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  BookMarked,
  Cloud,
  Award,
  Clock,
  Calendar,
  Zap,
  CornerDownLeft,
} from 'lucide-react';

interface FlashcardsViewProps {
  activeCertId?: string;
  onSelectCertification?: (certId: string) => void;
  initialCardId?: number | null;
  initialDomainId?: number | 'all';
  onOpenEncyclopedia: (articleId: string) => void;
}

type StageFilterType = 'all' | 'due' | SRSStage;

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  activeCertId = 'cca-f100',
  onSelectCertification,
  initialCardId,
  initialDomainId,
  onOpenEncyclopedia,
}) => {
  const { currentUser } = useAuth();
  const [selectedCertId, setSelectedCertId] = useState<string>(
    activeCertId === 'cca-p200' || activeCertId === 'cca-s300' || activeCertId === 'cca-e400'
      ? activeCertId
      : 'cca-f100'
  );
  const [selectedDomain, setSelectedDomain] = useState<number | 'all'>(initialDomainId || 'all');
  const [stageFilter, setStageFilter] = useState<StageFilterType>('all');
  const [intervalFilter, setIntervalFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [srsRecords, setSrsRecords] = useState<Record<number, SRSCardRecord>>(() =>
    loadLocalSRSRecords()
  );
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);
  const [showQuickArticleDrawer, setShowQuickArticleDrawer] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastTransitionBanner, setLastTransitionBanner] = useState<{
    cardId: number;
    fromStage: SRSStage;
    toStage: SRSStage;
    intervalDays: number;
    ratingLabel: string;
  } | null>(null);

  // Sync selectedCertId when activeCertId changes in parent
  useEffect(() => {
    if (
      activeCertId === 'cca-p200' ||
      activeCertId === 'cca-s300' ||
      activeCertId === 'cca-e400' ||
      activeCertId === 'cca-f100'
    ) {
      setSelectedCertId(activeCertId);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShuffledOrder(null);
    }
  }, [activeCertId]);

  // Sync selectedDomain when initialDomainId prop changes
  useEffect(() => {
    if (initialDomainId !== undefined) {
      setSelectedDomain(initialDomainId);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [initialDomainId]);

  // Load SRS progress from Firestore whenever user signs in
  useEffect(() => {
    if (currentUser) {
      setIsSyncing(true);
      loadUserSRSProgress(currentUser.uid)
        .then((remoteProgress) => {
          if (remoteProgress && Object.keys(remoteProgress).length > 0) {
            setSrsRecords((prev) => {
              const merged = { ...prev, ...remoteProgress };
              return merged;
            });
          }
        })
        .finally(() => setIsSyncing(false));
    }
  }, [currentUser]);

  const certDeck = useMemo(() => {
    return getFlashcardsByCertification(selectedCertId);
  }, [selectedCertId]);

  // Helper to get SRS stage of any card in current deck
  const getCardStage = (cardId: number): SRSStage => {
    return srsRecords[cardId]?.stage || 'new';
  };

  // Jump to initialCardId if provided
  useEffect(() => {
    if (initialCardId) {
      const targetCard = OFFICIAL_FLASHCARDS.find((c) => c.id === initialCardId);
      if (targetCard) {
        const targetCert = targetCard.certificationId || 'cca-f100';
        setSelectedCertId(targetCert);
        const deck = getFlashcardsByCertification(targetCert);
        const targetIdx = deck.findIndex((c) => c.id === initialCardId);
        if (targetIdx !== -1) {
          setSelectedDomain('all');
          setStageFilter('all');
          setIntervalFilter('all');
          setSearchQuery('');
          setCurrentIndex(targetIdx);
          setIsFlipped(true);
        }
      }
    }
  }, [initialCardId]);

  // Compute filtered cards list
  const filteredCards = useMemo(() => {
    let list = [...certDeck];

    // Domain filter
    if (selectedDomain !== 'all') {
      list = list.filter((c) => c.domainId === selectedDomain);
    }

    // SRS Stage filter
    if (stageFilter === 'due') {
      list = list.filter((c) => isCardDueForReview(srsRecords[c.id]));
    } else if (stageFilter !== 'all') {
      list = list.filter((c) => getCardStage(c.id) === stageFilter);
    }

    // Interval filter (1, 3, 7, 14, 30, 60 days)
    if (intervalFilter !== 'all') {
      list = list.filter((c) => srsRecords[c.id]?.intervalDays === intervalFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.topic.toLowerCase().includes(q) ||
          c.question.toLowerCase().includes(q) ||
          c.keyTakeaway.toLowerCase().includes(q) ||
          c.domainTitle.toLowerCase().includes(q) ||
          c.id.toString() === q
      );
    }

    // Shuffled ordering if active
    if (shuffledOrder) {
      list.sort((a, b) => {
        const idxA = shuffledOrder.indexOf(a.id);
        const idxB = shuffledOrder.indexOf(b.id);
        return idxA - idxB;
      });
    }

    return list;
  }, [certDeck, selectedDomain, stageFilter, intervalFilter, searchQuery, srsRecords, shuffledOrder]);

  // Adjust index if filtered list changes
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [filteredCards.length, currentIndex]);

  const currentCard = filteredCards[currentIndex] || certDeck[0];
  const currentCardSRS: SRSCardRecord | undefined = currentCard
    ? srsRecords[currentCard.id]
    : undefined;
  const currentStage: SRSStage = currentCardSRS?.stage || 'new';
  const currentStageMeta = SRS_STAGE_META[currentStage];
  const currentDaysUntilDue = getDaysUntilDue(currentCardSRS);

  const relatedArticle: EncyclopediaArticle | undefined = currentCard
    ? getRelatedArticleForFlashcard(currentCard.id, currentCard.relatedArticleId)
    : undefined;

  // Precompute the 4 SRS rating outcomes for the current card so each button displays its exact interval & target stage
  const ratingPreviews = useMemo(() => {
    return SRS_RATING_OPTIONS.map((opt) => {
      const outcome = computeNextSRSState(currentCardSRS, opt.rating);
      return {
        ...opt,
        outcome,
        targetStageMeta: SRS_STAGE_META[outcome.nextStage],
      };
    });
  }, [currentCardSRS]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    setShowQuickArticleDrawer(false);
    if (currentCard) {
      updateResumeCheckpoint(
        'flashcards',
        {
          certId: selectedCertId,
          certCode: selectedCertId.toUpperCase(),
          progressPercent: Math.max(
            12,
            Math.round(((currentIndex + 1) / Math.max(1, filteredCards.length)) * 100)
          ),
          lastSessionTitle: currentCard.domainTitle,
          stepProgressLabel: `Carte ${currentIndex + 1} / ${filteredCards.length}`,
          subDetailLabel: `${currentCard.topic} · Palier : ${currentStageMeta.label}`,
          payload: {
            flashcardId: currentCard.id,
            domainId: currentCard.domainId,
          },
        },
        true
      );
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowQuickArticleDrawer(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowQuickArticleDrawer(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
    }
  };

  const handleRateCard = (rating: SRSRating) => {
    if (!currentCard) return;
    const prevStage: SRSStage = srsRecords[currentCard.id]?.stage || 'new';
    const outcome = computeNextSRSState(srsRecords[currentCard.id], rating);
    const ratingOpt = SRS_RATING_OPTIONS.find((r) => r.rating === rating);

    const newRecord: SRSCardRecord = {
      cardId: currentCard.id,
      domainId: currentCard.domainId,
      stage: outcome.nextStage,
      status: outcome.legacyStatus,
      intervalDays: outcome.intervalDays,
      repetitions: outcome.repetitions,
      easeFactor: outcome.easeFactor,
      lastRating: rating,
      nextReviewAt: outcome.nextReviewAt,
      updatedAt: new Date().toISOString(),
    };

    setSrsRecords((prev) => ({
      ...prev,
      [currentCard.id]: newRecord,
    }));
    saveLocalSRSRecord(newRecord);

    if (currentUser) {
      saveFlashcardStatus(
        currentUser.uid,
        currentCard.id,
        currentCard.domainId,
        outcome.legacyStatus,
        {
          stage: outcome.nextStage,
          intervalDays: outcome.intervalDays,
          repetitions: outcome.repetitions,
          easeFactor: outcome.easeFactor,
          lastRating: rating,
          nextReviewAt: outcome.nextReviewAt,
        }
      );
    }

    setLastTransitionBanner({
      cardId: currentCard.id,
      fromStage: prevStage,
      toStage: outcome.nextStage,
      intervalDays: outcome.intervalDays,
      ratingLabel: ratingOpt ? `${ratingOpt.emoji} ${ratingOpt.label}` : rating,
    });

    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowQuickArticleDrawer(false);
    const order = [...certDeck.map((c) => c.id)].sort(() => Math.random() - 0.5);
    setShuffledOrder(order);
    setCurrentIndex(0);
  };

  const handleReset = () => {
    setIsFlipped(false);
    setShowQuickArticleDrawer(false);
    setShuffledOrder(null);
    setSelectedDomain('all');
    setStageFilter('all');
    setIntervalFilter('all');
    setSearchQuery('');
    setLastTransitionBanner(null);
    setCurrentIndex(0);
  };

  // Keyboard shortcuts: Space to flip, Arrows to navigate, 1/2/3/4 for the 4 SRS ratings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (isFlipped) {
        if (e.key === '1') handleRateCard('again');
        else if (e.key === '2') handleRateCard('hard');
        else if (e.key === '3') handleRateCard('good');
        else if (e.key === '4') handleRateCard('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, filteredCards, srsRecords]);

  // Aggregate SRS counts for current certification deck
  const srsCounts = useMemo(() => {
    const counts: Record<SRSStage, number> = {
      new: 0,
      difficult: 0,
      review: 0,
      acquired: 0,
      consolidated: 0,
    };
    let dueCount = 0;
    const byInterval: Record<number, number> = {
      1: 0,
      3: 0,
      7: 0,
      14: 0,
      30: 0,
      60: 0,
    };

    for (const card of certDeck) {
      const rec = srsRecords[card.id];
      const stage: SRSStage = rec?.stage || 'new';
      counts[stage] += 1;
      if (isCardDueForReview(rec)) {
        dueCount += 1;
      }
      if (rec?.intervalDays && byInterval[rec.intervalDays] !== undefined) {
        byInterval[rec.intervalDays] += 1;
      }
    }

    return { counts, dueCount, byInterval };
  }, [certDeck, srsRecords]);

  const activeCertMeta =
    OFFICIAL_CERTIFICATIONS.find((c) => c.id === selectedCertId) || OFFICIAL_CERTIFICATIONS[0];

  const domainTabs =
    selectedCertId === 'cca-p200'
      ? [
          { id: 'all' as const, label: 'Tous les domaines (CCA-P200)', count: 500 },
          { id: 1, label: '01. État Agentique & KV-Cache', count: 100 },
          { id: 2, label: '02. ReAct XML & Orchestration', count: 100 },
          { id: 3, label: '03. Serveurs MCP & Computer Use', count: 100 },
          { id: 4, label: '04. Sandboxing & Gouvernance HITL', count: 100 },
          { id: 5, label: '05. Résilience, FinOps & Evals', count: 100 },
        ]
      : selectedCertId === 'cca-s300'
      ? [
          { id: 'all' as const, label: 'Tous les domaines (CCA-S300)', count: 500 },
          { id: 1, label: '01. Isolation KV-Cache & ZDR', count: 100 },
          { id: 2, label: '02. Prompts Défensifs & XML', count: 100 },
          { id: 3, label: '03. Sécurité MCP & Anti-Exfiltration', count: 100 },
          { id: 4, label: '04. Constitutional AI, HIPAA & RSP', count: 100 },
          { id: 5, label: '05. DLP, SIEM & Anti-DoW', count: 100 },
        ]
      : selectedCertId === 'cca-e400'
      ? [
          { id: 'all' as const, label: 'Tous les domaines (CCA-E400)', count: 500 },
          { id: 1, label: '01. KV-Cache Distribué & Multi-Cloud', count: 100 },
          { id: 2, label: '02. Tokenomics & Compression', count: 100 },
          { id: 3, label: '03. Infra MCP HA & Cache Outils', count: 100 },
          { id: 4, label: '04. Gouvernance FinOps & DRP', count: 100 },
          { id: 5, label: '05. Batch API (-50%), Routing & SLA', count: 100 },
        ]
      : [
          { id: 'all' as const, label: 'Tous les domaines (CCA-F100)', count: 500 },
          { id: 1, label: '01. Architecture & Cache', count: 100 },
          { id: 2, label: '02. Prompt & XML', count: 100 },
          { id: 3, label: '03. Tool Use & MCP', count: 100 },
          { id: 4, label: '04. Sécurité & Alignement', count: 100 },
          { id: 5, label: '05. FinOps & Latence', count: 100 },
        ];

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Header */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap font-mono text-[11px]">
            <span className="text-[#99462a] font-bold uppercase tracking-wider">
              {activeCertMeta.code} • Moteur de Répétition Espacée (SRS)
            </span>
            <span className="text-[#88726c]">
              · 5 Paliers cognitifs & Intervalles adaptatifs (1j à 60j)
            </span>
            {currentUser && (
              <span className="text-[#2e7d32] flex items-center gap-1 font-semibold">
                · <Cloud className="w-3.5 h-3.5" />
                {isSyncing ? 'Sync Firestore...' : 'Sauvegardé sur le Cloud'}
              </span>
            )}
          </div>
          <h1 className="font-headline text-[30px] lg:text-[36px] text-[#1c1b1b] font-bold tracking-tight">
            Flashcards & Répétition Espacée — {activeCertMeta.code}
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#55433d] mt-0.5 max-w-3xl">
            Chaque réponse ajuste dynamiquement l’état de maîtrise de la carte (Nouvelle → Difficile → À revoir → Acquise → Consolidée) et calcule le prochain délai de révision (1, 3, 7, 14, 30 ou 60 jours).
          </p>
        </div>

        {/* Global Action controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#f0eded] text-[#1c1b1b] font-mono text-[12px] font-medium transition-colors border border-[#eae7e7] shadow-xs"
            title="Mélanger aléatoirement les cartes"
            type="button"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#88726c]" />
            <span>Mélanger</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#f0eded] text-[#1c1b1b] font-mono text-[12px] font-medium transition-colors border border-[#eae7e7] shadow-xs"
            title="Réinitialiser les filtres"
            type="button"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#88726c]" />
            <span>Tous les filtres</span>
          </button>
        </div>
      </section>

      {/* Certification Deck Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        {[
          {
            id: 'cca-f100',
            code: 'CCA-F100',
            title: 'Architect Foundations',
            subtitle: '500 Flashcards (#1 à #500)',
            level: 'Foundations',
          },
          {
            id: 'cca-p200',
            code: 'CCA-P200',
            title: 'Agentic Systems & MCP Engineer',
            subtitle: '500 Flashcards (#1001 à #1500)',
            level: 'Professional',
          },
          {
            id: 'cca-s300',
            code: 'CCA-S300',
            title: 'Enterprise Security & AI Governance',
            subtitle: '500 Flashcards (#2001 à #2500)',
            level: 'Specialty',
          },
          {
            id: 'cca-e400',
            code: 'CCA-E400',
            title: 'Principal LLM Infra & FinOps',
            subtitle: '500 Flashcards (#3001 à #3500)',
            level: 'Expert',
          },
        ].map((certTab) => {
          const isCertActive = selectedCertId === certTab.id;
          return (
            <button
              key={certTab.id}
              type="button"
              onClick={() => {
                setSelectedCertId(certTab.id);
                onSelectCertification?.(certTab.id);
                setCurrentIndex(0);
                setIsFlipped(false);
                setShuffledOrder(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                isCertActive
                  ? 'bg-white border-[#99462a] shadow-xs ring-1 ring-[#99462a]/20'
                  : 'bg-[#f6f3f2] border-[#eae7e7] hover:bg-[#f0eded]'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isCertActive ? 'bg-[#99462a] text-white' : 'bg-[#eae7e7] text-[#55433d]'
                  }`}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="font-bold text-[#99462a]">{certTab.code}</span>
                    <span className="text-[#dbc1b9]">·</span>
                    <span className="text-[#55433d] uppercase">{certTab.level}</span>
                  </div>
                  <span className="font-headline text-[16px] text-[#1c1b1b] font-semibold truncate">
                    {certTab.title}
                  </span>
                  <span className="font-mono text-[11px] text-[#88726c] truncate">
                    {certTab.subtitle}
                  </span>
                </div>
              </div>
              {isCertActive && (
                <span className="font-mono text-[10px] text-[#99462a] font-bold shrink-0 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Actif
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SRS State Machine Pipeline & Interval Ladder Panel */}
      <section className="bg-white rounded-2xl border border-[#eae7e7] p-5 mb-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#f0eded]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#99462a]" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                Cycle de Répétition Espacée (SRS) — Cliquez sur un état pour filtrer
              </span>
            </div>
            <p className="text-[12.5px] text-[#55433d] mt-0.5">
              Progression séquentielle : <strong>Nouvelle → Difficile → À revoir → Acquise → Consolidée</strong> (avec rétrogradation directe vers <strong>Difficile</strong> en cas d’oubli ❌).
            </p>
          </div>

          {/* Due Today Quick Filter Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setStageFilter((prev) => (prev === 'due' ? 'all' : 'due'));
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-2 rounded-xl font-mono text-[11px] font-bold border transition-all flex items-center gap-2 ${
                stageFilter === 'due'
                  ? 'bg-[#99462a] text-white border-[#99462a] shadow-xs'
                  : 'bg-[#fff8f5] text-[#99462a] border-[#f5dad0] hover:bg-[#ffdbd0]/40'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>À échéance aujourd’hui ({srsCounts.dueCount})</span>
            </button>
          </div>
        </div>

        {/* 5-Stage Visual State Machine Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 relative">
          {(['new', 'difficult', 'review', 'acquired', 'consolidated'] as SRSStage[]).map(
            (stageKey, idx) => {
              const meta = SRS_STAGE_META[stageKey];
              const count = srsCounts.counts[stageKey];
              const isSelected = stageFilter === stageKey;
              const isCurrentCardStage = currentStage === stageKey;

              const stageIntervalsHint =
                stageKey === 'new'
                  ? 'Non étudiée'
                  : stageKey === 'difficult'
                  ? 'Prochaine : 1 jour'
                  : stageKey === 'review'
                  ? 'Prochaine : 3 à 7 jours'
                  : stageKey === 'acquired'
                  ? 'Prochaine : 7 à 14 jours'
                  : 'Prochaine : 30 à 60 jours';

              return (
                <div key={stageKey} className="relative flex items-stretch">
                  <button
                    type="button"
                    onClick={() => {
                      setStageFilter((prev) => (prev === stageKey ? 'all' : stageKey));
                      setCurrentIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#1c1b1b] text-white border-[#1c1b1b] shadow-sm'
                        : isCurrentCardStage
                        ? 'bg-[#fcf9f8] border-[#99462a] ring-1 ring-[#99462a]/25'
                        : 'bg-[#f6f3f2] border-[#eae7e7] hover:bg-[#f0eded]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected ? 'bg-[#ffb59c]' : meta.dotColor
                          }`}
                        />
                        <span
                          className={`font-mono text-[10px] uppercase tracking-wider font-bold ${
                            isSelected ? 'text-[#ffb59c]' : 'text-[#88726c]'
                          }`}
                        >
                          Étape {idx + 1}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : `${meta.badgeBg} ${meta.badgeText}`
                        }`}
                      >
                        {count}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-headline text-[18px] font-bold leading-tight ${
                            isSelected ? 'text-white' : 'text-[#1c1b1b]'
                          }`}
                        >
                          {meta.label}
                        </span>
                        {idx < 4 && (
                          <ArrowRight
                            className={`w-3.5 h-3.5 hidden sm:inline ${
                              isSelected ? 'text-[#ffb59c]' : 'text-[#88726c]'
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className={`font-mono text-[10px] block mt-0.5 ${
                          isSelected ? 'text-[#d5c2bc]' : 'text-[#55433d]'
                        }`}
                      >
                        {stageIntervalsHint}
                      </span>
                    </div>
                  </button>
                </div>
              );
            }
          )}
        </div>

        {/* Loop-back indicator & Interval Ladder (1j, 3j, 7j, 14j, 30j, 60j) */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-[#f0eded] text-[11px] font-mono">
          <div className="flex items-center gap-2 text-[#ba1a1a] bg-[#ffdad6]/35 px-3 py-1.5 rounded-lg border border-[#ffdad6]">
            <CornerDownLeft className="w-3.5 h-3.5 shrink-0" />
            <span>
              Boucle de rétrogradation : <strong>Consolidée / Acquise ──► Difficile (1 jour)</strong> si réponse « ❌ Je ne savais pas »
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#88726c] mr-1">Échelle des délais SRS :</span>
            <button
              type="button"
              onClick={() => setIntervalFilter('all')}
              className={`px-2 py-1 rounded-md border transition-colors ${
                intervalFilter === 'all'
                  ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                  : 'bg-[#f6f3f2] text-[#55433d] border-[#eae7e7] hover:bg-[#eae7e7]'
              }`}
            >
              Tous
            </button>
            {SRS_INTERVAL_LADDER.map((days) => {
              const countForInterval = srsCounts.byInterval[days] || 0;
              const isSelected = intervalFilter === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() =>
                    setIntervalFilter((prev) => (prev === days ? 'all' : days))
                  }
                  className={`px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#99462a] text-white border-[#99462a] font-bold'
                      : 'bg-white text-[#1c1b1b] border-[#eae7e7] hover:bg-[#f0eded]'
                  }`}
                  title={`Filtrer les cartes avec un intervalle de révision de ${days} jour(s)`}
                >
                  <span>{days === 1 ? '1 jour' : `${days} jours`}</span>
                  <span
                    className={`text-[10px] px-1 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#f0eded] text-[#88726c]'
                    }`}
                  >
                    {countForInterval}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Domain Selector Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {domainTabs.map((tab) => {
          const isSelected = selectedDomain === tab.id;
          return (
            <button
              key={String(tab.id)}
              onClick={() => {
                setSelectedDomain(tab.id);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-[12px] whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#99462a] text-white border-[#99462a] font-bold shadow-xs'
                  : 'bg-white hover:bg-[#f0eded] text-[#55433d] border-[#eae7e7]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-[#f0eded] text-[#88726c]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Row */}
      <div className="bg-[#f6f3f2] rounded-2xl p-3.5 mb-5 border border-[#eae7e7] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#88726c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            placeholder="Rechercher par mot-clé, concept ou n°..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#eae7e7] text-[13px] text-[#1c1b1b] placeholder-[#88726c] focus:outline-none focus:border-[#99462a] font-body"
          />
        </div>

        {/* Last SRS Transition Feedback Toast */}
        {lastTransitionBanner ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#dbc1b9] text-[11px] font-mono text-[#1c1b1b] shadow-2xs">
            <span className="font-bold text-[#99462a]">Carte #{lastTransitionBanner.cardId} :</span>
            <span>{lastTransitionBanner.ratingLabel}</span>
            <span className="text-[#88726c]">→</span>
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                SRS_STAGE_META[lastTransitionBanner.toStage].badgeBg
              } ${SRS_STAGE_META[lastTransitionBanner.toStage].badgeText}`}
            >
              {SRS_STAGE_META[lastTransitionBanner.toStage].label}
            </span>
            <span className="text-[#55433d]">
              (prochaine révision :{' '}
              <strong>{formatIntervalLabel(lastTransitionBanner.intervalDays)}</strong>)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#88726c]">
            <span>
              Raccourcis verso : <strong className="text-[#1c1b1b]">[1]</strong> ❌ Je ne savais pas ·{' '}
              <strong className="text-[#1c1b1b]">[2]</strong> 🟠 Partiellement ·{' '}
              <strong className="text-[#1c1b1b]">[3]</strong> 🟢 Je savais ·{' '}
              <strong className="text-[#1c1b1b]">[4]</strong> ⚡ Trop facile
            </span>
          </div>
        )}
      </div>

      {/* Main Flashcard Container */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#eae7e7] my-4 flex flex-col items-center gap-3">
          <Layers className="w-8 h-8 text-[#88726c]" />
          <h3 className="font-headline text-[20px] text-[#1c1b1b]">Aucune flashcard trouvée</h3>
          <p className="text-[14px] text-[#55433d]">
            Aucune carte ne correspond à vos filtres SRS ou de recherche actuels.
          </p>
          <button
            onClick={handleReset}
            className="mt-2 px-4 py-2 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-semibold"
          >
            Afficher toutes les cartes
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
          {/* Progress Tracker Strip */}
          <div className="flex items-center justify-between font-mono text-[12px] px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[#55433d]">
              <span>Carte</span>
              <strong className="text-[#1c1b1b] text-[14px]">{currentIndex + 1}</strong>
              <span>sur</span>
              <strong>{filteredCards.length}</strong>
              <span className="text-[#88726c] text-[11px]">(ID #{currentCard.id})</span>
            </div>

            {/* Current Card SRS Status Pill */}
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border ${currentStageMeta.badgeBg} ${currentStageMeta.badgeText} ${currentStageMeta.borderColor}`}
              >
                État SRS : {currentStageMeta.label}
              </span>
              {currentCardSRS && currentCardSRS.intervalDays > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#eae7e7] text-[#55433d] font-mono text-[11px]">
                  Intervalle : <strong>{formatIntervalLabel(currentCardSRS.intervalDays)}</strong>
                  {currentDaysUntilDue !== null && (
                    <>
                      {' '}
                      ·{' '}
                      <span
                        className={
                          currentDaysUntilDue <= 0
                            ? 'text-[#ba1a1a] font-bold'
                            : 'text-[#2e7d32] font-semibold'
                        }
                      >
                        {currentDaysUntilDue <= 0
                          ? 'À échéance aujourd’hui'
                          : `Dans ${currentDaysUntilDue}j`}
                      </span>
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Quick Card Number Input Jump */}
            <div className="flex items-center gap-2 text-[11px] text-[#88726c]">
              <span>Aller au n° :</span>
              <input
                type="number"
                min={1}
                max={filteredCards.length}
                value={currentIndex + 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= filteredCards.length) {
                    setCurrentIndex(val - 1);
                    setIsFlipped(false);
                  }
                }}
                className="w-14 px-2 py-0.5 rounded-md bg-white border border-[#eae7e7] text-center font-mono text-[#1c1b1b] focus:outline-none focus:border-[#99462a]"
              />
            </div>
          </div>

          {/* Interactive Flashcard */}
          <div className="relative min-h-[390px] sm:min-h-[430px] w-full rounded-3xl bg-[#f6f3f2] border border-[#eae7e7] shadow-md hover:border-[#dbc1b9] transition-all p-6 sm:p-8 flex flex-col justify-between select-none">
            {/* Card Top Metadata */}
            <div className="flex items-center justify-between gap-2 border-b pb-3 border-[#eae7e7] flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#ffdbd0] text-[#7a2f15] font-bold uppercase tracking-wider">
                  {currentCard.domainCode}
                </span>
                <span className="font-mono text-[11px] text-[#55433d]">{currentCard.topic}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold ${currentStageMeta.badgeBg} ${currentStageMeta.badgeText}`}
                >
                  {currentStageMeta.label}
                  {currentCardSRS?.intervalDays
                    ? ` • ${formatIntervalLabel(currentCardSRS.intervalDays)}`
                    : ''}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#f0eded] text-[#55433d]">
                  {currentCard.difficulty}
                </span>
                <span className="font-mono text-[11px] text-[#88726c] font-bold">
                  #{currentCard.id}
                </span>
              </div>
            </div>

            {/* Card Content: Recto (Question) or Verso (Answer) */}
            <div className="flex-1 flex flex-col justify-center py-6">
              {!isFlipped ? (
                /* RECTO: QUESTION */
                <div
                  onClick={handleFlip}
                  className="flex flex-col items-center text-center gap-4 cursor-pointer py-4"
                >
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#99462a] font-bold">
                    Question d'Architecture LLM
                  </span>
                  <h2 className="font-headline text-[22px] sm:text-[27px] text-[#1c1b1b] leading-relaxed max-w-2xl font-semibold">
                    "{currentCard.question}"
                  </h2>
                  <div className="flex items-center gap-2 text-[#88726c] font-mono text-[11px] mt-4 bg-white px-3.5 py-1.5 rounded-full border border-[#eae7e7] shadow-xs hover:border-[#99462a]">
                    <RotateCcw className="w-3.5 h-3.5 text-[#99462a]" />
                    <span>Cliquer ou appuyer sur [Espace] pour révéler la réponse & noter (SRS)</span>
                  </div>
                </div>
              ) : (
                /* VERSO: DETAILED ANSWER + ENCYCLOPEDIA CONNECTION */
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex items-start gap-2.5 text-[#99462a]">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-1" />
                    <h3 className="font-headline text-[20px] sm:text-[22px] text-[#1c1b1b] font-bold leading-snug">
                      {currentCard.answerTitle}
                    </h3>
                  </div>

                  <ul className="space-y-2 text-[14px] text-[#55433d] leading-relaxed pl-1">
                    {currentCard.answerBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#99462a] shrink-0 mt-2" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Key Takeaway Callout */}
                  <div className="bg-[#f0eded] p-3.5 rounded-2xl border border-[#eae7e7] flex items-start gap-2.5 mt-1">
                    <Flame className="w-4 h-4 text-[#d97757] shrink-0 mt-0.5 fill-[#d97757]" />
                    <div className="flex flex-col text-[13px]">
                      <span className="font-mono text-[10px] text-[#88726c] uppercase font-bold">
                        Règle d'or de l'Architecte
                      </span>
                      <span className="text-[#1c1b1b] font-medium mt-0.5">
                        {currentCard.keyTakeaway}
                      </span>
                    </div>
                  </div>

                  {/* CONNECTED ENCYCLOPEDIA CALLOUT */}
                  {relatedArticle && (
                    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#dbc1b9] shadow-xs flex flex-col gap-2.5 mt-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <BookMarked className="w-4 h-4 text-[#99462a]" />
                          <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-[#1c1b1b]">
                            Encyclopédie IA & Traité Connecté
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-[#7a2f15] bg-[#ffdbd0] px-2 py-0.5 rounded-full font-bold">
                          {relatedArticle.term}
                        </span>
                      </div>

                      <p className="text-[12px] text-[#55433d] leading-relaxed">
                        {relatedArticle.shortDefinition}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#f0eded]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowQuickArticleDrawer(!showQuickArticleDrawer);
                          }}
                          className="font-mono text-[11px] text-[#88726c] hover:text-[#1c1b1b] flex items-center gap-1 transition-colors"
                        >
                          {showQuickArticleDrawer ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>Masquer l'aperçu du traité</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>Aperçu rapide du principe</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEncyclopedia(relatedArticle.id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[11px] font-bold shadow-xs transition-colors"
                        >
                          <span>Lire le traité complet</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Expandable In-Card Quick Drawer */}
                      {showQuickArticleDrawer && (
                        <div className="mt-2 p-3 bg-[#f6f3f2] rounded-xl border border-[#eae7e7] text-[12px] text-[#55433d] flex flex-col gap-2 animate-in fade-in duration-150">
                          <div className="flex items-start gap-2 text-[#1c1b1b]">
                            <Flame className="w-3.5 h-3.5 text-[#d97757] shrink-0 mt-0.5" />
                            <span className="font-semibold">
                              {relatedArticle.architecturePrinciple}
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-[#88726c] flex items-center justify-between pt-1 border-t border-[#eae7e7]">
                            <span>
                              {relatedArticle.relatedFlashcardIds.length} flashcards associées à ce traité
                            </span>
                            <span
                              onClick={() => onOpenEncyclopedia(relatedArticle.id)}
                              className="text-[#99462a] hover:underline cursor-pointer font-bold"
                            >
                              Ouvrir la page complète →
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Doc Reference */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#88726c] pt-2 border-t border-[#eae7e7]">
                    <span>Source officielle : {currentCard.docRef}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#99462a]" />
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between text-[12px] font-mono text-[#88726c] pt-3 border-t border-[#eae7e7]">
              <span>
                {isFlipped
                  ? 'Verso — Évaluez votre rappel ci-dessous pour planifier la prochaine révision'
                  : "Recto (Question d'examen)"}
              </span>
              <button
                onClick={handleFlip}
                type="button"
                className="hover:text-[#99462a] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'Revenir à la question' : 'Retourner'}</span>
              </button>
            </div>
          </div>

          {/* 4-Button SRS Self-Assessment Engine (visible when flipped) */}
          {isFlipped && (
            <div className="bg-white rounded-2xl p-4 border-2 border-[#99462a]/25 shadow-sm flex flex-col gap-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#99462a]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#99462a] font-bold">
                    Moteur SRS — Comment avez-vous su cette carte ?
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#55433d]">
                  État actuel : <strong>{currentStageMeta.label}</strong>
                  {currentCardSRS?.intervalDays
                    ? ` (${formatIntervalLabel(currentCardSRS.intervalDays)})`
                    : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {ratingPreviews.map((item) => (
                  <button
                    key={item.rating}
                    onClick={() => handleRateCard(item.rating)}
                    type="button"
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 text-left shadow-2xs cursor-pointer ${item.buttonBg} ${item.buttonHover} ${item.buttonText} ${item.buttonBorder}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[15px] font-bold flex items-center gap-1.5">
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </span>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          item.rating === 'good' || item.rating === 'easy'
                            ? 'bg-white/20 text-white'
                            : 'bg-[#f6f3f2] text-[#55433d]'
                        }`}
                      >
                        [{item.shortcut}]
                      </span>
                    </div>

                    <div
                      className={`pt-2 border-t flex flex-col gap-0.5 font-mono text-[11px] ${
                        item.rating === 'good' || item.rating === 'easy'
                          ? 'border-white/20 text-white/95'
                          : 'border-[#eae7e7] text-[#55433d]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Nouvel état :</span>
                        <strong className="uppercase">{item.targetStageMeta.label}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Prochaine révision :</span>
                        <strong className="underline decoration-dotted">
                          {formatIntervalLabel(item.outcome.intervalDays)}
                        </strong>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Carousel Bottom Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#f0eded] text-[#1c1b1b] font-mono text-[12px] font-semibold border border-[#eae7e7] shadow-xs transition-colors"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Précédente</span>
            </button>

            <button
              onClick={handleFlip}
              className="px-5 py-2.5 rounded-xl bg-[#f0eded] hover:bg-[#eae7e7] text-[#1c1b1b] font-mono text-[12px] font-medium border border-[#eae7e7] transition-colors flex items-center gap-2"
              type="button"
            >
              <RotateCcw className="w-4 h-4 text-[#99462a]" />
              <span>{isFlipped ? 'Voir la question' : 'Révéler la réponse'}</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-semibold shadow-xs transition-colors"
              type="button"
            >
              <span>Suivante</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Jump Palette Matrix with 5-stage SRS colors & intervals */}
          <div className="bg-[#f6f3f2] p-4 rounded-2xl border border-[#eae7e7] mt-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-[#88726c]">
              <span className="uppercase font-bold text-[#1c1b1b]">
                Matrice SRS d'Accès Rapide ({filteredCards.length} cartes affichées)
              </span>
              <div className="flex items-center gap-3 flex-wrap text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-white border border-[#eae7e7]" />
                  Nouvelle
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#ffdad6] border border-[#ba1a1a]/40" />
                  Difficile (1j)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#fff3e0] border border-[#ffb74d]" />
                  À revoir (3-7j)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#ffdbd0] border border-[#d97757]" />
                  Acquise (7-14j)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#e8f5e9] border border-[#2e7d32]/40" />
                  Consolidée (30-60j)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredCards.map((card, idx) => {
                const isCurrent = idx === currentIndex;
                const rec = srsRecords[card.id];
                const stage: SRSStage = rec?.stage || 'new';

                let statusBg = 'bg-white border-[#eae7e7] text-[#55433d] hover:border-[#dbc1b9]';
                if (isCurrent) {
                  statusBg =
                    'bg-[#99462a] text-white border-[#99462a] font-bold shadow-xs scale-105 z-10';
                } else if (stage === 'consolidated') {
                  statusBg = 'bg-[#e8f5e9] border-[#2e7d32]/35 text-[#1b5e20] font-semibold';
                } else if (stage === 'acquired') {
                  statusBg = 'bg-[#ffdbd0]/70 border-[#d97757]/50 text-[#7a2f15] font-semibold';
                } else if (stage === 'review') {
                  statusBg = 'bg-[#fff3e0] border-[#ffb74d] text-[#c65102] font-semibold';
                } else if (stage === 'difficult') {
                  statusBg = 'bg-[#ffdad6] border-[#ba1a1a]/35 text-[#ba1a1a] font-semibold';
                }

                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      setIsFlipped(false);
                      setShowQuickArticleDrawer(false);
                      setCurrentIndex(idx);
                    }}
                    title={`#${card.id} - ${card.topic} [${SRS_STAGE_META[stage].label}${
                      rec?.intervalDays ? ` • ${rec.intervalDays}j` : ''
                    }]`}
                    className={`h-10 rounded-lg border flex flex-col items-center justify-center font-mono leading-none transition-all ${statusBg}`}
                  >
                    <span className="text-[11px]">{card.id}</span>
                    {rec?.intervalDays ? (
                      <span
                        className={`text-[8.5px] mt-0.5 ${
                          isCurrent ? 'text-[#ffdbd0]' : 'opacity-75'
                        }`}
                      >
                        {rec.intervalDays}j
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
