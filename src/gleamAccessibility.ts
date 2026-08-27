import type { AccessibilityState, ColorValue } from 'react-native';
import { StyleSheet } from 'react-native';

const DEFAULT_BASE_COLOR = '#E0E0E0';

export const gleamStyles = StyleSheet.create({
  hiddenContent: {
    opacity: 0,
  },
});

export function resolveBaseColor(baseColor?: ColorValue): string {
  if (typeof baseColor === 'string') {
    return baseColor;
  }
  return DEFAULT_BASE_COLOR;
}

export function gleamAccessibilityState(
  loading: boolean | undefined,
  existing?: AccessibilityState | null
): AccessibilityState | undefined {
  if (!loading) {
    return existing ?? undefined;
  }

  return {
    ...existing,
    busy: true,
  };
}
