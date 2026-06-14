# onchain-safety-mcp

MCP (Model Context Protocol) server that gives any AI agent **on-chain token-safety tools**
for **PulseChain, Monad, Base, and BSC** — including **PulseChain, which the major token-safety
APIs (GoPlus, Honeypot.is) don't support at all** (verified June 2026). If your agent touches
PulseChain, this is the safety check.

It is a thin stdio client over the hosted API at [onchain.wick.pics](https://onchain.wick.pics)
(engine `wick-safe/0.3`). Every check is **deterministic on-chain analysis — no LLM in the
verdict path**, so results are fast, cheap, and reproducible: contract-risk heuristics,
liquidity depth, honeypot transfer-simulation, LP-burn, ownership/renounce + privilege
detection, upgradeable-proxy detection, and a wallet approval (drainer) scanner. The free tier
needs no key. *Informational, not financial advice.*

## Tools

| tool | what it answers |
|---|---|
| `check_token_safety({ chain, address })` | Is this token a scam? Verdict (`SAFE` … `LIKELY_RUG`), 0–100 score, evidence checks. |
| `fresh_rug_radar()` | What just launched, and is it safe? Last 20 freshly-created pools, safety-scored at creation. |
| `exit_safety({ chain, token, sizeUsd, maxSlippage? })` | Could I sell $X of this at acceptable slippage? Size-aware price impact + safety verdict. |
| `check_ownership({ chain, address })` | Is ownership renounced / upgradeable, and what can an active owner still do (mint, blacklist, pause, tax)? |
| `safe_to_interact({ chain, address })` | One call → SAFE_TO_INTERACT / CAUTION / DO_NOT_INTERACT, bundling safety + ownership, with reasons. |
| `wallet_approvals({ chain, owner })` | A wallet's active ERC-20 approvals, flagging unlimited grants — the drainer vector. |

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
