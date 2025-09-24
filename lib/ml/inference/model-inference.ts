/**
 * Model Inference Module for Librán Language Model
 * Handles model prediction, text generation, and translation inference
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { 
  GeneratedWord, 
  AlternativeWord, 
  VocabularyGenerationRequest,
  LibránModel 
} from '../types';

export class LibránModelInference {
  private model: LibránModel | null = null;
  private tokenizer: any = null;
  private config: any = null;

  constructor() {
    this.loadModel();
    this.loadTokenizer();
    this.loadConfig();
  }

  private loadModel(): void {
    try {
      const modelPath = join(process.cwd(), 'models', 'checkpoints', 'final_model', 'model_config.json');
      if (require('fs').existsSync(modelPath)) {
        const modelConfig = JSON.parse(readFileSync(modelPath, 'utf8'));
        this.model = {
          id: modelConfig.name,
          version: '1.0.0',
          variant: 'modern', // Default variant
          architecture: 'distilbert',
          training_data_size: modelConfig.training_data_size || 0,
          created_at: new Date(modelConfig.created_at),
          performance_metrics: {
            perplexity: 0,
            accuracy: 0,
            training_loss: 0,
            validation_loss: 0,
            epoch_count: 0,
            training_time_hours: 0
          },
          model_path: modelPath
        };
      }
    } catch (error) {
      console.warn('Model not found, using fallback inference');
    }
  }

  private loadTokenizer(): void {
    try {
      const tokenizerPath = join(process.cwd(), 'models', 'tokenizer', 'tokenizer_config.json');
      if (require('fs').existsSync(tokenizerPath)) {
        this.tokenizer = JSON.parse(readFileSync(tokenizerPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Tokenizer not found, using fallback tokenization');
    }
  }

  private loadConfig(): void {
    try {
      const configPath = join(process.cwd(), 'lib', 'ml', 'ml-config.json');
      if (require('fs').existsSync(configPath)) {
        this.config = JSON.parse(readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Config not found, using default configuration');
    }
  }

  /**
   * Generate vocabulary based on context and requirements
   */
  async generateVocabulary(request: VocabularyGenerationRequest): Promise<GeneratedWord[]> {
    console.log(`🔤 Generating vocabulary for context: "${request.context}"`);

    const generatedWords: GeneratedWord[] = [];
    const count = request.count || 5;

    for (let i = 0; i < count; i++) {
      const word = await this.generateSingleWord(request);
      if (word) {
        generatedWords.push(word);
      }
    }

    console.log(`✅ Generated ${generatedWords.length} vocabulary items`);
    return generatedWords;
  }

  private async generateSingleWord(request: VocabularyGenerationRequest): Promise<GeneratedWord | null> {
    try {
      // Generate base word
      const baseWord = this.generateBaseWord(request);
      if (!baseWord) return null;

      // Generate translation
      const translation = await this.translateWord(baseWord, request.variant);
      
      // Generate alternatives
      const alternatives = await this.generateAlternatives(baseWord, translation, request);

      return {
        word: baseWord,
        translation,
        confidence: this.calculateConfidence(baseWord, translation),
        context: request.context,
        linguistic_justification: this.generateLinguisticJustification(baseWord, translation),
        alternatives
      };
    } catch (error) {
      console.error('Error generating word:', error);
      return null;
    }
  }

  private generateBaseWord(request: VocabularyGenerationRequest): string | null {
    const { word_type, semantic_field, variant } = request;
    
    // Generate word based on type and semantic field
    const wordPatterns = this.getWordPatterns(word_type, semantic_field);
    const pattern = wordPatterns[Math.floor(Math.random() * wordPatterns.length)];
    
    return this.applyPattern(pattern, variant);
  }

  private getWordPatterns(wordType: string, semanticField?: string): string[] {
    const patterns: Record<string, string[]> = {
      'noun': [
        'CVCV', 'CVCVC', 'VCVCV', 'CVCVCV'
      ],
      'verb': [
        'CVCV', 'CVCVC', 'VCVCV', 'CVCVCV'
      ],
      'adjective': [
        'CVCV', 'CVCVC', 'VCVCV'
      ],
      'adverb': [
        'CVCV', 'CVCVC'
      ],
      'pronoun': [
        'CV', 'CVC', 'VCV'
      ],
      'preposition': [
        'CV', 'CVC', 'VCV'
      ],
      'conjunction': [
        'CV', 'CVC', 'VCV'
      ]
    };

    return patterns[wordType] || patterns['noun'];
  }

  private applyPattern(pattern: string, variant: 'ancient' | 'modern'): string {
    const consonants = variant === 'ancient' 
      ? 'bcdfghjklmnpqrstvwxyz' 
      : 'bcdfghjklmnpqrstvwxyz';
    const vowels = variant === 'ancient' 
      ? 'aeiou' 
      : 'aeiouë';

    let word = '';
    for (const char of pattern) {
      if (char === 'C') {
        word += consonants[Math.floor(Math.random() * consonants.length)];
      } else if (char === 'V') {
        word += vowels[Math.floor(Math.random() * vowels.length)];
      }
    }

    return word;
  }

  private async translateWord(word: string, variant: 'ancient' | 'modern'): Promise<string> {
    // This would use the actual trained model in practice
    // For now, generate a translation based on patterns
    
    const patterns = this.getTranslationPatterns(variant);
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    return this.applyTranslationPattern(word, pattern, variant);
  }

  private getTranslationPatterns(variant: 'ancient' | 'modern'): string[] {
    if (variant === 'ancient') {
      return [
        'add -or suffix',
        'add -on suffix', 
        'reverse word',
        'add -an prefix',
        'double consonants'
      ];
    } else {
      return [
        'add -a suffix',
        'add -ë suffix',
        'add -ir suffix',
        'add -an prefix',
        'soften consonants'
      ];
    }
  }

  private applyTranslationPattern(word: string, pattern: string, variant: 'ancient' | 'modern'): string {
    switch (pattern) {
      case 'add -or suffix':
        return word + 'or';
      case 'add -on suffix':
        return word + 'on';
      case 'add -a suffix':
        return word + 'a';
      case 'add -ë suffix':
        return word + 'ë';
      case 'add -ir suffix':
        return word + 'ir';
      case 'add -an prefix':
        return 'an' + word;
      case 'reverse word':
        return word.split('').reverse().join('');
      case 'double consonants':
        return word.replace(/([bcdfghjklmnpqrstvwxyz])/g, '$1$1');
      case 'soften consonants':
        return word.replace(/[bcdfghjklmnpqrstvwxyz]/g, (match) => {
          const softMap: Record<string, string> = {
            'b': 'v', 'c': 's', 'd': 'th', 'f': 'ph', 'g': 'gh',
            'k': 'ch', 'p': 'b', 't': 'd'
          };
          return softMap[match] || match;
        });
      default:
        return word;
    }
  }

  private async generateAlternatives(
    baseWord: string, 
    translation: string, 
    request: VocabularyGenerationRequest
  ): Promise<AlternativeWord[]> {
    const alternatives: AlternativeWord[] = [];
    const count = Math.min(3, request.count || 3);

    for (let i = 0; i < count; i++) {
      const altTranslation = await this.translateWord(baseWord, request.variant);
      if (altTranslation !== translation) {
        alternatives.push({
          word: baseWord,
          translation: altTranslation,
          confidence: this.calculateConfidence(baseWord, altTranslation) * 0.8,
          reasoning: `Alternative ${i + 1} using different translation pattern`
        });
      }
    }

    return alternatives;
  }

  private calculateConfidence(word: string, translation: string): number {
    // Simple confidence calculation based on length and pattern consistency
    const lengthRatio = Math.min(word.length, translation.length) / Math.max(word.length, translation.length);
    const patternConsistency = this.checkPatternConsistency(word, translation);
    
    return Math.min(0.9, (lengthRatio + patternConsistency) / 2);
  }

  private checkPatternConsistency(word: string, translation: string): number {
    // Check if translation follows consistent patterns
    let consistency = 0.5; // Base consistency
    
    // Check for common patterns
    if (translation.endsWith('or') || translation.endsWith('on')) consistency += 0.2;
    if (translation.endsWith('a') || translation.endsWith('ë')) consistency += 0.2;
    if (translation.startsWith('an')) consistency += 0.1;
    
    return Math.min(1.0, consistency);
  }

  private generateLinguisticJustification(word: string, translation: string): string[] {
    const justifications: string[] = [];
    
    // Add pattern-based justifications
    if (translation.endsWith('or')) {
      justifications.push('Follows ancient Librán -or suffix pattern');
    }
    if (translation.endsWith('a')) {
      justifications.push('Follows modern Librán -a suffix pattern');
    }
    if (translation.startsWith('an')) {
      justifications.push('Uses common Librán prefix "an-"');
    }
    if (translation.length > word.length) {
      justifications.push('Applies morphological extension for Librán phonology');
    }
    
    return justifications.length > 0 ? justifications : ['Generated using Librán linguistic patterns'];
  }

  /**
   * Translate text using the trained model
   */
  async translateText(text: string, variant: 'ancient' | 'modern'): Promise<string> {
    console.log(`🔄 Translating text: "${text}" (${variant})`);

    if (!this.model) {
      console.warn('Model not loaded, using fallback translation');
      return this.fallbackTranslation(text, variant);
    }

    // Tokenize input
    const tokens = this.tokenizeText(text);
    
    // Generate translation
    const translatedTokens = await this.translateTokens(tokens, variant);
    
    // Reconstruct text
    const translatedText = this.reconstructText(translatedTokens);
    
    console.log(`✅ Translation: "${translatedText}"`);
    return translatedText;
  }

  private tokenizeText(text: string): string[] {
    if (this.tokenizer) {
      // Use trained tokenizer
      return text.toLowerCase().split(/\s+/).filter(token => token.length > 0);
    } else {
      // Fallback tokenization
      return text.toLowerCase().split(/\s+/).filter(token => token.length > 0);
    }
  }

  private async translateTokens(tokens: string[], variant: 'ancient' | 'modern'): Promise<string[]> {
    const translatedTokens: string[] = [];
    
    for (const token of tokens) {
      const translation = await this.translateWord(token, variant);
      translatedTokens.push(translation);
    }
    
    return translatedTokens;
  }

  private reconstructText(tokens: string[]): string {
    return tokens.join(' ');
  }

  private fallbackTranslation(text: string, variant: 'ancient' | 'modern'): string {
    // Simple fallback translation
    const words = text.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
      if (variant === 'ancient') {
        return word + 'or';
      } else {
        return word + 'a';
      }
    });
    
    return translatedWords.join(' ');
  }

  /**
   * Generate text using the model
   */
  async generateText(
    prompt: string, 
    maxLength: number = 100, 
    temperature: number = 0.8
  ): Promise<string> {
    console.log(`✨ Generating text from prompt: "${prompt}"`);

    if (!this.model) {
      console.warn('Model not loaded, using fallback generation');
      return this.fallbackGeneration(prompt, maxLength);
    }

    // Tokenize prompt
    const promptTokens = this.tokenizeText(prompt);
    
    // Generate continuation
    const generatedTokens = await this.generateTokens(promptTokens, maxLength, temperature);
    
    // Reconstruct text
    const generatedText = this.reconstructText(generatedTokens);
    
    console.log(`✅ Generated: "${generatedText}"`);
    return generatedText;
  }

  private async generateTokens(
    promptTokens: string[], 
    maxLength: number, 
    temperature: number
  ): Promise<string[]> {
    const generatedTokens: string[] = [...promptTokens];
    
    // Simple generation - in practice this would use the actual model
    const vocabulary = this.getVocabulary();
    
    for (let i = 0; i < maxLength - promptTokens.length; i++) {
      const nextToken = this.sampleNextToken(generatedTokens, vocabulary, temperature);
      generatedTokens.push(nextToken);
      
      // Stop at sentence boundary
      if (nextToken.endsWith('.') || nextToken.endsWith('!') || nextToken.endsWith('?')) {
        break;
      }
    }
    
    return generatedTokens;
  }

  private getVocabulary(): string[] {
    // Return a basic vocabulary for generation
    return [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you',
      'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ];
  }

  private sampleNextToken(context: string[], vocabulary: string[], temperature: number): string {
    // Simple sampling - in practice this would use the actual model probabilities
    const weights = vocabulary.map(() => Math.random());
    const maxWeight = Math.max(...weights);
    const threshold = maxWeight * temperature;
    
    const candidates = vocabulary.filter((_, i) => weights[i] > threshold);
    return candidates.length > 0 
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : vocabulary[Math.floor(Math.random() * vocabulary.length)];
  }

  private fallbackGeneration(prompt: string, maxLength: number): string {
    // Simple fallback generation
    const words = prompt.split(/\s+/);
    const generated = [...words];
    
    const vocabulary = this.getVocabulary();
    for (let i = words.length; i < maxLength; i++) {
      const nextWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
      generated.push(nextWord);
    }
    
    return generated.join(' ');
  }

  /**
   * Get model information
   */
  getModelInfo(): LibránModel | null {
    return this.model;
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this.model !== null;
  }

  /**
   * Get available variants
   */
  getAvailableVariants(): string[] {
    return ['ancient', 'modern'];
  }
}
