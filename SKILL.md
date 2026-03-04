# LotteryFactory — AI Agent Guide

## What is this project

LotteryFactory is a blockchain lottery widget (WordPress plugin + standalone).
Admin deploys lottery contract, users buy tickets and win up to x100 their bet.
Admin earns 0–30% commission from ticket sales.

**Live:** https://lottery.onout.org/
**Repo:** https://github.com/noxonsu/LotteryFactory
**Landing:** https://onout.org/lottery/

---

## Stack

- **Frontend:** React (CRA), TypeScript
- **Contracts:** Solidity (deployed per-lottery)
- **Distribution:** WordPress plugin (lotteryfactory.php)
- **Hosting:** GitHub Pages
- **CI:** GitHub Actions → build → deploy

---

## Repository structure

```
App/                # React source
├── src/            # Components, hooks, utils
└── public/

frontend/           # Static frontend assets
lib/                # Compiled deployer (rollup)
inc/                # PHP includes
lotteryfactory.php  # WordPress plugin entry
```

---

## Build & Deploy

```bash
# Install
npm install --legacy-peer-deps

# Build
npm run build

# CI deploys automatically on push to main/master
```

**GitHub Pages:** served from `build/` folder, configured in CI.

---

## Common tasks

### Change contract on a blockchain

Edit the contract addresses in `App/src/utils/chains.ts` or equivalent config file.

### Add new blockchain support

Add network config to chains/networks definition file.

### Update WordPress plugin

Push to main → CI builds → updates GitHub Pages. WordPress plugin is updated separately.

---

## Server

```
Hosting: GitHub Pages (noxonsu/LotteryFactory)
SSH (if needed): ssh -i ~/.ssh/github_deploy_key root@95.217.227.162
```
