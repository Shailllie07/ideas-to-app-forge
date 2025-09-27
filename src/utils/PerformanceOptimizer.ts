import { performanceMonitor } from './LazyLoader';

interface PerformanceMetrics {
  navigation: PerformanceNavigationTiming;
  resources: PerformanceResourceTiming[];
  paint: PerformancePaintTiming[];
  memory?: any;
  connection?: any;
}

interface OptimizationSuggestion {
  type: 'critical' | 'important' | 'minor';
  category: 'loading' | 'runtime' | 'memory' | 'network';
  issue: string;
  suggestion: string;
  impact: string;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics | null = null;
  private suggestions: OptimizationSuggestion[] = [];

  async analyzePerformance(): Promise<{
    metrics: PerformanceMetrics;
    suggestions: OptimizationSuggestion[];
    score: number;
  }> {
    console.log('🚀 Starting performance analysis...');
    
    this.collectMetrics();
    this.analyzeCoreWebVitals();
    this.analyzeResourceLoading();
    this.analyzeMemoryUsage();
    this.analyzeNetworkEfficiency();
    
    const score = this.calculatePerformanceScore();
    
    console.log(`📊 Performance Score: ${score}/100`);
    this.logSuggestions();
    
    return {
      metrics: this.metrics!,
      suggestions: this.suggestions,
      score
    };
  }

  private collectMetrics(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const paint = performance.getEntriesByType('paint') as PerformancePaintTiming[];
    
    this.metrics = {
      navigation,
      resources,
      paint,
      memory: (performance as any).memory,
      connection: (navigator as any).connection
    };
  }

  private analyzeCoreWebVitals(): void {
    if (!this.metrics) return;
    
    const { navigation, paint } = this.metrics;
    
    // First Contentful Paint (FCP)
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    if (fcp && fcp.startTime > 1800) { // 1.8 seconds
      this.suggestions.push({
        type: 'critical',
        category: 'loading',
        issue: `First Contentful Paint is slow (${fcp.startTime.toFixed(0)}ms)`,
        suggestion: 'Optimize critical CSS, reduce blocking resources, use resource hints',
        impact: 'Users experience slower initial page rendering'
      });
    }

    // Largest Contentful Paint (LCP) - approximated
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    if (domContentLoaded > 2500) {
      this.suggestions.push({
        type: 'critical',
        category: 'loading',
        issue: `DOM Content Loaded is slow (${domContentLoaded.toFixed(0)}ms)`,
        suggestion: 'Reduce JavaScript execution time, optimize images, implement lazy loading',
        impact: 'Main content takes too long to become visible'
      });
    }

    // Time to Interactive (TTI) - approximated
    const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
    if (loadComplete > 5000) {
      this.suggestions.push({
        type: 'important',
        category: 'runtime',
        issue: `Page load is slow (${loadComplete.toFixed(0)}ms)`,
        suggestion: 'Code splitting, tree shaking, reduce bundle size',
        impact: 'Page becomes interactive slowly'
      });
    }
  }

  private analyzeResourceLoading(): void {
    if (!this.metrics) return;
    
    const { resources } = this.metrics;
    
    // Large resources
    const largeResources = resources.filter(resource => 
      resource.transferSize > 1000000 // 1MB
    );
    
    if (largeResources.length > 0) {
      this.suggestions.push({
        type: 'important',
        category: 'network',
        issue: `${largeResources.length} large resources detected`,
        suggestion: 'Compress images, optimize videos, implement progressive loading',
        impact: 'Large files slow down page loading'
      });
    }

    // Too many resources
    const totalResources = resources.length;
    if (totalResources > 100) {
      this.suggestions.push({
        type: 'important',
        category: 'network',
        issue: `Too many HTTP requests (${totalResources})`,
        suggestion: 'Bundle assets, use CSS sprites, implement resource combining',
        impact: 'Many requests increase loading time'
      });
    }

    // Slow resources
    const slowResources = resources.filter(resource => 
      resource.duration > 1000
    );
    
    if (slowResources.length > 0) {
      this.suggestions.push({
        type: 'minor',
        category: 'network',
        issue: `${slowResources.length} slow-loading resources`,
        suggestion: 'Optimize server response times, use CDN, implement caching',
        impact: 'Some resources load slowly'
      });
    }

    // Blocking resources
    const blockingResources = resources.filter(resource => 
      resource.name.includes('.css') || 
      (resource.name.includes('.js') && !resource.name.includes('async'))
    );
    
    if (blockingResources.length > 5) {
      this.suggestions.push({
        type: 'important',
        category: 'loading',
        issue: `${blockingResources.length} potentially blocking resources`,
        suggestion: 'Use async/defer for scripts, inline critical CSS',
        impact: 'Blocking resources delay page rendering'
      });
    }
  }

