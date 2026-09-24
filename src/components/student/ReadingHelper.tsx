import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Star,
  Trophy,
  Check,
  AlertCircle,
  Lock,
  ArrowRight,
  History,
  Cloud,
  Gamepad2,
  Swords,
  Move,
  HelpCircle,
  Clock,
  Flame,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  playBadgeFanfare,
  playPopChirp,
  playStarChime,
  playDropSnap,
  playTryAgain,
} from '../../utils/soundEffects';

interface ReadingStory {
  id: string;
  level: number;
  title: string;
  category: string;
  passageText: string;
  prereqId?: string;
  xpReward: number;
  vocabulary: Record<string, { definition: string; example: string }>;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface DuelQuest {
  id: string;
  level: number;
  minTP: string;
  title: string;
  category: string;
  mode: 'scramble' | 'cloze';
  passageContext: string;
  questionPrompt: string;
  scrambledWords?: string[];
  correctSentence?: string;
  clozeSentence?: string;
  clozeOptions?: string[];
  correctClozeIndex?: number;
  explanation: string;
  xpReward: number;
  starsAward: number;
}

export const DUEL_QUESTS: DuelQuest[] = [
  {
    id: 'duel-read-1',
    level: 1,
    minTP: 'TP2 - TP3',
    title: 'Word Scramble: Saturday Morning Camp',
    category: 'Word Order & Fluency',
    mode: 'scramble',
    passageContext: 'From story "The Bukit Fraser Camping Trip"',
    questionPrompt: 'Susun semula perkataan di bawah mengikut susunan tatabahasa yang betul:',
    scrambledWords: ['Adam', 'was', 'very', 'excited', 'on', 'Saturday', 'morning.'],
    correctSentence: 'Adam was very excited on Saturday morning.',
    explanation: 'Susunan SVO tepat: Subjek "Adam" diikuti kata kerja "was", kata penerang "very excited", dan frasa masa "on Saturday morning."',
    xpReward: 35,
    starsAward: 3,
  },
  {
    id: 'duel-read-2',
    level: 2,
    minTP: 'TP3 - TP4',
    title: 'Speed Cloze Duel: Rainforest Canopy Mystery',
    category: 'Contextual Vocabulary',
    mode: 'cloze',
    passageContext: 'From story "The Rainforest Canopy Adventure"',
    questionPrompt: 'Pilih dan letakkan kosa kata yang paling tepat ke dalam tempat kosong petikan:',
    clozeSentence: 'Gentle mist floated through the emerald leaves, and colourful [ ______ ] danced in the morning sunlight.',
    clozeOptions: ['butterflies', 'locomotives', 'submarines', 'bulldozers'],
    correctClozeIndex: 0,
    explanation: 'Dalam konteks hutan hujan tropika, "colourful butterflies" menari di celah dedaun dan cahaya pagi.',
    xpReward: 45,
    starsAward: 3,
  },
  {
    id: 'duel-read-3',
    level: 3,
    minTP: 'TP4 - TP5',
    title: 'Speed Cloze Duel: Princess of Mount Ledang',
    category: 'High-Order Narrative Reading',
    mode: 'cloze',
    passageContext: 'From story "The Legend of Gunung Ledang"',
    questionPrompt: 'Pilih nilai murni yang membolehkan pengembara dipimpin merentasi kabus gunung:',
    clozeSentence: 'Travelers who showed respect and [ ______ ] were always guided safely through the thick mountain mist.',
    clozeOptions: ['humility', 'arrogance', 'anger', 'carelessness'],
    correctClozeIndex: 0,
    explanation: '"Humility" (sifat rendah diri dan sopan santun) melengkapkan nilai murni menghormati alam semula jadi.',
    xpReward: 55,
    starsAward: 4,
  },
];

const READING_STORIES: ReadingStory[] = [
  {
    id: 'read-story-1',
    level: 1,
    title: 'The Bukit Fraser Camping Trip',
    category: 'Level 1: Phonics & Fluency',
    passageText:
      'Adam was very excited when he woke up on Saturday morning. Today was the school camping trip at Bukit Fraser! He packed his flashlight, a warm blue jacket, and his favourite storybook into his backpack. As the yellow school bus drove up the green winding hill, the children started singing cheerful songs together.',
    xpReward: 35,
    vocabulary: {
      excited: {
        definition: 'Feeling very happy, eager, and enthusiastic about something good.',
        example: '“I am excited to visit the zoo with my family!”',
      },
      camping: {
        definition: 'Living outdoors in a tent for fun or adventure.',
        example: '“We went camping near the cool waterfall.”',
      },
      flashlight: {
        definition: 'A small portable electric light that you hold in your hand.',
        example: '“He turned on the flashlight to see in the dark cave.”',
      },
      backpack: {
        definition: 'A bag with straps that you carry on your back.',
        example: '“She carried her heavy books in her backpack.”',
      },
      winding: {
        definition: 'Having a lot of curves, turns, and bends rather than being straight.',
        example: '“The car drove slowly along the winding road.”',
      },
      cheerful: {
        definition: 'Noticeably happy, optimistic, and positive.',
        example: '“The birds were singing cheerful tunes at sunrise.”',
      },
    },
    quiz: {
      question: 'Where were the children traveling to for their camping trip?',
      options: ['Cameron Highlands', 'Bukit Fraser', 'Taman Negara', 'Penang Island'],
      correctIndex: 1,
      explanation: 'Adam and his classmates were going to Bukit Fraser.',
    },
  },
  {
    id: 'read-story-2',
    level: 2,
    title: 'The Rainforest Canopy Adventure',
    category: 'Level 2: Expressive Reading',
    prereqId: 'read-story-1',
    passageText:
      'Maya walked carefully along the suspended canopy bridge high above the lush rainforest floor. Gentle mist floated through the emerald leaves, and colourful butterflies danced in the morning sunlight. Below them, a family of playful gibbons swung smoothly between the ancient dipterocarp branches.',
    xpReward: 40,
    vocabulary: {
      suspended: {
        definition: 'Hanging down from something above without touching the ground.',
        example: '“The bridge was suspended high between two trees.”',
      },
      canopy: {
        definition: 'The high, spreading roof formed by the treetops in a forest.',
        example: '“Monkeys live safely in the high forest canopy.”',
      },
      ancient: {
        definition: 'Belonging to a time long ago; very, very old.',
        example: '“The ancient tree has stood for hundreds of years.”',
      },
    },
    quiz: {
      question: 'Which animals swung smoothly between the branches?',
      options: ['Playful gibbons', 'Green hornbills', 'Sun bears', 'Forest leopards'],
      correctIndex: 0,
      explanation: 'A family of playful gibbons swung between the tree branches.',
    },
  },
  {
    id: 'read-story-3',
    level: 3,
    title: 'The Legend of Gunung Ledang',
    category: 'Level 3: Narrative Mastery',
    prereqId: 'read-story-2',
    passageText:
      'Long ago in the mystical mountain of Gunung Ledang, a wise princess was known for her kindness and deep connection with nature. She lived among fragrant jasmine flowers and silver waterfalls. Travelers who showed respect and humility were always guided safely through the thick mountain mist.',
    xpReward: 50,
    vocabulary: {
      mystical: {
        definition: 'Inspiring a sense of spiritual mystery, wonder, or fascination.',
        example: '“The misty mountain had a mystical glow at dawn.”',
      },
      fragrant: {
        definition: 'Having a pleasant, sweet smell.',
        example: '“The fragrant jasmine flowers filled the air with sweet scent.”',
      },
      humility: {
        definition: 'The quality of being humble and modest, not proud or arrogant.',
        example: '“He spoke with great politeness and humility.”',
      },
    },
    quiz: {
      question: 'Who was guided safely through the thick mountain mist?',
      options: [
        'Only kings and warriors',
        'Travelers who showed respect and humility',
        'Fierce hunters seeking treasure',
        'Nobody was allowed on the mountain',
      ],
      correctIndex: 1,
      explanation: 'Travelers who showed respect and humility were guided safely.',
    },
  },
];

export const ReadingHelper: React.FC = () => {
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

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'reading' | 'duel' | 'history'>('reading');

  // Gamified Duel State (Unlockable Games & New Interaction Styles)
  const [activeDuelIndex, setActiveDuelIndex] = useState(0);
  const currentDuel = DUEL_QUESTS[activeDuelIndex];
  const [selectedWordPool, setSelectedWordPool] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);
  const [selectedClozeOption, setSelectedClozeOption] = useState<number | null>(null);
  const [hasEvaluatedDuel, setHasEvaluatedDuel] = useState(false);
  const [isDuelCorrect, setIsDuelCorrect] = useState(false);
  const [duelTimer, setDuelTimer] = useState<number>(30);

