import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, type ViewProps } from 'react-native';
import NativeGleamView, { type NativeProps } from './GleamViewNativeComponent';
import { GleamContext, type GleamContextValue } from './GleamContext';
import { GleamLine } from './GleamLine';
import {
  gleamAccessibilityState,
  gleamStyles,
  resolveBaseColor,
} from './gleamAccessibility';
import { useReduceMotion } from './useReduceMotion';

export type { NativeProps } from './GleamViewNativeComponent';
export type { GleamLineProps } from './GleamLine';

/**
 * Props accepted by GleamView, including ref (React 19 ref-as-prop).
 * Use this type instead of `ComponentProps<typeof GleamView>` for
 * accurate ref typing.
 */
export type GleamViewProps = NativeProps & {
  ref?: React.Ref<View>;
};

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

// Shimmer-specific keys that must be destructured from props before spreading
// viewProps onto <View> in Line mode.
//   Direction 1 (compile-time): `satisfies` catches stale/typo keys.
//   Direction 2 (DEV runtime): check inside GleamViewComponent catches
//   new NativeProps keys that weren't added to this list or destructured.
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
] as const satisfies ReadonlyArray<keyof NativeProps>);

// Only walk host wrappers we can inspect without rendering. Custom components
// may re-parent `children` into a nested GleamView (or not mount them at all);
// those Lines must bind via context + registerLine, same as on main.
function isTransparentLineWrapper(type: unknown): boolean {
  return type === React.Fragment || type === View;
}

function scanLineChildren(
  children: React.ReactNode,
  gleamViewType: unknown
): boolean {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (found) return;
    if (!React.isValidElement(child)) return;
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
    const nested = (child.props as { children?: React.ReactNode }).children;
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
  children,
}: {
  ref: React.Ref<unknown>;
  loading: boolean;
  baseColor?: NativeProps['baseColor'];
  viewProps: Omit<ViewProps, 'children'>;
  children: React.ReactNode;
}) {
  const { accessibilityState, style, ...restViewProps } = viewProps;

  return (
    <View
      ref={ref as any}
      accessibilityState={gleamAccessibilityState(loading, accessibilityState)}
      style={[style, { backgroundColor: resolveBaseColor(baseColor) }]}
      {...restViewProps}
    >
      <View style={gleamStyles.hiddenContent} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

// React 19: ref is a regular prop, no forwardRef needed.
// Internal ref type is loosened to avoid monorepo type conflicts between
// root and example workspace @types/react copies. The exported GleamViewProps
// provides the correct consumer-facing type.
function GleamViewComponent({
  ref,
  ...props
}: NativeProps & { ref?: React.Ref<unknown> }) {
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
        console.error(
          `GleamView: shimmer prop "${key}" leaked into viewProps. ` +
            'Add it to the destructuring in GleamViewComponent and to SHIMMER_KEYS.'
        );
      }
    }
  }

  const lineCountRef = useRef(0);
  const warnedTransitionRef = useRef(false);
  const warnedDefaultLoadingRef = useRef(false);
  const hasLinesInTree = useMemo(
    () => scanLineChildren(children, GleamViewComponent),
    [children]
  );
  const [hasRegisteredLines, setHasRegisteredLines] = useState(false);
  const hasLines = hasLinesInTree || hasRegisteredLines;

  useEffect(() => {
    if (
      __DEV__ &&
      !warnedDefaultLoadingRef.current &&
      loading === undefined &&
      children != null &&
      !hasLines
    ) {
      warnedDefaultLoadingRef.current = true;
      console.warn(
        'GleamView: loading defaults to true — children stay hidden until loading={false}.'
      );
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
      reduceMotion,
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
      reduceMotion,
    ]
  );

  // Cast needed: View and NativeGleamView accept Ref<ReactNativeElement>
  // but that type isn't publicly exported from react-native. Safe at runtime.
  const nativeRef = ref as any;

  if (hasLines) {
    if (__DEV__ && onTransitionEnd && !warnedTransitionRef.current) {
      warnedTransitionRef.current = true;
      console.warn(
        'GleamView: onTransitionEnd is ignored when GleamView.Line children are present. ' +
          'Use onTransitionEnd on individual GleamView.Line components instead.'
      );
    }
    return (
      <GleamContext.Provider value={contextValue}>
        <View
          ref={nativeRef}
          accessibilityState={gleamAccessibilityState(
            isLoading,
            viewProps.accessibilityState
          )}
          {...viewProps}
        >
          {children}
        </View>
      </GleamContext.Provider>
    );
  }

  if (useStaticSkeleton) {
    return (
      <GleamContext.Provider value={contextValue}>
        <StaticSkeleton
          ref={nativeRef}
          loading={isLoading}
          baseColor={baseColor}
          viewProps={viewProps}
        >
          {children}
        </StaticSkeleton>
      </GleamContext.Provider>
    );
  }

  return (
    <GleamContext.Provider value={contextValue}>
      <NativeGleamView
        ref={nativeRef}
        {...props}
        accessibilityState={gleamAccessibilityState(
          isLoading,
          props.accessibilityState
        )}
      >
        {children}
      </NativeGleamView>
    </GleamContext.Provider>
  );
}

GleamViewComponent.displayName = 'GleamView';

export const GleamView = Object.assign(GleamViewComponent, {
  Line: GleamLine,
});
