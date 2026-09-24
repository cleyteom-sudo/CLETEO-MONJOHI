import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Workspace Drive scope configured
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (never stored in localStorage/sessionStorage per skill)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged in to Firebase but token might need refresh on user action
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive OAuth access token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const isDriveConnected = (): boolean => {
  return !!cachedAccessToken && !!auth.currentUser;
};

export interface DriveSyncResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  timestamp: string;
  error?: string;
}

/**
 * Searches for existing file in Google Drive or creates a new one
 */
export async function uploadJsonToGoogleDrive(
  fileName: string,
  data: any,
  tokenOverride?: string
): Promise<DriveSyncResult> {
  const token = tokenOverride || cachedAccessToken;
  if (!token) {
    throw new Error('Google Drive access token is not available. Please sign in to Google Drive first.');
  }

  try {
    // 1. Search if file with this name already exists in user's Drive app folder
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `name = '${fileName}' and trashed = false`
    )}&fields=files(id,name,webViewLink)`;

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const searchData = await searchRes.json();
    const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

    const fileContent = JSON.stringify(data, null, 2);
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: 'English AI SmartTrack Malaysian Primary PBD sync data',
    };

    if (existingFile) {
      // Update existing file
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart&fields=id,name,webViewLink`;
      
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelim;

      const updateRes = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      const updatedData = await updateRes.json();
      return {
        success: true,
        fileId: updatedData.id || existingFile.id,
        fileName: fileName,
        webViewLink:
          updatedData.webViewLink ||
          existingFile.webViewLink ||
          `https://drive.google.com/file/d/${existingFile.id}/view`,
        timestamp: new Date().toLocaleString('en-MY'),
      };
    } else {
      // Create new file
      const createUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink`;
      
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelim = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelim;

      const createRes = await fetch(createUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      });

      const createdData = await createRes.json();
      return {
        success: true,
        fileId: createdData.id,
        fileName: fileName,
        webViewLink:
          createdData.webViewLink ||
          `https://drive.google.com/file/d/${createdData.id}/view`,
        timestamp: new Date().toLocaleString('en-MY'),
      };
    }
  } catch (error: any) {
    console.error('Error uploading to Google Drive:', error);
    return {
      success: false,
      timestamp: new Date().toLocaleString('en-MY'),
      error: error.message || 'Failed to upload to Google Drive.',
    };
  }
}
