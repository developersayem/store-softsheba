export type PostStatus = "published" | "draft" | "pending";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  status: PostStatus;
  createdAt: string;
}
