import type { HostComponent, NativeSyntheticEvent } from 'react-native';

// RN 0.78/0.79 do not export codegenNativeComponent at the package root.
// Use the shared runtime path without exposing a deep type import, which the
// Strict TypeScript API in newer React Native versions does not allow.
const codegenNativeComponent: <Props extends object>(
  name: string
) => HostComponent<Props> =
  // eslint-disable-next-line @react-native/no-deep-imports -- Required for RN 0.78/0.79.
  require('react-native/Libraries/Utilities/codegenNativeComponent').default;

// These aliases match React Native's CodegenTypes. Keep them outside the spec:
// Codegen recognizes their names rather than resolving their implementations.
export type Float = number;
export type WithDefault<
  Type extends number | boolean | string | ReadonlyArray<string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Read by Codegen, erased from the public prop type.
  _Default extends Type | string | undefined | null,
> = Type | undefined | null;
export type DirectEventHandler<T> = (
  event: NativeSyntheticEvent<T>
) => void | Promise<void>;

export default codegenNativeComponent;
