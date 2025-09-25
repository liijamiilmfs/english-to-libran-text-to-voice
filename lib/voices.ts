export const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

export type Voice = typeof VOICES[number];

export const DEFAULT_VOICE: Voice = "alloy";

export const VOICE_LABELS: Record<Voice, string> = {
  alloy: "Alloy - Deep, mysterious, versatile",
  echo: "Echo - Resonant, ceremonial quality", 
  fable: "Fable - Warm, storytelling tone",
  onyx: "Onyx - Darker, more dramatic",
  nova: "Nova - Bright, energetic",
  shimmer: "Shimmer - Soft, ethereal"
};

// Voice accent types
export type VoiceAccent = 'libran' | null;

// Voice profile interface for preset voices
export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  libránSuitability: number; // 1-10 rating
  characteristics: string[]; // Array of characteristic tags
}

// Preset voice profiles
export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'alloy': {
    id: 'alloy',
    name: 'Alloy',
    description: 'Deep, mysterious, versatile voice perfect for Librán ceremonial speech',
    libránSuitability: 9,
    characteristics: ['mysterious', 'versatile', 'ceremonial', 'deep']
  },
  'echo': {
    id: 'echo',
    name: 'Echo',
    description: 'Resonant voice with ceremonial quality, ideal for ancient Librán texts',
    libránSuitability: 10,
    characteristics: ['resonant', 'ceremonial', 'ancient', 'majestic']
  },
  'fable': {
    id: 'fable',
    name: 'Fable',
    description: 'Warm, storytelling tone perfect for Librán myths and legends',
    libránSuitability: 8,
    characteristics: ['warm', 'storytelling', 'mythical', 'engaging']
  },
  'onyx': {
    id: 'onyx',
    name: 'Onyx',
    description: 'Darker, more dramatic voice for serious Librán rituals and ceremonies',
    libránSuitability: 9,
    characteristics: ['dramatic', 'serious', 'ritualistic', 'commanding']
  },
  'nova': {
    id: 'nova',
    name: 'Nova',
    description: 'Bright, energetic voice for modern Librán communication',
    libránSuitability: 7,
    characteristics: ['bright', 'energetic', 'modern', 'clear']
  },
  'shimmer': {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Soft, ethereal voice perfect for mystical Librán incantations',
    libránSuitability: 8,
    characteristics: ['ethereal', 'mystical', 'soft', 'enchanting']
  }
};











