// User data storage (generic key-value store)
export interface UserData<T = Record<string, unknown>> {
  id: string;
  user_id: string;
  key: string;
  data: T;
  created_at: string;
  updated_at: string;
}

// Post status type
export type PostStatus = "draft" | "scheduled" | "published" | null;

// User post type
export interface UserPost {
  postId: string;
  userId: string;
  title?: string;
  rawText: string;
  status?: PostStatus | null;
  editorState?: unknown; // Rich text editor state (format varies by editor)
  scheduledFor?: string;
  publishedAt?: string;
  wordCount?: number;
  inspirationSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// Profile data structure
export interface ProfileData {
  fullName?: string;
  currentTitle?: string;
  companyName?: string;
  industry?: string;
  location?: string;
  productName?: string;
  productDescription?: string;
  targetCustomer?: string;
  problemSolved?: string;
  pricing?: string;
  users?: string;
  mrr?: string;
  arr?: string;
  growth?: string;
  launchDate?: string;
  previousCompany?: string;
  previousRole?: string;
  yearsExp?: string;
  education?: string;
  biggestWin?: string;
  milestone1?: string;
  milestone2?: string;
  awards?: string;
  primarySkills?: string;
  specialization?: string;
  tools?: string;
}

// LinkedIn post stats
export interface PostStats {
  total_reactions: number;
  like: number;
  comments: number;
  reposts: number;
  love?: number;
  support?: number;
  insight?: number;
  celebrate?: number;
  funny?: number;
}

// LinkedIn post media
export interface PostMedia {
  type: string;
  url: string;
  thumbnail?: string;
  images?: { url: string; width: number; height: number }[];
}

// Content types
export interface ContentPost {
  id: number;
  title: string;
  author: string;
  timeAgo: string;
  isHighlighted: boolean;
  creatorId: number;
  postUrl?: string;
  postRaw?: string;
  // Full LinkedIn data
  text?: string;
  postedAt?: string;
  postedAtTimestamp?: number;
  postType?: string;
  stats?: PostStats;
  media?: PostMedia;
  article?: { url: string; title: string; subtitle?: string; thumbnail?: string };
}

export interface Profile {
  id: number;
  name: string;
  connections: string;
  profileUrl: string;
  isFollowed: boolean;
  followedAt?: string; // Timestamp when user followed this creator
  postCount?: number; // Number of posts from this creator
  // Average engagement stats
  avgReactions?: number;
  avgComments?: number;
  avgReposts?: number;
}

export interface CreatorProfile {
  creator_id: number;
  profile_url: string;
  platform: string;
  created_at: string;
  updated_at: string;
  display_name?: string | null;
}

export interface CreatorContent {
  content_id: number;
  creator_id: number;
  post_url: string;
  post_raw?: string;
  created_at: string;
  updated_at: string;
}

// Re-export API types for convenience
export type {
  GenerateEditRequest,
  GenerateEditResponse,
  AskQuestionRequest,
  AskQuestionResponse,
  TextToSpeechRequest,
} from "./api";

// Re-export speech types
export type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from "./speech";
export { getSpeechRecognition } from "./speech";
