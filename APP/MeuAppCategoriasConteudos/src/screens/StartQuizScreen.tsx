// src/screens/StartQuizScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PRIMARY = '#4a3fce';
const SECONDARY = '#6A5ACD';

interface Category {
  id: number;
  nome: string;
}

export default function StartQuizScreen({ navigation }: any) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    api
      .get<Category[]>('/categorias')
      .then(r => setCats(r.data))
      .catch(() => Alert.alert('Erro', 'Não carregou categorias'))
      .finally(() => {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
  }, []);

  const renderCat = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.catBtn}
      onPress={() => navigation.navigate('QuizPlay', { tipo: 'categoria', categoriaId: item.id })}
    >
      <Ionicons name="chevron-forward" size={20} color="#fff" />
      <Text style={styles.catText}>{item.nome}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: '#28a745' }]}
        onPress={() => navigation.navigate('QuizPlay', { tipo: 'random' })}
      >
        <Ionicons name="shuffle" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.txt}>Quiz Aleatório</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Por Categoria</Text>
      {cats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhuma categoria.</Text>
        </View>
      ) : (
        <FlatList
          data={cats}
          keyExtractor={i => i.id.toString()}
          renderItem={renderCat}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  txt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  catText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: PRIMARY },
  emptyText: { color: '#777', fontSize: 16 },
});
