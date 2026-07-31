import { defineCustomElements } from '@revolist/revogrid/loader';
import { EventSchedulerPlugin } from '@revolist/revogrid-enterprise';
import '@revolist/revogrid-enterprise/dist/revogrid-enterprise.css';

defineCustomElements();

document.querySelector('#proof-app').innerHTML = `
  <section class="proof-page">
    <header class="proof-header">
      <div><div class="eyebrow"><span class="live-dot"></span> REAL PRODUCT PROOF</div><h1>Move work between resources.<br>Reject invalid drops.</h1></div>
      <div class="version-badge"><span>RevoGrid</span><strong>Event Scheduler 2.4.0</strong></div>
    </header>
    <section class="proof-stage">
      <div class="scheduler-toolbar"><div><span class="toolbar-label">Operations plan</span><strong>Monday, August 3, 2026</strong></div><div class="toolbar-range">08:00–18:00</div></div>
      <div id="scheduler-host"></div>
      <div id="proof-status" class="proof-status is-ready"><span class="status-icon">✓</span><div><strong>Ready</strong><span>Drag “Release planning” to another resource.</span></div></div>
    </section>
    <footer class="proof-footer"><span><i class="legend-swatch event-swatch"></i>Scheduled event</span><span><i class="legend-swatch blocked-swatch"></i>Blocked availability</span><span><i class="legend-swatch reject-swatch"></i>Blocking rule</span><span class="proof-note">Real browser interaction · controlled event state</span></footer>
  </section>`;

const date = '2026-08-03';
const events = [
  makeEvent('release', 'alex', 'Release planning', '09:00', '10:30', '#4f46e5'),
  makeEvent('workshop', 'nina', 'Customer workshop', '11:00', '12:30', '#0f766e'),
  { ...makeEvent('qa', 'leo', 'QA validation', '10:00', '11:30', '#0284c7'), locked: true },
  makeEvent('room', 'studio-a', 'Room setup', '08:00', '09:00', '#ea580c'),
];

const grid = document.createElement('revo-grid');
const status = document.querySelector('#proof-status');
grid.className = 'proof-grid';
grid.theme = 'material';
grid.hideAttribution = true;
grid.readonly = false;
grid.plugins = [EventSchedulerPlugin];

const setStatus = (state, title, message) => {
  status.className = `proof-status is-${state}`;
  status.innerHTML = `<span class="status-icon">${state === 'accepted' ? '✓' : '×'}</span><div><strong>${title}</strong><span>${message}</span></div>`;
};

Object.assign(grid, {
  eventScheduler: {
    view: 'resourceTimeline', weekStartDate: date, dateRange: { start: date, end: date }, timeZone: 'UTC', locale: 'en-US',
    timeRange: { start: '08:00', end: '18:00' }, slotMinutes: 60, snapMinutes: 30, rowSize: 86, timelineColumnSize: 124, resourceColumnSize: 220,
    editable: true, allowCreate: false, allowMove: true, allowResize: false, allowDelete: false, eventLayout: 'stack',
    conflicts: { enabled: true, policy: 'mark', scope: 'same-resource', rules: { overlap: 'error', 'blocked-time': 'error', 'outside-availability': 'error' } },
    eventProperties: ({ event, isLocked }) => ({
      class: `proof-event${isLocked ? ' proof-event--locked' : ''}`,
      style: { '--event-scheduler-event-color': event.color, '--event-scheduler-event-bg': event.color, '--event-scheduler-event-border': event.color, '--event-scheduler-event-text': '#fff' },
      'data-proof-event-id': String(event.id),
    }),
    customization: { events: {
      tooltip: () => '',
      ariaLabel: context => `${context.event.title}, ${context.start.slice(11,16)} to ${context.end.slice(11,16)}`,
      content: (h, context) => {
        const compact = context.duration <= 60 || context.event.locked;
        return h('span', { class: `proof-event-content${compact ? ' proof-event-content--compact' : ''}` }, [
          h('span', { class: 'proof-event-title' }, context.event.title),
          h('span', { class: 'proof-event-details' }, [
            compact ? null : h('span', { class: 'proof-event-time' }, `${context.start.slice(11,16)}–${context.end.slice(11,16)}`),
            h('span', { class: 'proof-event-status-badge' }, 'Confirmed'),
          ]),
        ]);
      },
    } },
    resourceMetaFormatter: resource => resource.role,
    closedSlotProperties: ({ availabilityKind }) => ({ class: availabilityKind === 'blocked' ? 'proof-blocked-slot' : '' }),
    onEventMove: detail => {
      grid.eventSchedulerEvents = [...detail.events];
      const moved = detail.events.find(event => event.id === 'release');
      const resource = grid.eventSchedulerResources.find(item => item.id === moved?.resourceId);
      setStatus('accepted', 'Move accepted', `Release planning is now assigned to ${resource?.name ?? 'the new resource'}.`);
    },
  },
  eventSchedulerEvents: [...events],
  eventSchedulerResources: [
    { id:'alex', name:'Alex Morgan', role:'Release manager', group:'Team', color:'#4f46e5' },
    { id:'nina', name:'Nina Patel', role:'Customer success', group:'Team', color:'#0f766e' },
    { id:'leo', name:'Leo Wong', role:'QA lead', group:'Team', color:'#0284c7' },
    { id:'studio-a', name:'Studio A', role:'Room', group:'Spaces', color:'#ea580c' },
  ],
  eventSchedulerAvailability: [{ id:'nina-blocked', resourceId:'nina', startDateTime:`${date}T13:00:00.000Z`, endDateTime:`${date}T15:00:00.000Z`, kind:'blocked', title:'Blocked', reason:'Customer follow-up block' }],
});

document.querySelector('#scheduler-host').appendChild(grid);
grid.source = [];
window.proofGrid = grid;
window.proofStatus = setStatus;

function makeEvent(id, resourceId, title, start, end, color) {
  return { id, resourceId, title, startDateTime:`${date}T${start}:00.000Z`, endDateTime:`${date}T${end}:00.000Z`, status:'confirmed', color };
}
