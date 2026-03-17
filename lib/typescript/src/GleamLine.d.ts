import { type AccessibilityProps, type StyleProp, type ViewStyle } from 'react-native';
import { type NativeProps } from './GleamViewNativeComponent';
export interface GleamLineProps extends AccessibilityProps {
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    delay?: NativeProps['delay'];
    onTransitionEnd?: NativeProps['onTransitionEnd'];
}
export declare function GleamLine({ children, style, testID, delay, onTransitionEnd, ...accessibilityProps }: GleamLineProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=GleamLine.d.ts.map