  useEffect(() => {
    if (currentDuel && currentDuel.mode === 'scramble' && currentDuel.scrambledWords) {
      setSelectedWordPool([...currentDuel.scrambledWords].sort(() => Math.random() - 0.5));
      setPlacedWords([]);
    } else {
      setSelectedClozeOption(null);
    }
    setHasEvaluatedDuel(false);
    setIsDuelCorrect(false);
    setDuelTimer(30);
  }, [activeDuelIndex]);

  const handleSlotWord = (word: string, indexInPool: number) => {
    if (hasEvaluatedDuel) return;
    playDropSnap();
    setPlacedWords((prev) => [...prev, word]);
    setSelectedWordPool((prev) => prev.filter((_, idx) => idx !== indexInPool));
  };

  const handleUnslotWord = (word: string, indexInPlaced: number) => {
    if (hasEvaluatedDuel) return;
    playPopChirp();
    setPlacedWords((prev) => prev.filter((_, idx) => idx !== indexInPlaced));
    setSelectedWordPool((prev) => [...prev, word]);
  };

  const handleCheckDuelAnswer = () => {
    if (currentDuel.mode === 'scramble') {
      if (placedWords.length === 0) {
        showToast('Susun Perkataan Dahulu', 'Klik kad perkataan untuk menyusun ayat!', 'warning');
        return;
      }
      const builtSentence = placedWords.join(' ');
      const correct = builtSentence.trim() === currentDuel.correctSentence?.trim();
      setIsDuelCorrect(correct);
      setHasEvaluatedDuel(true);

      if (correct) {
        playStarChime();
        triggerCelebration();
        awardStars({
          skill: 'Reading',
          starsCount: currentDuel.starsAward,
          exerciseTitle: currentDuel.title,
          title: 'Speed Word Scramble Star!',
          praiseMessage: `Superb! You correctly unscrambled: "${builtSentence}"`,
          xpBonus: currentDuel.xpReward,
        });
        saveCompletedTask({
          studentId: currentStudent?.id || 'std-daniel-lee',
          studentName: currentStudent?.name || 'Daniel Lee',
          skill: 'Reading',
          category: currentDuel.category,
          taskTitle: currentDuel.title,
          score: 100,
          starsEarned: currentDuel.starsAward,
          xpEarned: currentDuel.xpReward,
          userInputSummary: `Unscrambled: ${builtSentence}`,
          feedbackSummary: `Correct! ${currentDuel.explanation}`,
          teacherRemarks: `Demonstrated accurate word order and syntactic fluency.`,
          status: 'Completed',
        });
        showToast('Susunan Tepat! 🎉', `+${currentDuel.starsAward} ⭐ Bintang & +${currentDuel.xpReward} XP diperoleh!`, 'success');
      } else {
        playTryAgain();
        showToast('Belum Tepat', 'Semak susunan perkataan dan cuba lagi!', 'warning');
      }
    } else {
      if (selectedClozeOption === null) {
        showToast('Pilih Jawapan Dahulu', 'Sila klik pilihan kosa kata yang paling tepat!', 'warning');
        return;
      }
      const correct = selectedClozeOption === currentDuel.correctClozeIndex;
      setIsDuelCorrect(correct);
      setHasEvaluatedDuel(true);

      if (correct) {
        playStarChime();
        triggerCelebration();
        awardStars({
          skill: 'Reading',
          starsCount: currentDuel.starsAward,
          exerciseTitle: currentDuel.title,
          title: 'Speed Cloze Duel Master!',
          praiseMessage: `Excellent vocabulary! You correctly filled the blank in "${currentDuel.title}".`,
          xpBonus: currentDuel.xpReward,
        });
        saveCompletedTask({
          studentId: currentStudent?.id || 'std-daniel-lee',
          studentName: currentStudent?.name || 'Daniel Lee',
          skill: 'Reading',
          category: currentDuel.category,
          taskTitle: currentDuel.title,
          score: 100,
          starsEarned: currentDuel.starsAward,
          xpEarned: currentDuel.xpReward,
          userInputSummary: `Cloze choice: "${currentDuel.clozeOptions?.[selectedClozeOption]}"`,
          feedbackSummary: `Correct! ${currentDuel.explanation}`,
          teacherRemarks: `Mastered contextual vocabulary in narrative reading.`,
          status: 'Completed',
        });
        showToast('Kosa Kata Tepat! 🌟', `+${currentDuel.starsAward} ⭐ Bintang & +${currentDuel.xpReward} XP diperoleh!`, 'success');
      } else {
        playTryAgain();
        showToast('Cuba Lagi', 'Baca petunjuk konteks cerita dengan teliti!', 'warning');
      }
    }
  };

