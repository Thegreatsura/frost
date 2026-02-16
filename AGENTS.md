Never edit existing migration files after merge; add a new forward-only migration instead.

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
