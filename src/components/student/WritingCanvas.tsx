import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eraser,
  RotateCcw,
  Upload,
  Save,
  ShieldCheck,
  Palette,
  Award,
  Star,
  Trophy,
  Lock,
  ArrowRight,
  History,
  Check,
  ChevronDown,
  Info,
  Building2,
  Shield,
  Gamepad2,
  Flame,
  Move,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  playBadgeFanfare,
  playPopChirp,
  playStarChime,
  playDropSnap,
  playTryAgain,
} from '../../utils/soundEffects';
import { WritingCorrectionDetail } from '../../types';

interface WritingMission {
  id: string;
  level: number;
  title: string;
  category: string;
  topic: string;
  samplePrompt: string;
  defaultText: string;
  targetWordCount: number;
  prereqId?: string;
  xpReward: number;
}

export interface CastleWallChallenge {
  id: string;
  level: number;
  minTP: string;
  title: string;
  fortressSection: string;
  prompt: string;
  subjects: { text: string; isPlural: boolean }[];
  verbs: { text: string; agreesWithPlural: boolean; agreesWithSingular: boolean; tense: string }[];
  objects: { text: string }[];
  correctRuleExplanation: string;
  xpReward: number;
  starsAward: number;
}

export const CASTLE_CHALLENGES: CastleWallChallenge[] = [
  {
    id: 'castle-svo-1',
    level: 1,
    minTP: 'TP2 - TP3',
    title: 'Fortress Gatehouse: Kitten & Yarn',
    fortressSection: 'Gatehouse Keystone Wall',
    prompt: 'Bina tembok gerbang istana dengan memadankan Subjek tunggal/jamak dengan Kata Kerja yang tepat (Subject-Verb Agreement):',
    subjects: [
      { text: 'The playful kitten', isPlural: false },
      { text: 'The playful kittens', isPlural: true },
    ],
    verbs: [
      { text: 'chases', agreesWithPlural: false, agreesWithSingular: true, tense: 'present singular' },
      { text: 'chase', agreesWithPlural: true, agreesWithSingular: false, tense: 'present plural' },
    ],
    objects: [
      { text: 'the ball of red yarn.' },
      { text: 'in the quiet garden.' },
    ],
    correctRuleExplanation: 'Hukum SVA: Subjek tunggal ("The playful kitten") memerlukan kata kerja berakhiran -s ("chases"), manakala subjek jamak ("kittens") berpasangan dengan kata kerja asas ("chase").',
    xpReward: 35,
    starsAward: 3,
  },
  {
    id: 'castle-svo-2',
    level: 2,
    minTP: 'TP3 - TP4',
    title: 'High Watchtower: Brave Astronaut',
    fortressSection: 'Celestial Watchtower Spire',
    prompt: 'Kukuhkan tembok menara tinjau dengan membina ayat aksi ekspedisi angkasa yang gramatis:',
    subjects: [
      { text: 'A brave astronaut', isPlural: false },
      { text: 'Two brave astronauts', isPlural: true },
    ],
    verbs: [
      { text: 'explores', agreesWithPlural: false, agreesWithSingular: true, tense: 'present singular' },
      { text: 'explore', agreesWithPlural: true, agreesWithSingular: false, tense: 'present plural' },
    ],
    objects: [
      { text: 'the crater on the moon.' },
      { text: 'through the galaxy window.' },
    ],
    correctRuleExplanation: 'Tepat! "Two brave astronauts explore" (jamak) atau "A brave astronaut explores" (tunggal) mematuhi DSKP 4.2.1 tatabahasa ayat.',
    xpReward: 45,
    starsAward: 3,
  },
  {
    id: 'castle-svo-3',
    level: 3,
    minTP: 'TP4 - TP5',
    title: 'Royal Keep: Diligent Primary Cadets',
    fortressSection: 'Imperial Inner Sanctum',
    prompt: 'Bina benteng pertahanan istana utama dengan struktur ayat majmuk dan objek bertingkat:',
    subjects: [
      { text: 'Diligent primary pupils', isPlural: true },
      { text: 'A diligent primary pupil', isPlural: false },
    ],
    verbs: [
      { text: 'construct', agreesWithPlural: true, agreesWithSingular: false, tense: 'present plural' },
      { text: 'constructs', agreesWithPlural: false, agreesWithSingular: true, tense: 'present singular' },
    ],
    objects: [
      { text: 'a sturdy fortress bridge.' },
      { text: 'with great teamwork and skill.' },
    ],
    correctRuleExplanation: 'Hebat! Pembinaan subjek, predikat dan objek terikat secara kukuh dengan keselarasan tatabahasa yang sempurna.',
    xpReward: 55,
    starsAward: 4,
  },
];

