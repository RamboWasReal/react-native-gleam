---
name: gleam
description: "Invoked via /gleam — guides integration of react-native-gleam into a React Native project"
---

# Using react-native-gleam

## Overview

`react-native-gleam` is a native shimmer/skeleton loading component for React Native. All animation runs in native code (no JS animation runtime). Fabric-only.

## When to Use

- Adding shimmer/skeleton loading to a React Native screen
- Building multi-line skeleton layouts
- Transitioning from loading state to content

## Installation

```bash
yarn add react-native-gleam
# or
npm install react-native-gleam
```

**Bare React Native:** Run `pod install` in `ios/`. Android requires no setup — autolinking handles it.

**Expo:** Requires a development build (not Expo Go).
```bash
npx expo install react-native-gleam
npx expo prebuild
```

## Requirements

- React 19+
- React Native 0.78+ (New Architecture / Fabric)
- iOS 15+
- Android SDK 24+

## Basic Usage — Single Block Shimmer

Wrap content in `GleamView`. When `loading={true}`, children are hidden and a shimmer plays. When `loading={false}`, shimmer transitions out and children appear.

```tsx
import { GleamView } from 'react-native-gleam';

<GleamView
  loading={isLoading}
  style={{ width: '100%', height: 80, borderRadius: 12 }}
>
  <Text>{user.name}</Text>
</GleamView>
```

## Multi-line Skeleton — `GleamView.Line`

Use `GleamView.Line` for individual shimmer bars. Lines inherit shimmer props from the parent. No conditional rendering needed.

```tsx
import { GleamView } from 'react-native-gleam';

<GleamView loading={isLoading} speed={800}>
  <GleamView.Line style={{ height: 22, borderRadius: 6, width: '70%' }}>
    <Text style={{ fontSize: 16 }}>{title}</Text>
  </GleamView.Line>
  <GleamView.Line
    style={{ height: 16, borderRadius: 4, width: '50%' }}
    delay={100}
  >
    <Text style={{ fontSize: 13 }}>{subtitle}</Text>
  </GleamView.Line>
</GleamView>
```

**Key rules:**
- Lines inherit `loading`, `speed`, `direction`, `baseColor`, `highlightColor`, `intensity`, `transitionDuration`, `transitionType` from parent
- `delay` and `onTransitionEnd` are per-line
- Place Lines as direct children of `GleamView` (or inside fragments) for best performance
- When Lines are present, the parent renders as a plain `View` — use `onTransitionEnd` on individual Lines, not the parent

## Stagger Pattern

Use `delay` to offset shimmer cycles:

```tsx
<GleamView loading delay={0} style={styles.row} />
<GleamView loading delay={150} style={styles.row} />
<GleamView loading delay={300} style={styles.row} />
```

Or with Lines:

```tsx
<GleamView loading>
  <GleamView.Line style={styles.line} delay={0} />
  <GleamView.Line style={styles.line} delay={100} />
  <GleamView.Line style={styles.line} delay={200} />
</GleamView>
```

## Enums

```tsx
import { GleamDirection, GleamTransition } from 'react-native-gleam';

// Directions
GleamDirection.LeftToRight  // 'ltr' (default)
GleamDirection.RightToLeft  // 'rtl'
GleamDirection.TopToBottom  // 'ttb'

// Transitions
GleamTransition.Fade      // 'fade' (default) — opacity crossfade
GleamTransition.Shrink    // 'shrink' — shimmer scales down while fading
GleamTransition.Collapse  // 'collapse' — shimmer collapses vertically then horizontally
```

## Props Reference

### GleamView

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `true` | Toggle shimmer on/off |
| `speed` | `number` | `1000` | Duration of one shimmer cycle (ms) |
| `direction` | `GleamDirection` | `LeftToRight` | Animation direction |
| `delay` | `number` | `0` | Phase offset (ms) for stagger effects |
| `transitionDuration` | `number` | `300` | Transition duration (ms). `0` = instant |
| `transitionType` | `GleamTransition` | `Fade` | Transition style when loading ends |
| `intensity` | `number` | `1` | Highlight strength (0–1) |
| `baseColor` | `ColorValue` | `#E0E0E0` | Background color of the shimmer |
| `highlightColor` | `ColorValue` | `#F5F5F5` | Color of the moving highlight |
| `onTransitionEnd` | `function` | — | Called with `{ nativeEvent: { finished: boolean } }` |

All `View` props are also supported (`style`, `testID`, etc.).

### GleamView.Line

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | — | Size and shape of the shimmer bar |
| `delay` | `number` | `0` | Phase offset for this line |
| `onTransitionEnd` | `function` | — | Called when this line's transition completes |
| `testID` | `string` | — | Test identifier |

Accessibility props are accepted directly. Shimmer props are inherited from parent `GleamView`.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using with Expo Go | Requires a development build (`npx expo prebuild`) |
| Using with old architecture (Paper) | Fabric only — enable New Architecture |
| Passing `onTransitionEnd` on parent when Lines present | Use `onTransitionEnd` on individual Lines instead |
| Expecting per-corner `borderRadius` on shimmer | Only uniform `borderRadius` is applied to the shimmer overlay |
| Wrapping Lines in intermediate `<View>` | Works but requires an extra render cycle — prefer direct children or fragments |
