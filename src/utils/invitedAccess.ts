// Utility for Managing Invited Emails and Admin Demo Mode Access
// Admin Email: cleyteom@gmail.com (Super Admin)

const STORAGE_KEY_INVITED = 'smarttrack_invited_emails';
const STORAGE_KEY_UNLOCKED = 'smarttrack_demo_unlocked';
const STORAGE_KEY_VERIFIED_EMAIL = 'smarttrack_verified_invitation_email';

export const SUPER_ADMIN_EMAIL = 'cleyteom@gmail.com';

export const DEFAULT_INVITED_EMAILS = [
  'cleyteom@gmail.com',
  'admin@moe-dl.edu.my',
];

export const getInvitedEmails = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVITED);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INVITED, JSON.stringify(DEFAULT_INVITED_EMAILS));
      return DEFAULT_INVITED_EMAILS;
    }
    const parsed: string[] = JSON.parse(raw);
    // Ensure SUPER_ADMIN_EMAIL is always present
    if (!parsed.some((e) => e.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase())) {
      parsed.unshift(SUPER_ADMIN_EMAIL);
    }
    return parsed;
  } catch {
    return DEFAULT_INVITED_EMAILS;
  }
};

export const addInvitedEmail = (email: string): { success: boolean; message: string } => {
  const clean = email.trim().toLowerCase();
  if (!clean || !clean.includes('@')) {
    return { success: false, message: 'Format e-mel tidak sah.' };
  }

  const current = getInvitedEmails();
  if (current.some((e) => e.toLowerCase() === clean)) {
    return { success: false, message: 'E-mel ini sudah berada dalam senarai jemputan.' };
  }

  const updated = [...current, clean];
  localStorage.setItem(STORAGE_KEY_INVITED, JSON.stringify(updated));
  return { success: true, message: `E-mel ${clean} berjaya ditambah ke senarai jemputan.` };
};

export const removeInvitedEmail = (email: string): { success: boolean; message: string } => {
  const clean = email.trim().toLowerCase();
  if (clean === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { success: false, message: 'E-mel Pentadbir Utama tidak boleh dipadamkan.' };
  }

  const current = getInvitedEmails();
  const updated = current.filter((e) => e.toLowerCase() !== clean);
  localStorage.setItem(STORAGE_KEY_INVITED, JSON.stringify(updated));
  return { success: true, message: `E-mel ${clean} dipadamkan daripada senarai jemputan.` };
};

export const isEmailInvited = (email: string): boolean => {
  const clean = email.trim().toLowerCase();
  if (!clean) return false;
  if (clean === SUPER_ADMIN_EMAIL.toLowerCase()) return true;
  const list = getInvitedEmails();
  return list.some((e) => e.toLowerCase() === clean);
};

export const hasAdminSpreadsheetAccess = (userEmail?: string): boolean => {
  // If specific email provided, check if it is invited/admin
  if (userEmail && isEmailInvited(userEmail)) {
    return true;
  }
  // Check if session or localStorage has verified invited/admin email
  const verified = getVerifiedEmail();
  if (verified && isEmailInvited(verified)) {
    return true;
  }
  return false;
};

export const isDemoAccessUnlocked = (): boolean => {
  try {
    return (
      localStorage.getItem(STORAGE_KEY_UNLOCKED) === 'true' ||
      sessionStorage.getItem(STORAGE_KEY_UNLOCKED) === 'true'
    );
  } catch {
    return false;
  }
};

export const getVerifiedEmail = (): string | null => {
  try {
    return (
      localStorage.getItem(STORAGE_KEY_VERIFIED_EMAIL) ||
      sessionStorage.getItem(STORAGE_KEY_VERIFIED_EMAIL) ||
      null
    );
  } catch {
    return null;
  }
};

export const unlockDemoAccess = (
  input: string
): { success: boolean; message: string; verifiedEmail?: string } => {
  const clean = input.trim().toLowerCase();
  if (!clean) {
    return {
      success: false,
      message: 'Sila masukkan e-mel jemputan atau kod akses pentadbir.',
    };
  }

  // Check master passkeys or invited email
  const isMasterKey =
    clean === 'admin2026' ||
    clean === 'admin-pbd' ||
    clean === 'cleyteom' ||
    clean === SUPER_ADMIN_EMAIL.toLowerCase();

  const isInvited = isEmailInvited(clean);

  if (isMasterKey || isInvited) {
    const verified = isMasterKey && !clean.includes('@') ? SUPER_ADMIN_EMAIL : clean;
    localStorage.setItem(STORAGE_KEY_UNLOCKED, 'true');
    localStorage.setItem(STORAGE_KEY_VERIFIED_EMAIL, verified);
    return {
      success: true,
      message: `Akses demo berjaya disahkan untuk ${verified}!`,
      verifiedEmail: verified,
    };
  }

  return {
    success: false,
    message:
      'Akses Ditolak: E-mel ini tiada dalam senarai jemputan atau pentadbir. Guru dan murid biasa perlu log masuk menggunakan ID rasmi DELIMa KPM (@moe-dl.edu.my).',
  };
};

export const lockDemoAccess = (): void => {
  localStorage.removeItem(STORAGE_KEY_UNLOCKED);
  localStorage.removeItem(STORAGE_KEY_VERIFIED_EMAIL);
  sessionStorage.removeItem(STORAGE_KEY_UNLOCKED);
  sessionStorage.removeItem(STORAGE_KEY_VERIFIED_EMAIL);
};
