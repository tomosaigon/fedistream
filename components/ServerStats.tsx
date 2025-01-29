import React from "react";
import { formatDateTime, calculateTimeDifference, calculatePostsPerDay } from '@/utils/format';

interface ServerStatsProps {
  stats: {
    totalPosts: number;
    seenPosts: number;
    oldestPostDate: string | null;
    latestPostDate: string | null;
    uniqueAccounts: number;
  };
  // formatDateTime: (date: string) => string;
  // calculateTimeDifference: (start: string, end: string) => string;
  // calculatePostsPerDay: (totalPosts: number, startDate: string | Date, endDate: string | Date) => string;
}

const ServerStats: React.FC<ServerStatsProps> = ({
  stats,
  // formatDateTime,
  // calculateTimeDifference,
  // calculatePostsPerDay,
}) => {
  return (
    stats && (
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
          {/* Total Posts */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-center">
            <span className="text-blue-500 text-xl font-bold">{stats.totalPosts || 0}</span>
            <span className="text-gray-600 text-xs sm:ml-2">Total Posts</span>
          </div>

          {/* Seen Posts */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-center">
            <span className="text-green-500 text-xl font-bold">{stats.seenPosts || 0}</span>
            <span className="text-gray-600 text-xs sm:ml-2">Seen</span>
          </div>

          {/* Unseen Posts */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-center">
            <span className="text-red-500 text-xl font-bold">
              {(stats.totalPosts || 0) - (stats.seenPosts || 0)}
            </span>
            <span className="text-gray-600 text-xs sm:ml-2">Unseen</span>
          </div>

          {/* Unique Accounts */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-center">
            <span className="text-purple-500 text-xl font-bold">{stats.uniqueAccounts || 0}</span>
            <span className="text-gray-600 text-xs sm:ml-2">Accts</span>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="mt-4">
          {stats?.latestPostDate && stats?.oldestPostDate ? (
            <p className="text-gray-500 text-sm text-center sm:text-left">
              <strong>Latest:</strong>{" "}
              <span className="text-blue-500">{calculateTimeDifference(stats.latestPostDate, new Date().toISOString())} ago</span>{" "}
              <span className="text-gray-400 text-xs">
                ({formatDateTime(stats.latestPostDate)})
              </span>
              <br />
              <strong>Coverage:</strong>{" "}
              <span className="text-green-500 font-medium">
                {calculateTimeDifference(stats.oldestPostDate, stats.latestPostDate)}
              </span>
              <br />
              <strong>Avg Posts/Day:</strong>{" "}
              <span className="text-blue-500 font-medium">
                {calculatePostsPerDay(stats.totalPosts, stats.oldestPostDate, stats.latestPostDate)}
              </span>
            </p>
          ) : (
            <p className="text-gray-500 text-sm text-center sm:text-left">
              No posts available to calculate stats.
            </p>
          )}
        </div>
      </div>
    )
  );
};

export default ServerStats;