  private analyzeMemoryUsage(): void {
    if (!this.metrics?.memory) return;
    
    const { memory } = this.metrics;
    const memoryPressure = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (memoryPressure > 0.8) {
      this.suggestions.push({
        type: 'critical',
        category: 'memory',
        issue: `High memory usage (${(memoryPressure * 100).toFixed(1)}%)`,
        suggestion: 'Implement memory cleanup, reduce object creation, use object pooling',
        impact: 'High memory usage can cause crashes and slowdowns'
      });
    } else if (memoryPressure > 0.6) {
      this.suggestions.push({
        type: 'important',
        category: 'memory',
        issue: `Moderate memory usage (${(memoryPressure * 100).toFixed(1)}%)`,
        suggestion: 'Monitor memory leaks, optimize data structures',
        impact: 'Memory usage should be monitored'
      });
    }

    // Check for memory leaks (simplified)
    const heapSize = memory.usedJSHeapSize / (1024 * 1024); // MB
    if (heapSize > 50) {
      this.suggestions.push({
        type: 'important',
        category: 'memory',
        issue: `Large heap size (${heapSize.toFixed(1)}MB)`,
        suggestion: 'Review component unmounting, clear event listeners, optimize caching',
        impact: 'Large heap may indicate memory leaks'
      });
    }
  }

  private analyzeNetworkEfficiency(): void {
    if (!this.metrics?.connection) return;
    
    const { connection } = this.metrics;
    
    // Adapt to connection quality
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
      this.suggestions.push({
        type: 'critical',
        category: 'network',
        issue: 'Slow network connection detected',
        suggestion: 'Implement aggressive caching, reduce payload sizes, optimize for low bandwidth',
        impact: 'Slow connections require special optimization'
      });
    }

