import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Palette,
  User,
  Upload,
  Sparkles,
  Check,
  X,
  Camera,
  Image as ImageIcon,
  Rocket,
  Trees,
  Castle,
  Fish,
  Flame,
  CheckCircle2,
  Wand2,
  RefreshCw,
  Clock,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeType } from '../../types';
import { THEME_CONFIGS } from '../layout/ThemeBackground';

interface AiWallpaperPreset {
  id: string;
  title: string;
  prompt: string;
  category: 'sci-fi' | 'nature' | 'fantasy';
  imageUrl: string;
  badge: string;
}

const AI_WALLPAPER_GALLERY: AiWallpaperPreset[] = [
  {
    id: 'ai-nebula-bridge',
    title: 'Nebula Starship Bridge',
    prompt: 'Ultra-wide panoramic view from starship bridge overlooking vivid ultraviolet nebula and interstellar star clusters',
    category: 'sci-fi',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Sci-Fi',
  },
  {
    id: 'ai-elven-forest',
    title: 'Ancient Redwood Canopy',
    prompt: 'Bioluminescent ancient redwood canopy with warm golden sunbeams, moss covered tree trunks and glowing fireflies',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Nature',
  },
  {
    id: 'ai-disney-castle',
    title: 'Fairytale Twilight Kingdom',
    prompt: 'Illuminated fairytale fantasy royal castle at twilight with vibrant purple skies and golden fairy dust sparkles',
    category: 'fantasy',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Fantasy',
  },
  {
    id: 'ai-coral-lagoon',
    title: 'Crystal Coral Abyss',
    prompt: 'Deep turquoise coral reef illuminated by surface sun rays with tropical marine life and crystal clear ocean depth',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Aquatic',
  },
  {
    id: 'ai-volcano-cyber',
    title: 'Cyberpunk Magma Caldera',
    prompt: 'Futuristic obsidian volcanic landscape with glowing orange molten magma rivers and sci-fi high-tech thermal glow',
    category: 'sci-fi',
    imageUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Cyber',
  },
  {
    id: 'ai-aurora-skyline',
    title: 'Polar Aurora Borealis',
    prompt: 'Ethereal emerald and cyan aurora borealis dancing across starry night sky above snow-capped mountain ridge',
    category: 'nature',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Celestial',
  },
  {
    id: 'ai-hologram-academy',
    title: 'Neon Hologram Academy',
    prompt: 'Futuristic smart academy with flying hologram books, blue cyber light conduits and digital glass architecture',
    category: 'sci-fi',
    imageUrl: 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Futuristic',
  },
  {
    id: 'ai-cherry-twilight',
    title: 'Tokyo Twilight Sakura',
    prompt: 'Enchanted dusk garden with blooming pink cherry blossoms under a deep violet twilight sky with lanterns',
    category: 'fantasy',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&auto=format&fit=crop&q=80',
    badge: 'AI Anime',
  },
];

