import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';

export interface ThemeConfig {
  name: string;
  icon: string;
  description: string;
  bgImage: string;
  previewImage: string;
  bgClass: string;
  ambientOverlay: string;
  accentGlow: string;
  cardClass: string;
  previewGradient: string;
  particleType: 'stars' | 'fireflies' | 'sparkles' | 'bubbles' | 'embers' | 'none';
  accentColor: string;
}

export const THEME_CONFIGS: Record<string, ThemeConfig> = {
  spaceship_stars: {
    name: 'Spaceship Stars Theme',
    icon: '🚀',
    description: 'Deep cosmic nebula, spaceship cockpit view & glittering stellar clusters',
    bgImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#050716] via-[#0b102b] to-[#150a30]',
    ambientOverlay: 'bg-gradient-to-b from-[#050716]/40 via-[#0b102b]/25 to-[#150a30]/50',
    accentGlow: 'from-blue-600/30 via-indigo-600/20 to-cyan-500/15',
    cardClass: 'bg-slate-900/80 border-cyan-500/20 backdrop-blur-md',
    previewGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    particleType: 'stars',
    accentColor: 'cyan',
  },
  forest: {
    name: 'Forest Theme',
    icon: '🌲',
    description: 'Enchanted deep emerald canopy, woodland moss & golden sunbeams with fireflies',
    bgImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#03150d] via-[#062419] to-[#0c1f15]',
    ambientOverlay: 'bg-gradient-to-b from-[#02150c]/40 via-[#042416]/25 to-[#0b1e13]/50',
    accentGlow: 'from-emerald-500/25 via-green-600/20 to-amber-500/15',
    cardClass: 'bg-slate-900/85 border-emerald-500/25 backdrop-blur-md',
    previewGradient: 'from-emerald-900 via-green-950 to-slate-950',
    particleType: 'fireflies',
    accentColor: 'emerald',
  },
  disney_cartoon: {
    name: 'Cartoon Disney Animation Theme',
    icon: '🏰',
    description: 'Fairytale castle kingdom magic, twinkling fairy dust & whimsical twilight skies',
    bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#16062b] via-[#230b42] to-[#150424]',
    ambientOverlay: 'bg-gradient-to-b from-[#190631]/40 via-[#290d4e]/25 to-[#160428]/50',
    accentGlow: 'from-fuchsia-500/30 via-pink-600/20 to-amber-400/15',
    cardClass: 'bg-slate-900/85 border-fuchsia-500/25 backdrop-blur-md',
    previewGradient: 'from-fuchsia-900 via-purple-950 to-amber-950',
    particleType: 'sparkles',
    accentColor: 'fuchsia',
  },
  undersea: {
    name: 'Under Sea Life Theme',
    icon: '🐠',
    description: 'Aquatic turquoise depths, tropical coral reefs & shimmering underwater rays',
    bgImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#021324] via-[#032338] to-[#053047]',
    ambientOverlay: 'bg-gradient-to-b from-[#011425]/40 via-[#022a45]/25 to-[#05324a]/50',
    accentGlow: 'from-cyan-500/30 via-teal-600/20 to-blue-600/20',
    cardClass: 'bg-slate-900/80 border-cyan-500/25 backdrop-blur-md',
    previewGradient: 'from-cyan-900 via-teal-950 to-blue-950',
    particleType: 'bubbles',
    accentColor: 'cyan',
  },
  volcano_future: {
    name: 'Volcano Futuristic Theme',
    icon: '🌋',
    description: 'Molten magma rivers, obsidian futuristic basalt & glowing neon thermal energy',
    bgImage: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#1d0806] via-[#2a0e08] to-[#140608]',
    ambientOverlay: 'bg-gradient-to-b from-[#210907]/40 via-[#31110a]/25 to-[#160608]/50',
    accentGlow: 'from-orange-500/30 via-red-600/25 to-amber-500/20',
    cardClass: 'bg-slate-900/85 border-orange-500/25 backdrop-blur-md',
    previewGradient: 'from-orange-950 via-red-950 to-slate-950',
    particleType: 'embers',
    accentColor: 'orange',
  },
  custom: {
    name: 'AI Generated / Custom Picture Wallpaper',
    icon: '🖼️',
    description: 'Personalised AI generated picture or photo wallpaper uploaded from your device',
    bgImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-slate-950',
    ambientOverlay: 'bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/50',
    accentGlow: 'from-blue-600/20 via-purple-600/15 to-transparent',
    cardClass: 'bg-slate-900/85 border-slate-800/90 backdrop-blur-md',
    previewGradient: 'from-slate-800 via-slate-900 to-slate-950',
    particleType: 'none',
    accentColor: 'blue',
  },
  // Legacy aliases
  galaxy: {
    name: 'Spaceship Stars Theme',
    icon: '🚀',
    description: 'Cosmic star clusters, deep space voyage & spaceship HUD glow',
    bgImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#050716] via-[#0b102b] to-[#150a30]',
    ambientOverlay: 'bg-gradient-to-b from-[#050716]/65 via-[#0b102b]/55 to-[#150a30]/80',
    accentGlow: 'from-blue-600/30 via-indigo-600/20 to-cyan-500/15',
    cardClass: 'bg-slate-900/80 border-cyan-500/20 backdrop-blur-md',
    previewGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    particleType: 'stars',
    accentColor: 'cyan',
  },
  ocean: {
    name: 'Under Sea Life Theme',
    icon: '🐠',
    description: 'Aquatic depths, turquoise coral reefs & marine currents',
    bgImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#021324] via-[#032338] to-[#053047]',
    ambientOverlay: 'bg-gradient-to-b from-[#011425]/65 via-[#022a45]/55 to-[#05324a]/80',
    accentGlow: 'from-cyan-500/30 via-teal-600/20 to-blue-600/20',
    cardClass: 'bg-slate-900/80 border-cyan-500/25 backdrop-blur-md',
    previewGradient: 'from-cyan-900 via-teal-950 to-blue-950',
    particleType: 'bubbles',
    accentColor: 'cyan',
  },
  art_school: {
    name: 'Cartoon Disney Animation Theme',
    icon: '🏰',
    description: 'Enchanted fairy dust, storybook kingdom magic & vibrant animation glow',
    bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#16062b] via-[#230b42] to-[#150424]',
    ambientOverlay: 'bg-gradient-to-b from-[#190631]/65 via-[#290d4e]/55 to-[#160428]/80',
    accentGlow: 'from-fuchsia-500/30 via-pink-600/20 to-amber-400/15',
    cardClass: 'bg-slate-900/85 border-fuchsia-500/25 backdrop-blur-md',
    previewGradient: 'from-fuchsia-900 via-purple-950 to-amber-950',
    particleType: 'sparkles',
    accentColor: 'fuchsia',
  },
  future_robot: {
    name: 'Volcano Futuristic Theme',
    icon: '🌋',
    description: 'Molten magma embers, futuristic obsidian basalt & glowing neon heat',
    bgImage: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#1d0806] via-[#2a0e08] to-[#140608]',
    ambientOverlay: 'bg-gradient-to-b from-[#210907]/65 via-[#31110a]/55 to-[#160608]/80',
    accentGlow: 'from-orange-500/30 via-red-600/25 to-amber-500/20',
    cardClass: 'bg-slate-900/85 border-orange-500/25 backdrop-blur-md',
    previewGradient: 'from-orange-950 via-red-950 to-slate-950',
    particleType: 'embers',
    accentColor: 'orange',
  },
  school: {
    name: 'Forest Theme',
    icon: '🌲',
    description: 'Enchanted deep green canopy, woodland moss & golden fireflies',
    bgImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#03150d] via-[#062419] to-[#0c1f15]',
    ambientOverlay: 'bg-gradient-to-b from-[#02150c]/65 via-[#042416]/55 to-[#0b1e13]/80',
    accentGlow: 'from-emerald-500/25 via-green-600/20 to-amber-500/15',
    cardClass: 'bg-slate-900/85 border-emerald-500/25 backdrop-blur-md',
    previewGradient: 'from-emerald-900 via-green-950 to-slate-950',
    particleType: 'fireflies',
    accentColor: 'emerald',
  },
  formal: {
    name: 'Spaceship Stars Theme',
    icon: '🚀',
    description: 'Cosmic star clusters, deep space voyage & spaceship HUD glow',
    bgImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=80',
    previewImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    bgClass: 'bg-gradient-to-br from-[#050716] via-[#0b102b] to-[#150a30]',
    ambientOverlay: 'bg-gradient-to-b from-[#050716]/65 via-[#0b102b]/55 to-[#150a30]/80',
    accentGlow: 'from-blue-600/30 via-indigo-600/20 to-cyan-500/15',
    cardClass: 'bg-slate-900/80 border-cyan-500/20 backdrop-blur-md',
    previewGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    particleType: 'stars',
    accentColor: 'cyan',
  },
};

