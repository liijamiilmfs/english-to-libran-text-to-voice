#!/usr/bin/env node

/**
 * Librán Tokenizer Script
 * Builds and manages tokenization for Librán language model training
 */

const fs = require('fs');
const path = require('path');

class LibránTokenizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadConfig();
    this.vocab = new Map();
    this.charToId = new Map();
    this.idToChar = new Map();
    this.specialTokens = {
      '[UNK]': 0,
      '[PAD]': 1,
      '[CLS]': 2,
      '[SEP]': 3,
      '[MASK]': 4,
      '[BOS]': 5,
      '[EOS]': 6
    };
    this.nextId = Object.keys(this.specialTokens).length;
  }

  loadConfig() {
    const configPath = path.join(this.projectRoot, 'lib/ml/ml-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    return {
      model: {
        vocab_size: 30000,
        max_length: 512
      },
      tokenizer: {
        min_frequency: 2,
        character_coverage: 0.9995,
        special_tokens: {
          unk_token: '[UNK]',
          pad_token: '[PAD]',
          cls_token: '[CLS]',
          sep_token: '[SEP]',
          mask_token: '[MASK]',
          bos_token: '[BOS]',
          eos_token: '[EOS]'
        }
      }
    };
  }

  async buildTokenizer() {
    console.log('🔤 Building Librán tokenizer...\n');

    try {
      // Load training data
      console.log('📖 Loading training data...');
      const trainingData = await this.loadTrainingData();
      console.log(`✅ Loaded ${trainingData.length} training examples`);

      // Extract vocabulary
      console.log('📝 Extracting vocabulary...');
      const vocabulary = this.extractVocabulary(trainingData);
      console.log(`✅ Extracted ${vocabulary.size} unique tokens`);

      // Build character-level vocabulary
      console.log('🔤 Building character-level vocabulary...');
      this.buildCharacterVocabulary(trainingData);
      console.log(`✅ Built character vocabulary with ${this.charToId.size} characters`);

      // Create subword vocabulary
      console.log('🔗 Creating subword vocabulary...');
      const subwordVocab = this.createSubwordVocabulary(vocabulary);
      console.log(`✅ Created subword vocabulary with ${subwordVocab.size} subwords`);

      // Merge vocabularies
      console.log('🔀 Merging vocabularies...');
      this.mergeVocabularies(subwordVocab);

      // Save tokenizer
      await this.saveTokenizer();

      // Test tokenizer
      await this.testTokenizer();

      console.log('\n✅ Tokenizer built successfully!');
      console.log('\nGenerated files:');
      console.log('  - models/tokenizer/vocab.json');
      console.log('  - models/tokenizer/tokenizer_config.json');
      console.log('  - models/tokenizer/merges.txt');

    } catch (error) {
      console.error('\n❌ Tokenizer build failed:', error.message);
      process.exit(1);
    }
  }

  async loadTrainingData() {
    const dataPath = path.join(this.projectRoot, 'data/training/processed/train.json');
    
    if (!fs.existsSync(dataPath)) {
      throw new Error('Training data not found. Run "npm run ml:corpus" first.');
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return data.map(item => item.text);
  }

  extractVocabulary(texts) {
    const tokenCounts = new Map();
    const minFreq = this.config.tokenizer.min_frequency || 2;

    // Count word frequencies
    texts.forEach(text => {
      const words = this.tokenizeText(text);
      words.forEach(word => {
        tokenCounts.set(word, (tokenCounts.get(word) || 0) + 1);
      });
    });

    // Filter by minimum frequency
    const vocabulary = new Map();
    for (const [word, count] of tokenCounts) {
      if (count >= minFreq) {
        vocabulary.set(word, count);
      }
    }

    return vocabulary;
  }

  buildCharacterVocabulary(texts) {
    const charCounts = new Map();

    // Count character frequencies
    texts.forEach(text => {
      for (const char of text) {
        charCounts.set(char, (charCounts.get(char) || 0) + 1);
      }
    });

    // Add special tokens
    Object.keys(this.specialTokens).forEach(token => {
      this.charToId.set(token, this.specialTokens[token]);
      this.idToChar.set(this.specialTokens[token], token);
    });

    // Add characters by frequency
    const sortedChars = Array.from(charCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    sortedChars.forEach(([char, count]) => {
      if (!this.charToId.has(char)) {
        this.charToId.set(char, this.nextId);
        this.idToChar.set(this.nextId, char);
        this.nextId++;
      }
    });
  }

  createSubwordVocabulary(wordVocab) {
    const subwordVocab = new Map();
    const maxVocabSize = this.config.model.vocab_size || 30000;
    const specialTokenCount = Object.keys(this.specialTokens).length;

    // Add all characters as subwords
    for (const [char, id] of this.charToId) {
      if (id >= specialTokenCount) {
        subwordVocab.set(char, wordVocab.get(char) || 1);
      }
    }

    // Add frequent character pairs
    const charPairs = this.extractCharacterPairs(wordVocab);
    const sortedPairs = Array.from(charPairs.entries())
      .sort((a, b) => b[1] - a[1]);

    let currentId = this.nextId;
    for (const [pair, count] of sortedPairs) {
      if (currentId >= maxVocabSize) break;
      subwordVocab.set(pair, count);
      currentId++;
    }

    return subwordVocab;
  }

  extractCharacterPairs(wordVocab) {
    const pairCounts = new Map();

    for (const [word, count] of wordVocab) {
      for (let i = 0; i < word.length - 1; i++) {
        const pair = word.slice(i, i + 2);
        pairCounts.set(pair, (pairCounts.get(pair) || 0) + count);
      }
    }

    return pairCounts;
  }

  mergeVocabularies(subwordVocab) {
    // Add special tokens
    for (const [token, id] of Object.entries(this.specialTokens)) {
      this.vocab.set(token, id);
    }

    // Add subwords
    let currentId = this.nextId;
    for (const [subword, count] of subwordVocab) {
      if (!this.vocab.has(subword)) {
        this.vocab.set(subword, currentId);
        currentId++;
      }
    }
  }

  async saveTokenizer() {
    const tokenizerDir = path.join(this.projectRoot, 'models/tokenizer');
    
    // Ensure directory exists
    if (!fs.existsSync(tokenizerDir)) {
      fs.mkdirSync(tokenizerDir, { recursive: true });
    }

    // Save vocabulary
    const vocabArray = Array.from(this.vocab.entries())
      .sort((a, b) => a[1] - b[1]);
    
    const vocabObj = {};
    vocabArray.forEach(([token, id]) => {
      vocabObj[token] = id;
    });

    fs.writeFileSync(
      path.join(tokenizerDir, 'vocab.json'),
      JSON.stringify(vocabObj, null, 2)
    );

    // Save tokenizer config
    const tokenizerConfig = {
      vocab_size: this.vocab.size,
      max_length: this.config.model.max_length,
      special_tokens: this.config.tokenizer.special_tokens,
      character_coverage: this.config.tokenizer.character_coverage,
      min_frequency: this.config.tokenizer.min_frequency,
      created_at: new Date().toISOString(),
      model_type: 'librán-subword'
    };

    fs.writeFileSync(
      path.join(tokenizerDir, 'tokenizer_config.json'),
      JSON.stringify(tokenizerConfig, null, 2)
    );

    // Save merges (for BPE-style tokenization)
    const merges = this.generateMerges();
    fs.writeFileSync(
      path.join(tokenizerDir, 'merges.txt'),
      merges.join('\n')
    );
  }

  generateMerges() {
    const merges = [];
    const vocabArray = Array.from(this.vocab.entries())
      .filter(([token, id]) => id >= Object.keys(this.specialTokens).length)
      .sort((a, b) => a[1] - b[1]);

    // Simple merge strategy - character pairs
    const pairs = new Set();
    vocabArray.forEach(([token, id]) => {
      if (token.length === 2) {
        pairs.add(token);
      }
    });

    Array.from(pairs).forEach(pair => {
      merges.push(pair);
    });

    return merges;
  }

  async testTokenizer() {
    console.log('\n🧪 Testing tokenizer...');
    
    const testTexts = [
      "Hello world",
      "The quick brown fox",
      "Librán language model",
      "Ancient and modern variants"
    ];

    testTexts.forEach(text => {
      const tokens = this.tokenize(text);
      const decoded = this.decode(tokens);
      console.log(`  "${text}" → [${tokens.join(', ')}] → "${decoded}"`);
    });
  }

  tokenizeText(text) {
    // Simple whitespace tokenization
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  tokenize(text) {
    const words = this.tokenizeText(text);
    const tokens = [];

    words.forEach(word => {
      if (this.vocab.has(word)) {
        tokens.push(this.vocab.get(word));
      } else {
        // Handle unknown words with character-level tokenization
        for (const char of word) {
          if (this.charToId.has(char)) {
            tokens.push(this.charToId.get(char));
          } else {
            tokens.push(this.specialTokens['[UNK]']);
          }
        }
      }
    });

    return tokens;
  }

  decode(tokenIds) {
    return tokenIds.map(id => {
      if (this.idToChar.has(id)) {
        return this.idToChar.get(id);
      }
      return '[UNK]';
    }).join(' ');
  }

  getVocabSize() {
    return this.vocab.size;
  }

  getSpecialTokens() {
    return this.specialTokens;
  }
}

// Run tokenizer build if called directly
if (require.main === module) {
  const tokenizer = new LibránTokenizer();
  tokenizer.buildTokenizer().catch(console.error);
}

module.exports = LibránTokenizer;