  const handleNextDuel = () => {
    if (activeDuelIndex < DUEL_QUESTS.length - 1) {
      setActiveDuelIndex((prev) => prev + 1);
    }
  };

  const handleResetDuel = () => {
    if (currentDuel.mode === 'scramble' && currentDuel.scrambledWords) {
      setSelectedWordPool([...currentDuel.scrambledWords].sort(() => Math.random() - 0.5));
      setPlacedWords([]);
    } else {
      setSelectedClozeOption(null);
    }
    setHasEvaluatedDuel(false);
    setIsDuelCorrect(false);
  };

  const story = READING_STORIES[activeStoryIndex];
  const words = story.passageText.split(/\s+/);

  // Voice recording & word-by-word highlight state
  const [isPupilRecording, setIsPupilRecording] = useState(false);
  const [matchedWordIndices, setMatchedWordIndices] = useState<Set<number>>(new Set());
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Vocabulary exploration
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    definition: string;
    example: string;
  } | null>(null);

  // Reading evaluation outcome
  const [hasEvaluatedReading, setHasEvaluatedReading] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    fluencyScore: number;
    wordsRead: number;
    totalWords: number;
    starsAwarded: number;
    praise: string;
    needsMoreReading: boolean;
  } | null>(null);

  // Quiz state
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const studentCompletedTasks = currentStudent?.completedTaskIds || ['read-story-1'];
  const isFirstTimerDone = currentStudent?.isFirstTimerCompleted ?? true;

  const isCurrentStoryLocked = isTaskLocked
    ? isTaskLocked(story.id, 'Reading', story.level, story.prereqId)
    : !isFirstTimerDone && story.level > 1;

  // Speak text helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.88;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Recording Timer
  useEffect(() => {
    if (isPupilRecording) {
      timerRef.current = setInterval(() => {
        setRecordedDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPupilRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Real Web Speech API continuous recognition with word-by-word match
  const startRecording = () => {
    setMatchedWordIndices(new Set());
    setCurrentWordIndex(-1);
    setRecordedDuration(0);
    setHasEvaluatedReading(false);
    setEvaluationResult(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }

        const spokenWords = fullTranscript
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(Boolean);

        const newMatched = new Set(matchedWordIndices);

        words.forEach((w, idx) => {
          const cleanPassageWord = w.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (spokenWords.includes(cleanPassageWord)) {
            newMatched.add(idx);
            setCurrentWordIndex(idx);
          }
        });

        setMatchedWordIndices(new Set(newMatched));
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e);
      };

      recognition.onend = () => {
        // Only mark ended if pupil clicked stop
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsPupilRecording(true);
    } else {
      // Browser without speech recognition: progressive simulated detection
      setIsPupilRecording(true);
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < words.length) {
          setMatchedWordIndices((prev) => new Set([...prev, idx]));
          setCurrentWordIndex(idx);
          idx++;
        } else {
          clearInterval(interval);
        }
      }, 700);
      (window as any)._readingInterval = interval;
    }
  };

  const stopAndEvaluateRecording = () => {
    setIsPupilRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn(err);
      }
    }
    if ((window as any)._readingInterval) {
      clearInterval((window as any)._readingInterval);
    }

    const wordsRead = matchedWordIndices.size;
    const totalWords = words.length;
    const fluencyRatio = wordsRead / totalWords;
    const fluencyPercent = Math.round(fluencyRatio * 100);

    // CRITICAL USER FIX: DO NOT award full stars or congratulate if the passage has not been read!
    if (fluencyPercent < 40) {
      setHasEvaluatedReading(true);
      setEvaluationResult({
        fluencyScore: fluencyPercent,
        wordsRead,
        totalWords,
        starsAwarded: 0,
        praise: 'You have only read a small part of the passage. Keep reading until the end to earn your stars!',
        needsMoreReading: true,
      });
      showToast(
        'Keep Reading!',
        `You read ${wordsRead} of ${totalWords} words (${fluencyPercent}%). Please read more of the passage to earn stars!`,
        'warning'
      );
      return;
    }

    let starsEarned = 1;
    let praiseMsg = 'Good effort reading aloud!';
    if (fluencyPercent >= 80) {
      starsEarned = 3;
      praiseMsg = 'Outstanding reading fluency and pronunciation accuracy!';
    } else if (fluencyPercent >= 55) {
      starsEarned = 2;
      praiseMsg = 'Great reading progress! You pronounced most words with confidence!';
    }

    setHasEvaluatedReading(true);
    setEvaluationResult({
      fluencyScore: fluencyPercent,
      wordsRead,
      totalWords,
      starsAwarded: starsEarned,
      praise: praiseMsg,
      needsMoreReading: false,
    });

    playStarChime();
    triggerCelebration();

    awardStars({
      skill: 'Reading',
      starsCount: starsEarned,
      exerciseTitle: `Oral Reading Aloud — ${story.title}`,
      title: `${starsEarned} ⭐ Reading Fluency Star!`,
      praiseMessage: praiseMsg,
      xpBonus: story.xpReward,
    });

    saveCompletedTask({
      studentId: currentStudent?.id || 'std-daniel-lee',
      studentName: currentStudent?.name || 'Daniel Lee',
      skill: 'Reading',
      category: story.category,
      taskTitle: story.title,
      score: fluencyPercent,
      starsEarned,
      xpEarned: story.xpReward,
      userInputSummary: `Oral reading aloud recorded (${formatDuration(recordedDuration)}). Detected ${wordsRead}/${totalWords} words (${fluencyPercent}%).`,
      feedbackSummary: praiseMsg,
      teacherRemarks: `Fluency rate: ${fluencyPercent}%. Verified pronunciation and phrasing.`,
      status: 'Completed',
      audioDuration: formatDuration(recordedDuration),
    });

    addEvidence({
      studentId: currentStudent?.id || 'std-3',
      studentName: currentStudent?.name || 'Daniel Lee',
      skill: 'Reading',
      activityTitle: `Reading Aloud — ${story.title}`,
      evidenceType: 'audio',
      audioDuration: formatDuration(recordedDuration),
      textContent: `Completed oral reading aloud. Fluency: ${fluencyPercent}%. Detected ${wordsRead} of ${totalWords} words.`,
      teacherStatus: 'Pending Review',
      aiSuggestedTP: fluencyPercent >= 80 ? 'TP4' : 'TP3',
    });
  };

  const handleWordClick = (rawWord: string) => {
    const clean = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    const vocab = story.vocabulary[clean] || {
      definition: 'A key vocabulary word that helps build descriptive sentences in stories.',
      example: `“${rawWord} is an important word in this passage.”`,
    };

    setSelectedWord({
      word: rawWord.replace(/[^a-zA-Z]/g, ''),
      definition: vocab.definition,
      example: vocab.example,
    });

    speakText(clean);
    playPopChirp();
  };

  const handleQuizAnswer = (idx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizOption(idx);
    setQuizSubmitted(true);

    if (idx === story.quiz.correctIndex) {
      playStarChime();
      showToast('Correct Comprehension!', '+2 ⭐ Comprehension Stars!', 'success');
      awardStars({
        skill: 'Reading',
        starsCount: 2,
        exerciseTitle: `Comprehension Check: ${story.title}`,
        title: 'Reading Comprehension Star!',
        praiseMessage: 'Excellent reading comprehension on the passage story!',
        xpBonus: 20,
      });
    } else {
      showToast('Review Passage', story.quiz.explanation, 'info');
    }
  };

  const readingHistory = taskHistory.filter((item: any) => item.skill === 'Reading');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border border-blue-500/30 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-xs uppercase border border-blue-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Reading Island Lab</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              Live Word Highlight
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            🏝️ Reading Island & Fluency Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Read passages aloud with real-time word-by-word voice detection. No short timers — finish the
            story to earn your genuine stars!
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 gap-1">
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reading'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reading Studio
          </button>
          <button
            onClick={() => setActiveTab('duel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'duel'
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Word Scramble & Cloze Duel</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
              TP3+
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({readingHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Story Roadmap Level Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {READING_STORIES.map((s, idx) => {
          const isDone = studentCompletedTasks.includes(s.id);
          const isCurrent = activeStoryIndex === idx;
          const isLocked = isTaskLocked
            ? isTaskLocked(s.id, 'Reading', s.level, s.prereqId)
            : !isFirstTimerDone && s.level > 1;

          return (
            <button
              key={s.id}
              onClick={() => {
                if (!isLocked) {
                  setActiveStoryIndex(idx);
                  setMatchedWordIndices(new Set());
                  setCurrentWordIndex(-1);
                  setHasEvaluatedReading(false);
                  setEvaluationResult(null);
                  setSelectedQuizOption(null);
                  setQuizSubmitted(false);
                } else {
                  showToast('Task Locked 🔒', 'Complete the previous level story to unlock this reading quest!', 'info');
                }
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/40 text-white'
                  : isDone
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                  : !isLocked
                  ? 'bg-slate-950/40 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  {s.category}
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
              <div className="font-black text-sm text-white line-clamp-1">{s.title}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>+{s.xpReward} XP</span>
                <span className="text-amber-400 font-bold">+3 ⭐</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === 'reading' ? (
        isCurrentStoryLocked ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">This Reading Story is Locked 🔒</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {!isFirstTimerDone
                ? 'Please complete the mandatory 1st Timer Diagnostic Guide first to unlock the learning arenas!'
                : 'Complete the previous level reading story first to unlock this quest.'}
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
            {/* Passage Controls Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">{story.title}</h2>
                <p className="text-xs text-slate-400">Click any word to hear pronunciation and explore definitions.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(story.passageText)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Model Narration</span>
                </button>
              </div>
            </div>

            {/* Word-by-Word Interactive Passage with Live Detection */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Recording Status:</span>
                  {isPupilRecording ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      Listening to your voice ({formatDuration(recordedDuration)})
                    </span>
                  ) : (
                    <span className="text-slate-500">Ready to record</span>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-300">
                  Words Read: <span className="text-emerald-400">{matchedWordIndices.size}</span> / {words.length} (
                  {Math.round((matchedWordIndices.size / words.length) * 100)}%)
                </div>
              </div>

              {/* Live word rendering with interactive highlights */}
              <div className="text-base sm:text-xl leading-loose font-medium text-slate-300 flex flex-wrap gap-2.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 select-none">
                {words.map((rawWord, idx) => {
                  const isMatched = matchedWordIndices.has(idx);
                  const isCurrent = currentWordIndex === idx;

                  return (
                    <span
                      key={idx}
                      onClick={() => handleWordClick(rawWord)}
                      className={`px-2.5 py-1 rounded-xl transition-all duration-300 cursor-pointer border ${
                        isMatched
                          ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 font-bold shadow-lg shadow-emerald-500/10 scale-105'
                          : isCurrent
                          ? 'bg-cyan-500/40 text-cyan-100 border-cyan-400 animate-pulse font-extrabold ring-2 ring-cyan-400/50'
                          : 'bg-slate-950/40 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                      }`}
                      title="Click to hear word & definition"
                    >
                      {rawWord}
                      {isMatched && <span className="text-[11px] text-emerald-400 ml-1">✓</span>}
                    </span>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(matchedWordIndices.size / words.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Selected Word Popover / Definition */}
            {selectedWord && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-blue-500/40 text-xs text-slate-200 flex items-start justify-between gap-3 animate-in fade-in">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-sm text-cyan-300">"{selectedWord.word}"</span>
                    <button
                      onClick={() => speakText(selectedWord.word)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer"
                      title="Pronounce again"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-300 mb-1">{selectedWord.definition}</p>
                  <p className="italic text-slate-400">{selectedWord.example}</p>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Evaluation Result Banner */}
            {hasEvaluatedReading && evaluationResult && (
              <div
                className={`p-5 rounded-2xl border text-xs space-y-2 animate-in fade-in ${
                  evaluationResult.needsMoreReading
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm flex items-center gap-2">
                    {evaluationResult.needsMoreReading ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <span>Passage Incomplete — Please Continue Reading</span>
                      </>
                    ) : (
                      <>
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <span>Reading Aloud Verified!</span>
                      </>
                    )}
                  </span>
                  {!evaluationResult.needsMoreReading && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>+{evaluationResult.starsAwarded} ⭐ Stars</span>
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium">{evaluationResult.praise}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-300 pt-1">
                  <span>
                    Fluency Accuracy:{' '}
                    <strong className="text-white">{evaluationResult.fluencyScore}%</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Words Captured:{' '}
                    <strong className="text-white">
                      {evaluationResult.wordsRead} / {evaluationResult.totalWords}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              {!isPupilRecording ? (
                <button
                  onClick={startRecording}
                  className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{matchedWordIndices.size > 0 ? 'Restart Reading Aloud' : 'Start Reading Aloud'}</span>
                </button>
              ) : (
                <button
                  onClick={stopAndEvaluateRecording}
                  className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-500/20 animate-pulse transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Have Finished Reading (Check Accuracy)</span>
                </button>
              )}

              {hasEvaluatedReading && !evaluationResult?.needsMoreReading && (
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Digital Portfolio & Evidence</span>
                </div>
              )}
            </div>

            {/* Comprehension Check Quiz */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Comprehension Check</span>
                </span>
                <span className="text-xs text-amber-400 font-bold">+2 ⭐ Stars</span>
              </div>

              <div className="font-bold text-sm text-white">{story.quiz.question}</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {story.quiz.options.map((opt, oIdx) => {
                  const isSelected = selectedQuizOption === oIdx;
                  const isCorrect = oIdx === story.quiz.correctIndex;

                  let style = 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (quizSubmitted) {
                    if (isCorrect) style = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    else if (isSelected && !isCorrect) style = 'bg-red-500/20 border-red-400 text-red-200';
                  } else if (isSelected) {
                    style = 'bg-blue-500/20 border-blue-400 text-white';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleQuizAnswer(oIdx)}
                      disabled={quizSubmitted}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : activeTab === 'duel' ? (
        /* Gamified Duel Tab (Word Scramble & Cloze Duel) */
        <div className="space-y-6">
          {/* Duel Level Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DUEL_QUESTS.map((duel, idx) => {
              const isCurrent = activeDuelIndex === idx;
              return (
                <button
                  key={duel.id}
                  onClick={() => setActiveDuelIndex(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-slate-900 border-amber-400 ring-2 ring-amber-400/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" />
                      <span>Level {duel.level} Duel</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {duel.minTP}
                    </span>
                  </div>
                  <div className="font-black text-sm text-white line-clamp-1">{duel.title}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span className="capitalize">{duel.mode === 'scramble' ? '🔤 Word Order' : '🧩 Cloze Passage'}</span>
                    <span className="text-amber-400 font-bold">+{duel.starsAward} ⭐</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Duel Arena Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase border border-amber-500/30">
                      {currentDuel.category}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{currentDuel.passageContext}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">{currentDuel.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetDuel}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Misi Cabaran:</span> {currentDuel.questionPrompt}
              </div>
            </div>

            {/* Duel Mode 1: Word Scramble */}
            {currentDuel.mode === 'scramble' && (
              <div className="space-y-5">
                {/* Target Sentence Drop Slot */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border-2 border-dashed border-amber-500/40 min-h-[90px] flex flex-wrap items-center gap-2">
                  {placedWords.length === 0 ? (
                    <div className="text-xs text-slate-500 italic mx-auto flex items-center gap-2 py-3">
                      <Move className="w-4 h-4" />
                      <span>Klik jubin perkataan di bawah untuk menyusun ayat ke dalam kotak ini</span>
                    </div>
                  ) : (
                    placedWords.map((word, idx) => (
                      <button
                        key={`${word}-${idx}`}
                        onClick={() => handleUnslotWord(word, idx)}
                        disabled={hasEvaluatedDuel}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/30 to-amber-600/30 hover:from-rose-500/40 hover:to-rose-600/40 text-amber-100 font-extrabold text-sm border border-amber-400/50 shadow-md flex items-center gap-1.5 group transition-all cursor-pointer"
                        title="Klik untuk buang perkataan dari susunan"
                      >
                        <span>{word}</span>
                        {!hasEvaluatedDuel && (
                          <span className="text-rose-300 text-xs opacity-60 group-hover:opacity-100">✕</span>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Available Word Tiles */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                    <span>Jubin Perkataan Tersedia ({selectedWordPool.length}):</span>
                    <span className="text-[11px] text-amber-400 font-semibold">Susun mengikut tatabahasa SVO</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80">
                    {selectedWordPool.length === 0 ? (
                      <div className="text-xs text-emerald-400 font-bold py-1">
                        Semua perkataan telah dimasukkan! Sila semak jawapan anda.
                      </div>
                    ) : (
                      selectedWordPool.map((word, idx) => (
                        <button
                          key={`${word}-${idx}`}
                          onClick={() => handleSlotWord(word, idx)}
                          disabled={hasEvaluatedDuel}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95 text-white font-black text-sm border border-slate-700 hover:border-amber-400 shadow-md transition-all cursor-pointer"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Duel Mode 2: Cloze Challenge */}
            {currentDuel.mode === 'cloze' && (
              <div className="space-y-5">
                {/* Sentence with Blank Slot */}
                <div className="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-base sm:text-lg font-bold text-slate-200 leading-relaxed">
                  {(() => {
                    const parts = (currentDuel.clozeSentence || '').split('[ ______ ]');
                    const chosenText =
                      selectedClozeOption !== null && currentDuel.clozeOptions
                        ? currentDuel.clozeOptions[selectedClozeOption]
                        : null;
                    return (
                      <p>
                        <span>{parts[0]}</span>
                        <span
                          className={`inline-block px-3 py-1 mx-1.5 rounded-xl border-2 font-black transition-all ${
                            chosenText
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg'
                              : 'bg-slate-900 border-dashed border-amber-500/50 text-slate-500'
                          }`}
                        >
                          {chosenText || '___?___'}
                        </span>
                        <span>{parts[1]}</span>
                      </p>
                    );
                  })()}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400">Pilih Kosa Kata Yang Paling Tepat:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentDuel.clozeOptions?.map((opt, idx) => {
                      const isSelected = selectedClozeOption === idx;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            if (!hasEvaluatedDuel) {
                              playDropSnap();
                              setSelectedClozeOption(idx);
                            }
                          }}
                          disabled={hasEvaluatedDuel}
                          className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border-amber-400 ring-2 ring-amber-400/40 text-white'
                              : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                              isSelected
                                ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Check Answer Button & Feedback Panel */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {!hasEvaluatedDuel ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Ganjaran: <span className="text-amber-400 font-bold">+{currentDuel.starsAward} ⭐</span> &{' '}
                    <span className="text-indigo-400 font-bold">+{currentDuel.xpReward} XP</span>
                  </div>
                  <button
                    onClick={handleCheckDuelAnswer}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 hover:from-amber-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>SEMAK JAWAPAN SAYA (CHECK MY ANSWER)</span>
                  </button>
                </div>
              ) : (
                <div
                  className={`p-5 rounded-2xl border ${
                    isDuelCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isDuelCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-black text-sm flex items-center gap-2">
                        <span>{isDuelCorrect ? 'Tahniah! Jawapan Tepat 🎉' : 'Belum Tepat, Cuba Lagi!'}</span>
                        {isDuelCorrect && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                            +{currentDuel.starsAward} ⭐ Stars Awarded
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-1 text-slate-200">{currentDuel.explanation}</p>
                      <div className="mt-3 flex items-center gap-3">
                        {!isDuelCorrect ? (
                          <button
                            onClick={handleResetDuel}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Cuba Semula
                          </button>
                        ) : activeDuelIndex < DUEL_QUESTS.length - 1 ? (
                          <button
                            onClick={handleNextDuel}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                          >
                            <span>Cabaran Seterusnya (Next Duel)</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span>Semua cabaran Speed Duel telah berjaya diselesaikan!</span>
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
          {readingHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-900 border border-slate-800">
              No reading submissions recorded yet. Read a story aloud in the Reading Studio tab!
            </div>
          ) : (
            readingHistory.map((h: any) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{h.taskTitle}</div>
                  <div className="text-slate-400 mt-0.5">{h.userInputSummary}</div>
                  <div className="text-emerald-400 text-[11px] mt-1">{h.feedbackSummary}</div>
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
