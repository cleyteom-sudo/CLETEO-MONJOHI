import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  Student,
  ClassGroup,
  EvidenceItem,
  InterventionItem,
  InterventionResource,
  WeeklyMission,
  Badge,
  ActivityLog,
  ThemeType,
  UserProfile,
  SkillType,
  TPLevel,
  StarReward,
  ClassEnrollmentAlert,
  TaskHistoryItem,
  TeacherNotification,
  StudentNotification,
} from '../types';
import {
  StarCelebrationPayload,
  StarBadgeCelebrationModal,
} from '../components/common/StarBadgeCelebrationModal';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_EVIDENCE,
  INITIAL_INTERVENTIONS,
  INITIAL_RESOURCES,
  INITIAL_WEEKLY_MISSION,
  INITIAL_BADGES,
  INITIAL_ACTIVITY_LOGS,
} from '../data/mockData';
import {
  SUPER_ADMIN_EMAIL,
  isEmailInvited,
  isDemoAccessUnlocked,
  getVerifiedEmail,
} from '../utils/invitedAccess';
import {
  testConnection,
  recordUserLoginToCloud,
  syncStudentToCloud,
  syncClassToCloud,
  syncTaskToCloud,
  syncActivityLogToCloud,
  subscribeToStudents,
  subscribeToClasses,
  subscribeToTaskHistory,
  subscribeToActivityLogs,
  subscribeToUserLogins,
  CloudUserSession,
} from '../services/firebase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  role: UserRole;
  isAdmin: boolean;
  user: UserProfile;
  currentView: string;
  setCurrentView: (view: string) => void;
  classes: ClassGroup[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  students: Student[];
  selectedStudent: Student | null;
  setSelectedStudentId: (id: string | null) => void;
  evidenceList: EvidenceItem[];
  interventions: InterventionItem[];
  resources: InterventionResource[];
  weeklyMission: WeeklyMission;
  badges: Badge[];
  activityLogs: ActivityLog[];
  theme: ThemeType;
  customBgUrl: string;
  fontSize: 'normal' | 'large' | 'extra-large';
  toasts: ToastMessage[];
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  loginWithDelima: (
    role: UserRole,
    email: string,
    name?: string,
    school?: string,
    className?: string,
    year?: number
  ) => void;
  classEnrollmentAlerts: ClassEnrollmentAlert[];
  teacherNotifications: TeacherNotification[];
  addTeacherNotification: (notif: Omit<TeacherNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearTeacherNotifications: () => void;
  studentNotifications: StudentNotification[];
  addStudentNotification: (notif: Omit<StudentNotification, 'id' | 'timestamp' | 'read'>) => void;
  markStudentNotificationAsRead: (id: string) => void;
  markAllStudentNotificationsAsRead: () => void;
  clearStudentNotifications: () => void;
  activeStudentIntervention: InterventionItem | null;
  setActiveStudentIntervention: (item: InterventionItem | null) => void;
  openStudentInterventionById: (id: string) => void;
  completeStudentIntervention: (id: string, reflectionNotes?: string) => void;
  acceptStudentEnrollment: (studentId: string) => void;
  reassignStudentClass: (studentId: string, newClassName: string, newYear?: number) => void;
  createMissingClassAndEnroll: (
    studentId: string,
    className: string,
    year: number,
    academicYear?: string
  ) => void;
  enrollStudentWithDelima: (params: {
    name: string;
    email: string;
    className: string;
    year: number;
    school?: string;
    targetTeacher?: string;
  }) => {
    success: boolean;
    classExists: boolean;
    assignedClass: string;
    assignedYear: number;
    studentId: string;
    message: string;
  };
  resolveEnrollmentAlert: (alertId: string, action: 'create_class' | 'dismiss') => void;
  teacherProfile: {
    name: string;
    email: string;
    school: string;
    avatarUrl: string;
    guruBesarName?: string;
  };
  guruBesarName: string;
  updateGuruBesarName: (newName: string) => void;
  updateTeacherProfile: (updates: Partial<{ name: string; email: string; school: string; avatarUrl: string; guruBesarName: string }>) => void;
  updateStudentName: (studentId: string, newName: string) => void;
  updateStudentAvatar: (studentId: string, avatarUrl: string) => void;
  switchRole: (newRole: UserRole) => void;
  loginDemo: (role: UserRole) => void;
  logout: () => void;
  createClass: (name: string, year: number, academicYear: string) => void;
  updateClass: (id: string, updates: { name: string; year: number; academicYear: string }) => void;
  deleteClass: (id: string, reassignToClassId?: string) => void;
  importStudents: (newStudents: Partial<Student>[], targetClass: string) => void;
  updateStudentTP: (
    studentId: string,
    skill: SkillType,
    newTP: TPLevel,
    teacherNote?: string,
    isValidated?: boolean
  ) => void;
  addEvidence: (item: Omit<EvidenceItem, 'id' | 'date' | 'time'>) => void;
  validateEvidence: (evidenceId: string, tp: TPLevel, feedback: string) => void;
  addIntervention: (item: Omit<InterventionItem, 'id' | 'date'>) => void;
  updateInterventionStatus: (
    id: string,
    status: 'In Progress' | 'Completed' | 'Pending Review',
    newTP?: TPLevel
  ) => void;
  addInterventionResource: (resource: Omit<InterventionResource, 'id'>) => void;
  addXP: (amount: number, reason: string) => void;
  unlockBadge: (badgeId: string) => void;
  toggleMissionTask: (skill: SkillType) => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  setTheme: (theme: ThemeType) => void;
  setCustomBgUrl: (url: string) => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  qrModalStudent: Student | null;
  setQrModalStudent: (student: Student | null) => void;
  currentStudent: Student | null;
  triggerCelebration: () => void;
  claimMissionReward: () => void;
  awardStars: (params: {
    skill: SkillType;
    starsCount: number;
    exerciseTitle: string;
    title: string;
    praiseMessage: string;
    badgeToUnlock?: string;
    xpBonus?: number;
    silent?: boolean;
  }) => void;
  activeCelebration: StarCelebrationPayload | null;
  closeCelebration: () => void;
  taskHistory: TaskHistoryItem[];
  saveCompletedTask: (task: Omit<TaskHistoryItem, 'id' | 'completedAt'> & { completedAt?: string }) => void;
  completeFirstTimerStep: (stepSkill: string, calibratedTP?: string) => void;
  isTaskLocked: (taskId: string, skill: SkillType, level: number, prereqId?: string) => boolean;
  cloudSyncStatus: 'connected' | 'syncing' | 'offline';
  cloudSessions: CloudUserSession[];
  lastCloudSyncTime: string;
  forceSyncAllToCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('teacher');
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('smarttrack_delima_auth') === 'true';
  });
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('smarttrack_theme');
    return (saved as ThemeType) || 'spaceship_stars';
  });
  const [customBgUrl, setCustomBgUrlState] = useState<string>(() => {
    return localStorage.getItem('smarttrack_custom_bg') || '';
  });
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [timeFormat, setTimeFormatState] = useState<'12h' | '24h'>(() => {
    const saved = localStorage.getItem('smarttrack_time_format');
    return saved === '12h' || saved === '24h' ? saved : '12h';
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [qrModalStudent, setQrModalStudent] = useState<Student | null>(null);

  const setTimeFormat = (format: '12h' | '24h') => {
    setTimeFormatState(format);
    localStorage.setItem('smarttrack_time_format', format);
  };

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('smarttrack_theme', newTheme);
  };

  const setCustomBgUrl = (url: string) => {
    setCustomBgUrlState(url);
    localStorage.setItem('smarttrack_custom_bg', url);
  };

  // Teacher Profile state & persistence (Requirement 4)
  const [teacherProfile, setTeacherProfile] = useState<{
    name: string;
    email: string;
    school: string;
    avatarUrl: string;
    guruBesarName?: string;
  }>(() => {
    const saved = localStorage.getItem('smarttrack_teacher_profile');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Cikgu Sarah binti Ahmad',
          email: 'g-98765432@moe-dl.edu.my',
          school: 'SK Seri Bintang Bestari',
          avatarUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          guruBesarName: 'Encik Ismail bin Mahmud',
        };
  });

  const [guruBesarName, setGuruBesarNameState] = useState<string>(() => {
    const saved = localStorage.getItem('smarttrack_guru_besar_name');
    return saved || teacherProfile.guruBesarName || 'Encik Ismail bin Mahmud';
  });

  useEffect(() => {
    localStorage.setItem('smarttrack_teacher_profile', JSON.stringify({ ...teacherProfile, guruBesarName }));
  }, [teacherProfile, guruBesarName]);

  const updateGuruBesarName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setGuruBesarNameState(trimmed);
    localStorage.setItem('smarttrack_guru_besar_name', trimmed);
    setTeacherProfile((prev) => ({ ...prev, guruBesarName: trimmed }));
    showToast('Nama Guru Besar Dikemaskini', `Nama Guru Besar disahkan: ${trimmed}`, 'success');
  };

  const updateTeacherProfile = (updates: Partial<typeof teacherProfile>) => {
    setTeacherProfile((prev) => {
      const next = { ...prev, ...updates };
      if (updates.guruBesarName) {
        setGuruBesarNameState(updates.guruBesarName);
        localStorage.setItem('smarttrack_guru_besar_name', updates.guruBesarName);
      }
      return next;
    });
    showToast('Teacher Profile Updated', 'Your profile details have been saved.', 'success');
  };

  // Core Data loaded from localStorage if available (guarantee Year 1 - 6)
  const [classes, setClasses] = useState<ClassGroup[]>(() => {
    const saved = localStorage.getItem('smarttrack_classes');
    if (!saved) return INITIAL_CLASSES;
    try {
      const parsed: ClassGroup[] = JSON.parse(saved);
      const existingYears = new Set(parsed.map((c) => c.year));
      const missingClasses = INITIAL_CLASSES.filter((c) => !existingYears.has(c.year));
      return missingClasses.length > 0 ? [...parsed, ...missingClasses] : parsed;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('class-4-bestari');

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('smarttrack_students');
    if (!saved) return INITIAL_STUDENTS;
    try {
      const parsed: Student[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map((s) => s.id));
      const missingStudents = INITIAL_STUDENTS.filter((s) => !existingIds.has(s.id));
      return missingStudents.length > 0 ? [...parsed, ...missingStudents] : parsed;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>('std-daniel-lee');

  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(() => {
    const saved = localStorage.getItem('smarttrack_evidence');
    return saved ? JSON.parse(saved) : INITIAL_EVIDENCE;
  });

  const [interventions, setInterventions] = useState<InterventionItem[]>(() => {
    const saved = localStorage.getItem('smarttrack_interventions');
    return saved ? JSON.parse(saved) : INITIAL_INTERVENTIONS;
  });

  const [resources, setResources] = useState<InterventionResource[]>(() => {
    const saved = localStorage.getItem('smarttrack_resources');
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [weeklyMission, setWeeklyMission] = useState<WeeklyMission>(() => {
    const saved = localStorage.getItem('smarttrack_weekly_mission');
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_MISSION;
  });

  const [badges] = useState<Badge[]>(INITIAL_BADGES);
  const [activeCelebration, setActiveCelebration] = useState<StarCelebrationPayload | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('smarttrack_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [classEnrollmentAlerts, setClassEnrollmentAlerts] = useState<ClassEnrollmentAlert[]>(() => {
    const saved = localStorage.getItem('smarttrack_class_enrollment_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('smarttrack_class_enrollment_alerts', JSON.stringify(classEnrollmentAlerts));
  }, [classEnrollmentAlerts]);

  const [teacherNotifications, setTeacherNotifications] = useState<TeacherNotification[]>(() => {
    const saved = localStorage.getItem('smarttrack_teacher_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'notif-demo-1',
        category: 'new_enrollment',
        title: '📋 New Student Enrolled: Nur Sofia binti Kamal',
        message: 'Nur Sofia (m-10882233@moe-dl.edu.my) enrolled for Year 4 class "4 BESTARI" under Madam Sarah. Awaiting teacher confirmation.',
        studentName: 'Nur Sofia binti Kamal',
        studentEmail: 'm-10882233@moe-dl.edu.my',
        className: '4 BESTARI',
        year: 4,
        targetTeacher: 'Madam Sarah binti Abdullah',
        timestamp: '10:15 AM (Today)',
        read: false,
        priority: 'high',
        actionType: 'accept_enrollment',
      },
      {
        id: 'notif-demo-2',
        category: 'task_completed',
        title: '⭐ Task Completed: Daniel Lee',
        message: 'Daniel Lee completed Oral Reading Aloud with 92% accuracy and earned 3 stars.',
        studentName: 'Daniel Lee',
        studentId: 'std-daniel-lee',
        taskTitle: 'Oral Reading Aloud — The Bukit Fraser Camping Trip',
        skill: 'Reading',
        score: 92,
        starsEarned: 3,
        timestamp: '09:40 AM (Today)',
        read: false,
        priority: 'medium',
        actionType: 'view_student',
      },
      {
        id: 'notif-demo-3',
        category: 'missing_class',
        title: '⚠️ New Student Enrolled in Missing Class: 4 KREATIF',
        message: 'Muhammad Zikri enrolled for class "4 KREATIF" (Year 4), but this class does not exist in the school system. Please create the class to complete enrollment.',
        studentName: 'Muhammad Zikri',
        studentEmail: 'm-10994455@moe-dl.edu.my',
        className: '4 KREATIF',
        year: 4,
        targetTeacher: 'Madam Sarah binti Abdullah',
        timestamp: '08:30 AM (Today)',
        read: false,
        priority: 'urgent',
        actionType: 'create_class',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('smarttrack_teacher_notifications', JSON.stringify(teacherNotifications));
  }, [teacherNotifications]);

  const addTeacherNotification = (notif: Omit<TeacherNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: TeacherNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp:
        new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) +
        ' (' +
        new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }) +
        ')',
      read: false,
    };
    setTeacherNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setTeacherNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setTeacherNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Semua Notifikasi Ditanda Dibaca', 'Semua notifikasi guru telah ditandakan sebagai dibaca.', 'info');
  };

  const clearTeacherNotifications = () => {
    setTeacherNotifications([]);
  };

  const [studentNotifications, setStudentNotifications] = useState<StudentNotification[]>(() => {
    const saved = localStorage.getItem('smarttrack_student_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 's-notif-1',
        category: 'intervention_due',
        title: '🚨 Remedial Intervention Due: Speaking Buddy Guided Fluency',
        message: 'Madam Sarah assigned a DSKP 2.1.1 intervention to boost your Speaking confidence to TP4. Complete your guided practice before the due date.',
        timestamp: '08:15 AM (Today)',
        read: false,
        priority: 'urgent',
        actionType: 'open_intervention',
        targetSkill: 'Speaking',
        targetId: 'int-1',
        dueDateTime: '25 Sept 2026, 11:59 PM',
      },
      {
        id: 's-notif-2',
        category: 'task_due',
        title: '⏰ Task Due Soon: Listening Bay Dialogue Quest',
        message: 'Complete "Phonics & Animals Sound Quest" with Drag & Drop answer tiles into the Answer Box before deadline.',
        timestamp: '09:00 AM (Today)',
        read: false,
        priority: 'high',
        actionType: 'open_task',
        targetSkill: 'Listening',
        targetView: 'student-listening',
        targetId: 'list-task-1',
        dueDateTime: '24 Sept 2026, 05:00 PM',
      },
      {
        id: 's-notif-3',
        category: 'tp_improved',
        title: '📈 PBD TP Improvement: Listening Upgraded to TP4!',
        message: 'Great news! Madam Sarah validated your Listening skill and upgraded your performance band from TP3 ➔ TP4 based on your audio comprehension scores.',
        timestamp: 'Yesterday, 11:00 AM',
        read: false,
        priority: 'high',
        actionType: 'open_tp',
        targetSkill: 'Listening',
        targetView: 'parent-summary',
        tpChange: {
          skill: 'Listening',
          from: 'TP3',
          to: 'TP4',
        },
      },
      {
        id: 's-notif-4',
        category: 'badge_unlocked',
        title: '🏆 New Badge Earned: Brave Speaker!',
        message: 'Congratulations! You unlocked the Brave Speaker badge by completing 3 speaking turns with Milo.',
        timestamp: '10:45 AM (Today)',
        read: false,
        priority: 'medium',
        actionType: 'open_badge',
        targetSkill: 'Speaking',
        targetView: 'student-portfolio',
        badgeIcon: '🗣️',
        badgeName: 'Brave Speaker',
      },
      {
        id: 's-notif-5',
        category: 'achievement',
        title: '⭐ 10-Star Club Milestone! Level 7 reached!',
        message: 'You have collected over 14 stars across English skills. You reached Cadet Level 7!',
        timestamp: 'Yesterday, 04:20 PM',
        read: true,
        priority: 'medium',
        actionType: 'open_badge',
        targetView: 'student-world',
        starsEarned: 14,
        xpBonus: 50,
      },
      {
        id: 's-notif-6',
        category: 'task_completed',
        title: '✅ Task Completed: Reading Passage — Bukit Fraser',
        message: 'Oral Reading Aloud scored 92% accuracy! You earned +3 ⭐ Stars and +35 XP.',
        timestamp: '22 Sept 2026, 03:15 PM',
        read: true,
        priority: 'low',
        actionType: 'open_task',
        targetSkill: 'Reading',
        targetView: 'task-history',
        starsEarned: 3,
        xpBonus: 35,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('smarttrack_student_notifications', JSON.stringify(studentNotifications));
  }, [studentNotifications]);

  const addStudentNotification = (notif: Omit<StudentNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: StudentNotification = {
      ...notif,
      id: `s-notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp:
        new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) +
        ' (' +
        new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }) +
        ')',
      read: false,
    };
    setStudentNotifications((prev) => [newNotif, ...prev]);
  };

  const markStudentNotificationAsRead = (id: string) => {
    setStudentNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllStudentNotificationsAsRead = () => {
    setStudentNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifikasi Ditanda Dibaca', 'Semua notifikasi murid telah ditandakan sebagai dibaca.', 'info');
  };

  const clearStudentNotifications = () => {
    setStudentNotifications([]);
  };

  const [activeStudentIntervention, setActiveStudentIntervention] = useState<InterventionItem | null>(null);

  const openStudentInterventionById = (id: string) => {
    const currentStdId = selectedStudentId || 'std-daniel-lee';
    const item =
      interventions.find((i) => i.id === id) ||
      interventions.find((i) => i.studentId === currentStdId) ||
      interventions[0];
    if (item) {
      setActiveStudentIntervention(item);
    } else {
      showToast('Tiada Rekod Intervensi', 'Pelan intervensi ini tidak dijumpai atau telah selesai.', 'info');
    }
  };

  const completeStudentIntervention = (id: string, reflectionNotes?: string) => {
    const currentStd = students.find((s) => s.id === (selectedStudentId || 'std-daniel-lee'));
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Completed',
            improved: true,
            teacherNotes: (item.teacherNotes ? item.teacherNotes + ' • ' : '') + `Student submitted remediation: "${reflectionNotes || 'Task completed with gamified practice'}"`,
          };
        }
        return item;
      })
    );

    // Award rewards to student
    addXP(50, 'Completed Remedial Intervention Task');
    awardStars({
      skill: activeStudentIntervention?.skill || 'Speaking',
      starsCount: 3,
      exerciseTitle: activeStudentIntervention?.interventionTitle || 'Intervention Booster',
      title: 'Intervention Mastery Star!',
      praiseMessage: 'Superb dedication! You completed your assigned DSKP remedial intervention.',
      xpBonus: 50,
    });

    // Notify student
    addStudentNotification({
      category: 'task_completed',
      title: '✅ Intervensi Selesai & Dihantar!',
      message: `Tahniah! Anda telah melengkapkan intervensi "${activeStudentIntervention?.interventionTitle || 'Bimbingan PBD'}". Bukti telah dihantar kepada guru.`,
      priority: 'high',
      actionType: 'open_task',
      targetView: 'task-history',
      starsEarned: 3,
      xpBonus: 50,
    });

    // Notify teacher
    addTeacherNotification({
      category: 'task_completed',
      title: `🎉 Intervensi Diselesaikan: ${currentStd?.name || 'Daniel Lee'}`,
      message: `${currentStd?.name || 'Daniel Lee'} telah melengkapkan tugasan intervensi (${activeStudentIntervention?.skill || 'Kemahiran'} ${activeStudentIntervention?.targetTP || ''}) dan bersedia untuk pengesahan TP.`,
      studentName: currentStd?.name || 'Daniel Lee',
      studentId: currentStd?.id || 'std-daniel-lee',
      skill: activeStudentIntervention?.skill,
      priority: 'medium',
      actionType: 'view_student',
    });

    setActiveStudentIntervention(null);
    showToast('Intervensi Selesai! 🎉', '+50 XP & +3 Bintang diberikan!', 'success');
  };

  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>(() => {
    const saved = localStorage.getItem('smarttrack_task_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'hist-1',
        studentId: 'std-daniel-lee',
        studentName: 'Daniel Lee',
        skill: 'Reading',
        category: 'Level 1: Phonics & Fluency',
        taskTitle: 'Oral Reading Aloud — The Bukit Fraser Camping Trip',
        score: 92,
        starsEarned: 3,
        xpEarned: 35,
        userInputSummary: 'Oral reading aloud recorded (0:48). Detected 43/43 words (100%).',
        feedbackSummary: 'Outstanding reading fluency and pronunciation accuracy!',
        teacherRemarks: 'Fluency rate: 92%. Verified clear pronunciation on initial consonants.',
        completedAt: '28 Aug 2026',
        status: 'Teacher Validated',
        audioDuration: '0:48',
      },
      {
        id: 'hist-2',
        studentId: 'std-daniel-lee',
        studentName: 'Daniel Lee',
        skill: 'Speaking',
        category: 'Level 1: Expressing Preferences',
        taskTitle: 'Milo Dialogue: Favourite Foods',
        score: 95,
        starsEarned: 3,
        xpEarned: 35,
        userInputSummary: 'Spoke 3 conversational turns with Milo on "My Favourite Food".',
        feedbackSummary: 'Completed conversational mission with clear articulation and spontaneous responses.',
        teacherRemarks: 'Fluency: TP4 standard. Shows spontaneous sentence structures.',
        completedAt: '30 Aug 2026',
        status: 'Teacher Validated',
      },
      {
        id: 'hist-3',
        studentId: 'std-daniel-lee',
        studentName: 'Daniel Lee',
        skill: 'Writing',
        category: 'Level 1: Past Tense & Plurals',
        taskTitle: 'Sentence Craft: A Day at the Beach',
        score: 88,
        starsEarned: 3,
        xpEarned: 35,
        userInputSummary: 'Yesterday I went to the beach with my family. I saw many shells on the warm sand.',
        feedbackSummary: 'Excellent sentence construction with proper past tense verbs and plural nouns.',
        teacherRemarks: 'Good mastery of simple past tense and punctuation.',
        completedAt: '01 Sep 2026',
        status: 'Teacher Validated',
      },
      {
        id: 'hist-4',
        studentId: 'std-daniel-lee',
        studentName: 'Daniel Lee',
        skill: 'Listening',
        category: 'Level 1: Foundational Phonics',
        taskTitle: 'Phonics & Animals Sound Quest',
        score: 100,
        starsEarned: 3,
        xpEarned: 30,
        userInputSummary: 'Answered: "A green hornbill"',
        feedbackSummary: 'Correct! The hornbill called loudly from the branch, while the mousedeer tapped its hooves.',
        teacherRemarks: 'Excellent auditory discrimination and recall.',
        completedAt: '02 Sep 2026',
        status: 'Completed',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('smarttrack_task_history', JSON.stringify(taskHistory));
  }, [taskHistory]);

  // Current user profiles
  const teacherUser: UserProfile = {
    name: teacherProfile.name,
    email: teacherProfile.email,
    role: 'teacher',
    school: teacherProfile.school,
    avatarUrl: teacherProfile.avatarUrl,
    bgTheme: theme,
    fontSize,
    notifications: true,
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0] || null;

  const studentUser: UserProfile = {
    name: selectedStudent ? selectedStudent.name : 'Daniel Lee',
    email: selectedStudent ? selectedStudent.email : 'student.demo@moe.gov.my',
    role: 'student',
    school: 'SK Seri Bintang Bestari',
    year: selectedStudent ? selectedStudent.year : 4,
    className: selectedStudent ? selectedStudent.className : '4 BESTARI',
    avatarUrl: selectedStudent?.avatarUrl || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    bgTheme: theme,
    fontSize,
    notifications: true,
  };

  const user = role === 'teacher' ? teacherUser : studentUser;

  const verifiedInvited = getVerifiedEmail();
  const isAdmin = Boolean(
    (user.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) ||
    (user.email && isEmailInvited(user.email)) ||
    (teacherProfile.email && teacherProfile.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) ||
    (teacherProfile.email && isEmailInvited(teacherProfile.email)) ||
    (verifiedInvited && isEmailInvited(verifiedInvited)) ||
    isDemoAccessUnlocked()
  );

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem('smarttrack_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('smarttrack_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('smarttrack_evidence', JSON.stringify(evidenceList));
  }, [evidenceList]);

  useEffect(() => {
    localStorage.setItem('smarttrack_interventions', JSON.stringify(interventions));
  }, [interventions]);

  useEffect(() => {
    localStorage.setItem('smarttrack_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('smarttrack_weekly_mission', JSON.stringify(weeklyMission));
  }, [weeklyMission]);

  useEffect(() => {
    localStorage.setItem('smarttrack_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Cloud Firestore synchronization state
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [cloudSessions, setCloudSessions] = useState<CloudUserSession[]>([]);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string>('');

  // 1. Initialize Firebase Cloud Firestore synchronization
  useEffect(() => {
    testConnection()
      .then((connected) => {
        setCloudSyncStatus(connected ? 'connected' : 'offline');
      })
      .catch(() => {
        setCloudSyncStatus('offline');
      });

    // Real-time listener for students across all devices
    const unsubStudents = subscribeToStudents((cloudStudents) => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
        setLastCloudSyncTime(new Date().toLocaleTimeString());
      } else {
        // Seed initial students to cloud so all devices get them
        INITIAL_STUDENTS.forEach((s) => syncStudentToCloud(s));
      }
    });

    // Real-time listener for classes across all devices
    const unsubClasses = subscribeToClasses((cloudClasses) => {
      if (cloudClasses && cloudClasses.length > 0) {
        setClasses(cloudClasses);
      } else {
        INITIAL_CLASSES.forEach((c) => syncClassToCloud(c));
      }
    });

    // Real-time listener for tasks & stars
    const unsubTasks = subscribeToTaskHistory((cloudTasks) => {
      if (cloudTasks && cloudTasks.length > 0) {
        setTaskHistory(cloudTasks);
      }
    });

    // Real-time listener for activity logs
    const unsubLogs = subscribeToActivityLogs((cloudLogs) => {
      if (cloudLogs && cloudLogs.length > 0) {
        setActivityLogs(cloudLogs);
      }
    });

    // Real-time listener for active device logins
    const unsubUsers = subscribeToUserLogins((users) => {
      if (users) {
        setCloudSessions(users);
      }
    });

    return () => {
      unsubStudents();
      unsubClasses();
      unsubTasks();
      unsubLogs();
      unsubUsers();
    };
  }, []);

  // 2. Track current device login to Cloud
  useEffect(() => {
    if (isAuthenticated && user) {
      recordUserLoginToCloud({
        id: role === 'teacher' ? (teacherProfile.email || 'teacher-sarah') : (selectedStudent?.id || 'std-daniel-lee'),
        email: user.email,
        name: user.name,
        role: role as 'teacher' | 'student',
        school: user.school,
        className: user.className,
        year: user.year,
      });
    }
  }, [isAuthenticated, role, user.email, user.name]);

  const forceSyncAllToCloud = async () => {
    setCloudSyncStatus('syncing');
    try {
      for (const s of students) {
        await syncStudentToCloud(s);
      }
      for (const c of classes) {
        await syncClassToCloud(c);
      }
      for (const t of taskHistory) {
        await syncTaskToCloud(t);
      }
      for (const a of activityLogs) {
        await syncActivityLogToCloud(a);
      }
      setCloudSyncStatus('connected');
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    } catch {
      setCloudSyncStatus('offline');
    }
  };

  // Toast Helper with guaranteed collision-free IDs
  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Switch role and appropriate landing view
  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'teacher') {
      setCurrentView('teacher-dashboard');
      showToast('Switched to Teacher Mode', `Viewing ${teacherProfile.name} dashboard`, 'info');
    } else {
      setCurrentView('student-world');
      showToast('Switched to Student Mode', `Welcome to ${selectedStudent?.name || 'Daniel Lee'} Learning World`, 'info');
    }
  };

  const enrollStudentWithDelima = (params: {
    name: string;
    email: string;
    className: string;
    year: number;
    school?: string;
    targetTeacher?: string;
  }): {
    success: boolean;
    classExists: boolean;
    assignedClass: string;
    assignedYear: number;
    studentId: string;
    message: string;
  } => {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.name.trim();
    const rawClass = params.className.trim();
    let requestedClassName = rawClass.toUpperCase();
    let requestedYear = params.year || 4;
    const chosenTeacher = params.targetTeacher || 'Madam Sarah binti Abdullah';
    const enrollTimeStr =
      new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) +
      ' (' +
      new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }) +
      ')';

    // Auto-detect year from class name if formatted like "3 INOVATIF" -> year 3
    const yearMatch = requestedClassName.match(/^(\d+)\s*(.*)$/);
    if (yearMatch) {
      const parsedYear = parseInt(yearMatch[1], 10);
      if (parsedYear >= 1 && parsedYear <= 6) {
        requestedYear = parsedYear;
      }
    }

    // 1. Check if class already exists in the system
    const existingClass = classes.find(
      (c) =>
        c.name.trim().toUpperCase() === requestedClassName ||
        c.name.trim().toUpperCase() === `${requestedYear} ${requestedClassName}` ||
        `${c.year} ${c.name.trim().toUpperCase()}` === requestedClassName ||
        (yearMatch &&
          c.name.trim().toUpperCase().includes(yearMatch[2].trim()) &&
          c.year === requestedYear)
    );

    const finalClassName = existingClass ? existingClass.name : requestedClassName;
    const finalYear = existingClass ? existingClass.year : requestedYear;

    // 2. Check if student already exists in the system
    const existingStudentIndex = students.findIndex(
      (s) =>
        (s.email && s.email.trim().toLowerCase() === cleanEmail) ||
        (cleanName && s.name.trim().toLowerCase() === cleanName.toLowerCase())
    );

    let targetStudentId = '';

    if (existingStudentIndex !== -1) {
      const existing = students[existingStudentIndex];
      targetStudentId = existing.id;
      setStudents((prev) =>
        prev.map((s, idx) =>
          idx === existingStudentIndex
            ? {
                ...s,
                name: cleanName || s.name,
                email: cleanEmail || s.email,
                className: finalClassName,
                year: finalYear,
                targetTeacher: chosenTeacher,
                enrolledAt: enrollTimeStr,
                pendingClassApproval: true,
                lastActive: 'Baru sahaja',
              }
            : s
        )
      );
      syncStudentToCloud({
        ...existing,
        name: cleanName || existing.name,
        email: cleanEmail || existing.email,
        className: finalClassName,
        year: finalYear,
        targetTeacher: chosenTeacher,
        enrolledAt: enrollTimeStr,
        pendingClassApproval: true,
      });
    } else {
      // Register new student into system roster
      targetStudentId = `std-delima-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const newStudent: Student = {
        id: targetStudentId,
        name: cleanName || 'Murid DELIMa',
        email: cleanEmail,
        year: finalYear,
        className: finalClassName,
        avatarUrl:
          'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
        readingTP: 'TP3',
        writingTP: 'TP3',
        listeningTP: 'TP3',
        speakingTP: 'TP3',
        overallTP: 'TP3',
        readingValidated: false,
        writingValidated: false,
        listeningValidated: false,
        speakingValidated: false,
        historicalTP: [
          {
            month: 'September',
            tp: 'TP3',
            reading: 'TP3',
            writing: 'TP3',
            listening: 'TP3',
            speaking: 'TP3',
          },
        ],
        xp: 150,
        level: 2,
        streakDays: 1,
        badges: ['badge-reading-explorer'],
        stars: 0,
        starsBreakdown: { reading: 0, speaking: 0, writing: 0, listening: 0 },
        earnedStarHistory: [],
        lastActive: 'Baru sahaja',
        interventionStatus: 'None',
        weeklyMissionsCompleted: 0,
        totalWeeklyMissions: 4,
        pendingClassApproval: true, // Requires teacher acceptance
        targetTeacher: chosenTeacher,
        enrolledAt: enrollTimeStr,
        notes: `Pengguna DELIMa (${cleanEmail}). Enrolmen kelas: ${finalClassName} (Guru: ${chosenTeacher}).`,
      };

      setStudents((prev) => [newStudent, ...prev]);
      syncStudentToCloud(newStudent);
    }

    setSelectedStudentId(targetStudentId);

    // 3. Condition A: The class ALREADY EXISTS in the system
    if (existingClass) {
      setSelectedClassId(existingClass.id);

      // Create high-priority notification for teacher
      addTeacherNotification({
        category: 'new_enrollment',
        priority: 'high',
        title: `📋 Enrolmen Murid Baharu: ${cleanName}`,
        message: `Murid ${cleanName} (${cleanEmail}) telah mendaftar ke kelas "${finalClassName}" (Tahun ${finalYear}) di bawah ${chosenTeacher}. Sila sahkan penerimaan murid dalam pengurusan kelas.`,
        studentName: cleanName,
        studentEmail: cleanEmail,
        studentId: targetStudentId,
        className: finalClassName,
        year: finalYear,
        targetTeacher: chosenTeacher,
        actionType: 'accept_enrollment',
      });

      addActivityLog({
        actorRole: 'student',
        actionType: 'assessment',
        title: `📋 Enrolmen Murid: ${cleanName}`,
        details: `Murid ${cleanName} (${cleanEmail}) telah mendaftar untuk kelas "${existingClass.name}" (Guru: ${chosenTeacher}). Menunggu pengesahan guru.`,
      });

      return {
        success: true,
        classExists: true,
        assignedClass: existingClass.name,
        assignedYear: existingClass.year,
        studentId: targetStudentId,
        message: `Pendaftaran Berjaya! Anda telah memohon enrolmen ke dalam kelas ${existingClass.name} di bawah ${chosenTeacher}. Anda boleh mula belajar sekarang sementara guru mengesahkan senarai rasmi.`,
      };
    } else {
      // 4. Condition B: The class DOES NOT EXIST in the system -> Urgent alert to Teacher
      const newAlert: ClassEnrollmentAlert = {
        id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: targetStudentId,
        studentName: cleanName || 'Murid DELIMa',
        studentEmail: cleanEmail,
        requestedClass: requestedClassName,
        requestedYear: requestedYear,
        targetTeacher: chosenTeacher,
        timestamp: enrollTimeStr,
        status: 'pending',
      };

      setClassEnrollmentAlerts((prev) => [newAlert, ...prev]);

      // Create urgent missing class notification for teacher
      addTeacherNotification({
        category: 'missing_class',
        priority: 'urgent',
        title: `⚠️ Murid Baharu Mendaftar Kelas Belum Wujud: "${requestedClassName}"`,
        message: `Murid ${cleanName} (${cleanEmail}) telah mendaftar untuk kelas Tahun ${requestedYear} "${requestedClassName}" di bawah ${chosenTeacher}, tetapi kelas ini belum wujud dalam sistem. Sila cipta kelas ini sekarang!`,
        studentName: cleanName,
        studentEmail: cleanEmail,
        studentId: targetStudentId,
        className: requestedClassName,
        year: requestedYear,
        targetTeacher: chosenTeacher,
        actionType: 'create_class',
      });

      addActivityLog({
        actorRole: 'teacher',
        actionType: 'assessment',
        title: `⚠️ Pemberitahuan: Kelas "${requestedClassName}" Belum Wujud`,
        details: `Murid ${cleanName} mendaftar dengan kelas "${requestedClassName}" (Tahun ${requestedYear}) yang belum wujud. Guru telah dimaklumkan untuk mewujudkan kelas.`,
      });

      return {
        success: true,
        classExists: false,
        assignedClass: requestedClassName,
        assignedYear: requestedYear,
        studentId: targetStudentId,
        message: `Kelas "${requestedClassName}" belum wujud dalam sistem. Notifikasi segera telah dihantar kepada guru anda (${chosenTeacher}) untuk mencipta kelas ini. Anda boleh mula meneroka sekarang!`,
      };
    }
  };

  const acceptStudentEnrollment = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              pendingClassApproval: false,
              enrolledAt: s.enrolledAt || new Date().toISOString(),
            }
          : s
      )
    );

    // Increment class student count
    setClasses((prev) =>
      prev.map((c) =>
        c.name.trim().toUpperCase() === student.className.trim().toUpperCase()
          ? { ...c, studentCount: c.studentCount + 1 }
          : c
      )
    );

    // Resolve any alert
    setClassEnrollmentAlerts((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, status: 'resolved' } : a))
    );

    // Mark enrollment notifications for this student as read
    setTeacherNotifications((prev) =>
      prev.map((n) =>
        n.studentId === studentId && n.category === 'new_enrollment' ? { ...n, read: true } : n
      )
    );

    // Sync to Cloud
    syncStudentToCloud({
      ...student,
      pendingClassApproval: false,
    });

    addActivityLog({
      actorRole: 'teacher',
      actionType: 'assessment',
      title: `✅ Enrolmen Disahkan: ${student.name}`,
      details: `Guru telah menerima kemasukan murid ${student.name} ke dalam kelas rasmi ${student.className}.`,
    });

    showToast(
      'Enrolmen Murid Disahkan!',
      `${student.name} kini sah didaftarkan ke dalam kelas ${student.className}.`,
      'success'
    );
  };

  const reassignStudentClass = (studentId: string, newClassName: string, newYear?: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const oldClass = student.className;
    const finalYear = newYear || student.year;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              className: newClassName,
              year: finalYear,
              pendingClassApproval: false,
            }
          : s
      )
    );

    // Adjust counts in old and new classes
    setClasses((prev) =>
      prev.map((c) => {
        if (c.name.trim().toUpperCase() === oldClass.trim().toUpperCase()) {
          return { ...c, studentCount: Math.max(0, c.studentCount - 1) };
        }
        if (c.name.trim().toUpperCase() === newClassName.trim().toUpperCase()) {
          return { ...c, studentCount: c.studentCount + 1 };
        }
        return c;
      })
    );

    // Resolve any alert
    setClassEnrollmentAlerts((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, status: 'resolved' } : a))
    );

    // Mark notifs read
    setTeacherNotifications((prev) =>
      prev.map((n) => (n.studentId === studentId ? { ...n, read: true } : n))
    );

    // Cloud sync
    syncStudentToCloud({
      ...student,
      className: newClassName,
      year: finalYear,
      pendingClassApproval: false,
    });

    addActivityLog({
      actorRole: 'teacher',
      actionType: 'assessment',
      title: `Pindahan Kelas: ${student.name}`,
      details: `Guru telah memindahkan murid ${student.name} dari kelas ${oldClass} ke kelas ${newClassName} (Tahun ${finalYear}).`,
    });

    showToast(
      'Kelas Berjaya Ditukar',
      `${student.name} telah dipindahkan ke kelas ${newClassName}.`,
      'success'
    );
  };

  const createMissingClassAndEnroll = (
    studentId: string,
    className: string,
    year: number,
    academicYear: string = '2026/2027'
  ) => {
    // 1. Create class
    createClass(className, year, academicYear);

    // 2. Set student into class and approve
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId
            ? {
                ...s,
                className: className.toUpperCase(),
                year,
                pendingClassApproval: false,
              }
            : s
        )
      );

      syncStudentToCloud({
        ...student,
        className: className.toUpperCase(),
        year,
        pendingClassApproval: false,
      });
    }

    // 3. Resolve alert
    setClassEnrollmentAlerts((prev) =>
      prev.map((a) =>
        a.studentId === studentId || a.requestedClass.toUpperCase() === className.toUpperCase()
          ? { ...a, status: 'resolved' }
          : a
      )
    );

    // 4. Mark notification read
    setTeacherNotifications((prev) =>
      prev.map((n) =>
        n.category === 'missing_class' &&
        (n.studentId === studentId || n.className?.toUpperCase() === className.toUpperCase())
          ? { ...n, read: true }
          : n
      )
    );

    showToast(
      'Kelas Dicipta & Murid Dienrol!',
      `Kelas ${className} telah dicipta dan murid ${student?.name || ''} berjaya dimasukkan ke senarai rasmi.`,
      'success'
    );
  };

  const resolveEnrollmentAlert = (alertId: string, action: 'create_class' | 'dismiss') => {
    const alert = classEnrollmentAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    if (action === 'create_class') {
      createClass(alert.requestedClass, alert.requestedYear, '2026/2027');

      // Update student to remove pending status
      setStudents((prev) =>
        prev.map((s) =>
          s.id === alert.studentId
            ? {
                ...s,
                className: alert.requestedClass,
                year: alert.requestedYear,
                pendingClassApproval: false,
              }
            : s
        )
      );

      showToast(
        'Kelas Dicipta & Murid Dienrol',
        `Kelas ${alert.requestedClass} telah dicipta. Murid ${alert.studentName} kini sah berenrol!`,
        'success'
      );
    }

    setClassEnrollmentAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  };

  const loginWithDelima = (
    loginRole: UserRole,
    email: string,
    name?: string,
    school?: string,
    className?: string,
    year?: number
  ) => {
    setIsAuthenticated(true);
    localStorage.setItem('smarttrack_delima_auth', 'true');
    setRole(loginRole);
    if (loginRole === 'teacher') {
      if (name || email) {
        setTeacherProfile((prev) => ({
          ...prev,
          name: name || prev.name,
          email: email || prev.email,
          school: school || prev.school,
        }));
      }
      setCurrentView('teacher-dashboard');
      showToast(
        'DELIMa Login Successful',
        `Welcome, ${name || 'Teacher'}! Authenticated via MOE DELIMa.`,
        'success'
      );
    } else {
      const enrollResult = enrollStudentWithDelima({
        name: name || 'Daniel Lee',
        email,
        className: className || '4 BESTARI',
        year: year || 4,
        school,
      });

      setCurrentView('student-world');
      if (enrollResult.classExists) {
        showToast(
          'DELIMa Enrolmen Berjaya',
          `Selamat datang, ${name || 'Murid'}! Anda telah didaftarkan ke dalam kelas ${enrollResult.assignedClass}.`,
          'success'
        );
      } else {
        showToast(
          'Pemberitahuan Kelas Belum Wujud',
          `Kelas "${enrollResult.assignedClass}" belum wujud dalam sistem. Notifikasi telah dihantar kepada Guru / Pentadbir.`,
          'warning'
        );
      }
    }
  };

  const loginDemo = (loginRole: UserRole) => {
    setIsAuthenticated(true);
    localStorage.setItem('smarttrack_delima_auth', 'true');
    setRole(loginRole);
    if (loginRole === 'teacher') {
      setCurrentView('teacher-dashboard');
      showToast('Welcome, Teacher!', `Logged in as ${teacherProfile.name} (MOE Teacher)`, 'success');
    } else {
      setCurrentView('student-world');
      showToast('Welcome, Daniel!', `Logged in as ${selectedStudent?.name || 'Daniel Lee'} (MOE Student)`, 'success');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('smarttrack_delima_auth');
    setCurrentView('landing');
    showToast('Logged Out', 'Signed out from DELIMa / MOE session.', 'info');
  };

  // Student editing helpers (Requirements 2 and 5)
  const updateStudentName = (studentId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const target = students.find((s) => s.id === studentId);
    const oldName = target?.name || studentId;

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, name: trimmed } : s))
    );

    // Sync evidence items
    setEvidenceList((prev) =>
      prev.map((e) => (e.studentId === studentId ? { ...e, studentName: trimmed } : e))
    );

    // Sync interventions
    setInterventions((prev) =>
      prev.map((i) => (i.studentId === studentId ? { ...i, studentName: trimmed } : i))
    );

    addActivityLog({
      actorRole: 'teacher',
      actionType: 'assessment',
      title: `Pupil Renamed: ${trimmed}`,
      details: `Pupil name updated from "${oldName}" to "${trimmed}". All assessments and evidence synced.`,
    });

    showToast('Pupil Name Updated', `Pupil name changed to "${trimmed}"`, 'success');
  };

  const updateStudentAvatar = (studentId: string, avatarUrl: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, avatarUrl } : s))
    );
    showToast('Profile Photo Updated', 'Student profile picture changed successfully.', 'success');
  };

  // Timestamp helper in local format
  const getFormattedTimestamp = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateStr} — ${timeStr}`;
  };

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: getFormattedTimestamp(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    syncActivityLogToCloud(newLog);
  };

  // Teacher actions: Update Student TP
  const updateStudentTP = (
    studentId: string,
    skill: SkillType,
    newTP: TPLevel,
    teacherNote?: string,
    isValidated: boolean = true
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const oldTP = skill === 'Reading'
      ? student.readingTP
      : skill === 'Writing'
      ? student.writingTP
      : skill === 'Listening'
      ? student.listeningTP
      : student.speakingTP;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const updated = { ...s };
        if (skill === 'Reading') {
          updated.readingTP = newTP;
          updated.readingValidated = isValidated;
        } else if (skill === 'Writing') {
          updated.writingTP = newTP;
          updated.writingValidated = isValidated;
        } else if (skill === 'Listening') {
          updated.listeningTP = newTP;
          updated.listeningValidated = isValidated;
        } else if (skill === 'Speaking') {
          updated.speakingTP = newTP;
          updated.speakingValidated = isValidated;
        }

        // Recalculate overall TP roughly
        const tpWeights: Record<TPLevel, number> = { TP1: 1, TP2: 2, TP3: 3, TP4: 4, TP5: 5, TP6: 6 };
        const avg = Math.round(
          (tpWeights[updated.readingTP] +
            tpWeights[updated.writingTP] +
            tpWeights[updated.listeningTP] +
            tpWeights[updated.speakingTP]) / 4
        );
        const tpLabels: TPLevel[] = ['TP1', 'TP1', 'TP2', 'TP3', 'TP4', 'TP5', 'TP6'];
        updated.overallTP = tpLabels[Math.min(6, Math.max(1, avg))];

        if (teacherNote) {
          updated.notes = teacherNote;
        }

        // If speaking or target improved, update intervention status
        if (s.interventionSkill === skill && tpWeights[newTP] > tpWeights[oldTP]) {
          updated.interventionStatus = 'Improving';
        }

        return updated;
      })
    );

    // Also update intervention if linked
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.studentId === studentId && item.skill === skill) {
          const isHigher = Number(newTP.replace('TP', '')) >= Number(item.targetTP.replace('TP', ''));
          return {
            ...item,
            currentTP: newTP,
            status: isHigher ? 'Completed' : item.status,
            improved: isHigher,
            teacherNotes: teacherNote || item.teacherNotes,
          };
        }
        return item;
      })
    );

    // Record activity
    addActivityLog({
      studentId: student.id,
      studentName: student.name,
      actorRole: 'teacher',
      actionType: 'teacher_validation',
      title: `Teacher Validated ${skill} ${newTP}`,
      details: `Official PBD updated from ${oldTP} to ${newTP}. ${teacherNote ? `Note: "${teacherNote}"` : ''}`,
      tpChange: {
        skill,
        from: oldTP,
        to: newTP,
      },
    });

    // Notify student about TP Improvement!
    const tpWeights: Record<TPLevel, number> = { TP1: 1, TP2: 2, TP3: 3, TP4: 4, TP5: 5, TP6: 6 };
    if (tpWeights[newTP] > tpWeights[oldTP]) {
      addStudentNotification({
        studentId: student.id,
        category: 'tp_improved',
        title: `📈 PBD TP Improvement: ${skill} ${oldTP} ➔ ${newTP}!`,
        message: `Great job ${student.name}! Teacher validated your ${skill} proficiency upgrade from ${oldTP} to ${newTP}. Keep aiming high!`,
        priority: 'high',
        actionType: 'open_tp',
        targetSkill: skill,
        targetView: 'parent-summary',
        tpChange: {
          skill,
          from: oldTP,
          to: newTP,
        },
      });
    }

    showToast('PBD Record Saved', `${student.name} ${skill} set to ${newTP} (${isValidated ? 'Teacher Validated' : 'AI Suggestion'})`, 'success');

    // Push updated student to Cloud Firestore so all other devices receive the changes
    const updatedStudentObj = { ...student };
    if (skill === 'Reading') {
      updatedStudentObj.readingTP = newTP;
      updatedStudentObj.readingValidated = isValidated;
    } else if (skill === 'Writing') {
      updatedStudentObj.writingTP = newTP;
      updatedStudentObj.writingValidated = isValidated;
    } else if (skill === 'Listening') {
      updatedStudentObj.listeningTP = newTP;
      updatedStudentObj.listeningValidated = isValidated;
    } else if (skill === 'Speaking') {
      updatedStudentObj.speakingTP = newTP;
      updatedStudentObj.speakingValidated = isValidated;
    }
    syncStudentToCloud(updatedStudentObj);
  };

  // Add Evidence
  const addEvidence = (item: Omit<EvidenceItem, 'id' | 'date' | 'time'>) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newEvidence: EvidenceItem = {
      ...item,
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      date,
      time,
    };

    setEvidenceList((prev) => [newEvidence, ...prev]);

    addActivityLog({
      studentId: item.studentId,
      studentName: item.studentName,
      actorRole: 'student',
      actionType: 'evidence_upload',
      title: `Uploaded ${item.skill} Evidence`,
      details: `Added "${item.activityTitle}" to English Portfolio. Pending Teacher Review.`,
    });

    addXP(30, `Evidence submission for ${item.activityTitle}`);
    showToast('Evidence Saved to Portfolio', `"${item.activityTitle}" has been added to your digital portfolio!`, 'success');
  };

  // Validate Evidence
  const validateEvidence = (evidenceId: string, tp: TPLevel, feedback: string) => {
    setEvidenceList((prev) =>
      prev.map((e) => {
        if (e.id === evidenceId) {
          return {
            ...e,
            teacherStatus: 'Teacher Validated',
            validatedTP: tp,
            teacherFeedback: feedback,
          };
        }
        return e;
      })
    );

    const ev = evidenceList.find((e) => e.id === evidenceId);
    if (ev) {
      addActivityLog({
        studentId: ev.studentId,
        studentName: ev.studentName,
        actorRole: 'teacher',
        actionType: 'teacher_validation',
        title: `Validated Evidence: ${ev.activityTitle}`,
        details: `Cikgu validated ${ev.skill} at ${tp}. Feedback: "${feedback}"`,
      });
      showToast('Evidence Validated', `Marked as Teacher Validated at ${tp}`, 'success');
    }
  };

  // Intervention handlers
  const addIntervention = (item: Omit<InterventionItem, 'id' | 'date'>) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const newItem: InterventionItem = {
      ...item,
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      date,
    };

    setInterventions((prev) => [newItem, ...prev]);

    // Link to student
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === item.studentId) {
          return {
            ...s,
            interventionSkill: item.skill,
            interventionStatus: 'In Progress',
          };
        }
        return s;
      })
    );

    addActivityLog({
      studentId: item.studentId,
      studentName: item.studentName,
      actorRole: 'teacher',
      actionType: 'assessment',
      title: `Intervention Assigned: ${item.interventionTitle}`,
      details: `Target: ${item.targetDescription} (${item.currentTP} → ${item.targetTP})`,
    });

    // Notify student about newly assigned remedial intervention
    addStudentNotification({
      studentId: item.studentId,
      category: 'intervention_due',
      title: `🚨 Remedial Intervention Due: ${item.interventionTitle}`,
      message: `Teacher assigned an intervention for ${item.skill} (Target: ${item.targetTP}). Complete the remedial task before the deadline.`,
      priority: 'urgent',
      actionType: 'open_intervention',
      targetSkill: item.skill,
      targetId: newItem.id,
      dueDateTime: newItem.dueDateTime || '26 Sept 2026, 11:59 PM',
    });

    showToast('Intervention Assigned', `${item.studentName} assigned to ${item.interventionTitle}`, 'info');
  };

  const updateInterventionStatus = (
    id: string,
    status: 'In Progress' | 'Completed' | 'Pending Review',
    newTP?: TPLevel
  ) => {
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, status };
          if (newTP) {
            updated.currentTP = newTP;
            updated.improved = true;
          }
          return updated;
        }
        return item;
      })
    );

    const intItem = interventions.find((i) => i.id === id);
    if (intItem && newTP) {
      updateStudentTP(intItem.studentId, intItem.skill, newTP, 'Intervention completed successfully with measured improvement.');
      // trigger celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('🎉 Intervention Complete!', `${intItem.studentName} reached ${newTP}! Improvement detected!`, 'success');
    } else {
      showToast('Intervention Updated', `Status changed to ${status}`, 'info');
    }
  };

  const addInterventionResource = (res: Omit<InterventionResource, 'id'>) => {
    const newRes: InterventionResource = {
      ...res,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    };
    setResources((prev) => [...prev, newRes]);
    showToast('Resource Added', `Added "${res.title}" to Intervention Hub`, 'success');
  };

  // Gamification: XP & Badges
  const addXP = (amount: number, reason: string) => {
    if (!selectedStudent) return;
    const newXP = selectedStudent.xp + amount;
    const newLevel = Math.floor(newXP / 50) + 1;
    const leveledUp = newLevel > selectedStudent.level;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            xp: newXP,
            level: newLevel,
          };
        }
        return s;
      })
    );

    addActivityLog({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      actorRole: 'student',
      actionType: 'xp_earned',
      title: `+${amount} XP Earned!`,
      details: reason,
      xpChange: amount,
    });

    if (leveledUp) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
      addActivityLog({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        actorRole: 'student',
        actionType: 'level_increase',
        title: `🚀 LEVEL UP! Level ${newLevel}`,
        details: `Reached Level ${newLevel} with ${newXP} Total XP! Keep soaring!`,
      });
      showToast('🚀 LEVEL UP!', `Congratulations, you reached Level ${newLevel}!`, 'success');
    }
  };

  const closeCelebration = () => {
    setActiveCelebration(null);
  };

  const awardStars = ({
    skill,
    starsCount,
    exerciseTitle,
    title,
    praiseMessage,
    badgeToUnlock,
    xpBonus = 20,
    silent = false,
  }: {
    skill: SkillType;
    starsCount: number;
    exerciseTitle: string;
    title: string;
    praiseMessage: string;
    badgeToUnlock?: string;
    xpBonus?: number;
    silent?: boolean;
  }) => {
    if (!selectedStudent) return;

    let unlockedBadgeObj: Badge | undefined = undefined;
    if (badgeToUnlock) {
      unlockedBadgeObj = badges.find((b) => b.id === badgeToUnlock);
    }

    const starReward: StarReward = {
      id: `star-rew-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      exerciseName: exerciseTitle,
      skill,
      starsCount,
      xpEarned: xpBonus,
      awardedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      praiseMessage,
      badgeUnlocked: badgeToUnlock,
      badgeName: unlockedBadgeObj?.name,
      badgeIcon: unlockedBadgeObj?.icon,
      icon: '⭐',
    };

    const targetStudentId = selectedStudent.id;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === targetStudentId) {
          const currentStars = s.stars || 0;
          const currentBreakdown = s.starsBreakdown || { reading: 0, speaking: 0, writing: 0, listening: 0 };
          const skillKey = skill.toLowerCase() as keyof typeof currentBreakdown;
          const updatedBreakdown = {
            ...currentBreakdown,
            [skillKey]: (currentBreakdown[skillKey] || 0) + starsCount,
          };
          const shouldAddBadge = badgeToUnlock && !s.badges.includes(badgeToUnlock);
          const newBadges = shouldAddBadge ? [...s.badges, badgeToUnlock!] : s.badges;
          const badgeXP = shouldAddBadge && unlockedBadgeObj ? unlockedBadgeObj.xp : 0;

          return {
            ...s,
            stars: currentStars + starsCount,
            starsBreakdown: updatedBreakdown,
            earnedStarHistory: [starReward, ...(s.earnedStarHistory || [])],
            badges: newBadges,
            xp: s.xp + xpBonus + badgeXP,
          };
        }
        return s;
      })
    );

    addActivityLog({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      actorRole: 'student',
      actionType: 'star_earned',
      skill,
      title: `⭐ ${title} (+${starsCount} Stars)`,
      details: `${praiseMessage} (${exerciseTitle})`,
      xpChange: xpBonus,
    });

    if (!silent) {
      setActiveCelebration({
        title,
        praiseMessage,
        starsCount,
        xpEarned: xpBonus,
        skill,
        exerciseTitle,
        studentName: selectedStudent.name,
        badgeUnlocked: unlockedBadgeObj
          ? {
              id: unlockedBadgeObj.id,
              name: unlockedBadgeObj.name,
              description: unlockedBadgeObj.description,
              icon: unlockedBadgeObj.icon,
            }
          : undefined,
      });

      showToast(`⭐ +${starsCount} Stars Earned!`, praiseMessage, 'success');
    }
  };

  const unlockBadge = (badgeId: string) => {
    if (!selectedStudent) return;
    if (selectedStudent.badges.includes(badgeId)) return;

    const badge = badges.find((b) => b.id === badgeId);
    if (!badge) return;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            badges: [...s.badges, badgeId],
            xp: s.xp + badge.xp,
          };
        }
        return s;
      })
    );

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    addActivityLog({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      actorRole: 'student',
      actionType: 'badge_unlocked',
      title: `🏆 Badge Unlocked: ${badge.name}`,
      details: `${badge.description} (+${badge.xp} XP)`,
      xpChange: badge.xp,
    });

    addStudentNotification({
      studentId: selectedStudent.id,
      category: 'badge_unlocked',
      title: `🏆 New Badge Earned: ${badge.name}!`,
      message: `Congratulations! You unlocked the ${badge.name} badge (${badge.description}) and earned +${badge.xp} XP!`,
      priority: 'medium',
      actionType: 'open_badge',
      targetView: 'student-portfolio',
      badgeIcon: badge.icon,
      badgeName: badge.name,
      xpBonus: badge.xp,
    });

    setActiveCelebration({
      title: `🏆 New Badge Unlocked!`,
      praiseMessage: `${badge.name}: ${badge.description}`,
      starsCount: 2,
      xpEarned: badge.xp,
      skill: (badge.category === 'General' ? 'Reading' : badge.category) as SkillType,
      exerciseTitle: 'Skill Milestone Mastered',
      studentName: selectedStudent.name,
      badgeUnlocked: {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      },
    });

    showToast(`🏆 Badge Unlocked: ${badge.name}!`, `+${badge.xp} XP added to your profile!`, 'success');
  };

  // Weekly mission toggle
  const toggleMissionTask = (skill: SkillType) => {
    setWeeklyMission((prev) => {
      const updatedSkills = prev.skills.map((item) => {
        if (item.skill === skill) {
          const nextVal = !item.completed;
          if (nextVal) {
            addXP(item.xp, `Completed Weekly Mission task for ${skill}`);
          }
          return { ...item, completed: nextVal };
        }
        return item;
      });

      const completedCount = updatedSkills.filter((s) => s.completed).length;

      // Update student count
      if (selectedStudent) {
        setStudents((sList) =>
          sList.map((s) =>
            s.id === selectedStudent.id
              ? { ...s, weeklyMissionsCompleted: completedCount }
              : s
          )
        );
      }

      if (completedCount === updatedSkills.length) {
        unlockBadge('badge-mission-master');
      }

      return {
        ...prev,
        skills: updatedSkills,
      };
    });
  };

  // Class Management
  const createClass = (name: string, year: number, academicYear: string) => {
    const newClass: ClassGroup = {
      id: `class-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name: name.toUpperCase(),
      year,
      academicYear,
      studentCount: 0,
      averageTP: {
        reading: 3.0,
        writing: 3.0,
        listening: 3.0,
        speaking: 3.0,
        overall: 3.0,
      },
    };
    setClasses((prev) => [...prev, newClass]);
    syncClassToCloud(newClass);
    showToast('Class Created', `Class ${newClass.name} added successfully.`, 'success');
  };

  const updateClass = (
    id: string,
    updates: { name: string; year: number; academicYear: string }
  ) => {
    const targetClass = classes.find((c) => c.id === id);
    if (!targetClass) return;

    const oldName = targetClass.name;
    const newName = updates.name.trim().toUpperCase();
    const nameChanged = oldName !== newName;

    const updatedCls: ClassGroup = {
      ...targetClass,
      name: newName,
      year: updates.year,
      academicYear: updates.academicYear,
    };
    syncClassToCloud(updatedCls);

    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id === id) {
          return updatedCls;
        }
        return cls;
      })
    );

    // If the name changed, update all students belonging to this class
    if (nameChanged) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.className === oldName) {
            return {
              ...s,
              className: newName,
              year: updates.year,
            };
          }
          return s;
        })
      );

      // Also update interventions referencing this class
      setInterventions((prev) =>
        prev.map((item) => {
          if (item.className === oldName) {
            return { ...item, className: newName };
          }
          return item;
        })
      );
    }

    addActivityLog({
      actorRole: 'teacher',
      actionType: 'assessment',
      title: `Class Updated: ${newName}`,
      details: `Class ${oldName} updated to ${newName} (Year ${updates.year}, ${updates.academicYear}). All enrolled student records synced.`,
    });

    showToast(
      'Class Updated',
      `Class ${oldName} renamed to ${newName} successfully.`,
      'success'
    );
  };

  const deleteClass = (id: string, reassignToClassId?: string) => {
    if (classes.length <= 1) {
      showToast('Cannot Remove Class', 'You must maintain at least one class in the system.', 'warning');
      return;
    }

    const classToRemove = classes.find((c) => c.id === id);
    if (!classToRemove) return;

    const targetClass = reassignToClassId ? classes.find((c) => c.id === reassignToClassId) : null;
    const enrolledStudents = students.filter((s) => s.className === classToRemove.name);

    if (targetClass) {
      // Reassign students to target class
      setStudents((prev) =>
        prev.map((s) => {
          if (s.className === classToRemove.name) {
            return {
              ...s,
              className: targetClass.name,
              year: targetClass.year,
            };
          }
          return s;
        })
      );

      // Also update interventions
      setInterventions((prev) =>
        prev.map((item) => {
          if (item.className === classToRemove.name) {
            return { ...item, className: targetClass.name };
          }
          return item;
        })
      );

      // Update target class student count
      setClasses((prev) =>
        prev
          .filter((c) => c.id !== id)
          .map((c) =>
            c.id === targetClass.id
              ? { ...c, studentCount: c.studentCount + enrolledStudents.length }
              : c
          )
      );
    } else {
      // Delete without reassigning: remove enrolled students
      setStudents((prev) => prev.filter((s) => s.className !== classToRemove.name));
      setClasses((prev) => prev.filter((c) => c.id !== id));
    }

    // If currently selected class was deleted, switch selection to first remaining
    if (selectedClassId === id) {
      const remaining = classes.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
    }

    addActivityLog({
      actorRole: 'teacher',
      actionType: 'assessment',
      title: `Class Removed: ${classToRemove.name}`,
      details: targetClass
        ? `Class ${classToRemove.name} removed. ${enrolledStudents.length} pupils reassigned to ${targetClass.name}.`
        : `Class ${classToRemove.name} removed along with pupil records.`,
    });

    showToast(
      'Class Removed',
      `Class ${classToRemove.name} has been removed.`,
      'info'
    );
  };

  const importStudents = (newStudentList: Partial<Student>[], defaultTargetClass?: string) => {
    if (!newStudentList || newStudentList.length === 0) return;

    // Group students by their resolved class and year
    const classGroupsMap = new Map<string, { year: number; count: number }>();

    const formatted: Student[] = newStudentList.map((item, index) => {
      const id = `std-imported-${Date.now()}-${index}`;
      const resolvedClass = item.className || defaultTargetClass || '3 INOVATIF';
      const resolvedYear = item.year || 3;

      const group = classGroupsMap.get(resolvedClass) || { year: resolvedYear, count: 0 };
      group.count++;
      classGroupsMap.set(resolvedClass, group);

      return {
        id,
        name: item.name || `Pupil ${index + 1}`,
        email: item.email || `pupil${index + 1}@moe-dl.edu.my`,
        year: resolvedYear,
        className: resolvedClass,
        readingTP: item.readingTP || 'TP3',
        writingTP: item.writingTP || 'TP3',
        listeningTP: item.listeningTP || 'TP3',
        speakingTP: item.speakingTP || 'TP3',
        overallTP: item.readingTP || 'TP3',
        // Important: Newly imported students start with AI baseline suggestion, NOT teacher validated!
        readingValidated: false,
        writingValidated: false,
        listeningValidated: false,
        speakingValidated: false,
        historicalTP: [
          { month: 'September', tp: item.readingTP || 'TP3', reading: item.readingTP || 'TP3', writing: item.writingTP || 'TP3', listening: item.listeningTP || 'TP3', speaking: item.speakingTP || 'TP3' },
        ],
        xp: 120,
        level: 2,
        streakDays: 1,
        badges: ['badge-reading-explorer'],
        lastActive: 'Just now',
        interventionStatus: 'None',
        weeklyMissionsCompleted: 0,
        totalWeeklyMissions: 4,
        notes: `Imported via Spreadsheet (${resolvedClass} - Year ${resolvedYear}). AI baseline suggested; Teacher validation required.`,
      };
    });

    setStudents((prev) => [...prev, ...formatted]);

    // Update classes: create any missing classes and update student counts
    let targetClassIdToSelect = '';
    setClasses((prev) => {
      let updatedClasses = [...prev];

      classGroupsMap.forEach((info, clsName) => {
        const existingIndex = updatedClasses.findIndex(
          (c) => c.name.toLowerCase().trim() === clsName.toLowerCase().trim()
        );

        if (existingIndex !== -1) {
          // Update count for existing class
          updatedClasses[existingIndex] = {
            ...updatedClasses[existingIndex],
            studentCount: updatedClasses[existingIndex].studentCount + info.count,
          };
          if (!targetClassIdToSelect) {
            targetClassIdToSelect = updatedClasses[existingIndex].id;
          }
        } else {
          // Auto-create newly detected class!
          const newId = `class-${clsName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
          const newClassObj: ClassGroup = {
            id: newId,
            name: clsName,
            year: info.year,
            academicYear: '2026/2027',
            studentCount: info.count,
            averageTP: {
              reading: 3.0,
              writing: 3.0,
              listening: 3.0,
              speaking: 3.0,
              overall: 3.0,
            },
          };
          updatedClasses.push(newClassObj);
          if (!targetClassIdToSelect) {
            targetClassIdToSelect = newId;
          }
        }
      });

      return updatedClasses;
    });

    if (targetClassIdToSelect) {
      setSelectedClassId(targetClassIdToSelect);
    }

    const firstClassGroup = Array.from(classGroupsMap.keys())[0] || defaultTargetClass || 'Class';
    const firstYear = Array.from(classGroupsMap.values())[0]?.year || 3;

    addActivityLog({
      actorRole: 'teacher',
      actionType: 'assessment',
      title: `Imported ${formatted.length} Students (${firstClassGroup})`,
      details: `Batch imported from spreadsheet. Year ${firstYear} synced with class "${firstClassGroup}". Baseline TP3 generated (Teacher validation pending).`,
    });

    showToast(
      'Import Spreadsheet Berjaya!',
      `${formatted.length} orang murid dimasukkan ke kelas ${firstClassGroup} (Tahun ${firstYear}) dengan cadangan TP Baseline AI.`,
      'success'
    );
  };

  const currentStudent =
    (selectedStudentId ? students.find((s) => s.id === selectedStudentId) : null) ||
    students.find((s) => s.id === 'std-daniel-lee' || s.id === 'std-3' || s.name.toLowerCase().includes('daniel')) ||
    students[0] ||
    null;

  const triggerCelebration = () => {
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const claimMissionReward = () => {
    addXP(50, 'Completed Weekly English Mission');
    showToast('Mission Reward Claimed!', '+50 XP awarded for completing weekly English missions.', 'success');
  };

  const saveCompletedTask = (task: Omit<TaskHistoryItem, 'id' | 'completedAt'> & { completedAt?: string }) => {
    const newItem: TaskHistoryItem = {
      ...task,
      id: `hist-${Date.now()}`,
      completedAt:
        task.completedAt ||
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setTaskHistory((prev) => [newItem, ...prev]);
    syncTaskToCloud(newItem);

    const studentName = currentStudent?.name || task.studentName || 'Student';
    const studentId = currentStudent?.id || task.studentId;

    // Trigger notification for teacher on task completed
    addTeacherNotification({
      category: 'task_completed',
      title: `⭐ Task Completed: ${studentName}`,
      message: `${studentName} completed "${task.taskTitle}" (${task.skill}) with score ${task.score}% and earned ${task.starsEarned || 3} stars.`,
      studentName,
      studentId,
      taskTitle: task.taskTitle,
      skill: task.skill,
      score: task.score,
      starsEarned: task.starsEarned || 3,
      priority: 'medium',
      actionType: 'view_student',
    });

    // Trigger notification for student on task completed
    addStudentNotification({
      studentId,
      category: 'task_completed',
      title: `✅ Task Completed: ${task.taskTitle}`,
      message: `You scored ${task.score}% in "${task.taskTitle}" and earned +${task.starsEarned || 3} ⭐ stars! Keep up the momentum!`,
      priority: 'low',
      actionType: 'open_task',
      targetSkill: task.skill === 'Diagnostic' ? 'Reading' : (task.skill as SkillType),
      targetView: 'task-history',
      starsEarned: task.starsEarned || 3,
      xpBonus: task.xpEarned,
    });

    addActivityLog({
      studentId,
      studentName,
      actorRole: 'student',
      actionType: 'assessment',
      title: `Tugasan Selesai: ${task.taskTitle}`,
      details: `${studentName} telah menyiapkan tugasan ${task.skill} dengan skor ${task.score}%.`,
    });

    if (currentStudent) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === currentStudent.id) {
            const completed = s.completedTaskIds || [];
            const taskKey = task.taskTitle;
            const updated = {
              ...s,
              completedTaskIds: completed.includes(taskKey) ? completed : [...completed, taskKey],
            };
            syncStudentToCloud(updated);
            return updated;
          }
          return s;
        })
      );
    }
  };

  const completeFirstTimerStep = (stepSkill: string, calibratedTP?: string) => {
    if (!currentStudent) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === currentStudent.id) {
          const completedSteps = (s as any).firstTimerSteps || [];
          const updatedSteps = completedSteps.includes(stepSkill)
            ? completedSteps
            : [...completedSteps, stepSkill];
          const isAllDone = updatedSteps.length >= 4;

          const updated = { ...s };
          const normalizedSkill = stepSkill.toLowerCase();
          if (calibratedTP) {
            if (normalizedSkill.includes('reading')) updated.readingTP = calibratedTP as TPLevel;
            else if (normalizedSkill.includes('writing')) updated.writingTP = calibratedTP as TPLevel;
            else if (normalizedSkill.includes('speaking')) updated.speakingTP = calibratedTP as TPLevel;
            else if (normalizedSkill.includes('listening')) updated.listeningTP = calibratedTP as TPLevel;
          }

          const finalized = {
            ...updated,
            firstTimerSteps: updatedSteps,
            isFirstTimerCompleted: isAllDone || s.isFirstTimerCompleted,
          };
          syncStudentToCloud(finalized);
          return finalized;
        }
        return s;
      })
    );
  };

  const isTaskLocked = (taskId: string, skill: SkillType, level: number, prereqId?: string): boolean => {
    if (!currentStudent) return false;
    // If first timer diagnostic is not complete and task is beyond level 1, enforce lock
    if (!currentStudent.isFirstTimerCompleted && level > 1) {
      return true;
    }
    // If prerequisite is provided, check if prereq task is completed
    if (prereqId) {
      const completed = currentStudent.completedTaskIds || [];
      return !completed.includes(prereqId);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        role,
        isAdmin,
        user,
        currentView,
        setCurrentView,
        classes,
        selectedClassId,
        setSelectedClassId,
        students,
        selectedStudent,
        setSelectedStudentId,
        evidenceList,
        interventions,
        resources,
        weeklyMission,
        badges,
        activityLogs,
        theme,
        customBgUrl,
        fontSize,
        toasts,
        isAuthenticated,
        setIsAuthenticated,
        loginWithDelima,
        classEnrollmentAlerts,
        teacherNotifications,
        addTeacherNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearTeacherNotifications,
        studentNotifications,
        addStudentNotification,
        markStudentNotificationAsRead,
        markAllStudentNotificationsAsRead,
        clearStudentNotifications,
        activeStudentIntervention,
        setActiveStudentIntervention,
        openStudentInterventionById,
        completeStudentIntervention,
        acceptStudentEnrollment,
        reassignStudentClass,
        createMissingClassAndEnroll,
        enrollStudentWithDelima,
        resolveEnrollmentAlert,
        teacherProfile,
        updateTeacherProfile,
        guruBesarName,
        updateGuruBesarName,
        updateStudentName,
        updateStudentAvatar,
        switchRole,
        loginDemo,
        logout,
        createClass,
        updateClass,
        deleteClass,
        importStudents,
        updateStudentTP,
        addEvidence,
        validateEvidence,
        addIntervention,
        updateInterventionStatus,
        addInterventionResource,
        addXP,
        unlockBadge,
        toggleMissionTask,
        addActivityLog,
        setTheme,
        setCustomBgUrl,
        setFontSize,
        timeFormat,
        setTimeFormat,
        showToast,
        removeToast,
        qrModalStudent,
        setQrModalStudent,
        currentStudent,
        triggerCelebration,
        claimMissionReward,
        awardStars,
        activeCelebration,
        closeCelebration,
        taskHistory,
        saveCompletedTask,
        completeFirstTimerStep,
        isTaskLocked,
        cloudSyncStatus,
        cloudSessions,
        lastCloudSyncTime,
        forceSyncAllToCloud,
      }}
    >
      {children}
      {/* Global Positive Reinforcement Celebration Modal */}
      <StarBadgeCelebrationModal
        isOpen={!!activeCelebration}
        onClose={closeCelebration}
        data={activeCelebration}
        onNavigateToCollection={() => setCurrentView('student-world')}
      />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
