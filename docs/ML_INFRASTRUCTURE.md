# ML Infrastructure Documentation

This document provides comprehensive guidance on using the Librán Language Model ML infrastructure for training, evaluation, and inference.

## Overview

The ML infrastructure provides a complete pipeline for training and using language models for Librán translation. It includes data preparation, tokenization, model training, evaluation, and inference capabilities.

## Quick Start

### 1. Setup
```bash
# Initialize ML environment
npm run ml:setup

# This will:
# - Check Node.js version (requires 20+)
# - Verify ML dependencies
# - Create required directories
# - Generate configuration files
```

### 2. Prepare Data
```bash
# Generate training corpus from dictionaries
npm run ml:corpus

# This will:
# - Extract dictionary entries
# - Generate synthetic text
# - Create parallel sentence pairs
# - Split into train/validation/test sets
```

### 3. Build Tokenizer
```bash
# Create Librán-specific tokenizer
npm run ml:tokenizer

# This will:
# - Extract vocabulary from training data
# - Build character-level vocabulary
# - Create subword tokenization
# - Save tokenizer configuration
```

### 4. Train Model
```bash
# Train the language model
npm run ml:train

# This will:
# - Load training data and tokenizer
# - Initialize model architecture
# - Run training with progress tracking
# - Save checkpoints and final model
```

### 5. Evaluate Model
```bash
# Evaluate model performance
npm run ml:evaluate

# This will:
# - Load trained model and test data
# - Calculate performance metrics
# - Generate evaluation report
# - Provide improvement recommendations
```

## Detailed Usage

### Data Preparation

The data preparation script (`tools/ml/training/data_preparation.js`) processes dictionary data into training-ready datasets.

#### Features:
- **Dictionary Extraction**: Converts dictionary entries to training examples
- **Synthetic Generation**: Creates additional training data using patterns
- **Parallel Pairs**: Generates English-Librán sentence pairs
- **Quality Scoring**: Filters and scores data based on quality criteria
- **Statistical Analysis**: Provides detailed corpus statistics

#### Output Files:
- `data/training/processed/train.json` - Training dataset
- `data/training/processed/validation.json` - Validation dataset
- `data/training/processed/test.json` - Test dataset
- `data/training/processed/corpus_stats.json` - Corpus statistics

#### Example Usage:
```javascript
const DataPreparation = require('./tools/ml/training/data_preparation');
const prep = new DataPreparation();
await prep.prepareData();
```

### Tokenization

The tokenizer (`tools/ml/tokenizer/libran_tokenizer.js`) creates a Librán-specific tokenization system.

#### Features:
- **Character-Level Vocabulary**: Builds vocabulary from character frequencies
- **Subword Tokenization**: Creates subword units for better coverage
- **Special Tokens**: Handles UNK, PAD, CLS, SEP, MASK tokens
- **Pattern Merging**: Implements BPE-style merging rules

#### Output Files:
- `models/tokenizer/vocab.json` - Vocabulary mapping
- `models/tokenizer/tokenizer_config.json` - Tokenizer configuration
- `models/tokenizer/merges.txt` - Merge rules

#### Example Usage:
```javascript
const LibránTokenizer = require('./tools/ml/tokenizer/libran_tokenizer');
const tokenizer = new LibránTokenizer();
await tokenizer.buildTokenizer();

// Tokenize text
const tokens = tokenizer.tokenize("Hello world");
const decoded = tokenizer.decode(tokens);
```

### Model Training

The training script (`tools/ml/training/train_libran_model.js`) handles the complete training pipeline.

#### Features:
- **Progress Tracking**: Real-time training progress and metrics
- **Checkpointing**: Saves model checkpoints at regular intervals
- **Validation**: Evaluates model on validation set during training
- **Configuration**: Flexible training configuration via JSON
- **Logging**: Comprehensive training logs and metrics

#### Configuration:
```json
{
  "model": {
    "name": "libran-language-model",
    "base_model": "distilbert-base-uncased",
    "max_length": 512,
    "vocab_size": 30000
  },
  "training": {
    "batch_size": 16,
    "learning_rate": 2e-5,
    "epochs": 10,
    "warmup_steps": 1000,
    "weight_decay": 0.01,
    "dropout": 0.1
  }
}
```

#### Output Files:
- `models/checkpoints/final_model/` - Final trained model
- `models/checkpoints/checkpoint-{epoch}-{step}/` - Training checkpoints
- `logs/ml/training_log.json` - Training history and metrics

