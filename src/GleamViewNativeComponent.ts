import type { ColorValue, ViewProps } from 'react-native';
import codegenNativeComponent, {
  type DirectEventHandler,
  type Float,
  type WithDefault,
} from './codegenCompat';

export interface NativeProps extends ViewProps {
  /** Toggle shimmer on/off. @default true */
  loading?: WithDefault<boolean, true>;
  /** Duration of one shimmer cycle in milliseconds. @default 1000 */
  speed?: WithDefault<Float, 1000>;
  /** Animation sweep direction. @default 'ltr' */
  direction?: WithDefault<'ltr' | 'rtl' | 'ttb', 'ltr'>;
  /** Phase offset in milliseconds — use to stagger multiple shimmers. @default 0 */
  delay?: WithDefault<Float, 0>;
  /** Duration of the loading-to-content transition in milliseconds. `0` = instant. @default 300 */
  transitionDuration?: WithDefault<Float, 300>;
  /** Transition style when loading ends. @default 'fade' */
  transitionType?: WithDefault<'fade' | 'shrink' | 'collapse', 'fade'>;
  /** Highlight strength (0–1). Lower values produce a more subtle shimmer. @default 1 */
  intensity?: WithDefault<Float, 1>;
  /** Background color of the shimmer. @default '#E0E0E0' */
  baseColor?: ColorValue;
  /** Color of the moving highlight. @default '#F5F5F5' */
  highlightColor?: ColorValue;
  /** Called when the transition completes or is interrupted. `finished` is `true` if completed, `false` if interrupted. */
  onTransitionEnd?: DirectEventHandler<Readonly<{ finished: boolean }>>;
}

export default codegenNativeComponent<NativeProps>('GleamView');
