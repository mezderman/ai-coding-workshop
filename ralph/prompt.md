# TICKETS

Ticket files from `tickets/` are provided at start of context. Each ticket has a "Blocked by" field and a "Status" field.

Work the **frontier**: only tickets whose "Blocked by" tickets are all already `Status: done`. Skip any ticket that isn't `Status: ready-for-agent`, and skip any ticket still blocked by an incomplete dependency.

You've also been passed a file containing the last few commits. Review these to understand what work has been done.

If no ticket on the frontier is ready to work, output <promise>NO MORE TASKS</promise>.

# TASK SELECTION

Among tickets on the frontier, prioritize in this order:

1. Critical bugfixes
2. Development infrastructure

Getting development infrastructure like tests and types and dev scripts ready is an important precursor to building features.

3. Tracer bullets for new features

Tracer bullets are small slices of functionality that go through all layers of the system, allowing you to test and validate your approach early. This helps in identifying potential issues and ensures that the overall architecture is sound before investing significant time in development.

TL;DR - build a tiny, end-to-end slice of the feature first, then expand it out.

4. Polish and quick wins
5. Refactors

# EXPLORATION

Explore the repo.

# IMPLEMENTATION

Use /tdd to complete the task.

# FEEDBACK LOOPS

Before committing, run the feedback loops:

- `npm run test` to run the tests
- `npm run typecheck` to run the type checker

# COMMIT

Stage and commit only the code/test files you changed — never stage or commit
anything under `tickets/`. Ticket bookkeeping is a filesystem-only step (see
THE TICKET below), not something that goes into git history.

The commit message must:

1. Include key decisions made
2. Include files changed
3. Blockers or notes for next iteration

# THE TICKET

If the task is complete, update the ticket file's `Status:` field to `done`,
check off its completed acceptance criteria, then move the file into
`tickets/done/` (create the directory if it doesn't exist). Do not commit
this move to git.

If the task is not complete, add a note to the ticket file with what was done
and leave `Status:` as `ready-for-agent` and the file in place in `tickets/`.
