/**
 * Get status color for Material-UI Chip
 */
export const getStatusColor = (status) => {
  const map = {
    Pending: 'warning',
    'In Progress': 'info',
    Resolved: 'success',
    Rejected: 'error',
  };
  return map[status] || 'default';
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority) => {
  const map = {
    Low: '#10B981',
    Medium: '#FFB547',
    High: '#FF4C6A',
  };
  return map[priority] || '#94A3B8';
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format relative time (e.g. "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
};

/**
 * Category icons mapping
 */
export const getCategoryIcon = (category) => {
  const map = {
    IT: '💻',
    Facility: '🏢',
    HR: '👥',
    Finance: '💰',
    General: '📋',
  };
  return map[category] || '📋';
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