const WRITING_MISSIONS: WritingMission[] = [
  {
    id: 'wri-mission-1',
    level: 1,
    title: 'Sentence Craft: A Day at the Beach',
    category: 'Level 1: Past Tense & Plurals',
    topic: 'A Day at the Beach',
    samplePrompt: 'Write 2-3 sentences about what you saw and did at the beach.',
    defaultText: 'Yesterday I go to the beach with my family. I see many shell on the warm sand. It was very fun and exciting',
    targetWordCount: 20,
    xpReward: 35,
  },
  {
    id: 'wri-mission-2',
    level: 2,
    title: 'Paragraph Builder: My Best Friend',
    category: 'Level 2: Descriptive Adjectives & SVA',
    topic: 'My Best Friend',
    samplePrompt: 'Describe your best friend, their hobbies, and why you enjoy spending time with them.',
    defaultText: 'My best friend name is Amir. He like to play football every afternoon. We always helps each other with school homework because he is very kind.',
    targetWordCount: 35,
    prereqId: 'wri-mission-1',
    xpReward: 45,
  },
  {
    id: 'wri-mission-3',
    level: 3,
    title: 'Narrative Adventure: The Secret Treehouse',
    category: 'Level 3: Conjunctions & Story Flow',
    topic: 'The Secret Treehouse',
    samplePrompt: 'Write a short story about discovering a secret treehouse in a quiet garden.',
    defaultText: 'One bright morning, siti and me explored the old garden behind our house. Suddenly we noticed a wooden ladder leading up to a hidden treehouse. Inside we found a mysterious wooden box and a brass key.',
    targetWordCount: 50,
    prereqId: 'wri-mission-2',
    xpReward: 55,
  },
];

