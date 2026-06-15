# Ink + React: Zero to Hero
### Build Interactive Terminal Apps with React

---

## Table of Contents

1. [Why Does This Exist? The Problem Before React](#1-why-does-this-exist-the-problem-before-react)
2. [React from Scratch — The Mental Model](#2-react-from-scratch--the-mental-model)
3. [JSX — Writing HTML-like Syntax in JavaScript](#3-jsx--writing-html-like-syntax-in-javascript)
4. [Components — The LEGO Bricks of UI](#4-components--the-lego-bricks-of-ui)
5. [Props — Passing Data into Components](#5-props--passing-data-into-components)
6. [State — Making Things Reactive](#6-state--making-things-reactive)
7. [useEffect — Reacting to Changes](#7-useeffect--reacting-to-changes)
8. [How Components Talk to Each Other](#8-how-components-talk-to-each-other)
9. [What Is Ink?](#9-what-is-ink)
10. [Setting Up Your First Ink Project](#10-setting-up-your-first-ink-project)
11. [Ink's Building Blocks: Text and Box](#11-inks-building-blocks-text-and-box)
12. [Layout with Flexbox in the Terminal](#12-layout-with-flexbox-in-the-terminal)
13. [Handling User Input](#13-handling-user-input)
14. [Focus Management](#14-focus-management)
15. [App Lifecycle — Exiting Properly](#15-app-lifecycle--exiting-properly)
16. [Static Output — Logs That Don't Scroll Away](#16-static-output--logs-that-dont-scroll-away)
17. [Useful Community Components](#17-useful-community-components)
18. [Real Project: Build an Interactive File Browser](#18-real-project-build-an-interactive-file-browser)
19. [Testing Ink Apps](#19-testing-ink-apps)
20. [What's Next?](#20-whats-next)

---

## 1. Why Does This Exist? The Problem Before React

Before frameworks like React existed, building any interactive UI — whether on the web or in a terminal — meant writing **imperative code**. That means you had to manually tell the computer *every single step*:

```javascript
// Old imperative way (pseudo-code)
let count = 0;

function increment() {
  count++;
  // You must manually find the element and update it yourself
  document.getElementById('counter').innerText = count;
}
```

The problem with this approach is: **you are managing the UI manually**. Every time data changes, you must remember to update every part of the screen that depends on it. This gets messy very quickly.

React's answer: **describe what the UI should look like for a given state, and let React figure out how to update the screen.** You stop giving step-by-step instructions. Instead, you write a "template" that says:

> "When count is 5, the screen should show the number 5. I don't care HOW you draw it."

This idea — describing the *desired result* instead of the *steps to get there* — is called **declarative programming**. It's the core philosophy of React.

Ink takes this exact same philosophy and applies it to the terminal. Instead of manually writing ANSI escape codes to move the cursor and draw characters, you write React components and Ink figures out how to paint them in the terminal.

---

## 2. React from Scratch — The Mental Model

Before writing any code, you need to understand React's core mental model. It has three layers:

```
┌─────────────────────────────────────┐
│            Your Components           │  ← You write this
│   <App> → <Header> → <Button> ...   │
├─────────────────────────────────────┤
│         React Core (Reconciler)      │  ← React manages this
│   Tracks what changed, diffs trees  │
├─────────────────────────────────────┤
│              Renderer                │  ← Platform-specific
│   react-dom → browser DOM           │
│   ink       → terminal output       │
└─────────────────────────────────────┘
```

**The key insight:** React Core doesn't know or care about the browser or the terminal. It only manages a tree of components and tracks what changed. The *renderer* (react-dom, Ink, etc.) is the one that actually draws pixels or characters.

**The render cycle works like this:**

1. You define components (functions that return a description of UI)
2. State or props change somewhere
3. React Core re-runs the affected components to get a new description
4. React diffs the old description vs the new one
5. The renderer updates only the parts that changed

This diff-and-update step is why React is efficient. It never redraws everything from scratch.

---

## 3. JSX — Writing HTML-like Syntax in JavaScript

When you look at React code, you'll see something that looks like HTML inside JavaScript. This is called **JSX**.

```jsx
// This looks like HTML, but it's JSX
const element = <Text color="green">Hello World</Text>;
```

JSX is **not** HTML. It's just a syntax shortcut that gets transformed into regular JavaScript function calls by a tool called Babel. Under the hood, `<Text color="green">Hello</Text>` becomes:

```javascript
React.createElement(Text, { color: "green" }, "Hello")
```

You don't need to memorize this. Just know that JSX is "JavaScript that looks like markup" and it compiles to normal JS. The rules of JSX are slightly different from HTML:

- All tags must be closed: `<Box />` not `<Box>`
- `class` becomes `className` (because `class` is a reserved word in JS)
- You embed JavaScript expressions using curly braces `{}`
- A component must return a single root element (use `<>...</>` as an invisible wrapper if needed)

```jsx
// Embedding JS expressions in JSX
const name = "Temicide";
const element = <Text>Hello, {name}!</Text>;

// Using the invisible wrapper fragment
const twoThings = (
  <>
    <Text>First line</Text>
    <Text>Second line</Text>
  </>
);
```

---

## 4. Components — The LEGO Bricks of UI

A **component** in React is just a JavaScript function that returns JSX. That's it.

```jsx
// A component is a function that returns JSX
function Greeting() {
  return <Text>Hello, World!</Text>;
}

// Arrow function syntax (same thing)
const Greeting = () => {
  return <Text>Hello, World!</Text>;
};

// If it's just one expression, you can skip the return
const Greeting = () => <Text>Hello, World!</Text>;
```

**Rules for components:**
- The function name MUST start with a capital letter (`Greeting`, not `greeting`). This is how React distinguishes your components from built-in elements.
- A component must always return something (JSX, null, or a string).

**Why break things into components?** Reusability and clarity. Instead of one giant mess of JSX, you compose small, focused pieces together:

```jsx
// Each piece is its own component
const Header = () => (
  <Box borderStyle="round" padding={1}>
    <Text bold color="cyan">My App v1.0</Text>
  </Box>
);

const StatusBar = () => (
  <Box>
    <Text color="green">● Running</Text>
  </Box>
);

// The App component composes them together
const App = () => (
  <>
    <Header />
    <StatusBar />
  </>
);
```

This is the **component tree**. `App` is the root, and it renders `Header` and `StatusBar` as children. This tree is what React manages internally.

---

## 5. Props — Passing Data into Components

A component that always renders the same thing is not very useful. **Props** (short for properties) are how you pass data *into* a component from the outside.

Think of a component like a function and props like function arguments.

```jsx
// Defining a component that accepts props
const Greeting = ({ name, color }) => (
  <Text color={color}>Hello, {name}!</Text>
);

// Using the component with different props
const App = () => (
  <>
    <Greeting name="Temicide" color="green" />
    <Greeting name="Claude" color="cyan" />
    <Greeting name="World" color="yellow" />
  </>
);
```

Props flow **one direction only: from parent to child.** A child component cannot directly modify its parent's data. This one-way data flow makes React apps predictable and easy to debug.

**Default props** — you can set fallback values for props that aren't provided:

```jsx
const Greeting = ({ name = "stranger", color = "white" }) => (
  <Text color={color}>Hello, {name}!</Text>
);

// Works even without props
<Greeting /> // renders "Hello, stranger!" in white
```

**The `children` prop** — special prop that represents everything between your component's opening and closing tags:

```jsx
const Box = ({ children }) => (
  <Box borderStyle="round">{children}</Box>
);

// Used like this
<Box>
  <Text>I am the children</Text>
</Box>
```

---

## 6. State — Making Things Reactive

Props come from the outside. **State** is data that lives *inside* a component and can change over time. When state changes, React automatically re-renders the component.

State is managed with the `useState` hook. A **hook** is a special React function that starts with `use`. You call it inside a component.

```jsx
import { useState } from 'react';

const Counter = () => {
  // useState(initialValue) returns [currentValue, setterFunction]
  const [count, setCount] = useState(0);

  // ... rest of the component
};
```

`useState` returns an array with exactly two items:
1. The current value of the state
2. A function to update that value (calling it triggers a re-render)

**Important:** You NEVER modify state directly. You always use the setter function.

```jsx
// WRONG — React won't know this changed
count = count + 1;

// CORRECT — React sees this, re-renders the component
setCount(count + 1);

// Also correct — using a function form (safer when new value depends on old)
setCount(prev => prev + 1);
```

A full counter example with Ink:

```jsx
import React, { useState } from 'react';
import { render, Text, Box } from 'ink';
import { useInput } from 'ink';

const Counter = () => {
  const [count, setCount] = useState(0);

  useInput((input, key) => {
    if (input === '+') setCount(prev => prev + 1);
    if (input === '-') setCount(prev => prev - 1);
    if (input === 'r') setCount(0);
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text>Count: <Text color="green" bold>{count}</Text></Text>
      <Text dimColor>Press + to increment, - to decrement, r to reset</Text>
    </Box>
  );
};

render(<Counter />);
```

---

## 7. useEffect — Reacting to Changes

`useEffect` lets you run side effects — things that happen *as a consequence* of renders. Common use cases: timers, subscriptions, fetching data, cleaning up resources.

```jsx
import { useState, useEffect } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // This code runs after the component renders
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // The return function is a CLEANUP function
    // React calls it when the component is removed from the tree
    return () => clearInterval(interval);
  }, []); // The [] means "run this effect only once, on mount"

  return <Text>Elapsed: {seconds}s</Text>;
};
```

The second argument to `useEffect` is the **dependency array**. It controls WHEN the effect re-runs:

```jsx
// Runs after EVERY render (no dependency array)
useEffect(() => { ... });

// Runs ONCE when the component first appears (empty array)
useEffect(() => { ... }, []);

// Runs whenever `name` or `count` changes
useEffect(() => { ... }, [name, count]);
```

---

## 8. How Components Talk to Each Other

Now the big picture: how do multiple components share and exchange data?

**Parent → Child: Props**

```jsx
const Parent = () => {
  const [name] = useState("Temicide");
  return <Child name={name} />;
};

const Child = ({ name }) => <Text>Hello, {name}</Text>;
```

**Child → Parent: Callback functions passed as props**

The parent passes a function down as a prop. The child calls that function when something happens. This is called "lifting state up."

```jsx
const Parent = () => {
  const [message, setMessage] = useState("waiting...");

  // This function will be called by the child
  const handleInput = (text) => {
    setMessage(text);
  };

  return (
    <>
      <Text>Message received: {message}</Text>
      <ChildInput onSubmit={handleInput} />
    </>
  );
};

const ChildInput = ({ onSubmit }) => {
  useInput((input) => {
    if (input === 'h') onSubmit("Hello from the child!");
  });
  return <Text dimColor>Press h to send a message up</Text>;
};
```

**Sibling → Sibling: Lift state to the common parent**

If two siblings need to share state, move that state into their parent and pass it down to both.

```jsx
const App = () => {
  const [selected, setSelected] = useState(0);
  return (
    <>
      <Menu onSelect={setSelected} />
      <Content selectedIndex={selected} />
    </>
  );
};
```

---

## 9. What Is Ink?

Now that you understand React, Ink is simple: it's a **React renderer that targets the terminal instead of the browser.**

- It replaces `react-dom` with its own renderer
- It uses **Yoga** (Facebook's Flexbox engine) for layout, so you get real Flexbox in the terminal
- It provides terminal-specific components (`<Text>`, `<Box>`) and hooks (`useInput`, `useFocus`, etc.)
- All standard React features work: `useState`, `useEffect`, Context, Suspense, everything

The result: you write components the exact same way you would for a web app, and they appear in the terminal.

**Notable real-world users:** Claude Code (Anthropic), Gemini CLI (Google), GitHub Copilot CLI, Cloudflare Wrangler, Gatsby, Prisma, Shopify CLI.

---

## 10. Setting Up Your First Ink Project

The fastest way to start is with the official scaffolding tool:

```bash
# Create a new Ink project
npx create-ink-app my-cli

# For TypeScript (recommended)
npx create-ink-app --typescript my-cli

cd my-cli
```

This sets up Node.js, Babel (JSX transpiler), and Ink with the correct configuration. The entry file will look like:

```jsx
// source/app.jsx (or app.tsx)
import React from 'react';
import { Text } from 'ink';

const App = ({ name = 'Stranger' }) => (
  <Text>
    Hello, <Text color="green">{name}</Text>
  </Text>
);

export default App;
```

```javascript
// cli.js — the entry point
import React from 'react';
import { render } from 'ink';
import App from './source/app.js';

render(<App name="Temicide" />);
```

**Run it:**

```bash
node cli.js
# or if using the dev script:
npm start
```

**Manual setup (without create-ink-app):**

```bash
mkdir my-cli && cd my-cli
npm init -y
npm install ink react
npm install --save-dev @babel/core @babel/preset-react babel-node
```

Create `babel.config.json`:

```json
{
  "presets": ["@babel/preset-react"]
}
```

---

## 11. Ink's Building Blocks: Text and Box

Ink has only two core layout primitives: `<Text>` and `<Box>`.

### `<Text>` — Displaying Text

All text in Ink MUST be inside a `<Text>` component. You cannot put raw text directly inside a `<Box>`.

```jsx
import { Text } from 'ink';

// Basic text
<Text>Hello World</Text>

// Colors — supports named colors, hex, and rgb
<Text color="green">Green text</Text>
<Text color="#ff6b6b">Hex color</Text>
<Text color="rgb(100, 200, 150)">RGB color</Text>

// Background color
<Text backgroundColor="blue" color="white">White on Blue</Text>

// Styling
<Text bold>Bold text</Text>
<Text italic>Italic text</Text>
<Text underline>Underlined text</Text>
<Text strikethrough>Strikethrough</Text>
<Text dimColor>Dimmed (subtle) text</Text>

// Inverse (swap foreground/background)
<Text inverse>Inverted colors</Text>

// Text wrapping behavior
<Box width={20}>
  <Text wrap="wrap">This will wrap to next line if too long</Text>
  <Text wrap="truncate">This will be cut off with…</Text>
  <Text wrap="truncate-middle">He…ld</Text>
</Box>

// Nesting Text components
<Text>
  Normal text with <Text color="cyan" bold>cyan bold</Text> inside
</Text>
```

### `<Box>` — Layout Container

`<Box>` is like a `<div style="display: flex">` in the browser. Every `<Box>` is a Flexbox container by default.

```jsx
import { Box, Text } from 'ink';

// Basic box with padding
<Box padding={1}>
  <Text>Padded content</Text>
</Box>

// Box with border
<Box borderStyle="round" padding={1}>
  <Text>I have a rounded border</Text>
</Box>

// Border styles: single, double, round, bold, singleDouble, doubleSingle, classic
<Box borderStyle="single"><Text>single</Text></Box>
<Box borderStyle="double"><Text>double</Text></Box>
<Box borderStyle="bold" borderColor="red"><Text>bold red border</Text></Box>

// Dimensions
<Box width={40} height={5}>
  <Text>Fixed size box</Text>
</Box>

// Percentage widths
<Box width="50%">
  <Text>Half width</Text>
</Box>

// Margin
<Box marginTop={1} marginBottom={1} marginLeft={2}>
  <Text>Box with margin</Text>
</Box>

// Shorthand padding/margin
<Box padding={2}>...</Box>       // all sides
<Box paddingX={2}>...</Box>      // left and right
<Box paddingY={1}>...</Box>      // top and bottom

// Hide element
<Box display="none">
  <Text>This won't show</Text>
</Box>
```

### `<Newline>` and `<Spacer>`

```jsx
import { Text, Newline, Spacer, Box } from 'ink';

// Newline inside Text
<Text>
  Line one
  <Newline />
  Line two
  <Newline count={2} />
  Line four (skipped three)
</Text>

// Spacer — pushes items to opposite ends
<Box>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</Box>
// Output: Left                Right
```

---

## 12. Layout with Flexbox in the Terminal

Since every `<Box>` is a Flexbox container, you get the full Flexbox model in your terminal.

### Direction

```jsx
// Row (default) — children side by side horizontally
<Box flexDirection="row">
  <Text>A</Text>
  <Text>B</Text>
  <Text>C</Text>
</Box>
// A B C

// Column — children stacked vertically
<Box flexDirection="column">
  <Text>A</Text>
  <Text>B</Text>
  <Text>C</Text>
</Box>
// A
// B
// C
```

### Alignment

```jsx
// justifyContent controls main axis (horizontal in row, vertical in column)
<Box justifyContent="flex-start"><Text>X</Text></Box>  // [X      ]
<Box justifyContent="center"><Text>X</Text></Box>      // [   X   ]
<Box justifyContent="flex-end"><Text>X</Text></Box>    // [      X]
<Box justifyContent="space-between">
  <Text>A</Text><Text>B</Text>
</Box>  // [A      B]

// alignItems controls cross axis
<Box alignItems="flex-start">...</Box>
<Box alignItems="center">...</Box>
<Box alignItems="flex-end">...</Box>
```

### Flex Grow — Filling Available Space

```jsx
// Without flexGrow — elements only take up the space they need
<Box>
  <Text>Label: </Text>
  <Box flexGrow={1}>
    <Text>This box fills all remaining space</Text>
  </Box>
</Box>
```

### Gap Between Items

```jsx
<Box gap={1}>
  <Text>A</Text>
  <Text>B</Text>
  <Text>C</Text>
</Box>
// A  B  C  (1 space gap between items)
```

### Practical Layout Patterns

**Two-column layout:**
```jsx
const TwoColumn = () => (
  <Box>
    <Box width="30%" borderStyle="single" padding={1}>
      <Text bold>Sidebar</Text>
    </Box>
    <Box flexGrow={1} padding={1}>
      <Text>Main content area</Text>
    </Box>
  </Box>
);
```

**Header + Content + Footer:**
```jsx
const Layout = () => (
  <Box flexDirection="column" height={20}>
    <Box borderStyle="single" paddingX={1}>
      <Text bold>My App</Text>
    </Box>
    <Box flexGrow={1} padding={1}>
      <Text>Content here...</Text>
    </Box>
    <Box borderStyle="single" paddingX={1}>
      <Text dimColor>Press q to quit</Text>
    </Box>
  </Box>
);
```

**Centered content:**
```jsx
const Centered = () => (
  <Box justifyContent="center" alignItems="center" height={10}>
    <Text>I am centered!</Text>
  </Box>
);
```

---

## 13. Handling User Input

The `useInput` hook is how you listen to keyboard events. It calls your handler function every time the user presses a key.

```jsx
import { useInput } from 'ink';

const MyComponent = () => {
  useInput((input, key) => {
    // `input` is the character string the user typed
    // `key` is an object with boolean flags for special keys

    if (input === 'q') {
      // User pressed 'q'
    }

    if (key.upArrow) {
      // User pressed the up arrow key
    }

    if (key.return) {
      // User pressed Enter
    }

    if (key.ctrl && input === 'c') {
      // User pressed Ctrl+C
    }
  });

  return <Text>Listening for input...</Text>;
};
```

**All available key flags:**

| Flag | Key |
|---|---|
| `key.upArrow` | ↑ Arrow |
| `key.downArrow` | ↓ Arrow |
| `key.leftArrow` | ← Arrow |
| `key.rightArrow` | → Arrow |
| `key.return` | Enter |
| `key.escape` | Escape |
| `key.ctrl` | Ctrl (combined with input) |
| `key.shift` | Shift |
| `key.tab` | Tab |
| `key.backspace` | Backspace |
| `key.delete` | Delete |
| `key.pageUp` | Page Up |
| `key.pageDown` | Page Down |
| `key.home` | Home |
| `key.end` | End |
| `key.meta` | Meta/Alt key |

**Text input example — building a simple prompt:**

```jsx
import React, { useState } from 'react';
import { render, Text, Box, useInput } from 'ink';

const Prompt = () => {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState('');

  useInput((char, key) => {
    if (key.return) {
      setSubmitted(input);
      setInput('');
    } else if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
    } else if (char && !key.ctrl && !key.meta) {
      setInput(prev => prev + char);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text color="cyan">› </Text>
        <Text>{input}</Text>
        <Text inverse> </Text>
      </Box>
      {submitted && (
        <Text color="green">You typed: {submitted}</Text>
      )}
    </Box>
  );
};

render(<Prompt />);
```

> **Tip:** The community `ink-text-input` package gives you a polished text input component out of the box. Install it with `npm install ink-text-input`.

**Paste handling with `usePaste`:**

```jsx
import { usePaste } from 'ink';

const PasteDemo = () => {
  const [pasted, setPasted] = useState('');

  usePaste((text) => {
    setPasted(text);
  });

  return <Text>Pasted: {pasted}</Text>;
};
```

---

## 14. Focus Management

When you have multiple interactive areas, you need to track which one is currently focused. Ink handles this automatically via Tab key cycling.

```jsx
import { useFocus, useFocusManager, useInput } from 'ink';

// A focusable input field
const InputField = ({ label }) => {
  const { isFocused } = useFocus();

  return (
    <Box>
      <Text color={isFocused ? 'cyan' : 'white'}>
        {isFocused ? '› ' : '  '}
        {label}:
      </Text>
      <Box
        borderStyle="single"
        borderColor={isFocused ? 'cyan' : 'gray'}
        paddingX={1}
        width={20}
      >
        <Text>{isFocused ? 'typing...' : 'press tab'}</Text>
      </Box>
    </Box>
  );
};

const Form = () => {
  return (
    <Box flexDirection="column" gap={1} padding={1}>
      <Text bold>Registration Form</Text>
      <InputField label="Name" />
      <InputField label="Email" />
      <InputField label="Password" />
      <Text dimColor>Tab to move between fields</Text>
    </Box>
  );
};
```

**Programmatic focus control:**

```jsx
const Menu = () => {
  const { focusNext, focusPrevious, focus } = useFocusManager();

  useInput((input, key) => {
    if (key.downArrow) focusNext();
    if (key.upArrow) focusPrevious();
    if (input === 'h') focus('help-button'); // Focus by ID
  });

  return (
    <Box flexDirection="column">
      <MenuItem id="file" label="File" />
      <MenuItem id="edit" label="Edit" />
      <MenuItem id="help-button" label="Help" />
    </Box>
  );
};
```

---

## 15. App Lifecycle — Exiting Properly

An Ink app is a Node.js process that stays alive as long as there's active work (timers, input listeners, etc.). You need to explicitly tell it when to quit.

### Using `useApp` to Exit

```jsx
import { useApp } from 'ink';

const App = () => {
  const { exit } = useApp();

  useInput((input) => {
    if (input === 'q') {
      exit(); // Cleanly unmounts the app and exits
    }
  });

  return <Text>Press q to quit</Text>;
};
```

### Waiting for Exit

```jsx
import { render } from 'ink';
import App from './App.js';

const { waitUntilExit } = render(<App />);

// This promise resolves when the app unmounts
await waitUntilExit();
console.log('App has exited cleanly');
```

### Exit with Result or Error

```jsx
const { exit } = useApp();

// Resolve with a value
exit("done");

// Reject with an error
exit(new Error("Something went wrong"));

// In the caller:
try {
  const result = await waitUntilExit();
  console.log('Result:', result); // "done"
} catch (err) {
  console.error('Error:', err.message); // "Something went wrong"
}
```

### Ctrl+C

By default, Ctrl+C is enabled and will exit the app. You can disable it:

```jsx
render(<App />, { exitOnCtrlC: false });
```

---

## 16. Static Output — Logs That Don't Scroll Away

By default, Ink re-renders its output in-place (like how `htop` works). But sometimes you want items to permanently scroll up, like a log. That's what `<Static>` is for.

```jsx
import React, { useState, useEffect } from 'react';
import { render, Static, Box, Text } from 'ink';

const BuildLogger = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [current, setCurrent] = useState('Starting...');

  useEffect(() => {
    const tasks = [
      'Installing dependencies',
      'Compiling TypeScript',
      'Running tests',
      'Building bundle',
      'Done!'
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < tasks.length) {
        setCurrent(tasks[i]);
        setCompletedTasks(prev => [...prev, tasks[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Completed tasks scroll up permanently */}
      <Static items={completedTasks}>
        {(task, index) => (
          <Box key={index}>
            <Text color="green">✔ {task}</Text>
          </Box>
        )}
      </Static>

      {/* This stays at the bottom and updates in place */}
      <Box borderStyle="round" paddingX={1} marginTop={1}>
        <Text color="yellow">⟳ {current}</Text>
      </Box>
    </>
  );
};

render(<BuildLogger />);
```

---

## 17. Useful Community Components

Don't reinvent the wheel. The Ink ecosystem has great community packages:

### `ink-text-input` — Polished text input

```bash
npm install ink-text-input
```

```jsx
import TextInput from 'ink-text-input';

const SearchBox = () => {
  const [query, setQuery] = useState('');

  return (
    <Box>
      <Text>Search: </Text>
      <TextInput value={query} onChange={setQuery} />
    </Box>
  );
};
```

### `ink-spinner` — Loading spinner

```bash
npm install ink-spinner
```

```jsx
import Spinner from 'ink-spinner';

const Loading = () => (
  <Box>
    <Text color="green"><Spinner type="dots" /></Text>
    <Text> Loading...</Text>
  </Box>
);
```

### `ink-select-input` — Dropdown/menu selector

```bash
npm install ink-select-input
```

```jsx
import SelectInput from 'ink-select-input';

const Menu = () => {
  const items = [
    { label: 'New Project', value: 'new' },
    { label: 'Open Project', value: 'open' },
    { label: 'Settings', value: 'settings' },
  ];

  const handleSelect = (item) => {
    console.log('Selected:', item.value);
  };

  return <SelectInput items={items} onSelect={handleSelect} />;
};
```

### `ink-progress-bar` — Progress bar

```bash
npm install ink-progress-bar
```

```jsx
import ProgressBar from 'ink-progress-bar';

const Download = ({ percent }) => (
  <Box flexDirection="column">
    <Text>Downloading...</Text>
    <ProgressBar percent={percent} />
    <Text>{percent}%</Text>
  </Box>
);
```

---

## 18. Real Project: Build an Interactive File Browser

Let's put everything together and build a real interactive TUI — a simple file browser where you can navigate directories with arrow keys.

```jsx
// file-browser.jsx
import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';

// ─── Single item in the file list ───────────────────────────
const FileItem = ({ name, isDirectory, isSelected }) => (
  <Box>
    <Text color={isSelected ? 'black' : 'white'}
          backgroundColor={isSelected ? 'cyan' : undefined}>
      {isSelected ? '›' : ' '}{' '}
      <Text color={isDirectory ? 'cyan' : 'white'}
            bold={isDirectory}>
        {isDirectory ? '📁 ' : '📄 '}{name}
      </Text>
    </Text>
  </Box>
);

// ─── Status bar at the bottom ───────────────────────────────
const StatusBar = ({ path, count, selected }) => (
  <Box borderStyle="single" paddingX={1} marginTop={1}>
    <Text dimColor>{path}</Text>
    <Spacer />
    <Text dimColor>{selected + 1}/{count} items</Text>
  </Box>
);

// ─── Main App ───────────────────────────────────────────────
const FileBrowser = () => {
  const { exit } = useApp();
  const [currentPath, setCurrentPath] = useState(process.cwd());
  const [files, setFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState(null);

  // Load directory contents whenever path changes
  useEffect(() => {
    const loadDir = async () => {
      try {
        const entries = await readdir(currentPath, { withFileTypes: true });
        const sorted = entries
          .sort((a, b) => {
            // Directories first, then alphabetically
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
          })
          .map(entry => ({
            name: entry.name,
            isDirectory: entry.isDirectory(),
          }));

        // Add ".." to go up
        setFiles([{ name: '..', isDirectory: true }, ...sorted]);
        setSelectedIndex(0);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDir();
  }, [currentPath]);

  // Handle keyboard input
  useInput((input, key) => {
    if (input === 'q' || key.escape) {
      exit();
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(files.length - 1, prev + 1));
    }

    if (key.return) {
      const selected = files[selectedIndex];
      if (selected && selected.isDirectory) {
        if (selected.name === '..') {
          setCurrentPath(prev => resolve(prev, '..'));
        } else {
          setCurrentPath(prev => join(prev, selected.name));
        }
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="round" paddingX={1} marginBottom={1}>
        <Text bold color="cyan">File Browser</Text>
        <Text dimColor>  {currentPath}</Text>
      </Box>

      {/* File list */}
      <Box flexDirection="column">
        {error ? (
          <Text color="red">Error: {error}</Text>
        ) : (
          files.map((file, index) => (
            <FileItem
              key={file.name}
              name={file.name}
              isDirectory={file.isDirectory}
              isSelected={index === selectedIndex}
            />
          ))
        )}
      </Box>

      {/* Footer */}
      <Box marginTop={1} borderStyle="single" paddingX={1}>
        <Text dimColor>
          ↑↓ navigate  ↵ open  q quit
        </Text>
        <Box flexGrow={1} />
        <Text dimColor>{selectedIndex + 1}/{files.length}</Text>
      </Box>
    </Box>
  );
};

render(<FileBrowser />);
```

This example demonstrates:
- `useState` for multiple pieces of state
- `useEffect` with dependency (`currentPath`) to reload on path change
- `useInput` for keyboard navigation
- `useApp` to cleanly exit
- Component composition (`FileItem`, `StatusBar` as separate components)
- Props passing from parent to children
- Async data loading inside effects

---

## 19. Testing Ink Apps

Ink provides `ink-testing-library` for testing your components without a real terminal.

```bash
npm install --save-dev ink-testing-library
```

```jsx
// app.test.jsx
import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from 'ink';

// Simple component to test
const Greeting = ({ name }) => <Text>Hello, {name}!</Text>;

// Test it
const { lastFrame } = render(<Greeting name="World" />);
console.log(lastFrame()); // "Hello, World!"
console.assert(lastFrame() === 'Hello, World!');
```

**Testing state and interaction:**

```jsx
import { renderHook, act } from '@testing-library/react';

// For components with state, use ink-testing-library's stdin
const { lastFrame, stdin } = render(<MyInput />);

// Simulate user typing
stdin.write('hello');
stdin.write('\r'); // Enter key

// Check the result
console.log(lastFrame()); // "You typed: hello"
```

---

## 20. What's Next?

You now have a solid foundation. Here's where to go deeper:

**Ink documentation and examples:**
- Official README: https://github.com/vadimdemedes/ink
- Examples directory: https://github.com/vadimdemedes/ink/tree/master/examples
- Full hook and component API: in the README linked above

**React fundamentals (going deeper):**
- React Context API — share state across deeply nested components without prop drilling
- `useReducer` — complex state machines (good for multi-step TUI wizards)
- `useRef` — accessing elements without re-rendering
- `useMemo` / `useCallback` — performance optimizations
- React Suspense — handling async loading states declaratively

**Advanced Ink patterns:**
- `useBoxMetrics` — measure element dimensions at runtime
- `useWindowSize` — respond to terminal resize
- `<Transform>` — post-process rendered text (for gradients, etc.)
- `alternateScreen: true` — full-screen mode (like vim's buffer)
- React Devtools integration — debug your TUI components visually

**Community packages to explore:**
- `ink-spinner` — loading animations
- `ink-select-input` — keyboard-navigable menus
- `ink-text-input` — text input fields
- `ink-table` — render tabular data
- `ink-markdown` — syntax-highlighted markdown
- `ink-task-list` — task checklist with statuses
- `ink-form` — full form management

**Quick cheat sheet:**

```
Ink Primitives:
  <Text>             — display styled text
  <Box>              — flexbox container
  <Newline>          — line break inside Text
  <Spacer>           — flexible space between items
  <Static>           — permanent scrolling output
  <Transform>        — post-process text output

Ink Hooks:
  useInput()         — listen to keyboard events
  usePaste()         — listen to paste events
  useApp()           — get exit() function
  useFocus()         — get isFocused state
  useFocusManager()  — programmatic focus control
  useStdout()        — access stdout stream
  useWindowSize()    — get terminal columns/rows
  useBoxMetrics()    — measure a Box element

React Hooks (work in Ink too):
  useState()         — reactive state
  useEffect()        — side effects
  useRef()           — mutable ref without re-render
  useContext()       — consume shared context
  useReducer()       — complex state machine
  useMemo()          — memoize expensive values
  useCallback()      — memoize functions
```

---

*Happy hacking, Temicide. Build something cool.* 🌈
