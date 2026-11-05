"use strict";

// RN 0.78/0.79 do not export codegenNativeComponent at the package root.
// Use the shared runtime path without exposing a deep type import, which the
// Strict TypeScript API in newer React Native versions does not allow.
const codegenNativeComponent =
// eslint-disable-next-line @react-native/no-deep-imports -- Required for RN 0.78/0.79.
require('react-native/Libraries/Utilities/codegenNativeComponent').default;

// These aliases match React Native's CodegenTypes. Keep them outside the spec:
// Codegen recognizes their names rather than resolving their implementations.

export default codegenNativeComponent;
//# sourceMappingURL=codegenCompat.js.map