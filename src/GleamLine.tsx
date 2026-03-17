import { useContext, useLayoutEffect } from 'react';
import {
  View,
  type AccessibilityProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import NativeGleamView, { type NativeProps } from './GleamViewNativeComponent';
import { GleamContext } from './GleamContext';

export interface GleamLineProps extends AccessibilityProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  delay?: NativeProps['delay'];
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
      {...accessibilityProps}
    >
      {children}
    </NativeGleamView>
  );
}
