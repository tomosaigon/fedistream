import React from "react";

interface PollOption {
  title: string;
  votes_count: number;
}

interface Poll {
  options: PollOption[];
  votes_count: number;
  voters_count: number | null;
  expired: boolean;
}

interface PostPollProps {
  poll: Poll;
}

const PostPoll: React.FC<PostPollProps> = ({ poll }) => {
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold text-lg mb-2">Poll</h4>
      <ul className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage = poll.votes_count
            ? Math.round((option.votes_count / poll.votes_count) * 100)
            : 0;

          return (
            <li key={index}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="flex items-center gap-1">
                  <span>{option.title}</span>
                </span>
                <span className="text-gray-500">{percentage}%</span>
              </div>
              <div className="relative w-full h-2 bg-gray-300 rounded-full">
                <div
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="text-gray-500 text-sm mt-3 flex justify-between">
        <span>{poll.voters_count || "0"} people</span>
        <span>{poll.expired ? "Closed" : "Active"}</span>
      </div>
    </div>
  );
};

export default PostPoll;
