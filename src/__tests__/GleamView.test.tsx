import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { GleamView, GleamDirection } from '../index';

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

  it('passes animateDuration=undefined (native default 300)', () => {
    render(<GleamView testID="gleam" />);
    expect(getNativeProps().animateDuration).toBeUndefined();
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

  it('passes animateDuration value', () => {
    render(<GleamView testID="gleam" animateDuration={800} />);
    expect(getNativeProps().animateDuration).toBe(800);
  });

  it('passes animateDuration=0 for instant transition', () => {
    render(<GleamView testID="gleam" animateDuration={0} />);
    expect(getNativeProps().animateDuration).toBe(0);
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
        animateDuration={500}
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
    expect(props.animateDuration).toBe(500);
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
        animateDuration={0}
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
    expect(props.animateDuration).toBe(0);
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
// Exports
// ---------------------------------------------------------------------------
describe('exports', () => {
  it('exports GleamView component', () => {
    expect(GleamView).toBeDefined();
  });

  it('exports GleamDirection enum', () => {
    expect(GleamDirection).toBeDefined();
    expect(Object.keys(GleamDirection)).toEqual(
      expect.arrayContaining(['LeftToRight', 'RightToLeft', 'TopToBottom'])
    );
  });
});