### Model Evaluation

The evaluation script (`tools/ml/training/model_evaluation.js`) provides comprehensive model assessment.

#### Metrics:
- **Perplexity**: Language modeling quality
- **Accuracy**: Translation accuracy
- **BLEU Score**: Translation quality
- **ROUGE Score**: Text generation quality
- **Variant Performance**: Ancient vs Modern performance
- **Quality Performance**: Performance by data quality

#### Output Files:
- `logs/ml/evaluation_report.json` - Detailed evaluation report
- `logs/ml/evaluation_metrics.json` - Raw metrics data

#### Example Usage:
```javascript
const LibránModelEvaluator = require('./tools/ml/training/model_evaluation');
const evaluator = new LibránModelEvaluator();
await evaluator.evaluate();
```

## Advanced Usage

### Dictionary Analysis

The dictionary analyzer (`lib/ml/analysis/dictionary-analyzer.ts`) provides deep analysis of dictionary data.

#### Features:
- **Inconsistency Detection**: Finds spelling, pronunciation, and semantic issues
- **Pattern Extraction**: Identifies linguistic patterns and rules
- **Improvement Suggestions**: Recommends dictionary improvements
- **Quality Assessment**: Calculates overall dictionary quality score

#### Example Usage:
```typescript
import { LibránDictionaryAnalyzer } from './lib/ml/analysis/dictionary-analyzer';

const analyzer = new LibránDictionaryAnalyzer();
const analysis = await analyzer.analyzeDictionaries();

console.log(`Quality Score: ${analysis.quality_score}`);
console.log(`Inconsistencies: ${analysis.inconsistencies.length}`);
console.log(`Suggestions: ${analysis.suggestions.length}`);
```

### Model Inference

The inference module (`lib/ml/inference/model-inference.ts`) handles model prediction and generation.

#### Features:
- **Vocabulary Generation**: Creates new Librán words based on context
- **Text Translation**: Translates English to Librán using trained model
- **Text Generation**: Generates Librán text from prompts
- **Confidence Scoring**: Provides confidence scores for predictions

#### Example Usage:
```typescript
import { LibránModelInference } from './lib/ml/inference/model-inference';

const inference = new LibránModelInference();

// Generate vocabulary
const request = {
  context: "mystical forest",
  word_type: "noun",
  variant: "ancient",
  count: 5
};
const words = await inference.generateVocabulary(request);

// Translate text
const translation = await inference.translateText("Hello world", "ancient");

// Generate text
const generated = await inference.generateText("In the ancient forest", 50);
```

## Configuration

### ML Configuration

The ML system uses `lib/ml/ml-config.json` for configuration:

```json
{
  "model": {
    "name": "libran-language-model",
    "base_model": "distilbert-base-uncased",
    "max_length": 512,
    "vocab_size": 30000
  },
  "training": {
    "batch_size": 16,
    "learning_rate": 2e-5,
    "epochs": 10,
    "warmup_steps": 1000,
    "weight_decay": 0.01,
    "dropout": 0.1,
    "gradient_accumulation_steps": 4,
    "save_steps": 500,
    "eval_steps": 500,
    "logging_steps": 100
  },
  "data": {
    "train_split": 0.8,
    "val_split": 0.1,
    "test_split": 0.1,
    "min_length": 3,
    "max_length": 512,
    "quality_threshold": 0.5
  },
  "paths": {
    "output_dir": "./models/checkpoints",
    "cache_dir": "./models/cache",
    "data_dir": "./data/training",
    "logs_dir": "./logs/ml"
  }
}
```

### Environment Variables

Create `.env.ml` file for ML-specific environment variables:

```bash
# Weights & Biases (optional)
WANDB_API_KEY=your_wandb_api_key_here
WANDB_PROJECT=libran-language-model
WANDB_ENTITY=your_wandb_entity_here

# Hugging Face (optional)
HUGGINGFACE_HUB_TOKEN=your_hf_token_here

# Model Configuration
ML_MODEL_NAME=libran-language-model
ML_BASE_MODEL=distilbert-base-uncased
ML_MAX_LENGTH=512
ML_VOCAB_SIZE=30000

# Training Configuration
ML_BATCH_SIZE=16
ML_LEARNING_RATE=2e-5
ML_EPOCHS=10
ML_SAVE_STEPS=500
ML_EVAL_STEPS=500

# Data Configuration
ML_TRAIN_SPLIT=0.8
ML_VAL_SPLIT=0.1
ML_TEST_SPLIT=0.1
ML_QUALITY_THRESHOLD=0.5
```

