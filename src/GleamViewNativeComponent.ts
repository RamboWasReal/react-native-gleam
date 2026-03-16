import {
  codegenNativeComponent,
  type ColorValue,
  type ViewProps,
  type CodegenTypes,
} from 'react-native';

export interface NativeProps extends ViewProps {
  loading?: CodegenTypes.WithDefault<boolean, true>;
  speed?: CodegenTypes.WithDefault<CodegenTypes.Float, 1000>;
  direction?: CodegenTypes.WithDefault<'ltr' | 'rtl' | 'ttb', 'ltr'>;
  delay?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  animateDuration?: CodegenTypes.WithDefault<CodegenTypes.Float, 300>;
  intensity?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  baseColor?: ColorValue;
  highlightColor?: ColorValue;
  onTransitionEnd?: CodegenTypes.DirectEventHandler<
    Readonly<{ finished: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GleamView');
