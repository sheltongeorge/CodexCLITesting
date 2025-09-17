import { format, parseISO } from 'date-fns';

export function formatDate(value: string | Date, pattern = 'MMM d, yyyy') {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, pattern);
}

export function formatDateTime(value: string | Date) {
  return formatDate(value, 'MMM d, yyyy h:mm a');
}

export function formatRest(seconds: number) {
  if (!Number.isFinite(seconds)) {
    return '-';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function formatWeight(weight?: number | null) {
  if (weight === null || weight === undefined || Number.isNaN(weight)) {
    return '-';
  }

  return `${weight} lb`;
}

export function formatRpe(rpe?: number | null) {
  if (rpe === null || rpe === undefined || Number.isNaN(rpe)) {
    return '-';
  }

  return rpe.toFixed(1);
}
