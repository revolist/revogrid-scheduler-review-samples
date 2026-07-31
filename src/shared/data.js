export const DATE = '2026-08-03';
export const DAY_START = `${DATE}T08:00:00.000Z`;
export const DAY_END = `${DATE}T18:00:00.000Z`;

export const resources = [
  { id: 'alex', name: 'Alex Morgan', role: 'Release manager', group: 'Team', color: '#4f46e5' },
  { id: 'nina', name: 'Nina Patel', role: 'Customer success', group: 'Team', color: '#0f766e' },
  { id: 'leo', name: 'Leo Wong', role: 'QA lead', group: 'Team', color: '#0284c7' },
  { id: 'studio-a', name: 'Studio A', role: 'Room', group: 'Spaces', color: '#ea580c' },
];

export const events = [
  event('release', 'alex', 'Release planning', '08:30', '10:00', '#4f46e5'),
  event('hotfix', 'alex', 'Hotfix deploy', '09:30', '11:30', '#7c3aed'),
  event('nina-workshop', 'nina', 'Customer workshop', '09:00', '11:00', '#0f766e'),
  { ...event('qa', 'leo', 'QA validation', '11:00', '13:00', '#0284c7'), locked: true },
  event('room-setup', 'studio-a', 'Room setup', '08:00', '09:00', '#ea580c'),
  event('room-workshop', 'studio-a', 'Customer workshop', '09:00', '12:00', '#f97316'),
  { ...event('urgent-support', undefined, 'Urgent support', '14:00', '15:30', '#64748b'), requiredRole: 'Support' },
];

export const availability = [{
  id: 'nina-blocked',
  resourceId: 'nina',
  startDateTime: `${DATE}T13:00:00.000Z`,
  endDateTime: `${DATE}T15:00:00.000Z`,
  kind: 'blocked',
  title: 'Blocked',
  reason: 'Customer follow-up block',
}];

export function event(id, resourceId, title, start, end, color) {
  return {
    id,
    ...(resourceId ? { resourceId } : {}),
    title,
    startDateTime: `${DATE}T${start}:00.000Z`,
    endDateTime: `${DATE}T${end}:00.000Z`,
    status: 'confirmed',
    color,
  };
}

export function toBryntumDate(iso) {
  const [datePart, timePart] = iso.replace('Z', '').split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}
