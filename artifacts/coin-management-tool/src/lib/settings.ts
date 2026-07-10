import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AppSettings {
  referralLink: string;
}

const SETTINGS_DOC = doc(db, 'settings', 'config');

const DEFAULT_SETTINGS: AppSettings = {
  referralLink: import.meta.env.VITE_REFERRAL_LINK || 'https://your-game-link.com',
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    if (snap.exists()) {
      const data = snap.data() as Partial<AppSettings>;
      return { ...DEFAULT_SETTINGS, ...data };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load app settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateAppSettings(values: Partial<AppSettings>): Promise<void> {
  await setDoc(SETTINGS_DOC, values, { merge: true });
}
