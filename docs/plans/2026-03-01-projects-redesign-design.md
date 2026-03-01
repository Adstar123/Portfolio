# Projects Section Redesign — Design Document

**Date:** 2026-03-01
**Scope:** Port OpenGTO poker trainer to run in-browser via ONNX, create dedicated project pages, redesign projects section

---

## Overview

Transform the portfolio's projects section from simple modal-based descriptions into dedicated, immersive project pages. The centrepiece is porting OpenGTO — a neural network poker trainer — to run entirely in the browser using ONNX Runtime, with no backend dependency.

---

## Architecture Decisions

### Neural Network Inference: ONNX in Browser
- Export the PyTorch `AverageStrategyNetwork` to ONNX format
- Load client-side via `onnxruntime-web`
- Model size: ~2-3MB (4.6MB PyTorch → optimised ONNX)
- Inference time: sub-millisecond for 317→6 network
- Zero hosting cost, works offline

### Routing: Dedicated Project Pages
- `/projects/opengto` — Interactive trainer + range viewer
- `/projects/ai-copilot` — Screenshot showcase
- Shared layout with back navigation
- Main page keeps modal as quick preview, modal gains "Explore Full Project →" link

### Frontend: Port React to Next.js
- Existing React components (PokerTable, ActionPanel, RangeViewer, etc.) adapted to Next.js
- Remove Electron-specific code (IPC, window controls, backend spawning)
- Replace Flask API calls with local ONNX inference
- Restyle to match portfolio dark theme with amber/orange accents

---

## Routing Structure

```
app/
  projects/
    layout.tsx              ← Shared: back nav, dark theme, page transitions
    opengto/
      page.tsx              ← Interactive OpenGTO trainer
    ai-copilot/
      page.tsx              ← Screenshot showcase
```

---

## ONNX Inference Engine

### Model Export (one-time Python script)
- Input: `checkpoints_improved/gto_trainer_final.pt`
- Export only `AverageStrategyNetwork` via `torch.onnx.export()`
- Input shape: `[1, 317]` (Float32)
- Output shape: `[1, 6]` (6 action probabilities)
- Output: `public/models/opengto_model.onnx`

### TypeScript Inference Class (`GtoInference`)
- Lazy-loads ONNX model on first use with progress indicator
- Accepts 317-dim Float32Array feature vector
- Returns 6 action probabilities after softmax + illegal action masking
- Caches ONNX session for instant subsequent inferences

### TypeScript Poker Engine (ported from Python `src/`)
- `card.ts` — Ranks, suits, 169 hand types, hand string parsing
- `gameState.ts` — Positions (6-max), actions, pot/stack tracking
- `informationSet.ts` — 317-dim feature vector encoding
- `scenarioBuilder.ts` — Random training scenario generation
- `pokerEngine.ts` — Action legality, pot calculation

---

## OpenGTO Page (`/projects/opengto`)

### Hero Section
- Title "OpenGTO" with gradient text
- Tagline + description
- Tech stack badges (PyTorch, React, TypeScript, ONNX, etc.)
- GitHub link button
- Subtle background animation matching portfolio aesthetic

### Interactive Section
- Tab bar: `Trainer` | `Range Viewer` with animated underline
- Model loading state: progress bar on first load

### Trainer Tab
- **Poker table**: Oval green felt, 6 seats, hero cards at bottom centre
- **Action panel**: 5 buttons (Fold/Check/Call/Raise/All-In) with keyboard shortcuts (F/X/C/R/A)
- **Stats panel**: Session accuracy, total hands played
- **Result feedback**: GTO strategy bars, correct/incorrect indicator
- **Next hand button**: Generates new random scenario
- Animated card reveals, sequential villain action playback (350ms stagger)

### Range Viewer Tab
- **Left**: Hero position selector (6 buttons) + opponent action configurator
- **Centre**: 13x13 range matrix (169 hands) with colour-coded strategy gradients
- **Right**: Selected hand details, action distribution percentages, mini table
- Click any cell to inspect individual hand strategy

### Design Language
- Dark background, amber/orange accents (consistent with portfolio)
- Green felt poker table (thematic contrast)
- Grain texture overlay on panels
- Framer Motion animations throughout

---

## AI Copilot Page (`/projects/ai-copilot`)

### Hero Section
- Title "AI Co-Pilot Chrome Extension" with gradient text
- Tagline + description paragraphs
- Tech stack badges
- GitHub link button (https://github.com/mahit-c/Thesis-AI-Copilot)

### Screenshot Showcase
- 3 screenshots displayed as Chrome extension popup mockups:
  1. **Login** — CopilotLogin.png
  2. **Analysing Learning Data** — CopilotLoading.png
  3. **Personalised Recommendations** — CopilotRecommendations.png
- Horizontal layout on desktop (3 across), vertical stack on mobile
- Chrome popup frame styling with drop shadow and subtle tilt
- Hover: scale-up effect. Click: lightbox full-size view
- Scroll-triggered staggered entrance animations

### Key Results Section
- Callout block with research outcomes
- Styled as quote/stats with amber accent

---

## Main Page Projects Section Update

### Project Cards (updated)
- Keep existing 3D tilt + spotlight hover effects
- Add preview visual to each card:
  - OpenGTO: static poker table image
  - AI Copilot: CopilotRecommendations screenshot
- Cards still clickable → opens modal

### Project Modal (updated)
- Keep all existing content
- Add prominent "Explore Full Project →" button linking to dedicated page
- OpenGTO variant: "Try the Trainer →"

---

## Technical Notes

### Key Dependencies to Add
- `onnxruntime-web` — Browser-based ONNX inference
- No new backend dependencies

### Model Details
- Network: 317 → 512 → 512 → 256 → 128 → 6 (with LayerNorm + ReLU + Dropout)
- Parameters: ~590K
- Actions: Fold, Check, Call, Bet, Raise, All-In
- "Correct" threshold: action frequency >25% OR within 10% of best action

### Source Files (OpenGTO at G:\OpenGTO)
- Frontend components: `frontend/src/components/`
- API layer: `frontend/src/hooks/useTrainer.ts`
- Types: `frontend/src/types/index.ts`
- Backend API: `api_server.py`
- Poker engine: `src/game_state.py`, `src/poker_engine.py`
- Feature encoding: `src/information_set.py`
- Neural network: `src/neural_network.py`
- Model checkpoint: `checkpoints_improved/gto_trainer_final.pt`
