import { readFileSync } from 'node:fs';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import codegenNativeComponent from '../codegenCompat';

// RN 0.78 has no codegen exports at the package root.
jest.mock('react-native', () => ({}));
jest.mock('react-native/Libraries/Utilities/codegenNativeComponent', () => ({
  default: jest.fn(() => 'NativeGleamView'),
}));

it('loads the native spec without the newer React Native root exports', () => {
  // Do not run the React Native Babel plugin here: it replaces the factory
  // call with a generated view config and would conceal an invalid import.
  const source = readFileSync(
    path.join(__dirname, '../GleamViewNativeComponent.ts'),
    'utf8'
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const exports: { default?: unknown } = {};

  runInNewContext(outputText, {
    exports,
    require: (name: string) =>
      name === './codegenCompat'
        ? { default: codegenNativeComponent }
        : require(name),
  });

  expect(exports.default).toBe('NativeGleamView');
  expect(codegenNativeComponent).toHaveBeenCalledWith('GleamView');
});
