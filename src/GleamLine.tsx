import { useContext, useLayoutEffect, type ReactNode } from 'react';
import {
  View,
  type AccessibilityProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import NativeGleamView, { type NativeProps } from './GleamViewNativeComponent';
import { GleamContext } from './GleamContext';
import {
  gleamAccessibilityState,
  gleamStyles,
  resolveBaseColor,
} from './gleamAccessibility';

export interface GleamLineProps extends AccessibilityProps {
  children?: ReactNode;
  /** Style for the shimmer bar (height, width, borderRadius, etc.). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Phase offset in milliseconds — overrides the parent's delay for this line. */
  delay?: NativeProps['delay'];
  /** Called when this line's transition completes or is interrupted. */
  onTransitionEnd?: NativeProps['onTransitionEnd'];
}

export function GleamLine({
  children,
  style,
  testID,
  delay,
  onTransitionEnd,
  ...accessibilityProps
}: GleamLineProps) {
  const ctx = useContext(GleamContext);
  const register = ctx?.registerLine;
  const isLoading = ctx?.loading ?? true;
  const useStaticSkeleton = ctx?.reduceMotion && isLoading;
  const { accessibilityState, ...restAccessibilityProps } = accessibilityProps;

  useLayoutEffect(() => {
    if (!register) return;
    return register();
  }, [register]);

  if (!ctx) {
    if (__DEV__) {
      console.warn('GleamView.Line must be used inside a GleamView');
    }
    return (
      <View style={style} testID={testID} {...accessibilityProps}>
        {children}
      </View>
    );
  }

  if (useStaticSkeleton) {
    return (
      <View
        style={[style, { backgroundColor: resolveBaseColor(ctx.baseColor) }]}
        testID={testID}
        {...restAccessibilityProps}
        accessibilityState={gleamAccessibilityState(
          isLoading,
          accessibilityState
        )}
      >
        <View style={gleamStyles.hiddenContent} pointerEvents="none">
          {children}
        </View>
      </View>
    );
  }

  return (
    <NativeGleamView
      loading={ctx.loading}
      speed={ctx.speed}
      direction={ctx.direction}
      delay={delay}
      transitionDuration={ctx.transitionDuration}
      transitionType={ctx.transitionType}
      intensity={ctx.intensity}
      baseColor={ctx.baseColor}
      highlightColor={ctx.highlightColor}
      onTransitionEnd={onTransitionEnd}
      style={style}
      testID={testID}
      {...restAccessibilityProps}
      accessibilityState={gleamAccessibilityState(
        isLoading,
        accessibilityState
      )}
    >
      {children}
    </NativeGleamView>
  );
}
