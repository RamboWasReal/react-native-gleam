export { default as GleamView } from './GleamViewNativeComponent';
export type { NativeProps as GleamViewProps } from './GleamViewNativeComponent';

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
