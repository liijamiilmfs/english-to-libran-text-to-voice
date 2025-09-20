import fs from 'fs';
import path from 'path';

export interface TranslationResult {
  libran: string;
  confidence: number;
  wordCount: number;
}

export type Variant = 'ancient' | 'modern';

interface Dictionary {
  [key: string]: string;
}

export interface TranslateOptions {
  dictionary?: Dictionary;
}

// Load dictionary from file
function loadDictionary(variant: Variant): Dictionary {
  const filePath = path.join(process.cwd(), 'lib', 'translator', 'dictionaries', `${variant}.json`);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Tokenize text while preserving punctuation
function tokenize(text: string): Array<{ type: 'word' | 'punctuation' | 'whitespace', value: string, original: string }> {
  const tokens: Array<{ type: 'word' | 'punctuation' | 'whitespace', value: string, original: string }> = [];
  const words = text.split(/(\s+|[.,!?;:])/);
  
  for (const word of words) {
    if (!word) continue;
    
    if (/\s+/.test(word)) {
      tokens.push({ type: 'whitespace', value: word, original: word });
    } else if (/[.,!?;:]/.test(word)) {
      tokens.push({ type: 'punctuation', value: word, original: word });
    } else {
      tokens.push({ type: 'word', value: word.toLowerCase(), original: word });
    }
  }
  
  return tokens;
}

// Simple stem fallback for common English suffixes
function stemWord(word: string): string {
  // Remove common English suffixes
  const suffixes = [
    { pattern: /ing$/, replacement: '' },
    { pattern: /ed$/, replacement: '' },
    { pattern: /es$/, replacement: '' },
    { pattern: /s$/, replacement: '' }
  ];
  
  for (const { pattern, replacement } of suffixes) {
    if (pattern.test(word)) {
      return word.replace(pattern, replacement);
    }
  }
  
  return word;
}

// Apply sound shift rules
function applySoundShifts(word: string, variant: Variant): string {
  if (variant === 'ancient') {
    // Ancient: prefer -or/-on endings for bare roots
    if (word.length > 3 && !word.endsWith('or') && !word.endsWith('on')) {
      // Simple heuristic: if it looks like a bare root, add -or
      if (!word.includes('a') && !word.includes('e') && !word.includes('i') && !word.includes('o') && !word.includes('u')) {
        return word + 'or';
      }
    }
  } else {
    // Modern: convert trailing -or to -a
    if (word.endsWith('or')) {
      return word.slice(0, -2) + 'a';
    }
  }
  
  return word;
}

// Preserve source casing
function preserveCase(original: string, translated: string): string {
  if (original === original.toUpperCase()) {
    return translated.toUpperCase();
  } else if (original === original.toLowerCase()) {
    return translated.toLowerCase();
  } else if (original[0] === original[0].toUpperCase()) {
    return translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase();
  }
  return translated;
}

// Fix spacing around punctuation
function fixSpacing(tokens: Array<{ type: string, value: string, original: string }>): string {
  let result = '';
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];
    
    result += token.value;
    
    // Add space after words, but not before punctuation
    if (token.type === 'word' && nextToken && nextToken.type === 'word') {
      result += ' ';
    } else if (token.type === 'word' && nextToken && nextToken.type === 'punctuation') {
      // No space before punctuation
    } else if (token.type === 'punctuation' && nextToken && nextToken.type === 'word') {
      result += ' ';
    }
  }
  
  return result;
}

export function translate(text: string, variant: Variant, options: TranslateOptions = {}): TranslationResult {
  const dictionary = options.dictionary ?? loadDictionary(variant);
  const tokens = tokenize(text);
  const translatedTokens = [];
  let translatedWordCount = 0;
  let totalWordCount = 0;
  
  for (const token of tokens) {
    if (token.type === 'word') {
      totalWordCount++;
      let translated = dictionary[token.value];
      
      if (!translated) {
        // Try stemmed version
        const stemmed = stemWord(token.value);
        translated = dictionary[stemmed];
      }
      
      if (translated) {
        translated = applySoundShifts(translated, variant);
        translated = preserveCase(token.original, translated);
        translatedWordCount++;
      } else {
        // Keep original if no translation found
        translated = token.original;
      }
      
      translatedTokens.push({ ...token, value: translated });
    } else {
      translatedTokens.push(token);
    }
  }
  
  const libran = fixSpacing(translatedTokens);
  const confidence = totalWordCount > 0 ? translatedWordCount / totalWordCount : 0;
  
  return {
    libran,
    confidence,
    wordCount: totalWordCount
  };
}