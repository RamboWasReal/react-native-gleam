"use strict";

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import NativeGleamView from './GleamViewNativeComponent';
import { GleamContext } from "./GleamContext.js";
import { GleamLine } from "./GleamLine.js";
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

// Shimmer-specific prop keys to exclude when rendering as a plain View container.
const SHIMMER_KEYS = new Set(['loading', 'speed', 'direction', 'delay', 'transitionDuration', 'transitionType', 'intensity', 'baseColor', 'highlightColor', 'onTransitionEnd', 'children']);
function pickViewProps(props) {
  const viewProps = {};
  for (const key of Object.keys(props)) {
    if (!SHIMMER_KEYS.has(key)) {
      viewProps[key] = props[key];
    }
  }
  return viewProps;
}
function hasLineChildren(children) {
  let found = false;
  React.Children.forEach(children, child => {
    if (found) return;
    if (! /*#__PURE__*/React.isValidElement(child)) return;
    if (child.type === GleamLine) {
      found = true;
    } else if (child.type === React.Fragment) {
      found = hasLineChildren(child.props.children);
    }
  });
  return found;
}
function GleamViewComponent(props) {
  const {
    loading,
    speed,
    direction,
    transitionDuration,
    transitionType,
    intensity,
    baseColor,
    highlightColor,
    children
  } = props;
  const lineCountRef = useRef(0);
  const warnedTransitionRef = useRef(false);
  const [hasLines, setHasLines] = useState(() => hasLineChildren(children));
  const registerLine = useCallback(() => {
    lineCountRef.current++;
    setHasLines(true);
    return () => {
      lineCountRef.current--;
      if (lineCountRef.current === 0) {
        setHasLines(false);
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
    registerLine
  }), [loading, speed, direction, transitionDuration, transitionType, intensity, baseColor, highlightColor, registerLine]);
  if (hasLines) {
    if (__DEV__ && props.onTransitionEnd && !warnedTransitionRef.current) {
      warnedTransitionRef.current = true;
      console.warn('GleamView: onTransitionEnd is ignored when GleamView.Line children are present. ' + 'Use onTransitionEnd on individual GleamView.Line components instead.');
    }
    return /*#__PURE__*/_jsx(GleamContext.Provider, {
      value: contextValue,
      children: /*#__PURE__*/_jsx(View, {
        ...pickViewProps(props),
        children: children
      })
    });
  }
  return /*#__PURE__*/_jsx(GleamContext.Provider, {
    value: contextValue,
    children: /*#__PURE__*/_jsx(NativeGleamView, {
      ...props,
      children: children
    })
  });
}
GleamViewComponent.displayName = 'GleamView';
export const GleamView = Object.assign(GleamViewComponent, {
  Line: GleamLine
});
//# sourceMappingURL=index.js.map