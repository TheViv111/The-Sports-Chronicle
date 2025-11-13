## Verify Repo State
- Check working tree and index: `git status -s`
- Confirm current branch: `git branch --show-current`
- Confirm remote configuration: `git remote -v`
- Compare with remote: `git fetch --all && git status -sb` to see ahead/behind.

## Commit Changes (if any)
- Stage updated files (e.g., `src/pages/Blog.tsx`): `git add src/pages/Blog.tsx`
- Commit with message: `git commit -m "Limit blog filters to All, Basketball, Football"`

## Push to GitHub
- Push to `origin` on `main`: `git push origin main`
- If upstream not set: `git push -u origin main`

## Sync With Remote (if behind)
- If behind remote: `git pull --rebase origin main` then `git push origin main`

## Authentication Notes
- Remote uses HTTPS; if credentials are requested, use a GitHub Personal Access Token as password.
- Ensure you have push permissions to `TheViv111/Sports-Chronicle`.

## Troubleshooting
- Permission denied: verify GitHub access or re-authenticate with Git Credential Manager.
- Protected branch: create a feature branch `git checkout -b feature/blog-filter-update`, push it, and open a PR.
- No remote set: add it `git remote add origin https://github.com/TheViv111/Sports-Chronicle.git` and `git push -u origin main`. 