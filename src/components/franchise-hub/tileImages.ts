export type HubTileId =
  | "staff"
  | "roster"
  | "strategy"
  | "scouting"
  | "news"
  | "contracts"
  | "coachs_office"
  | "injury_report"
  | "hall_of_fame";

export const HUB_TILE_IMAGES: Record<HubTileId, string> = {
  staff: "/placeholders/coach.png",
  roster: "/placeholders/depth_chart.png",
  strategy: "/placeholders/strategy_meeting.png",
  scouting: "/placeholders/scout.png",
  news: "/placeholders/news.png",
  contracts: "/placeholders/accounting.png",
  coachs_office: "/placeholders/Coach_Office.jpeg",
  injury_report: "/placeholders/Injury_Report.png",
  hall_of_fame: "/placeholders/Hall_of_Fame.jpeg",
};

export const HUB_TILE_FALLBACK_IMAGE = HUB_TILE_IMAGES.staff;
