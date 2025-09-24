#!/usr/bin/env node

/**
 * ML Setup Script for Librán Language Model Training
 * Initializes the ML environment, checks dependencies, and sets up required directories
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MLSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.requiredDirs = [
      'lib/ml/analysis',
      'lib/ml/models',
      'lib/ml/training',
      'tools/ml/inference',
      'tools/ml/tokenizer',
      'tools/ml/training',
      'models/checkpoints',
      'models/evaluation',
      'models/final',
      'data/training/raw',
      'data/training/processed',
      'data/training/augmented',
      'logs/ml'
    ];
    
    this.requiredDependencies = [
      '@huggingface/transformers',
      'datasets',
      'accelerate',
      'evaluate',
      'wandb'
    ];
  }

  async setup() {
    console.log('🚀 Setting up ML infrastructure for Librán language model training...\n');

    try {
      await this.checkNodeVersion();
      await this.checkDependencies();
      await this.createDirectories();
      await this.createConfigFiles();
      await this.verifySetup();
      
      console.log('\n✅ ML setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Run "npm run ml:corpus" to prepare training data');
      console.log('2. Run "npm run ml:tokenizer" to build the tokenizer');
      console.log('3. Run "npm run ml:train" to start model training');
      console.log('4. Run "npm run ml:evaluate" to evaluate model performance');
      
    } catch (error) {
      console.error('\n❌ ML setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkNodeVersion() {
    console.log('📋 Checking Node.js version...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 20) {
      throw new Error(`Node.js 20+ required, found ${nodeVersion}`);
    }
    
    console.log(`✅ Node.js ${nodeVersion} is compatible`);
  }

  async checkDependencies() {
    console.log('\n📦 Checking ML dependencies...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const missingDeps = this.requiredDependencies.filter(dep => !allDeps[dep]);
    
    if (missingDeps.length > 0) {
      console.log('⚠️  Missing dependencies:', missingDeps.join(', '));
      console.log('Run "npm install" to install missing packages');
    } else {
      console.log('✅ All ML dependencies are installed');
    }
  }

  async createDirectories() {
    console.log('\n📁 Creating ML directory structure...');
    
    for (const dir of this.requiredDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  Created: ${dir}`);
      } else {
        console.log(`  Exists:  ${dir}`);
      }
    }
  }

  async createConfigFiles() {
    console.log('\n⚙️  Creating configuration files...');
    
    // Create ML config
    const mlConfig = {
      model: {
        name: 'libran-language-model',
        base_model: 'distilbert-base-uncased',
        max_length: 512,
        vocab_size: 30000
      },
      training: {
        batch_size: 16,
        learning_rate: 2e-5,
        epochs: 10,
        warmup_steps: 1000,
        weight_decay: 0.01,
        dropout: 0.1,
        gradient_accumulation_steps: 4,
        save_steps: 500,
        eval_steps: 500,
        logging_steps: 100
      },
      data: {
        train_split: 0.8,
        val_split: 0.1,
        test_split: 0.1,
        min_length: 3,
        max_length: 512,
        quality_threshold: 0.5
      },
      paths: {
        output_dir: './models/checkpoints',
        cache_dir: './models/cache',
        data_dir: './data/training',
        logs_dir: './logs/ml'
      },
      wandb: {
        project: 'libran-language-model',
        entity: null, // Set your wandb entity here
        tags: ['libran', 'language-model', 'translation']
      }
    };

    const configPath = path.join(this.projectRoot, 'lib/ml/ml-config.json');
    fs.writeFileSync(configPath, JSON.stringify(mlConfig, null, 2));
    console.log('  Created: lib/ml/ml-config.json');

    // Create .env.ml template
    const envTemplate = `# ML Environment Variables
# Copy this to .env.ml and fill in your values

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
`;

    const envPath = path.join(this.projectRoot, '.env.ml.example');
    fs.writeFileSync(envPath, envTemplate);
    console.log('  Created: .env.ml.example');

    // Create gitignore entries for ML
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    let gitignore = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignore = fs.readFileSync(gitignorePath, 'utf8');
    }

    const mlGitignoreEntries = `
# ML specific
models/checkpoints/
models/cache/
models/final/
data/training/processed/
data/training/augmented/
logs/ml/
*.pkl
*.bin
*.safetensors
wandb/
.env.ml
`;

    if (!gitignore.includes('# ML specific')) {
      fs.appendFileSync(gitignorePath, mlGitignoreEntries);
      console.log('  Updated: .gitignore with ML entries');
    }
  }

  async verifySetup() {
    console.log('\n🔍 Verifying setup...');
    
    // Check if all directories exist
    for (const dir of this.requiredDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Directory not created: ${dir}`);
      }
    }
    
    // Check if config files exist
    const configPath = path.join(this.projectRoot, 'lib/ml/ml-config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('ML config file not created');
    }
    
    console.log('✅ Setup verification passed');
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new MLSetup();
  setup.setup().catch(console.error);
}

module.exports = MLSetup;
