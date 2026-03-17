import { type NativeProps } from './GleamViewNativeComponent';
import { GleamLine } from './GleamLine';
export type { NativeProps as GleamViewProps } from './GleamViewNativeComponent';
export type { GleamLineProps } from './GleamLine';
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
declare function GleamViewComponent(props: NativeProps): import("react/jsx-runtime").JSX.Element;
declare namespace GleamViewComponent {
    var displayName: string;
}
export declare const GleamView: typeof GleamViewComponent & {
    Line: typeof GleamLine;
};
//# sourceMappingURL=index.d.ts.map