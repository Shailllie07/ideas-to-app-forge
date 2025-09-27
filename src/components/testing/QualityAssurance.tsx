import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Download,
  Zap,
  Shield,
  Settings,
  Monitor,
  Smartphone
} from 'lucide-react';
import { testingUtils } from '@/utils/TestingUtils';
import { performanceOptimizer } from '@/utils/PerformanceOptimizer';
import { deploymentChecker } from '@/utils/DeploymentChecker';

interface TestSuite {
  name: string;
  tests: any[];
  duration: number;
  passed: number;
  failed: number;
  warnings: number;
}

const QualityAssurance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [deploymentData, setDeploymentData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const runFullTestSuite = async () => {
    setIsLoading(true);
    try {
      // Run comprehensive tests
      const tests = await testingUtils.runComprehensiveTests();
      setTestResults(tests);

      // Run performance analysis
      const perf = await performanceOptimizer.analyzePerformance();
      setPerformanceData(perf);

      // Check deployment readiness
      const deployment = await deploymentChecker.checkDeploymentReadiness();
      setDeploymentData(deployment);

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!deploymentData) return;

    const report = deploymentChecker.generateDeploymentReport(deploymentData);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-500';
      case 'fail': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const totalTests = testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
  const totalPassed = testResults.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = testResults.reduce((sum, suite) => sum + suite.failed, 0);
  const overallScore = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quality Assurance Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive testing and deployment readiness</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runFullTestSuite} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
          {deploymentData && (
            <Button variant="outline" onClick={downloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Overall Score</p>
                <p className="text-2xl font-bold">{overallScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Performance</p>
                <p className="text-2xl font-bold">{performanceData?.score || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Security</p>
                <p className="text-2xl font-bold">
                  {deploymentData?.checks?.filter(c => c.name.includes('Security') && c.status === 'pass').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Deployment Ready</p>
                <p className="text-2xl font-bold">
                  {deploymentData?.isReady ? '✅' : '❌'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Suite Summary</CardTitle>
              <CardDescription>
                Overall health of the application across all test categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Total Progress</span>
                    <span>{totalPassed}/{totalTests} tests passed</span>
                  </div>
                  <Progress value={overallScore} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
                      <div className="text-sm text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {testResults.reduce((sum, suite) => sum + suite.warnings, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Warnings</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No test results available. Run tests to see results.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {deploymentData?.criticalIssues && deploymentData.criticalIssues.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Critical Issues</CardTitle>
                <CardDescription>These issues must be resolved before deployment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deploymentData.criticalIssues.map((issue: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          {testResults.map((suite, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{suite.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={suite.failed > 0 ? "destructive" : suite.warnings > 0 ? "secondary" : "default"}>
                      {suite.passed}P {suite.failed}F {suite.warnings}W
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {suite.duration.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {suite.tests.map((test: any, testIndex: number) => (
                      <div key={testIndex} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                        {getStatusIcon(test.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{test.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {test.duration.toFixed(1)}ms
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{test.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analysis</CardTitle>
              <CardDescription>Application performance metrics and optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Performance Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={performanceData.score} className="w-32" />
                      <span className="font-bold">{performanceData.score}/100</span>
                    </div>
                  </div>

                  {performanceData.suggestions && performanceData.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Optimization Suggestions</h4>
                      {performanceData.suggestions.slice(0, 5).map((suggestion: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded bg-muted/30">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            suggestion.type === 'critical' ? 'bg-red-500' :
                            suggestion.type === 'important' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{suggestion.issue}</p>
                            <p className="text-xs text-muted-foreground">{suggestion.suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Run performance analysis to see results
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Readiness</CardTitle>
              <CardDescription>
                Comprehensive deployment checklist and production readiness assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deploymentData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Overall Readiness</p>
                      <p className="text-sm text-muted-foreground">
                        {deploymentData.score}/100 - {deploymentData.isReady ? 'Ready' : 'Not Ready'}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      deploymentData.isReady ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deploymentData.checks?.slice(0, 10).map((check: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded bg-muted/20">
                        {getStatusIcon(check.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{check.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{check.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {deploymentData.recommendations && deploymentData.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Recommendations</h4>
                      <ScrollArea className="h-32">
                        {deploymentData.recommendations.slice(0, 8).map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 py-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Run deployment check to see readiness status
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityAssurance;