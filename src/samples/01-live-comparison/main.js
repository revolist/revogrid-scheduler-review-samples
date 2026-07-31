import { defineCustomElements } from '@revolist/revogrid/loader';
import { EventSchedulerPlugin } from '@revolist/revogrid-enterprise';
import { SchedulerPro } from '@bryntum/schedulerpro';
import '@revolist/revogrid-enterprise/dist/revogrid-enterprise.css';
import '@bryntum/schedulerpro/schedulerpro.css';
import { availability, events, resources, toBryntumDate } from '../../shared/data.js';

defineCustomElements();

document.querySelector('#comparison-app').innerHTML = `
  <section class="comparison-page">
    <header class="comparison-header"><div class="eyebrow">REAL IMPLEMENTATIONS · IDENTICAL DATASET</div><h1>One planning day. Two running schedulers.</h1><p>Monday, August 3, 2026 · 08:00–18:00 · matching resources and events</p></header>
    <section class="comparison-panels">
      ${panel('RevoGrid Event Scheduler 2.4.0', 'revogrid-panel')}
      ${panel('Bryntum Scheduler Pro 7.3.4', 'bryntum-panel')}
    </section>
  </section>`;

mountRevoGrid();
mountBryntum();

function panel(title, id) {
  return `<article class="product-panel"><header class="product-label"><div><span>LIVE IMPLEMENTATION</span><strong>${title}</strong></div><em><i></i>Running</em></header><div id="${id}" class="scheduler-panel"></div></article>`;
}

function mountRevoGrid() {
  // Model open demand as the first root in the same resource tree used for the
  // Team and Spaces groups. This gives both products an identical row order.
  const comparisonResources = [
    { id:'unassigned', name:'Unassigned', role:'Open demand', color:'#64748b' },
    { id:'team', name:'Team' },
    ...resources.filter(resource => resource.group === 'Team').map(resource => ({ ...resource, parentId:'team' })),
    { id:'spaces', name:'Spaces' },
    ...resources.filter(resource => resource.group === 'Spaces').map(resource => ({ ...resource, parentId:'spaces' })),
  ];
  const resourceOrder = new Map(comparisonResources.map((resource, index) => [resource.id, index]));
  const grid = document.createElement('revo-grid');
  grid.className = 'comparison-revogrid';
  grid.theme = 'material';
  grid.hideAttribution = true;
  grid.readonly = true;
  grid.plugins = [EventSchedulerPlugin];
  Object.assign(grid, {
    eventScheduler: {
      view:'resourceTimeline', weekStartDate:'2026-08-03', dateRange:{ start:'2026-08-03', end:'2026-08-03' }, timeZone:'UTC', locale:'en-US',
      timeRange:{ start:'08:00', end:'18:00' }, slotMinutes:60, snapMinutes:30, rowSize:64, timelineColumnSize:56, resourceColumnSize:172,
      editable:false, eventLayout:'stack', maxStackedEvents:2,
      conflicts:{ enabled:true, policy:'mark', scope:'same-resource', rules:{ overlap:'warning', 'blocked-time':'error' } },
      resourceGrouping:{
        enabled:true,
        tree:true,
        parentIdField:'parentId',
        collapsed:false,
        sort:(left, right) => resourceOrder.get(left.id) - resourceOrder.get(right.id),
      },
      resourceMetaFormatter:resource => resource.role,
      timeHeaderProperties:() => ({ class:'comparison-time-header' }),
      timeLabelFormatter:minutes => String(Math.floor(minutes / 60)).padStart(2, '0'),
      closedSlotProperties:({ availabilityKind }) => ({ class:availabilityKind === 'blocked' ? 'comparison-blocked-slot' : '' }),
      eventProperties:({ event, isLocked, hasConflict }) => ({
        class:[isLocked?'comparison-event--locked':'',hasConflict?'comparison-event--conflict':'',event.id==='room-setup'?'comparison-event--orange':''].filter(Boolean).join(' '),
        style:{ '--event-scheduler-event-color':event.color, '--event-scheduler-event-bg':event.color, '--event-scheduler-event-border':event.color, '--event-scheduler-event-text':'#fff' },
      }),
      customization:{ events:{ tooltip:() => '', content:(h, context) => h('span',{ class:'comparison-event-content' },[
        context.event.locked ? h('span',{ class:'comparison-lock' },'●') : null,
        h('span',{ class:'comparison-event-title' },context.event.title),
      ]) } },
    },
    eventSchedulerResources:comparisonResources,
    eventSchedulerEvents:events.map(event => ({ ...event, resourceId:event.resourceId ?? 'unassigned' })),
    eventSchedulerAvailability:availability.map(item => ({ ...item })),
  });
  document.querySelector('#revogrid-panel').appendChild(grid);
  grid.source = [];
}

function mountBryntum() {
  const bryntumResources = [
    { id:'unassigned', name:'Unassigned', role:'Open demand' },
    { id:'team', name:'Team', expanded:true, children:resources.filter(item => item.group === 'Team').map(item => ({ ...item })) },
    { id:'spaces', name:'Spaces', expanded:true, children:resources.filter(item => item.group === 'Spaces').map(item => ({ ...item })) },
  ];
  const bryntumEvents = events.map(event => ({
    id:event.id,
    resourceId:event.resourceId ?? 'unassigned',
    name:event.title,
    startDate:toBryntumDate(event.startDateTime),
    endDate:toBryntumDate(event.endDateTime),
    eventColor:event.id === 'room-setup' ? 'orange' : undefined,
    readOnly:Boolean(event.locked),
    locked:Boolean(event.locked),
    color:event.color,
  }));
  new SchedulerPro({
    appendTo:'bryntum-panel',
    startDate:toBryntumDate('2026-08-03T08:00:00.000Z'),
    endDate:toBryntumDate('2026-08-03T18:00:00.000Z'),
    rowHeight:64,
    barMargin:4,
    readOnly:true,
    eventLayout:'stack',
    allowOverlap:true,
    columns:[{ type:'tree', text:'Resource', field:'name', width:172, renderer:({ record }) => record.role ? `<span class="b-resource-name">${record.name}<small>${record.role}</small></span>` : `<strong class="b-group-name">${record.name}</strong>` }],
    viewPreset:{ base:'hourAndDay', tickWidth:56, timeResolution:{ unit:'minute', increment:30 }, headers:[{ unit:'day', dateFormat:'ddd D MMM' },{ unit:'hour', dateFormat:'HH:mm' }] },
    resources:bryntumResources,
    events:bryntumEvents,
    resourceTimeRanges:[{ id:'nina-blocked', resourceId:'nina', name:'Blocked', startDate:toBryntumDate('2026-08-03T13:00:00.000Z'), endDate:toBryntumDate('2026-08-03T15:00:00.000Z'), cls:'bryntum-blocked' }],
    features:{
      tree:true,
      eventTooltip:false,
      scheduleTooltip:false,
      resourceTimeRanges:true,
    },
    eventRenderer:({ eventRecord, renderData }) => {
      renderData.style = {
        backgroundColor:eventRecord.color,
        borderColor:eventRecord.color,
        color:'#fff',
      };
      if (eventRecord.id === 'release' || eventRecord.id === 'hotfix') renderData.cls.add('bryntum-overlap');
      if (eventRecord.id === 'room-setup') renderData.cls.add('bryntum-room-setup');
      return `<span class="b-event-copy">${eventRecord.locked ? '<span class="b-lock">●</span>' : ''}${eventRecord.name}</span>`;
    },
  });
}
