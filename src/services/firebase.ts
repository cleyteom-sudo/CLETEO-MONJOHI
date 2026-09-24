import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Student, ClassGroup, TaskHistoryItem, ActivityLog } from '../types';

// Initialize Firebase App & Firestore with firestoreDatabaseId (CRITICAL)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
  };
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
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Connection test per skill requirements
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is restricted.');
      return false;
    }
    return true;
  }
}

// Detect current device label (Laptop, Tablet, Mobile)
export function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'Server';
  const ua = window.navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua) || (isMobile && window.innerWidth >= 768);
  if (isTablet) return `Tablet (${window.screen.width}x${window.screen.height})`;
  if (isMobile) return `Smartphone (${window.screen.width}x${window.screen.height})`;
  return `Laptop / PC Desktop (${window.screen.width}x${window.screen.height})`;
}

// 1. Record User Login across all devices (Students and Teachers)
export async function recordUserLoginToCloud(params: {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student' | 'admin';
  school?: string;
  className?: string;
  year?: number;
}): Promise<void> {
  const path = `users/${params.id}`;
  try {
    const device = getDeviceInfo();
    const loginPayload = {
      id: params.id,
      email: params.email,
      name: params.name,
      role: params.role,
      school: params.school || 'SK Seri Bintang Bestari',
      className: params.className || '',
      year: params.year || 4,
      lastDevice: device,
      lastLoginAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', params.id), loginPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Sync Student record to cloud
export async function syncStudentToCloud(student: Student): Promise<void> {
  const path = `students/${student.id}`;
  try {
    const payload = {
      ...student,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'students', student.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Sync Class to cloud
export async function syncClassToCloud(cls: ClassGroup): Promise<void> {
  const path = `classes/${cls.id}`;
  try {
    const payload = {
      ...cls,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'classes', cls.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 4. Sync Task History item to cloud
export async function syncTaskToCloud(task: TaskHistoryItem): Promise<void> {
  const path = `task_history/${task.id}`;
  try {
    const payload = {
      ...task,
      device: getDeviceInfo(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'task_history', task.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 5. Sync Activity Log to cloud
export async function syncActivityLogToCloud(log: ActivityLog): Promise<void> {
  const path = `activity_logs/${log.id}`;
  try {
    const payload = {
      ...log,
      device: getDeviceInfo(),
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'activity_logs', log.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 6. Real-time Subscriptions across all devices

// Listen for student updates
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'students';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Student);
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

// Listen for class updates
export function subscribeToClasses(
  onUpdate: (classes: ClassGroup[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'classes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: ClassGroup[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ClassGroup);
      });
      if (list.length > 0) {
        onUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

// Listen for task history updates across devices
export function subscribeToTaskHistory(
  onUpdate: (tasks: TaskHistoryItem[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'task_history';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: TaskHistoryItem[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as TaskHistoryItem);
      });
      if (list.length > 0) {
        // Sort descending by id/timestamp
        list.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

// Listen for activity log updates
export function subscribeToActivityLogs(
  onUpdate: (logs: ActivityLog[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'activity_logs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: ActivityLog[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as ActivityLog);
      });
      if (list.length > 0) {
        list.sort((a, b) => b.id.localeCompare(a.id));
        onUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}

// Listen for active users / device logins
export interface CloudUserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  school?: string;
  className?: string;
  year?: number;
  lastDevice?: string;
  lastLoginAt?: string;
}

export function subscribeToUserLogins(
  onUpdate: (users: CloudUserSession[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'users';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: CloudUserSession[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as CloudUserSession);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
}
