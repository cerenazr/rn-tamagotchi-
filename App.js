import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Button, StyleSheet } from 'react-native';


function Card({ isim, tur }) {
  const [aclik, setAclik] = useState(50);
  const [mutluluk, setMutluluk] = useState(50);

  const besle = () => {
    setAclik(prev => Math.max(0, prev - 10));
  }

  const oyna = () => {
    setMutluluk(prev => Math.min(100, prev + 10));
  }

  return (
    <View style={styles.card}>
      <Text>Açlık: {aclik}</Text>
      <Text>Mutluluk: {mutluluk}</Text>
      <Button title="Besle" onPress={besle} />
      <Button title="Oyna" onPress={oyna} />
    </View>
  )
}

export default function App() {
  return (
    <View style={styles.container}>
      <Card isim="Boncuk" tur="Kedi" />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 20,
  },
});