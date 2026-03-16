import { type ColorValue, type ViewProps, type CodegenTypes } from 'react-native';
export interface NativeProps extends ViewProps {
    loading?: CodegenTypes.WithDefault<boolean, true>;
    speed?: CodegenTypes.WithDefault<CodegenTypes.Float, 1000>;
    direction?: CodegenTypes.WithDefault<'ltr' | 'rtl' | 'ttb', 'ltr'>;
    delay?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
    transitionDuration?: CodegenTypes.WithDefault<CodegenTypes.Float, 300>;
    transitionType?: CodegenTypes.WithDefault<'fade' | 'shrink' | 'collapse', 'fade'>;
    intensity?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
    baseColor?: ColorValue;
    highlightColor?: ColorValue;
    onTransitionEnd?: CodegenTypes.DirectEventHandler<Readonly<{
        finished: boolean;
    }>>;
}
declare const _default: import("react-native/types_generated/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
//# sourceMappingURL=GleamViewNativeComponent.d.ts.map