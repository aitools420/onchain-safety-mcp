#!/usr/bin/env node
// mcp-server.js — MCP stdio server exposing the onchain.wick.pics token-safety
// checker as an agent tool. Thin client over the hosted HTTP API, so it respects
// the tiers: free (rate-limited) by default; set ONCHAIN_API_KEY for the paid
// deep tier. Agents add this to their MCP client config.
//
//   "onchain-safety": { "command": "node", "args": ["/path/to/mcp-server.js"],
//                       "env": { "ONCHAIN_API_KEY": "wsk_…" } }   // key optional
'use strict';

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');

const API_BASE = (process.env.ONCHAIN_API_BASE || 'https://onchain.wick.pics').replace(/\/$/, '');
const API_KEY = process.env.ONCHAIN_API_KEY || '';

const server = new McpServer({ name: 'onchain-safety', version: '0.2.0' });

// Shared GET helper — every tool is a thin wrapper over one hosted endpoint.
async function apiGet(pathAndQuery) {
  try {
    const r = await fetch(API_BASE + pathAndQuery, { headers: API_KEY ? { 'x-api-key': API_KEY } : {} });
    const data = await r.json();
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], isError: !!data.error };
  } catch (e) {
    return { content: [{ type: 'text', text: 'request failed: ' + String((e && e.message) || e) }], isError: true };
  }
}

server.registerTool(
  'check_token_safety',
  {
    title: 'Check token safety',
    description: 'Scam/safe verdict for an ERC-20 token on PulseChain, Monad, Base, or BSC. Returns verdict (SAFE / LOW_RISK / CAUTION / HIGH_RISK / LIKELY_RUG / NOT_A_TOKEN / UNKNOWN), a 0-100 score, confidence, and the evidence checks (contract risk, liquidity depth, honeypot transfer-sim, LP-burn). Call this before interacting with, buying, or accepting an unknown token.',
    inputSchema: {
      chain: z.enum(['pulsechain', 'monad', 'base', 'bsc']).describe('chain the token is on'),
      address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe('the token contract address (0x…)'),
    },
  },
  ({ chain, address }) => apiGet(`/api/v1/check?chain=${encodeURIComponent(chain)}&address=${encodeURIComponent(address)}`),
);

server.registerTool(
  'fresh_rug_radar',
  {
    title: 'Fresh-pool rug radar',
    description: 'The most recently created liquidity pools, each safety-scored the moment it appeared (verdict, 0-100 score, seconds-since-creation). New tokens are where the rugs are — call this to see what just launched and whether it is safe. Free tier returns the last 20 scored pools; a paid key unlocks the fuller real-time feed.',
    inputSchema: {},
  },
  () => apiGet('/api/v1/fresh/recent'),
);

server.registerTool(
  'exit_safety',
  {
    title: 'Exit safety / liquidity depth',
    description: 'Can you sell $X of a token at acceptable slippage? Size-aware price-impact check (on-chain reserves + routed quote) plus the safety verdict. Call this BEFORE buying a position you may need to exit, or before accepting a token as payment.',
    inputSchema: {
      chain: z.enum(['pulsechain', 'monad', 'base', 'bsc']).describe('chain the token is on'),
      token: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe('the token contract address (0x…)'),
      sizeUsd: z.number().positive().describe('position size in USD you would need to exit'),
      maxSlippage: z.number().positive().optional().describe('max acceptable slippage percent (default 10)'),
    },
  },
  ({ chain, token, sizeUsd, maxSlippage }) => apiGet(
    `/api/v1/exit-safety?chain=${encodeURIComponent(chain)}&token=${encodeURIComponent(token)}&sizeUsd=${encodeURIComponent(sizeUsd)}`
    + (maxSlippage != null ? `&maxSlippage=${encodeURIComponent(maxSlippage)}` : ''),
  ),
);

server.registerTool(
  'smart_money_signals',
  {
    title: 'Safe smart-money signals',
    description: 'Tokens that multiple alpha-wallet funding clusters co-bought recently AND that pass the safety engine — a de-rugged Monad smart-money feed with per-signal confidence scores and cohort composition. Free tier is delayed ~30 min; a paid key unlocks the real-time feed.',
    inputSchema: {},
  },
  () => apiGet('/api/v1/smart-money/recent'),
);

server.registerTool(
  'what_ticker',
  {
    title: 'WHAT TICKER? — top alpha pick',
    description: 'The single highest-ranked token that alpha-wallet clusters are buying right now AND that passes the safety gate, with the reasoning and alternates. The de-rugged "what should I look at" answer. Returns pick:null when nothing clears both bars — that is signal too.',
    inputSchema: {},
  },
  () => apiGet('/api/v1/what-ticker'),
);

server.connect(new StdioServerTransport())
  .then(() => console.error(`[onchain-safety-mcp] ready — 5 tools: check_token_safety, fresh_rug_radar, exit_safety, smart_money_signals, what_ticker (api=${API_BASE}, key=${API_KEY ? 'set' : 'none'})`))
  .catch((e) => { console.error('[onchain-safety-mcp] failed:', e.message); process.exit(1); });