// Animated theme-specific atmospheric particles
const ThemeParticles: React.FC<{ type: ThemeConfig['particleType'] }> = ({ type }) => {
  const particleItems = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.8 + (i % 3) * 7) % 96}%`,
      top: `${(i * 7.3 + (i % 4) * 9) % 92}%`,
      size: (i % 3) * 2 + 3,
      delay: (i * 0.4).toFixed(1),
      duration: (3 + (i % 4) * 1.5).toFixed(1),
      opacity: 0.35 + (i % 5) * 0.12,
    }));
  }, []);

  if (type === 'none') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particleItems.map((p) => {
        if (type === 'fireflies') {
          return (
            <div
              key={p.id}
              className="absolute rounded-full bg-amber-300 shadow-[0_0_8px_#f59e0b] animate-pulse"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          );
        }

        if (type === 'stars') {
          return (
            <div
              key={p.id}
              className="absolute rounded-full bg-cyan-200 shadow-[0_0_6px_#38bdf8] animate-ping"
              style={{
                left: p.left,
                top: p.top,
                width: `${Math.max(2, p.size - 2)}px`,
                height: `${Math.max(2, p.size - 2)}px`,
                opacity: p.opacity * 0.7,
                animationDelay: `${p.delay}s`,
                animationDuration: `${parseFloat(p.duration) * 1.8}s`,
              }}
            />
          );
        }

        if (type === 'sparkles') {
          return (
            <div
              key={p.id}
              className="absolute text-fuchsia-300 shadow-[0_0_8px_#e879f9] animate-pulse text-[10px]"
              style={{
                left: p.left,
                top: p.top,
                opacity: p.opacity,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            >
              ✨
            </div>
          );
        }

        if (type === 'bubbles') {
          return (
            <div
              key={p.id}
              className="absolute rounded-full border border-cyan-300/40 bg-cyan-400/10 backdrop-blur-[0.5px] animate-pulse"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size + 4}px`,
                height: `${p.size + 4}px`,
                opacity: p.opacity,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          );
        }

        if (type === 'embers') {
          return (
            <div
              key={p.id}
              className="absolute rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          );
        }

        return null;
      })}
    </div>
  );
};

