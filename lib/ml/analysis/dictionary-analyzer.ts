/**
 * Dictionary Analysis Module for Librán Language Model
 * Analyzes dictionary data for inconsistencies, patterns, and improvement opportunities
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { 
  DictionaryAnalysis, 
  Inconsistency, 
  ImprovementSuggestion, 
  LinguisticPattern 
} from '../types';

export class LibránDictionaryAnalyzer {
  private ancientDict: any = null;
  private modernDict: any = null;
  private analysis: DictionaryAnalysis | null = null;

  constructor() {
    this.loadDictionaries();
  }

  private loadDictionaries(): void {
    try {
      const ancientPath = join(process.cwd(), 'lib', 'translator', 'dictionaries', 'ancient.json');
      const modernPath = join(process.cwd(), 'lib', 'translator', 'dictionaries', 'modern.json');
      
      this.ancientDict = JSON.parse(readFileSync(ancientPath, 'utf-8'));
      this.modernDict = JSON.parse(readFileSync(modernPath, 'utf-8'));
    } catch (error) {
      console.error('Failed to load dictionaries:', error);
      throw new Error('Could not load Librán dictionaries for analysis');
    }
  }

  /**
   * Perform comprehensive dictionary analysis
   */
  async analyzeDictionaries(): Promise<DictionaryAnalysis> {
    console.log('🔍 Starting dictionary analysis...');

    const inconsistencies = this.findInconsistencies();
    const suggestions = this.generateImprovementSuggestions();
    const patterns = this.extractLinguisticPatterns();
    const qualityScore = this.calculateQualityScore(inconsistencies, suggestions);

    this.analysis = {
      total_entries: this.getTotalEntries(),
      inconsistencies,
      suggestions,
      linguistic_patterns: patterns,
      quality_score: qualityScore,
      analysis_timestamp: new Date()
    };

    console.log(`✅ Analysis complete: ${inconsistencies.length} inconsistencies, ${suggestions.length} suggestions`);
    return this.analysis;
  }

  /**
   * Find inconsistencies in dictionary data
   */
  private findInconsistencies(): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];

    // Check for spelling inconsistencies
    inconsistencies.push(...this.findSpellingInconsistencies());
    
    // Check for pronunciation inconsistencies
    inconsistencies.push(...this.findPronunciationInconsistencies());
    
    // Check for morphological inconsistencies
    inconsistencies.push(...this.findMorphologicalInconsistencies());
    
    // Check for semantic inconsistencies
    inconsistencies.push(...this.findSemanticInconsistencies());

    return inconsistencies;
  }

  private findSpellingInconsistencies(): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    const allEntries = this.getAllDictionaryEntries();

    // Check for duplicate English words with different Librán translations
    const englishToLibran = new Map<string, string[]>();
    
    allEntries.forEach(entry => {
      const key = entry.english.toLowerCase();
      if (!englishToLibran.has(key)) {
        englishToLibran.set(key, []);
      }
      englishToLibran.get(key)!.push(entry.libran);
    });

    englishToLibran.forEach((translations, english) => {
      const uniqueTranslations = [...new Set(translations)];
      if (uniqueTranslations.length > 1) {
        inconsistencies.push({
          type: 'spelling',
          word: english,
          issue: `Multiple Librán translations found: ${uniqueTranslations.join(', ')}`,
          severity: 'high',
          suggested_fix: `Standardize to: ${uniqueTranslations[0]}`
        });
      }
    });

    // Check for inconsistent capitalization
    allEntries.forEach(entry => {
      if (entry.english !== entry.english.toLowerCase() && entry.english !== entry.english.toUpperCase()) {
        const lowerEntry = allEntries.find(e => e.english.toLowerCase() === entry.english.toLowerCase() && e !== entry);
        if (lowerEntry) {
          inconsistencies.push({
            type: 'spelling',
            word: entry.english,
            issue: 'Inconsistent capitalization',
            severity: 'medium',
            suggested_fix: `Use consistent case: ${entry.english.toLowerCase()}`
          });
        }
      }
    });

    return inconsistencies;
  }

  private findPronunciationInconsistencies(): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    const allEntries = this.getAllDictionaryEntries();

    // Check for similar English words with very different Librán pronunciations
    const similarWords = this.findSimilarWords(allEntries);
    
    similarWords.forEach(({ word1, word2, similarity }) => {
      if (similarity > 0.8) {
        const entry1 = allEntries.find(e => e.english === word1);
        const entry2 = allEntries.find(e => e.english === word2);
        
        if (entry1 && entry2) {
          const libranSimilarity = this.calculateStringSimilarity(entry1.libran, entry2.libran);
          if (libranSimilarity < 0.3) {
            inconsistencies.push({
              type: 'pronunciation',
              word: `${word1} vs ${word2}`,
              issue: `Similar English words have very different Librán translations`,
              severity: 'medium',
              suggested_fix: `Consider making Librán translations more similar: ${entry1.libran} → ${entry2.libran}`
            });
          }
        }
      }
    });

    return inconsistencies;
  }

  private findMorphologicalInconsistencies(): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    const allEntries = this.getAllDictionaryEntries();

    // Check for inconsistent pluralization patterns
    const pluralPatterns = this.analyzePluralizationPatterns(allEntries);
    
    Object.entries(pluralPatterns).forEach(([pattern, examples]) => {
      if (examples.length > 1) {
        const mostCommon = this.findMostCommonPattern(examples);
        examples.forEach(example => {
          if (example !== mostCommon) {
            inconsistencies.push({
              type: 'morphology',
              word: example,
              issue: `Inconsistent pluralization pattern`,
              severity: 'low',
              suggested_fix: `Use pattern: ${mostCommon}`
            });
          }
        });
      }
    });

    return inconsistencies;
  }

  private findSemanticInconsistencies(): Inconsistency[] {
    const inconsistencies: Inconsistency[] = [];
    const allEntries = this.getAllDictionaryEntries();

    // Check for circular translations
    const circularTranslations = this.findCircularTranslations(allEntries);
    
    circularTranslations.forEach(circle => {
      inconsistencies.push({
        type: 'semantic',
        word: circle.join(' → '),
        issue: 'Circular translation detected',
        severity: 'high',
        suggested_fix: 'Break circular dependency by providing unique translations'
      });
    });

    return inconsistencies;
  }

  /**
   * Generate improvement suggestions based on analysis
   */
  private generateImprovementSuggestions(): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // Generate suggestions based on patterns
    suggestions.push(...this.generatePatternBasedSuggestions());
    
    // Generate suggestions based on gaps
    suggestions.push(...this.generateGapBasedSuggestions());
    
    // Generate suggestions based on frequency analysis
    suggestions.push(...this.generateFrequencyBasedSuggestions());

    return suggestions;
  }

  private generatePatternBasedSuggestions(): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];
    const patterns = this.extractLinguisticPatterns();

    patterns.forEach(pattern => {
      if (pattern.confidence > 0.8) {
        suggestions.push({
          word: `Pattern: ${pattern.pattern}`,
          current_translation: 'N/A',
          suggested_translation: `Apply pattern consistently`,
          confidence: pattern.confidence,
          reasoning: `Strong pattern detected with ${pattern.frequency} occurrences`,
          linguistic_rules: [pattern.pattern]
        });
      }
    });

    return suggestions;
  }

  private generateGapBasedSuggestions(): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];
    const allEntries = this.getAllDictionaryEntries();

    // Find common English words missing from dictionary
    const commonWords = this.getCommonEnglishWords();
    const dictionaryWords = new Set(allEntries.map(e => e.english.toLowerCase()));
    
    commonWords.forEach(word => {
      if (!dictionaryWords.has(word)) {
        const suggestedTranslation = this.generateSuggestedTranslation(word);
        suggestions.push({
          word,
          current_translation: 'Missing',
          suggested_translation: suggestedTranslation,
          confidence: 0.6,
          reasoning: 'Common English word missing from dictionary',
          linguistic_rules: ['Frequency-based addition']
        });
      }
    });

    return suggestions;
  }

  private generateFrequencyBasedSuggestions(): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];
    const allEntries = this.getAllDictionaryEntries();

    // Find words with low confidence translations
    allEntries.forEach(entry => {
      const confidence = this.calculateTranslationConfidence(entry.english, entry.libran);
      if (confidence < 0.5) {
        const suggestedTranslation = this.generateSuggestedTranslation(entry.english);
        suggestions.push({
          word: entry.english,
          current_translation: entry.libran,
          suggested_translation: suggestedTranslation,
          confidence: confidence,
          reasoning: 'Low confidence translation detected',
          linguistic_rules: ['Confidence-based improvement']
        });
      }
    });

    return suggestions;
  }

  /**
   * Extract linguistic patterns from dictionary data
   */
  private extractLinguisticPatterns(): LinguisticPattern[] {
    const patterns: LinguisticPattern[] = [];
    const allEntries = this.getAllDictionaryEntries();

    // Extract phonetic patterns
    patterns.push(...this.extractPhoneticPatterns(allEntries));
    
    // Extract morphological patterns
    patterns.push(...this.extractMorphologicalPatterns(allEntries));
    
    // Extract syntactic patterns
    patterns.push(...this.extractSyntacticPatterns(allEntries));

    return patterns;
  }

  private extractPhoneticPatterns(entries: any[]): LinguisticPattern[] {
    const patterns: LinguisticPattern[] = [];
    const soundShifts = new Map<string, number>();

    entries.forEach(entry => {
      const english = entry.english.toLowerCase();
      const libran = entry.libran.toLowerCase();
      
      // Look for common sound shifts
      for (let i = 0; i < Math.min(english.length, libran.length); i++) {
        const engChar = english[i];
        const libChar = libran[i];
        
        if (engChar !== libChar) {
          const shift = `${engChar}→${libChar}`;
          soundShifts.set(shift, (soundShifts.get(shift) || 0) + 1);
        }
      }
    });

    soundShifts.forEach((frequency, shift) => {
      if (frequency > 5) {
        patterns.push({
          pattern_type: 'phonetic',
          pattern: shift,
          frequency,
          examples: entries
            .filter(e => e.english.toLowerCase().includes(shift.split('→')[0]))
            .slice(0, 5)
            .map(e => `${e.english}→${e.libran}`),
          confidence: Math.min(frequency / 20, 1.0)
        });
      }
    });

    return patterns;
  }

  private extractMorphologicalPatterns(entries: any[]): LinguisticPattern[] {
    const patterns: LinguisticPattern[] = [];
    const suffixes = new Map<string, number>();
    const prefixes = new Map<string, number>();

    entries.forEach(entry => {
      const libran = entry.libran;
      
      // Extract suffixes
      for (let i = 1; i < libran.length; i++) {
        const suffix = libran.slice(-i);
        suffixes.set(suffix, (suffixes.get(suffix) || 0) + 1);
      }
      
      // Extract prefixes
      for (let i = 1; i < libran.length; i++) {
        const prefix = libran.slice(0, i);
        prefixes.set(prefix, (prefixes.get(prefix) || 0) + 1);
      }
    });

    // Add frequent suffixes
    suffixes.forEach((frequency, suffix) => {
      if (frequency > 3 && suffix.length > 1) {
        patterns.push({
          pattern_type: 'morphological',
          pattern: `-${suffix}`,
          frequency,
          examples: entries
            .filter(e => e.libran.endsWith(suffix))
            .slice(0, 5)
            .map(e => e.libran),
          confidence: Math.min(frequency / 10, 1.0)
        });
      }
    });

    // Add frequent prefixes
    prefixes.forEach((frequency, prefix) => {
      if (frequency > 3 && prefix.length > 1) {
        patterns.push({
          pattern_type: 'morphological',
          pattern: `${prefix}-`,
          frequency,
          examples: entries
            .filter(e => e.libran.startsWith(prefix))
            .slice(0, 5)
            .map(e => e.libran),
          confidence: Math.min(frequency / 10, 1.0)
        });
      }
    });

    return patterns;
  }

  private extractSyntacticPatterns(entries: any[]): LinguisticPattern[] {
    const patterns: LinguisticPattern[] = [];
    
    // This would analyze sentence structure patterns
    // For now, return basic patterns
    patterns.push({
      pattern_type: 'syntactic',
      pattern: 'Word order preservation',
      frequency: entries.length,
      examples: entries.slice(0, 5).map(e => `${e.english} → ${e.libran}`),
      confidence: 0.8
    });

    return patterns;
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(inconsistencies: Inconsistency[], suggestions: ImprovementSuggestion[]): number {
    let score = 1.0;
    
    // Penalize inconsistencies
    inconsistencies.forEach(inc => {
      const penalty = inc.severity === 'high' ? 0.1 : inc.severity === 'medium' ? 0.05 : 0.02;
      score -= penalty;
    });
    
    // Penalize too many suggestions (indicates poor quality)
    if (suggestions.length > 50) {
      score -= 0.1;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  // Helper methods
  private getTotalEntries(): number {
    const ancientCount = this.ancientDict ? Object.keys(this.ancientDict).length : 0;
    const modernCount = this.modernDict ? Object.keys(this.modernDict).length : 0;
    return ancientCount + modernCount;
  }

  private getAllDictionaryEntries(): Array<{english: string, libran: string, variant: 'ancient' | 'modern'}> {
    const entries: Array<{english: string, libran: string, variant: 'ancient' | 'modern'}> = [];
    
    if (this.ancientDict) {
      Object.entries(this.ancientDict).forEach(([english, libran]) => {
        if (typeof libran === 'string') {
          entries.push({ english, libran, variant: 'ancient' });
        }
      });
    }
    
    if (this.modernDict) {
      Object.entries(this.modernDict).forEach(([english, libran]) => {
        if (typeof libran === 'string') {
          entries.push({ english, libran, variant: 'modern' });
        }
      });
    }
    
    return entries;
  }

  private findSimilarWords(entries: any[]): Array<{word1: string, word2: string, similarity: number}> {
    const similar: Array<{word1: string, word2: string, similarity: number}> = [];
    
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const similarity = this.calculateStringSimilarity(entries[i].english, entries[j].english);
        if (similarity > 0.7) {
          similar.push({
            word1: entries[i].english,
            word2: entries[j].english,
            similarity
          });
        }
      }
    }
    
    return similar;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private analyzePluralizationPatterns(entries: any[]): Record<string, string[]> {
    const patterns: Record<string, string[]> = {};
    
    entries.forEach(entry => {
      const libran = entry.libran;
      if (libran.endsWith('s') && !libran.endsWith('ss')) {
        const base = libran.slice(0, -1);
        if (!patterns[base]) patterns[base] = [];
        patterns[base].push(libran);
      }
    });
    
    return patterns;
  }

  private findMostCommonPattern(examples: string[]): string {
    const counts = new Map<string, number>();
    examples.forEach(example => {
      counts.set(example, (counts.get(example) || 0) + 1);
    });
    
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  private findCircularTranslations(entries: any[]): string[][] {
    const circular: string[][] = [];
    const translationMap = new Map<string, string>();
    
    entries.forEach(entry => {
      translationMap.set(entry.english.toLowerCase(), entry.libran.toLowerCase());
    });
    
    // Check for circular translations
    entries.forEach(entry => {
      const english = entry.english.toLowerCase();
      const libran = entry.libran.toLowerCase();
      
      if (translationMap.has(libran)) {
        const backTranslation = translationMap.get(libran)!;
        if (backTranslation === english) {
          circular.push([english, libran, backTranslation]);
        }
      }
    });
    
    return circular;
  }

  private getCommonEnglishWords(): string[] {
    // Return a list of common English words
    return [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at'
    ];
  }

  private generateSuggestedTranslation(english: string): string {
    // Simple translation generation based on patterns
    // This would be more sophisticated in practice
    const patterns = this.extractLinguisticPatterns();
    const phoneticPatterns = patterns.filter(p => p.pattern_type === 'phonetic');
    
    if (phoneticPatterns.length > 0) {
      const pattern = phoneticPatterns[0].pattern;
      const [from, to] = pattern.split('→');
      return english.toLowerCase().replace(new RegExp(from, 'g'), to);
    }
    
    return english.toLowerCase() + 'an'; // Default pattern
  }

  private calculateTranslationConfidence(english: string, libran: string): number {
    // Simple confidence calculation based on length similarity and pattern matching
    const lengthRatio = Math.min(english.length, libran.length) / Math.max(english.length, libran.length);
    const patternMatch = this.checkPatternMatch(english, libran);
    
    return (lengthRatio + patternMatch) / 2;
  }

  private checkPatternMatch(english: string, libran: string): number {
    // Check if translation follows known patterns
    const patterns = this.extractLinguisticPatterns();
    let matchScore = 0;
    
    patterns.forEach(pattern => {
      if (pattern.pattern_type === 'phonetic') {
        const [from, to] = pattern.pattern.split('→');
        if (english.includes(from) && libran.includes(to)) {
          matchScore += 0.3;
        }
      }
    });
    
    return Math.min(matchScore, 1.0);
  }

  /**
   * Get the current analysis results
   */
  getAnalysis(): DictionaryAnalysis | null {
    return this.analysis;
  }

  /**
   * Export analysis results to file
   */
  async exportAnalysis(outputPath: string): Promise<void> {
    if (!this.analysis) {
      throw new Error('No analysis available. Run analyzeDictionaries() first.');
    }

    const fs = require('fs');
    fs.writeFileSync(outputPath, JSON.stringify(this.analysis, null, 2));
  }
}
