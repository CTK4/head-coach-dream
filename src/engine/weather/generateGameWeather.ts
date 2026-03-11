import climateData from "@/data/config/venueClimate.v1.json";
import { hashSeed, mulberry32 } from "@/engine/rng";

export type WeatherCondition = "CLEAR" | "CLOUDY" | "RAIN" | "SNOW";
export type WindTier = "LOW" | "MED" | "HIGH";
export type PrecipTier = "NONE" | "LIGHT" | "HEAVY";

export type GameWeather = {
  version: 1;
  gameKey: string;
  venueTeamId: string;
  isDome: boolean;
  monthIndex: number;
  temperatureF: number;
  windMph: number;
  condition: WeatherCondition;
  precipTier: PrecipTier;
  windTier: WindTier;
  surface: "DRY" | "WET" | "SNOW";
};

type VenueClimate = {
  teamId: string;
  isDome: boolean;
  tempMeanFByMonth: number[];
  tempStdDevFByMonth: number[];
  precipChanceByMonth: number[];
  windMeanMphByMonth: number[];
  windStdDevMphByMonth: number[];
};

type VenueClimateDataset = {
  version: 1;
  months: string[];
  venues: VenueClimate[];
};

const MONTHS_PER_YEAR = 12;
const EXPECTED_TEAM_COUNT = 32;

function assertMonthArray(arr: unknown, label: string) {
  if (!Array.isArray(arr) || arr.length !== MONTHS_PER_YEAR || arr.some((n) => !Number.isFinite(Number(n)))) {
    throw new Error(`Invalid climate dataset: ${label} must be 12 numeric entries.`);
  }
}

function validateDataset(raw: VenueClimateDataset): VenueClimateDataset {
  if (raw.version !== 1) throw new Error("Invalid climate dataset: version must be 1.");
  if (!Array.isArray(raw.venues) || raw.venues.length !== EXPECTED_TEAM_COUNT) {
    throw new Error(`Invalid climate dataset: venues must include ${EXPECTED_TEAM_COUNT} teams.`);
  }
  const seen = new Set<string>();
  for (const venue of raw.venues) {
    if (!venue.teamId) throw new Error("Invalid climate dataset: missing teamId.");
    if (seen.has(venue.teamId)) throw new Error(`Invalid climate dataset: duplicate teamId ${venue.teamId}.`);
    seen.add(venue.teamId);
    assertMonthArray(venue.tempMeanFByMonth, `${venue.teamId}.tempMeanFByMonth`);
    assertMonthArray(venue.tempStdDevFByMonth, `${venue.teamId}.tempStdDevFByMonth`);
    assertMonthArray(venue.precipChanceByMonth, `${venue.teamId}.precipChanceByMonth`);
    assertMonthArray(venue.windMeanMphByMonth, `${venue.teamId}.windMeanMphByMonth`);
    assertMonthArray(venue.windStdDevMphByMonth, `${venue.teamId}.windStdDevMphByMonth`);
  }
  return raw;
}

const DATASET = validateDataset(climateData as VenueClimateDataset);
const CLIMATE_BY_TEAM_ID = Object.fromEntries(DATASET.venues.map((row) => [row.teamId, row])) as Record<string, VenueClimate>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function boxMullerNormal(rng: () => number): number {
  const u1 = Math.max(1e-9, rng());
  const u2 = Math.max(1e-9, rng());
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function getMonthIndexForGame(weekType: "PRESEASON" | "REGULAR_SEASON" | "PLAYOFFS", weekNumber: number): number {
  if (weekType === "PRESEASON") return 7;
  if (weekType === "PLAYOFFS") return weekNumber <= 2 ? 0 : 1;
  if (weekNumber <= 4) return 8;
  if (weekNumber <= 8) return 9;
  if (weekNumber <= 13) return 10;
  return 11;
}

function weatherTiers(params: { windMph: number; condition: WeatherCondition }): { windTier: WindTier; precipTier: PrecipTier } {
  const windTier: WindTier = params.windMph >= 18 ? "HIGH" : params.windMph >= 10 ? "MED" : "LOW";
  const precipTier: PrecipTier = params.condition === "RAIN" || params.condition === "SNOW" ? (params.windMph >= 16 ? "HEAVY" : "LIGHT") : "NONE";
  return { windTier, precipTier };
}

export function buildWeatherGameKey(params: { season: number; weekType: "PRESEASON" | "REGULAR_SEASON" | "PLAYOFFS"; weekNumber: number; homeTeamId: string; awayTeamId: string }): string {
  return `${params.season}:${params.weekType}:${params.weekNumber}:${params.homeTeamId}:${params.awayTeamId}`;
}

export function neutralGameWeather(gameKey: string, venueTeamId = "HOME"): GameWeather {
  return {
    version: 1,
    gameKey,
    venueTeamId,
    isDome: false,
    monthIndex: 8,
    temperatureF: 68,
    windMph: 7,
    condition: "CLEAR",
    precipTier: "NONE",
    windTier: "LOW",
    surface: "DRY",
  };
}

export function generateGameWeather(params: {
  saveSeed: number;
  season: number;
  weekType: "PRESEASON" | "REGULAR_SEASON" | "PLAYOFFS";
  weekNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  gameKey?: string;
}): GameWeather {
  const gameKey = params.gameKey ?? buildWeatherGameKey(params);
  const climate = CLIMATE_BY_TEAM_ID[params.homeTeamId];
  if (!climate) return neutralGameWeather(gameKey, params.homeTeamId);

  const monthIndex = getMonthIndexForGame(params.weekType, params.weekNumber);
  const seed = hashSeed(params.saveSeed, gameKey, "weather.v1");
  const rng = mulberry32(seed);

  const tempMean = climate.tempMeanFByMonth[monthIndex] ?? 60;
  const tempStd = Math.max(1, climate.tempStdDevFByMonth[monthIndex] ?? 6);
  const windMean = climate.windMeanMphByMonth[monthIndex] ?? 8;
  const windStd = Math.max(0.5, climate.windStdDevMphByMonth[monthIndex] ?? 2);
  const precipChance = clamp(climate.precipChanceByMonth[monthIndex] ?? 0.2, 0, 1);

  const temp = Math.round(clamp(tempMean + boxMullerNormal(rng) * tempStd, -10, 110));
  const windRaw = Math.round(clamp(windMean + boxMullerNormal(rng) * windStd, 0, 35));
  const isPrecip = !climate.isDome && rng() < precipChance;
  const condition: WeatherCondition = climate.isDome ? "CLEAR" : isPrecip ? (temp <= 34 ? "SNOW" : "RAIN") : rng() < 0.35 ? "CLOUDY" : "CLEAR";
  const windMph = climate.isDome ? 0 : windRaw;
  const { windTier, precipTier } = weatherTiers({ windMph, condition });

  return {
    version: 1,
    gameKey,
    venueTeamId: params.homeTeamId,
    isDome: climate.isDome,
    monthIndex,
    temperatureF: climate.isDome ? 70 : temp,
    windMph,
    condition,
    precipTier,
    windTier,
    surface: condition === "SNOW" ? "SNOW" : condition === "RAIN" ? "WET" : "DRY",
  };
}

export function formatWeatherSummary(weather?: Pick<GameWeather, "condition" | "temperatureF" | "windMph" | "isDome">): string {
  if (!weather) return "Weather: Neutral";
  if (weather.isDome) return `Weather: Dome · ${weather.temperatureF}°F`;
  return `Weather: ${weather.condition} · ${weather.temperatureF}°F · Wind ${weather.windMph} mph`;
}
