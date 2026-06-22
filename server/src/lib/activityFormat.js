function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function activityLabel(type) {
  const map = {
    started_item: 'started',
    finished_item: 'finished',
    rated: 'rated',
    joined_club: 'joined',
    created_club: 'created',
    posted: 'posted in',
  }
  return map[type] || type
}

export function formatActivity(a) {
  return {
    id: a.id,
    type: a.type,
    label: activityLabel(a.type),
    title: a.title,
    clubName: a.clubName,
    rating: a.rating,
    extra: JSON.parse(a.extra || '{}'),
    time: timeAgo(a.createdAt),
    createdAt: a.createdAt,
    user: a.user,
    likeCount: 0,
    commentCount: 0,
  }
}
