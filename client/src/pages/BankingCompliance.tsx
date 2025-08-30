import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BankingCompliance() {
  const [selectedCompliance, setSelectedCompliance] = useState<string | null>(null);
  const [reportType, setReportType] = useState('');

  const complianceFrameworks = [
    {
      id: 'iso_20022',
      name: 'ISO 20022 Standards',
      icon: 'fas fa-certificate',
      description: 'International standard for financial messaging and data exchange',
      status: 'Implemented',
      coverage: '100%',
      badge: 'Required',
      badgeColor: 'bg-red-600 text-white'
    },
    {
      id: 'kyc_aml',
      name: 'KYC/AML Compliance',
      icon: 'fas fa-user-shield',
      description: 'Know Your Customer and Anti-Money Laundering protocols',
      status: 'Active',
      coverage: '100%',
      badge: 'Essential',
      badgeColor: 'bg-primary text-primary-foreground'
    },
    {
      id: 'gdpr',
      name: 'GDPR Data Protection',
      icon: 'fas fa-shield-alt',
      description: 'General Data Protection Regulation compliance for EU users',
      status: 'Compliant',
      coverage: '100%',
      badge: 'Required',
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'pci_dss',
      name: 'PCI DSS',
      icon: 'fas fa-credit-card',
      description: 'Payment Card Industry Data Security Standards',
      status: 'Level 1',
      coverage: '100%',
      badge: 'Certified',
      badgeColor: 'bg-green-600 text-white'
    },
    {
      id: 'soc2',
      name: 'SOC 2 Type II',
      icon: 'fas fa-clipboard-check',
      description: 'Service Organization Control audit for security and availability',
      status: 'Certified',
      coverage: '100%',
      badge: 'Audited',
      badgeColor: 'bg-purple-600 text-white'
    },
    {
      id: 'swift',
      name: 'SWIFT Network',
      icon: 'fas fa-globe',
      description: 'Society for Worldwide Interbank Financial Telecommunication',
      status: 'Connected',
      coverage: '200+ Countries',
      badge: 'Global',
      badgeColor: 'bg-accent text-accent-foreground'
    }
  ];

  const regulatoryReports = [
    {
      type: 'AML Transaction Report',
      frequency: 'Daily',
      lastGenerated: '2024-01-30 09:00 UTC',
      status: 'Completed',
      records: 15672
    },
    {
      type: 'KYC Verification Report',
      frequency: 'Weekly',
      lastGenerated: '2024-01-29 18:00 UTC',
      status: 'Completed',
      records: 2341
    },
    {
      type: 'Sanctions Screening Report',
      frequency: 'Real-time',
      lastGenerated: '2024-01-30 12:15 UTC',
      status: 'Ongoing',
      records: 847
    },
    {
      type: 'GDPR Data Processing Report',
      frequency: 'Monthly',
      lastGenerated: '2024-01-01 00:00 UTC',
      status: 'Completed',
      records: 89234
    }
  ];

  const bankingPartners = [
    {
      name: 'JPMorgan Chase',
      type: 'Primary Banking',
      status: 'Active',
      coverage: 'US, Canada',
      protocols: ['SWIFT', 'ACH', 'Wire']
    },
    {
      name: 'HSBC',
      type: 'International Banking',
      status: 'Active',
      coverage: 'Global',
      protocols: ['SWIFT', 'SEPA', 'Local Rails']
    },
    {
      name: 'Deutsche Bank',
      type: 'European Banking',
      status: 'Active',
      coverage: 'EU, UK',
      protocols: ['SEPA', 'TARGET2', 'SWIFT']
    },
    {
      name: 'Bank of Tokyo-Mitsubishi',
      type: 'Asia-Pacific Banking',
      status: 'Active',
      coverage: 'APAC',
      protocols: ['SWIFT', 'Local Rails']
    }
  ];

  const auditTrail = [
    {
      timestamp: '2024-01-30 12:45:23 UTC',
      action: 'KYC Verification Completed',
      user: 'customer@example.com',
      result: 'Approved',
      details: 'Identity verification passed all checks'
    },
    {
      timestamp: '2024-01-30 12:44:12 UTC',
      action: 'AML Screening',
      user: 'merchant@business.com',
      result: 'Clear',
      details: 'No sanctions list matches found'
    },
    {
      timestamp: '2024-01-30 12:43:05 UTC',
      action: 'Transaction Monitoring',
      user: 'system',
      result: 'Flagged',
      details: 'Large transaction requires manual review'
    },
    {
      timestamp: '2024-01-30 12:42:18 UTC',
      action: 'GDPR Data Access Request',
      user: 'user@domain.com',
      result: 'Processed',
      details: 'Personal data export completed'
    }
  ];

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Banking & Compliance Framework</h1>
          <p className="text-xl text-muted-foreground">
            Comprehensive regulatory compliance and banking integration for global financial operations
          </p>
        </div>

        <Tabs defaultValue="compliance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="banking">Banking Rails</TabsTrigger>
            <TabsTrigger value="reporting">Reporting</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="compliance" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complianceFrameworks.map((framework) => (
                <Card
                  key={framework.id}
                  className={`cursor-pointer transition-colors ${
                    selectedCompliance === framework.id
                      ? 'border-primary'
                      : 'border-border hover:border-primary'
                  }`}
                  onClick={() => setSelectedCompliance(framework.id)}
                  data-testid={`compliance-${framework.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <i className={`${framework.icon} text-primary text-2xl`}></i>
                      <Badge className={`text-xs ${framework.badgeColor}`}>
                        {framework.badge}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{framework.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{framework.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-green-500 ml-1">{framework.status}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-medium ml-1">{framework.coverage}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Compliance Details */}
            {selectedCompliance && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {complianceFrameworks.find(f => f.id === selectedCompliance)?.name} Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3">Implementation Status</h4>
                      <div className="space-y-3">
                        {[
                          'Policy Documentation',
                          'Technical Implementation',
                          'Staff Training',
                          'Regular Audits',
                          'Incident Response',
                          'Continuous Monitoring'
                        ].map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <i className="fas fa-check-circle text-green-500 text-sm"></i>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Key Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Compliance Score:</span>
                          <span className="font-medium text-green-500">100%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Audit:</span>
                          <span className="font-medium">Dec 2023</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Review:</span>
                          <span className="font-medium">Mar 2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Incidents (YTD):</span>
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="banking" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Banking Partners */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Banking Partners</h2>
                <div className="space-y-4">
                  {bankingPartners.map((partner, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{partner.name}</h3>
                          <Badge className="bg-green-600 text-white text-xs">
                            {partner.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{partner.type}</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Coverage:</span>
                            <span className="font-medium ml-1">{partner.coverage}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Protocols:</span>
                            <span className="font-medium ml-1">{partner.protocols.join(', ')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Banking Integration */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Banking Integration</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>ISO 20022 Message Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="code-highlight rounded-lg p-4 mb-4">
                      <pre className="text-sm font-mono overflow-x-auto">
{`<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>SOVR-20240130-001</MsgId>
      <CreDtTm>2024-01-30T12:45:23Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Cd>TGT</Cd>
        </ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>SOVR-TXN-789456123</InstrId>
        <EndToEndId>E2E-SOVR-001</EndToEndId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">10000.00</IntrBkSttlmAmt>
      <ChrgBr>SLEV</ChrgBr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`}
                      </pre>
                    </div>
                    <Button className="w-full" data-testid="button-test-message">
                      <i className="fas fa-paper-plane mr-2"></i>
                      Test ISO Message
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reporting" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Regulatory Reports */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Regulatory Reports</h2>
                <div className="space-y-4">
                  {regulatoryReports.map((report, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{report.type}</h3>
                          <Badge 
                            className={`text-xs ${
                              report.status === 'Completed' 
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Frequency:</span>
                            <span className="font-medium ml-1">{report.frequency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Records:</span>
                            <span className="font-medium ml-1">{report.records.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Last: {report.lastGenerated}
                        </div>
                        <Button size="sm" className="w-full mt-2">
                          Download Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Report Generation */}
              <div>
                <h2 className="text-2xl font-semibold mb-6">Generate Custom Report</h2>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger data-testid="select-report-type">
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transaction_summary">Transaction Summary</SelectItem>
                          <SelectItem value="kyc_status">KYC Status Report</SelectItem>
                          <SelectItem value="aml_alerts">AML Alert Report</SelectItem>
                          <SelectItem value="gdpr_audit">GDPR Audit Report</SelectItem>
                          <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input id="start-date" type="date" data-testid="input-start-date" />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input id="end-date" type="date" data-testid="input-end-date" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="format">Export Format</Label>
                      <Select defaultValue="pdf">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Report</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          <SelectItem value="csv">CSV Data</SelectItem>
                          <SelectItem value="json">JSON Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full" data-testid="button-generate-report">
                      <i className="fas fa-file-download mr-2"></i>
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditTrail.map((entry, index) => (
                    <div key={index} className="border-l-2 border-border pl-4 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{entry.action}</span>
                        <Badge 
                          className={`text-xs ${
                            entry.result === 'Approved' || entry.result === 'Clear' || entry.result === 'Processed'
                              ? 'bg-green-600 text-white'
                              : entry.result === 'Flagged'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {entry.result}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {entry.timestamp} • {entry.user}
                      </div>
                      <div className="text-sm">{entry.details}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}