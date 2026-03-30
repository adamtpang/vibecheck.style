import type { AudioFeatures } from './vibe-analysis';

interface VibeArchetype {
  label: string;
  emoji: string;
  description: string;
  score: (f: AudioFeatures) => number;
}

const archetypes: VibeArchetype[] = [
  {
    label: 'Main Character Energy',
    emoji: '✨',
    description: 'High energy, high positivity — you walk in and the soundtrack starts',
    score: (f) => f.energy * 0.5 + f.valence * 0.5,
  },
  {
    label: 'Party Animal',
    emoji: '🪩',
    description: 'Born to dance, forced to sleep',
    score: (f) => f.danceability * 0.5 + f.energy * 0.3 + (1 - f.acousticness) * 0.2,
  },
  {
    label: 'Sad Boy Hours',
    emoji: '🌧️',
    description: 'Low valence, high acoustics — you feel everything deeply',
    score: (f) => (1 - f.valence) * 0.5 + f.acousticness * 0.3 + (1 - f.energy) * 0.2,
  },
  {
    label: 'Night Owl',
    emoji: '🦉',
    description: 'Dark, moody, atmospheric — your playlist hits different at 2am',
    score: (f) => (1 - f.valence) * 0.3 + f.energy * 0.3 + (1 - f.acousticness) * 0.2 + f.instrumentalness * 0.2,
  },
  {
    label: 'Indie Dreamer',
    emoji: '🌿',
    description: 'Chill, organic, thoughtful — you found them before they were cool',
    score: (f) => f.acousticness * 0.4 + (1 - f.energy) * 0.2 + f.valence * 0.2 + f.instrumentalness * 0.2,
  },
  {
    label: 'Club Kid',
    emoji: '💿',
    description: 'High BPM, low acoustics — the bass is your heartbeat',
    score: (f) => f.danceability * 0.4 + (1 - f.acousticness) * 0.3 + f.energy * 0.3,
  },
  {
    label: 'Campfire Soul',
    emoji: '🔥',
    description: 'Warm, acoustic, feel-good — you bring the guitar to every hangout',
    score: (f) => f.acousticness * 0.4 + f.valence * 0.4 + (1 - f.energy) * 0.2,
  },
  {
    label: 'Rage Machine',
    emoji: '⚡',
    description: 'High energy, low positivity — you listen to music like it owes you money',
    score: (f) => f.energy * 0.5 + (1 - f.valence) * 0.4 + f.loudness > -8 ? 0.1 : 0,
  },
  {
    label: 'Headphone Hermit',
    emoji: '🎧',
    description: 'Instrumental, introspective — your playlist is a private world',
    score: (f) => f.instrumentalness * 0.5 + (1 - f.speechiness) * 0.3 + (1 - f.liveness) * 0.2,
  },
  {
    label: 'Sunshine Pop',
    emoji: '☀️',
    description: 'Bright, bouncy, infectious — you make playlists for road trips',
    score: (f) => f.valence * 0.4 + f.danceability * 0.3 + f.energy * 0.3,
  },
  {
    label: 'Lo-Fi Philosopher',
    emoji: '📚',
    description: 'Chill beats, low energy — studying or zoning out, no in between',
    score: (f) => (1 - f.energy) * 0.3 + f.instrumentalness * 0.3 + (1 - f.speechiness) * 0.2 + (1 - f.liveness) * 0.2,
  },
  {
    label: 'Velvet Underground',
    emoji: '🖤',
    description: 'Smooth, dark, sophisticated — you curate, you don\'t just listen',
    score: (f) => (1 - f.energy) * 0.3 + (1 - f.valence) * 0.3 + (1 - f.danceability) * 0.2 + f.acousticness * 0.2,
  },
  {
    label: 'Rhythm & Grooves',
    emoji: '🎶',
    description: 'Danceable, soulful, smooth — you hear the groove in everything',
    score: (f) => f.danceability * 0.5 + f.valence * 0.3 + (1 - f.instrumentalness) * 0.2,
  },
  {
    label: 'Podcast Brain',
    emoji: '🎙️',
    description: 'High speechiness — are you even listening to music?',
    score: (f) => f.speechiness * 0.7 + (1 - f.instrumentalness) * 0.3,
  },
  {
    label: 'Genre Fluid',
    emoji: '🌈',
    description: 'Perfectly balanced — you listen to literally everything',
    score: (f) => {
      // Score higher when all features are near 0.5 (balanced)
      const features = [f.energy, f.valence, f.danceability, f.acousticness];
      const avgDeviation = features.reduce((sum, v) => sum + Math.abs(v - 0.5), 0) / features.length;
      return 1 - avgDeviation; // Higher score when closer to balanced
    },
  },
  {
    label: 'Festival Headliner',
    emoji: '🎪',
    description: 'Loud, live, euphoric — you need 50,000 people to feel complete',
    score: (f) => f.energy * 0.3 + f.liveness * 0.4 + f.valence * 0.3,
  },
];

export interface VibeLabel {
  label: string;
  emoji: string;
  description: string;
  confidence: number;
}

export function getVibeLabel(features: AudioFeatures): VibeLabel {
  let bestMatch: VibeArchetype = archetypes[0];
  let bestScore = -1;

  for (const archetype of archetypes) {
    const score = archetype.score(features);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = archetype;
    }
  }

  return {
    label: bestMatch.label,
    emoji: bestMatch.emoji,
    description: bestMatch.description,
    confidence: Math.round(bestScore * 100),
  };
}

export function getTopVibeLabels(features: AudioFeatures, count = 3): VibeLabel[] {
  return archetypes
    .map((archetype) => ({
      label: archetype.label,
      emoji: archetype.emoji,
      description: archetype.description,
      confidence: Math.round(archetype.score(features) * 100),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, count);
}