## Directory Structure

```
lib/ml/
├── analysis/
│   └── dictionary-analyzer.ts      # Dictionary analysis
├── inference/
│   └── model-inference.ts          # Model inference
├── training/
│   └── dataset-builder.ts          # Dataset building
├── types.ts                        # Type definitions
└── ml-config.json                  # ML configuration

tools/ml/
├── inference/                      # Inference tools
├── tokenizer/
│   └── libran_tokenizer.js         # Tokenizer script
└── training/
    ├── data_preparation.js         # Data preparation
    ├── train_libran_model.js       # Model training
    └── model_evaluation.js         # Model evaluation

scripts/
└── ml-setup.js                     # ML setup script

models/
├── checkpoints/                    # Model checkpoints
├── cache/                          # Training cache
└── tokenizer/                      # Tokenizer files

data/training/
├── processed/                      # Processed datasets
├── raw/                           # Raw data
└── augmented/                     # Augmented data

logs/ml/                           # ML logs and reports
```

## Troubleshooting

### Common Issues

#### 1. Missing Dependencies
```bash
# Install ML dependencies
npm install @huggingface/transformers datasets accelerate evaluate wandb
```

#### 2. Training Data Not Found
```bash
# Ensure data preparation is run first
npm run ml:corpus
```

#### 3. Tokenizer Not Found
```bash
# Build tokenizer before training
npm run ml:tokenizer
```

#### 4. Model Not Found
```bash
# Train model before evaluation
npm run ml:train
```

### Performance Issues

#### 1. Slow Training
- Reduce batch size
- Increase gradient accumulation steps
- Use smaller model architecture
- Enable mixed precision training

#### 2. Memory Issues
- Reduce max_length
- Decrease batch size
- Use gradient checkpointing
- Clear cache regularly

#### 3. Poor Model Performance
- Increase training data
- Adjust learning rate
- Train for more epochs
- Improve data quality

### Debugging

#### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=libran-ml:*
npm run ml:train
```

#### Check Logs
```bash
# View training logs
cat logs/ml/training_log.json

# View evaluation logs
cat logs/ml/evaluation_report.json
```

## Best Practices

### 1. Data Quality
- Ensure high-quality dictionary entries
- Use consistent translation patterns
- Validate data before training
- Monitor data distribution

### 2. Training
- Start with small models for experimentation
- Use validation set for hyperparameter tuning
- Save checkpoints regularly
- Monitor training metrics closely

### 3. Evaluation
- Use multiple evaluation metrics
- Test on held-out data
- Compare variant performance
- Document evaluation results

### 4. Deployment
- Test inference performance
- Optimize model size
- Implement proper error handling
- Monitor production metrics

## API Reference

### Data Preparation
- `DataPreparation.prepareData()` - Main data preparation method
- `DataPreparation.generateDataSummary()` - Generate data statistics

### Tokenization
- `LibránTokenizer.buildTokenizer()` - Build tokenizer
- `LibránTokenizer.tokenize(text)` - Tokenize text
- `LibránTokenizer.decode(tokens)` - Decode tokens

### Training
- `LibránModelTrainer.train()` - Main training method
- `LibránModelTrainer.saveModel()` - Save trained model

### Evaluation
- `LibránModelEvaluator.evaluate()` - Main evaluation method
- `LibránModelEvaluator.generateReport()` - Generate evaluation report

### Analysis
- `LibránDictionaryAnalyzer.analyzeDictionaries()` - Analyze dictionaries
- `LibránDictionaryAnalyzer.exportAnalysis(path)` - Export analysis

### Inference
- `LibránModelInference.generateVocabulary(request)` - Generate vocabulary
- `LibránModelInference.translateText(text, variant)` - Translate text
- `LibránModelInference.generateText(prompt, maxLength)` - Generate text

## Contributing

### Adding New Features
1. Create feature branch
2. Implement feature with tests
3. Update documentation
4. Submit pull request

### Reporting Issues
1. Check existing issues
2. Create detailed bug report
3. Include logs and configuration
4. Provide reproduction steps

### Code Style
- Follow TypeScript best practices
- Use meaningful variable names
- Add comprehensive comments
- Write unit tests

---

*This documentation is maintained alongside the codebase and updated with each major release.*
