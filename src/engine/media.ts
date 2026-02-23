import type { GameState } from '../context/GameContext';

function toneForMediaRep(mediaRep: number): { title: string; body: string } {
  if (mediaRep >= 75) {
    return {
      title: 'Media Praise Builds Momentum',
      body: 'League coverage frames your staff as a disciplined, ascending operation heading into next week.',
    };
  }
  if (mediaRep <= 35) {
    return {
      title: 'Media Heat Increases',
      body: 'Regional shows are critical of late-game decisions, increasing narrative pressure around the program.',
    };
  }
  return {
    title: 'Media Cycle Stays Neutral',
    body: 'Coverage remains mixed and largely waits for on-field results before shifting the narrative.',
  };
}

export function updateMedia(state: GameState): GameState {
  const mediaRep = Number(state.coach.reputation?.mediaRep ?? 50);
  const { title, body } = toneForMediaRep(mediaRep);
  const news = {
    id: `MEDIA_${state.season}_${state.week ?? 0}`,
    title,
    body,
    createdAt: Date.now(),
    category: 'MEDIA',
  };
  return {
    ...state,
    hub: {
      ...state.hub,
      news: [news, ...(state.hub.news ?? [])].slice(0, 200),
    },
  };
}
