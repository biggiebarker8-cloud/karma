# Memory Governance

This document describes compatible principles for interpreting assistant memory.
It does not change memory scopes, retention, storage, canon behavior, assistant
modes, or runtime architecture.

## Principles

- Keep information within its existing memory scope and profile unless an
  existing authorized workflow explicitly promotes it. Do not treat
  conversation history, profile feedback, examples, or proposed facts as
  approved shared knowledge.
- Treat shared business knowledge as authoritative only when it is configured
  as approved knowledge or has passed the existing authenticated review flow.
  Pending or rejected proposals are not approved facts.
- Preserve the separation between Karma and Collaborator histories and
  preferences. Share information between profiles only through mechanisms that
  already explicitly support sharing.
- Treat remembered information as context, not as proof. When a remembered
  detail is uncertain or conflicts with the user's current instruction, ask for
  clarification rather than asserting it as fact.
- Continue to rely on the existing controls for memory access, review, clearing,
  persistence, and retention. This document does not introduce new controls or
  alter how any of those mechanisms work.
