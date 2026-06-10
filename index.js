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

const server = new McpServer({ name: 'onchain-safety', version: '0.1.0' });

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
  async ({ chain, address }) => {
    const url = `${API_BASE}/api/v1/check?chain=${encodeURIComponent(chain)}&address=${encodeURIComponent(address)}`;
    try {
      const r = await fetch(url, { headers: API_KEY ? { 'x-api-key': API_KEY } : {} });
      const data = await r.json();
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], isError: !!data.error };
    } catch (e) {
      return { content: [{ type: 'text', text: 'request failed: ' + String((e && e.message) || e) }], isError: true };
    }
  },
);

server.connect(new StdioServerTransport())
  .then(() => console.error(`[onchain-safety-mcp] ready — tool: check_token_safety (api=${API_BASE}, key=${API_KEY ? 'set' : 'none'})`))
  .catch((e) => { console.error('[onchain-safety-mcp] failed:', e.message); process.exit(1); });
