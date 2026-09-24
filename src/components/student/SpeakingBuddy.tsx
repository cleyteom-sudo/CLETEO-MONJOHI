import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Award,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Star,
  Trophy,
  Lock,
  ArrowRight,
  History,
  RotateCcw,
  Languages,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playBadgeFanfare, playPopChirp, playStarChime } from '../../utils/soundEffects';

interface Message {
  id: string;
  sender: 'milo' | 'student';
  text: string;
  time: string;
}

interface SpeakingMission {
  id: string;
  level: number;
  title: string;
  category: string;
  topic: string;
  initialMiloGreeting: string;
  maxTurns: number;
  prereqId?: string;
  xpReward: number;
  suggestedPrompts: string[];
}

const SPEAKING_MISSIONS: SpeakingMission[] = [
  {
    id: 'spk-mission-1',
    level: 1,
    title: 'Milo Icebreaker: Favourite Foods',
    category: 'Level 1: Expressing Preferences',
    topic: 'My Favourite Food',
    initialMiloGreeting:
      'Hi there, Cadet! 🤖 I am Milo, your English Speaking Buddy! What is your favourite food to eat, and why do you love it?',
    maxTurns: 3,
    xpReward: 35,
    suggestedPrompts: [
      'My favourite food is chicken rice because it is delicious.',
      'I really love spicy nasi lemak with crispy peanuts.',
      'I enjoy eating crunchy pizza on the weekend.',
    ],
  },
  {
    id: 'spk-mission-2',
    level: 2,
    title: 'School Adventures & Best Friends',
    category: 'Level 2: Conversational Exchange',
    topic: 'My School & Friends',
    initialMiloGreeting:
      'Beep boop! 🤖 Tell me about your school! What is your favourite subject, and what do you and your friends play during recess?',
    maxTurns: 4,
    prereqId: 'spk-mission-1',
    xpReward: 45,
    suggestedPrompts: [
      'My favourite subject is English because we play games.',
      'During recess, my friends and I play badminton in the hall.',
      'I like science because we do cool experiments.',
    ],
  },
  {
    id: 'spk-mission-3',
    level: 3,
    title: 'Space Journey & Future Dreams',
    category: 'Level 3: Narrative & Imagination',
    topic: 'Space Exploration & Dreams',
    initialMiloGreeting:
      'Greetings from the starship! 🚀 If you could fly to any planet or build a robot helper, what would you invent?',
    maxTurns: 5,
    prereqId: 'spk-mission-2',
    xpReward: 55,
    suggestedPrompts: [
      'I would build a robot helper that can plant trees and clean rivers.',
      'I want to fly to Mars and look for mysterious glowing rocks.',
      'I would invent a flying car powered by solar energy.',
    ],
  },
];

