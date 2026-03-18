import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// --- Constants ---
const MIN_STAT = 0;
const MAX_STAT = 100;
const FEED_AMOUNT = 10;
const PLAY_HAPPINESS = 15;
const PLAY_HUNGER_COST = 10;  // oynamak acıktırır
const PLAY_ENERGY_COST = 20;  // oynamak yorar
const REST_ENERGY_GAIN = 30;  // dinlenmek enerji verir
const HUNGER_LOW = 30;
const HUNGER_HIGH = 70;
const HAPPINESS_LOW = 30;
const HAPPINESS_HIGH = 70;

// --- Helpers ---
function getHungerEmoji(aclik) {
  if (aclik <= HUNGER_LOW) return '😵';
  if (aclik <= HUNGER_HIGH) return '😐';
  return '😋';
}

function getHappinessColor(mutluluk) {
  if (mutluluk <= HAPPINESS_LOW) return '#FFEBEB';
  if (mutluluk <= HAPPINESS_HIGH) return '#FFF9E6';
  return '#E8F5E9';
}

// --- Card Component ---
function Card({ isim, tur }) {
  const [aclik, setAclik] = useState(50);
  const [mutluluk, setMutluluk] = useState(50);
  const [enerji, setEnerji] = useState(80);

  const besle = () => setAclik(prev => Math.min(MAX_STAT, prev + FEED_AMOUNT));

  const oyna = () => {
    if (enerji <= 0) return; // enerjisi yoksa oynayamaz
    setMutluluk(prev => Math.min(MAX_STAT, prev + PLAY_HAPPINESS));
    setAclik(prev => Math.max(MIN_STAT, prev - PLAY_HUNGER_COST));
    setEnerji(prev => Math.max(MIN_STAT, prev - PLAY_ENERGY_COST));
  };

  const dinlen = () => {
    setEnerji(prev => Math.min(MAX_STAT, prev + REST_ENERGY_GAIN));
  };

  return (
    <View style={[styles.card, { backgroundColor: getHappinessColor(mutluluk) }]}>
      <Text style={styles.title}>{isim}</Text>
      <Text style={styles.subtitle}>{tur}</Text>

      <Text style={styles.emoji}>{getHungerEmoji(aclik)}</Text>

      <Text style={styles.statText}>🍖 Tokluk: {aclik} / {MAX_STAT}</Text>
      <Text style={styles.statText}>😊 Mutluluk: {mutluluk} / {MAX_STAT}</Text>
      <Text style={styles.statText}>⚡ Enerji: {enerji} / {MAX_STAT}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.feedButton]} onPress={besle}>
          <Text style={styles.buttonText}>🍗 Besle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.playButton]} onPress={oyna}>
          <Text style={styles.buttonText}>🎾 Oyna</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.restButton]} onPress={dinlen}>
          <Text style={styles.buttonText}>💤 Dinlen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- App ---
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Card isim="Boncuk" tur="Kedi 🐱" />
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    // Android shadow
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  statText: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedButton: {
    backgroundColor: '#ED8936',
  },
  playButton: {
    backgroundColor: '#48BB78',
  },
  restButton: {
    backgroundColor: '#7B8CDE',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
