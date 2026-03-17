import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import NativeGleamView, { type NativeProps } from './GleamViewNativeComponent';
import { GleamContext, type GleamContextValue } from './GleamContext';
import { GleamLine } from './GleamLine';

export type { NativeProps as GleamViewProps } from './GleamViewNativeComponent';
export type { GleamLineProps } from './GleamLine';

export enum GleamDirection {
  LeftToRight = 'ltr',
  RightToLeft = 'rtl',
  TopToBottom = 'ttb',
}

export enum GleamTransition {
  Fade = 'fade',
  Shrink = 'shrink',
  Collapse = 'collapse',
}

// Shimmer-specific prop keys to exclude when rendering as a plain View container.
const SHIMMER_KEYS: ReadonlySet<string> = new Set([
  'loading',
  'speed',
  'direction',
  'delay',
  'transitionDuration',
  'transitionType',
  'intensity',
  'baseColor',
  'highlightColor',
  'onTransitionEnd',
  'children',
]);

function pickViewProps(props: NativeProps) {
  const viewProps: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!SHIMMER_KEYS.has(key)) {
      viewProps[key] = (props as Record<string, unknown>)[key];
    }
  }
  return viewProps;
}

function hasLineChildren(children: React.ReactNode): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (found) return;
    if (!React.isValidElement(child)) return;
    if (child.type === GleamLine) {
      found = true;
    } else if (child.type === React.Fragment) {
      found = hasLineChildren(
        (child.props as { children?: React.ReactNode }).children
      );
    }
  });
  return found;
}

function GleamViewComponent(props: NativeProps) {
  const {
    loading,
    speed,
    direction,
    transitionDuration,
    transitionType,
    intensity,
    baseColor,
    highlightColor,
    children,
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
        warnedTransitionRef.current = false;
      }
    };
  }, []);

  const contextValue = useMemo<GleamContextValue>(
    () => ({
      loading,
      speed,
      direction,
      transitionDuration,
      transitionType,
      intensity,
      baseColor,
      highlightColor,
      registerLine,
    }),
    [
      loading,
      speed,
      direction,
      transitionDuration,
      transitionType,
      intensity,
      baseColor,
      highlightColor,
      registerLine,
    ]
  );

  if (hasLines) {
    if (__DEV__ && props.onTransitionEnd && !warnedTransitionRef.current) {
      warnedTransitionRef.current = true;
      console.warn(
        'GleamView: onTransitionEnd is ignored when GleamView.Line children are present. ' +
          'Use onTransitionEnd on individual GleamView.Line components instead.'
      );
    }
    return (
      <GleamContext.Provider value={contextValue}>
        <View {...pickViewProps(props)}>{children}</View>
      </GleamContext.Provider>
    );
  }

  return (
    <GleamContext.Provider value={contextValue}>
      <NativeGleamView {...props}>{children}</NativeGleamView>
    </GleamContext.Provider>
  );
}

GleamViewComponent.displayName = 'GleamView';

export const GleamView = Object.assign(GleamViewComponent, {
  Line: GleamLine,
});
