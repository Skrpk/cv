# Notion is the single source of truth for Applications

**Status:** accepted

The Board (a Notion kanban) is the only store of Application data. The backend creates and queries Notion pages directly and keeps no application database of its own; Vercel KV holds only small operational config (the Notion database ID, settings, and later agent scratch state like nudge timestamps).

## Why

This is a single-user personal tool. Notion already gives us a kanban UI, hand-editing, mobile access, and sharing for free — duplicating that in our own database would mean building and syncing a second system for no benefit. Keeping Notion authoritative means what you see on the Board is always the truth, with no reconciliation step.

## Considered options

- **Own database (Postgres/KV) as source of truth, Notion as a mirror** — rejected: forces two-way sync, and the kanban UI we wanted is exactly what Notion already is.
- **No Notion, custom UI** — rejected: rebuilds a kanban for one user.

## Consequences

- Every write/read of an Application is a Notion API call; Notion's rate limits and latency are ours. Acceptable at single-user volume.
- The Notion schema (the `Status` property's stage names, the page properties) is effectively our data contract — changing stage labels by hand in Notion can break lookups, so the Board is created and owned by setup rather than edited ad hoc.
- The future agent reads application state from Notion, not from us — it must tolerate a human having moved cards between Stages out of band.
