import { ApiTester } from '@/components/ApiTester';

export function ApiTesting() {
  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Live API Testing</h1>
          <p className="text-xl text-muted-foreground">Test our APIs in real-time with interactive examples</p>
        </div>

        <ApiTester />
      </div>
    </div>
  );
}
