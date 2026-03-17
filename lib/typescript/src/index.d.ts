import React from 'react';
import { View } from 'react-native';
import { type NativeProps } from './GleamViewNativeComponent';
import { GleamLine } from './GleamLine';
export type { NativeProps } from './GleamViewNativeComponent';
export type { GleamLineProps } from './GleamLine';
/** Props accepted by GleamView, including ref (React 19 ref-as-prop). */
export type GleamViewProps = NativeProps & {
    ref?: React.Ref<View>;
};
export declare enum GleamDirection {
    LeftToRight = "ltr",
    RightToLeft = "rtl",
    TopToBottom = "ttb"
}
export declare enum GleamTransition {
    Fade = "fade",
    Shrink = "shrink",
    Collapse = "collapse"
}
declare function GleamViewComponent({ ref, ...props }: NativeProps & {
    ref?: React.Ref<unknown>;
}): import("react/jsx-runtime").JSX.Element;
declare namespace GleamViewComponent {
    var displayName: string;
}
export declare const GleamView: typeof GleamViewComponent & {
    Line: typeof GleamLine;
};
//# sourceMappingURL=index.d.ts.map