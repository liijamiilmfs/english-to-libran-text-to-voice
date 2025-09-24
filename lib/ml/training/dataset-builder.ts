/**
 * Dataset builder for Librán language model training
 * Extracts and processes training data from existing dictionary entries
 */

import { TrainingDataset, CorpusStats } from '../types';
import { readFileSync } from 'fs';
import { join } from 'path';

export class LibránCorpusBuilder {
  private ancientDict: any = null;
  private modernDict: any = null;

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
      throw new Error('Could not load Librán dictionaries for training data');
    }
  }

  /**
   * Build comprehensive training corpus from existing dictionary data
   */
  async buildTrainingCorpus(): Promise<TrainingDataset[]> {
    const datasets: TrainingDataset[] = [];

    // Extract dictionary entries
    datasets.push(...this.extractDictionaryEntries());
    
    // Generate synthetic text using current translation system
    datasets.push(...await this.generateSyntheticText());
    
    // Create parallel English-Librán sentence pairs
    datasets.push(...await this.createParallelPairs());
    
    // Augment with linguistic patterns
    datasets.push(...await this.augmentWithPatterns());

    return this.filterAndScore(datasets);
  }

  /**
   * Extract all dictionary entries as training data
   */
  private extractDictionaryEntries(): TrainingDataset[] {
    const datasets: TrainingDataset[] = [];

    // Process Ancient dictionary
    if (this.ancientDict) {
      Object.entries(this.ancientDict).forEach(([english, libran]) => {
        if (typeof libran === 'string' && english && libran) {
          datasets.push({
            text: `${english} → ${libran}`,
            variant: 'ancient',
            source: 'dictionary',
            quality_score: 1.0,
            metadata: {
              word_count: this.countWords(english + ' ' + libran),
              complexity_score: this.calculateComplexity(english, libran),
              linguistic_category: this.categorizeWord(english),
              translation_confidence: 1.0
            }
          });
        }
      });
    }

    // Process Modern dictionary
    if (this.modernDict) {
      Object.entries(this.modernDict).forEach(([english, libran]) => {
        if (typeof libran === 'string' && english && libran) {
          datasets.push({
            text: `${english} → ${libran}`,
            variant: 'modern',
            source: 'dictionary',
            quality_score: 1.0,
            metadata: {
              word_count: this.countWords(english + ' ' + libran),
              complexity_score: this.calculateComplexity(english, libran),
              linguistic_category: this.categorizeWord(english),
              translation_confidence: 1.0
            }
          });
        }
      });
    }

    return datasets;
  }

  /**
   * Generate synthetic text using current translation patterns
   */
  private async generateSyntheticText(): Promise<TrainingDataset[]> {
    const datasets: TrainingDataset[] = [];
    
    // Common sentence patterns for Librán
    const patterns = [
      'The {noun} is {adjective}.',
      'I {verb} the {noun}.',
      'This is a {adjective} {noun}.',
      'We {verb} in the {noun}.',
      'The {noun} {verb} {adverb}.',
      'My {noun} is {adjective}.',
      'They {verb} {adverb}.',
      'The {adjective} {noun} {verb}.',
    ];

    const vocabulary = this.getAllVocabulary();
    
    // Generate synthetic sentences for each pattern
    for (const pattern of patterns) {
      for (let i = 0; i < 50; i++) {
        const sentence = this.generateSentenceFromPattern(pattern, vocabulary);
        if (sentence) {
          datasets.push({
            text: sentence,
            variant: Math.random() > 0.5 ? 'ancient' : 'modern',
            source: 'generated',
            quality_score: 0.8,
            metadata: {
              word_count: this.countWords(sentence),
              complexity_score: 0.6,
              linguistic_category: 'synthetic',
              translation_confidence: 0.7
            }
          });
        }
      }
    }

    return datasets;
  }

  /**
   * Create parallel English-Librán sentence pairs
   */
  private async createParallelPairs(): Promise<TrainingDataset[]> {
    const datasets: TrainingDataset[] = [];
    
    // Simple parallel pairs based on dictionary entries
    const allEntries = this.getAllDictionaryEntries();
    
    for (const entry of allEntries) {
      // Create simple sentences
      const simpleSentences = [
        `The ${entry.english} is here.`,
        `I see the ${entry.english}.`,
        `This is ${entry.english}.`,
        `We have ${entry.english}.`,
      ];

      for (const sentence of simpleSentences) {
        datasets.push({
          text: `${sentence} → [${entry.variant}] ${entry.libran}`,
          variant: entry.variant,
          source: 'generated',
          quality_score: 0.9,
          metadata: {
            word_count: this.countWords(sentence),
            complexity_score: 0.5,
            linguistic_category: 'parallel',
            translation_confidence: 0.8
          }
        });
      }
    }

    return datasets;
  }

  /**
   * Augment data with linguistic patterns
   */
  private async augmentWithPatterns(): Promise<TrainingDataset[]> {
    const datasets: TrainingDataset[] = [];
    
    // Extract common prefixes, suffixes, and patterns
    const patterns = this.extractLinguisticPatterns();
    
    for (const pattern of patterns) {
      datasets.push({
        text: `Pattern: ${pattern.pattern} (${pattern.examples.join(', ')})`,
        variant: pattern.variant,
        source: 'generated',
        quality_score: 0.7,
        metadata: {
          word_count: pattern.examples.length,
          complexity_score: 0.8,
          linguistic_category: 'pattern',
          translation_confidence: 0.6
        }
      });
    }

    return datasets;
  }

  /**
   * Filter and score datasets based on quality criteria
   */
  private filterAndScore(datasets: TrainingDataset[]): TrainingDataset[] {
    return datasets
      .filter(dataset => dataset.quality_score >= 0.5)
      .filter(dataset => dataset.text.length >= 3)
      .sort((a, b) => b.quality_score - a.quality_score);
  }

  /**
   * Get corpus statistics
   */
  getCorpusStats(datasets: TrainingDataset[]): CorpusStats {
    const totalWords = datasets.reduce((sum, d) => sum + (d.metadata?.word_count || 0), 0);
    const uniqueWords = new Set(datasets.map(d => d.text.split(' ')).flat()).size;
    const avgWordLength = datasets.reduce((sum, d) => sum + d.text.length, 0) / datasets.length;

    const variantDistribution = datasets.reduce((acc, d) => {
      acc[d.variant]++;
      return acc;
    }, { ancient: 0, modern: 0 });

    const sourceDistribution = datasets.reduce((acc, d) => {
      acc[d.source]++;
      return acc;
    }, { dictionary: 0, literature: 0, generated: 0 });

    const qualityDistribution = datasets.reduce((acc, d) => {
      if (d.quality_score >= 0.8) acc.high++;
      else if (d.quality_score >= 0.6) acc.medium++;
      else acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    return {
      total_words: totalWords,
      unique_words: uniqueWords,
      avg_word_length: avgWordLength,
      variant_distribution: variantDistribution,
      source_distribution: sourceDistribution,
      quality_distribution: qualityDistribution
    };
  }

  // Helper methods
  private countWords(text: string): number {
    return text.split(/\s+/).length;
  }

  private calculateComplexity(english: string, libran: string): number {
    // Simple complexity score based on length and character variety
    const engComplexity = english.length * (new Set(english.toLowerCase()).size / 26);
    const libComplexity = libran.length * (new Set(libran.toLowerCase()).size / 26);
    return Math.min((engComplexity + libComplexity) / 2, 1.0);
  }

  private categorizeWord(word: string): string {
    // Simple categorization based on common patterns
    if (word.endsWith('ing') || word.endsWith('ed')) return 'verb';
    if (word.endsWith('ly')) return 'adverb';
    if (word.endsWith('er') || word.endsWith('est')) return 'adjective';
    if (word.endsWith('s') && !word.endsWith('ss')) return 'plural';
    return 'noun';
  }

  private getAllVocabulary(): any {
    return { ...this.ancientDict, ...this.modernDict };
  }

  private generateSentenceFromPattern(pattern: string, vocabulary: any): string | null {
    // Simple sentence generation - this would be more sophisticated in practice
    try {
      const words = Object.keys(vocabulary);
      const nouns = words.filter(w => this.categorizeWord(w) === 'noun').slice(0, 10);
      const verbs = words.filter(w => this.categorizeWord(w) === 'verb').slice(0, 10);
      const adjectives = words.filter(w => this.categorizeWord(w) === 'adjective').slice(0, 10);
      const adverbs = words.filter(w => this.categorizeWord(w) === 'adverb').slice(0, 10);

      let sentence = pattern;
      sentence = sentence.replace('{noun}', nouns[Math.floor(Math.random() * nouns.length)] || 'thing');
      sentence = sentence.replace('{verb}', verbs[Math.floor(Math.random() * verbs.length)] || 'do');
      sentence = sentence.replace('{adjective}', adjectives[Math.floor(Math.random() * adjectives.length)] || 'good');
      sentence = sentence.replace('{adverb}', adverbs[Math.floor(Math.random() * adverbs.length)] || 'well');

      return sentence;
    } catch (error) {
      return null;
    }
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

  private extractLinguisticPatterns(): Array<{pattern: string, examples: string[], variant: 'ancient' | 'modern'}> {
    // This would analyze the dictionary for common patterns
    // For now, return some basic patterns
    return [
      {
        pattern: 'Common suffixes',
        examples: ['-ing', '-ed', '-ly'],
        variant: 'ancient'
      },
      {
        pattern: 'Common prefixes', 
        examples: ['un-', 're-', 'pre-'],
        variant: 'modern'
      }
    ];
  }
}
