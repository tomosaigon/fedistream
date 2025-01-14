import React from 'react';
import {
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  PhotoIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  CpuChipIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  HashtagIcon,
  LinkIcon,
} from '@heroicons/react/24/solid';
import { Bucket } from '@/db/bucket';

interface BucketIconProps {
  bucket: Bucket;
  className?: string;
}

const BucketIcon: React.FC<BucketIconProps> = ({ bucket, className = 'h-4 w-4' }) => {
  switch (bucket) {
    case Bucket.regular:
      return <DocumentTextIcon className={className} />;
    case Bucket.questions:
      return <QuestionMarkCircleIcon className={className} />;
    case Bucket.withImages:
      return <PhotoIcon className={className} />;
    case Bucket.asReplies:
      return <ChatBubbleBottomCenterTextIcon className={className} />;
    case Bucket.networkMentions:
      return <MegaphoneIcon className={className} />;
    case Bucket.hashtags:
      return <HashtagIcon className={className} />;
    case Bucket.withLinks:
      return <LinkIcon className={className} />;
    case Bucket.fromBots:
      return <CpuChipIcon className={className} />;
    case Bucket.nonEnglish:
      return <GlobeAltIcon className={className} />;
    case Bucket.reblogs:
      return <ArrowPathIcon className={className} />;
    default:
      return null;
  }
};

export default BucketIcon;