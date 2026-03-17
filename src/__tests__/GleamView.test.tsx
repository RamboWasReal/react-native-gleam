import React from 'react';
import { Text, View } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { GleamView, GleamDirection, GleamTransition } from '../index';

/**
 * The native component is mocked by react-native's jest preset as a host View.
 * We inspect the props passed to it to verify JS-level prop resolution.
 */
function getNativeProps() {
  const view = screen.getByTestId('gleam');
  return view.props;
}

// ---------------------------------------------------------------------------
// Default props
// ---------------------------------------------------------------------------
describe('default props', () => {
  it('passes loading=true by default', () => {
    render(<GleamView testID="gleam" />);
    // codegen WithDefault: undefined means native uses default (true)
    expect(getNativeProps().loading).toBeUndefined();
  });

  it('passes speed=undefined (native default 1000)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().speed).toBeUndefined();
  });

  it('passes direction=undefined (native default ltr)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().direction).toBeUndefined();
  });

  it('passes delay=undefined (native default 0)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().delay).toBeUndefined();
  });

  it('passes transitionDuration=undefined (native default 300)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().transitionDuration).toBeUndefined();
  });

  it('passes intensity=undefined (native default 1)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().intensity).toBeUndefined();
  });

  it('passes baseColor=undefined (native default #E0E0E0)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().baseColor).toBeUndefined();
  });

  it('passes highlightColor=undefined (native default #F5F5F5)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().highlightColor).toBeUndefined();
  });

  it('passes onTransitionEnd=undefined by default', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().onTransitionEnd).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Explicit prop values
// ---------------------------------------------------------------------------
describe('explicit prop values', () => {
  it('passes loading=false when set', () => {
    render(<GleamView testID="gleam" loading={false} />);
    expect(getNativeProps().loading).toBe(false);
  });

  it('passes loading=true when set explicitly', () => {
    render(<GleamView testID="gleam" loading={true} />);
    expect(getNativeProps().loading).toBe(true);
  });

  it('passes speed value', () => {
    render(<GleamView testID="gleam" speed={600} />);
    expect(getNativeProps().speed).toBe(600);
  });

  it('passes delay value', () => {
    render(<GleamView testID="gleam" delay={150} />);
    expect(getNativeProps().delay).toBe(150);
  });

  it('passes transitionDuration value', () => {
    render(<GleamView testID="gleam" transitionDuration={800} />);
    expect(getNativeProps().transitionDuration).toBe(800);
  });

  it('passes transitionDuration=0 for instant transition', () => {
    render(<GleamView testID="gleam" transitionDuration={0} />);
    expect(getNativeProps().transitionDuration).toBe(0);
  });

  it('passes intensity value', () => {
    render(<GleamView testID="gleam" intensity={0.5} />);
    expect(getNativeProps().intensity).toBe(0.5);
  });

  it('passes intensity=0 for no highlight', () => {
    render(<GleamView testID="gleam" intensity={0} />);
    expect(getNativeProps().intensity).toBe(0);
  });

  it('passes baseColor', () => {
    render(<GleamView testID="gleam" baseColor="#D4E6F1" />);
    expect(getNativeProps().baseColor).toBe('#D4E6F1');
  });

  it('passes highlightColor', () => {
    render(<GleamView testID="gleam" highlightColor="#EBF5FB" />);
    expect(getNativeProps().highlightColor).toBe('#EBF5FB');
  });
});

// ---------------------------------------------------------------------------
// Direction prop
// ---------------------------------------------------------------------------
describe('direction prop', () => {
  it('passes direction=ltr as string', () => {
    render(<GleamView testID="gleam" direction="ltr" />);
    expect(getNativeProps().direction).toBe('ltr');
  });

  it('passes direction=rtl as string', () => {
    render(<GleamView testID="gleam" direction="rtl" />);
    expect(getNativeProps().direction).toBe('rtl');
  });

  it('passes direction=ttb as string', () => {
    render(<GleamView testID="gleam" direction="ttb" />);
    expect(getNativeProps().direction).toBe('ttb');
  });
});

