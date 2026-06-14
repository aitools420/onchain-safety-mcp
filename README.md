# onchain-safety-mcp

MCP (Model Context Protocol) server that gives any AI agent **crypto token-safety and
alpha-discovery tools** on **PulseChain, Monad, Base, and BSC**.

It is a thin stdio client over the hosted API at [onchain.wick.pics](https://onchain.wick.pics)
(engine `wick-safe/0.3`): contract risk, liquidity depth, honeypot transfer-simulation, and
LP-burn checks, plus live signal feeds produced by an on-chain monitoring fleet.

## Tools

| tool | what it answers |
|---|---|
| `check_token_safety({ chain, address })` | Is this token a scam? Verdict (`SAFE` … `LIKELY_RUG`), 0–100 score, evidence checks. |
| `fresh_rug_radar()` | What just launched, and is it safe? Last 20 freshly-created pools, safety-scored at creation. |
| `exit_safety({ chain, token, sizeUsd, maxSlippage? })` | Could I sell $X of this at acceptable slippage? Size-aware price impact + safety verdict. |

`chain`: `pulsechain` | `monad` | `base` | `bsc` · token/address: `0x…` contract address.
Agents should call `check_token_safety` / `exit_safety` before interacting with, buying, or
accepting an unknown token.

## Install (any MCP client — Claude Desktop, agent frameworks)

```json
{
  "mcpServers": {
    "onchain-safety": {
      "command": "npx",
      "args": ["-y", "github:aitools420/onchain-safety-mcp"],
      "env": { "ONCHAIN_API_KEY": "wsk_…" }
    }
  }
}
```

`ONCHAIN_API_KEY` is **optional** — omit it for the free rate-limited tier. A `wsk_` key
unlocks the paid deep tier (get one at [onchain.wick.pics](https://onchain.wick.pics)).

## Pay-per-call for autonomous agents (x402)

The same engine is available with **no signup and no key** via the
[x402](https://www.x402.org/) pay-per-call protocol — agents pay USDC on Base per request.
Machine-readable index of every paid route (token-safety, fresh-rug radar, exit-safety):

```
https://onchain.wick.pics/.well-known/x402.json
```

Human docs: [onchain.wick.pics/agents](https://onchain.wick.pics/agents)

## Env

| var | default | purpose |
|---|---|---|
| `ONCHAIN_API_BASE` | `https://onchain.wick.pics` | API host |
| `ONCHAIN_API_KEY` | _(none — free tier)_ | `wsk_` key for the paid deep tier |

## License

MIT
