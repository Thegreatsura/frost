Never edit existing migration files after merge; add a new forward-only migration instead.

## Release policy

Do not choose bump type blindly.

- major: any commit with `BREAKING CHANGE` or major-breaking marker (`!`) in `type` or `scope`.
- minor: any commit with type `feat`.
- patch: only when no major and no `feat`.

Before any manual release, compute the recommended bump and list rationale:

```sh
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
RANGE=${LAST_TAG:+$LAST_TAG..}HEAD

git log --no-merges --pretty=format:"%h %s" "$RANGE"
git log --no-merges --pretty=format:"%h %s" "$RANGE" | rg 'BREAKING CHANGE|!:' && RECOMMENDED=major
git log --no-merges --pretty=format:"%h %s" "$RANGE" | rg '^feat(\(|:|!:) ' && RECOMMENDED=${RECOMMENDED:-minor}
if [ -z "$RECOMMENDED" ]; then RECOMMENDED=patch; fi

echo "Recommended bump: $RECOMMENDED"
```

When asked to release:
- first share the suggested bump, commit examples, and reason.
- do not trigger `gh workflow run release.yml ...` until user confirms.

If a user asks for a lower bump than recommended (example: asks `patch` when commit list has `feat`), stop and ask for confirmation to use the recommended bump.

## Demo instance ops

- Demo domain: `https://demo.frost.build`
- Demo host is currently `89.167.79.82` (run `dig +short A demo.frost.build` to confirm)
- Demo env values are in `/opt/frost/.env` on the server

Use:

- SSH in:
  - `ssh root@$(dig +short A demo.frost.build @1.1.1.1 | head -n1)`
- Check app health:
  - `ssh root@<ip> "systemctl status frost --no-pager"`
  - `ssh root@<ip> "systemctl status frost-demo-reset.timer --no-pager"`
- Update demo instance from latest `main`:
  - `ssh root@<ip> "cd /opt/frost && ./update.sh --pre-start"`
- Push local changes and deploy:
  - `git push origin main`
  - `ssh root@<ip> "cd /opt/frost && ./update.sh --pre-start"`
- Force demo reset now:
  - `ssh root@<ip> "systemctl start frost-demo-reset.service"`
- Tail logs:
  - `ssh root@<ip> "journalctl -u frost -f --no-pager"`
