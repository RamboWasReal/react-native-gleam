import { type NativeProps } from './GleamViewNativeComponent';
export interface GleamContextValue {
    loading: NativeProps['loading'];
    speed: NativeProps['speed'];
    direction: NativeProps['direction'];
    transitionDuration: NativeProps['transitionDuration'];
    transitionType: NativeProps['transitionType'];
    intensity: NativeProps['intensity'];
    baseColor: NativeProps['baseColor'];
    highlightColor: NativeProps['highlightColor'];
    registerLine: () => () => void;
}
export declare const GleamContext: import("react").Context<GleamContextValue | null>;
//# sourceMappingURL=GleamContext.d.ts.map