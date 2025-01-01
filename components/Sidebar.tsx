// components/Sidebar.tsx
import Link from 'next/link';
import { MastodonServer } from '../config/servers';

interface SidebarProps {
  serverSlug: string;
  servers: MastodonServer[];
  counts: {
    nonEnglish: number;
    withImages: number;
    asReplies: number;
    networkMentions: number;
    withLinks: number;
    fromBots: number;  // Add bots count
    remaining: number;
  } | null;
  onServerChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  serverSlug,
  servers,
  counts,
  onServerChange,
}) => {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Timeline Categories</h2>
      
      {/* Server Selector */}
      <select 
        value={serverSlug}
        onChange={onServerChange}
        className="w-full px-3 py-2 border rounded mb-4"
      >
        {servers.map(server => (
          <option key={server.slug} value={server.slug}>
            {server.name}
          </option>
        ))}
      </select>

      {/* Category Links */}
      <nav className="space-y-2">
        <Link
          href={`/${serverSlug}/regular`}
          className="block p-2 hover:bg-gray-100 rounded"
        >
          Regular Posts ({counts?.remaining || 0})
        </Link>
        <Link
          href={`/${serverSlug}/with-images`}
          className="block p-2 hover:bg-gray-100 rounded"
        >
          With Images ({counts?.withImages || 0})
        </Link>
        <Link
          href={`/${serverSlug}/replies`}
          className="block p-2 hover:bg-gray-100 rounded"
        >
          Replies ({counts?.asReplies || 0})
        </Link>
        <Link
          href={`/${serverSlug}/network-mentions`}
          className="block p-2 hover:bg-gray-100 rounded"
        >
          Network Mentions ({counts?.networkMentions || 0})
        </Link>
        <Link
          href={`/${serverSlug}/with-links`}
          className="block p-2 hover:bg-gray-100 rounded"
        >
          With Links ({counts?.withLinks || 0})
        </Link>
        <Link
          href={`/${serverSlug}/from-bots`}
          className="block p-2 hover:bg-gray-100 rounded"
        >
          Bots ({counts?.fromBots || 0})
        </Link>
        <Link
          href={`/${serverSlug}/non-english`}
          className="block p-2 hover:bg-gray-100 rounded"
        >
          Non-English ({counts?.nonEnglish || 0})
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
