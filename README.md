# react-native-gleam

Native-powered shimmer loading effect for React Native. Built with pure native animations — no reanimated, no SVG, zero dependencies.

- **iOS**: `CAGradientLayer` + `CADisplayLink`
- **Android**: `Choreographer` + `LinearGradient`
- **Fabric only** (New Architecture)

https://github.com/user-attachments/assets/70eb886c-f3e2-4611-8ecc-0b03227267d0

## Installation

```sh
yarn add react-native-gleam
```

```sh
npm install react-native-gleam
```

### Bare React Native

Run `pod install` in your `ios/` directory. Android requires no additional setup — autolinking and codegen handle everything.

### Expo

This library includes native code and requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/). It does not work with Expo Go.

```sh
npx expo install react-native-gleam
npx expo prebuild
```

No config plugin needed — autolinking and codegen handle everything.

### Claude Code

Install the plugin, then use `/gleam` to get guided through your first implementation.

```sh
claude plugin marketplace add RamboWasReal/react-native-gleam
claude plugin install react-native-gleam
```

## Usage

```tsx
import { GleamView, GleamDirection, GleamTransition } from 'react-native-gleam';

function UserCard({ loading, user }) {
  return (
    <GleamView
      loading={loading}
      style={{ width: '100%', height: 80, borderRadius: 12 }}
    >
      <Text>{user.name}</Text>
    </GleamView>
  );
}
```

When `loading={true}`, children are hidden and a shimmer animation plays. When `loading={false}`, the shimmer fades out and children fade in.

### Multi-line skeleton (`GleamView.Line`)

Use `GleamView.Line` to create individual shimmer bars that inherit props from a parent `GleamView`. No conditional rendering — the wrapper pattern works for multi-line skeletons too.

```tsx
<GleamView loading={loading} speed={800} baseColor="#E0E0E0">
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

When `loading={true}`, each `GleamView.Line` renders its own shimmer bar, sized by `style`. The parent acts as a plain container (no block shimmer). When `loading={false}`, Lines become transparent and children render normally.

Lines inherit `loading`, `speed`, `direction`, `baseColor`, `highlightColor`, `intensity`, `transitionDuration`, and `transitionType` from the parent. `delay` and `onTransitionEnd` are per-line.

For best performance, place `GleamView.Line` as direct children of `GleamView` (or inside fragments). Lines nested inside intermediate wrappers (e.g., `<View>`) still work, but require an extra render cycle to detect.

Every `GleamView` provides context to its subtree. A `GleamView.Line` always binds to its nearest `GleamView` ancestor — nested `GleamView` components each control their own Lines independently.

### Staggered skeleton

```tsx
<GleamView loading delay={0} style={styles.row} />
<GleamView loading delay={150} style={styles.row} />
<GleamView loading delay={300} style={styles.row} />
```

### All props

```tsx
<GleamView
  loading={isLoading}
  speed={800}
  direction={GleamDirection.LeftToRight}
  delay={0}
  transitionDuration={300}
  transitionType={GleamTransition.Fade}
  intensity={0.7}
  baseColor="#E0E0E0"
  highlightColor="#F5F5F5"
  onTransitionEnd={({ nativeEvent }) => {
    console.log('Done', nativeEvent.finished);
  }}
  style={{ width: '100%', height: 80, borderRadius: 12 }}
>
  <Text>Your content</Text>
</GleamView>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `true` | Toggle shimmer on/off |
| `speed` | `number` | `1000` | Duration of one shimmer cycle (ms) |
| `direction` | `GleamDirection` | `LeftToRight` | Animation direction |
| `delay` | `number` | `0` | Phase offset (ms) — offsets the shimmer cycle for stagger effects |
| `transitionDuration` | `number` | `300` | Duration of the transition from shimmer to content (ms). `0` = instant |
| `transitionType` | `GleamTransition` | `Fade` | Transition style when loading ends |
| `intensity` | `number` | `1` | Highlight strength (0-1). Lower = more subtle shimmer |
| `baseColor` | `ColorValue` | `#E0E0E0` | Background color of the shimmer |
| `highlightColor` | `ColorValue` | `#F5F5F5` | Color of the moving highlight |
| `onTransitionEnd` | `function` | — | Called when the transition completes or is interrupted. Receives `{ nativeEvent: { finished: boolean } }` — `true` if completed, `false` if interrupted (e.g., `loading` toggled back to `true`) |

All standard `View` props are also supported (`style`, `testID`, etc.). Note: the shimmer overlay supports uniform `borderRadius` only — per-corner radii are not applied to the shimmer.

### GleamView.Line Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | — | Style for the shimmer bar (height, width, borderRadius) |
| `delay` | `number` | `0` | Phase offset for this line (useful for stagger) |
| `onTransitionEnd` | `function` | — | Called when this line's transition completes |
| `testID` | `string` | — | Test identifier |

All standard accessibility props (`accessibilityLabel`, `accessibilityRole`, etc.) are accepted directly. Shimmer props (`loading`, `speed`, `direction`, etc.) cannot be passed to `GleamView.Line` — they are inherited automatically from the parent `GleamView`.

### GleamDirection

```tsx
import { GleamDirection } from 'react-native-gleam';

GleamDirection.LeftToRight  // 'ltr' (default)
GleamDirection.RightToLeft  // 'rtl'
GleamDirection.TopToBottom  // 'ttb'
```

### GleamTransition

```tsx
import { GleamTransition } from 'react-native-gleam';

GleamTransition.Fade      // 'fade' (default) — opacity crossfade
GleamTransition.Shrink    // 'shrink' — shimmer scales down while fading
GleamTransition.Collapse  // 'collapse' — shimmer collapses vertically then horizontally
```

## Requirements

- React **19+**
- React Native **0.78+** (New Architecture / Fabric)
- iOS 15+
- Android SDK 24+

This library requires the New Architecture (Fabric). It does not support the old architecture (Paper).

## How it works

`GleamView` wraps your content in a native view. When `loading={true}`:

1. Children are hidden (opacity 0)
2. A gradient overlay animates across the view
3. The gradient uses `baseColor` → `highlightColor` → `baseColor`

When `loading` switches to `false`:

1. The shimmer transitions out over `transitionDuration` ms (style depends on `transitionType`)
2. Children fade in simultaneously
3. `onTransitionEnd` fires with `finished: true` (or `finished: false` if interrupted)

All shimmer instances sharing the same `speed` are automatically synchronized via a shared clock.

The shimmer respects uniform `borderRadius` and standard view styles.

## Limitations

- The shimmer overlay supports uniform `borderRadius` only — per-corner radii are not applied to the shimmer.

## License

MIT