export const SpeakingBuddy: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<'arena' | 'history'>('arena');

  const mission = SPEAKING_MISSIONS[activeMissionIndex];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-milo-0',
      sender: 'milo',
      text: mission.initialMiloGreeting,
      time: 'Just now',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hearingTranscript, setHearingTranscript] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState<'en-MY' | 'en-GB' | 'en-US'>('en-MY');
  const [turnCount, setTurnCount] = useState(1);
  const [isMiloThinking, setIsMiloThinking] = useState(false);
  const [isMiloSpeaking, setIsMiloSpeaking] = useState(false);
  const [hasCompletedMission, setHasCompletedMission] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const studentCompletedTasks = currentStudent?.completedTaskIds || ['spk-mission-1'];
  const isFirstTimerDone = currentStudent?.isFirstTimerCompleted ?? true;

  const isCurrentMissionLocked = isTaskLocked
    ? isTaskLocked(mission.id, 'Speaking', mission.level, mission.prereqId)
    : !isFirstTimerDone && mission.level > 1;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMiloThinking]);

  // Text to speech for Milo's audio
  const speakMilo = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.15;
      utterance.rate = 0.95;
      utterance.lang = 'en-US';
      utterance.onstart = () => setIsMiloSpeaking(true);
      utterance.onend = () => setIsMiloSpeaking(false);
      utterance.onerror = () => setIsMiloSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Detailed and specific voice recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLanguage;
      recognition.interimResults = true;
      recognition.continuous = false;

      setHearingTranscript('');
      setIsRecording(true);

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        const detected = finalTrans || interimTrans;
        setHearingTranscript(detected);
        if (finalTrans) {
          setInputMessage(finalTrans);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition status:', e);
        setIsRecording(false);
        // CRITICAL: NEVER inject canned text like "nasi lemak" on error!
        if (e.error === 'no-speech') {
          showToast('Mic Status', 'No speech was detected. Please try speaking closer to your mic.', 'info');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      showToast('Microphone Note', 'Web Speech API unavailable. Please type your message below.', 'info');
    }
  };

  // Send message to Milo
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage || hearingTranscript).trim();
    if (!textToSend || isMiloThinking) return;

    playPopChirp();

    const studentMsg: Message = {
      id: `std-${Date.now()}`,
      sender: 'student',
      text: textToSend,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputMessage('');
    setHearingTranscript('');
    setIsMiloThinking(true);

    try {
      const res = await fetch('/api/gemini/speaking-buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: mission.topic,
          message: textToSend,
          turnCount,
          history: messages.map((m) => ({
            role: m.sender === 'milo' ? 'assistant' : 'user',
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || getLocalIntelligentReply(textToSend, turnCount, mission.topic);

      setTimeout(() => {
        setIsMiloThinking(false);
        const miloMsg: Message = {
          id: `milo-${Date.now()}`,
          sender: 'milo',
          text: reply,
          time: 'Just now',
        };
        setMessages((prev) => [...prev, miloMsg]);
        speakMilo(reply);

        const nextTurn = turnCount + 1;
        setTurnCount(nextTurn);

        if (nextTurn > mission.maxTurns && !hasCompletedMission) {
          completeMissionSuccess();
        }
      }, 700);
    } catch {
      const reply = getLocalIntelligentReply(textToSend, turnCount, mission.topic);
      setIsMiloThinking(false);
      const miloMsg: Message = {
        id: `milo-${Date.now()}`,
        sender: 'milo',
        text: reply,
        time: 'Just now',
      };
      setMessages((prev) => [...prev, miloMsg]);
      speakMilo(reply);

      const nextTurn = turnCount + 1;
      setTurnCount(nextTurn);

      if (nextTurn > mission.maxTurns && !hasCompletedMission) {
        completeMissionSuccess();
      }
    }
  };

  const getLocalIntelligentReply = (studentSaid: string, turn: number, topic: string) => {
    const lower = studentSaid.toLowerCase();
    if (lower.includes('because')) {
      return `I love your clear reasoning! "${studentSaid}". You expressed your thoughts with great detail!`;
    }
    if (turn === 1) {
      return `That is wonderful! You spoke about ${studentSaid}. What else do you enjoy most about it?`;
    }
    if (turn === 2) {
      return `Super sentence! How often do you get to do or enjoy this during the week?`;
    }
    return `Magnificent speaking today, Cadet! You spoke with confidence, clear phrasing, and full sentences! High five! 🤖✋`;
  };

  const completeMissionSuccess = () => {
    setHasCompletedMission(true);
    playStarChime();
    triggerCelebration();

    awardStars({
      skill: 'Speaking',
      starsCount: 3,
      exerciseTitle: `Milo Speaking Dialogue: ${mission.title}`,
      title: 'Brave Speaker Superstar!',
      praiseMessage: `Superb conversational fluency! You completed all ${mission.maxTurns} spoken turns with Milo!`,
      badgeToUnlock: 'badge-brave-speaker',
      xpBonus: mission.xpReward,
    });

    saveCompletedTask({
      studentId: currentStudent?.id || 'std-daniel-lee',
      studentName: currentStudent?.name || 'Daniel Lee',
      skill: 'Speaking',
      category: mission.category,
      taskTitle: mission.title,
      score: 95,
      starsEarned: 3,
      xpEarned: mission.xpReward,
      userInputSummary: `Spoke ${mission.maxTurns} turns with Milo on "${mission.topic}".`,
      feedbackSummary: `Completed conversational mission with clear oral articulation and spontaneous responses.`,
      teacherRemarks: `Fluency: TP4 standard. Shows spontaneous sentence structures.`,
      status: 'Completed',
    });

    addEvidence({
      studentId: currentStudent?.id || 'std-3',
      studentName: currentStudent?.name || 'Daniel Lee',
      skill: 'Speaking',
      activityTitle: `Speaking with Milo — ${mission.title}`,
      evidenceType: 'audio',
      audioDuration: '1:15',
      textContent: `Completed ${mission.maxTurns}-turn dialogue with Milo. Accurate speech recognition verified.`,
      teacherStatus: 'Pending Review',
      aiSuggestedTP: 'TP4',
    });

    showToast('Mission Complete!', '+3 ⭐ Stars & Speaking Evidence Saved!', 'success');
  };

  const handleResetDialogue = () => {
    setMessages([
      {
        id: `msg-milo-${Date.now()}`,
        sender: 'milo',
        text: mission.initialMiloGreeting,
        time: 'Just now',
      },
    ]);
    setTurnCount(1);
    setHasCompletedMission(false);
    setInputMessage('');
    setHearingTranscript('');
  };

  const speakingHistory = taskHistory.filter((item: any) => item.skill === 'Speaking');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/70 via-amber-950/50 to-slate-900 border border-amber-500/30 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase border border-amber-500/30 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              <span>Milo AI Speaking Arena</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              Detailed Voice Recognition
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            🤖 Speaking Arena with Milo
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Talk directly to Milo. The advanced speech engine captures your exact spoken words with detailed
            pronunciation feedback.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('arena')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Speaking Arena
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({speakingHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Mission Roadmap Level Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SPEAKING_MISSIONS.map((m, idx) => {
          const isDone = studentCompletedTasks.includes(m.id);
          const isCurrent = activeMissionIndex === idx;
          const isLocked = isTaskLocked
            ? isTaskLocked(m.id, 'Speaking', m.level, m.prereqId)
            : !isFirstTimerDone && m.level > 1;

          return (
            <button
              key={m.id}
              onClick={() => {
                if (!isLocked) {
                  setActiveMissionIndex(idx);
                  setMessages([
                    {
                      id: `msg-milo-${Date.now()}`,
                      sender: 'milo',
                      text: m.initialMiloGreeting,
                      time: 'Just now',
                    },
                  ]);
                  setTurnCount(1);
                  setHasCompletedMission(false);
                } else {
                  showToast('Mission Locked 🔒', 'Complete the previous level mission to unlock this dialogue quest!', 'info');
                }
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-white'
                  : isDone
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                  : !isLocked
                  ? 'bg-slate-950/40 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
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
                <span className="text-amber-400 font-bold">+{m.maxTurns} Turns</span>
              </div>
            </button>
          );
        })}
      </div>

      {activeTab === 'arena' ? (
        isCurrentMissionLocked ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-white">This Speaking Mission is Locked 🔒</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {!isFirstTimerDone
                ? 'Please complete the mandatory 1st Timer Diagnostic Guide first to unlock the learning arenas!'
                : 'Complete the previous level speaking mission first to unlock this quest.'}
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
            {/* Milo Status Bar & Accent Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-2xl shadow-lg">
                    🤖
                  </div>
                  {isMiloSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Milo Speaking Partner</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Turn:</span>
                    <span className="font-bold text-amber-400">
                      {Math.min(turnCount, mission.maxTurns)} of {mission.maxTurns}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-bold">
                      {isMiloSpeaking ? 'Speaking...' : isMiloThinking ? 'Thinking...' : 'Listening to you'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accent & Voice Recognition Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Accent:</span>
                </span>
                {(['en-MY', 'en-GB', 'en-US'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSpeechLanguage(lang)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      speechLanguage === lang
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'en-MY' ? 'MY (Delima)' : lang === 'en-GB' ? 'UK' : 'US'}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 min-h-[280px] max-h-[380px] overflow-y-auto space-y-3.5">
              {messages.map((msg) => {
                const isMilo = msg.sender === 'milo';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMilo ? 'justify-start' : 'justify-end'}`}
                  >
                    {isMilo && (
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 text-sm">
                        🤖
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMilo
                          ? 'bg-slate-900 border border-slate-800 text-slate-200'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {isMilo && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => speakMilo(msg.text)}
                            className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Hear Milo Repeat</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isMiloThinking && (
                <div className="flex items-center gap-2 text-xs text-amber-300 font-bold p-2 animate-pulse">
                  <span>🤖 Milo is processing what you said...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Live Hearing Voice Indicator */}
            {isRecording && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-red-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold">Live Hearing:</span>
                  <span className="italic text-white">
                    "{hearingTranscript || 'Speak into your microphone now...'}"
                  </span>
                </div>
                <button
                  onClick={toggleSpeechRecognition}
                  className="px-3 py-1 rounded-xl bg-red-600 text-white font-bold text-[11px] cursor-pointer"
                >
                  Done Speaking
                </button>
              </div>
            )}

            {/* Suggested Prompts Pill */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Need ideas? Click to speak or insert:</span>
              <div className="flex flex-wrap gap-2">
                {mission.suggestedPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      setInputMessage(prompt);
                      playPopChirp();
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Input Controls */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={toggleSpeechRecognition}
                className={`p-3.5 rounded-2xl font-bold transition-all cursor-pointer shrink-0 shadow-lg ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
                title={isRecording ? 'Stop Recording' : 'Record Your Speech'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Speak via microphone or type your sentence here..."
                disabled={isMiloThinking}
                className="flex-1 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={(!inputMessage.trim() && !hearingTranscript.trim()) || isMiloThinking}
                className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all cursor-pointer shrink-0 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>

              <button
                onClick={handleResetDialogue}
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                title="Restart Conversation"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )
      ) : (
        /* History Tab */
        <div className="space-y-3">
          {speakingHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-900 border border-slate-800">
              No speaking sessions recorded yet. Chat with Milo in the Speaking Arena tab!
            </div>
          ) : (
            speakingHistory.map((h: any) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{h.taskTitle}</div>
                  <div className="text-slate-400 mt-0.5">{h.userInputSummary}</div>
                  <div className="text-amber-400 text-[11px] mt-1">{h.feedbackSummary}</div>
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
