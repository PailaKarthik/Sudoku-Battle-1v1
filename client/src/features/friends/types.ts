export type FriendUser = {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type FriendRequest = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  sender: FriendUser;
};

export type FriendsState = {
  friends: FriendUser[];
  requests: FriendRequest[];
  loading: boolean;
  error: string | null;
};
