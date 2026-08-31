import { api } from "./cleint";

export type RatingStats = {
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  highestRating: number;
};

export async function getMyRating(
  variant: "2x3" | "3x3",
): Promise<RatingStats> {
  const response = await api.get<RatingStats>(`/ratings/me?variant=${variant}`);

  return response.data;
}
