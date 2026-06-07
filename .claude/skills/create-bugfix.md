# Skill: create-bugfix

Use this skill when fixing a bug.

## Steps

1. **Reproduce the bug** — confirm it exists before touching code

2. **Create GitHub issue** (if not already filed)
   ```bash
   gh issue create --repo saad-r10/hobbyist \
     --title "Bug: {short description}" \
     --label "bug,priority: high" \
     --body "## Steps to reproduce\n1. ...\n\n## Expected\n...\n\n## Actual\n..."
   ```

3. **Create branch**
   ```bash
   git checkout dev && git pull
   git checkout -b issue-{N}-{bug-description}
   ```

4. **Identify root cause** — read the relevant files before editing

5. **Fix the bug** — minimal change, no drive-by refactors

6. **Verify the fix** — manually test the exact steps to reproduce

7. **Commit and push**
   ```bash
   git commit -m "fix: {what was broken and how it's fixed}"
   git push -u origin issue-{N}-{bug-description}
   gh pr create --base dev --title "fix: ..." --body "Closes #{N}"
   ```
