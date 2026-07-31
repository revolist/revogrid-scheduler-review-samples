document.querySelector('#mapping-app').innerHTML = `
  <section class="mapping-page">
    <header class="mapping-header">
      <div class="eyebrow"><span class="eyebrow-dot"></span> PRODUCT MAPPING</div>
      <h1>Compare the correct planning components</h1>
      <p>Start with the job your users are trying to do—not two interfaces that happen to contain timelines.</p>
    </header>
    <section class="mapping-grid" aria-label="Product mapping diagram">
      ${lane('01', 'Operational scheduling', ['Bookings', 'Shifts', 'Rooms'], 'E', 'EventSchedulerPlugin', 'Resource rows · event blocks · availability · conflicts', 'scheduler')}
      ${lane('02', 'Project planning', ['Tasks', 'Dependencies', 'Critical path'], 'G', 'GanttPlugin', 'Task tree · scheduling engine · links · critical path', 'gantt')}
    </section>
    <aside class="comparison-note">
      <div class="note-icon">i</div>
      <div><span class="note-label">Important context</span><strong>Bryntum’s article tested RevoGrid’s Gantt resource-planning view—not Event Scheduler.</strong><p>That is valid Gantt evidence, but it should not be presented as a test of the booking-and-shift scheduler.</p></div>
    </aside>
    <footer class="mapping-footer"><span>RevoGrid Event Scheduler 2.4.0</span><span class="footer-rule"></span><span>Map the workflow before comparing the UI</span></footer>
  </section>`;

function lane(index, kicker, chips, mark, plugin, description, kind) {
  return `<article class="mapping-lane">
    <div class="lane-index">${index}</div>
    <div class="lane-copy"><p class="lane-kicker">${kicker}</p><div class="input-row">${chips.map(chip => `<span class="input-chip">${chip}</span>`).join('')}</div></div>
    <div class="flow-line" aria-hidden="true"><span></span></div>
    <div class="plugin-card ${kind}-card"><div class="plugin-mark ${kind}-mark">${mark}</div><div><span class="plugin-owner">RevoGrid Enterprise</span><strong>${plugin}</strong><p>${description}</p></div></div>
  </article>`;
}
