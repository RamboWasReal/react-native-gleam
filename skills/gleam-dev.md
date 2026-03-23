---
name: gleam-dev
description: Use when developing, maintaining, or extending react-native-gleam. Covers native iOS/Android changes, JS prop additions, codegen, testing, and release.
---

# Gleam Library Development

## Before Any Change

1. Read `CLAUDE.md` for architecture and conventions
2. Run `yarn test && yarn typecheck` to confirm baseline is green
3. Identify which layer your change affects: JS (`src/`), iOS (`ios/`), Android (`android/`)

## Change Checklist

### Adding or Modifying a Prop

Props flow through codegen — changes must be synchronized across 4 layers:

- [ ] Update `NativeProps` in `src/GleamViewNativeComponent.ts` (source of truth)
- [ ] Add JSDoc with `@default` tag on the new prop
- [ ] If shimmer-specific: add key to `SHIMMER_KEYS` in `src/index.tsx`
- [ ] If shimmer-specific: destructure in `GleamViewComponent` props
- [ ] If inherited by Lines: add to `GleamContextValue` in `src/GleamContext.ts` and pass in `contextValue` useMemo
- [ ] If inherited by Lines: forward in `GleamLine.tsx`
- [ ] iOS: handle in `updateProps:oldProps:` in `ios/GleamView.mm`
- [ ] Android: add property + setter in `GleamView.kt`, add `@ReactProp` in `GleamViewManager.kt`
- [ ] Add tests in `src/__tests__/GleamView.test.tsx`
- [ ] Run `yarn test && yarn typecheck`
- [ ] Run `yarn prepare` to rebuild `lib/` (types + JS)
- [ ] Test in example app: `yarn example ios` and `yarn example android`

### Modifying iOS Native Code (`ios/GleamView.mm`)

- [ ] All UI work must happen on main thread
- [ ] Animation changes: verify in `_tickWithTime:` frame callback
- [ ] Transition changes: test all 3 types (fade, shrink, collapse)
- [ ] Memory: ensure cleanup in `prepareForRecycle` and `removeFromSuperview`
- [ ] SharedClock: `_registerView`/`_unregisterView` are main-thread-only
- [ ] Test direction changes mid-animation
- [ ] Test rapid `loading` toggles
- [ ] Run example app on device (simulator OK for logic, device for perf)

### Modifying Android Native Code (`android/src/main/java/com/gleam/`)

- [ ] `dispatchDraw` must not allocate — reuse `shimmerPaint`, `drawRect`, `shaderMatrix`
- [ ] Animator listeners: always `removeAllListeners()` before `cancel()` on detach/cleanup
- [ ] SharedClock: `start()` snapshots `views.toList()` before iteration
- [ ] Transition changes: test all 3 types (fade, shrink, collapse)
- [ ] Test direction changes mid-animation
- [ ] Test rapid `loading` toggles
- [ ] Gradient cache: call `invalidateGradientCache()` when colors or intensity change

### Modifying Tests

- [ ] Tests live in `src/__tests__/GleamView.test.tsx`
- [ ] Native component is auto-mocked by `react-native` preset
- [ ] Tests verify JS-layer prop forwarding, not native rendering
- [ ] Use `getNativeProps()` helper to read forwarded props
- [ ] Use `jest.spyOn(console, 'warn')` for `__DEV__` warnings
- [ ] Clean up spies with `mockRestore()` in each test

## Architecture Quick Reference

```
src/GleamViewNativeComponent.ts  ← Codegen source of truth (NativeProps)
src/index.tsx                    ← GleamView component + enums + SHIMMER_KEYS
src/GleamContext.ts              ← Context for Line inheritance
src/GleamLine.tsx                ← GleamView.Line compound component
ios/GleamView.mm                 ← iOS Fabric component (CAGradientLayer + CADisplayLink)
android/.../GleamView.kt         ← Android Fabric component (dispatchDraw + Choreographer)
android/.../GleamViewManager.kt  ← Android ViewManager (prop setters)
```

## Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| Added prop to NativeProps but shimmer leaks to View in Line mode | Add to `SHIMMER_KEYS` and destructure in `GleamViewComponent` |
| Codegen types not updating | Run `yarn prepare`, clean build folders, rebuild example |
| iOS animation glitch after direction change | Direction is read per-frame in `_tickWithTime:` — ensure no stale captures |
| Android shimmer disappears silently | Check `ensureGradient()` — `cachedGradient` may be nil if colors invalid |
| `WithDefault` type noisy in IDE | This is expected — codegen needs the default value, JSDoc provides human-readable docs |
| Tests pass but native broken | Tests only cover JS layer — always verify in example app on both platforms |
| `as any` on ref | Required workaround — `ReactNativeElement` is not exported from react-native |
