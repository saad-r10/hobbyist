# Skill: create-feature

Use this skill when starting any new feature.

## Steps

1. **Create GitHub issue**
   ```bash
   gh issue create --repo saad-r10/hobbyist \
     --title "Feature: {title}" \
     --label "enhancement,priority: {high|medium|low}" \
     --body "..."
   ```

2. **Note the issue number** from the output URL

3. **Create branch**
   ```bash
   git checkout dev && git pull
   git checkout -b issue-{N}-{short-name}
   ```

4. **Create implementation plan** — answer these before coding:
   - What files will change?
   - What API routes are needed?
   - What DB schema changes are needed?
   - What are the acceptance criteria?

5. **Build the feature** following CLAUDE.md conventions

6. **Commit often** with descriptive messages

7. **Push and open PR**
   ```bash
   git push -u origin issue-{N}-{short-name}
   gh pr create --base dev \
     --title "feat: {description}" \
     --body "Closes #{N}\n\n## Summary\n..."
   ```
