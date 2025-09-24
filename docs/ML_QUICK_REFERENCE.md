# ML Infrastructure Quick Reference

Quick reference guide for the Librán Language Model ML infrastructure.

## Commands

### Setup
```bash
npm run ml:setup          # Initialize ML environment
```

### Data Pipeline
```bash
npm run ml:corpus         # Prepare training data
npm run ml:tokenizer      # Build tokenizer
```

### Training
```bash
npm run ml:train          # Train model
npm run ml:evaluate       # Evaluate model
```

## File Locations

### Scripts
- `scripts/ml-setup.js` - ML environment setup
- `tools/ml/training/data_preparation.js` - Data preparation
- `tools/ml/tokenizer/libran_tokenizer.js` - Tokenizer
- `tools/ml/training/train_libran_model.js` - Training
- `tools/ml/training/model_evaluation.js` - Evaluation

### Modules
- `lib/ml/analysis/dictionary-analyzer.ts` - Dictionary analysis
- `lib/ml/inference/model-inference.ts` - Model inference
- `lib/ml/training/dataset-builder.ts` - Dataset building
- `lib/ml/types.ts` - Type definitions

### Outputs
- `data/training/processed/` - Processed datasets
- `models/checkpoints/` - Model checkpoints
- `models/tokenizer/` - Tokenizer files
- `logs/ml/` - Logs and reports

## Configuration

### ML Config
- `lib/ml/ml-config.json` - Main configuration
- `.env.ml` - Environment variables

### Key Settings
```json
{
  "model": {
    "vocab_size": 30000,
    "max_length": 512
  },
  "training": {
    "batch_size": 16,
    "learning_rate": 2e-5,
    "epochs": 10
  }
}
```

## Common Workflows

### Full Training Pipeline
```bash
# 1. Setup
npm run ml:setup

# 2. Prepare data
npm run ml:corpus

# 3. Build tokenizer
npm run ml:tokenizer

# 4. Train model
npm run ml:train

# 5. Evaluate
npm run ml:evaluate
```

### Quick Test
```bash
# Just prepare data and test tokenizer
npm run ml:setup
npm run ml:corpus
npm run ml:tokenizer
```

### Model Analysis
```bash
# Analyze dictionaries
node -e "
const { LibránDictionaryAnalyzer } = require('./lib/ml/analysis/dictionary-analyzer');
const analyzer = new LibránDictionaryAnalyzer();
analyzer.analyzeDictionaries().then(console.log);
"
```

## Troubleshooting

### Missing Dependencies
```bash
npm install @huggingface/transformers datasets accelerate evaluate wandb
```

### Data Not Found
```bash
# Run data preparation first
npm run ml:corpus
```

### Memory Issues
- Reduce `batch_size` in config
- Decrease `max_length`
- Use smaller `vocab_size`

### Performance Issues
- Check data quality
- Adjust learning rate
- Increase training epochs
- Improve data preprocessing

## Output Files

### Data Preparation
- `train.json` - Training dataset
- `validation.json` - Validation dataset  
- `test.json` - Test dataset
- `corpus_stats.json` - Statistics

### Tokenizer
- `vocab.json` - Vocabulary
- `tokenizer_config.json` - Configuration
- `merges.txt` - Merge rules

### Training
- `final_model/` - Final model
- `checkpoint-*/` - Checkpoints
- `training_log.json` - Training logs

### Evaluation
- `evaluation_report.json` - Full report
- `evaluation_metrics.json` - Raw metrics

## Quick Examples

### Generate Vocabulary
```typescript
import { LibránModelInference } from './lib/ml/inference/model-inference';

const inference = new LibránModelInference();
const words = await inference.generateVocabulary({
  context: "mystical forest",
  word_type: "noun",
  variant: "ancient",
  count: 5
});
```

### Translate Text
```typescript
const translation = await inference.translateText("Hello world", "ancient");
```

### Analyze Dictionary
```typescript
import { LibránDictionaryAnalyzer } from './lib/ml/analysis/dictionary-analyzer';

const analyzer = new LibránDictionaryAnalyzer();
const analysis = await analyzer.analyzeDictionaries();
console.log(`Quality: ${analysis.quality_score}`);
```

## Environment Variables

```bash
# Optional: Weights & Biases
WANDB_API_KEY=your_key
WANDB_PROJECT=libran-model

# Optional: Hugging Face
HUGGINGFACE_HUB_TOKEN=your_token

# Model settings
ML_BATCH_SIZE=16
ML_LEARNING_RATE=2e-5
ML_EPOCHS=10
```

## Logs and Monitoring

### View Logs
```bash
# Training logs
cat logs/ml/training_log.json

# Evaluation logs  
cat logs/ml/evaluation_report.json

# Setup logs
cat logs/ml/setup.log
```

### Monitor Training
```bash
# Watch training progress
tail -f logs/ml/training_log.json
```

## Performance Tips

1. **Start Small**: Use small models for initial experiments
2. **Monitor Metrics**: Watch training and validation loss
3. **Save Checkpoints**: Regular checkpointing prevents data loss
4. **Validate Early**: Use validation set for hyperparameter tuning
5. **Quality Data**: Ensure high-quality training data
6. **Resource Management**: Monitor memory and CPU usage

---

*For detailed documentation, see [ML_INFRASTRUCTURE.md](./ML_INFRASTRUCTURE.md)*