    if (connection.saveData) {
      this.suggestions.push({
        type: 'important',
        category: 'network',
        issue: 'Data saver mode detected',
        suggestion: 'Reduce image quality, lazy load non-critical content',
        impact: 'User has limited data - optimize accordingly'
      });
    }
  }

  private calculatePerformanceScore(): number {
    let score = 100;
    
    this.suggestions.forEach(suggestion => {
      switch (suggestion.type) {
        case 'critical':
          score -= 15;
          break;
        case 'important':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  private logSuggestions(): void {
    if (this.suggestions.length === 0) {
      console.log('✅ No performance issues detected!');
      return;
    }
    
    console.log('\n🔧 Performance Suggestions:');
    console.log('============================');
    
    const groupedSuggestions = this.suggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category].push(suggestion);
      return acc;
    }, {} as Record<string, OptimizationSuggestion[]>);
    
    Object.entries(groupedSuggestions).forEach(([category, suggestions]) => {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      suggestions.forEach(suggestion => {
        const icon = suggestion.type === 'critical' ? '🔴' : 
                   suggestion.type === 'important' ? '🟡' : '🟢';
        console.log(`  ${icon} ${suggestion.issue}`);
        console.log(`      💡 ${suggestion.suggestion}`);
        console.log(`      📈 ${suggestion.impact}`);
      });
    });
  }

  // Real-time performance monitoring
  startMonitoring(interval: number = 30000): () => void {
    const intervalId = setInterval(() => {
      this.monitorRuntimePerformance();
    }, interval);
    
    console.log('🔍 Started performance monitoring');
    
    return () => {
      clearInterval(intervalId);
      console.log('⏹️ Stopped performance monitoring');
    };
  }

  private monitorRuntimePerformance(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.duration > 50) { // Long task threshold
              console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          });
        });
        
        observer.observe({entryTypes: ['longtask']});
      } catch (error) {
        // Long task API not supported
      }
    }
    
    // Monitor memory usage
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024);
      
      if (memoryUsage > 100) { // 100MB threshold
        console.warn(`⚠️ High memory usage: ${memoryUsage.toFixed(1)}MB`);
      }
    }
  }

  // Performance budget checker
  checkPerformanceBudget(): {
    budget: Record<string, number>;
    current: Record<string, number>;
    violations: string[];
  } {
    const budget = {
      fcp: 1800, // First Contentful Paint (ms)
      lcp: 2500, // Largest Contentful Paint (ms)
      tti: 3800, // Time to Interactive (ms)
      cls: 0.1,  // Cumulative Layout Shift
      fid: 100,  // First Input Delay (ms)
      totalSize: 2000000, // Total page size (bytes)
      scripts: 1000000,   // Script size (bytes)
      images: 1000000     // Image size (bytes)
    };
    
    const current = this.getCurrentMetrics();
    const violations: string[] = [];
    
    Object.entries(budget).forEach(([metric, limit]) => {
      if (current[metric] && current[metric] > limit) {
        violations.push(`${metric}: ${current[metric]} > ${limit}`);
      }
    });
    
    return { budget, current, violations };
  }

  private getCurrentMetrics(): Record<string, number> {
    if (!this.metrics) return {};
    
    const { navigation, paint, resources } = this.metrics;
    
    const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
    const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    const scriptSize = resources
      .filter(resource => resource.name.includes('.js'))
      .reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    const imageSize = resources
      .filter(resource => /\.(jpg|jpeg|png|gif|webp|svg)/.test(resource.name))
      .reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    
    return {
      fcp: fcp?.startTime || 0,
      lcp: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      tti: navigation.loadEventEnd - navigation.loadEventStart,
      totalSize,
      scripts: scriptSize,
      images: imageSize
    };
  }

  // Generate performance report
  generateReport(): string {
    const analysis = this.metrics;
    if (!analysis) return 'No performance data available';
    
    let report = '# Performance Analysis Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    // Core metrics
    report += '## Core Web Vitals\n\n';
    const paint = analysis.paint.find(entry => entry.name === 'first-contentful-paint');
    if (paint) {
      report += `- **First Contentful Paint**: ${paint.startTime.toFixed(0)}ms\n`;
    }
    
    const domContentLoaded = analysis.navigation.domContentLoadedEventEnd - 
                            analysis.navigation.domContentLoadedEventStart;
    report += `- **DOM Content Loaded**: ${domContentLoaded.toFixed(0)}ms\n`;
    
    const loadComplete = analysis.navigation.loadEventEnd - analysis.navigation.loadEventStart;
    report += `- **Load Complete**: ${loadComplete.toFixed(0)}ms\n\n`;
    
    // Resource analysis
    report += '## Resource Analysis\n\n';
    report += `- **Total Resources**: ${analysis.resources.length}\n`;
    
    const totalSize = analysis.resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    report += `- **Total Size**: ${(totalSize / (1024 * 1024)).toFixed(2)}MB\n\n`;
    
    // Memory usage
    if (analysis.memory) {
      report += '## Memory Usage\n\n';
      report += `- **Used Heap**: ${(analysis.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)}MB\n`;
      report += `- **Total Heap**: ${(analysis.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)}MB\n`;
      report += `- **Heap Limit**: ${(analysis.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)}MB\n\n`;
    }
    
    // Suggestions
    if (this.suggestions.length > 0) {
      report += '## Optimization Suggestions\n\n';
      this.suggestions.forEach((suggestion, index) => {
        const priority = suggestion.type === 'critical' ? '🔴' : 
                        suggestion.type === 'important' ? '🟡' : '🟢';
        report += `${index + 1}. ${priority} **${suggestion.issue}**\n`;
        report += `   - Suggestion: ${suggestion.suggestion}\n`;
        report += `   - Impact: ${suggestion.impact}\n\n`;
      });
    }
    
    return report;
  }
}

export const performanceOptimizer = new PerformanceOptimizer();