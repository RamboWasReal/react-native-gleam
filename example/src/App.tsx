import { useState } from 'react';
import { Alert, StyleSheet, Text, Pressable, ScrollView } from 'react-native';
import { GleamView, GleamDirection } from 'react-native-gleam';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>react-native-gleam</Text>

      <Text style={styles.label}>Default (LTR)</Text>
      <GleamView loading={loading} style={styles.card}>
        <Text style={styles.cardText}>Content loaded!</Text>
      </GleamView>

      <Text style={styles.label}>Fast (600ms)</Text>
      <GleamView loading={loading} speed={600} style={styles.card}>
        <Text style={styles.cardText}>Fast shimmer</Text>
      </GleamView>

      <Text style={styles.label}>Direction: RTL</Text>
      <GleamView
        loading={loading}
        direction={GleamDirection.RightToLeft}
        style={styles.card}
      >
        <Text style={styles.cardText}>Right to left</Text>
      </GleamView>

      <Text style={styles.label}>Direction: TTB</Text>
      <GleamView
        loading={loading}
        direction={GleamDirection.TopToBottom}
        style={styles.card}
      >
        <Text style={styles.cardText}>Top to bottom</Text>
      </GleamView>

      <Text style={styles.label}>Custom colors</Text>
      <GleamView
        loading={loading}
        baseColor="#D4E6F1"
        highlightColor="#EBF5FB"
        style={styles.card}
      >
        <Text style={styles.cardText}>Blue tint</Text>
      </GleamView>

      <Text style={styles.label}>Subtle intensity (0.3)</Text>
      <GleamView loading={loading} intensity={0.3} style={styles.card}>
        <Text style={styles.cardText}>Subtle shimmer</Text>
      </GleamView>

      <Text style={styles.label}>Staggered (delay cascade)</Text>
      <GleamView loading={loading} delay={0} style={styles.cardSmall}>
        <Text style={styles.cardText}>Row 1</Text>
      </GleamView>
      <GleamView loading={loading} delay={150} style={styles.cardSmall}>
        <Text style={styles.cardText}>Row 2</Text>
      </GleamView>
      <GleamView loading={loading} delay={300} style={styles.cardSmall}>
        <Text style={styles.cardText}>Row 3</Text>
      </GleamView>

      <Text style={styles.label}>
        Slow transition (800ms) + onTransitionEnd
      </Text>
      <GleamView
        loading={loading}
        animateDuration={800}
        onTransitionEnd={({ nativeEvent }) => {
          Alert.alert('Transition ended', `finished: ${nativeEvent.finished}`);
        }}
        style={styles.card}
      >
        <Text style={styles.cardText}>Slow fade in</Text>
      </GleamView>

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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 32,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '500',
    color: '#888',
    marginBottom: 6,
  },
  card: {
    width: '100%',
    height: 70,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  cardSmall: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  cardText: {
    fontSize: 16,
    padding: 16,
  },
  button: {
    marginTop: 8,
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
