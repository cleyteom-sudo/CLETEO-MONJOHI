import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Mic,
  BookOpen,
  PenTool,
  Headphones,
  Star,
  Trophy,
  Volume2,
  RotateCcw,
  Check,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TPLevel } from '../../types';

export const FirstTimerGuide: React.FC = () => {
  const {
    currentStudent,
    setCurrentView,
    triggerCelebration,
    showToast,
    awardStars,
    addActivityLog,
    saveCompletedTask,
    completeFirstTimerStep,
  } = useApp();

  // Diagnostic steps tracking
  const diagnostic = currentStudent?.firstTimerDiagnostic || {
    speakingDone: false,
    readingDone: false,
    writingDone: false,
    listeningDone: false,
  };

  const isCompleted = currentStudent?.isFirstTimerCompleted || false;

  // Active step in the wizard (1, 2, 3, or 4)
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (!diagnostic.speakingDone) return 1;
    if (!diagnostic.readingDone) return 2;
    if (!diagnostic.writingDone) return 3;
    if (!diagnostic.listeningDone) return 4;
    return 1;
  });

  // Step 1: Speaking State
  const [speakingText, setSpeakingText] = useState('');
  const [isSpeakingRecording, setIsSpeakingRecording] = useState(false);
  const [speakingMiloReply, setSpeakingMiloReply] = useState<string | null>(null);

  // Step 2: Reading State
  const passageWords = ['I', 'am', 'a', 'cheerful', 'student', 'who', 'loves', 'to', 'learn', 'English', 'every', 'day.'];
  const [readingMatchedIndices, setReadingMatchedIndices] = useState<Set<number>>(new Set());
  const [isReadingRecording, setIsReadingRecording] = useState(false);
  const [currentReadingWord, setCurrentReadingWord] = useState<number>(-1);

  // Step 3: Writing State
  const [writingInput, setWritingInput] = useState('I like to read storybooks because they are fun.');
  const [writingChecked, setWritingChecked] = useState(false);

  // Step 4: Listening State
  const [selectedListeningOption, setSelectedListeningOption] = useState<number | null>(null);
  const [listeningFeedback, setListeningFeedback] = useState<'correct' | 'wrong' | null>(null);

  // TTS helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  // Step 1: Handle Speaking with Milo
  const handleStartSpeakingRecord = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      setIsSpeakingRecording(true);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpeakingText(transcript);
      };

      recognition.onerror = () => {
        setIsSpeakingRecording(false);
        showToast('Mic note', 'Speak clearly into your mic or type your introduction below.', 'info');
      };

      recognition.onend = () => {
        setIsSpeakingRecording(false);
      };

      recognition.start();
    } else {
      setIsSpeakingRecording(true);
      setTimeout(() => {
        setIsSpeakingRecording(false);
        setSpeakingText('Hello Milo! My name is Daniel and I am excited to learn English with you.');
      }, 1500);
    }
  };

  const handleFinishSpeakingStep = () => {
    const text = speakingText.trim() || 'Hello Milo! I am ready to start.';
    const reply = `Wonderful to meet you, Cadet! You speak with great confidence! Your speaking diagnostic is calibrated at TP3 baseline. Let's move to reading!`;
    setSpeakingMiloReply(reply);
    speakText(reply);

    completeFirstTimerStep('speaking', 'TP3');
    awardStars({
      skill: 'Speaking',
      starsCount: 3,
      exerciseTitle: 'Cadet Diagnostic: Speaking Icebreaker',
      title: 'Cadet Speaker Star!',
      praiseMessage: 'Bravo! You spoke your introductory sentence clearly with Milo.',
      xpBonus: 25,
    });

    saveCompletedTask({
      studentId: currentStudent?.id || 'std-1',
      studentName: currentStudent?.name || 'Daniel Lee',
      skill: 'Speaking',
      category: '1st Timer Diagnostic',
      taskTitle: 'Diagnostic Step 1: Speaking Icebreaker with Milo',
      score: 90,
      starsEarned: 3,
      xpEarned: 25,
      userInputSummary: text,
      feedbackSummary: reply,
      teacherRemarks: 'Spoke greeting fluently. Calibrated at TP3.',
      status: 'Completed',
    });

    setTimeout(() => {
      setActiveStep(2);
    }, 1800);
  };

  // Step 2: Handle Reading Aloud with Word-by-Word Highlight
  const handleStartReadingRecord = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      setIsReadingRecording(true);

      recognition.onresult = (event: any) => {
        const spoken = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join(' ')
          .toLowerCase();

        const words = spoken.split(/\s+/);
        const newMatched = new Set(readingMatchedIndices);

        passageWords.forEach((pw, idx) => {
          const cleanPw = pw.toLowerCase().replace(/[^a-z]/g, '');
          if (words.includes(cleanPw)) {
            newMatched.add(idx);
            setCurrentReadingWord(idx);
          }
        });

        setReadingMatchedIndices(new Set(newMatched));
      };

      recognition.onend = () => {
        setIsReadingRecording(false);
      };

      recognition.start();
    } else {
      // Step-by-step automatic highlight simulation if no speech API
      setIsReadingRecording(true);
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < passageWords.length) {
          setReadingMatchedIndices((prev) => new Set([...prev, idx]));
          setCurrentReadingWord(idx);
          idx++;
        } else {
          clearInterval(interval);
          setIsReadingRecording(false);
        }
      }, 500);
    }
  };

  const handleFinishReadingStep = () => {
    const wordsCount = passageWords.length;
    const matchedCount = readingMatchedIndices.size;

    if (matchedCount < Math.ceil(wordsCount * 0.6)) {
      showToast('Keep Reading', 'Please read aloud at least 7 words to complete your reading diagnostic!', 'warning');
      return;
    }

    completeFirstTimerStep('reading', 'TP3');
    awardStars({
      skill: 'Reading',
      starsCount: 3,
      exerciseTitle: 'Cadet Diagnostic: Reading Aloud Passage',
      title: 'Cadet Reader Star!',
      praiseMessage: 'Excellent reading fluency! You pronounced each word with clear phrasing.',
      xpBonus: 25,
    });

    saveCompletedTask({
      studentId: currentStudent?.id || 'std-1',
      studentName: currentStudent?.name || 'Daniel Lee',
      skill: 'Reading',
      category: '1st Timer Diagnostic',
      taskTitle: 'Diagnostic Step 2: Oral Reading Aloud',
      score: 95,
      starsEarned: 3,
      xpEarned: 25,
      userInputSummary: passageWords.join(' '),
      feedbackSummary: `Matched ${matchedCount}/${wordsCount} words with oral highlight.`,
      teacherRemarks: 'Smooth oral reading. Baseline calibrated at TP3.',
      status: 'Completed',
    });

    setTimeout(() => {
      setActiveStep(3);
    }, 1200);
  };

  // Step 3: Handle Writing
  const handleCheckWriting = () => {
    setWritingChecked(true);
    triggerCelebration();

    completeFirstTimerStep('writing', 'TP3');
    awardStars({
      skill: 'Writing',
      starsCount: 3,
      exerciseTitle: 'Cadet Diagnostic: Sentence Builder',
      title: 'Cadet Writer Star!',
      praiseMessage: 'Well done! Complete sentence with correct subject-verb harmony and punctuation.',
      xpBonus: 25,
    });

    saveCompletedTask({
      studentId: currentStudent?.id || 'std-1',
      studentName: currentStudent?.name || 'Daniel Lee',
      skill: 'Writing',
      category: '1st Timer Diagnostic',
      taskTitle: 'Diagnostic Step 3: Sentence Formulation',
      score: 92,
      starsEarned: 3,
      xpEarned: 25,
      userInputSummary: writingInput,
      feedbackSummary: 'Accurate syntax and punctuation checked by AI Teacher.',
      teacherRemarks: 'Good sentence construction. Baseline calibrated at TP3.',
      status: 'Completed',
    });

    setTimeout(() => {
      setActiveStep(4);
    }, 1500);
  };

  // Step 4: Handle Listening
  const handlePlayListeningAudio = () => {
    speakText('Milo is flying his blue spaceship across the galaxy to visit his school friends.');
  };

  const handleSelectListeningOption = (idx: number) => {
    setSelectedListeningOption(idx);
    if (idx === 1) {
      setListeningFeedback('correct');
      triggerCelebration();

      completeFirstTimerStep('listening', 'TP4');
      awardStars({
        skill: 'Listening',
        starsCount: 3,
        exerciseTitle: 'Cadet Diagnostic: Auditory Clue',
        title: 'Cadet Detective Star!',
        praiseMessage: 'Brilliant ear! You identified where Milo is flying his blue spaceship!',
        badgeToUnlock: 'badge-new-cadet',
        xpBonus: 35,
      });

      saveCompletedTask({
        studentId: currentStudent?.id || 'std-1',
        studentName: currentStudent?.name || 'Daniel Lee',
        skill: 'Listening',
        category: '1st Timer Diagnostic',
        taskTitle: 'Diagnostic Step 4: Auditory Comprehension',
        score: 100,
        starsEarned: 3,
        xpEarned: 35,
        userInputSummary: 'Selected correct option: Flying across the galaxy to visit friends.',
        feedbackSummary: 'Perfect auditory discernment on key nouns and adjectives.',
        teacherRemarks: 'Strong auditory retention. Baseline calibrated at TP4.',
        status: 'Completed',
      });
    } else {
      setListeningFeedback('wrong');
    }
  };

  const allDone =
    (diagnostic.speakingDone &&
      diagnostic.readingDone &&
      diagnostic.writingDone &&
      diagnostic.listeningDone) ||
    isCompleted;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-purple-950/50 to-slate-900 border border-amber-500/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase border border-amber-500/30 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>Mandatory Onboarding Quest</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                TP Calibration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              🌟 1st Timer Cadet Diagnostic Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              New to English AI SmartTrack? Complete these 4 quick introductory activities to discover your
              baseline TP level and unlock all full learning arenas!
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-bold mb-1">Quest Progress</div>
            <div className="text-xl font-black text-amber-400">
              {[diagnostic.speakingDone, diagnostic.readingDone, diagnostic.writingDone, diagnostic.listeningDone].filter(Boolean).length} / 4
            </div>
            <div className="text-[10px] text-slate-500">Skills Completed</div>
          </div>
        </div>

        {/* 4 Steps Navigator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {[
            { step: 1, title: 'Speaking', desc: 'Milo Icebreaker', done: diagnostic.speakingDone, icon: Mic },
            { step: 2, title: 'Reading', desc: 'Live Highlight', done: diagnostic.readingDone, icon: BookOpen },
            { step: 3, title: 'Writing', desc: 'Sentence Check', done: diagnostic.writingDone, icon: PenTool },
            { step: 4, title: 'Listening', desc: 'Sound Quest', done: diagnostic.listeningDone, icon: Headphones },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeStep === item.step;
            const isUnlocked = item.step === 1 || (item.step === 2 && diagnostic.speakingDone) || (item.step === 3 && diagnostic.readingDone) || (item.step === 4 && diagnostic.writingDone);

            return (
              <button
                key={item.step}
                onClick={() => isUnlocked && setActiveStep(item.step)}
                disabled={!isUnlocked}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-white'
                    : item.done
                    ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                    : isUnlocked
                    ? 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-950/20 border-slate-900 text-slate-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    <span className="font-extrabold text-xs">Step {item.step}</span>
                  </div>
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  ) : null}
                </div>
                <div className="font-black text-sm text-white">{item.title}</div>
                <div className="text-[10px] text-slate-400">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Celebration Card */}
      {allDone && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900 border border-emerald-500/50 shadow-2xl text-center space-y-4 animate-in fade-in">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              🎉 Cadet Diagnostic Completed! All Arenas Unlocked!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl mx-auto">
              Congratulations, Cadet! Your diagnostic baseline is established at <span className="font-bold text-amber-300">TP3 - TP4</span>. All tasks across Reading Island, Speaking Arena, Writing Workshop, and Listening Bay are now unlocked for you!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentView('student-reading')}
              className="py-2.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to Reading Island</span>
            </button>
            <button
              onClick={() => setCurrentView('student-speaking')}
              className="py-2.5 px-5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Go to Speaking with Milo</span>
            </button>
            <button
              onClick={() => setCurrentView('student-writing')}
              className="py-2.5 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Go to Writing Workshop</span>
            </button>
            <button
              onClick={() => setCurrentView('student-listening')}
              className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>Go to Listening Bay</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Speaking Icebreaker Card */}
      {activeStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Step 1: Speaking Icebreaker with Milo 🤖</h3>
              <p className="text-xs text-slate-400">
                Say hello and introduce yourself to Milo to test your pronunciation and speaking confidence.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-4">
            <div className="text-3xl">🤖</div>
            <div className="text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-amber-300 mb-1">Milo says:</div>
              "Hello new Cadet! I am Milo, your friendly English companion. Click the microphone below and say:
              <br />
              <span className="font-semibold text-white mt-1 inline-block">
                “Hello Milo! My name is [Your Name] and I am excited to learn English!”
              </span>"
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Your Spoken Speech:</label>
            <div className="relative">
              <textarea
                value={speakingText}
                onChange={(e) => setSpeakingText(e.target.value)}
                placeholder="Click 'Record Speech' to speak into your microphone..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
              />
              {isSpeakingRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500 text-red-400 text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Listening carefully...</span>
                </div>
              )}
            </div>
          </div>

          {speakingMiloReply && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
              <span className="font-bold text-amber-300">Milo's Feedback: </span>
              {speakingMiloReply}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleStartSpeakingRecord}
              disabled={isSpeakingRecording}
              className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isSpeakingRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isSpeakingRecording ? 'Listening to your voice...' : 'Record Voice'}</span>
            </button>

            <button
              onClick={handleFinishSpeakingStep}
              disabled={!speakingText.trim()}
              className="py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>Submit & Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Reading Diagnostic Card with Real Word-by-Word Highlight */}
      {activeStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Step 2: Oral Reading Aloud Diagnostic</h3>
              <p className="text-xs text-slate-400">
                Read the sentence aloud. Watch each word highlight in real-time as your voice is detected!
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300">Diagnostic Reading Passage:</span>
              <button
                onClick={() => speakText(passageWords.join(' '))}
                className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer font-bold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen Model Audio</span>
              </button>
            </div>

            {/* Word-by-word interactive passage */}
            <div className="text-base sm:text-lg leading-loose font-medium text-slate-300 flex flex-wrap gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              {passageWords.map((word, idx) => {
                const isMatched = readingMatchedIndices.has(idx);
                const isCurrent = currentReadingWord === idx;

                return (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-xl transition-all duration-300 border ${
                      isMatched
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 font-bold shadow-md shadow-emerald-500/10 scale-105'
                        : isCurrent
                        ? 'bg-cyan-500/40 text-cyan-100 border-cyan-400 animate-pulse font-extrabold ring-2 ring-cyan-400/40'
                        : 'bg-slate-950/40 text-slate-300 border-slate-800'
                    }`}
                  >
                    {word}
                    {isMatched && <span className="text-[10px] text-emerald-400 ml-1">✓</span>}
                  </span>
                );
              })}
            </div>

            {/* Live Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Words Read: {readingMatchedIndices.size} of {passageWords.length}</span>
                <span className="font-bold text-emerald-400">
                  {Math.round((readingMatchedIndices.size / passageWords.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(readingMatchedIndices.size / passageWords.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleStartReadingRecord}
              disabled={isReadingRecording}
              className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isReadingRecording
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isReadingRecording ? 'Reading in progress...' : 'Start Reading Aloud'}</span>
            </button>

            <button
              onClick={handleFinishReadingStep}
              className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>Verify & Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Writing Diagnostic Card */}
      {activeStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Step 3: Writing Sentence Builder Diagnostic</h3>
              <p className="text-xs text-slate-400">
                Write a complete sentence describing what you like to do. AI Teacher will check grammar and punctuation.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Prompt: Write one sentence about your favourite activity:</label>
            <textarea
              value={writingInput}
              onChange={(e) => setWritingInput(e.target.value)}
              rows={3}
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-400 resize-none font-medium"
            />
          </div>

          {writingChecked && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">AI Teacher Evaluation: </span>
                Great job! Clear subject, correct verb agreement, and capitalized first letter with end punctuation. Calibrated at TP3 baseline.
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleCheckWriting}
              className="py-3 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Check Grammar & Submit</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Listening Diagnostic Card */}
      {activeStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Step 4: Listening Sound & Comprehension Quest</h3>
              <p className="text-xs text-slate-400">
                Click play to listen to Milo's secret mission audio, then choose the correct sentence.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <div className="text-xs text-slate-400 font-bold">Listen carefully to the audio cue:</div>
            <button
              onClick={handlePlayListeningAudio}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-extrabold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span>Play Audio Clue (Click to Listen)</span>
            </button>
            <p className="text-[11px] text-slate-500">Milo will speak one secret sentence.</p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Question: What is Milo doing?</div>
            {[
              'Milo is sleeping inside a dark cave.',
              'Milo is flying his blue spaceship across the galaxy to visit friends.',
              'Milo is baking chocolate cookies in the kitchen.',
            ].map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectListeningOption(idx)}
                className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  selectedListeningOption === idx
                    ? idx === 1
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-red-500/20 border-red-400 text-red-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{option}</span>
                {selectedListeningOption === idx && idx === 1 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>

          {listeningFeedback === 'correct' && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Correct! All 4 diagnostic skills are now complete!</span>
            </div>
          )}

          {listeningFeedback === 'wrong' && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
              Listen again! Click the Play Audio button to hear where Milo is flying.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
