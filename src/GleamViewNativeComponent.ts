import {
  codegenNativeComponent,
  type ColorValue,
  type ViewProps,
  type CodegenTypes,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** Toggle shimmer on/off. @default true */
  loading?: CodegenTypes.WithDefault<boolean, true>;
  /** Duration of one shimmer cycle in milliseconds. @default 1000 */
  speed?: CodegenTypes.WithDefault<CodegenTypes.Float, 1000>;
  /** Animation sweep direction. @default 'ltr' */
  direction?: CodegenTypes.WithDefault<'ltr' | 'rtl' | 'ttb', 'ltr'>;
  /** Phase offset in milliseconds — use to stagger multiple shimmers. @default 0 */
  delay?: CodegenTypes.WithDefault<CodegenTypes.Float, 0>;
  /** Duration of the loading-to-content transition in milliseconds. `0` = instant. @default 300 */
  transitionDuration?: CodegenTypes.WithDefault<CodegenTypes.Float, 300>;
  /** Transition style when loading ends. @default 'fade' */
  transitionType?: CodegenTypes.WithDefault<
    'fade' | 'shrink' | 'collapse',
    'fade'
  >;
  /** Highlight strength (0–1). Lower values produce a more subtle shimmer. @default 1 */
  intensity?: CodegenTypes.WithDefault<CodegenTypes.Float, 1>;
  /** Background color of the shimmer. @default '#E0E0E0' */
  baseColor?: ColorValue;
  /** Color of the moving highlight. @default '#F5F5F5' */
  highlightColor?: ColorValue;
  /** Called when the transition completes or is interrupted. `finished` is `true` if completed, `false` if interrupted. */
  onTransitionEnd?: CodegenTypes.DirectEventHandler<
    Readonly<{ finished: boolean }>
  >;
}

export default codegenNativeComponent<NativeProps>('GleamView');
