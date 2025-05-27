# Fundstr

*"The Patreon of Nostr — recurring, non‑custodial donations powered by Cashu e‑cash and Nostr relays.*"

![Build](https://img.shields.io/github/actions/workflow/status/yourname/schedule-cashu-donation/ci.yml?branch=main)
![License](https://img.shields.io/github/license/yourname/schedule-cashu-donation)

---

## ✨  What is it?

Schedule Cashu Donation lets anyone **pledge a daily, weekly, or monthly amount** to their favourite Nostr creators without trusting a custodial wallet or keeping their browser online.

* The **donor** creates a pledge in the web UI.
* A headless **scheduler service** queues the job and, at the allotted moment, delivers a **Cashu** token to the creator via an encrypted Nostr DM.
* The money moves automatically, the keys remain yours, and the scheduler never learns the token’s secret or controls your keys.

Think "Patreon meets Lightning" — but decentralised, censorship‑resistant, and self‑hostable.

---

## 🗺️  Repository layout

```
packages/
  scheduler-core/      # Protocol helpers, validation, signing
  scheduler-service/   # Node daemon that watches relays and executes tasks
  web-ui/              # React + Vite donation wizard
```

Each sub‑folder is an independent npm package managed through **pnpm workspaces**.

---

## 🔍  How it works (10‑second tour)

| Step | Actor         | What happens                                                                                                                                           |
| ---- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | **Donor UI**  | Builds a `pledge_instruction` event (NIP‑52 replaceable) containing: amount, recurrence rule (`RRULE:`), creator’s npub, and an encrypted Cashu token. |
| 2    | **Scheduler** | Subscribes to relays for events that tag its pubkey. It decrypts, validates, and stores each pledge in a DB queue.                                     |
| 3    | **Delivery**  | When the cron rule fires, the service signs the prepared DM with a delegated key and publishes it to the relays.                                       |
| 4    | **Creator**   | Their client decrypts the DM, redeems the Cashu token, and automatically thanks the donor (optional webhook).                                          |

More technical detail lives in [`docs/PROTOCOL.md`](docs/PROTOCOL.md).

---

## 🚀  Quick start (local dev)

```bash
# prerequisites: Node ≥ 20, pnpm ≥ 9, git

git clone https://github.com/yourname/schedule-cashu-donation.git
cd schedule-cashu-donation
corepack enable            # enables pnpm
pnpm install               # installs all workspace deps

# start the database (SQLite by default)
# for Postgres: cp .env.example .env and edit

# run the scheduler in watch‑mode with an in‑memory queue
pnpm --filter scheduler-service dev

# open the donation wizard in another terminal
pnpm --filter web-ui dev
```

Point your Nostr client at the same relays listed in `web-ui/src/config/relays.ts`, create a pledge, and watch the scheduler log as it delivers test tokens.

---

## 🐳  Run in Docker

```bash
docker build -f docker/Dockerfile -t cashu/scheduler:latest .
docker run -d --name scheduler \
  -e DB_URL="postgres://user:pass@db:5432/scheduler" \
  -v scheduler-data:/var/lib/scheduler \
  cashu/scheduler:latest
```

Combine with **docker‑compose** for Postgres, Prometheus, and Grafana (see [`docker/docker-compose.yml`](docker/docker-compose.yml)).

---

## 📚  Documentation

* [`docs/architecture.md`](docs/architecture.md) – sequence diagrams & threat model
* [`docs/PROTOCOL.md`](docs/PROTOCOL.md) – JSON schema & event kinds `31923/31924`
* [`docs/DEPLOY.md`](docs/DEPLOY.md) – step‑by‑step VPS / Fly.io / k8s guides

Docs are rendered at **[https://yourname.github.io/schedule-cashu-donation/](https://yourname.github.io/schedule-cashu-donation/)** via Docusaurus.

---

## 🤝  Contributing

1. Fork → feature branch → PR.
2. Follow **Conventional Commits** (`feat:`, `fix:` …) – CI will fail otherwise.
3. Run `pnpm lint && pnpm test` before pushing.
4. For larger features, open an issue first so we can plan together.

Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛣️  Roadmap

| Milestone | What’s inside                                                                      |
| --------- | ---------------------------------------------------------------------------------- |
| **v0.1**  | MVP: one‑off & recurring pledges, SQLite queue, CLI, Docker                        |
| **v0.2**  | Web UI polish (QR scanner, relay health badges), Postgres, Prometheus metrics      |
| **v0.3**  | Delegated signing (NIP‑26), receipts, cancel/refund events                         |
| **v1.0**  | Multi‑scheduler federation, mobile‑friendly Electron bundle, formal NIP submission |

---

## 🪪  License

**MIT** © 2025 Your Name.  See [`LICENSE`](LICENSE) for details.

---

> Made with ❤️, TypeScript, and a dash of Chaumian magic.