// ---------------------------------------------------------------------------
// GleamDirection enum
// ---------------------------------------------------------------------------
describe('GleamDirection enum', () => {
  it('LeftToRight maps to ltr', () => {
    expect(GleamDirection.LeftToRight).toBe('ltr');
  });

  it('RightToLeft maps to rtl', () => {
    expect(GleamDirection.RightToLeft).toBe('rtl');
  });

  it('TopToBottom maps to ttb', () => {
    expect(GleamDirection.TopToBottom).toBe('ttb');
  });

  it('works as direction prop value', () => {
    render(<GleamView testID="gleam" direction={GleamDirection.RightToLeft} />);
    expect(getNativeProps().direction).toBe('rtl');
  });

  it('has exactly 3 values', () => {
    const values = Object.values(GleamDirection);
    expect(values).toHaveLength(3);
    expect(values).toEqual(expect.arrayContaining(['ltr', 'rtl', 'ttb']));
  });
});

// ---------------------------------------------------------------------------
// GleamTransition enum
// ---------------------------------------------------------------------------
describe('GleamTransition enum', () => {
  it('Fade maps to fade', () => {
    expect(GleamTransition.Fade).toBe('fade');
  });

  it('Shrink maps to shrink', () => {
    expect(GleamTransition.Shrink).toBe('shrink');
  });

  it('Collapse maps to collapse', () => {
    expect(GleamTransition.Collapse).toBe('collapse');
  });

  it('works as transitionType prop value', () => {
    render(
      <GleamView testID="gleam" transitionType={GleamTransition.Shrink} />
    );
    expect(getNativeProps().transitionType).toBe('shrink');
  });

  it('has exactly 3 values', () => {
    const values = Object.values(GleamTransition);
    expect(values).toHaveLength(3);
    expect(values).toEqual(
      expect.arrayContaining(['fade', 'shrink', 'collapse'])
    );
  });
});

// ---------------------------------------------------------------------------
// transitionType prop
// ---------------------------------------------------------------------------
describe('transitionType prop', () => {
  it('passes fade string', () => {
    render(<GleamView testID="gleam" transitionType="fade" />);
    expect(getNativeProps().transitionType).toBe('fade');
  });

  it('passes shrink string', () => {
    render(<GleamView testID="gleam" transitionType="shrink" />);
    expect(getNativeProps().transitionType).toBe('shrink');
  });

  it('passes collapse string', () => {
    render(<GleamView testID="gleam" transitionType="collapse" />);
    expect(getNativeProps().transitionType).toBe('collapse');
  });
});

