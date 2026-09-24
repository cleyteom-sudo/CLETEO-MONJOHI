export type SkillType = 'Reading' | 'Writing' | 'Listening' | 'Speaking';

export type TPLevel = 'TP1' | 'TP2' | 'TP3' | 'TP4' | 'TP5' | 'TP6';

export type UserRole = 'teacher' | 'student';

export type ThemeType =
  | 'spaceship_stars'
  | 'forest'
  | 'disney_cartoon'
  | 'undersea'
  | 'volcano_future'
  | 'custom'
  | 'galaxy'
  | 'art_school'
  | 'future_robot'
  | 'ocean'
  | 'school'
  | 'formal';

export interface Student {
  id: string;
  name: string;
  email: string;
  year: number;
  className: string;
  avatarUrl?: string;
  readingTP: TPLevel;
  writingTP: TPLevel;
  listeningTP: TPLevel;
  speakingTP: TPLevel;
  overallTP: TPLevel;
  // Validation status: Teacher Validated vs AI-assisted suggestion
  readingValidated: boolean;
  writingValidated: boolean;
  listeningValidated: boolean;
  speakingValidated: boolean;
  historicalTP: {
    month: string;
    tp: TPLevel;
    reading: TPLevel;
    writing: TPLevel;
    listening: TPLevel;
    speaking: TPLevel;
  }[];
  xp: number;
  level: number;
  streakDays: number;
  badges: string[];
  stars?: number;
  starsBreakdown?: {
    reading: number;
    speaking: number;
    writing: number;
    listening: number;
  };
  earnedStarHistory?: StarReward[];
  completedTaskIds?: string[];
  isFirstTimerCompleted?: boolean;
  firstTimerDiagnostic?: {
    speakingDone: boolean;
    readingDone: boolean;
    writingDone: boolean;
    listeningDone: boolean;
    baselineTP?: TPLevel;
  };
  lastActive: string;
  interventionSkill?: SkillType;
  interventionStatus?: 'Needs Intervention' | 'In Progress' | 'Improving' | 'Completed' | 'None';
  weeklyMissionsCompleted: number;
  totalWeeklyMissions: number;
  pendingClassApproval?: boolean;
  targetTeacher?: string;
  enrolledAt?: string;
  notes?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  year: number;
  academicYear: string;
  studentCount: number;
  averageTP: {
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
    overall: number;
  };
}

export interface EvidenceItem {
  id: string;
  studentId: string;
  studentName: string;
  skill: SkillType;
  activityTitle: string;
  date: string;
  time: string;
  evidenceType: 'drawing' | 'image' | 'audio' | 'writing' | 'worksheet' | 'file';
  contentUrl?: string;
  imageUrl?: string;
  textContent?: string;
  audioDuration?: string;
  teacherStatus: 'Pending Review' | 'Teacher Validated';
  teacherFeedback?: string;
  aiSuggestedTP?: TPLevel;
  validatedTP?: TPLevel;
}

export interface ActivityLog {
  id: string;
  studentId?: string;
  studentName?: string;
  actorRole: 'teacher' | 'student';
  actionType:
    | 'assessment'
    | 'evidence_upload'
    | 'intervention_complete'
    | 'xp_earned'
    | 'badge_unlocked'
    | 'level_increase'
    | 'practice_attempt'
    | 'teacher_validation'
    | 'speaking_practice'
    | 'reading_quiz'
    | 'writing_submission'
    | 'drawing_created'
    | 'vocabulary_explored'
    | 'star_earned';
  title: string;
  details: string;
  timestamp: string;
  skill?: SkillType | 'General';
  score?: string;
  xpChange?: number;
  tpChange?: {
    skill: SkillType;
    from: TPLevel;
    to: TPLevel;
  };
}

export interface InterventionItem {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  skill: SkillType;
  currentTP: TPLevel;
  targetTP: TPLevel;
  interventionTitle: string;
  date: string;
  dueDateTime?: string;
  learningStandardCode?: string;
  activities?: string[];
  targetDescription: string;
  status: 'In Progress' | 'Completed' | 'Pending Review';
  teacherNotes?: string;
  improved?: boolean;
}

export interface InterventionResource {
  id: string;
  title: string;
  skill: SkillType;
  description: string;
  url: string;
  resourceType: 'YouTube' | 'Quizizz' | 'Kahoot' | 'Wordwall' | 'Listen & Repeat' | 'Guided Speaking' | 'Reading Practice' | 'Other';
  difficulty: 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced';
  xpReward: number;
}

export interface WeeklyMission {
  id: string;
  weekNumber: number;
  title: string;
  skills: {
    skill: SkillType;
    taskName: string;
    completed: boolean;
    xp: number;
  }[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  category: SkillType | 'General';
}

export interface StarReward {
  id: string;
  title: string;
  exerciseName: string;
  skill: SkillType;
  starsCount: number;
  xpEarned: number;
  awardedAt: string;
  praiseMessage: string;
  badgeUnlocked?: string;
  badgeName?: string;
  badgeIcon?: string;
  icon?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  school: string;
  year?: number;
  className?: string;
  avatarUrl: string;
  bgTheme: ThemeType;
  customBgUrl?: string;
  fontSize: 'normal' | 'large' | 'extra-large';
  notifications: boolean;
}

export interface ClassEnrollmentAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  requestedClass: string;
  requestedYear: number;
  targetTeacher?: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export type NotificationCategory = 'task_completed' | 'new_enrollment' | 'missing_class' | 'system';

export interface TeacherNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  studentName?: string;
  studentEmail?: string;
  studentId?: string;
  className?: string;
  year?: number;
  targetTeacher?: string;
  taskTitle?: string;
  skill?: string;
  score?: number;
  starsEarned?: number;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionType?: 'create_class' | 'accept_enrollment' | 'change_class' | 'view_student';
}

export type StudentNotificationCategory =
  | 'badge_unlocked'
  | 'achievement'
  | 'tp_improved'
  | 'task_due'
  | 'task_completed'
  | 'intervention_due';

export interface StudentNotification {
  id: string;
  studentId?: string;
  category: StudentNotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionType:
    | 'open_intervention'
    | 'open_task'
    | 'open_badge'
    | 'open_tp'
    | 'open_skill';
  targetSkill?: SkillType;
  targetView?: string;
  targetId?: string;
  dueDateTime?: string;
  badgeIcon?: string;
  badgeName?: string;
  starsEarned?: number;
  xpBonus?: number;
  tpChange?: {
    skill: SkillType;
    from: TPLevel;
    to: TPLevel;
  };
}

export interface WritingCorrectionDetail {
  errorWord: string;
  category: 'grammar' | 'vocabulary' | 'punctuation' | 'spelling' | 'structure';
  correction: string;
  explanation: string;
  startIndex?: number;
  endIndex?: number;
}

export interface TaskHistoryItem {
  id: string;
  studentId: string;
  studentName?: string;
  skill: SkillType | 'Diagnostic';
  category: string; // e.g. "Level 1: Phonics & Words", "Level 2: Sentence Builder", "1st Timer Diagnostic"
  taskTitle: string;
  completedAt: string;
  score: number; // 0-100
  starsEarned: number; // 1-3
  xpEarned: number;
  userInputSummary: string; // spoken transcript or written paragraph
  feedbackSummary: string;
  teacherRemarks?: string;
  corrections?: WritingCorrectionDetail[];
  status: 'Completed' | 'Teacher Validated';
  audioDuration?: string;
}

