"use strict";

import { useContext, useLayoutEffect } from 'react';
import { View } from 'react-native';
import NativeGleamView from './GleamViewNativeComponent';
import { GleamContext } from "./GleamContext.js";
import { gleamAccessibilityState, gleamStyles, resolveBaseColor } from "./gleamAccessibility.js";
import { jsx as _jsx } from "react/jsx-runtime";
export function GleamLine({
  children,
  style,
  testID,
  delay,
  onTransitionEnd,
  ...accessibilityProps
}) {
  const ctx = useContext(GleamContext);
  const register = ctx?.registerLine;
  const isLoading = ctx?.loading ?? true;
  const useStaticSkeleton = ctx?.reduceMotion && isLoading;
  const {
    accessibilityState,
    ...restAccessibilityProps
  } = accessibilityProps;
  useLayoutEffect(() => {
    if (!register) return;
    return register();
  }, [register]);
  if (!ctx) {
    if (__DEV__) {
      console.warn('GleamView.Line must be used inside a GleamView');
    }
    return /*#__PURE__*/_jsx(View, {
      style: style,
      testID: testID,
      ...accessibilityProps,
      children: children
    });
  }
  if (useStaticSkeleton) {
    return /*#__PURE__*/_jsx(View, {
      style: [style, {
        backgroundColor: resolveBaseColor(ctx.baseColor)
      }],
      testID: testID,
      ...restAccessibilityProps,
      accessibilityState: gleamAccessibilityState(isLoading, accessibilityState),
      children: /*#__PURE__*/_jsx(View, {
        style: gleamStyles.hiddenContent,
        pointerEvents: "none",
        children: children
      })
    });
  }
  return /*#__PURE__*/_jsx(NativeGleamView, {
    loading: ctx.loading,
    speed: ctx.speed,
    direction: ctx.direction,
    delay: delay,
    transitionDuration: ctx.transitionDuration,
    transitionType: ctx.transitionType,
    intensity: ctx.intensity,
    baseColor: ctx.baseColor,
    highlightColor: ctx.highlightColor,
    onTransitionEnd: onTransitionEnd,
    style: style,
    testID: testID,
    ...restAccessibilityProps,
    accessibilityState: gleamAccessibilityState(isLoading, accessibilityState),
    children: children
  });
}
//# sourceMappingURL=GleamLine.js.map