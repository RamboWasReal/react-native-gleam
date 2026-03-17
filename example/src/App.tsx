import { useState } from 'react';
import { StyleSheet, Text, Pressable, ScrollView, View } from 'react-native';
import { GleamView, GleamDirection, GleamTransition } from 'react-native-gleam';

const DIRECTIONS: { label: string; value: GleamDirection }[] = [
  { label: 'LTR', value: GleamDirection.LeftToRight },
  { label: 'RTL', value: GleamDirection.RightToLeft },
  { label: 'TTB', value: GleamDirection.TopToBottom },
];

const COLOR_PRESETS = [
  { label: 'Default', base: '#E0E0E0', highlight: '#F5F5F5' },
  { label: 'Blue', base: '#D4E6F1', highlight: '#EBF5FB' },
  { label: 'Warm', base: '#F5E6D3', highlight: '#FDF2E9' },
  { label: 'Purple', base: '#E8DAEF', highlight: '#F4ECF7' },
];

function Stepper({
  label,
  value,
  formatValue,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: number;
  formatValue?: (v: number) => string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable style={styles.stepperBtn} onPress={onDecrement}>
          <Text style={styles.stepperBtnText}>-</Text>
        </Pressable>
        <Text style={styles.stepperValue}>
          {formatValue ? formatValue(value) : value}
        </Text>
        <Pressable style={styles.stepperBtn} onPress={onIncrement}>
          <Text style={styles.stepperBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [speed, setSpeed] = useState(1000);
  const [intensity, setIntensity] = useState(1.0);
  const [dirIndex, setDirIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(300);
  const [transitionType, setTransitionType] = useState(GleamTransition.Fade);

  const direction = DIRECTIONS[dirIndex]!.value;
  const colors = COLOR_PRESETS[colorIndex]!;

  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>react-native-gleam</Text>

      {/* Profile card skeleton */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <GleamView
            loading={loading}
            speed={speed}
            intensity={intensity}
            direction={direction}
            baseColor={colors.base}
            highlightColor={colors.highlight}
            transitionDuration={transitionDuration}
            transitionType={transitionType}
            style={styles.avatar}
          >
            <View style={styles.avatarContent}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </GleamView>
          <View style={styles.profileInfo}>
            <GleamView
              loading={loading}
              speed={speed}
              intensity={intensity}
              direction={direction}
              baseColor={colors.base}
              highlightColor={colors.highlight}
              transitionDuration={transitionDuration}
              transitionType={transitionType}
              delay={100}
              style={styles.nameLine}
            >
              <Text style={styles.nameText}>John Doe</Text>
            </GleamView>
            <GleamView
              loading={loading}
              speed={speed}
              intensity={intensity}
              direction={direction}
              baseColor={colors.base}
              highlightColor={colors.highlight}
              transitionDuration={transitionDuration}
              transitionType={transitionType}
              delay={200}
              style={styles.subtitleLine}
            >
              <Text style={styles.subtitleText}>Product Designer</Text>
            </GleamView>
          </View>
        </View>
        <GleamView
          loading={loading}
          speed={speed}
          intensity={intensity}
          direction={direction}
          baseColor={colors.base}
          highlightColor={colors.highlight}
          transitionDuration={transitionDuration}
          transitionType={transitionType}
          delay={300}
          style={styles.bodyLine}
        >
          <Text style={styles.bodyText}>
            Working on the new onboarding flow for v2.4
          </Text>
        </GleamView>
        <View style={styles.statsRow}>
          {['47 projects', '1.8k followers', '284 following'].map((stat, i) => (
            <GleamView
              key={stat}
              loading={loading}
              speed={speed}
              intensity={intensity}
              direction={direction}
              baseColor={colors.base}
              highlightColor={colors.highlight}
              transitionDuration={transitionDuration}
              transitionType={transitionType}
              delay={400 + i * 100}
              style={styles.statBadge}
            >
              <Text style={styles.statText}>{stat}</Text>
            </GleamView>
          ))}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Stepper
          label="Speed"
          value={speed}
          formatValue={(v) => `${v}ms`}
          onDecrement={() => setSpeed((v) => clamp(v - 200, 200, 3000))}
          onIncrement={() => setSpeed((v) => clamp(v + 200, 200, 3000))}
        />
        <Stepper
          label="Transition"
          value={transitionDuration}
          formatValue={(v) => `${v}ms`}
          onDecrement={() =>
            setTransitionDuration((v) => clamp(v - 100, 0, 2000))
          }
          onIncrement={() =>
            setTransitionDuration((v) => clamp(v + 100, 0, 2000))
          }
        />
        <Stepper
          label="Intensity"
          value={intensity}
          formatValue={(v) => v.toFixed(1)}
          onDecrement={() =>
            setIntensity((v) => clamp(Math.round((v - 0.1) * 10) / 10, 0, 1))
          }
          onIncrement={() =>
            setIntensity((v) => clamp(Math.round((v + 0.1) * 10) / 10, 0, 1))
          }
        />

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Direction</Text>
          <View style={styles.chips}>
            {DIRECTIONS.map((d, i) => (
              <Chip
                key={d.value}
                label={d.label}
                selected={dirIndex === i}
                onPress={() => setDirIndex(i)}
              />
            ))}
          </View>
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>
            Colors{' '}
            <Text style={styles.optionHint}>
              (presets — accepts any hex, rgb, or named color)
            </Text>
          </Text>
          <View style={styles.chips}>
            {COLOR_PRESETS.map((preset, i) => (
              <Chip
                key={preset.label}
                label={preset.label}
                selected={colorIndex === i}
                onPress={() => setColorIndex(i)}
              />
            ))}
          </View>
        </View>

        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>Transition</Text>
          <View style={styles.chips}>
            {(
              [
                { label: 'Fade', value: GleamTransition.Fade },
                { label: 'Shrink', value: GleamTransition.Shrink },
                { label: 'Collapse', value: GleamTransition.Collapse },
              ] as const
            ).map((t) => (
              <Chip
                key={t.label}
                label={t.label}
                selected={transitionType === t.value}
                onPress={() => setTransitionType(t.value)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Multi-line skeleton using GleamView.Line */}
      <Text style={styles.sectionLabel}>Multi-line (GleamView.Line)</Text>
      <View style={styles.lineCard}>
        <GleamView
          loading={loading}
          speed={speed}
          intensity={intensity}
          direction={direction}
          baseColor={colors.base}
          highlightColor={colors.highlight}
          transitionDuration={transitionDuration}
          transitionType={transitionType}
        >
          <GleamView.Line style={styles.lineTitle} delay={0}>
            <Text style={styles.lineTitleText}>Article Title</Text>
          </GleamView.Line>
          <GleamView.Line style={styles.lineSubtitle} delay={100}>
            <Text style={styles.lineSubtitleText}>
              Published on March 15, 2026
            </Text>
          </GleamView.Line>
          <GleamView.Line style={styles.lineBody} delay={200}>
            <Text style={styles.lineBodyText}>
              This is the first paragraph of the article content that wraps
              across multiple lines.
            </Text>
          </GleamView.Line>
          <GleamView.Line style={styles.lineBodyShort} delay={300}>
            <Text style={styles.lineBodyText}>A shorter second paragraph.</Text>
          </GleamView.Line>
        </GleamView>
      </View>

      {/* Staggered demo */}
      <Text style={styles.sectionLabel}>Staggered</Text>
      <View style={styles.staggered}>
        {[0, 150, 300].map((delay) => (
          <GleamView
            key={delay}
            loading={loading}
            delay={delay}
            speed={speed}
            intensity={intensity}
            direction={direction}
            baseColor={colors.base}
            highlightColor={colors.highlight}
            transitionDuration={transitionDuration}
            transitionType={transitionType}
            style={styles.cardSmall}
          >
            <Text style={styles.cardText}>{delay}ms delay</Text>
          </GleamView>
        ))}
      </View>

      <Pressable style={styles.button} onPress={() => setLoading((v) => !v)}>
        <Text style={styles.buttonText}>
          {loading ? 'Stop Loading' : 'Start Loading'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 28,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  nameLine: {
    height: 22,
    borderRadius: 6,
    width: '60%',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  subtitleLine: {
    height: 18,
    borderRadius: 5,
    width: '40%',
  },
  subtitleText: {
    fontSize: 13,
    color: '#888',
  },
  bodyLine: {
    height: 20,
    borderRadius: 6,
    width: '100%',
  },
  bodyText: {
    fontSize: 14,
    color: '#555',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  controls: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    minWidth: 50,
    textAlign: 'center',
  },
  optionRow: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  optionHint: {
    fontWeight: '400',
    color: '#999',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  chipSelected: {
    backgroundColor: '#333',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  lineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 16,
    marginBottom: 20,
  },
  lineTitle: {
    height: 24,
    borderRadius: 6,
    width: '75%',
    marginBottom: 8,
  },
  lineTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  lineSubtitle: {
    height: 16,
    borderRadius: 4,
    width: '50%',
    marginBottom: 12,
  },
  lineSubtitleText: {
    fontSize: 12,
    color: '#999',
  },
  lineBody: {
    height: 40,
    borderRadius: 4,
    width: '100%',
    marginBottom: 6,
  },
  lineBodyShort: {
    height: 20,
    borderRadius: 4,
    width: '60%',
  },
  lineBodyText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  staggered: {
    gap: 6,
    marginBottom: 24,
  },
  cardSmall: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  cardText: {
    fontSize: 14,
    padding: 12,
  },
  button: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
