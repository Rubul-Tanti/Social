export interface User {
  _id: string;
  userName: string;
  profilePicture?: string;
}

export interface Post {
  _id: string;
  userId: User;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  liked:boolean;
}

export interface PostsResponse {
  message: string;
  data: {
    posts: Post[];
    page: number;
    limit: number;
    total: number;
  };
}
export interface CommentUser {
  _id?: string;
  profilePicture: string;
  userName:string;
}

export interface Comment {
  _id: string;
  targetType?: string;
  targetId?: string;
  userId: CommentUser;
  content: string;
  likes?: number;
  commentsCount?: number;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
 liked:boolean
  __v?: number;
}

export interface CommentsResponse {
  message: string;
  data: {
    comments: Comment[];
    page: number;
    limit: number;
    total: number;
  };
}