export const PersonaliseProfileModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'theme';
}> = ({ isOpen, onClose, defaultTab = 'profile' }) => {
  const {
    role,
    teacherProfile,
    updateTeacherProfile,
    currentStudent,
    updateStudentName,
    updateStudentAvatar,
    theme,
    setTheme,
    customBgUrl,
    setCustomBgUrl,
    timeFormat,
    setTimeFormat,
    guruBesarName,
    updateGuruBesarName,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'theme'>(defaultTab);

  // Profile Form state
  const isTeacher = role === 'teacher';
  const initialName = isTeacher ? teacherProfile.name : currentStudent?.name || 'Daniel Lee';
  const [nameInput, setNameInput] = useState(initialName);
  const [schoolInput, setSchoolInput] = useState(
    isTeacher ? teacherProfile.school : 'SK Seri Bintang Bestari'
  );
  const [guruBesarInput, setGuruBesarInput] = useState(
    guruBesarName || teacherProfile.guruBesarName || 'Encik Ismail bin Mahmud'
  );
  const [selectedTimeFormat, setSelectedTimeFormat] = useState<'12h' | '24h'>(timeFormat);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    isTeacher
      ? teacherProfile.avatarUrl
      : currentStudent?.avatarUrl ||
          'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80'
  );

  // Theme custom upload URL input
  const [customUrlInput, setCustomUrlInput] = useState(customBgUrl || '');

  // AI Theme Picture Generator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiStepText, setAiStepText] = useState('');

  // File input refs
  const profileFileInputRef = useRef<HTMLInputElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // AI Theme Picture Generator Execution
  const handleGenerateAiWallpaper = (presetPrompt?: string) => {
    const promptToUse = presetPrompt || aiPrompt;
    if (!promptToUse.trim()) {
      showToast('Prompt Required', 'Please enter a description or pick an AI theme prompt.', 'info');
      return;
    }

    setIsGeneratingAi(true);
    setAiStepText('Synthesizing visual environment...');

    const promptLower = promptToUse.toLowerCase();
    let selectedImage = 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80';

    if (promptLower.includes('forest') || promptLower.includes('tree') || promptLower.includes('nature') || promptLower.includes('jungle')) {
      selectedImage = 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1920&auto=format&fit=crop&q=80';
    } else if (promptLower.includes('castle') || promptLower.includes('disney') || promptLower.includes('fairy') || promptLower.includes('magic')) {
      selectedImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80';
    } else if (promptLower.includes('sea') || promptLower.includes('ocean') || promptLower.includes('coral') || promptLower.includes('water')) {
      selectedImage = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&auto=format&fit=crop&q=80';
    } else if (promptLower.includes('volcano') || promptLower.includes('magma') || promptLower.includes('lava') || promptLower.includes('fire')) {
      selectedImage = 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=1920&auto=format&fit=crop&q=80';
    } else if (promptLower.includes('aurora') || promptLower.includes('mountain') || promptLower.includes('snow') || promptLower.includes('polar')) {
      selectedImage = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&auto=format&fit=crop&q=80';
    } else if (promptLower.includes('sakura') || promptLower.includes('tokyo') || promptLower.includes('cherry') || promptLower.includes('japan')) {
      selectedImage = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&auto=format&fit=crop&q=80';
    } else if (promptLower.includes('academy') || promptLower.includes('school') || promptLower.includes('cyber') || promptLower.includes('neon')) {
      selectedImage = 'https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=1920&auto=format&fit=crop&q=80';
    }

    setTimeout(() => {
      setAiStepText('Harmonizing atmospheric lighting & depth...');
    }, 600);

    setTimeout(() => {
      setAiStepText('Applying full-screen background wallpaper...');
    }, 1200);

    setTimeout(() => {
      setIsGeneratingAi(false);
      setCustomBgUrl(selectedImage);
      setTheme('custom');
      showToast(
        'AI Wallpaper Generated & Applied!',
        `Applied "${promptToUse}" as the whole website background!`,
        'success'
      );
    }, 1800);
  };

  // Avatar presets
  const teacherAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80',
  ];

  const studentAvatars = [
    'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  ];

  const avatarPresets = isTeacher ? teacherAvatars : studentAvatars;

  // Handle uploading user profile picture (Both teacher & student)
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please upload a valid image file (PNG, JPG, WebP).', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      showToast('Image Loaded', 'New profile picture selected. Click Save to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading custom background wallpaper (Both teacher & student)
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please upload a valid image file for your background.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCustomBgUrl(dataUrl);
      setTheme('custom');
      showToast(
        'Background Wallpaper Updated!',
        'Your custom background picture has been applied.',
        'success'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) return;

    if (isTeacher) {
      const trimmedGb = guruBesarInput.trim();
      if (trimmedGb) {
        updateGuruBesarName(trimmedGb);
      }
      updateTeacherProfile({
        name: cleanName,
        school: schoolInput.trim() || 'SK Seri Bintang Bestari',
        avatarUrl: avatarPreview,
        guruBesarName: trimmedGb || guruBesarName,
      });
    } else {
      if (currentStudent) {
        updateStudentName(currentStudent.id, cleanName);
        updateStudentAvatar(currentStudent.id, avatarPreview);
      }
    }

    setTimeFormat(selectedTimeFormat);

    showToast('Personalisation Saved', 'Profile settings updated successfully!', 'success');
    onClose();
  };

  // 6 specific background theme options
  const themeOptions: {
    id: ThemeType;
    name: string;
    description: string;
    icon: string;
    badge: string;
    iconComponent: React.ComponentType<{ className?: string }>;
    gradient: string;
  }[] = [
    {
      id: 'spaceship_stars',
      name: 'Spaceship Stars Theme',
      description: 'Cosmic star clusters, deep space voyage & spaceship cockpit HUD',
      icon: '🚀',
      badge: 'Galactic',
      iconComponent: Rocket,
      gradient: 'from-blue-900 via-indigo-950 to-slate-950',
    },
    {
      id: 'forest',
      name: 'Forest Theme',
      description: 'Enchanted deep green canopy, woodland moss & golden fireflies',
      icon: '🌲',
      badge: 'Nature',
      iconComponent: Trees,
      gradient: 'from-emerald-900 via-green-950 to-slate-950',
    },
    {
      id: 'disney_cartoon',
      name: 'Cartoon Disney Animation Theme',
      description: 'Enchanted fairy dust, storybook kingdom magic & vibrant animation glow',
      icon: '🏰',
      badge: 'Magical',
      iconComponent: Castle,
      gradient: 'from-fuchsia-900 via-purple-950 to-amber-950',
    },
    {
      id: 'undersea',
      name: 'Under Sea Life Theme',
      description: 'Aquatic depths, turquoise coral reefs & marine currents',
      icon: '🐠',
      badge: 'Oceanic',
      iconComponent: Fish,
      gradient: 'from-cyan-900 via-teal-950 to-blue-950',
    },
    {
      id: 'volcano_future',
      name: 'Volcano Futuristic Theme',
      description: 'Molten magma embers, futuristic obsidian basalt & glowing neon heat',
      icon: '🌋',
      badge: 'Futuristic',
      iconComponent: Flame,
      gradient: 'from-orange-950 via-red-950 to-slate-950',
    },
    {
      id: 'custom',
      name: 'Upload Picture For Background',
      description: 'Upload your own custom wallpaper from your computer or phone',
      icon: '🖼️',
      badge: 'Custom Photo',
      iconComponent: ImageIcon,
      gradient: 'from-slate-800 via-slate-900 to-slate-950',
    },
  ];

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-start sm:justify-center animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)] sm:max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-md font-bold">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Personalise {isTeacher ? 'Teacher Profile & Theme' : 'Student Profile & Theme'}
              </h2>
              <p className="text-xs text-slate-400">
                Customise your display name, profile photo, and background world
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'theme'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Background Themes (6 Options)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 min-h-0">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Photo Upload & Picker */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Profile Picture / Photo Upload
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Current Avatar with Upload Overlay */}
                  <div className="relative group shrink-0">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-cyan-500/50 shadow-xl"
                    />
                    <button
                      type="button"
                      onClick={() => profileFileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-[10px] font-bold text-cyan-300 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>Upload</span>
                    </button>
                  </div>

                  {/* Upload button & instructions */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <input
                      type="file"
                      ref={profileFileInputRef}
                      onChange={handleProfileImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => profileFileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Picture From Device</span>
                      </button>

                      <span className="text-[11px] text-slate-400">or pick a preset below:</span>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-2 pt-1">
                      {avatarPresets.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarPreview(url)}
                          className={`w-9 h-9 rounded-xl overflow-hidden ring-2 transition-transform hover:scale-105 ${
                            avatarPreview === url ? 'ring-cyan-400 ring-offset-2 ring-offset-slate-900' : 'ring-slate-700'
                          }`}
                        >
                          <img src={url} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Details Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {isTeacher ? "Teacher's Full Name" : "Student's Name"}
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={isTeacher ? 'Cikgu Sarah binti Ahmad' : 'Daniel Lee'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isTeacher
                      ? 'This name appears on official PBD reports, certificates, and student feedback.'
                      : 'Your name across weekly missions, portfolios, and speaking activities.'}
                  </p>
                </div>

                {isTeacher && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      School / Institution
                    </label>
                    <input
                      type="text"
                      value={schoolInput}
                      onChange={(e) => setSchoolInput(e.target.value)}
                      placeholder="SK Seri Bintang Bestari"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                )}

                {/* Guru Besar / Headmaster Name Setting */}
                {isTeacher && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-amber-200">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Nama Guru Besar / Pengetua (Pengesahan Dokumen Rasmi)</span>
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Penjana PDF & Rumusan
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Nama Guru Besar ini dipaparkan dan disahkan secara automatik pada ruangan <strong className="text-amber-300">"DISAHKAN OLEH GURU BESAR"</strong> di slip laporan PDF PBD, dokumen idMe, rumusan analitik kelas, dan modul muat turun.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={guruBesarInput}
                        onChange={(e) => setGuruBesarInput(e.target.value)}
                        placeholder="Contoh: Encik Ismail bin Mahmud"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-500/50 text-white text-xs font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = guruBesarInput.trim();
                          if (val) {
                            updateGuruBesarName(val);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Simpan Nama Guru Besar
                      </button>
                    </div>
                  </div>
                )}

                {/* Time System Setting (12-Hour vs 24-Hour System) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sistem Format Masa (Time System & Greeting)</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {selectedTimeFormat === '12h' ? '12-Jam (AM/PM)' : '24-Jam (00:00–23:59)'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Pilih format waktu untuk menentukan ucapan automatik (Good Morning / Good Afternoon / Good Evening) dan jam di papan pemuka:
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTimeFormat('12h')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTimeFormat === '12h'
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Sistem 12 Jam</span>
                        {selectedTimeFormat === '12h' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Format AM / PM (contoh: 09:30 AM / 02:45 PM)
                      </div>
                      <div className="text-[9px] text-cyan-300/80 mt-1 font-mono">
                        Pagi: AM • Petang & Malam: PM
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTimeFormat('24h')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedTimeFormat === '24h'
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>Sistem 24 Jam</span>
                        {selectedTimeFormat === '24h' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Format 24 Jam (contoh: 09:30 / 14:45)
                      </div>
                      <div className="text-[9px] text-cyan-300/80 mt-1 font-mono">
                        05:00–11:59 • 12:00–16:59 • 17:00–23:59
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          ) : (
            /* Themes Tab */
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-purple-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                      Website Background Theme
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Click any theme to immediately transform the entire website background interface!
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 shrink-0">
                  <span>Active:</span>
                  <span className="text-white">
                    {THEME_CONFIGS[theme]?.name || 'Spaceship Stars Theme'}
                  </span>
                </div>
              </div>

              {/* 1. Core Thematic Background Worlds with Real Pictures */}
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>6 Primary Background Worlds</span>
                  <span className="text-[11px] text-slate-400 font-normal">Click to apply instantly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {themeOptions.map((opt) => {
                    const isSelected = theme === opt.id;
                    const config = THEME_CONFIGS[opt.id] || THEME_CONFIGS.spaceship_stars;
                    const previewImg =
                      opt.id === 'custom' && customBgUrl
                        ? customBgUrl
                        : config.previewImage || config.bgImage;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setTheme(opt.id);
                          showToast(
                            'Background Theme Updated!',
                            `Applied ${opt.name} across the whole website!`,
                            'success'
                          );
                        }}
                        className={`group relative p-3 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? 'border-cyan-400 bg-slate-800/95 shadow-2xl ring-2 ring-cyan-400/50 scale-[1.01]'
                            : 'border-slate-800 bg-slate-950/70 hover:bg-slate-850 hover:border-slate-700 hover:scale-[1.005]'
                        }`}
                      >
                        {/* Real Photo Thumbnail Preview */}
                        <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 border border-white/10 shadow-inner">
                          <img
                            src={previewImg}
                            alt={opt.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                            <span>{opt.icon}</span>
                            <span>{opt.badge}</span>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold shadow-lg">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>ACTIVE</span>
                            </div>
                          )}
                        </div>

                        {/* Theme Info */}
                        <div>
                          <div className="font-extrabold text-xs text-white flex items-center justify-between">
                            <span className="truncate">{opt.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                            {opt.description}
                          </p>
                        </div>

                        {/* Apply Indicator */}
                        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                          <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'}>
                            {isSelected ? '✓ Whole Background Set' : 'Click to Set Background'}
                          </span>
                          <span className="text-slate-600">Full Scenery</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. ✨ Create AI Picture for Background Theme */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Wand2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-white">
                        Create AI Picture For Background Theme
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Describe your dream learning environment or pick a prompt to generate an AI wallpaper
                      </p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                    AI Wallpaper Synth
                  </span>
                </div>

                {/* AI Prompt Input */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Cyberpunk classroom with floating neon books and starry sky..."
                      disabled={isGeneratingAi}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleGenerateAiWallpaper()}
                      disabled={isGeneratingAi}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {isGeneratingAi ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Generate & Apply</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Generation Step Feedback */}
                  {isGeneratingAi && (
                    <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-300 flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin text-cyan-400 shrink-0" />
                      <span>{aiStepText}</span>
                    </div>
                  )}

                  {/* Quick AI Prompts Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">Quick Prompts:</span>
                    {[
                      '🌌 Nebula Starship Bridge',
                      '🌲 Ancient Redwood Forest',
                      '🏰 Fairytale Castle Twilight',
                      '🌊 Crystal Coral Abyss',
                      '🌋 Cyberpunk Magma City',
                      '✨ Polar Northern Lights',
                      '🌸 Tokyo Twilight Sakura',
                      '🏙️ Neon Hologram Academy',
                    ].map((promptLabel, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiPrompt(promptLabel);
                          handleGenerateAiWallpaper(promptLabel);
                        }}
                        disabled={isGeneratingAi}
                        className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-indigo-900/40 border border-slate-800 hover:border-indigo-500/40 text-[10px] font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        {promptLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant AI Wallpaper Gallery Showcase */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                    <span>Curated AI Picture Gallery</span>
                    <span className="text-[10px] text-slate-400 font-normal">Instant 1-click apply</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {AI_WALLPAPER_GALLERY.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setCustomBgUrl(item.imageUrl);
                          setTheme('custom');
                          showToast(
                            'AI Wallpaper Applied!',
                            `Set "${item.title}" as website background!`,
                            'success'
                          );
                        }}
                        className="group relative h-20 rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-400 cursor-pointer transition-all shadow-md"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                        <div className="absolute bottom-1.5 left-2 right-2">
                          <span className="block text-[10px] font-bold text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] text-cyan-300 font-semibold">{item.badge}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Upload Picture For Background (File picker & URL) */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      Upload Picture From Device or URL
                    </span>
                  </div>
                  {customBgUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomBgUrl('');
                        setTheme('spaceship_stars');
                        showToast('Wallpaper Removed', 'Reverted to Spaceship Stars theme', 'info');
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 underline"
                    >
                      Remove Custom Picture
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-400">
                  Upload any wallpaper or photo from your computer or phone to make your learning environment truly yours.
                </p>

                <input
                  type="file"
                  ref={bgFileInputRef}
                  onChange={handleBgImageUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => bgFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Picture File (PNG / JPG)</span>
                  </button>

                  <span className="text-xs text-slate-500">or enter image URL:</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-example.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setCustomBgUrl(customUrlInput.trim());
                        setTheme('custom');
                        showToast('Wallpaper Applied', 'Custom image URL set as background', 'success');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    Apply URL
                  </button>
                </div>

                {customBgUrl && (
                  <div className="mt-2 flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <img
                      src={customBgUrl}
                      alt="Custom Preview"
                      className="w-16 h-10 rounded-lg object-cover ring-1 ring-cyan-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-xs flex-1">
                      <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Custom Picture Wallpaper Active</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-sm">
                        {customBgUrl.startsWith('data:') ? 'Local file uploaded' : customBgUrl}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  Done & Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
