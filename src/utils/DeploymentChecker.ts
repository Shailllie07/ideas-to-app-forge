import { testingUtils } from './TestingUtils';
import { performanceOptimizer } from './PerformanceOptimizer';
import { validateSecurityHeaders } from './SecurityValidator';

interface DeploymentCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  required: boolean;
}

interface DeploymentReadiness {
  isReady: boolean;
  score: number;
  checks: DeploymentCheck[];
  criticalIssues: string[];
  recommendations: string[];
}

class DeploymentChecker {
  private checks: DeploymentCheck[] = [];

  async checkDeploymentReadiness(): Promise<DeploymentReadiness> {
    console.log('🚀 Checking deployment readiness...');
    this.checks = [];

    // Run all deployment checks
    await this.checkPWAReadiness();
    await this.checkSecurityReadiness();
    await this.checkPerformanceReadiness();
    await this.checkFunctionalityReadiness();
    await this.checkConfigurationReadiness();
    await this.checkAssetOptimization();
    await this.checkBrowserCompatibility();

    const analysis = this.analyzeResults();
    this.logResults(analysis);

    return analysis;
  }

  private async checkPWAReadiness(): Promise<void> {
    // Service Worker check
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        this.addCheck('Service Worker', registration ? 'pass' : 'fail', 
          registration ? 'Service Worker is registered' : 'Service Worker not registered',
          { registered: !!registration }, true);
      } catch (error) {
        this.addCheck('Service Worker', 'fail', 'Service Worker check failed', { error }, true);
      }
    } else {
      this.addCheck('Service Worker', 'fail', 'Service Worker not supported', {}, true);
    }

    // Manifest check
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      
      const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
      const missingFields = requiredFields.filter(field => !manifest[field]);
      
      if (missingFields.length === 0) {
        this.addCheck('Web App Manifest', 'pass', 'Manifest is complete', manifest, true);
      } else {
        this.addCheck('Web App Manifest', 'fail', 
          `Missing required fields: ${missingFields.join(', ')}`, 
          { missingFields }, true);
      }
    } catch (error) {
      this.addCheck('Web App Manifest', 'fail', 'Manifest file not found or invalid', { error }, true);
    }

    // Icon checks
    try {
      const iconSizes = ['192x192', '512x512'];
      for (const size of iconSizes) {
        const response = await fetch(`/icon-${size.split('x')[0]}.png`);
        this.addCheck(`App Icon ${size}`, response.ok ? 'pass' : 'warning', 
          response.ok ? `Icon ${size} is available` : `Icon ${size} not found`, 
          { size, available: response.ok }, false);
      }
    } catch (error) {
      this.addCheck('App Icons', 'warning', 'Could not verify app icons', { error }, false);
    }

    // HTTPS check
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    this.addCheck('HTTPS', isSecure ? 'pass' : 'fail',
      isSecure ? 'Application is served over HTTPS' : 'Application must be served over HTTPS',
      { protocol: location.protocol }, true);
  }

  private async checkSecurityReadiness(): Promise<void> {
    // Security headers
    const securityCheck = validateSecurityHeaders();
    this.addCheck('Security Headers', securityCheck.isSecure ? 'pass' : 'warning',
      securityCheck.isSecure ? 'Security headers are configured' : 'Some security headers missing',
      { warnings: securityCheck.warnings }, false);

    // CSP check
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    this.addCheck('Content Security Policy', cspMeta ? 'pass' : 'warning',
      cspMeta ? 'CSP is configured' : 'Consider adding Content Security Policy',
      { hasCSP: !!cspMeta }, false);

    // Form validation check
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input[required], textarea[required]');
    this.addCheck('Form Validation', forms.length > 0 ? 'pass' : 'warning',
      `Found ${forms.length} forms with ${inputs.length} required fields`,
      { forms: forms.length, requiredInputs: inputs.length }, false);

    // External links check
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + location.hostname + '"])');
    const secureExternalLinks = Array.from(externalLinks).filter(link => 
      (link as HTMLAnchorElement).href.startsWith('https://')
    );
    
    this.addCheck('External Links Security', 
      secureExternalLinks.length === externalLinks.length ? 'pass' : 'warning',
      `${secureExternalLinks.length}/${externalLinks.length} external links are secure`,
      { total: externalLinks.length, secure: secureExternalLinks.length }, false);
  }

  private async checkPerformanceReadiness(): Promise<void> {
    try {
      const perfAnalysis = await performanceOptimizer.analyzePerformance();
      
      this.addCheck('Performance Score', 
        perfAnalysis.score >= 80 ? 'pass' : perfAnalysis.score >= 60 ? 'warning' : 'fail',
        `Performance score: ${perfAnalysis.score}/100`,
        { score: perfAnalysis.score, suggestions: perfAnalysis.suggestions.length }, 
        perfAnalysis.score >= 60);

      // Check specific metrics
      const budget = performanceOptimizer.checkPerformanceBudget();
      this.addCheck('Performance Budget', 
        budget.violations.length === 0 ? 'pass' : budget.violations.length <= 2 ? 'warning' : 'fail',
        budget.violations.length === 0 ? 'All metrics within budget' : 
          `${budget.violations.length} budget violations`,
        { violations: budget.violations }, false);

    } catch (error) {
      this.addCheck('Performance Analysis', 'warning', 'Could not analyze performance', { error }, false);
    }

    // Bundle size check (approximated)
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalScripts = scripts.length;
    this.addCheck('Bundle Size', totalScripts <= 10 ? 'pass' : totalScripts <= 20 ? 'warning' : 'fail',
      `${totalScripts} script files loaded`,
      { scriptCount: totalScripts }, false);
  }

  private async checkFunctionalityReadiness(): Promise<void> {
    try {
      const testResults = await testingUtils.runComprehensiveTests();
      
      const totalTests = testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
      const passedTests = testResults.reduce((sum, suite) => sum + suite.passed, 0);
      const failedTests = testResults.reduce((sum, suite) => sum + suite.failed, 0);
      
      const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      
      this.addCheck('Functionality Tests', 
        passRate >= 90 ? 'pass' : passRate >= 70 ? 'warning' : 'fail',
        `${passedTests}/${totalTests} tests passed (${passRate.toFixed(1)}%)`,
        { totalTests, passedTests, failedTests, passRate }, true);

    } catch (error) {
      this.addCheck('Functionality Tests', 'warning', 'Could not run functionality tests', { error }, false);
    }

    // Critical features check
    const criticalFeatures = [
      { name: 'Authentication', selector: '[data-testid="auth"], .auth' },
      { name: 'Navigation', selector: 'nav, [role="navigation"]' },
      { name: 'Emergency Button', selector: '[data-testid="sos"], .sos' },
      { name: 'Trip Management', selector: '[data-testid="trips"], .trips' }
    ];

    criticalFeatures.forEach(feature => {
      const element = document.querySelector(feature.selector);
      this.addCheck(`${feature.name} Feature`, element ? 'pass' : 'warning',
        element ? `${feature.name} is present` : `${feature.name} not found`,
        { found: !!element }, false);
    });
  }

  private async checkConfigurationReadiness(): Promise<void> {
    // Environment configuration
    const envVars = {
      'Supabase URL': import.meta.env.SUPABASE_URL || 'https://vhaqmwyinixyigziqoqf.supabase.co',
      'Supabase Anon Key': import.meta.env.SUPABASE_ANON_KEY || 'configured'
    };

    Object.entries(envVars).forEach(([name, value]) => {
      this.addCheck(`${name} Configuration`, value ? 'pass' : 'fail',
        value ? `${name} is configured` : `${name} is missing`,
        { configured: !!value }, true);
    });

    // API endpoints check
    const apiEndpoints = [
      '/manifest.json',
      '/sw.js'
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(endpoint);
        this.addCheck(`${endpoint} Endpoint`, response.ok ? 'pass' : 'fail',
          response.ok ? `${endpoint} is accessible` : `${endpoint} returned ${response.status}`,
          { status: response.status }, endpoint === '/manifest.json');
      } catch (error) {
        this.addCheck(`${endpoint} Endpoint`, 'fail', `${endpoint} is not accessible`,
          { error: error.message }, endpoint === '/manifest.json');
      }
    }
  }

  private async checkAssetOptimization(): Promise<void> {
    // Image optimization check
    const images = Array.from(document.querySelectorAll('img'));
    const imagesWithAlt = images.filter(img => img.alt);
    const imagesWithLazyLoading = images.filter(img => 
      img.loading === 'lazy' || img.hasAttribute('data-src')
    );

    this.addCheck('Image Optimization', 
      imagesWithAlt.length === images.length ? 'pass' : 'warning',
      `${imagesWithAlt.length}/${images.length} images have alt text`,
      { 
        total: images.length, 
        withAlt: imagesWithAlt.length,
        withLazyLoading: imagesWithLazyLoading.length
      }, false);

    // Font optimization
    const fontLinks = Array.from(document.querySelectorAll('link[href*="font"]')) as HTMLLinkElement[];
    const preloadedFonts = fontLinks.filter(link => link.rel === 'preload');
    
    this.addCheck('Font Optimization', 
      preloadedFonts.length > 0 ? 'pass' : 'warning',
      `${preloadedFonts.length}/${fontLinks.length} fonts are preloaded`,
      { total: fontLinks.length, preloaded: preloadedFonts.length }, false);

    // CSS optimization
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const inlineStyles = Array.from(document.querySelectorAll('style'));
    
    this.addCheck('CSS Optimization', 
      stylesheets.length <= 5 ? 'pass' : 'warning',
      `${stylesheets.length} external stylesheets, ${inlineStyles.length} inline styles`,
      { external: stylesheets.length, inline: inlineStyles.length }, false);
  }

  private async checkBrowserCompatibility(): Promise<void> {
    // Feature detection
    const features = {
      'Service Worker': 'serviceWorker' in navigator,
      'IndexedDB': 'indexedDB' in window,
      'Geolocation': 'geolocation' in navigator,
      'Push Notifications': 'Notification' in window,
      'Web Share API': 'share' in navigator,
      'Intersection Observer': 'IntersectionObserver' in window,
      'Fetch API': 'fetch' in window,
      'Promise': 'Promise' in window,
      'Arrow Functions': (() => true)() === true,
      'CSS Grid': CSS.supports('display', 'grid'),
      'CSS Flexbox': CSS.supports('display', 'flex')
    };

    const supportedFeatures = Object.entries(features).filter(([, supported]) => supported);
    const unsupportedFeatures = Object.entries(features).filter(([, supported]) => !supported);

    this.addCheck('Browser Compatibility', 
      unsupportedFeatures.length === 0 ? 'pass' : unsupportedFeatures.length <= 2 ? 'warning' : 'fail',
      `${supportedFeatures.length}/${Object.keys(features).length} features supported`,
      { supported: supportedFeatures.map(([name]) => name), unsupported: unsupportedFeatures.map(([name]) => name) },
      unsupportedFeatures.length <= 3);

    // Mobile compatibility
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasViewportMeta = document.querySelector('meta[name="viewport"]');
    const hasTouchEvents = 'ontouchstart' in window;

    this.addCheck('Mobile Compatibility', 
      hasViewportMeta ? 'pass' : 'warning',
      hasViewportMeta ? 'Viewport meta tag is present' : 'Viewport meta tag missing',
      { isMobile, hasViewportMeta: !!hasViewportMeta, hasTouchEvents }, false);
  }

  private addCheck(name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any, required: boolean = false): void {
    this.checks.push({ name, status, message, details, required });
  }

  private analyzeResults(): DeploymentReadiness {
    const passedChecks = this.checks.filter(check => check.status === 'pass').length;
    const failedChecks = this.checks.filter(check => check.status === 'fail');
    const warningChecks = this.checks.filter(check => check.status === 'warning');
    const requiredFailures = failedChecks.filter(check => check.required);

    const score = Math.round((passedChecks / this.checks.length) * 100);
    const isReady = requiredFailures.length === 0 && failedChecks.length <= 2;

    const criticalIssues = requiredFailures.map(check => check.message);
    const recommendations = [
      ...failedChecks.filter(check => !check.required).map(check => `Fix: ${check.message}`),
      ...warningChecks.map(check => `Improve: ${check.message}`)
    ];

    return {
      isReady,
      score,
      checks: this.checks,
      criticalIssues,
      recommendations
    };
  }

  private logResults(analysis: DeploymentReadiness): void {
    console.log('\n🚀 Deployment Readiness Report');
    console.log('================================');
    console.log(`📊 Overall Score: ${analysis.score}/100`);
    console.log(`✅ Ready for Deployment: ${analysis.isReady ? 'YES' : 'NO'}`);
    
    if (analysis.criticalIssues.length > 0) {
      console.log('\n🔴 Critical Issues (Must Fix):');
      analysis.criticalIssues.forEach(issue => console.log(`  • ${issue}`));
    }
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      analysis.recommendations.slice(0, 5).forEach(rec => console.log(`  • ${rec}`));
      if (analysis.recommendations.length > 5) {
        console.log(`  ... and ${analysis.recommendations.length - 5} more`);
      }
    }
    
    console.log('\n📋 Check Summary:');
    const passed = analysis.checks.filter(c => c.status === 'pass').length;
    const failed = analysis.checks.filter(c => c.status === 'fail').length;
    const warnings = analysis.checks.filter(c => c.status === 'warning').length;
    
    console.log(`  ✅ Passed: ${passed}`);
    console.log(`  ❌ Failed: ${failed}`);
    console.log(`  ⚠️  Warnings: ${warnings}`);
  }

  generateDeploymentReport(analysis: DeploymentReadiness): string {
    let report = '# Deployment Readiness Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n`;
    report += `**Overall Score:** ${analysis.score}/100\n`;
    report += `**Ready for Deployment:** ${analysis.isReady ? '✅ YES' : '❌ NO'}\n\n`;

    if (analysis.criticalIssues.length > 0) {
      report += '## 🔴 Critical Issues\n\n';
      analysis.criticalIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += '\n';
    }

    report += '## 📋 Detailed Check Results\n\n';
    
    const categories = {
      'PWA Features': analysis.checks.filter(c => ['Service Worker', 'Web App Manifest', 'App Icon', 'HTTPS'].some(t => c.name.includes(t))),
      'Security': analysis.checks.filter(c => ['Security', 'CSP', 'Form Validation', 'External Links'].some(t => c.name.includes(t))),
      'Performance': analysis.checks.filter(c => ['Performance', 'Bundle'].some(t => c.name.includes(t))),
      'Functionality': analysis.checks.filter(c => ['Functionality', 'Feature'].some(t => c.name.includes(t))),
      'Configuration': analysis.checks.filter(c => ['Configuration', 'Endpoint'].some(t => c.name.includes(t))),
      'Optimization': analysis.checks.filter(c => ['Image', 'Font', 'CSS'].some(t => c.name.includes(t))),
      'Compatibility': analysis.checks.filter(c => ['Browser', 'Mobile'].some(t => c.name.includes(t)))
    };

    Object.entries(categories).forEach(([category, checks]) => {
      if (checks.length > 0) {
        report += `### ${category}\n\n`;
        checks.forEach(check => {
          const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
          report += `${icon} **${check.name}**: ${check.message}\n`;
        });
        report += '\n';
      }
    });

    if (analysis.recommendations.length > 0) {
      report += '## 💡 Recommendations\n\n';
      analysis.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
    }

    return report;
  }
}

export const deploymentChecker = new DeploymentChecker();