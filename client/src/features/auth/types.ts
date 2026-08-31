export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  profileCompleted: boolean;
  rating: UserRatingSummary;
};

export type UserRatingSummary = {
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  highestRating: number;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  loading: boolean;
  error: string | null;
};
