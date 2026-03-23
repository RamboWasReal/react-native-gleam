import { type ReactNode } from 'react';
import { type AccessibilityProps, type StyleProp, type ViewStyle } from 'react-native';
import { type NativeProps } from './GleamViewNativeComponent';
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
export declare function GleamLine({ children, style, testID, delay, onTransitionEnd, ...accessibilityProps }: GleamLineProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GleamLine.d.ts.map