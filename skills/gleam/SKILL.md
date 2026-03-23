---
name: gleam
description: "User-invocable only via /gleam. Do NOT auto-trigger."
---

# Integrating react-native-gleam

## Your Role

You are guiding the user through integrating `react-native-gleam` into their React Native project. **Do not dump all information at once.** Ask questions to understand their needs, then provide targeted guidance.

## Step 1 — Understand the context

Before writing any code, ask the user:

1. **What screen/component needs shimmer?** (ask to see the file or describe it)
2. **Single block or multi-line skeleton?** (one big shimmer vs multiple skeleton bars like a card with title + subtitle + avatar)
3. **Is `react-native-gleam` already installed?** (check their `package.json` if you have access)

Wait for answers before proceeding.

## Step 2 — Install if needed

If not installed:

```bash
# Bare React Native
yarn add react-native-gleam
cd ios && pod install

# Expo (requires development build, not Expo Go)
npx expo install react-native-gleam
npx expo prebuild
```

Requirements: React 19+, React Native 0.78+ (Fabric/New Architecture), iOS 15+, Android SDK 24+.

## Step 3 — Implement based on their answers

### Single block shimmer

Wrap the content. When `loading={true}`, children are hidden and shimmer plays. When `loading={false}`, shimmer transitions out and children appear.

```tsx
import { GleamView } from 'react-native-gleam';

<GleamView
  loading={isLoading}
  style={{ width: '100%', height: 80, borderRadius: 12 }}
>
  <Text>{user.name}</Text>
</GleamView>
```

### Multi-line skeleton (`GleamView.Line`)

Each `GleamView.Line` renders its own shimmer bar. Lines inherit shimmer props from the parent. No conditional rendering needed.

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

**Key rules for Lines:**
- Lines inherit `loading`, `speed`, `direction`, `baseColor`, `highlightColor`, `intensity`, `transitionDuration`, `transitionType` from parent
- `delay` and `onTransitionEnd` are per-line
- Place Lines as direct children (or inside fragments) for best performance
- Use `onTransitionEnd` on individual Lines, not the parent

## Step 4 — Ask about customization

After the basic implementation works, ask:

- **Want a stagger effect?** → Use `delay` prop to offset each shimmer
- **Custom colors to match your theme?** → `baseColor` and `highlightColor` props
- **Specific transition style?** → `GleamTransition.Fade` (default), `.Shrink`, or `.Collapse`
- **Need to know when loading finishes?** → `onTransitionEnd` callback

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

### GleamView.Line

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | — | Size and shape of the shimmer bar |
| `delay` | `number` | `0` | Phase offset for this line |
| `onTransitionEnd` | `function` | — | Called when this line's transition completes |
| `testID` | `string` | — | Test identifier |

### Enums

```tsx
import { GleamDirection, GleamTransition } from 'react-native-gleam';

GleamDirection.LeftToRight  // 'ltr' (default)
GleamDirection.RightToLeft  // 'rtl'
GleamDirection.TopToBottom  // 'ttb'

GleamTransition.Fade      // 'fade' — opacity crossfade
GleamTransition.Shrink    // 'shrink' — scales down while fading
GleamTransition.Collapse  // 'collapse' — collapses vertically then horizontally
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using with Expo Go | Requires a development build (`npx expo prebuild`) |
| Using with old architecture (Paper) | Fabric only — enable New Architecture |
| Passing `onTransitionEnd` on parent when Lines present | Use `onTransitionEnd` on individual Lines |
| Expecting per-corner `borderRadius` on shimmer | Only uniform `borderRadius` is applied |
| Wrapping Lines in intermediate `<View>` | Works but extra render cycle — prefer direct children or fragments |
