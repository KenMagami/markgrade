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

export { signInWithPopup, signOut, onAuthStateChanged };
export type { User };
