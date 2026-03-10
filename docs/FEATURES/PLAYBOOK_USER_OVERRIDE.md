# Playbook user override behavior

When a coordinator is hired, the game auto-syncs the side's playbook to the coordinator's `scheme` **only when the user has not manually chosen a playbook**.

- `playbooks.userOverride.offense === false`: hiring an OC updates `playbooks.offensePlaybookId` to the OC scheme.
- `playbooks.userOverride.defense === false`: hiring a DC updates `playbooks.defensePlaybookId` to the DC scheme.
- Any `SET_PLAYBOOK` action marks that side as manually overridden (`true`), preventing future staff hires from overwriting it.
