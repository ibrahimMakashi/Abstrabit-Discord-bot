export const formatDateTime = (value) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '--';

export const formatDuration = (value) => `${value || 0} ms`;

export const toTitleCase = (value) =>
  value
    ?.split(/[\s_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || '';
