import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Star,
  Trophy,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  History,
  Check,
  Move,
  Clock,
  Zap,
  HelpCircle,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  playBadgeFanfare,
  playPopChirp,
  playStarChime,
  playDropSnap,
  playTryAgain,
} from '../../utils/soundEffects';

interface ListeningTask {
  id: string;
  level: number;
  minTP: string;
  title: string;
  category: string;
  passageToSpeak: string;
  speaker: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  xpReward: number;
  starsAward: number;
  explanation: string;
  gamificationStyle: 'Drag & Drop Answer Box' | 'Speed Audio Buster' | 'Audio Detective Clues';
  prereqId?: string;
  audioClues?: string[];
}

const LISTENING_TASKS: ListeningTask[] = [
  {
    id: 'list-task-1',
    level: 1,
    minTP: 'TP1 - TP2',
    title: 'Phonics & Animals Sound Quest',
    category: 'Level 1: Foundational Phonics',
    speaker: 'Ranger Adam',
    passageToSpeak:
      'Deep inside Taman Negara, a brave little mousedeer tapped its tiny hooves on the dry fallen leaves. Suddenly, a green hornbill called loudly from the tall tree branch!',
    question: 'Which animal called loudly from the tall tree branch?',
    options: [
      'A ferocious tiger',
      'A green hornbill',
      'A little mousedeer',
      'A sleepy owl',
    ],
    correctOptionIndex: 1,
    xpReward: 30,
    starsAward: 3,
    explanation: 'The green hornbill called loudly from the branch, while the mousedeer tapped its hooves.',
    gamificationStyle: 'Drag & Drop Answer Box',
  },
  {
    id: 'list-task-2',
    level: 2,
    minTP: 'TP3',
    title: 'School Canteen Order Dialogue',
    category: 'Level 2: Conversational Comprehension',
    prereqId: 'list-task-1',
    speaker: 'Auntie Mary & Daniel',
    passageToSpeak:
      'Good morning Auntie Mary! May I have a bowl of warm chicken noodle soup, a sliced apple, and a glass of fresh orange juice with no ice please?',
    question: 'How did Daniel request his glass of fresh orange juice?',
    options: [
      'With extra sweet syrup',
      'With warm boiled water',
      'With no ice',
      'In a plastic bottle',
    ],
    correctOptionIndex: 2,
    xpReward: 35,
    starsAward: 3,
    explanation: 'Daniel specifically asked for fresh orange juice with "no ice please".',
    gamificationStyle: 'Drag & Drop Answer Box',
  },
  {
    id: 'list-task-3',
    level: 3,
    minTP: 'TP3 - TP4',
    title: 'The Missing Science Notebook Mystery',
    category: 'Level 3: Detail Detective',
    prereqId: 'list-task-2',
    speaker: 'Cikgu Sarah',
    passageToSpeak:
      'Listen closely class: Siti left her blue science notebook on the wooden shelf next to the microscope before the recess bell rang. Please check your desks carefully.',
    question: 'Where was the blue science notebook placed before recess?',
    options: [
      'Under the teacher’s table',
      'On the wooden shelf next to the microscope',
      'Inside the red school bus',
      'In the library book return bin',
    ],
    correctOptionIndex: 1,
    xpReward: 45,
    starsAward: 3,
    explanation: 'Cikgu Sarah specifically highlighted the wooden shelf next to the microscope.',
    gamificationStyle: 'Drag & Drop Answer Box',
    audioClues: ['Clue 1: Near the microscope in the science lab', 'Clue 2: Placed before the recess bell'],
  },
  {
    id: 'list-task-4',
    level: 4,
    minTP: 'TP4 - TP5',
    title: 'Radio Station Weather & Traffic Bulletin',
    category: 'Level 4: Speed Bulletin & Infographics',
    prereqId: 'list-task-3',
    speaker: 'DJ Shahril (Kuala Lumpur FM)',
    passageToSpeak:
      'Good evening commuters! Heavy thunderstorm is reported over the North-South Expressway near Rawang. Drivers heading north are advised to detour via Route 1 to avoid a 45-minute congestion!',
    question: 'Which alternative route did DJ Shahril advise northern commuters to take?',
    options: [
      'Route 1 alternative highway',
      'Karak Expressway tunnel',
      'Federal Highway flyover',
      'Stay parked at the gas station',
    ],
    correctOptionIndex: 0,
    xpReward: 55,
    starsAward: 4,
    explanation: 'DJ Shahril recommended Route 1 to avoid the 45-minute congestion near Rawang.',
    gamificationStyle: 'Speed Audio Buster',
    audioClues: ['Notice: Heavy rain at Rawang', 'Detour: Route 1 to bypass 45-min jam'],
  },
  {
    id: 'list-task-5',
    level: 5,
    minTP: 'TP5 - TP6',
    title: 'National Eco-Summit Youth Debate',
    category: 'Level 5: Critical Reasoning & Rhetoric',
    prereqId: 'list-task-4',
    speaker: 'Debater Aiman & Moderator',
    passageToSpeak:
      'Solar panels in schools do not merely cut electricity expenditures; they cultivate ecological accountability in pupils. By inspecting live generation metrics daily, youth recognize that clean energy is an immediate moral imperative.',
    question: 'According to Aiman, what is the key educational virtue of solar metrics?',
    options: [
      'It reduces tuition fees for pupils',
      'It cultivates ecological accountability and active civic virtue',
      'It allows children to skip science exams',
      'It speeds up cafeteria food preparation',
    ],
    correctOptionIndex: 1,
    xpReward: 70,
    starsAward: 5,
    explanation: 'Aiman emphasized cultivating ecological accountability and recognizing clean energy as a moral imperative.',
    gamificationStyle: 'Audio Detective Clues',
    audioClues: ['Core thesis: Ecological accountability', 'Daily metric inspection builds civic virtue'],
  },
];

