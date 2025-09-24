#!/usr/bin/env node

/**
 * ML Infrastructure Example
 * Demonstrates how to use the Librán ML infrastructure
 */

const { LibránDictionaryAnalyzer } = require('../lib/ml/analysis/dictionary-analyzer');
const { LibránModelInference } = require('../lib/ml/inference/model-inference');

async function demonstrateMLInfrastructure() {
  console.log('🔮 Librán ML Infrastructure Demo\n');

  try {
    // 1. Dictionary Analysis
    console.log('1. Analyzing dictionaries...');
    const analyzer = new LibránDictionaryAnalyzer();
    const analysis = await analyzer.analyzeDictionaries();
    
    console.log(`   ✅ Found ${analysis.total_entries} dictionary entries`);
    console.log(`   📊 Quality Score: ${(analysis.quality_score * 100).toFixed(1)}%`);
    console.log(`   ⚠️  Inconsistencies: ${analysis.inconsistencies.length}`);
    console.log(`   💡 Suggestions: ${analysis.suggestions.length}`);
    console.log(`   🔍 Patterns: ${analysis.linguistic_patterns.length}\n`);

    // 2. Model Inference (if available)
    console.log('2. Testing model inference...');
    const inference = new LibránModelInference();
    
    if (inference.isModelLoaded()) {
      console.log('   ✅ Model loaded successfully');
      
      // Generate vocabulary
      const vocabularyRequest = {
        context: "mystical forest",
        word_type: "noun",
        variant: "ancient",
        count: 3
      };
      
      const words = await inference.generateVocabulary(vocabularyRequest);
      console.log('   📝 Generated vocabulary:');
      words.forEach((word, i) => {
        console.log(`      ${i + 1}. ${word.word} → ${word.translation} (confidence: ${(word.confidence * 100).toFixed(1)}%)`);
      });
      
      // Translate text
      const translation = await inference.translateText("Hello world", "ancient");
      console.log(`   🌍 Translation: "Hello world" → "${translation}"`);
      
    } else {
      console.log('   ⚠️  Model not loaded - run "npm run ml:train" first');
    }

    console.log('\n3. ML Pipeline Status:');
    console.log('   📁 Data preparation: npm run ml:corpus');
    console.log('   🔤 Tokenizer: npm run ml:tokenizer');
    console.log('   🧠 Training: npm run ml:train');
    console.log('   📊 Evaluation: npm run ml:evaluate');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure to run "npm run ml:setup" first');
  }
}

// Run demo if called directly
if (require.main === module) {
  demonstrateMLInfrastructure().catch(console.error);
}

module.exports = { demonstrateMLInfrastructure };
