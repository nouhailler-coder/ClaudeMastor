import React, { useState } from 'react';
import {
  Verified,
  Zap,
  Play,
  HelpCircle,
  Menu,
  LogOut,
  Cloud,
  CloudOff,
  Award,
  Compass,
  ChevronDown,
  Check,
  X,
  Layers,
  FileX2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OFFICIAL_CERTIFICATIONS, OFFICIAL_DOMAINS } from '../data/mockData';
import { TabType } from '../types';

interface HeaderProps {
  activeCertId: string;
  onSelectCertification: (certId: string) => void;
  onSelectDomainFlashcards: (domainId: number) => void;
  onLaunchDomainDrill: (domainId: number) => void;
  onNavigateTab: (tab: TabType) => void;
  onStartExam: () => void;
  onQuickDrill: () => void;
  onOpenHelp: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCertId,
  onSelectCertification,
  onSelectDomainFlashcards,
  onLaunchDomainDrill,
  onNavigateTab,
  onStartExam,
  onQuickDrill,
  onOpenHelp,
  onToggleMobileMenu,
}) => {
  const { currentUser, signIn, signOut, loading } = useAuth();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  const activeCert =
    OFFICIAL_CERTIFICATIONS.find((c) => c.id === activeCertId) || OFFICIAL_CERTIFICATIONS[0];

  const handleHamburgerClick = () => {
    if (window.innerWidth < 1024) {
      onToggleMobileMenu();
    } else {
      setIsQuickMenuOpen((prev) => !prev);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#fcf9f8]/95 backdrop-blur-md border-b border-[#eae7e7] shadow-[0_1px_8px_rgba(0,0,0,0.02)] z-30 flex items-center justify-between px-4 sm:px-6">
        {/* Left: Hamburger button + Active Certification Selector + Cloud Sync */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleHamburgerClick}
            className="p-2 rounded-lg text-[#55433d] hover:bg-[#f0eded] hover:text-[#1c1b1b] transition-colors border border-[#eae7e7] bg-white"
            aria-label="Menu Certifications & Domaines"
            title="Menu Certifications & 5 Domaines du Syllabus"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsQuickMenuOpen((prev) => !prev)}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f0eded] hover:bg-[#eae7e7] border border-[#eae7e7] transition-colors"
            title="Changer de parcours de certification ou de domaine"
          >
            <Verified className="w-4 h-4 text-[#99462a]" />
            <span className="font-mono text-[11px] text-[#99462a] uppercase font-bold tracking-wider">
              {activeCert.code}
            </span>
            <span className="text-[#dbc1b9] hidden sm:inline">·</span>
            <span className="font-mono text-[11px] text-[#1c1b1b] font-medium hidden sm:inline">
              {activeCert.shortTitle}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#88726c]" />
          </button>

          {/* Cloud Sync indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-[#55433d]">
            {currentUser ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-[#2e7d32]" />
                <span className="text-[#2e7d32] font-semibold">Firestore Actif</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-[#88726c]" />
                <span>Mode Local</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Quick actions, Google Auth & controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('daily-challenge')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fff8f5] text-[#99462a] hover:bg-[#ffdbd0]/60 transition-colors font-mono text-[12px] font-bold border border-[#f5dad0]"
              type="button"
              title="Today's Challenge — 15 minutes · 5 questions"
            >
              <Zap className="w-4 h-4 text-[#d97757] fill-[#d97757]" />
              <span>Daily Challenge</span>
            </button>

            <button
              onClick={() => onNavigateTab('my-mistakes')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fff5f5] text-[#ba1a1a] hover:bg-[#ffebeb] transition-colors font-mono text-[12px] font-bold border border-[#ffdad6]"
              type="button"
              title="My Mistakes — 127 erreurs analysées"
            >
              <FileX2 className="w-4 h-4 text-[#ba1a1a]" />
              <span>My Mistakes (127)</span>
            </button>

            <button
              onClick={onStartExam}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#99462a] text-white hover:bg-[#7a2f15] transition-all font-mono text-[12px] font-semibold shadow-xs"
              type="button"
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="hidden xs:inline">Lancer Examen</span>
              <span className="xs:hidden">Examen</span>
            </button>
          </div>

          <div className="h-5 w-px bg-[#eae7e7] mx-1 hidden sm:block" />

          {/* Google Authentication Section */}
          {!loading &&
            (currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-[#eae7e7] shadow-xs">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Utilisateur'}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#99462a] text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-mono text-[11px] text-[#1c1b1b] max-w-[100px] truncate hidden md:inline">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-[#88726c] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                  title="Se déconnecter"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#f0eded] text-[#1c1b1b] font-mono text-[11px] font-semibold border border-[#eae7e7] shadow-xs transition-colors"
                title="Se connecter avec Google pour synchroniser votre progression"
                type="button"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Connexion Google</span>
                <span className="sm:hidden">Connexion</span>
              </button>
            ))}

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg text-[#55433d] hover:text-[#1c1b1b] hover:bg-[#f0eded] transition-colors"
            title="Aide & Raccourcis"
            type="button"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hamburger / Quick Menu Popover for Certifications & 5 Domains */}
      {isQuickMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-start pt-16 lg:pl-72">
          <div
            className="fixed inset-0 bg-[#1c1b1b]/30 backdrop-blur-2xs"
            onClick={() => setIsQuickMenuOpen(false)}
          />
          <div className="relative z-10 m-4 w-full max-w-3xl bg-[#fcf9f8] border border-[#eae7e7] rounded-2xl shadow-xl p-6 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#eae7e7]">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                  Menu Rapide Architecte
                </span>
                <h3 className="font-headline text-[22px] text-[#1c1b1b] font-semibold">
                  Certifications Officielles & 5 Domaines du Syllabus
                </h3>
              </div>
              <button
                onClick={() => setIsQuickMenuOpen(false)}
                type="button"
                className="p-1.5 rounded-lg text-[#55433d] hover:bg-[#f0eded]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
              {/* Left column: 4 Certifications */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#99462a]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#1c1b1b] font-bold">
                    4 Parcours de Certification Anthropic
                  </span>
                </div>
                {OFFICIAL_CERTIFICATIONS.map((cert) => {
                  const isSelected = cert.id === activeCertId;
                  return (
                    <button
                      key={cert.id}
                      type="button"
                      onClick={() => {
                        onSelectCertification(cert.id);
                        onNavigateTab('dashboard');
                        setIsQuickMenuOpen(false);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-white border-[#99462a] shadow-xs'
                          : 'bg-[#f6f3f2] border-[#eae7e7] hover:bg-[#f0eded]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="font-bold text-[#99462a]">{cert.code}</span>
                          <span className="text-[#dbc1b9]">·</span>
                          <span className="text-[#55433d]">{cert.level}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#1c1b1b]">
                            {cert.readinessPercentage}% prêt
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#99462a]" />}
                        </div>
                      </div>
                      <span className="font-headline text-[16px] text-[#1c1b1b] font-semibold">
                        {cert.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#88726c]">
                        {cert.questionsCount} questions · {cert.durationMinutes} min · Seuil{' '}
                        {cert.passingScore}/1000
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right column: 5 Syllabus Domains */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#99462a]" />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#1c1b1b] font-bold">
                    5 Domaines Officiels du Syllabus
                  </span>
                </div>
                {OFFICIAL_DOMAINS.map((domain) => (
                  <div
                    key={domain.id}
                    className="p-3 rounded-xl bg-[#f6f3f2] border border-[#eae7e7] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#99462a]">
                        {domain.code} · Poids {domain.weight}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#1c1b1b]">
                        {domain.percentage}% maîtrisé
                      </span>
                    </div>
                    <span className="font-headline text-[15px] text-[#1c1b1b] font-semibold leading-snug">
                      {domain.title}
                    </span>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDomainFlashcards(domain.id);
                          setIsQuickMenuOpen(false);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-white hover:bg-[#f0eded] border border-[#eae7e7] font-mono text-[11px] text-[#99462a] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>100 Flashcards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLaunchDomainDrill(domain.id);
                          setIsQuickMenuOpen(false);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#99462a] hover:bg-[#7a2f15] text-white font-mono text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Drill ({domain.questionsCount} Qs)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
