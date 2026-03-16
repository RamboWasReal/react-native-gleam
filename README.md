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

Run `pod install` in your `ios/` directory.

### Expo

This library includes native code and requires a [development build](https://docs.expo.dev/develop/development-builds/introduction/). It does not work with Expo Go.

```sh
npx expo install react-native-gleam
npx expo prebuild
```

No config plugin needed — autolinking and codegen handle everything.

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
| `delay` | `number` | `0` | Delay before animation starts (ms) — useful for stagger |
| `transitionDuration` | `number` | `300` | Duration of the transition from shimmer to content (ms). `0` = instant |
| `transitionType` | `GleamTransition` | `Fade` | Transition style when loading ends |
| `intensity` | `number` | `1` | Highlight strength (0-1). Lower = more subtle shimmer |
| `baseColor` | `string` | `#E0E0E0` | Background color of the shimmer |
| `highlightColor` | `string` | `#F5F5F5` | Color of the moving highlight |
| `onTransitionEnd` | `function` | — | Called when the fade transition completes. Receives `{ nativeEvent: { finished: boolean } }` |

All standard `View` props are also supported (`style`, `testID`, etc.).

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

- React Native **0.76+** (New Architecture / Fabric)
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
3. `onTransitionEnd` fires when complete

All shimmer instances sharing the same `speed` are automatically synchronized via a shared clock.

The shimmer respects `borderRadius` and all standard view styles.

## License

MIT
