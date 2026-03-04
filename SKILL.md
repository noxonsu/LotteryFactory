# LotteryFactory — AI Agent Guide

## What is this project

LotteryFactory is a blockchain lottery widget (WordPress plugin + standalone).
Admin deploys lottery contract, users buy tickets and win up to x100 their bet.
Admin earns 0–30% commission from ticket sales.

**Live demo:** https://appsource.github.io/lottery/
**Source repo:** https://github.com/noxonsu/LotteryFactory
**Deploy repo:** https://github.com/appsource/lottery (built from noxonsu/LotteryFactory CI)
**Landing:** https://onout.org/lottery/

---

## Current deployment (BSC Testnet — 2026-03-04)

| Parameter | Value |
|-----------|-------|
| Chain | BSC Testnet (chainId 97) |
| RPC | https://bsc-testnet-rpc.publicnode.com |
| Contract | `0xa4729b743579d46de8edfece6e1fa2ff2f2fb631` |
| Token | WEENUS `0x703f112Bda4Cc6cb9c5FB4B2e6140f6D8374F10b` (18 dec) |
| Explorer | https://testnet.bscscan.com/address/0xa4729b743579d46de8edfece6e1fa2ff2f2fb631 |
| Operator / Treasury / Injector | `0x0b5Ce0876F4Ddae8612d4a3E3587f27dd46820C6` |
| Current lottery ID | 2 (Open, closes 2026-03-05T19:09:55 UTC) |

---

## Stack

- **Frontend:** React (CRA), TypeScript — in `frontend/`
- **Contracts:** Solidity (PancakeSwap Lottery V2 fork)
- **Contract ABI+bytecode:** `static/contracts/source/artifacts/PancakeSwapLottery.json`
- **Distribution:** WordPress plugin (`lotteryfactory.php`) + standalone
- **Config:** `window.SO_LotteryConfig` in `frontend/public/index.html`
- **CI:** GitHub Actions (`.github/workflows/deploy.yml`) — builds and deploys

---

## Repository structure

```
frontend/
  public/
    index.html          # window.SO_LotteryConfig here — EDIT THIS to change network/contract
  src/                  # React frontend source
lib/
  lotterydeployer.js    # Compiled browser deployer (rollup bundle, browser-only)
src/
  deployer/             # TypeScript source of the deployer
    index.ts            # deploy(), startLottery(), closeLottery(), drawNumbers()
    constants.ts        # AVAILABLE_NETWORKS_INFO (all supported chains)
static/
  contracts/
    source/artifacts/
      PancakeSwapLottery.json  # ABI + bytecode for on-chain deployment
lotteryfactory.php      # WordPress plugin entry point
SKILL.md                # This file
```

---

## SO_LotteryConfig parameters

Defined in `frontend/public/index.html` — the only config file for the frontend.

```js
window.SO_LotteryConfig = {
  chainId: 97,                     // EVM chain ID (97 = BSC Testnet, 56 = BSC, 1 = Ethereum)
  chainName: 'BSC Testnet',        // Human-readable network name
  rpc: "https://...",              // JSON-RPC endpoint
  etherscan: "https://...",        // Block explorer base URL
  contract: "0x...",              // Deployed PancakeSwapLottery contract address

  token: {
    symbol: "WEENUS",             // Token ticker shown in UI
    address: "0x...",             // ERC-20 token address (lottery ticket currency)
    decimals: 18,                 // Token decimals
    title: "WEENUS",             // Display name
    price: false,                 // USD price (false = don't show)
    viewDecimals: 4               // Decimal places to show in UI
  },

  buyTokenLink: false,            // URL to buy the token (false = hide button)
  numbersCount: 6,                // Ticket numbers count (2..6, must match contract)
  hideServiceLink: false,         // Hide "Powered by" link

  winPercents: {                  // Must match rewardsBreakdown passed to startLottery()
    burn: 2,                      // % burned (not paid out)
    match_1: 1.25,               // % for matching 1 number
    match_2: 3.75,
    match_3: 7.5,
    match_4: 12.5,
    match_5: 25,
    match_6: 50,                 // % for jackpot (all numbers)
  },

  menu: [],                      // Navigation menu items [{title, link, blank}]
  logo: 'https://...',           // Logo URL
}
```

**rewardsBreakdown mapping:** `winPercents` values × 100 = `rewardsBreakdown` array in startLottery.
Example: `match_1: 1.25` → `125`, `match_6: 50` → `5000`. All values + burn must sum to 10000.

---

## Deploying a new contract (viem, server-side)

Use viem CJS from `/root/unifactory/node_modules/viem/_cjs/`.

