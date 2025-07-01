// File: src/screens/MenuScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function MenuScreen({ navigation }: any) {
  const { signOut } = useAuth();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('ViewContentList')}>
        <Text style={styles.option}>Gerenciar Conteúdos</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Quizzes')}>
        <Text style={styles.option}>Ir para Quizzes</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={signOut}>
        <Text style={[styles.option, { color: '#6A5ACD' }]}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  option: { fontSize: 18, padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
