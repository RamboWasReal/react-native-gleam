# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-03-31

### Fixed

- iOS: sync visual state in `layoutSubviews` when `loading=NO` — fixes GleamView stuck in shimmer after `loading` transitions while parent has `display: 'none'` (#3)

## [1.0.2] - 2026-03-29

### Changed

- `/gleam` skill scans for all shimmer/skeleton/reanimated/moti patterns

## [1.0.1] - 2026-03-22

### Fixed

- Android: clamp `blendColor` RGBA channels to 0–255
- Android: clear animator listeners before cancel on detach/cleanup
- Android: snapshot SharedClock views list before frame iteration
- iOS: null check after `calloc` in shared clock buffer allocation
- iOS: guard against NaN/Infinity in `speed`, `delay`, `transitionDuration`

### Added

- JSDoc with `@default` tags on all NativeProps and GleamLineProps
- Claude Code plugin with `/gleam` setup command

## [1.0.0] - 2026-03-22

First stable release.

### Added

- `GleamView` component — native shimmer/skeleton loading for React Native (Fabric)
- `GleamView.Line` compound component for multi-line skeleton layouts
- Three animation directions: `LeftToRight`, `RightToLeft`, `TopToBottom`
- Three transition styles: `Fade`, `Shrink`, `Collapse`
- `intensity` prop for subtle shimmer effects (0–1)
- `delay` prop for staggered skeleton patterns
- `onTransitionEnd` callback with `finished` flag (supports interruption detection)
- Shared clock on both platforms — all shimmer instances with the same speed stay in sync
- iOS: `CAGradientLayer` + `CADisplayLink` driven animation
- Android: `Choreographer` + `LinearGradient` shader via `dispatchDraw`

### Notes

- Fabric-only (New Architecture) — no Paper/old architecture support
- Requires React 19+ and React Native 0.78+
- The shimmer overlay supports uniform `borderRadius` only — per-corner radii are not applied to the shimmer
- When `GleamView.Line` children are present, the parent renders as a plain `View`. Use `onTransitionEnd` on individual lines, not the parent.
