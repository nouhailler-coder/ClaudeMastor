import React, { useState } from 'react';
import { TabType, TrickyQuestion } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExamSimulatorView } from './components/ExamSimulatorView';
import { ScorecardView } from './components/ScorecardView';
import { LabPracticeView } from './components/LabPracticeView';
import { FlashcardsView } from './components/FlashcardsView';
import { EncyclopediaView } from './components/EncyclopediaView';
import { ConceptModal } from './components/ConceptModal';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [activeCertId, setActiveCertId] = useState<string>('cca-f100');
  const [activeQuestionId, setActiveQuestionId] = useState<number>(24);
  const [activeTrickyQuestion, setActiveTrickyQuestion] = useState<TrickyQuestion | null>(null);
  const [activeFlashcardId, setActiveFlashcardId] = useState<number | null>(null);
  const [activeFlashcardDomainId, setActiveFlashcardDomainId] = useState<number | 'all'>('all');
  const [activeEncyclopediaArticleId, setActiveEncyclopediaArticleId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleStartExam = () => {
    setActiveQuestionId(24);
    setCurrentTab('exam');
  };

  const handleFinishExam = () => {
    setCurrentTab('scorecard');
  };

  const handleQuickDrill = () => {
    setActiveQuestionId(42);
    setCurrentTab('exam');
  };

  const handleLaunchDrill = (domainId: number) => {
    // Jump to a question in that domain
    const targetQ = domainId === 5 ? 42 : domainId === 3 ? 24 : domainId === 2 ? 27 : 18;
    setActiveQuestionId(targetQ);
    setCurrentTab('exam');
  };

  const handleSelectDomainFlashcards = (domainId: number) => {
    setActiveFlashcardId(null);
    setActiveFlashcardDomainId(domainId);
    setCurrentTab('flashcards');
  };

  const handleRetestConcept = (question: TrickyQuestion) => {
    setActiveTrickyQuestion(question);
  };

  const handleOpenEncyclopedia = (articleId: string) => {
    setActiveEncyclopediaArticleId(articleId);
    setCurrentTab('encyclopedia');
  };

  const handleOpenFlashcard = (cardId: number) => {
    setActiveFlashcardId(cardId);
    setCurrentTab('flashcards');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] flex flex-col font-body">
        {/* Primary Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          activeCertId={activeCertId}
          onSelectCertification={(certId) => setActiveCertId(certId)}
          onSelectDomainFlashcards={handleSelectDomainFlashcards}
          onLaunchDomainDrill={handleLaunchDrill}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Top Application Header */}
        <Header
          activeCertId={activeCertId}
          onSelectCertification={(certId) => setActiveCertId(certId)}
          onSelectDomainFlashcards={handleSelectDomainFlashcards}
          onLaunchDomainDrill={handleLaunchDrill}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onStartExam={handleStartExam}
          onQuickDrill={handleQuickDrill}
          onOpenHelp={() => setIsMobileMenuOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Main Content Area */}
        <main className="lg:pl-72 pt-16 flex-1 flex flex-col">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
            {currentTab === 'dashboard' && (
              <DashboardView
                activeCertId={activeCertId}
                onSelectCertification={(certId) => setActiveCertId(certId)}
                onSelectDomainFlashcards={handleSelectDomainFlashcards}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onRetestConcept={handleRetestConcept}
                onLaunchDrill={handleLaunchDrill}
              />
            )}

            {currentTab === 'exam' && (
              <ExamSimulatorView
                key={activeQuestionId}
                initialQuestionId={activeQuestionId}
                onFinishExam={handleFinishExam}
              />
            )}

            {currentTab === 'scorecard' && (
              <ScorecardView
                onStartRetest={() => {
                  setActiveQuestionId(42);
                  setCurrentTab('exam');
                }}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'lab' && <LabPracticeView />}

            {currentTab === 'flashcards' && (
              <FlashcardsView
                activeCertId={activeCertId}
                onSelectCertification={(certId) => setActiveCertId(certId)}
                initialCardId={activeFlashcardId}
                initialDomainId={activeFlashcardDomainId}
                onOpenEncyclopedia={handleOpenEncyclopedia}
              />
            )}

            {currentTab === 'encyclopedia' && (
              <EncyclopediaView
                initialArticleId={activeEncyclopediaArticleId}
                onOpenFlashcard={handleOpenFlashcard}
              />
            )}
          </div>
        </main>

        {/* Flash Concept Practice Modal */}
        <ConceptModal
          question={activeTrickyQuestion}
          onClose={() => setActiveTrickyQuestion(null)}
          onSuccess={() => {}}
        />
      </div>
    </AuthProvider>
  );
}