export const WritingCanvas: React.FC = () => {
  const {
    currentStudent,
    setCurrentView,
    addEvidence,
    triggerCelebration,
    showToast,
    addActivityLog,
    awardStars,
    saveCompletedTask,
    isTaskLocked,
    taskHistory,
  } = useApp();

  const [activeMissionIndex, setActiveMissionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'write' | 'castle-wall' | 'draw' | 'history'>('write');

  // Gamified Castle SVO Wall Builder State (Unlockable Games & New Interaction Styles)
  const [activeCastleIndex, setActiveCastleIndex] = useState(0);
  const currentCastle = CASTLE_CHALLENGES[activeCastleIndex];
  const [chosenSubjectIdx, setChosenSubjectIdx] = useState<number | null>(null);
  const [chosenVerbIdx, setChosenVerbIdx] = useState<number | null>(null);
  const [chosenObjectIdx, setChosenObjectIdx] = useState<number | null>(null);
  const [hasEvaluatedWall, setHasEvaluatedWall] = useState(false);
  const [isWallSound, setIsWallSound] = useState(false);

  useEffect(() => {
    setChosenSubjectIdx(null);
    setChosenVerbIdx(null);
    setChosenObjectIdx(null);
    setHasEvaluatedWall(false);
    setIsWallSound(false);
  }, [activeCastleIndex]);

  const handleCheckWallIntegrity = () => {
    if (chosenSubjectIdx === null || chosenVerbIdx === null || chosenObjectIdx === null) {
      showToast('Lengkapkan Batu Bata Istana', 'Sila pilih Subjek, Kata Kerja (Verb) dan Objek untuk membina tembok!', 'warning');
      return;
    }

    const subj = currentCastle.subjects[chosenSubjectIdx];
    const verb = currentCastle.verbs[chosenVerbIdx];
    const obj = currentCastle.objects[chosenObjectIdx];

    const isGrammaticallySound =
      (subj.isPlural && verb.agreesWithPlural) || (!subj.isPlural && verb.agreesWithSingular);

    setIsWallSound(isGrammaticallySound);
    setHasEvaluatedWall(true);

    if (isGrammaticallySound) {
      playStarChime();
      triggerCelebration();
      awardStars({
        skill: 'Writing',
        starsCount: currentCastle.starsAward,
        exerciseTitle: currentCastle.title,
        title: 'Castle Fortress Architect!',
        praiseMessage: `Sturdy wall built! "${subj.text} ${verb.text} ${obj.text}" has perfect Subject-Verb Agreement.`,
        xpBonus: currentCastle.xpReward,
      });
      saveCompletedTask({
        studentId: currentStudent?.id || 'std-daniel-lee',
        studentName: currentStudent?.name || 'Daniel Lee',
        skill: 'Writing',
        category: currentCastle.title,
        taskTitle: `Castle Wall Builder — ${currentCastle.fortressSection}`,
        score: 100,
        starsEarned: currentCastle.starsAward,
        xpEarned: currentCastle.xpReward,
        userInputSummary: `Constructed sentence: "${subj.text} ${verb.text} ${obj.text}"`,
        feedbackSummary: `Sound wall structure! ${currentCastle.correctRuleExplanation}`,
        teacherRemarks: `Applied correct SVA rules in syntactic fortress construction.`,
        status: 'Completed',
      });
      showToast('Benteng Istana Kukuh! 🏰', `+${currentCastle.starsAward} ⭐ Bintang & +${currentCastle.xpReward} XP diperoleh!`, 'success');
    } else {
      playTryAgain();
      showToast('Tembok Goyah (SVA Mismatch)', 'Periksa keselarasan subjek tunggal/jamak dengan kata kerja!', 'warning');
    }
  };

  const handleResetWall = () => {
    setChosenSubjectIdx(null);
    setChosenVerbIdx(null);
    setChosenObjectIdx(null);
    setHasEvaluatedWall(false);
    setIsWallSound(false);
  };

  const handleNextCastle = () => {
    if (activeCastleIndex < CASTLE_CHALLENGES.length - 1) {
      setActiveCastleIndex((prev) => prev + 1);
    }
  };

  const mission = WRITING_MISSIONS[activeMissionIndex];

  // Writing draft text
  const [draftText, setDraftText] = useState(mission.defaultText);
  const [isChecking, setIsChecking] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  // AI English Teacher Evaluation Results
  const [evaluation, setEvaluation] = useState<{
    contentScore: number;
    vocabularyScore: number;
    structureScore: number;
    spellingScore: number;
    overallScore: number;
    praise: string;
    teacherRemarks: string;
    suggestions: string[];
    betterVersion: string;
    detectedMistakes: WritingCorrectionDetail[];
    suggestedTP: string;
    starsEarned: number;
  } | null>(null);

  // Selected error clicked for interactive explanation popup
  const [inspectedError, setInspectedError] = useState<WritingCorrectionDetail | null>(null);

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  const studentCompletedTasks = currentStudent?.completedTaskIds || ['wri-mission-1'];
  const isFirstTimerDone = currentStudent?.isFirstTimerCompleted ?? true;

  const isCurrentMissionLocked = isTaskLocked
    ? isTaskLocked(mission.id, 'Writing', mission.level, mission.prereqId)
    : !isFirstTimerDone && mission.level > 1;

  // Sync draft when mission changes
  useEffect(() => {
    setDraftText(mission.defaultText);
    setHasEvaluated(false);
    setEvaluation(null);
    setInspectedError(null);
  }, [activeMissionIndex]);

  // AI Evaluation Call
  const handleCheckWriting = async () => {
    if (!draftText.trim()) return;
    setIsChecking(true);
    setInspectedError(null);

    try {
      const res = await fetch('/api/gemini/writing-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: draftText,
          topic: mission.topic,
        }),
      });

      const data = await res.json();
      const mistakes: WritingCorrectionDetail[] = data.detectedMistakes || data.corrections || [];
      const score = data.overallScore || data.score || 85;

      let stars = 3;
      if (mistakes.length >= 4 || score < 65) stars = 1;
      else if (mistakes.length >= 2 || score < 80) stars = 2;

      const evalData = {
        contentScore: data.contentScore || 4,
        vocabularyScore: data.vocabularyScore || 3,
        structureScore: data.structureScore || 3,
        spellingScore: data.spellingScore || 4,
        overallScore: score,
        praise: data.praise || 'Well done! You shared clear and descriptive ideas in your writing.',
        teacherRemarks:
          data.teacherRemarks ||
          `Cikgu English Remarks: You have imaginative sentences! Look at the red-underlined errors below to see how to fix past tense and plurals. Click each one to learn the grammar rule.`,
        suggestions: data.suggestions || [
          'Use past tense verbs for past events (go -> went).',
          'Add -s to plural nouns after many.',
          'Always end sentences with full stops.',
        ],
        betterVersion:
          data.betterVersion ||
          'Yesterday I went to the beach with my family. I saw many shells on the warm sand. It was very fun and exciting.',
        detectedMistakes: mistakes,
        suggestedTP: data.suggestedTP || 'TP4',
        starsEarned: stars,
      };

      setEvaluation(evalData);
      setHasEvaluated(true);
      playStarChime();
      triggerCelebration();

      awardStars({
        skill: 'Writing',
        starsCount: stars,
        exerciseTitle: `Writing Workshop: ${mission.title}`,
        title: `${stars} ⭐ Writing Craft Star!`,
        praiseMessage: evalData.praise,
        xpBonus: mission.xpReward,
      });

      saveCompletedTask({
        studentId: currentStudent?.id || 'std-daniel-lee',
        studentName: currentStudent?.name || 'Daniel Lee',
        skill: 'Writing',
        category: mission.category,
        taskTitle: mission.title,
        score,
        starsEarned: stars,
        xpEarned: mission.xpReward,
        userInputSummary: draftText,
        feedbackSummary: evalData.praise,
        teacherRemarks: evalData.teacherRemarks,
        corrections: mistakes,
        status: 'Completed',
      });

      addEvidence({
        studentId: currentStudent?.id || 'std-3',
        studentName: currentStudent?.name || 'Daniel Lee',
        skill: 'Writing',
        activityTitle: `Writing Workshop — ${mission.title}`,
        evidenceType: 'writing',
        textContent: `Draft: "${draftText}". Corrected: "${evalData.betterVersion}". Found ${mistakes.length} correction points.`,
        teacherStatus: 'Pending Review',
        aiSuggestedTP: (evalData.suggestedTP as any) || 'TP4',
      });

      showToast('Grammar Checked!', `AI English Teacher reviewed your paragraph with ${mistakes.length} corrections.`, 'success');
    } catch (err) {
      console.warn('Writing check API fallback:', err);
    } finally {
      setIsChecking(false);
    }
  };

  // Apply single correction to draftText
  const applyCorrection = (mistake: WritingCorrectionDetail) => {
    const regex = new RegExp(`\\b${mistake.errorWord}\\b`, 'i');
    if (regex.test(draftText)) {
      const newText = draftText.replace(regex, mistake.correction);
      setDraftText(newText);
      showToast('Applied Correction', `Changed "${mistake.errorWord}" to "${mistake.correction}"`, 'success');
      setInspectedError(null);
    }
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.strokeStyle = isEraser ? '#0f172a' : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Render text with interactive red underlines on errors
  const renderInteractiveText = () => {
    if (!evaluation || !evaluation.detectedMistakes || evaluation.detectedMistakes.length === 0) {
      return <span>{draftText}</span>;
    }

    const mistakes = evaluation.detectedMistakes;
    const wordsList = draftText.split(/(\s+|[.,!?;:])/);

    return wordsList.map((token, idx) => {
      const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchedMistake = mistakes.find(
        (m) =>
          m.errorWord.toLowerCase() === cleanToken ||
          m.errorWord.toLowerCase() === token.toLowerCase().trim() ||
          (cleanToken && m.errorWord.toLowerCase().includes(cleanToken))
      );

      if (matchedMistake && cleanToken.length > 0) {
        return (
          <span
            key={idx}
            onClick={() => setInspectedError(matchedMistake)}
            className="inline-block relative cursor-pointer px-1 py-0.5 rounded transition-all duration-200 bg-red-500/10 text-red-200 border-b-2 border-dashed border-red-500 hover:bg-red-500/25 hover:scale-105 font-bold mx-0.5 shadow-sm"
            title="Click to see error rule & correction"
          >
            {token}
            <span className="text-[10px] text-red-400 ml-0.5">!</span>
          </span>
        );
      }

      return <span key={idx}>{token}</span>;
    });
  };

  const writingHistory = taskHistory.filter((item: any) => item.skill === 'Writing');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/50 to-slate-900 border border-purple-500/30 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-xs uppercase border border-purple-500/30 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              <span>English Writing Studio</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-amber-400" />
              <span>Cikgu AI Real-Time Teacher</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            🏰 Writing Castle & Workshop
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Compose paragraphs and press "Check My Writing". The AI English Teacher underlines errors in red
            with detailed grammar rules, explanations, and polished versions.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 gap-1">
          <button
            onClick={() => setActiveTab('write')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'write'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Writing Studio
          </button>
          <button
            onClick={() => setActiveTab('castle-wall')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'castle-wall'
                ? 'bg-gradient-to-r from-purple-600 via-amber-600 to-rose-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Castle SVO Builder</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
              TP3+
            </span>
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'draw'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Sketch & Draw</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({writingHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Writing Roadmap Level Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {WRITING_MISSIONS.map((m, idx) => {
          const isDone = studentCompletedTasks.includes(m.id);
          const isCurrent = activeMissionIndex === idx;
          const isLocked = isTaskLocked
            ? isTaskLocked(m.id, 'Writing', m.level, m.prereqId)
            : !isFirstTimerDone && m.level > 1;

          return (
            <button
              key={m.id}
              onClick={() => {
                if (!isLocked) {
                  setActiveMissionIndex(idx);
                } else {
                  showToast('Task Locked 🔒', 'Complete the previous level writing task to unlock this activity!', 'info');
                }
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-purple-500/20 border-purple-400 ring-2 ring-purple-400/40 text-white'
                  : isDone
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                  : !isLocked
                  ? 'bg-slate-950/40 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                  {m.category}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Ready
                  </span>
                )}
              </div>
              <div className="font-black text-sm text-white line-clamp-1">{m.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>+{m.xpReward} XP</span>
                <span className="text-amber-400 font-bold">+3 ⭐</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === 'write' ? (
        isCurrentMissionLocked ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">This Writing Activity is Locked 🔒</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {!isFirstTimerDone
                ? 'Please complete the mandatory 1st Timer Diagnostic Guide first to unlock the learning arenas!'
                : 'Complete the previous level writing task first to unlock this quest.'}
            </p>
            {!isFirstTimerDone && (
              <button
                onClick={() => setCurrentView('first-timer')}
                className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Go to 1st Timer Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Topic & Prompt Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-400 uppercase tracking-wider">
                  Writing Topic: {mission.topic}
                </span>
                <span className="text-slate-400">Target: ~{mission.targetWordCount} words</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{mission.samplePrompt}</p>
            </div>

            {/* Main Text Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300">Your Student Paragraph Draft:</label>
                <span className="text-slate-400">
                  Words:{' '}
                  <strong className="text-white">
                    {draftText.trim().split(/\s+/).filter(Boolean).length}
                  </strong>
                </span>
              </div>

              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                rows={4}
                placeholder="Type your paragraph here..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-400 font-medium resize-none leading-relaxed"
              />
            </div>

            {/* Check Grammar Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                onClick={handleCheckWriting}
                disabled={isChecking || !draftText.trim()}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2.5 shadow-xl shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'AI English Teacher is Evaluating...' : 'Check My Writing & Grammar (Red Underline)'}</span>
              </button>

              {hasEvaluated && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Evaluation Completed</span>
                </span>
              )}
            </div>

            {/* Interactive Red-Underlined Paragraph Preview */}
            {hasEvaluated && evaluation && (
              <div className="p-6 rounded-2xl bg-slate-950 border border-red-500/30 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Teacher Underlined Review ({evaluation.detectedMistakes.length} errors found)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click any <span className="text-red-400 font-bold underline">red-underlined word</span> to see the rule & fix!
                  </span>
                </div>

                {/* The Interactive Annotated Text */}
                <div className="text-sm sm:text-base leading-loose text-slate-200 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  {renderInteractiveText()}
                </div>

                {/* Popover / Inspector Card when a red error is clicked */}
                {inspectedError && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/50 text-xs text-slate-200 shadow-2xl space-y-2 animate-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                        {inspectedError.category} Error
                      </span>
                      <button
                        onClick={() => setInspectedError(null)}
                        className="text-slate-500 hover:text-white cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div>
                      <span className="text-slate-400">What is the error: </span>
                      <strong className="text-red-400 font-mono text-sm">
                        "{inspectedError.errorWord}"
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400">How / Why it is an error: </span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed font-medium">
                        {inspectedError.explanation}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400">Corrected word: </span>
                        <span className="font-bold text-emerald-400 font-mono text-sm">
                          "{inspectedError.correction}"
                        </span>
                      </div>
                      <button
                        onClick={() => applyCorrection(inspectedError)}
                        className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Correction</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Polished Correct Paragraph (Side-by-Side) */}
            {hasEvaluated && evaluation && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Real & Correct Master Paragraph After Teacher Evaluation</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>+{evaluation.starsEarned} ⭐ Stars</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm sm:text-base leading-relaxed text-emerald-100 font-medium">
                  "{evaluation.betterVersion}"
                </div>

                {/* Remarks & Scores */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-cyan-300">{evaluation.teacherRemarks}</div>
                  <div className="flex flex-wrap gap-4 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>
                      Grammar Score: <strong className="text-white">{evaluation.overallScore}%</strong>
                    </span>
                    <span>•</span>
                    <span>
                      DSKP Calibrated Band: <strong className="text-amber-300">{evaluation.suggestedTP}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      ) : activeTab === 'draw' ? (
        /* Drawing Canvas Tab */
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white">Story Illustration & Mind-Map Canvas</h3>
              <p className="text-xs text-slate-400">Sketch a scene or illustration for your story paragraph.</p>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setBrushColor(color);
                    setIsEraser(false);
                  }}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    brushColor === color && !isEraser ? 'scale-125 ring-2 ring-white' : ''
                  }`}
                />
              ))}
              <button
                onClick={() => setIsEraser(true)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isEraser ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>
              <button
                onClick={clearCanvas}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                title="Clear Canvas"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner flex justify-center">
            <canvas
              ref={canvasRef}
              width={700}
              height={380}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair w-full max-w-[700px] h-[380px] touch-none"
            />
          </div>
        </div>
      ) : activeTab === 'castle-wall' ? (
        /* Gamified Castle SVO Wall Builder Tab */
        <div className="space-y-6">
          {/* Challenge Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CASTLE_CHALLENGES.map((challenge, idx) => {
              const isCurrent = activeCastleIndex === idx;
              return (
                <button
                  key={challenge.id}
                  onClick={() => setActiveCastleIndex(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-gradient-to-br from-purple-500/20 via-amber-500/20 to-slate-900 border-amber-400 ring-2 ring-amber-400/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Level {challenge.level} Fortress</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {challenge.minTP}
                    </span>
                  </div>
                  <div className="font-black text-sm text-white line-clamp-1">{challenge.title}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span className="text-purple-300 font-semibold">{challenge.fortressSection}</span>
                    <span className="text-amber-400 font-bold">+{challenge.starsAward} ⭐</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Castle Arena Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  <Building2 className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase border border-purple-500/30">
                      SVO Fortress Wall
                    </span>
                    <span className="text-xs text-amber-300 font-bold">{currentCastle.fortressSection}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">{currentCastle.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetWall}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Tembok</span>
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Misi Pembinaan:</span> {currentCastle.prompt}
              </div>
            </div>

            {/* Visual Castle Keystone Wall Construction */}
            <div
              className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                hasEvaluatedWall
                  ? isWallSound
                    ? 'bg-gradient-to-r from-emerald-950/40 via-amber-950/30 to-slate-900 border-amber-400 shadow-2xl shadow-amber-500/20'
                    : 'bg-rose-950/30 border-rose-500/50'
                  : 'bg-slate-950/80 border-purple-500/30'
              }`}
            >
              <div className="text-xs font-black text-amber-400 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>BENTENG AYAT KELAS PERTAMA (SVO WALL FOUNDATION)</span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Slot 1: Subject */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                    [ 1. SUBJEK / SUBJECT ]
                  </span>
                  <div
                    className={`p-3 rounded-xl min-h-[50px] flex items-center justify-center font-black text-sm border ${
                      chosenSubjectIdx !== null
                        ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                        : 'bg-slate-950 border-dashed border-slate-700 text-slate-500'
                    }`}
                  >
                    {chosenSubjectIdx !== null
                      ? currentCastle.subjects[chosenSubjectIdx].text
                      : 'Pilih Subjek di bawah'}
                  </div>
                </div>

                {/* Slot 2: Verb */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                    [ 2. KATA KERJA / VERB ]
                  </span>
                  <div
                    className={`p-3 rounded-xl min-h-[50px] flex items-center justify-center font-black text-sm border ${
                      chosenVerbIdx !== null
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-slate-950 border-dashed border-slate-700 text-slate-500'
                    }`}
                  >
                    {chosenVerbIdx !== null
                      ? currentCastle.verbs[chosenVerbIdx].text
                      : 'Pilih Verb di bawah'}
                  </div>
                </div>

                {/* Slot 3: Object */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    [ 3. OBJEK / OBJECT ]
                  </span>
                  <div
                    className={`p-3 rounded-xl min-h-[50px] flex items-center justify-center font-black text-sm border ${
                      chosenObjectIdx !== null
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-slate-950 border-dashed border-slate-700 text-slate-500'
                    }`}
                  >
                    {chosenObjectIdx !== null
                      ? currentCastle.objects[chosenObjectIdx].text
                      : 'Pilih Objek di bawah'}
                  </div>
                </div>
              </div>

              {/* Complete Assembled Sentence Preview */}
              {chosenSubjectIdx !== null && chosenVerbIdx !== null && chosenObjectIdx !== null && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center">
                  <span className="text-xs text-slate-400 font-medium">Ayat Terbina: </span>
                  <span className="text-sm font-black text-white ml-1">
                    "{currentCastle.subjects[chosenSubjectIdx].text} {currentCastle.verbs[chosenVerbIdx].text}{' '}
                    {currentCastle.objects[chosenObjectIdx].text}"
                  </span>
                </div>
              )}
            </div>

            {/* Selection Palettes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subject Choices */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                  <span>Pilih Subjek:</span>
                  <span className="text-[10px] text-slate-400">Tunggal / Jamak</span>
                </div>
                <div className="space-y-2">
                  {currentCastle.subjects.map((s, idx) => {
                    const isSelected = chosenSubjectIdx === idx;
                    return (
                      <button
                        key={s.text}
                        onClick={() => {
                          if (!hasEvaluatedWall) {
                            playDropSnap();
                            setChosenSubjectIdx(idx);
                          }
                        }}
                        disabled={hasEvaluatedWall}
                        className={`w-full p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span>{s.text}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {s.isPlural ? 'Plural' : 'Singular'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Verb Choices */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                  <span>Pilih Kata Kerja:</span>
                  <span className="text-[10px] text-slate-400">Keselarasan SVA</span>
                </div>
                <div className="space-y-2">
                  {currentCastle.verbs.map((v, idx) => {
                    const isSelected = chosenVerbIdx === idx;
                    return (
                      <button
                        key={v.text}
                        onClick={() => {
                          if (!hasEvaluatedWall) {
                            playDropSnap();
                            setChosenVerbIdx(idx);
                          }
                        }}
                        disabled={hasEvaluatedWall}
                        className={`w-full p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-600/30 border-amber-400 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span>{v.text}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {v.tense}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Object Choices */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                  <span>Pilih Objek:</span>
                  <span className="text-[10px] text-slate-400">Penyudah Ayat</span>
                </div>
                <div className="space-y-2">
                  {currentCastle.objects.map((o, idx) => {
                    const isSelected = chosenObjectIdx === idx;
                    return (
                      <button
                        key={o.text}
                        onClick={() => {
                          if (!hasEvaluatedWall) {
                            playDropSnap();
                            setChosenObjectIdx(idx);
                          }
                        }}
                        disabled={hasEvaluatedWall}
                        className={`w-full p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <span className="line-clamp-1">{o.text}</span>
                        <span className="text-emerald-400 text-xs">✓</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Check Button & Outcome */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {!hasEvaluatedWall ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Ganjaran Seni Bina: <span className="text-amber-400 font-bold">+{currentCastle.starsAward} ⭐</span> &{' '}
                    <span className="text-purple-400 font-bold">+{currentCastle.xpReward} XP</span>
                  </div>
                  <button
                    onClick={handleCheckWallIntegrity}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-amber-600 to-rose-600 hover:from-purple-500 hover:to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-purple-500/25 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Building2 className="w-5 h-5 text-amber-300" />
                    <span>UJI KETEGANGAN TEMBOK (CHECK WALL INTEGRITY)</span>
                  </button>
                </div>
              ) : (
                <div
                  className={`p-5 rounded-2xl border ${
                    isWallSound
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isWallSound ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-black text-sm flex items-center gap-2">
                        <span>{isWallSound ? 'Benteng Tembok Istana Teguh! 🏰✨' : 'Tembok Goyah (SVA Mismatch)!'}</span>
                        {isWallSound && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                            +{currentCastle.starsAward} ⭐ Stars Awarded
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 text-slate-200">{currentCastle.correctRuleExplanation}</p>
                      <div className="mt-3 flex items-center gap-3">
                        {!isWallSound ? (
                          <button
                            onClick={handleResetWall}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Susun Semula Batu Bata
                          </button>
                        ) : activeCastleIndex < CASTLE_CHALLENGES.length - 1 ? (
                          <button
                            onClick={handleNextCastle}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                          >
                            <span>Bina Bahagian Istana Seterusnya</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span>Seluruh Kubu Istana Bahasa Inggeris telah siap dibina dengan teguh!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="space-y-3">
          {writingHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-900 border border-slate-800">
              No writing submissions recorded yet. Check your paragraph in the Writing Studio tab!
            </div>
          ) : (
            writingHistory.map((h: any) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{h.taskTitle}</div>
                  <div className="text-slate-400 mt-0.5 line-clamp-1 italic">"{h.userInputSummary}"</div>
                  <div className="text-purple-300 text-[11px] mt-1">{h.feedbackSummary}</div>
                </div>
                <div className="text-right">
                  <div className="text-amber-400 font-bold">+{h.starsEarned} ⭐ Stars</div>
                  <div className="text-slate-500 text-[10px]">{h.completedAt}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
