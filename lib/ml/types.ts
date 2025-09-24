/**
 * Core ML types and interfaces for Librán language model training
 */

export interface TrainingDataset {
  text: string;
  variant: 'ancient' | 'modern';
  source: 'dictionary' | 'literature' | 'generated';
  quality_score: number;
  metadata?: {
    word_count?: number;
    complexity_score?: number;
    linguistic_category?: string;
    translation_confidence?: number;
  };
}

export interface LibránModel {
  id: string;
  version: string;
  variant: 'ancient' | 'modern';
  architecture: 'distilbert' | 'roberta' | 'custom';
  training_data_size: number;
  created_at: Date;
  performance_metrics: ModelMetrics;
  model_path: string;
}

export interface ModelMetrics {
  perplexity: number;
  accuracy: number;
  bleu_score?: number;
  rouge_score?: number;
  training_loss: number;
  validation_loss: number;
  epoch_count: number;
  training_time_hours: number;
}

export interface DictionaryAnalysis {
  total_entries: number;
  inconsistencies: Inconsistency[];
  suggestions: ImprovementSuggestion[];
  linguistic_patterns: LinguisticPattern[];
  quality_score: number;
  analysis_timestamp: Date;
}

export interface Inconsistency {
  type: 'spelling' | 'pronunciation' | 'morphology' | 'semantic';
  word: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggested_fix?: string;
}

export interface ImprovementSuggestion {
  word: string;
  current_translation: string;
  suggested_translation: string;
  confidence: number;
  reasoning: string;
  linguistic_rules: string[];
}

export interface LinguisticPattern {
  pattern_type: 'phonetic' | 'morphological' | 'syntactic';
  pattern: string;
  frequency: number;
  examples: string[];
  confidence: number;
}

export interface GeneratedWord {
  word: string;
  translation: string;
  confidence: number;
  context: string;
  linguistic_justification: string[];
  alternatives: AlternativeWord[];
}

export interface AlternativeWord {
  word: string;
  translation: string;
  confidence: number;
  reasoning: string;
}

export interface TrainingConfig {
  model_name: string;
  base_model: string;
  max_length: number;
  batch_size: number;
  learning_rate: number;
  epochs: number;
  warmup_steps: number;
  weight_decay: number;
  dropout: number;
  gradient_accumulation_steps: number;
  save_steps: number;
  eval_steps: number;
  logging_steps: number;
  output_dir: string;
  cache_dir: string;
}

export interface TrainingProgress {
  epoch: number;
  step: number;
  total_steps: number;
  loss: number;
  learning_rate: number;
  training_time: number;
  eta: number;
}

export interface VocabularyGenerationRequest {
  context: string;
  word_type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'pronoun' | 'preposition' | 'conjunction';
  semantic_field?: string;
  variant: 'ancient' | 'modern';
  count?: number;
  max_length?: number;
}

export interface TokenizerConfig {
  vocab_size: number;
  max_length: number;
  special_tokens: {
    unk_token: string;
    cls_token: string;
    sep_token: string;
    pad_token: string;
    mask_token: string;
  };
  libran_characters: string;
  character_coverage: number;
}

export interface CorpusStats {
  total_words: number;
  unique_words: number;
  avg_word_length: number;
  variant_distribution: {
    ancient: number;
    modern: number;
  };
  source_distribution: {
    dictionary: number;
    literature: number;
    generated: number;
  };
  quality_distribution: {
    high: number;
    medium: number;
    low: number;
  };
}
