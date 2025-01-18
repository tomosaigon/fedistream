import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ServersProvider } from '../context/ServersContext';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ServersProvider>
        <Component {...pageProps} />
      </ServersProvider>
    </div>
  );
}

export default MyApp; 