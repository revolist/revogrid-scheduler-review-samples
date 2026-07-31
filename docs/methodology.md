# Methodology

The visual comparison uses one neutral operations-planning day: Monday, August 3, 2026, from 08:00 to 18:00.

| Resource | Event | Time | Purpose |
| --- | --- | --- | --- |
| Alex Morgan | Release planning | 08:30–10:00 | Normal event |
| Alex Morgan | Hotfix deploy | 09:30–11:30 | Intentional overlap |
| Nina Patel | Customer workshop | 09:00–11:00 | Normal booking |
| Leo Wong | QA validation | 11:00–13:00 | Locked event |
| Studio A | Room setup | 08:00–09:00 | Equipment/room scheduling |
| Studio A | Customer workshop | 09:00–12:00 | Consecutive booking |
| Unassigned | Urgent support | 14:00–15:30 | Unassigned demand |

Nina is blocked from 13:00 to 15:00. Alex's overlapping events are intentional. QA validation is locked. Both live comparison panels use the same date range, resource names, event names, event times, and visible viewport.

For deterministic row parity, the live comparison models `Unassigned` as an open-demand root resource in both products, followed by the Team and Spaces resource groups. The urgent support event is assigned to that open-demand pool; it represents demand that has not yet been assigned to a person or room.

## Product boundary

- `EventSchedulerPlugin` is the RevoGrid surface for bookings, shifts, rooms, event blocks, availability, conflicts, and unassigned demand.
- `GanttPlugin` is the RevoGrid surface for project tasks, dependencies, scheduling logic, and critical path.

The comparison intentionally avoids scores, winner labels, arrows, or an aggressive “VS” treatment.

## Recording validation

The proof recorder performs two real pointer interactions against RevoGrid Event Scheduler:

1. Move `Release planning` from Alex Morgan to Nina Patel and verify that the controlled event array changes resource.
2. Attempt to move it into Nina's blocked interval and verify that its resource and start time remain unchanged.

The rejection message is an explanatory capture overlay shown only after the recorder verifies that product state did not change.