```js
const { createWalletClient, createPublicClient, http } = require('/root/unifactory/node_modules/viem/_cjs/index.js');
const { privateKeyToAccount } = require('/root/unifactory/node_modules/viem/_cjs/accounts/index.js');
const { bscTestnet } = require('/root/unifactory/node_modules/viem/_cjs/chains/index.js');
const json = require('/root/LotteryFactory/static/contracts/source/artifacts/PancakeSwapLottery.json');

const PRIVATE_KEY = '0x...';  // from /root/PolyFactory/.env → DEPLOYER_PRIVATE_KEY
const TOKEN_ADDRESS = '0x703f112Bda4Cc6cb9c5FB4B2e6140f6D8374F10b'; // WEENUS BSC testnet
const RPC = 'https://bsc-testnet-rpc.publicnode.com';

const chain = { ...bscTestnet, rpcUrls: { default: { http: [RPC] } } };
const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({ account, chain, transport: http(RPC) });
const publicClient = createPublicClient({ chain, transport: http(RPC) });

// 1. Deploy contract
const hash = await walletClient.deployContract({
  abi: json.abi,
  bytecode: '0x' + json.data.bytecode.object,
  args: [TOKEN_ADDRESS, true],  // tokenAddress, OnoutFeeEnabled
  gas: 6000000n,
});
const receipt = await publicClient.waitForTransactionReceipt({ hash });
const contractAddress = receipt.contractAddress;

// 2. Set operator (REQUIRED before startLottery)
await walletClient.writeContract({
  address: contractAddress,
  abi: json.abi,
  functionName: 'setOperatorAndTreasuryAndInjectorAddresses',
  args: [account.address, account.address, account.address],
});
```

**Constructor args:** `(tokenAddress: address, OnoutFeeEnabled: bool)`
- `OnoutFeeEnabled: true` means platform fee is enabled

---

## How to start a new lottery round

After previous round is closed/claimable (status 2 or 3), start a new one:

```js
const endTime = BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60); // 24h from now
const priceTicket = 1000000000000000000n; // 1 WEENUS (adjust for token decimals)
const discountDivisor = 2000n;            // bulk discount divisor (min 300)
// rewardsBreakdown must sum to 10000
const rewardsBreakdown = [125n, 375n, 750n, 1250n, 2500n, 5000n]; // match1..match6
const treasuryFee = 2000n;               // 20% treasury fee (max 3000 = 30%)

await walletClient.writeContract({
  address: CONTRACT,
  abi: json.abi,
  functionName: 'startLottery',
  args: [endTime, priceTicket, discountDivisor, rewardsBreakdown, treasuryFee],
});
```

**Lottery status enum:** 0=Pending, 1=Open, 2=Close, 3=Claimable

---

## How to close a lottery round

Must be called after `endTime` has passed. Only operator can call.

```js
const lotteryId = await publicClient.readContract({
  address: CONTRACT, abi: json.abi, functionName: 'currentLotteryId'
});

await walletClient.writeContract({
  address: CONTRACT,
  abi: json.abi,
  functionName: 'closeLottery',
  args: [lotteryId],
});
```

---

## How to draw winners (finalize round)

After closing, draw the winning numbers and make tickets claimable.
`_seed` is a random bytes32 value — use a fresh random hex for each draw.

```js
const seed = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
  .map(b => b.toString(16).padStart(2, '0')).join('');

await walletClient.writeContract({
  address: CONTRACT,
  abi: json.abi,
  functionName: 'drawFinalNumberAndMakeLotteryClaimable',
  args: [lotteryId, seed, true],  // lotteryId, seed, autoInjection
});
```

**autoInjection:** if `true`, unclaimed prize pool rolls over to next lottery.

---

## How to check current lottery state

```js
const lotteryId = await publicClient.readContract({
  address: CONTRACT, abi: json.abi, functionName: 'currentLotteryId'
});
const info = await publicClient.readContract({
  address: CONTRACT, abi: json.abi, functionName: 'viewLottery', args: [lotteryId]
});
// info.status: 0=Pending, 1=Open, 2=Close, 3=Claimable
// info.endTime: BigInt unix timestamp
// info.amountCollectedInCake: total tickets sold (in token units)
```

---

## Build & Deploy

```bash
# Install root deps
npm install --legacy-peer-deps

# Build contracts (rollup → lib/)
npm run build

# Build frontend (React CRA → frontend/build/)
cd frontend && npm install --legacy-peer-deps && npm run build_clean

# CI deploys automatically on push to main
# GitHub Actions → build → SCP to farm.wpmix.net + deploy to appsource/lottery via APPSOURCE_TOKEN
```

**To update config and deploy:** Edit `frontend/public/index.html`, commit, push to main.

---

## Adding a new blockchain

1. Add network info to `src/deployer/constants.ts` → `AVAILABLE_NETWORKS_INFO`
2. Deploy contract to the new chain (see "Deploying a new contract" above)
3. Update `window.SO_LotteryConfig` in `frontend/public/index.html`
4. Push to main → CI rebuilds and deploys

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "Lottery is not open" | No active round | Call `startLottery()` as operator |
| "Not operator" | Wrong address calling operator functions | Set operator via `setOperatorAndTreasuryAndInjectorAddresses` |
| "End time must be > 4 hours" | endTime too soon | Set endTime at least 4h in future |
| "Min < Max ticket price" | Wrong price limits | Check `minPriceTicketInCake` / `maxPriceTicketInCake` |
| Frontend shows wrong chain | Old config in index.html | Edit `frontend/public/index.html`, rebuild |
| rewardsBreakdown error | Sum != 10000 | Values must sum exactly to 10000 |

---

## Server

```
Source repo: github.com/noxonsu/LotteryFactory
Deploy repo: github.com/appsource/lottery (CI pushes built frontend/build/ here)
Live URL: https://appsource.github.io/lottery/
SSH (if needed): ssh -i ~/.ssh/github_deploy_key root@95.217.227.162
```
