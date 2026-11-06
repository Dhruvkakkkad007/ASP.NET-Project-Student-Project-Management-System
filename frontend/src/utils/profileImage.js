export function resolveProfileImage(path) {
  if (!path || typeof path !== 'string') return '';
  const value = path.trim();
  if (!value || value === '—') return '';
  if (value.startsWith('http') || value.startsWith('blob:') || value.startsWith('data:')) {
    return value;
  }
  if (value.startsWith('/')) return value;
  return `/${value}`;
}
