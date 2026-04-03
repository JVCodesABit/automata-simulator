# Automata Simulator

A modern, interactive web application for designing and simulating **Deterministic Finite Automata (DFA)** and **Non-Deterministic Finite Automata (NFA)** with smooth animations and a premium dark UI.

---

## ✨ Features

- 🎨 **Premium dark UI** — retro-futuristic aesthetic with cyan/purple accents
- 🔁 **DFA & NFA simulation** — toggle between modes with full epsilon-closure support
- ✏️ **Visual automata builder** — drag states, add transitions interactively
- ▶️ **Step-by-step simulation** — watch transitions animate in real time
- ⚡ **Speed control** — 0.5×, 1×, 2×, 3× playback speeds
- 📋 **Simulation log** — detailed step-by-step trace at the bottom
- 🎯 **Validation** — instant feedback on DFA conflicts, missing start states, etc.
- ⌨️ **Keyboard shortcuts** — Space (play/pause), Enter (run), Esc (cancel mode)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## 🕹️ How to Use

### Building an Automaton

1. **Add States** — Click "Add State" in the sidebar, then click on the canvas
2. **Set Start State** — Hover a state → click "S" button that appears
3. **Set Accept State** — Hover a state → click "A" button to toggle
4. **Add Transitions** — Click "Add Transition" → click source state → click target state → enter symbol
5. **Rename States** — Double-click a state label to rename it
6. **Delete** — Hover a state → click "×" button; or hover a transition in sidebar → click "×"

### Simulating

1. Enter an input string in the top input field
2. Press **Play** (or Enter) to start the simulation
3. Use **Pause** to pause, **Step** to advance one step at a time
4. Check the bottom log panel for detailed trace output

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Start simulation |
| `Space` | Play / Pause |
| `Esc` | Cancel current mode |

---

## 🧠 DFA vs NFA

| Feature | DFA | NFA |
|---------|-----|-----|
| Active states | Exactly 1 | 1 or more |
| ε-transitions | ❌ | ✅ |
| Multiple transitions on same symbol | ❌ | ✅ |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **@xyflow/react** — Graph visualization (states & transitions)
- **Framer Motion** — Smooth animations
- **Tailwind CSS** — Styling
- **Lucide React** — Icons
- **Vite** — Build tool

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx         # Top navigation bar
│   ├── Sidebar.jsx        # Left control panel
│   ├── Canvas.jsx         # React Flow canvas
│   ├── SimulationLog.jsx  # Bottom step log
│   ├── CustomNode.jsx     # State node renderer
│   ├── CustomEdge.jsx     # Transition edge renderer
│   └── TransitionModal.jsx # Modal for transition label
├── utils/
│   └── automataEngine.js  # DFA/NFA simulation logic
├── App.jsx                # Main app + state management
├── main.jsx               # Entry point
└── index.css              # Global styles
```

---

## 💡 Tips

- **Self-loops**: Add a transition where source and target are the same state
- **ε-transitions**: In NFA mode, type `ε` as the transition label (or paste: ε)
- **Multiple transitions**: Multiple transitions between the same pair of states are automatically merged in the canvas view
- The first state you add automatically becomes the start state

---

## 📄 License

MIT
