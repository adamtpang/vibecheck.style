import type { AudioFeatures } from './vibe-analysis';

interface VibeGradient {
  from: string;
  via: string;
  to: string;
  css: string;
  name: string;
}

/**
 * Generates a color gradient based on audio features.
 *
 * Energy → warmth (cool blues → hot reds/oranges)
 * Valence → saturation (muted/dark → bright/vivid)
 * Danceability → secondary hue shift
 * Acousticness → earthiness
 */
export function getVibeGradient(features: AudioFeatures): VibeGradient {
  const { energy, valence, danceability, acousticness } = features;

  // Map energy to hue: low energy = cool (220-260), high energy = warm (0-40, 340-360)
  const energyHue = energy > 0.5
    ? lerp(40, 0, (energy - 0.5) * 2) // warm: orange → red
    : lerp(260, 40, energy * 2); // cool: blue → orange

  // Valence affects saturation and lightness
  const saturation = lerp(40, 90, valence);
  const lightness = lerp(25, 55, valence);

  // Danceability shifts the secondary color
  const danceHue = (energyHue + lerp(30, 90, danceability)) % 360;

  // Acousticness pulls toward earthy/green tones
  const accentHue = acousticness > 0.5
    ? lerp(danceHue, 140, (acousticness - 0.5) * 2) // pull toward green
    : lerp(danceHue, 280, (0.5 - acousticness) * 2); // pull toward purple

  const from = `hsl(${Math.round(energyHue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  const via = `hsl(${Math.round(danceHue)}, ${Math.round(saturation * 0.9)}%, ${Math.round(lightness * 1.1)}%)`;
  const to = `hsl(${Math.round(accentHue)}, ${Math.round(saturation * 0.8)}%, ${Math.round(lightness * 0.9)}%)`;

  const css = `linear-gradient(135deg, ${from}, ${via}, ${to})`;

  return { from, via, to, css, name: getGradientName(energy, valence, acousticness) };
}

/**
 * Gets a text color (white or black) that contrasts well with the gradient.
 */
export function getContrastTextColor(features: AudioFeatures): string {
  const lightness = lerp(25, 55, features.valence);
  return lightness < 45 ? '#ffffff' : '#000000';
}

/**
 * Gets a subtle text color for secondary content.
 */
export function getSubtleTextColor(features: AudioFeatures): string {
  const lightness = lerp(25, 55, features.valence);
  return lightness < 45 ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
}

function getGradientName(energy: number, valence: number, acousticness: number): string {
  if (energy > 0.7 && valence > 0.7) return 'Golden Hour';
  if (energy > 0.7 && valence < 0.3) return 'Midnight Fire';
  if (energy < 0.3 && valence > 0.7) return 'Morning Dew';
  if (energy < 0.3 && valence < 0.3) return 'Deep Ocean';
  if (acousticness > 0.7) return 'Forest Floor';
  if (energy > 0.5 && valence > 0.5) return 'Sunset Drive';
  if (energy < 0.5 && valence < 0.5) return 'Twilight';
  return 'Nebula';
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}
