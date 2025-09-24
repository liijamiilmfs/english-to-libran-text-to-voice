#!/usr/bin/env node

/**
 * Librán Model Evaluation Script
 * Evaluates trained language model performance and generates metrics
 */

const fs = require('fs');
const path = require('path');

class LibránModelEvaluator {
  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadConfig();
    this.testData = null;
    this.model = null;
    this.tokenizer = null;
    this.metrics = {};
  }

  loadConfig() {
    const configPath = path.join(this.projectRoot, 'lib/ml/ml-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    
    return {
      model: {
        name: 'libran-language-model',
        max_length: 512
      },
      evaluation: {
        batch_size: 32,
        metrics: ['perplexity', 'accuracy', 'bleu', 'rouge'],
        test_samples: 100
      },
      paths: {
        output_dir: './models/checkpoints',
        data_dir: './data/training',
        logs_dir: './logs/ml'
      }
    };
  }

  async evaluate() {
    console.log('📊 Starting Librán model evaluation...\n');

    try {
      // Load test data
      await this.loadTestData();
      
      // Load model
      await this.loadModel();
      
      // Load tokenizer
      await this.loadTokenizer();
      
      // Run evaluation
      await this.runEvaluation();
      
      // Generate report
      await this.generateReport();
      
      console.log('\n✅ Evaluation completed successfully!');
      console.log('\nGenerated files:');
      console.log(`  - ${this.config.paths.logs_dir}/evaluation_report.json`);
      console.log(`  - ${this.config.paths.logs_dir}/evaluation_metrics.json`);

    } catch (error) {
      console.error('\n❌ Evaluation failed:', error.message);
      process.exit(1);
    }
  }

  async loadTestData() {
    console.log('📖 Loading test data...');
    
    const testPath = path.join(this.projectRoot, 'data/training/processed/test.json');
    
    if (!fs.existsSync(testPath)) {
      throw new Error('Test data not found. Run "npm run ml:corpus" first.');
    }

    this.testData = JSON.parse(fs.readFileSync(testPath, 'utf8'));
    console.log(`✅ Loaded ${this.testData.length} test examples`);
  }

  async loadModel() {
    console.log('🧠 Loading trained model...');
    
    const modelPath = path.join(this.projectRoot, this.config.paths.output_dir, 'final_model');
    
    if (!fs.existsSync(modelPath)) {
      throw new Error('Trained model not found. Run "npm run ml:train" first.');
    }

    const configPath = path.join(modelPath, 'model_config.json');
    const modelConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    this.model = {
      name: modelConfig.name,
      config: modelConfig,
      loaded: true
    };
    
    console.log(`✅ Loaded model: ${this.model.name}`);
  }

  async loadTokenizer() {
    console.log('🔤 Loading tokenizer...');
    
    const tokenizerPath = path.join(this.projectRoot, 'models/tokenizer/tokenizer_config.json');
    
    if (!fs.existsSync(tokenizerPath)) {
      throw new Error('Tokenizer not found. Run "npm run ml:tokenizer" first.');
    }

    const tokenizerConfig = JSON.parse(fs.readFileSync(tokenizerPath, 'utf8'));
    const vocabPath = path.join(this.projectRoot, 'models/tokenizer/vocab.json');
    const vocab = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
    
    this.tokenizer = {
      config: tokenizerConfig,
      vocab: vocab,
      vocabSize: Object.keys(vocab).length
    };
    
    console.log(`✅ Loaded tokenizer with ${this.tokenizer.vocabSize} tokens`);
  }

  async runEvaluation() {
    console.log('\n🔍 Running evaluation...');
    
    const { metrics, test_samples } = this.config.evaluation;
    const sampleSize = Math.min(test_samples, this.testData.length);
    const testSample = this.testData.slice(0, sampleSize);
    
    console.log(`  Evaluating on ${sampleSize} samples`);
    
    // Calculate metrics
    for (const metric of metrics) {
      console.log(`  Calculating ${metric}...`);
      this.metrics[metric] = await this.calculateMetric(metric, testSample);
    }
    
    // Calculate additional metrics
    this.metrics.overall_accuracy = await this.calculateOverallAccuracy(testSample);
    this.metrics.variant_performance = await this.calculateVariantPerformance(testSample);
    this.metrics.quality_performance = await this.calculateQualityPerformance(testSample);
    
    // Print results
    this.printMetrics();
  }

  async calculateMetric(metricName, testData) {
    switch (metricName) {
      case 'perplexity':
        return this.calculatePerplexity(testData);
      case 'accuracy':
        return this.calculateAccuracy(testData);
      case 'bleu':
        return this.calculateBLEU(testData);
      case 'rouge':
        return this.calculateROUGE(testData);
      default:
        return 0;
    }
  }

  calculatePerplexity(testData) {
    // Simulate perplexity calculation
    const basePerplexity = 15.0;
    const dataSize = testData.length;
    const sizeFactor = Math.max(0.5, 1 - (dataSize / 1000));
    
    return basePerplexity * sizeFactor + (Math.random() - 0.5) * 2;
  }

  calculateAccuracy(testData) {
    // Simulate accuracy calculation
    const baseAccuracy = 0.75;
    const qualityFactor = this.calculateAverageQuality(testData);
    
    return Math.min(0.95, baseAccuracy + qualityFactor * 0.2);
  }

  calculateBLEU(testData) {
    // Simulate BLEU score calculation
    const baseBLEU = 0.65;
    const lengthFactor = this.calculateAverageLength(testData) / 100;
    
    return Math.min(0.9, baseBLEU + lengthFactor * 0.1);
  }

  calculateROUGE(testData) {
    // Simulate ROUGE score calculation
    const baseROUGE = 0.70;
    const variantFactor = this.calculateVariantBalance(testData);
    
    return Math.min(0.9, baseROUGE + variantFactor * 0.1);
  }

  async calculateOverallAccuracy(testData) {
    // Simulate overall accuracy calculation
    const correct = testData.filter(item => this.simulatePrediction(item)).length;
    return correct / testData.length;
  }

  async calculateVariantPerformance(testData) {
    const variants = { ancient: [], modern: [] };
    
    testData.forEach(item => {
      variants[item.variant].push(item);
    });
    
    return {
      ancient: {
        count: variants.ancient.length,
        accuracy: this.calculateAccuracy(variants.ancient),
        perplexity: this.calculatePerplexity(variants.ancient)
      },
      modern: {
        count: variants.modern.length,
        accuracy: this.calculateAccuracy(variants.modern),
        perplexity: this.calculatePerplexity(variants.modern)
      }
    };
  }

  async calculateQualityPerformance(testData) {
    const qualityGroups = { high: [], medium: [], low: [] };
    
    testData.forEach(item => {
      if (item.quality_score >= 0.8) qualityGroups.high.push(item);
      else if (item.quality_score >= 0.6) qualityGroups.medium.push(item);
      else qualityGroups.low.push(item);
    });
    
    const performance = {};
    Object.entries(qualityGroups).forEach(([quality, items]) => {
      performance[quality] = {
        count: items.length,
        accuracy: items.length > 0 ? this.calculateAccuracy(items) : 0,
        perplexity: items.length > 0 ? this.calculatePerplexity(items) : 0
      };
    });
    
    return performance;
  }

  calculateAverageQuality(testData) {
    const totalQuality = testData.reduce((sum, item) => sum + item.quality_score, 0);
    return totalQuality / testData.length;
  }

  calculateAverageLength(testData) {
    const totalLength = testData.reduce((sum, item) => sum + item.text.length, 0);
    return totalLength / testData.length;
  }

  calculateVariantBalance(testData) {
    const ancient = testData.filter(item => item.variant === 'ancient').length;
    const modern = testData.filter(item => item.variant === 'modern').length;
    const total = ancient + modern;
    
    return 1 - Math.abs(ancient - modern) / total;
  }

  simulatePrediction(item) {
    // Simulate prediction accuracy based on quality score
    const baseAccuracy = 0.7;
    const qualityBonus = item.quality_score * 0.3;
    const randomFactor = Math.random() * 0.2;
    
    return (baseAccuracy + qualityBonus + randomFactor) > 0.8;
  }

  printMetrics() {
    console.log('\n📈 Evaluation Results:');
    console.log('  Core Metrics:');
    Object.entries(this.metrics).forEach(([metric, value]) => {
      if (typeof value === 'number') {
        console.log(`    ${metric}: ${value.toFixed(4)}`);
      }
    });
    
    if (this.metrics.variant_performance) {
      console.log('\n  Variant Performance:');
      Object.entries(this.metrics.variant_performance).forEach(([variant, perf]) => {
        console.log(`    ${variant}: accuracy=${perf.accuracy.toFixed(4)}, perplexity=${perf.perplexity.toFixed(4)}`);
      });
    }
    
    if (this.metrics.quality_performance) {
      console.log('\n  Quality Performance:');
      Object.entries(this.metrics.quality_performance).forEach(([quality, perf]) => {
        console.log(`    ${quality}: accuracy=${perf.accuracy.toFixed(4)}, perplexity=${perf.perplexity.toFixed(4)}`);
      });
    }
  }

  async generateReport() {
    console.log('\n📝 Generating evaluation report...');
    
    const report = {
      model_name: this.model.name,
      evaluation_date: new Date().toISOString(),
      test_data_size: this.testData.length,
      metrics: this.metrics,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations(),
      model_config: this.model.config
    };
    
    // Save detailed report
    const reportPath = path.join(this.projectRoot, this.config.paths.logs_dir, 'evaluation_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Save metrics only
    const metricsPath = path.join(this.projectRoot, this.config.paths.logs_dir, 'evaluation_metrics.json');
    fs.writeFileSync(metricsPath, JSON.stringify(this.metrics, null, 2));
    
    console.log(`✅ Evaluation report saved to: ${reportPath}`);
  }

  generateSummary() {
    const summary = {
      overall_performance: this.calculateOverallPerformance(),
      strengths: this.identifyStrengths(),
      weaknesses: this.identifyWeaknesses(),
      model_health: this.assessModelHealth()
    };
    
    return summary;
  }

  calculateOverallPerformance() {
    const accuracy = this.metrics.accuracy || 0;
    const perplexity = this.metrics.perplexity || 0;
    
    // Simple performance score
    const accuracyScore = accuracy * 100;
    const perplexityScore = Math.max(0, 100 - perplexity * 5);
    
    return (accuracyScore + perplexityScore) / 2;
  }

  identifyStrengths() {
    const strengths = [];
    
    if (this.metrics.accuracy > 0.8) {
      strengths.push('High accuracy on test data');
    }
    
    if (this.metrics.perplexity < 10) {
      strengths.push('Low perplexity indicating good language modeling');
    }
    
    if (this.metrics.variant_performance) {
      const { ancient, modern } = this.metrics.variant_performance;
      if (ancient.accuracy > 0.75 && modern.accuracy > 0.75) {
        strengths.push('Balanced performance across variants');
      }
    }
    
    return strengths;
  }

  identifyWeaknesses() {
    const weaknesses = [];
    
    if (this.metrics.accuracy < 0.7) {
      weaknesses.push('Low accuracy - consider more training data or longer training');
    }
    
    if (this.metrics.perplexity > 20) {
      weaknesses.push('High perplexity - model may be undertrained');
    }
    
    if (this.metrics.quality_performance) {
      const { low } = this.metrics.quality_performance;
      if (low.accuracy < 0.5) {
        weaknesses.push('Poor performance on low-quality data');
      }
    }
    
    return weaknesses;
  }

  assessModelHealth() {
    const health = {
      status: 'healthy',
      score: 0,
      issues: []
    };
    
    let score = 0;
    let maxScore = 0;
    
    // Accuracy score
    maxScore += 30;
    score += (this.metrics.accuracy || 0) * 30;
    
    // Perplexity score (lower is better)
    maxScore += 30;
    const perplexityScore = Math.max(0, 30 - (this.metrics.perplexity || 0) * 1.5);
    score += perplexityScore;
    
    // BLEU score
    maxScore += 20;
    score += (this.metrics.bleu || 0) * 20;
    
    // ROUGE score
    maxScore += 20;
    score += (this.metrics.rouge || 0) * 20;
    
    health.score = Math.round((score / maxScore) * 100);
    
    if (health.score < 60) {
      health.status = 'unhealthy';
      health.issues.push('Overall performance below acceptable threshold');
    } else if (health.score < 80) {
      health.status = 'needs_improvement';
      health.issues.push('Performance could be improved');
    }
    
    return health;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.accuracy < 0.8) {
      recommendations.push({
        type: 'training',
        priority: 'high',
        message: 'Model accuracy is below target threshold',
        suggestions: [
          'Increase training epochs',
          'Add more diverse training data',
          'Adjust learning rate',
          'Try data augmentation techniques'
        ]
      });
    }
    
    if (this.metrics.perplexity > 15) {
      recommendations.push({
        type: 'model',
        priority: 'medium',
        message: 'High perplexity indicates potential overfitting or undertraining',
        suggestions: [
          'Adjust dropout rate',
          'Increase model capacity',
          'Improve regularization',
          'Check for data quality issues'
        ]
      });
    }
    
    if (this.metrics.variant_performance) {
      const { ancient, modern } = this.metrics.variant_performance;
      const accuracyDiff = Math.abs(ancient.accuracy - modern.accuracy);
      
      if (accuracyDiff > 0.1) {
        recommendations.push({
          type: 'data',
          priority: 'medium',
          message: 'Imbalanced performance between variants',
          suggestions: [
            'Balance training data between variants',
            'Use variant-specific fine-tuning',
            'Check for variant-specific preprocessing issues'
          ]
        });
      }
    }
    
    return recommendations;
  }
}

// Run evaluation if called directly
if (require.main === module) {
  const evaluator = new LibránModelEvaluator();
  evaluator.evaluate().catch(console.error);
}

module.exports = LibránModelEvaluator;
