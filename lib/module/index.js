"use strict";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import NativeGleamView from './GleamViewNativeComponent';
import { GleamContext } from "./GleamContext.js";
import { GleamLine } from "./GleamLine.js";
import { gleamAccessibilityState, gleamStyles, resolveBaseColor } from "./gleamAccessibility.js";
import { useReduceMotion } from "./useReduceMotion.js";

/**
 * Props accepted by GleamView, including ref (React 19 ref-as-prop).
 * Use this type instead of `ComponentProps<typeof GleamView>` for
 * accurate ref typing.
 */
import { jsx as _jsx } from "react/jsx-runtime";
export let GleamDirection = /*#__PURE__*/function (GleamDirection) {
  GleamDirection["LeftToRight"] = "ltr";
  GleamDirection["RightToLeft"] = "rtl";
  GleamDirection["TopToBottom"] = "ttb";
  return GleamDirection;
}({});
export let GleamTransition = /*#__PURE__*/function (GleamTransition) {
  GleamTransition["Fade"] = "fade";
  GleamTransition["Shrink"] = "shrink";
  GleamTransition["Collapse"] = "collapse";
  return GleamTransition;
}({});

// Shimmer-specific keys that must be destructured from props before spreading
// viewProps onto <View> in Line mode.
//   Direction 1 (compile-time): `satisfies` catches stale/typo keys.
//   Direction 2 (DEV runtime): check inside GleamViewComponent catches
//   new NativeProps keys that weren't added to this list or destructured.
const SHIMMER_KEYS = new Set(['loading', 'speed', 'direction', 'delay', 'transitionDuration', 'transitionType', 'intensity', 'baseColor', 'highlightColor', 'onTransitionEnd']);

// Only walk host wrappers we can inspect without rendering. Custom components
// may re-parent `children` into a nested GleamView (or not mount them at all);
// those Lines must bind via context + registerLine, same as on main.
function isTransparentLineWrapper(type) {
  return type === React.Fragment || type === View;
}
function scanLineChildren(children, gleamViewType) {
  let found = false;
  React.Children.forEach(children, child => {
    if (found) return;
    if (! /*#__PURE__*/React.isValidElement(child)) return;
    if (child.type === GleamLine) {
      found = true;
      return;
    }
    if (child.type === gleamViewType) {
      return;
    }
    if (!isTransparentLineWrapper(child.type)) {
      return;
    }
    const nested = child.props.children;
    if (nested != null) {
      found = scanLineChildren(nested, gleamViewType);
    }
  });
  return found;
}
function StaticSkeleton({
  ref,
  loading,
  baseColor,
  viewProps,
  children
}) {
  const {
    accessibilityState,
    style,
    ...restViewProps
  } = viewProps;
  return /*#__PURE__*/_jsx(View, {
    ref: ref,
    accessibilityState: gleamAccessibilityState(loading, accessibilityState),
    style: [style, {
      backgroundColor: resolveBaseColor(baseColor)
    }],
    ...restViewProps,
    children: /*#__PURE__*/_jsx(View, {
      style: gleamStyles.hiddenContent,
      pointerEvents: "none",
      children: children
    })
  });
}

// React 19: ref is a regular prop, no forwardRef needed.
// Internal ref type is loosened to avoid monorepo type conflicts between
// root and example workspace @types/react copies. The exported GleamViewProps
// provides the correct consumer-facing type.
function GleamViewComponent({
  ref,
  ...props
}) {
  const {
    loading,
    speed,
    direction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    delay,
    transitionDuration,
    transitionType,
    intensity,
    baseColor,
    highlightColor,
    onTransitionEnd,
    children,
    ...viewProps
  } = props;
  const reduceMotion = useReduceMotion();
  const isLoading = loading ?? true;
  const useStaticSkeleton = reduceMotion && isLoading;
  if (__DEV__) {
    for (const key of Object.keys(viewProps)) {
      if (SHIMMER_KEYS.has(key)) {
        console.error(`GleamView: shimmer prop "${key}" leaked into viewProps. ` + 'Add it to the destructuring in GleamViewComponent and to SHIMMER_KEYS.');
      }
    }
  }
  const lineCountRef = useRef(0);
  const warnedTransitionRef = useRef(false);
  const warnedDefaultLoadingRef = useRef(false);
  const hasLinesInTree = useMemo(() => scanLineChildren(children, GleamViewComponent), [children]);
  const [hasRegisteredLines, setHasRegisteredLines] = useState(false);
  const hasLines = hasLinesInTree || hasRegisteredLines;
  useEffect(() => {
    if (__DEV__ && !warnedDefaultLoadingRef.current && loading === undefined && children != null && !hasLines) {
      warnedDefaultLoadingRef.current = true;
      console.warn('GleamView: loading defaults to true — children stay hidden until loading={false}.');
    }
  }, [children, hasLines, loading]);
  const registerLine = useCallback(() => {
    lineCountRef.current++;
    setHasRegisteredLines(true);
    return () => {
      lineCountRef.current--;
      if (lineCountRef.current === 0) {
        queueMicrotask(() => {
          if (lineCountRef.current === 0) {
            setHasRegisteredLines(false);
            warnedTransitionRef.current = false;
          }
        });
      }
    };
  }, []);
  const contextValue = useMemo(() => ({
    loading,
    speed,
    direction,
    transitionDuration,
    transitionType,
    intensity,
    baseColor,
    highlightColor,
    registerLine,
    reduceMotion
  }), [loading, speed, direction, transitionDuration, transitionType, intensity, baseColor, highlightColor, registerLine, reduceMotion]);

  // Cast needed: View and NativeGleamView accept Ref<ReactNativeElement>
  // but that type isn't publicly exported from react-native. Safe at runtime.
  const nativeRef = ref;
  if (hasLines) {
    if (__DEV__ && onTransitionEnd && !warnedTransitionRef.current) {
      warnedTransitionRef.current = true;
      console.warn('GleamView: onTransitionEnd is ignored when GleamView.Line children are present. ' + 'Use onTransitionEnd on individual GleamView.Line components instead.');
    }
    return /*#__PURE__*/_jsx(GleamContext.Provider, {
      value: contextValue,
      children: /*#__PURE__*/_jsx(View, {
        ref: nativeRef,
        accessibilityState: gleamAccessibilityState(isLoading, viewProps.accessibilityState),
        ...viewProps,
        children: children
      })
    });
  }
  if (useStaticSkeleton) {
    return /*#__PURE__*/_jsx(GleamContext.Provider, {
      value: contextValue,
      children: /*#__PURE__*/_jsx(StaticSkeleton, {
        ref: nativeRef,
        loading: isLoading,
        baseColor: baseColor,
        viewProps: viewProps,
        children: children
      })
    });
  }
  return /*#__PURE__*/_jsx(GleamContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(NativeGleamView, {
      ref: nativeRef,
      ...props,
      accessibilityState: gleamAccessibilityState(isLoading, props.accessibilityState),
      children: children
    })
  });
}
GleamViewComponent.displayName = 'GleamView';
export const GleamView = Object.assign(GleamViewComponent, {
  Line: GleamLine
});
//# sourceMappingURL=index.js.map