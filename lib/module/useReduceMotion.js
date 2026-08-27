"use strict";

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Subscribes to the platform "reduce motion" accessibility setting. */
export function useReduceMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    }).catch(() => {
      // Ignore — treat as motion allowed when the API is unavailable.
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduceMotion;
}
//# sourceMappingURL=useReduceMotion.js.map