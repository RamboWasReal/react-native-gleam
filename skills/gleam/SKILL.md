---
name: gleam
description: "User-invocable only via /gleam. Do NOT auto-trigger."
---

IMPORTANT: The library is ALREADY INSTALLED. Do NOT ask what the user wants to do. Do NOT offer a menu of options. Do NOT ask if they want to install.

Your FIRST response must be ONLY these two questions, word for word:

1. Which screen or component needs shimmer? (point me to the file)
2. Single block shimmer or multi-line skeleton? (one big placeholder, or multiple bars like title + subtitle + avatar)

Say NOTHING else. No intro, no preamble, no "I see you're on branch X", no options list. Just the two questions above.

---

# Implementation Guide (use AFTER the user answers)

## Single block shimmer

Wrap existing content. When `loading={true}`, children are hidden and shimmer plays. When `loading={false}`, shimmer transitions out and children appear.

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

## After implementation, ask about customization

- **Stagger effect?** → Use `delay` prop to offset each shimmer
- **Custom colors?** → `baseColor` and `highlightColor` props
- **Transition style?** → `GleamTransition.Fade` (default), `.Shrink`, or `.Collapse`
- **Callback when loading finishes?** → `onTransitionEnd`

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
