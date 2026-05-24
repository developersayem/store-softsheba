// components/admin/users/types.ts
export type UserRole = "administrator" | "customer";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  posts: number;
  twoFAEnabled: boolean;
  avatar?: string;
}
