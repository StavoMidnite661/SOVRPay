import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';

interface ApiTestRequest {
  endpoint: string;
  method: string;
  body?: any;
}

export function ApiTester() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('/v1/payments');
  const [requestBody, setRequestBody] = useState(`{
  "amount": 1000,
  "currency": "USD",
  "description": "Test payment",
  "customer": {
    "email": "test@example.com"
  }
}`);

  const testApiMutation = useMutation({
    mutationFn: (data: ApiTestRequest) => apiRequest('/api/test', {
      method: 'POST',
      body: data,
    }),
  });

  const endpoints = [
    { path: '/v1/payments', method: 'POST', description: 'Create Payment' },
    { path: '/v1/payments/{id}', method: 'GET', description: 'Get Payment' },
    { path: '/v1/transactions', method: 'GET', description: 'List Transactions' },
    { path: '/v1/refunds', method: 'POST', description: 'Refund Payment' },
  ];

  const handleSendRequest = () => {
    let body;
    try {
      body = requestBody ? JSON.parse(requestBody) : undefined;
    } catch (error) {
      console.error('Invalid JSON in request body');
      return;
    }

    const selectedEndpointData = endpoints.find(e => e.path === selectedEndpoint);
    testApiMutation.mutate({
      endpoint: selectedEndpoint,
      method: selectedEndpointData?.method || 'POST',
      body,
    });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'POST': return 'bg-primary text-primary-foreground';
      case 'GET': return 'bg-accent text-accent-foreground';
      case 'PUT': return 'bg-blue-600 text-white';
      case 'DELETE': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* API Endpoints */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className={`p-4 hover:bg-muted/50 cursor-pointer border-l-4 transition-colors ${
                    selectedEndpoint === endpoint.path 
                      ? 'border-l-primary bg-muted/20' 
                      : 'border-l-transparent'
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint.path)}
                  data-testid={`endpoint-${endpoint.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{endpoint.description}</span>
                    <Badge className={`text-xs ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{endpoint.path}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Tester */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Request Builder</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  Sandbox Mode
                </Badge>
                <i className="fas fa-circle text-green-500 text-xs"></i>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Request */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-medium">Request</Label>
                <Button
                  size="sm"
                  onClick={handleSendRequest}
                  disabled={testApiMutation.isPending}
                  data-testid="button-send-request"
                >
                  {testApiMutation.isPending ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge className={getMethodColor(endpoints.find(e => e.path === selectedEndpoint)?.method || 'POST')}>
                    {endpoints.find(e => e.path === selectedEndpoint)?.method || 'POST'}
                  </Badge>
                  <span className="text-muted-foreground">https://api.sovrpay.com{selectedEndpoint}</span>
                </div>
                <div className="text-muted-foreground text-xs mb-2">Headers:</div>
                <div className="text-accent text-xs mb-3">Authorization: Bearer your-api-key</div>
                {(endpoints.find(e => e.path === selectedEndpoint)?.method === 'POST') && (
                  <>
                    <div className="text-muted-foreground text-xs mb-2">Body:</div>
                    <Textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="bg-input border-border text-xs font-mono min-h-[120px]"
                      data-testid="textarea-request-body"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Response */}
            <div>
              <Label className="font-medium block mb-3">Response</Label>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                {testApiMutation.data ? (
                  <>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={`text-xs ${
                        testApiMutation.data.responseCode >= 200 && testApiMutation.data.responseCode < 300
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}>
                        {testApiMutation.data.responseCode} {testApiMutation.data.responseCode === 200 ? 'OK' : 'Error'}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        Response time: {testApiMutation.data.responseTime}ms
                      </span>
                    </div>
                    <pre className="text-xs overflow-auto" data-testid="text-response-body">
                      {JSON.stringify(testApiMutation.data.responseBody, null, 2)}
                    </pre>
                  </>
                ) : testApiMutation.isPending ? (
                  <div className="text-muted-foreground">Sending request...</div>
                ) : (
                  <div className="text-muted-foreground">Click "Send Request" to test the API</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
