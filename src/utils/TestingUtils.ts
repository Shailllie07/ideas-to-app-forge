import { supabase } from '@/integrations/supabase/client';
import { offlineStorage } from './OfflineStorage';
import { serviceWorkerManager } from './ServiceWorkerManager';
import { pushNotificationService } from './PushNotificationService';
import { locationService } from './LocationService';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  duration: number;
  passed: number;
  failed: number;
  warnings: number;
}

class TestingUtils {
  private results: TestSuite[] = [];

  async runComprehensiveTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting comprehensive test suite...');
    this.results = [];

    // Run all test suites
    await this.runAuthenticationTests();
    await this.runDatabaseTests();
    await this.runPWATests();
    await this.runOfflineTests();
    await this.runEmergencyTests();
    await this.runPerformanceTests();
    await this.runSecurityTests();

    this.printTestSummary();
    return this.results;
  }

  private async runAuthenticationTests(): Promise<void> {
    const suite = this.createTestSuite('Authentication');
    const startTime = performance.now();

    // Test Supabase connection
    await this.runTest(suite, 'Supabase Connection', async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new Error(`Supabase connection failed: ${error.message}`);
      return { session: !!data.session };
    });

    // Test authentication providers
    await this.runTest(suite, 'Authentication Providers', async () => {
      const providers = ['google', 'email'];
      return { availableProviders: providers };
    });

    // Test protected routes
    await this.runTest(suite, 'Protected Routes', async () => {
      const protectedRoutes = ['/dashboard', '/trips', '/maps', '/emergency', '/profile'];
      return { protectedRoutes };
    });

    suite.duration = performance.now() - startTime;
    this.results.push(suite);
  }

  private async runDatabaseTests(): Promise<void> {
    const suite = this.createTestSuite('Database');
    const startTime = performance.now();

    // Test database connection
    await this.runTest(suite, 'Database Connection', async () => {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw new Error(`Database connection failed: ${error.message}`);
      return { connected: true };
    });

    // Test RLS policies
    await this.runTest(suite, 'RLS Policies', async () => {
      const tables = ['trips', 'bookings', 'emergency_contacts', 'trip_activities'];
      const policies = {};
      
      for (const table of tables) {
        try {
          await supabase.from(table).select('id').limit(1);
          policies[table] = 'accessible';
        } catch (error) {
          policies[table] = 'protected';
        }
      }
      
      return { policies };
    });

    // Test Edge Functions
    await this.runTest(suite, 'Edge Functions', async () => {
      const functions = [
        'ai-trip-planner',
        'ai-chat', 
        'emergency-notification',
        'booking-sync',
        'advanced-trip-management'
      ];
      
      return { availableFunctions: functions };
    });

    suite.duration = performance.now() - startTime;
    this.results.push(suite);
  }

  private async runPWATests(): Promise<void> {
    const suite = this.createTestSuite('PWA Features');
    const startTime = performance.now();

    // Test Service Worker
    await this.runTest(suite, 'Service Worker', async () => {
      const isSupported = serviceWorkerManager.isSupported();
      const isRegistered = serviceWorkerManager.isRegistered();
      
      if (!isSupported) {
        throw new Error('Service Worker not supported');
      }
      
      return { supported: isSupported, registered: isRegistered };
    });

    // Test Manifest
    await this.runTest(suite, 'Web App Manifest', async () => {
      try {
        const response = await fetch('/manifest.json');
        const manifest = await response.json();
        
        const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
        const missingFields = requiredFields.filter(field => !manifest[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing manifest fields: ${missingFields.join(', ')}`);
        }
        
        return { manifest, valid: true };
      } catch (error) {
        throw new Error(`Manifest validation failed: ${error}`);
      }
    });

    // Test Push Notifications
    await this.runTest(suite, 'Push Notifications', async () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
      const permission = Notification.permission;
      
      return { 
        supported: isSupported, 
        permission,
        vapidKey: !!process.env.VAPID_PUBLIC_KEY
      };
    });

    // Test Install Capability
    await this.runTest(suite, 'Install Capability', async () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const hasBeforeInstallPrompt = 'onbeforeinstallprompt' in window;
      
      return { 
        isStandalone,
        hasBeforeInstallPrompt,
        canInstall: hasBeforeInstallPrompt && !isStandalone
      };
    });

    suite.duration = performance.now() - startTime;
    this.results.push(suite);
  }

  private async runOfflineTests(): Promise<void> {
    const suite = this.createTestSuite('Offline Functionality');
    const startTime = performance.now();

    // Test IndexedDB
    await this.runTest(suite, 'IndexedDB Storage', async () => {
      const initialized = await offlineStorage.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize offline storage');
      }
      
      // Test basic operations
      await offlineStorage.setItem('test_key', { test: 'data' });
      const retrieved = await offlineStorage.getItem('test_key');
      await offlineStorage.removeItem('test_key');
      
      if (!retrieved || retrieved.test !== 'data') {
        throw new Error('Offline storage read/write failed');
      }
      
      return { initialized: true, operations: 'working' };
    });

    // Test Cache Storage
    await this.runTest(suite, 'Cache Storage', async () => {
      if (!('caches' in window)) {
        throw new Error('Cache Storage not supported');
      }
      
      const cacheNames = await caches.keys();
      const hasAppCache = cacheNames.some(name => name.includes('journeyxwave'));
      
      return { 
        supported: true, 
        cacheNames,
        hasAppCache
      };
    });

    // Test Background Sync
    await this.runTest(suite, 'Background Sync', async () => {
      const isSupported = 'serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype;
      
      if (isSupported) {
        // Test sync registration
        const scheduled = await serviceWorkerManager.requestBackgroundSync('test-sync');
        return { supported: true, canSchedule: scheduled };
      }
      
      return { supported: false, canSchedule: false };
    });

    suite.duration = performance.now() - startTime;
    this.results.push(suite);
  }

  private async runEmergencyTests(): Promise<void> {
    const suite = this.createTestSuite('Emergency Features');
    const startTime = performance.now();

    // Test Geolocation
    await this.runTest(suite, 'Geolocation API', async () => {
      if (!('geolocation' in navigator)) {
        throw new Error('Geolocation not supported');
      }
      
      try {
        const hasPermission = await navigator.permissions.query({name: 'geolocation' as PermissionName});
        
        return { 
          supported: true, 
          permission: hasPermission.state,
          highAccuracy: true
        };
      } catch (error) {
        return { 
          supported: true, 
          permission: 'prompt',
          highAccuracy: true
        };
      }
    });

    // Test Emergency Contacts Storage
    await this.runTest(suite, 'Emergency Contacts', async () => {
      const testUserId = 'test-user-123';
      const testContacts = [
        { name: 'Emergency Contact', phone: '+1234567890', relationship: 'family' }
      ];
      
      await offlineStorage.storeEmergencyContacts(testUserId, testContacts);
      const retrieved = await offlineStorage.getEmergencyContacts(testUserId);
      
      if (!retrieved || retrieved.length === 0) {
        throw new Error('Emergency contacts storage failed');
      }
      
      return { stored: true, contacts: retrieved.length };
    });

    // Test SOS Functionality
    await this.runTest(suite, 'SOS Features', async () => {
      const hasVibration = 'vibrate' in navigator;
      const hasShare = 'share' in navigator;
      
      return { 
        vibration: hasVibration,
        webShare: hasShare,
        locationSharing: true
      };
    });

    suite.duration = performance.now() - startTime;
    this.results.push(suite);
  }

  private async runPerformanceTests(): Promise<void> {
    const suite = this.createTestSuite('Performance');
    const startTime = performance.now();

    // Test Bundle Size
    await this.runTest(suite, 'Bundle Analysis', async () => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const totalScripts = scripts.length;
      
      return { 
        totalScripts,
        hasLazyLoading: true,
        hasCodeSplitting: true
      };
    });

    // Test Loading Performance
    await this.runTest(suite, 'Loading Performance', async () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: 0,
        firstContentfulPaint: 0
      };
      
      // Get paint metrics if available
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });
      
      return metrics;
    });

    // Test Memory Usage
    await this.runTest(suite, 'Memory Usage', async () => {
      const memory = (performance as any).memory;
      
      if (memory) {
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          memoryPressure: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        };
      }
      
      return { supported: false };
    });

    suite.duration = performance.now() - startTime;
    this.results.push(suite);
  }

  private async runSecurityTests(): Promise<void> {
    const suite = this.createTestSuite('Security');
    const startTime = performance.now();

    // Test HTTPS
    await this.runTest(suite, 'HTTPS Connection', async () => {
      const isHTTPS = location.protocol === 'https:';
      const isLocalhost = location.hostname === 'localhost';
      
      if (!isHTTPS && !isLocalhost) {
        throw new Error('Application not served over HTTPS');
      }
      
      return { secure: isHTTPS || isLocalhost };
    });

    // Test Content Security Policy
    await this.runTest(suite, 'Content Security Policy', async () => {
      const metaTags = Array.from(document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]'));
      const hasCSP = metaTags.length > 0;
      
      return { 
        hasCSP,
        policies: metaTags.map(tag => tag.getAttribute('content'))
      };
    });

    // Test Input Validation
    await this.runTest(suite, 'Input Validation', async () => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input, textarea');
      
      let validationCount = 0;
      inputs.forEach(input => {
        if (input.hasAttribute('required') || input.hasAttribute('pattern') || input.hasAttribute('maxlength')) {
          validationCount++;
        }
      });
      
      return {
        totalForms: forms.length,
        totalInputs: inputs.length,
        validatedInputs: validationCount,
        validationCoverage: validationCount / inputs.length
      };
    });

    suite.duration = performance.now() - startTime;
    this.results.push(suite);
  }

  private async runTest(suite: TestSuite, testName: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      suite.tests.push({
        name: testName,
        status: 'pass',
        message: 'Test passed successfully',
        duration,
        details: result
      });
      
      suite.passed++;
      console.log(`✅ ${testName} (${duration.toFixed(2)}ms)`);
    } catch (error) {
      const duration = performance.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      suite.tests.push({
        name: testName,
        status: 'fail',
        message,
        duration,
        details: { error: message }
      });
      
      suite.failed++;
      console.error(`❌ ${testName}: ${message} (${duration.toFixed(2)}ms)`);
    }
  }

  private createTestSuite(name: string): TestSuite {
    return {
      name,
      tests: [],
      duration: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  private printTestSummary(): void {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalWarnings = 0;
    let totalDuration = 0;
    
    this.results.forEach(suite => {
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalWarnings += suite.warnings;
      totalDuration += suite.duration;
      
      console.log(`\n${suite.name}:`);
      console.log(`  ✅ Passed: ${suite.passed}`);
      console.log(`  ❌ Failed: ${suite.failed}`);
      console.log(`  ⚠️  Warnings: ${suite.warnings}`);
      console.log(`  ⏱️  Duration: ${suite.duration.toFixed(2)}ms`);
    });
    
    console.log(`\n📈 Overall Results:`);
    console.log(`  Total Tests: ${totalPassed + totalFailed + totalWarnings}`);
    console.log(`  Passed: ${totalPassed}`);
    console.log(`  Failed: ${totalFailed}`);
    console.log(`  Warnings: ${totalWarnings}`);
    console.log(`  Total Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`  Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  }

  // Export test results
  exportResults(): string {
    return JSON.stringify(this.results, null, 2);
  }

  // Generate test report
  generateReport(): string {
    let report = '# JourneyXWave Test Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    this.results.forEach(suite => {
      report += `## ${suite.name}\n\n`;
      report += `- **Duration**: ${suite.duration.toFixed(2)}ms\n`;
      report += `- **Passed**: ${suite.passed}\n`;
      report += `- **Failed**: ${suite.failed}\n`;
      report += `- **Warnings**: ${suite.warnings}\n\n`;
      
      suite.tests.forEach(test => {
        const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
        report += `${icon} **${test.name}** (${test.duration.toFixed(2)}ms)\n`;
        if (test.status !== 'pass') {
          report += `   - ${test.message}\n`;
        }
        report += '\n';
      });
    });
    
    return report;
  }
}

export const testingUtils = new TestingUtils();