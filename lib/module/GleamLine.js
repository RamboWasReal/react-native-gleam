"use strict";

import { useContext, useLayoutEffect } from 'react';
import { View } from 'react-native';
import NativeGleamView from './GleamViewNativeComponent';
import { GleamContext } from "./GleamContext.js";
import { jsx as _jsx } from "react/jsx-runtime";
export function GleamLine({
  children,
  style,
  testID,
  delay,
  onTransitionEnd
}) {
  const ctx = useContext(GleamContext);
  const register = ctx?.registerLine;
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
      children: children
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
    children: children
  });
}
//# sourceMappingURL=GleamLine.js.map