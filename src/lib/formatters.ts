export function formatCityState(city: string, state: string): string {
  return `${city}, ${state}`;
}

export function normalizeCityState(region: string): string {
  return region.replace(/,\s*([A-Z]{2})\b/g, ", $1");
}
