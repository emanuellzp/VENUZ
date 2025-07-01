import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ResultScreen = ({ route, navigation }: any) => {
  const { pontuacao, total } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Você acertou {pontuacao} de {total} perguntas!</Text>
      <Button title="Voltar ao início" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  texto: { fontSize: 20, marginBottom: 20 },
});

export default ResultScreen;
