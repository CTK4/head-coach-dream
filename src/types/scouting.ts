export interface ScoutingReport {
  prospectId: string;
  generatedWeek: number;
  authorLabel: string;
  positives: string[];
  negatives: string[];
  comparisonPlayer: string;
  projectedRole: string;
  draftRecommendation: string;
}
