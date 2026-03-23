export interface SunsetSummary {
  sunsetTime: string;
  minutesLeft: number;
  label: 'Plenty of sun left' | 'Good beer garden time' | 'Last of the sun' | 'Sun’s gone';
}

export function getPlaceholderSunsetIso(now = new Date()) {
  const sunset = new Date(now);
  sunset.setHours(18, 39, 0, 0);

  return sunset.toISOString();
}

export function getSunsetSummary(sunsetIso: string, now = new Date()): SunsetSummary {
  const sunset = new Date(sunsetIso);
  const minutesLeft = Math.round((sunset.getTime() - now.getTime()) / 60000);
  const label = minutesLeft > 120 ? 'Plenty of sun left' : minutesLeft > 60 ? 'Good beer garden time' : minutesLeft > 0 ? 'Last of the sun' : 'Sun’s gone';
  return { sunsetTime: sunsetIso, minutesLeft, label };
}
