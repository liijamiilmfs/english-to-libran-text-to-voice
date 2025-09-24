#!/usr/bin/env node

/**
 * Data Preparation Script for Librán Language Model Training
 * Processes dictionary data and generates training corpus
 */

const fs = require('fs');
const path = require('path');
const { LibránCorpusBuilder } = require('../../../lib/ml/training/dataset-builder');

class DataPreparation {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadConfig();
    this.corpusBuilder = new LibránCorpusBuilder();
  }

  loadConfig() {
    const configPath = path.join(this.projectRoot, 'lib/ml/ml-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    // Default config if file doesn't exist
    return {
      data: {
        train_split: 0.8,
        val_split: 0.1,
        test_split: 0.1,
        min_length: 3,
        max_length: 512,
        quality_threshold: 0.5
      },
      paths: {
        data_dir: './data/training',
        output_dir: './models/checkpoints'
      }
    };
  }

  async prepareData() {
    console.log('📊 Starting data preparation for Librán language model...\n');

    try {
      // Build training corpus
      console.log('🔨 Building training corpus...');
      const datasets = await this.corpusBuilder.buildTrainingCorpus();
      console.log(`✅ Generated ${datasets.length} training examples`);

      // Get corpus statistics
      const stats = this.corpusBuilder.getCorpusStats(datasets);
      this.printCorpusStats(stats);

      // Split data into train/val/test
      console.log('\n📊 Splitting data into train/validation/test sets...');
      const { trainData, valData, testData } = this.splitData(datasets);
      
      console.log(`  Training: ${trainData.length} examples`);
      console.log(`  Validation: ${valData.length} examples`);
      console.log(`  Test: ${testData.length} examples`);

      // Save processed datasets
      await this.saveDatasets(trainData, valData, testData);
      
      // Generate data summary
      await this.generateDataSummary(datasets, stats);

      console.log('\n✅ Data preparation completed successfully!');
      console.log('\nGenerated files:');
      console.log('  - data/training/processed/train.json');
      console.log('  - data/training/processed/validation.json');
      console.log('  - data/training/processed/test.json');
      console.log('  - data/training/processed/corpus_stats.json');

    } catch (error) {
      console.error('\n❌ Data preparation failed:', error.message);
      process.exit(1);
    }
  }

  splitData(datasets) {
    const { train_split, val_split, test_split } = this.config.data;
    
    // Shuffle data
    const shuffled = [...datasets].sort(() => Math.random() - 0.5);
    
    const total = shuffled.length;
    const trainEnd = Math.floor(total * train_split);
    const valEnd = trainEnd + Math.floor(total * val_split);
    
    return {
      trainData: shuffled.slice(0, trainEnd),
      valData: shuffled.slice(trainEnd, valEnd),
      testData: shuffled.slice(valEnd)
    };
  }

  async saveDatasets(trainData, valData, testData) {
    const outputDir = path.join(this.projectRoot, 'data/training/processed');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save datasets
    fs.writeFileSync(
      path.join(outputDir, 'train.json'),
      JSON.stringify(trainData, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'validation.json'),
      JSON.stringify(valData, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'test.json'),
      JSON.stringify(testData, null, 2)
    );
  }

  async generateDataSummary(datasets, stats) {
    const summary = {
      generated_at: new Date().toISOString(),
      total_examples: datasets.length,
      statistics: stats,
      quality_distribution: this.analyzeQualityDistribution(datasets),
      variant_distribution: this.analyzeVariantDistribution(datasets),
      source_distribution: this.analyzeSourceDistribution(datasets),
      length_distribution: this.analyzeLengthDistribution(datasets),
      recommendations: this.generateRecommendations(datasets, stats)
    };

    const outputPath = path.join(this.projectRoot, 'data/training/processed/corpus_stats.json');
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  }

  printCorpusStats(stats) {
    console.log('\n📈 Corpus Statistics:');
    console.log(`  Total words: ${stats.total_words.toLocaleString()}`);
    console.log(`  Unique words: ${stats.unique_words.toLocaleString()}`);
    console.log(`  Average word length: ${stats.avg_word_length.toFixed(2)}`);
    
    console.log('\n  Variant Distribution:');
    console.log(`    Ancient: ${stats.variant_distribution.ancient} (${(stats.variant_distribution.ancient / stats.total_words * 100).toFixed(1)}%)`);
    console.log(`    Modern: ${stats.variant_distribution.modern} (${(stats.variant_distribution.modern / stats.total_words * 100).toFixed(1)}%)`);
    
    console.log('\n  Source Distribution:');
    Object.entries(stats.source_distribution).forEach(([source, count]) => {
      const percentage = (count / stats.total_words * 100).toFixed(1);
      console.log(`    ${source}: ${count} (${percentage}%)`);
    });
    
    console.log('\n  Quality Distribution:');
    Object.entries(stats.quality_distribution).forEach(([quality, count]) => {
      const percentage = (count / stats.total_words * 100).toFixed(1);
      console.log(`    ${quality}: ${count} (${percentage}%)`);
    });
  }

  analyzeQualityDistribution(datasets) {
    const distribution = { high: 0, medium: 0, low: 0 };
    
    datasets.forEach(dataset => {
      if (dataset.quality_score >= 0.8) distribution.high++;
      else if (dataset.quality_score >= 0.6) distribution.medium++;
      else distribution.low++;
    });
    
    return distribution;
  }

  analyzeVariantDistribution(datasets) {
    const distribution = { ancient: 0, modern: 0 };
    
    datasets.forEach(dataset => {
      distribution[dataset.variant]++;
    });
    
    return distribution;
  }

  analyzeSourceDistribution(datasets) {
    const distribution = { dictionary: 0, literature: 0, generated: 0 };
    
    datasets.forEach(dataset => {
      distribution[dataset.source]++;
    });
    
    return distribution;
  }

  analyzeLengthDistribution(datasets) {
    const lengths = datasets.map(d => d.text.length);
    const sorted = lengths.sort((a, b) => a - b);
    
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      mean: lengths.reduce((a, b) => a + b, 0) / lengths.length,
      q25: sorted[Math.floor(sorted.length * 0.25)],
      q75: sorted[Math.floor(sorted.length * 0.75)]
    };
  }

  generateRecommendations(datasets, stats) {
    const recommendations = [];
    
    // Check data size
    if (datasets.length < 1000) {
      recommendations.push({
        type: 'data_size',
        priority: 'high',
        message: 'Consider generating more training data. Current size may be insufficient for effective training.',
        suggestion: 'Run data augmentation or add more dictionary entries'
      });
    }
    
    // Check quality distribution
    const qualityStats = this.analyzeQualityDistribution(datasets);
    if (qualityStats.low > qualityStats.high) {
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        message: 'High proportion of low-quality data detected.',
        suggestion: 'Review and improve data generation algorithms or filtering criteria'
      });
    }
    
    // Check variant balance
    const variantStats = this.analyzeVariantDistribution(datasets);
    const total = variantStats.ancient + variantStats.modern;
    const ancientRatio = variantStats.ancient / total;
    
    if (ancientRatio < 0.3 || ancientRatio > 0.7) {
      recommendations.push({
        type: 'balance',
        priority: 'medium',
        message: 'Imbalanced variant distribution detected.',
        suggestion: 'Generate more data for the underrepresented variant'
      });
    }
    
    // Check length distribution
    const lengthStats = this.analyzeLengthDistribution(datasets);
    if (lengthStats.mean < 10) {
      recommendations.push({
        type: 'length',
        priority: 'low',
        message: 'Average text length is quite short.',
        suggestion: 'Consider generating longer, more complex sentences for better context learning'
      });
    }
    
    return recommendations;
  }
}

// Run data preparation if called directly
if (require.main === module) {
  const prep = new DataPreparation();
  prep.prepareData().catch(console.error);
}

module.exports = DataPreparation;
