# onchain-safety-mcp

MCP (Model Context Protocol) server that gives any AI agent a **token-safety check** tool:
a scam/safe verdict for ERC-20 tokens on **PulseChain, Monad, Base, and BSC**.

It is a thin stdio client over the hosted API at [onchain.wick.pics](https://onchain.wick.pics)
(engine `wick-safe/0.3`): contract risk, liquidity depth, honeypot transfer-simulation, and
LP-burn checks, condensed into one verdict.

## Tool

`check_token_safety({ chain, address })`

- `chain`: `pulsechain` | `monad` | `base` | `bsc`
- `address`: the token contract address (`0x…`)

Returns: `verdict` (`SAFE` / `LOW_RISK` / `CAUTION` / `HIGH_RISK` / `LIKELY_RUG` /
`NOT_A_TOKEN` / `UNKNOWN`), a 0–100 score, confidence, and the evidence checks.
Agents should call it before interacting with, buying, or accepting an unknown token.

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
Machine-readable index of every paid route (token-safety, fresh-rug radar, exit-safety,
smart-money signals, datasets):

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