export const ListeningBay: React.FC = () => {
  const {
    currentStudent,
    setCurrentView,
    triggerCelebration,
    showToast,
    awardStars,
    saveCompletedTask,
    isTaskLocked,
    taskHistory,
  } = useApp();

  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  
  // Drag and Drop Gamification States
  const [draggedOption, setDraggedOption] = useState<number | null>(null);
  const [droppedOption, setDroppedOption] = useState<number | null>(null);
  const [isDragOverBox, setIsDragOverBox] = useState(false);
  
  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [activeTab, setActiveTab] = useState<'challenges' | 'history'>('challenges');
  const [revealedClues, setRevealedClues] = useState<number[]>([]);

  // Speed challenge timer simulation
  const [comboTimer, setComboTimer] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const currentTask = LISTENING_TASKS[activeTaskIndex];
  const studentCompletedTasks = currentStudent?.completedTaskIds || ['list-task-1'];
  const isFirstTimerDone = currentStudent?.isFirstTimerCompleted ?? true;

  const studentLevel = currentStudent?.level || 7;
  const isCurrentLocked = isTaskLocked
    ? isTaskLocked(currentTask.id, 'Listening', currentTask.level, currentTask.prereqId)
    : !isFirstTimerDone && currentTask.level > 1;

  // Speed timer ticker
  useEffect(() => {
    let interval: any = null;
    if (timerActive && comboTimer > 0 && !hasEvaluated) {
      interval = setInterval(() => {
        setComboTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, comboTimer, hasEvaluated]);

  const playTaskAudio = (text: string, rate: number = speechRate) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.onstart = () => {
        setIsPlayingAudio(true);
        if (currentTask.gamificationStyle === 'Speed Audio Buster') {
          setTimerActive(true);
        }
      };
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Audio Note', 'Speech synthesis is initializing.', 'info');
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (hasEvaluated) return;
    setDraggedOption(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (hasEvaluated) return;
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverBox(true);
  };

  const handleDragLeave = () => {
    setIsDragOverBox(false);
  };

  const handleDropIntoBox = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBox(false);
    if (hasEvaluated) return;

    const data = e.dataTransfer.getData('text/plain');
    const index = parseInt(data, 10);
    if (!isNaN(index) && index >= 0 && index < currentTask.options.length) {
      setDroppedOption(index);
      playDropSnap();
      showToast('Answer Slotted! 📦', `You placed "${currentTask.options[index]}" in the Answer Box.`, 'info');
    }
  };

  // Click-to-dock fallback for touchscreen & easy interaction
  const handleOptionClick = (index: number) => {
    if (hasEvaluated) return;
    if (droppedOption === index) {
      // Remove from box
      setDroppedOption(null);
      playPopChirp();
    } else {
      // Dock into box
      setDroppedOption(index);
      playDropSnap();
    }
  };

  const handleRemoveFromBox = () => {
    if (hasEvaluated) return;
    playPopChirp();
    setDroppedOption(null);
  };

  const handleCheckAnswer = () => {
    if (droppedOption === null) {
      showToast('Tiada Jawapan Dipilih', 'Sila drag atau klik kad pilihan ke dalam Kotak Jawapan!', 'warning');
      return;
    }

    const correct = droppedOption === currentTask.correctOptionIndex;
    setIsAnswerCorrect(correct);
    setHasEvaluated(true);
    setTimerActive(false);

    if (correct) {
      playStarChime();
      triggerCelebration();

      const speedBonus = currentTask.gamificationStyle === 'Speed Audio Buster' && comboTimer > 10 ? 15 : 0;
      const totalXP = currentTask.xpReward + speedBonus;

      awardStars({
        skill: 'Listening',
        starsCount: currentTask.starsAward,
        exerciseTitle: currentTask.title,
        title: 'Auditory Detective Star!',
        praiseMessage: `Fantastic listening! You slotted the correct answer into the Answer Box for "${currentTask.title}".`,
        xpBonus: totalXP,
      });

      saveCompletedTask({
        studentId: currentStudent?.id || 'std-daniel-lee',
        studentName: currentStudent?.name || 'Daniel Lee',
        skill: 'Listening',
        category: currentTask.category,
        taskTitle: currentTask.title,
        score: 100,
        starsEarned: currentTask.starsAward,
        xpEarned: totalXP,
        userInputSummary: `Dropped answer: "${currentTask.options[droppedOption]}" into Answer Box`,
        feedbackSummary: `Correct! ${currentTask.explanation}`,
        teacherRemarks: `Mastered ${currentTask.category} with drag-and-drop accuracy.`,
        status: 'Completed',
      });

      showToast(
        'Superb Answer! 🎉',
        `+${currentTask.starsAward} ⭐ Bintang & +${totalXP} XP Diperoleh!`,
        'success'
      );
    } else {
      playTryAgain();
      showToast('Cuba Lagi!', 'Dengar audio sekali lagi untuk mencari maklumat yang tepat!', 'warning');
    }
  };

  const handleNextChallenge = () => {
    if (activeTaskIndex < LISTENING_TASKS.length - 1) {
      setActiveTaskIndex((prev) => prev + 1);
      setDroppedOption(null);
      setDraggedOption(null);
      setHasEvaluated(false);
      setIsAnswerCorrect(false);
      setRevealedClues([]);
      setComboTimer(30);
      setTimerActive(false);
      stopAudio();
    }
  };

  const handleResetChallenge = () => {
    setDroppedOption(null);
    setDraggedOption(null);
    setHasEvaluated(false);
    setIsAnswerCorrect(false);
    setComboTimer(30);
    setTimerActive(false);
    playTaskAudio(currentTask.passageToSpeak);
  };

  const listeningHistory = taskHistory.filter((item: any) => item.skill === 'Listening');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900 border border-emerald-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs uppercase border border-emerald-500/30 flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              <span>English Auditory Lab</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>+{currentTask.starsAward} ⭐ per Quest</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center gap-1 border border-purple-500/30">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Gamified Drag & Drop Box</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            🎧 Listening Bay: Audio & Drag-and-Drop Quest
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Dengar perbualan audio bahasa Inggeris, tarik pilihan jawapan (drag & drop) ke dalam Kotak Jawapan, dan tekan "Check My Answer" untuk mengesahkan!
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'challenges'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quests ({LISTENING_TASKS.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({listeningHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Task Roadmap Navigator with TP Band and Gamification Tags */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {LISTENING_TASKS.map((task, idx) => {
          const isDone = studentCompletedTasks.includes(task.id);
          const isCurrent = activeTaskIndex === idx;
          const isLocked = isTaskLocked
            ? isTaskLocked(task.id, 'Listening', task.level, task.prereqId)
            : !isFirstTimerDone && task.level > 1;

          return (
            <button
              key={task.id}
              onClick={() => {
                if (!isLocked) {
                  setActiveTaskIndex(idx);
                  setDroppedOption(null);
                  setDraggedOption(null);
                  setHasEvaluated(false);
                  setIsAnswerCorrect(false);
                  setRevealedClues([]);
                  setComboTimer(30);
                  setTimerActive(false);
                  stopAudio();
                } else {
                  showToast('Tugasan Terkunci 🔒', `Capai ${task.minTP} atau selesaikan level sebelumnya untuk membuka quest ini!`, 'info');
                }
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/40 text-white'
                  : isDone
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                  : !isLocked
                  ? 'bg-slate-950/40 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-400">
                  L{task.level} • {task.minTP}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isLocked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    Buka
                  </span>
                )}
              </div>
              <div className="font-bold text-xs text-white line-clamp-1">{task.title}</div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>+{task.xpReward} XP</span>
                <span className="text-amber-400 font-bold">+{task.starsAward} ⭐</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === 'challenges' ? (
        isCurrentLocked ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">This Listening Challenge is Locked 🔒</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {!isFirstTimerDone
                ? 'Sila lengkapkan Panduan Diagnostik Kadet Pertama terlebih dahulu untuk membuka arena kemahiran!'
                : `Tingkatkan kemahiran Listening anda ke ${currentTask.minTP} atau selesaikan cabaran tahap sebelum ini untuk membuka aktiviti gamifikasi ini!`}
            </p>
            {!isFirstTimerDone && (
              <button
                onClick={() => setCurrentView('first-timer')}
                className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Pergi ke Diagnostik 1st Timer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Gamification Style Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Move className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-emerald-400 tracking-wide">
                    Mod Permainan: {currentTask.gamificationStyle}
                  </span>
                  <div className="text-xs text-slate-400">
                    Tarik kad jawapan ke dalam kotak atau klik kad untuk menyelitkannya ke dalam Kotak Jawapan.
                  </div>
                </div>
              </div>

              {currentTask.gamificationStyle === 'Speed Audio Buster' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Bonus Kombo: {comboTimer}s</span>
                </div>
              )}
            </div>

            {/* Audio Player Hub */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-slate-300">Pencerita: {currentTask.speaker}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px]">Kelajuan:</span>
                  {[0.75, 0.9, 1.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        speechRate === rate
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Play Audio Button */}
              <div className="py-2 flex flex-col items-center justify-center">
                {!isPlayingAudio ? (
                  <button
                    onClick={() => playTaskAudio(currentTask.passageToSpeak)}
                    className="py-4 px-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm inline-flex items-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer group"
                  >
                    <Play className="w-5 h-5 fill-current group-hover:animate-bounce" />
                    <span>Mainkan Audio Dialog (Listen Audio)</span>
                  </button>
                ) : (
                  <button
                    onClick={stopAudio}
                    className="py-4 px-8 rounded-3xl bg-red-600 hover:bg-red-500 text-white font-black text-sm inline-flex items-center gap-3 shadow-xl shadow-red-500/20 animate-pulse transition-all cursor-pointer"
                  >
                    <VolumeX className="w-5 h-5" />
                    <span>Hentikan Audio (Sedang Dimainkan...)</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Dengar klip audio dialog dengan teliti, kemudian tarik jawapan tepat ke dalam Kotak Jawapan di bawah.
              </p>

              {/* Optional Audio Clues */}
              {currentTask.audioClues && (
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  {currentTask.audioClues.map((clue, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!revealedClues.includes(idx)) {
                          setRevealedClues((prev) => [...prev, idx]);
                          playPopChirp();
                        }
                      }}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        revealedClues.includes(idx)
                          ? 'bg-purple-950/70 border border-purple-500/40 text-purple-200'
                          : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>{revealedClues.includes(idx) ? clue : `Buka Petunjuk Audio #${idx + 1}`}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comprehension Question */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="text-[11px] font-black uppercase text-emerald-400 tracking-wider mb-1">
                Soalan Kefahaman (Question):
              </div>
              <h3 className="font-black text-base sm:text-lg text-white">
                {currentTask.question}
              </h3>
            </div>

            {/* GAMIFICATION CORE: DROP TARGET BOX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-emerald-400" />
                  <span>Kotak Jawapan Murid (Drop Target Box)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {droppedOption === null ? 'Tarik pilihan ke sini' : '1 Jawapan dimasukkan'}
                </span>
              </div>

              {/* The Interactive Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDropIntoBox}
                className={`min-h-[110px] rounded-3xl border-2 transition-all p-5 flex items-center justify-center relative overflow-hidden ${
                  isDragOverBox
                    ? 'border-emerald-400 bg-emerald-500/20 scale-[1.02] shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-400/20'
                    : droppedOption !== null
                    ? hasEvaluated
                      ? isAnswerCorrect
                        ? 'border-emerald-400 bg-emerald-950/50 shadow-lg shadow-emerald-500/20'
                        : 'border-red-500 bg-red-950/40 shadow-lg shadow-red-500/20'
                      : 'border-amber-400/80 bg-slate-950/90 shadow-xl shadow-amber-500/10'
                    : 'border-dashed border-slate-700 bg-slate-950/50 hover:border-emerald-500/40'
                }`}
              >
                {droppedOption === null ? (
                  <div className="text-center space-y-1.5 pointer-events-none select-none">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                      <Move className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-xs font-bold text-slate-300">
                      Letakkan Jawapan Anda Di Sini (Drop Your Answer Here)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tarik kad daripada pilihan di bawah atau klik mana-mana kad untuk menyelitkannya
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          hasEvaluated
                            ? isAnswerCorrect
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-red-500 text-white'
                            : 'bg-amber-400 text-slate-950 shadow-md'
                        }`}
                      >
                        {hasEvaluated ? (isAnswerCorrect ? '✓' : '✗') : '★'}
                      </div>
                      <div>
                        <div className="text-[10px] font-extrabold uppercase text-amber-300 tracking-wider">
                          Jawapan Dalam Kotak:
                        </div>
                        <div className="text-sm font-black text-white">
                          {currentTask.options[droppedOption]}
                        </div>
                      </div>
                    </div>

                    {!hasEvaluated && (
                      <button
                        type="button"
                        onClick={handleRemoveFromBox}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold cursor-pointer shrink-0 transition-all"
                      >
                        Tukar Jawapan / Keluarkan
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* MULTIPLE CHOICE DRAGGABLE TILES POOL */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-400">
                  Pilihan Jawapan (Tarik Kad atau Klik):
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {currentTask.options.length} Pilihan Tersedia
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTask.options.map((option, idx) => {
                  const isSlotted = droppedOption === idx;
                  const isCorrect = idx === currentTask.correctOptionIndex;

                  let borderClass =
                    'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-900';

                  if (hasEvaluated) {
                    if (isCorrect) {
                      borderClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    } else if (isSlotted && !isCorrect) {
                      borderClass = 'bg-red-500/20 border-red-400 text-red-200';
                    }
                  } else if (isSlotted) {
                    borderClass =
                      'bg-amber-500/15 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-md';
                  }

                  return (
                    <div
                      key={idx}
                      draggable={!hasEvaluated}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onClick={() => handleOptionClick(idx)}
                      className={`p-4 rounded-2xl border text-xs font-semibold transition-all cursor-grab active:cursor-grabbing flex items-center justify-between select-none ${borderClass} ${
                        isSlotted ? 'scale-[0.98]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-400 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      <div className="shrink-0 ml-2">
                        {hasEvaluated && isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isSlotted ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                            Slotted ✓
                          </span>
                        ) : (
                          <Move className="w-3.5 h-3.5 text-slate-500 opacity-60" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feedback & Result Card */}
            {hasEvaluated && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in ${
                  isAnswerCorrect
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/30 text-red-200'
                }`}
              >
                {isAnswerCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold">
                    {isAnswerCorrect ? 'Tahniah! Jawapan Tepat!' : 'Belum tepat. Cuba dengar sekali lagi!'}
                  </div>
                  <p>{currentTask.explanation}</p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleResetChallenge}
                className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Dengar Semula & Reset</span>
              </button>

              <div className="flex items-center gap-3">
                {!hasEvaluated ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={droppedOption === null}
                    className="py-3 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check My Answer (Sahkan Jawapan)</span>
                  </button>
                ) : (
                  activeTaskIndex < LISTENING_TASKS.length - 1 && (
                    <button
                      onClick={handleNextChallenge}
                      className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                    >
                      <span>Cabaran Seterusnya (Next Level)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        /* History Tab */
        <div className="space-y-3">
          {listeningHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-900 border border-slate-800">
              Belum ada rekod tugasan listening. Selesaikan cabaran pertama anda di tab Quests!
            </div>
          ) : (
            listeningHistory.map((h: any) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{h.taskTitle}</div>
                  <div className="text-slate-400 mt-0.5">{h.feedbackSummary}</div>
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
