import React, { useState } from 'react';
import { TabType } from '../types';
import { OFFICIAL_CERTIFICATIONS, OFFICIAL_DOMAINS } from '../data/mockData';
import {
  LayoutDashboard,
  FileQuestion,
  BarChart3,
  Terminal,
  Calendar,
  Layers,
  BookMarked,
  Award,
  Compass,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Flame,
  Network,
  FileX2,
} from 'lucide-react';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeCertId: string;
  onSelectCertification: (certId: string) => void;
  onSelectDomainFlashcards: (domainId: number) => void;
  onLaunchDomainDrill: (domainId: number) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeCertId,
  onSelectCertification,
  onSelectDomainFlashcards,
  onLaunchDomainDrill,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [certsExpanded, setCertsExpanded] = useState(true);
  const [domainsExpanded, setDomainsExpanded] = useState(true);

  const activeCert =
    OFFICIAL_CERTIFICATIONS.find((c) => c.id === activeCertId) || OFFICIAL_CERTIFICATIONS[0];

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      id: 'daily-challenge' as TabType,
      label: 'Daily Challenge (15 min)',
      icon: Flame,
    },
    {
      id: 'study-plan' as TabType,
      label: 'Plan de Révision (Coach)',
      icon: Calendar,
    },
    {
      id: 'architecture-cases' as TabType,
      label: 'Architecture Cases (Design)',
      icon: Network,
    },
    {
      id: 'skills-badges' as TabType,
      label: 'Niveaux & Badges (MCP)',
      icon: Award,
    },
    {
      id: 'exam' as TabType,
      label: 'Examen Blanc',
      icon: FileQuestion,
    },
    {
      id: 'scorecard' as TabType,
      label: 'Scorecard & Diagnostic',
      icon: BarChart3,
    },
    {
      id: 'my-mistakes' as TabType,
      label: 'My Mistakes (127)',
      icon: FileX2,
    },
    {
      id: 'lab' as TabType,
      label: 'Lab Pratique & Prompts',
      icon: Terminal,
    },
    {
      id: 'flashcards' as TabType,
      label: 'Flashcards Mémos (2 000)',
      icon: Layers,
    },
    {
      id: 'encyclopedia' as TabType,
      label: 'Glossaire & Encyclopédie',
      icon: BookMarked,
    },
  ];

  return (
    <>
      {/* Backdrop when hamburger drawer is open */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-[#1c1b1b]/50 z-40 backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#f6f3f2] z-50 flex flex-col justify-between py-5 px-4 border-r border-[#eae7e7] shadow-[0_1px_12px_rgba(0,0,0,0.05)] transition-transform duration-300 overflow-y-auto lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-5">
          {/* Logo Area + Close Button on Mobile/Drawer */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                onSelectTab('dashboard');
                onCloseMobile?.();
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#d97757] flex items-center justify-center shadow-xs shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path
                    d="M12 2L13.8 8.7C14.4 10.9 16.1 12.6 18.3 13.2L25 15L18.3 16.8C16.1 17.4 14.4 19.1 13.8 21.3L12 28L10.2 21.3C9.6 19.1 7.9 17.4 5.7 16.8L-1 15L5.7 13.2C7.9 12.6 9.6 10.9 10.2 8.7L12 2Z"
                    transform="scale(0.85) translate(2, 2)"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-headline text-[19px] text-[#1c1b1b] font-semibold tracking-tight leading-tight">
                  Claude Architect
                </span>
                <span className="font-mono text-[10px] text-[#99462a] uppercase tracking-widest font-semibold">
                  {activeCert.code} • {activeCert.level}
                </span>
              </div>
            </div>

            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[#55433d] hover:bg-[#eae7e7] transition-colors"
                aria-label="Fermer le menu"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Preparation Status Bar for Active Certification */}
          <div className="bg-[#f0eded] p-3 rounded-xl flex flex-col gap-1.5 border border-[#eae7e7]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#55433d] uppercase tracking-wider truncate">
                {activeCert.shortTitle}
              </span>
              <span className="font-mono text-[11px] text-[#99462a] font-bold shrink-0">
                {activeCert.readinessPercentage}% Prêt
              </span>
            </div>
            <div className="w-full bg-[#eae7e7] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#99462a] h-full rounded-full transition-all duration-500"
                style={{ width: `${activeCert.readinessPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-[#88726c] pt-0.5">
              <span>{activeCert.questionsCount} questions</span>
              <span>·</span>
              <span>{activeCert.durationMinutes} min</span>
              <span>·</span>
              <span>Seuil {activeCert.passingScore}</span>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col gap-0.5">
            <span className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-[#88726c] font-semibold">
              Navigation
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile?.();
                  }}
                  type="button"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] transition-colors font-medium ${
                    isActive
                      ? 'bg-[#d97757] text-white font-semibold shadow-xs'
                      : 'text-[#55433d] hover:bg-[#eae7e7] hover:text-[#1c1b1b]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#88726c]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Section 1: Les Différentes Certifications */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#eae7e7]">
            <button
              onClick={() => setCertsExpanded((prev) => !prev)}
              type="button"
              className="flex items-center justify-between px-2 py-1 text-left group"
            >
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#99462a]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                  Certifications ({OFFICIAL_CERTIFICATIONS.length})
                </span>
              </div>
              {certsExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#88726c]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#88726c]" />
              )}
            </button>

            {certsExpanded && (
              <div className="flex flex-col gap-1">
                {OFFICIAL_CERTIFICATIONS.map((cert) => {
                  const isSelected = cert.id === activeCertId;
                  return (
                    <button
                      key={cert.id}
                      onClick={() => {
                        onSelectCertification(cert.id);
                        onSelectTab('dashboard');
                        onCloseMobile?.();
                      }}
                      type="button"
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-all flex flex-col gap-1 border ${
                        isSelected
                          ? 'bg-white border-[#d97757] shadow-2xs'
                          : 'bg-transparent border-transparent hover:bg-[#eae7e7]/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono text-[10px] font-bold text-[#99462a] shrink-0">
                            {cert.code}
                          </span>
                          <span className="text-[#dbc1b9]">·</span>
                          <span className="font-mono text-[10px] text-[#88726c] truncate">
                            {cert.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono text-[10px] font-semibold text-[#55433d]">
                            {cert.readinessPercentage}%
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-[#99462a]" />}
                        </div>
                      </div>
                      <span className="text-[12px] font-medium text-[#1c1b1b] leading-snug truncate">
                        {cert.shortTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Les 5 Domaines Officiels du Syllabus */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#eae7e7]">
            <button
              onClick={() => setDomainsExpanded((prev) => !prev)}
              type="button"
              className="flex items-center justify-between px-2 py-1 text-left group"
            >
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#99462a]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#99462a] font-bold">
                  5 Domaines du Syllabus
                </span>
              </div>
              {domainsExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-[#88726c]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[#88726c]" />
              )}
            </button>

            {domainsExpanded && (
              <div className="flex flex-col gap-1">
                {OFFICIAL_DOMAINS.map((domain) => {
                  const certWeight =
                    activeCert.domainWeights.find((w) => w.domainId === domain.id)?.weight ?? 20;
                  return (
                    <div
                      key={domain.id}
                      className="px-2.5 py-2 rounded-lg bg-[#f0eded]/70 hover:bg-[#eae7e7] transition-colors flex flex-col gap-1.5 border border-[#eae7e7]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] font-bold text-[#99462a]">
                          0{domain.id}. {domain.shortTitle || domain.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#55433d] font-semibold">
                          {domain.percentage}%
                        </span>
                      </div>

                      <div className="w-full bg-[#e5e2e1] h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            domain.percentage < 70
                              ? 'bg-[#ba1a1a]'
                              : domain.percentage < 80
                              ? 'bg-[#fc8d66]'
                              : 'bg-[#99462a]'
                          }`}
                          style={{ width: `${domain.percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <span className="font-mono text-[9px] text-[#88726c]">
                          Poids {certWeight}% · 100 cartes
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              onSelectDomainFlashcards(domain.id);
                              onCloseMobile?.();
                            }}
                            type="button"
                            className="font-mono text-[9px] text-[#99462a] hover:underline font-semibold"
                          >
                            Cartes
                          </button>
                          <span className="text-[#dbc1b9] text-[9px]">·</span>
                          <button
                            onClick={() => {
                              onLaunchDomainDrill(domain.id);
                              onCloseMobile?.();
                            }}
                            type="button"
                            className="font-mono text-[9px] text-[#55433d] hover:text-[#1c1b1b] hover:underline font-semibold"
                          >
                            Drill
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Exam Countdown & Profile */}
        <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-[#eae7e7]">
          <div className="bg-[#f0eded] p-2.5 rounded-xl flex items-center justify-between border border-[#eae7e7]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#99462a]" />
              <span className="font-mono text-[11px] text-[#55433d] tracking-wide">
                Épreuve {activeCert.code}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#99462a] font-bold">
              J-12
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
