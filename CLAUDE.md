# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint (flat config, eslint.config.mjs)
```

- Package manager is **pnpm** (not npm).
- No test framework is configured — there are no test scripts.

## Architecture

StreamTalk is a peer-to-peer video calling app with no sign-up required. Users create or join rooms via UUID-based URLs.

**Tech stack**: Next.js 16 App Router, React 19, PeerJS (WebRTC), shadcn/ui v3 (new-york style, stone base), Tailwind CSS 3. All source files are JavaScript (`.js`/`.jsx`) — no TypeScript.

### Signaling layer (replaces Socket.IO)

The app uses a custom REST-based signaling transport instead of WebSockets — this is by design for Vercel serverless compatibility.

- **[store/socket.js](store/socket.js)** — `APISocket` class that mimics Socket.IO's event API (`on`, `off`, `emit`) but communicates via `fetch()` calls to `/api/socket` and polls every 2 seconds for room state changes. Exposed via React Context (`SocketProvider` + `useSocket()` hook).
- **[app/api/socket/route.js](app/api/socket/route.js)** — Next.js route handler (GET + POST) that manages in-memory `Map`-based room and session state. Actions: `join-room`, `get-room-users`, `leave-room`, `toggle-audio`, `toggle-video`, `ping`. Sessions auto-expire after 5 minutes of inactivity.
- Media and chat never touch the server — they flow peer-to-peer via WebRTC.

### Hook composition in the room page

The room page ([app/[roomId]/page.js](app/%5BroomId%5D/page.js)) composes four custom hooks:

| Hook | File | Responsibility |
|------|------|----------------|
| `usePeer` | [hooks/use-peer.js](hooks/use-peer.js) | Initializes PeerJS (dynamic import to avoid SSR), ICE/STUN config, joins room via socket |
| `useMediaStream` | [hooks/use-media-stream.js](hooks/use-media-stream.js) | `getUserMedia`, audio/video toggle, device enumeration and switching |
| `usePlayer` | [hooks/use-player.js](hooks/use-player.js) | Manages the players state map (`{ [peerId]: { url, muted, playing } }`), coordinates audio/video toggles with signaling |
| `useChat` | [hooks/use-chat.js](hooks/use-chat.js) | WebRTC data channel messaging — chat flows peer-to-peer, not through the server |

### Component organization

**[components/ui/](components/ui/)** contains both shadcn primitives and domain components:

- **shadcn primitives**: `button.jsx`, `card.jsx`, `input.jsx`, `sheet.jsx`, `badge.jsx`, `avatar.jsx`, `tooltip.jsx`, `separator.jsx`, `scroll-area.jsx`
- **Domain components** (composed from primitives): `simple-call-layout.jsx` (room shell), `simple-video-grid.jsx` (ReactPlayer-based video grid), `floating-controls.jsx` (bottom control bar), `simple-chat.jsx` (slide-out chat panel), `permission-request.jsx` (media permissions overlay)

### Routing

| Route | File | Purpose |
|-------|------|---------|
| `/` | [app/page.js](app/page.js) | Landing — create room (UUID v4) or join existing |
| `/[roomId]` | [app/[roomId]/page.js](app/%5BroomId%5D/page.js) | Active call room |
| `/api/socket` | [app/api/socket/route.js](app/api/socket/route.js) | Signaling API |

No middleware, no auth, no database.

## Key patterns

- **`@/` path alias** maps to project root (configured in `jsconfig.json`). Import as `@/components/ui/button`, `@/hooks/use-peer`, etc.
- **`cn()` helper** in [lib/utils.js](lib/utils.js) merges Tailwind classes via `clsx` + `tailwind-merge`. Used by all shadcn components.
- **Turbopack resolveAlias** in [next.config.js](next.config.js) maps `fs`, `net`, `tls` to [lib/empty.js](lib/empty.js) (empty module) to silence PeerJS Node.js imports in browser bundles.
- **Dynamic imports** for heavy/browser-only deps: `peerjs` is loaded with `await import("peerjs")` in `use-peer.js` to avoid SSR issues. `audio-diagnostics.js` is dynamically imported only in dev mode.
- **`"use client"` directive** — only used where needed (providers, hooks consumers, domain components). The root layout is a server component.
- **Dark mode only** — the root layout hardcodes `className="dark"`. CSS variables in [app/globals.css](app/globals.css) define both light and dark themes but only dark is active.
- **Audio diagnostics** — [utils/audio-diagnostics.js](utils/audio-diagnostics.js) provides `AudioDiagnostics` class and helpers (`quickAudioCheck`, `optimizeAudioSettings`, `applyAudioOutputDevice`, `createAudioLevelMonitor`) for debugging WebRTC audio issues. Runs automatically in dev mode.
