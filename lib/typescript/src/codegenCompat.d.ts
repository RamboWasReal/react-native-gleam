import type { HostComponent, NativeSyntheticEvent } from 'react-native';
declare const codegenNativeComponent: <Props extends object>(name: string) => HostComponent<Props>;
export type Float = number;
export type WithDefault<Type extends number | boolean | string | ReadonlyArray<string>, _Default extends Type | string | undefined | null> = Type | undefined | null;
export type DirectEventHandler<T> = (event: NativeSyntheticEvent<T>) => void | Promise<void>;
export default codegenNativeComponent;
//# sourceMappingURL=codegenCompat.d.ts.map