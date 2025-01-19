import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ServersProvider } from '../context/ServersContext';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <QueryClientProvider client={queryClient}>
        <ServersProvider>
          <Component {...pageProps} />
        </ServersProvider>
      </QueryClientProvider>
    </div>
  );
}

export default MyApp; 