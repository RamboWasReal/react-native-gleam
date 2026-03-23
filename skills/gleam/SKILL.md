---
name: gleam
description: "User-invocable only via /gleam. Do NOT auto-trigger."
---

The user wants to add shimmer loading to their project using react-native-gleam. The library is already installed.

Start by asking which file/screen needs shimmer, and whether they want a single block or multi-line skeleton. Then implement it.

## Single block shimmer

```tsx
import { GleamView } from 'react-native-gleam';

<GleamView
  loading={isLoading}
  style={{ width: '100%', height: 80, borderRadius: 12 }}
>
  <Text>{user.name}</Text>
</GleamView>
```

## Multi-line skeleton (`GleamView.Line`)

```tsx
<GleamView loading={isLoading} speed={800}>
  <GleamView.Line style={{ height: 22, borderRadius: 6, width: '70%' }}>
    <Text>{title}</Text>
  </GleamView.Line>
  <GleamView.Line style={{ height: 16, borderRadius: 4, width: '50%' }} delay={100}>
    <Text>{subtitle}</Text>
  </GleamView.Line>
</GleamView>
```

**Rules for Lines:**
- Lines inherit `loading`, `speed`, `direction`, `baseColor`, `highlightColor`, `intensity`, `transitionDuration`, `transitionType` from parent
- `delay` and `onTransitionEnd` are per-line
- Place Lines as direct children or inside fragments
- Use `onTransitionEnd` on individual Lines, not the parent

## Props

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

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Expo Go | Needs development build |
| Old architecture (Paper) | Fabric only |
| `onTransitionEnd` on parent with Lines | Put it on individual Lines |
| Per-corner `borderRadius` | Only uniform radius on shimmer |
