import { useEffect, useState } from "react";
import { getTeamRatingsIndex, type TeamRatingsIndex } from "@/lib/teamRatings";

type UseTeamRatingsResult = {
  index: TeamRatingsIndex;
  loading: boolean;
  error: string | null;
};

export function useTeamRatings(): UseTeamRatingsResult {
  const [index, setIndex] = useState<TeamRatingsIndex>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getTeamRatingsIndex()
      .then((nextIndex) => {
        if (!active) return;
        setIndex(nextIndex);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load team ratings");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { index, loading, error };
}

