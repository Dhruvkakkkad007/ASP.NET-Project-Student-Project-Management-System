/**
 * Formatting helpers for SPMS
 */

/**
 * Format ISO date string into human readable date
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Format ISO date string into YYYY-MM-DD for <input type="date" />
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function toInputDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Format percentage
 * @param {number} val
 * @returns {string}
 */
export function formatPercent(val) {
  if (val === null || val === undefined) return '0%';
  return `${Number(val).toFixed(0)}%`;
}

/**
 * Format score display (e.g. 85 / 100)
 * @param {number|null} earned
 * @param {number|null} assigned
 * @returns {string}
 */
export function formatScore(earned, assigned) {
  if (assigned === null || assigned === undefined) return '—';
  if (earned === null || earned === undefined) return `— / ${assigned}`;
  return `${earned} / ${assigned}`;
}

export function allocationProjectLabel(row) {
  if (row?.projectTitle) return row.projectTitle;
  if (row?.projectId) return `Project #${row.projectId}`;
  return 'Awaiting student selection';
}

export function hasAssignedProject(row) {
  return Boolean(row?.projectId || row?.projectTitle);
}

