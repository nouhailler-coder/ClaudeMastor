import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence noisy internal WebChannel retry warnings in restricted proxy/iframe networks
setLogLevel('silent');

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with specific database ID and automatic long-polling detection for iframe compatibility
function createFirestoreInstance(): Firestore {
  try {
    return firebaseConfig.firestoreDatabaseId
      ? initializeFirestore(
          app,
          { experimentalAutoDetectLongPolling: true },
          firebaseConfig.firestoreDatabaseId
        )
      : initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
}

export const db = createFirestoreInstance();

// Connection verification as mandated by guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') || error.message.includes('unavailable'))
    ) {
      return false;
    }
    // Any other response means we connected to the server
    return true;
  }
}

// Trigger initial health check when authenticated or after boot
testFirestoreConnection().catch(() => {});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const message = error instanceof Error ? error.message : String(error);
  // Ignore transient network/offline unavailability errors as Firestore SDK queues writes locally
  if (message.includes('unavailable') || message.includes('client is offline')) {
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Authentication helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync user profile to Firestore
    if (result.user) {
      const userPath = `users/${result.user.uid}`;
      const userRef = doc(db, 'users', result.user.uid);
      try {
        await setDoc(
          userRef,
          {
            uid: result.user.uid,
            displayName: (result.user.displayName || 'Architecte Candidat').slice(0, 120),
            email: (result.user.email || '').slice(0, 254),
            photoURL: (result.user.photoURL || '').slice(0, 1024),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, userPath);
      }
    }
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// User flashcard mastery & SRS persistence
export async function saveFlashcardStatus(
  userId: string,
  cardId: number,
  domainId: number,
  status: 'mastered' | 'review' | 'unread',
  srsExtras?: {
    stage?: 'new' | 'difficult' | 'review' | 'acquired' | 'consolidated';
    intervalDays?: number;
    repetitions?: number;
    easeFactor?: number;
    lastRating?: 'again' | 'hard' | 'good' | 'easy';
    nextReviewAt?: string;
  }
): Promise<void> {
  const path = `users/${userId}/flashcardProgress/${cardId}`;
  try {
    const cardRef = doc(db, 'users', userId, 'flashcardProgress', cardId.toString());
    await setDoc(cardRef, {
      uid: userId,
      cardId,
      domainId,
      status,
      ...(srsExtras?.stage ? { stage: srsExtras.stage } : {}),
      ...(srsExtras?.intervalDays !== undefined ? { intervalDays: srsExtras.intervalDays } : {}),
      ...(srsExtras?.repetitions !== undefined ? { repetitions: srsExtras.repetitions } : {}),
      ...(srsExtras?.easeFactor !== undefined ? { easeFactor: srsExtras.easeFactor } : {}),
      ...(srsExtras?.lastRating ? { lastRating: srsExtras.lastRating } : {}),
      ...(srsExtras?.nextReviewAt ? { nextReviewAt: srsExtras.nextReviewAt } : {}),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserFlashcardProgress(
  userId: string
): Promise<Record<number, 'mastered' | 'review' | 'unread'>> {
  const path = `users/${userId}/flashcardProgress`;
  try {
    const progressRef = collection(db, 'users', userId, 'flashcardProgress');
    const snapshot = await getDocs(progressRef);
    const progress: Record<number, 'mastered' | 'review' | 'unread'> = {};
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.cardId && data.status) {
        progress[data.cardId] = data.status;
      }
    });
    return progress;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
}

export async function loadUserSRSProgress(
  userId: string
): Promise<
  Record<
    number,
    {
      cardId: number;
      domainId: number;
      stage: 'new' | 'difficult' | 'review' | 'acquired' | 'consolidated';
      status: 'mastered' | 'review' | 'unread';
      intervalDays: number;
      repetitions: number;
      easeFactor: number;
      lastRating?: 'again' | 'hard' | 'good' | 'easy';
      nextReviewAt: string;
      updatedAt: string;
    }
  >
> {
  const path = `users/${userId}/flashcardProgress`;
  try {
    const progressRef = collection(db, 'users', userId, 'flashcardProgress');
    const snapshot = await getDocs(progressRef);
    const srsMap: Record<number, any> = {};
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.cardId) {
        const fallbackStage =
          data.stage ||
          (data.status === 'mastered' ? 'acquired' : data.status === 'review' ? 'review' : 'new');
        srsMap[data.cardId] = {
          cardId: data.cardId,
          domainId: data.domainId || 1,
          stage: fallbackStage,
          status: data.status || 'unread',
          intervalDays: typeof data.intervalDays === 'number' ? data.intervalDays : fallbackStage === 'acquired' ? 14 : 3,
          repetitions: typeof data.repetitions === 'number' ? data.repetitions : 1,
          easeFactor: typeof data.easeFactor === 'number' ? data.easeFactor : 2.5,
          lastRating: data.lastRating,
          nextReviewAt: data.nextReviewAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      }
    });
    return srsMap;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
}

// Exam score persistence
export async function saveExamAttempt(
  userId: string,
  scoreData: {
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    timeSpentSeconds?: number;
  }
): Promise<void> {
  const attemptId = `attempt_${Date.now()}`;
  const path = `users/${userId}/examAttempts/${attemptId}`;
  try {
    const attemptRef = doc(db, 'users', userId, 'examAttempts', attemptId);
    await setDoc(attemptRef, {
      uid: userId,
      ...scoreData,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
