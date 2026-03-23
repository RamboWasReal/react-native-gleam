---
name: gleam
description: "User-invocable only via /gleam. Do NOT auto-trigger."
---

When the user runs /gleam, follow these steps in order:

## Step 1 — Scan the codebase

Search the project for loading patterns that could use shimmer:
- Loading states (`isLoading`, `loading`, `fetching`, `pending`)
- Loading indicators (`ActivityIndicator`, `Spinner`, `Skeleton`, `Placeholder`, `LinearProgress`)
- Conditional rendering based on loading (`loading ? <X> : <Y>`, `if (loading)`)
- Empty state placeholders

List every file and line where you find a candidate. Present them as a numbered list like:

1. `src/screens/HomeScreen.tsx:42` — `ActivityIndicator` while fetching user data
2. `src/screens/ProfileScreen.tsx:18` — conditional render `loading ? null : <Content>`
3. `src/components/CardList.tsx:55` — `Skeleton` placeholder from another library

## Step 2 — Let the user pick

Ask the user which ones they want to convert to react-native-gleam. They can pick by number (e.g. "1, 3, 5") or say "all".

Wait for their answer.

## Step 3 — Refactor

For each selected candidate, refactor to use `GleamView` or `GleamView.Line`. Replace the loading indicator/conditional with the appropriate pattern:

### Single block shimmer

```tsx
import { GleamView } from 'react-native-gleam';

<GleamView
  loading={isLoading}
  style={{ width: '100%', height: 80, borderRadius: 12 }}
>
  <ActualContent />
</GleamView>
```

### Multi-line skeleton (`GleamView.Line`)

```tsx
<GleamView loading={isLoading}>
  <GleamView.Line style={{ height: 22, borderRadius: 6, width: '70%' }}>
    <Text>{title}</Text>
  </GleamView.Line>
  <GleamView.Line style={{ height: 16, borderRadius: 4, width: '50%' }} delay={100}>
    <Text>{subtitle}</Text>
  </GleamView.Line>
</GleamView>
```

Key rules:
- `GleamView` wraps content — no conditional rendering needed. Children are hidden when `loading={true}` and shown when `loading={false}`
- Lines inherit shimmer props from parent. `delay` and `onTransitionEnd` are per-line
- Place Lines as direct children or inside fragments
- Use `onTransitionEnd` on individual Lines, not the parent

## Props Reference

### GleamView

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `true` | Toggle shimmer on/off |
| `speed` | `number` | `1000` | Shimmer cycle duration (ms) |
| `direction` | `GleamDirection` | `LeftToRight` | Animation direction |
| `delay` | `number` | `0` | Phase offset (ms) for stagger |
| `transitionDuration` | `number` | `300` | Transition duration (ms). `0` = instant |
| `transitionType` | `GleamTransition` | `Fade` | Transition style |
| `intensity` | `number` | `1` | Highlight strength (0–1) |
| `baseColor` | `ColorValue` | `#E0E0E0` | Shimmer background color |
| `highlightColor` | `ColorValue` | `#F5F5F5` | Moving highlight color |
| `onTransitionEnd` | `function` | — | `{ nativeEvent: { finished: boolean } }` |

### GleamView.Line

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | — | Size/shape of shimmer bar |
| `delay` | `number` | `0` | Phase offset for this line |
| `onTransitionEnd` | `function` | — | Per-line transition callback |

### Enums

```tsx
import { GleamDirection, GleamTransition } from 'react-native-gleam';

GleamDirection.LeftToRight  // 'ltr'
GleamDirection.RightToLeft  // 'rtl'
GleamDirection.TopToBottom  // 'ttb'

GleamTransition.Fade      // opacity crossfade
GleamTransition.Shrink    // scales down while fading
GleamTransition.Collapse  // collapses vertically then horizontally
```