export const ThemeBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, customBgUrl, fontSize } = useApp();
  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.spaceship_stars || THEME_CONFIGS.galaxy;

  const fontClass =
    fontSize === 'large'
      ? 'text-lg'
      : fontSize === 'extra-large'
      ? 'text-xl'
      : 'text-base';

  // Selected theme wallpaper image URL (with custom override fallback)
  const activeWallpaper =
    theme === 'custom' && customBgUrl
      ? customBgUrl
      : config.bgImage || THEME_CONFIGS.spaceship_stars.bgImage;

  return (
    <div
      className={`min-h-screen relative text-slate-100 transition-colors duration-700 ${fontClass} ${config.bgClass}`}
    >
      {/* 1. Full-Screen AI / Thematic Picture Background (Visible across entire website) */}
      <div
        key={activeWallpaper}
        id="theme-full-background"
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none animate-in fade-in"
        style={{
          backgroundImage: `url("${activeWallpaper}")`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
        }}
      />

      {/* 2. Theme Atmospheric Color Scrim (Harmonizes palette while keeping picture vibrant) */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-700 ${config.ambientOverlay}`}
      />

      {/* 3. Radial Accent Glow for depth */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none bg-gradient-radial ${config.accentGlow} opacity-50`}
      />

      {/* 4. Themed Floating Atmospheric Particles */}
      <ThemeParticles type={config.particleType} />

      {/* 5. Subtle Vignette for clean readability at edges */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/30 z-0" />

      {/* 6. Actual Interactive Content Layer */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

