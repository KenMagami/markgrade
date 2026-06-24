import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { ArchiveData } from './types';

const firebaseConfig = {
  projectId: "ai-studio-applet-webapp-96401",
  appId: "1:694756739735:web:a92ee66fafd7ae777c77d2",
  apiKey: "AIzaSyBMjJim2hJz-TOD0CHssbJPU9sL-mezYxk",
  authDomain: "ai-studio-applet-webapp-96401.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-807f41ae-1d16-48cf-ac08-8a75cbda826b",
  storageBucket: "ai-studio-applet-webapp-96401.firebasestorage.app",
  messagingSenderId: "694756739735"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Standard Super-Administrator Email (Cannot be locked out)
export const SUPER_ADMIN_EMAIL = "kenmagami1003@gmail.com";

/**
 * Checks if a given email is allowed to access the application.
 */
export async function isEmailAllowed(email: string | null): Promise<boolean> {
  if (!email) return false;
  
  // Super admin is always allowed
  if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }

  try {
    const docRef = doc(db, 'allowed_users', email.toLowerCase());
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking allowed email:", error);
    // Fallback: If network fails or first load before DB exists, still allow super admin
    return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  }
}

/**
 * Retrieves the list of all allowed emails.
 */
export async function getAllowedEmails(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'allowed_users'));
    const emails: string[] = [SUPER_ADMIN_EMAIL];
    querySnapshot.forEach((doc) => {
      const email = doc.id;
      if (email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
        emails.push(email);
      }
    });
    return Array.from(new Set(emails));
  } catch (error) {
    console.error("Error fetching allowed emails:", error);
    return [SUPER_ADMIN_EMAIL];
  }
}

/**
 * Adds an email to the allowed list.
 */
export async function addAllowedEmail(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return;
  const docRef = doc(db, 'allowed_users', cleanEmail);
  await setDoc(docRef, {
    addedAt: new Date().toISOString(),
    allowed: true
  });
}

/**
 * Removes an email from the allowed list.
 */
export async function removeAllowedEmail(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return;
  if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
    throw new Error("スーパー管理者のアカウントは削除できません。");
  }
  const docRef = doc(db, 'allowed_users', cleanEmail);
  await deleteDoc(docRef);
}

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Fetches all sessions for a specific user from Firestore.
 */
export async function getUserSessions(userId: string): Promise<ArchiveData[]> {
  const path = `users/${userId}/sessions`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const sessions: ArchiveData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Clean rawAnswers answers keys to handle any key type mismatch
      const cleanedRawAnswers = (data.rawAnswers || []).map((ans: any) => {
        const cleanedAnswers: Record<number, string> = {};
        if (ans.answers) {
          Object.keys(ans.answers).forEach(k => {
            cleanedAnswers[Number(k)] = ans.answers[k];
          });
        }
        return {
          ...ans,
          answers: cleanedAnswers
        };
      });

      sessions.push({
        id: data.id || doc.id,
        timestamp: data.timestamp || "",
        name: data.name || "",
        results: data.results || [],
        questions: data.questions || [],
        students: data.students || [],
        rawAnswers: cleanedRawAnswers,
        isArchived: data.isArchived || false,
        rangeSlots: data.rangeSlots || []
      });
    });
    
    // Sort by timestamp or updatedAt descending
    return sessions.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Saves or updates a session for a specific user in Firestore.
 */
export async function saveUserSession(userId: string, session: ArchiveData): Promise<void> {
  const path = `users/${userId}/sessions`;
  const docRef = doc(db, path, session.id);
  
  // Transform rawAnswers keys to strings for safe Firestore serialization
  const serializedRawAnswers = (session.rawAnswers || []).map(ans => {
    const stringAnswers: Record<string, string> = {};
    if (ans.answers) {
      Object.keys(ans.answers).forEach(k => {
        stringAnswers[String(k)] = ans.answers[Number(k)];
      });
    }
    return {
      ...ans,
      answers: stringAnswers
    };
  });

  const docPayload = {
    id: session.id,
    timestamp: session.timestamp,
    name: session.name,
    results: session.results,
    questions: session.questions,
    students: session.students,
    rawAnswers: serializedRawAnswers,
    isArchived: session.isArchived || false,
    rangeSlots: session.rangeSlots || [],
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(docRef, docPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${session.id}`);
  }
}

/**
 * Deletes a session for a specific user from Firestore.
 */
export async function deleteUserSession(userId: string, sessionId: string): Promise<void> {
  const path = `users/${userId}/sessions`;
  const docRef = doc(db, path, sessionId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${sessionId}`);
  }
}

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