// ---------------------------------------------------------------------------
// Intensity prop
// ---------------------------------------------------------------------------
describe('intensity prop', () => {
  it('passes full intensity', () => {
    render(<GleamView testID="gleam" intensity={1} />);
    expect(getNativeProps().intensity).toBe(1);
  });

  it('passes subtle intensity', () => {
    render(<GleamView testID="gleam" intensity={0.3} />);
    expect(getNativeProps().intensity).toBe(0.3);
  });

  it('passes zero intensity', () => {
    render(<GleamView testID="gleam" intensity={0} />);
    expect(getNativeProps().intensity).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// onTransitionEnd callback
// ---------------------------------------------------------------------------
describe('onTransitionEnd', () => {
  it('passes callback as prop', () => {
    const handler = jest.fn();
    render(<GleamView testID="gleam" onTransitionEnd={handler} />);
    expect(getNativeProps().onTransitionEnd).toBeDefined();
  });

  it('does not pass callback when not provided', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().onTransitionEnd).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Children and style
// ---------------------------------------------------------------------------
describe('children and style', () => {
  it('renders children', () => {
    render(
      <GleamView testID="gleam">
        <Text>Hello</Text>
      </GleamView>
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('passes style through', () => {
    render(
      <GleamView
        testID="gleam"
        style={{ width: 200, height: 80, borderRadius: 12 }}
      />
    );
    const props = getNativeProps();
    expect(props.style).toEqual(
      expect.objectContaining({
        width: 200,
        height: 80,
        borderRadius: 12,
      })
    );
  });

  it('renders multiple children', () => {
    render(
      <GleamView testID="gleam">
        <Text>First</Text>
        <Text>Second</Text>
      </GleamView>
    );
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('Second')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Ref forwarding (React 19 ref-as-prop)
// ---------------------------------------------------------------------------
describe('ref forwarding', () => {
  it('forwards ref in standalone mode', () => {
    const ref = jest.fn();
    render(<GleamView ref={ref} testID="gleam" />);
    expect(ref).toHaveBeenCalled();
  });

  it('forwards ref in Line mode (plain View)', () => {
    const ref = jest.fn();
    render(
      <GleamView ref={ref} testID="parent" loading={true}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(ref).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Combined props (realistic usage)
// ---------------------------------------------------------------------------
describe('combined props', () => {
  it('passes all props together', () => {
    const onEnd = jest.fn();
    render(
      <GleamView
        testID="gleam"
        loading={true}
        speed={800}
        direction="rtl"
        delay={200}
        transitionDuration={500}
        intensity={0.7}
        baseColor="#D4E6F1"
        highlightColor="#EBF5FB"
        onTransitionEnd={onEnd}
        style={{ width: '100%', height: 80, borderRadius: 12 }}
      >
        <Text>Content</Text>
      </GleamView>
    );
    const props = getNativeProps();
    expect(props.loading).toBe(true);
    expect(props.speed).toBe(800);
    expect(props.direction).toBe('rtl');
    expect(props.delay).toBe(200);
    expect(props.transitionDuration).toBe(500);
    expect(props.intensity).toBe(0.7);
    expect(props.baseColor).toBe('#D4E6F1');
    expect(props.highlightColor).toBe('#EBF5FB');
    expect(props.onTransitionEnd).toBeDefined();
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('passes enum direction with all other props', () => {
    render(
      <GleamView
        testID="gleam"
        loading={false}
        speed={1500}
        direction={GleamDirection.TopToBottom}
        delay={300}
        transitionDuration={0}
        intensity={0.5}
        baseColor="#000000"
        highlightColor="#FFFFFF"
      />
    );
    const props = getNativeProps();
    expect(props.loading).toBe(false);
    expect(props.speed).toBe(1500);
    expect(props.direction).toBe('ttb');
    expect(props.delay).toBe(300);
    expect(props.transitionDuration).toBe(0);
    expect(props.intensity).toBe(0.5);
  });

  it('works as skeleton placeholder pattern', () => {
    render(
      <GleamView
        testID="gleam"
        loading={true}
        style={{ width: '100%', height: 20, borderRadius: 4 }}
      />
    );
    const props = getNativeProps();
    expect(props.loading).toBe(true);
    expect(props.style).toEqual(
      expect.objectContaining({
        height: 20,
        borderRadius: 4,
      })
    );
  });

  it('works as staggered list pattern', () => {
    render(
      <>
        <GleamView testID="gleam" loading delay={0} style={{ height: 50 }} />
        <GleamView loading delay={150} style={{ height: 50 }} />
        <GleamView loading delay={300} style={{ height: 50 }} />
      </>
    );
    expect(getNativeProps().delay).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// GleamView.Line — inherits shimmer props from parent
// ---------------------------------------------------------------------------
describe('GleamView.Line', () => {
  it('renders children inside a parent GleamView', () => {
    render(
      <GleamView loading={true}>
        <GleamView.Line testID="line">
          <Text>Line content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByText('Line content')).toBeTruthy();
  });

  it('inherits loading from parent', () => {
    render(
      <GleamView loading={true}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.loading).toBe(true);
  });

  it('inherits shimmer props from parent', () => {
    render(
      <GleamView
        loading={true}
        speed={800}
        direction="rtl"
        transitionDuration={500}
        transitionType="shrink"
        intensity={0.5}
        baseColor="#D4E6F1"
        highlightColor="#EBF5FB"
      >
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    const props = screen.getByTestId('line').props;
    expect(props.loading).toBe(true);
    expect(props.speed).toBe(800);
    expect(props.direction).toBe('rtl');
    expect(props.transitionDuration).toBe(500);
    expect(props.transitionType).toBe('shrink');
    expect(props.intensity).toBe(0.5);
    expect(props.baseColor).toBe('#D4E6F1');
    expect(props.highlightColor).toBe('#EBF5FB');
  });

  it('uses its own delay instead of parent', () => {
    render(
      <GleamView loading={true} delay={999}>
        <GleamView.Line testID="line" delay={200}>
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.delay).toBe(200);
  });

  it('passes delay=undefined by default (not inherited)', () => {
    render(
      <GleamView loading={true} delay={500}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.delay).toBeUndefined();
  });

  it('passes style to the native component', () => {
    render(
      <GleamView loading={true}>
        <GleamView.Line testID="line" style={{ height: 20, borderRadius: 4 }}>
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.style).toEqual(
      expect.objectContaining({ height: 20, borderRadius: 4 })
    );
  });

  it('passes accessibility props to the native component', () => {
    render(
      <GleamView loading={true}>
        <GleamView.Line
          testID="line"
          accessibilityLabel="Loading title"
          accessibilityRole="text"
        >
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    const props = screen.getByTestId('line').props;
    expect(props.accessibilityLabel).toBe('Loading title');
    expect(props.accessibilityRole).toBe('text');
  });

  it('passes onTransitionEnd to the native component', () => {
    const handler = jest.fn();
    render(
      <GleamView loading={true}>
        <GleamView.Line testID="line" onTransitionEnd={handler}>
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.onTransitionEnd).toBeDefined();
  });

  it('renders multiple lines', () => {
    render(
      <GleamView loading={true}>
        <GleamView.Line testID="line1">
          <Text>Title</Text>
        </GleamView.Line>
        <GleamView.Line testID="line2">
          <Text>Subtitle</Text>
        </GleamView.Line>
        <GleamView.Line testID="line3">
          <Text>Body</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line1').props.loading).toBe(true);
    expect(screen.getByTestId('line2').props.loading).toBe(true);
    expect(screen.getByTestId('line3').props.loading).toBe(true);
    expect(screen.getByText('Title')).toBeTruthy();
    expect(screen.getByText('Subtitle')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('parent becomes a plain View when Lines are present', () => {
    render(
      <GleamView testID="parent" loading={true}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    // Parent is a plain View — no shimmer props
    const parent = screen.getByTestId('parent');
    expect(parent.props.loading).toBeUndefined();
    expect(parent.props.speed).toBeUndefined();
  });

  it('detects Lines wrapped in a fragment', () => {
    render(
      <GleamView testID="parent" loading={true}>
        <>
          <GleamView.Line testID="line">
            <Text>Content</Text>
          </GleamView.Line>
        </>
      </GleamView>
    );
    // Parent should be a plain View even when Line is inside a fragment
    const parent = screen.getByTestId('parent');
    expect(parent.props.loading).toBeUndefined();
    expect(screen.getByTestId('line').props.loading).toBe(true);
  });

  it('reverts to native GleamView when all Lines unmount', async () => {
    const { rerender } = render(
      <GleamView testID="parent" loading={true}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    // Parent is plain View (no shimmer props)
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();

    // Re-render without Lines → parent should be native GleamView again
    // Flush queueMicrotask used by registerLine cleanup
    await act(async () => {
      rerender(
        <GleamView testID="parent" loading={true}>
          <Text>No lines</Text>
        </GleamView>
      );
    });
    expect(screen.getByTestId('parent').props.loading).toBe(true);
  });

  it('stays in Line mode when one Line is swapped for another in the same batch', async () => {
    // Regression test for the queueMicrotask fix: when an old Line unmounts
    // and a new Line mounts in the same React commit, the cleanup of the old
    // Line should NOT flip hasLines to false before the new Line registers.
    const { rerender } = render(
      <GleamView testID="parent" loading={true}>
        <GleamView.Line key="a" testID="lineA">
          <Text>A</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();

    // Swap Line A for Line B in a single rerender (same batch).
    // Without queueMicrotask, Line A's cleanup would setHasLines(false)
    // before Line B's useLayoutEffect calls registerLine.
    await act(async () => {
      rerender(
        <GleamView testID="parent" loading={true}>
          <GleamView.Line key="b" testID="lineB">
            <Text>B</Text>
          </GleamView.Line>
        </GleamView>
      );
    });

    // Parent must still be in Line mode (plain View, no loading prop)
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();
    // New Line is present
    expect(screen.getByTestId('lineB')).toBeTruthy();
  });

  it('staggered lines with individual delays', () => {
    render(
      <GleamView loading={true} speed={800} baseColor="#D4E6F1">
        <GleamView.Line testID="line1" delay={0}>
          <Text>First</Text>
        </GleamView.Line>
        <GleamView.Line testID="line2" delay={100}>
          <Text>Second</Text>
        </GleamView.Line>
        <GleamView.Line testID="line3" delay={200}>
          <Text>Third</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line1').props.delay).toBe(0);
    expect(screen.getByTestId('line2').props.delay).toBe(100);
    expect(screen.getByTestId('line3').props.delay).toBe(200);
    // All inherit shared props
    expect(screen.getByTestId('line1').props.speed).toBe(800);
    expect(screen.getByTestId('line2').props.baseColor).toBe('#D4E6F1');
  });
});

// ---------------------------------------------------------------------------
// GleamView.Line — dynamic state transitions
// ---------------------------------------------------------------------------
describe('GleamView.Line state transitions', () => {
  it('Lines update when parent props change', () => {
    const { rerender } = render(
      <GleamView loading={true} speed={800}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.speed).toBe(800);

    rerender(
      <GleamView loading={false} speed={1200}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.loading).toBe(false);
    expect(screen.getByTestId('line').props.speed).toBe(1200);
  });

  it('switches to plain View when Lines are added dynamically', () => {
    const { rerender } = render(
      <GleamView testID="parent" loading={true}>
        <Text>Normal content</Text>
      </GleamView>
    );
    expect(screen.getByTestId('parent').props.loading).toBe(true);

    rerender(
      <GleamView testID="parent" loading={true}>
        <GleamView.Line testID="line">
          <Text>Line content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();
    expect(screen.getByTestId('line').props.loading).toBe(true);
  });

  it('stays in Line mode until all Lines are removed', async () => {
    const { rerender } = render(
      <GleamView testID="parent" loading={true}>
        <GleamView.Line testID="line1">
          <Text>A</Text>
        </GleamView.Line>
        <GleamView.Line testID="line2">
          <Text>B</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();

    // Remove one Line — should still be in Line mode
    await act(async () => {
      rerender(
        <GleamView testID="parent" loading={true}>
          <GleamView.Line testID="line1">
            <Text>A</Text>
          </GleamView.Line>
        </GleamView>
      );
    });
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();

    // Remove last Line — should revert to native
    await act(async () => {
      rerender(
        <GleamView testID="parent" loading={true}>
          <Text>No lines</Text>
        </GleamView>
      );
    });
    expect(screen.getByTestId('parent').props.loading).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GleamView.Line — child detection edge cases
// ---------------------------------------------------------------------------
describe('GleamView.Line child detection', () => {
  it('detects Lines in deeply nested fragments', () => {
    render(
      <GleamView testID="parent" loading={true}>
        <>
          <>
            <GleamView.Line testID="line">
              <Text>Deep</Text>
            </GleamView.Line>
          </>
        </>
      </GleamView>
    );
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();
    expect(screen.getByTestId('line').props.loading).toBe(true);
  });

  it('detects Lines inside a non-fragment wrapper via registration', () => {
    render(
      <GleamView testID="parent" loading={true}>
        <View>
          <GleamView.Line testID="line">
            <Text>Content</Text>
          </GleamView.Line>
        </View>
      </GleamView>
    );
    // registerLine fires in useLayoutEffect, switching to plain View
    const parent = screen.getByTestId('parent');
    expect(parent.props.loading).toBeUndefined();
    expect(screen.getByTestId('line').props.loading).toBe(true);
  });

  it('renders as native GleamView when conditional Line is false', () => {
    render(
      <GleamView testID="parent" loading={true}>
        {false && (
          <GleamView.Line testID="line">
            <Text>Nope</Text>
          </GleamView.Line>
        )}
      </GleamView>
    );
    expect(screen.getByTestId('parent').props.loading).toBe(true);
  });

  it('handles mixed Line and non-Line children', () => {
    render(
      <GleamView testID="parent" loading={true}>
        <GleamView.Line testID="line">
          <Text>Shimmer</Text>
        </GleamView.Line>
        <Text>Static</Text>
      </GleamView>
    );
    expect(screen.getByTestId('parent').props.loading).toBeUndefined();
    expect(screen.getByTestId('line').props.loading).toBe(true);
    expect(screen.getByText('Static')).toBeTruthy();
  });

  it('handles null children', () => {
    render(
      <GleamView testID="gleam" loading={true}>
        {null}
      </GleamView>
    );
    expect(screen.getByTestId('gleam').props.loading).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GleamView.Line — composition edge cases
// ---------------------------------------------------------------------------
describe('GleamView.Line composition', () => {
  it('Lines inherit loading=false from parent', () => {
    render(
      <GleamView loading={false}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('line').props.loading).toBe(false);
  });

  it('Line with no children renders as empty shimmer bar', () => {
    render(
      <GleamView loading={true}>
        <GleamView.Line testID="line" style={{ height: 16 }} />
      </GleamView>
    );
    expect(screen.getByTestId('line')).toBeTruthy();
    expect(screen.getByTestId('line').props.loading).toBe(true);
  });

  it('Line renders multiple children', () => {
    render(
      <GleamView loading={true}>
        <GleamView.Line testID="line">
          <Text>First</Text>
          <Text>Second</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByText('First')).toBeTruthy();
    expect(screen.getByText('Second')).toBeTruthy();
  });

  it('nested GleamView inside a Line works independently', () => {
    render(
      <GleamView loading={true} speed={800}>
        <GleamView.Line testID="outer-line">
          <GleamView testID="inner" loading={false} speed={400}>
            <Text>Nested</Text>
          </GleamView>
        </GleamView.Line>
      </GleamView>
    );
    expect(screen.getByTestId('outer-line').props.speed).toBe(800);
    expect(screen.getByTestId('inner').props.loading).toBe(false);
    expect(screen.getByTestId('inner').props.speed).toBe(400);
  });

  it('warns when onTransitionEnd is passed with Lines present', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const handler = jest.fn();
    render(
      <GleamView loading={true} onTransitionEnd={handler}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('onTransitionEnd is ignored')
    );
    spy.mockRestore();
  });

  it('re-warns after Lines removed and re-added', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const handler = jest.fn();
    const { rerender } = render(
      <GleamView loading={true} onTransitionEnd={handler}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    const initialCalls = spy.mock.calls.filter((c) =>
      String(c[0]).includes('onTransitionEnd is ignored')
    ).length;
    expect(initialCalls).toBeGreaterThanOrEqual(1);

    // Remove Lines → reset warning ref (flush queueMicrotask)
    await act(async () => {
      rerender(
        <GleamView loading={true} onTransitionEnd={handler}>
          <Text>No lines</Text>
        </GleamView>
      );
    });
    spy.mockClear();

    // Re-add Lines → should warn again (ref was reset)
    rerender(
      <GleamView loading={true} onTransitionEnd={handler}>
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    const rewarnCalls = spy.mock.calls.filter((c) =>
      String(c[0]).includes('onTransitionEnd is ignored')
    ).length;
    expect(rewarnCalls).toBeGreaterThanOrEqual(1);
    spy.mockRestore();
  });

  it('parent View does not leak any shimmer props when Lines present', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const handler = jest.fn();
    render(
      <GleamView
        testID="parent"
        loading={true}
        speed={800}
        direction="rtl"
        delay={200}
        transitionDuration={500}
        transitionType="shrink"
        intensity={0.5}
        baseColor="#D4E6F1"
        highlightColor="#EBF5FB"
        onTransitionEnd={handler}
        style={{ width: 100 }}
      >
        <GleamView.Line testID="line">
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );
    spy.mockRestore();
    const parent = screen.getByTestId('parent');
    expect(parent.props.loading).toBeUndefined();
    expect(parent.props.speed).toBeUndefined();
    expect(parent.props.direction).toBeUndefined();
    expect(parent.props.delay).toBeUndefined();
    expect(parent.props.transitionDuration).toBeUndefined();
    expect(parent.props.transitionType).toBeUndefined();
    expect(parent.props.intensity).toBeUndefined();
    expect(parent.props.baseColor).toBeUndefined();
    expect(parent.props.highlightColor).toBeUndefined();
    expect(parent.props.onTransitionEnd).toBeUndefined();
    // View props preserved
    expect(parent.props.testID).toBe('parent');
    expect(parent.props.style).toEqual(expect.objectContaining({ width: 100 }));
  });
});

// ---------------------------------------------------------------------------
// GleamView.Line — ref stability
// ---------------------------------------------------------------------------
describe('GleamView.Line ref stability', () => {
  it('ref is stable on first render with direct Line children', () => {
    const refCalls: unknown[] = [];
    const refFn = (node: unknown) => {
      refCalls.push(node);
    };

    render(
      <GleamView ref={refFn} loading={true}>
        <GleamView.Line>
          <Text>Content</Text>
        </GleamView.Line>
      </GleamView>
    );

    // hasLineChildren detects Lines synchronously → renders as View from the start.
    // Ref receives exactly one non-null mount call (no NativeGleamView→View flip).
    const mountCalls = refCalls.filter((n) => n !== null);
    expect(mountCalls).toHaveLength(1);
  });

  it('ref is stable on first render with Fragment-wrapped Line children', () => {
    const refCalls: unknown[] = [];
    const refFn = (node: unknown) => {
      refCalls.push(node);
    };

    render(
      <GleamView ref={refFn} loading={true}>
        <>
          <GleamView.Line>
            <Text>Content</Text>
          </GleamView.Line>
        </>
      </GleamView>
    );

    // hasLineChildren traverses Fragments → still detected synchronously.
    const mountCalls = refCalls.filter((n) => n !== null);
    expect(mountCalls).toHaveLength(1);
  });

  it('ref re-fires when Lines are inside an intermediate wrapper', () => {
    function Wrapper({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
    }

    const refCalls: unknown[] = [];
    const refFn = (node: unknown) => {
      refCalls.push(node);
    };

    render(
      <GleamView ref={refFn} loading={true}>
        <Wrapper>
          <GleamView.Line>
            <Text>Content</Text>
          </GleamView.Line>
        </Wrapper>
      </GleamView>
    );

    // Wrapper is not a Fragment, so hasLineChildren can't detect Lines
    // synchronously. First render is NativeGleamView, then useLayoutEffect
    // registers the Line and flips to View → ref receives two instances.
    // This is a known limitation documented here.
    const mountCalls = refCalls.filter((n) => n !== null);
    expect(mountCalls).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// GleamView.Line outside parent
// ---------------------------------------------------------------------------
describe('GleamView.Line outside parent', () => {
  it('renders children as fallback', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    render(
      <GleamView.Line>
        <Text>Orphan</Text>
      </GleamView.Line>
    );
    expect(screen.getByText('Orphan')).toBeTruthy();
    spy.mockRestore();
  });

  it('forwards testID in fallback mode', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    render(
      <GleamView.Line testID="orphan-line">
        <Text>Orphan</Text>
      </GleamView.Line>
    );
    expect(screen.getByTestId('orphan-line')).toBeTruthy();
    spy.mockRestore();
  });

  it('warns in __DEV__', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    render(
      <GleamView.Line>
        <Text>Orphan</Text>
      </GleamView.Line>
    );
    expect(spy).toHaveBeenCalledWith(
      'GleamView.Line must be used inside a GleamView'
    );
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
describe('exports', () => {
  it('exports GleamView component', () => {
    expect(GleamView).toBeDefined();
  });

  it('exports GleamView.Line component', () => {
    expect(GleamView.Line).toBeDefined();
  });

  it('exports GleamDirection enum', () => {
    expect(GleamDirection).toBeDefined();
    expect(Object.keys(GleamDirection)).toEqual(
      expect.arrayContaining(['LeftToRight', 'RightToLeft', 'TopToBottom'])
    );
  });

  it('exports GleamTransition enum', () => {
    expect(GleamTransition).toBeDefined();
    expect(Object.keys(GleamTransition)).toEqual(
      expect.arrayContaining(['Fade', 'Shrink', 'Collapse'])
    );
  });
});
