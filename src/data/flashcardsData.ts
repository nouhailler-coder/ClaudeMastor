import { Flashcard } from '../types';
import { DOMAIN_1_FLASHCARDS } from './flashcards/domain1';
import { DOMAIN_2_FLASHCARDS } from './flashcards/domain2';
import { DOMAIN_3_FLASHCARDS } from './flashcards/domain3';
import { DOMAIN_4_FLASHCARDS } from './flashcards/domain4';
import { DOMAIN_5_FLASHCARDS } from './flashcards/domain5';
import { CCA_P200_FLASHCARDS } from './flashcards/ccaP200Flashcards';
import { CCA_S300_FLASHCARDS } from './flashcards/ccaS300Flashcards';
import { CCA_E400_FLASHCARDS } from './flashcards/ccaE400Flashcards';

// 500 Flashcards for CCA-F100 (Claude Certified Architect — Foundations)
export const CCA_F100_FLASHCARDS: Flashcard[] = [
  ...DOMAIN_1_FLASHCARDS, // Cards 1-100 (Domaine 01 : Architecture LLM & Context Windows)
  ...DOMAIN_2_FLASHCARDS, // Cards 101-200 (Domaine 02 : Prompt Engineering Avancé)
  ...DOMAIN_3_FLASHCARDS, // Cards 201-300 (Domaine 03 : Tool Use & Multi-Agents)
  ...DOMAIN_4_FLASHCARDS, // Cards 301-400 (Domaine 04 : Sécurité & Constitutional AI)
  ...DOMAIN_5_FLASHCARDS, // Cards 401-500 (Domaine 05 : Coûts, Latence & Production)
].map((card) => ({ ...card, certificationId: 'cca-f100' }));

export { CCA_P200_FLASHCARDS, CCA_S300_FLASHCARDS, CCA_E400_FLASHCARDS };

// Complete bank of all flashcards across all 4 certifications (2000 flashcards total)
export const OFFICIAL_FLASHCARDS: Flashcard[] = [
  ...CCA_F100_FLASHCARDS, // IDs 1-500 (CCA-F100)
  ...CCA_P200_FLASHCARDS, // IDs 1001-1500 (CCA-P200)
  ...CCA_S300_FLASHCARDS, // IDs 2001-2500 (CCA-S300)
  ...CCA_E400_FLASHCARDS, // IDs 3001-3500 (CCA-E400)
];

export function getFlashcardsByCertification(certId: string): Flashcard[] {
  if (certId === 'cca-p200') {
    return CCA_P200_FLASHCARDS;
  }
  if (certId === 'cca-s300') {
    return CCA_S300_FLASHCARDS;
  }
  if (certId === 'cca-e400') {
    return CCA_E400_FLASHCARDS;
  }
  return CCA_F100_FLASHCARDS;
}
