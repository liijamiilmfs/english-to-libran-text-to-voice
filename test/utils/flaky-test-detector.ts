import { vi } from 'vitest'

export class FlakyTestDetector {
  private static instance: FlakyTestDetector
  private testResults = new Map<string, { passes: number; failures: number; total: number }>()

  static getInstance(): FlakyTestDetector {
    if (!FlakyTestDetector.instance) {
      FlakyTestDetector.instance = new FlakyTestDetector()
    }
    return FlakyTestDetector.instance
  }

  async runTestWithRetries<T>(
    testFn: () => Promise<T>,
    testName: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await testFn()
        this.recordTestResult(testName, true)
        return result
      } catch (error) {
        lastError = error as Error
        this.recordTestResult(testName, false)
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await this.delay(delay)
        }
      }
    }
    
    throw lastError || new Error('Test failed after all retries')
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private recordTestResult(testName: string, passed: boolean): void {
    const current = this.testResults.get(testName) || { passes: 0, failures: 0, total: 0 }
    
    if (passed) {
      current.passes++
    } else {
      current.failures++
    }
    current.total++
    
    this.testResults.set(testName, current)
  }

  getTestStats(testName: string): { passes: number; failures: number; total: number; successRate: number } {
    const stats = this.testResults.get(testName) || { passes: 0, failures: 0, total: 0 }
    return {
      ...stats,
      successRate: stats.total > 0 ? stats.passes / stats.total : 0
    }
  }

  getFlakyTests(threshold: number = 0.8): string[] {
    const flakyTests: string[] = []
    
    this.testResults.forEach((stats, testName) => {
      const successRate = stats.total > 0 ? stats.passes / stats.total : 0
      if (successRate < threshold && stats.total > 1) {
        flakyTests.push(testName)
      }
    })
    
    return flakyTests
  }

  clearStats(): void {
    this.testResults.clear()
  }

  getAllStats(): Map<string, { passes: number; failures: number; total: number; successRate: number }> {
    const allStats = new Map<string, { passes: number; failures: number; total: number; successRate: number }>()
    
    this.testResults.forEach((stats, testName) => {
      allStats.set(testName, this.getTestStats(testName))
    })
    
    return allStats
  }
}

// Decorator for marking tests as potentially flaky
export function flakyTest(maxRetries: number = 3) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const detector = FlakyTestDetector.getInstance()
      const testName = `${target.constructor.name}.${propertyKey}`
      
      return detector.runTestWithRetries(
        () => originalMethod.apply(this, args),
        testName,
        maxRetries
      )
    }
    
    return descriptor
  }
}

// Utility function for running tests with retries
export async function runWithRetries<T>(
  testFn: () => Promise<T>,
  testName: string,
  maxRetries: number = 3
): Promise<T> {
  const detector = FlakyTestDetector.getInstance()
  return detector.runTestWithRetries(testFn, testName, maxRetries)
}
