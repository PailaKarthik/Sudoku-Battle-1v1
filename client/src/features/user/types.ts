export type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  profileCompleted: boolean;
};

export type UserState = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
};
