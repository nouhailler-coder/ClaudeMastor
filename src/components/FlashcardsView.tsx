import React, { useState, useEffect, useMemo } from 'react';
import { OFFICIAL_FLASHCARDS, getFlashcardsByCertification } from '../data/flashcardsData';
import { OFFICIAL_CERTIFICATIONS } from '../data/mockData';
import { getRelatedArticleForFlashcard } from '../data/encyclopediaData';
import { Flashcard, EncyclopediaArticle } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveFlashcardStatus, loadUserFlashcardProgress } from '../firebase';
import {
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Shuffle,
  Sparkles,
  BookOpen,
  Layers,
  ExternalLink,
  Flame,
  Check,
  RefreshCw,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  BookMarked,
  CloudCheck,
  Cloud,
  Award,
} from 'lucide-react';

interface FlashcardsViewProps {
  activeCertId?: string;
  onSelectCertification?: (certId: string) => void;
  initialCardId?: number | null;
  initialDomainId?: number | 'all';
  onOpenEncyclopedia: (articleId: string) => void;
}

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'review' | 'mastered'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardStatus, setCardStatus] = useState<Record<number, 'mastered' | 'review' | 'unread'>>({});
  const [shuffledOrder, setShuffledOrder] = useState<number[] | null>(null);
  const [showQuickArticleDrawer, setShowQuickArticleDrawer] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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

  // Load progress from Firestore whenever user changes
  useEffect(() => {
    if (currentUser) {
      setIsSyncing(true);
      loadUserFlashcardProgress(currentUser.uid)
        .then((progress) => {
          if (progress && Object.keys(progress).length > 0) {
            setCardStatus(progress);
          }
        })
        .finally(() => setIsSyncing(false));
    }
  }, [currentUser]);

  const certDeck = useMemo(() => {
    return getFlashcardsByCertification(selectedCertId);
  }, [selectedCertId]);

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
          setStatusFilter('all');
          setSearchQuery('');
          setCurrentIndex(targetIdx);
          setIsFlipped(true); // Automatically show answer & encyclopedia link
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

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((c) => {
        const s = cardStatus[c.id];
        return s === statusFilter;
      });
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
  }, [certDeck, selectedDomain, statusFilter, searchQuery, cardStatus, shuffledOrder]);

  // Adjust index if filtered list changes
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [filteredCards.length, currentIndex]);

  const currentCard = filteredCards[currentIndex] || certDeck[0];
  const relatedArticle: EncyclopediaArticle | undefined = currentCard
    ? getRelatedArticleForFlashcard(currentCard.id, currentCard.relatedArticleId)
    : undefined;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    setShowQuickArticleDrawer(false);
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

  const markStatus = (status: 'mastered' | 'review') => {
    if (!currentCard) return;
    setCardStatus((prev) => ({
      ...prev,
      [currentCard.id]: status,
    }));
    if (currentUser) {
      saveFlashcardStatus(currentUser.uid, currentCard.id, currentCard.domainId, status);
    }
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
    setStatusFilter('all');
    setSearchQuery('');
    setCardStatus({});
    setCurrentIndex(0);
  };

  // Keyboard navigation
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
      } else if (e.key === '1' && isFlipped) {
        markStatus('review');
      } else if (e.key === '2' && isFlipped) {
        markStatus('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, filteredCards]);

  const totalMastered = certDeck.filter((c) => cardStatus[c.id] === 'mastered').length;
  const totalReview = certDeck.filter((c) => cardStatus[c.id] === 'review').length;

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
              {activeCertMeta.code} • 500 Flashcards (100 / Domaine)
            </span>
            <span className="text-[#88726c]">
              · Liées au Glossaire & à l'Encyclopédie IA
            </span>
            {currentUser && (
              <span className="text-[#2e7d32] flex items-center gap-1 font-semibold">
                · <Cloud className="w-3.5 h-3.5" />
                {isSyncing ? 'Sync Firestore...' : 'Sauvegardé sur le Cloud'}
              </span>
            )}
          </div>
          <h1 className="font-headline text-[30px] lg:text-[36px] text-[#1c1b1b] font-bold tracking-tight">
            Flashcards — {activeCertMeta.title}
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#55433d] mt-0.5 max-w-3xl">
            Banque dédiée de 500 cartes de révision (100 flashcards par domaine officiel du syllabus) pour la certification {activeCertMeta.code}.
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
            title="Réinitialiser tous les filtres et statuts"
            type="button"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#88726c]" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </section>

      {/* Certification Deck Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {[
          {
            id: 'cca-f100',
            code: 'CCA-F100',
            title: 'Architect Foundations',
            subtitle: '500 Flashcards (#1 à #500 • 100/domaine)',
            level: 'Foundations',
          },
          {
            id: 'cca-p200',
            code: 'CCA-P200',
            title: 'Agentic Systems & MCP Engineer',
            subtitle: '500 Flashcards (#1001 à #1500 • 100/domaine)',
            level: 'Professional',
          },
          {
            id: 'cca-s300',
            code: 'CCA-S300',
            title: 'Enterprise Security & AI Governance',
            subtitle: '500 Flashcards (#2001 à #2500 • 100/domaine)',
            level: 'Specialty',
          },
          {
            id: 'cca-e400',
            code: 'CCA-E400',
            title: 'Principal LLM Infra & FinOps',
            subtitle: '500 Flashcards (#3001 à #3500 • 100/domaine)',
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
      <div className="bg-[#f6f3f2] rounded-2xl p-3.5 mb-6 border border-[#eae7e7] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
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

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${
                statusFilter === 'all'
                  ? 'bg-white border-[#99462a] text-[#99462a] font-bold shadow-xs'
                  : 'bg-white/60 border-[#eae7e7] text-[#55433d] hover:bg-white'
              }`}
            >
              Toutes ({filteredCards.length})
            </button>
            <button
              onClick={() => setStatusFilter('mastered')}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                statusFilter === 'mastered'
                  ? 'bg-white border-[#99462a] text-[#99462a] font-bold shadow-xs'
                  : 'bg-white/60 border-[#eae7e7] text-[#55433d] hover:bg-white'
              }`}
            >
              <CheckCircle className="w-3 h-3 text-[#99462a]" />
              <span>Maîtrisées ({totalMastered})</span>
            </button>
            <button
              onClick={() => setStatusFilter('review')}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                statusFilter === 'review'
                  ? 'bg-white border-[#ba1a1a] text-[#ba1a1a] font-bold shadow-xs'
                  : 'bg-white/60 border-[#eae7e7] text-[#55433d] hover:bg-white'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-[#ba1a1a]" />
              <span>À revoir ({totalReview})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Flashcard Container */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#eae7e7] my-4 flex flex-col items-center gap-3">
          <Layers className="w-8 h-8 text-[#88726c]" />
          <h3 className="font-headline text-[20px] text-[#1c1b1b]">Aucune flashcard trouvée</h3>
          <p className="text-[14px] text-[#55433d]">
            Aucune carte ne correspond à vos filtres actuels.
          </p>
          <button
            onClick={handleReset}
            className="mt-2 px-4 py-2 rounded-xl bg-[#99462a] text-white font-mono text-[12px] font-semibold"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
          {/* Progress Tracker Strip */}
          <div className="flex items-center justify-between font-mono text-[12px] px-1">
            <div className="flex items-center gap-2 text-[#55433d]">
              <span>Carte</span>
              <strong className="text-[#1c1b1b] text-[14px]">
                {currentIndex + 1}
              </strong>
              <span>sur</span>
              <strong>{filteredCards.length}</strong>
              <span className="text-[#88726c] text-[11px]">
                (Syllabus #{currentCard.id}/500)
              </span>
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
            <div className="flex items-center justify-between gap-2 border-b pb-3 border-[#eae7e7]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#ffdbd0] text-[#7a2f15] font-bold uppercase tracking-wider">
                  {currentCard.domainCode}
                </span>
                <span className="font-mono text-[11px] text-[#55433d]">
                  {currentCard.topic}
                </span>
              </div>

              <div className="flex items-center gap-2">
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
                    <span>Cliquer ou appuyer sur [Espace] pour révéler la réponse</span>
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
                            <span>{relatedArticle.relatedFlashcardIds.length} flashcards associées à ce traité</span>
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
              <span>{isFlipped ? 'Verso (Réponse explicative)' : 'Recto (Question d\'examen)'}</span>
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

          {/* Self-Assessment Grading Buttons (visible when flipped) */}
          {isFlipped && (
            <div className="flex items-center justify-center gap-4 animate-in fade-in duration-200">
              <button
                onClick={() => markStatus('review')}
                className="flex-1 max-w-[220px] py-3 rounded-2xl bg-white hover:bg-[#ffdad6] text-[#ba1a1a] font-mono text-[12px] font-bold border border-[#ffdad6] shadow-xs transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <AlertCircle className="w-4 h-4" />
                <span>À revoir [Touche 1]</span>
              </button>

              <button
                onClick={() => markStatus('mastered')}
                className="flex-1 max-w-[220px] py-3 rounded-2xl bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[12px] font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <Check className="w-4 h-4" />
                <span>Bien maîtrisé [Touche 2]</span>
              </button>
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

          {/* Quick Jump Palette Matrix */}
          <div className="bg-[#f6f3f2] p-4 rounded-2xl border border-[#eae7e7] mt-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] text-[#88726c]">
              <span className="uppercase font-bold text-[#1c1b1b]">
                Matrice d'Accès Rapide ({filteredCards.length} cartes affichées)
              </span>
              <span>Cliquez sur une vignette pour l'ouvrir</span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredCards.map((card, idx) => {
                const isCurrent = idx === currentIndex;
                const status = cardStatus[card.id];

                let statusBg = 'bg-white border-[#eae7e7] text-[#55433d] hover:border-[#dbc1b9]';
                if (isCurrent) {
                  statusBg = 'bg-[#99462a] text-white border-[#99462a] font-bold shadow-xs scale-105 z-10';
                } else if (status === 'mastered') {
                  statusBg = 'bg-[#ffdbd0]/60 border-[#ffb59e] text-[#7a2f15] font-semibold';
                } else if (status === 'review') {
                  statusBg = 'bg-[#ffdad6] border-[#ba1a1a]/30 text-[#ba1a1a] font-semibold';
                }

                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      setIsFlipped(false);
                      setShowQuickArticleDrawer(false);
                      setCurrentIndex(idx);
                    }}
                    title={`#${card.id} - ${card.topic}`}
                    className={`h-9 rounded-lg border flex items-center justify-center font-mono text-[11px] transition-all ${statusBg}`}
                  >
                    <span>{card.id}</span>
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
