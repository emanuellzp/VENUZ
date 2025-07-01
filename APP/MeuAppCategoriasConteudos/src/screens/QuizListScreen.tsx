// src/screens/QuizListScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PRIMARY = '#4a3fce';
const SECONDARY = '#6A5ACD';

interface QuizSummary {
  id: number;
  pergunta: string;
  categoria: { id: number; nome: string };
}

export default function QuizListScreen({ navigation }: any) {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get<QuizSummary[]>('/quizzes');
        setQuizzes(resp.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      }
    })();
  }, []);

  const renderItem = ({ item }: { item: QuizSummary }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('QuizPlay', { tipo: 'byId', quizId: item.id })}
    >
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.pergunta}
      </Text>
      <View style={styles.cardFooter}>
        <Ionicons name="pricetag" size={16} color={SECONDARY} />
        <Text style={styles.cardCategory}>{item.categoria.nome}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Carregando quizzes...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {quizzes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhum quiz cadastrado.</Text>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={q => q.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  cardCategory: { marginLeft: 6, color: SECONDARY, fontSize: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: PRIMARY },
  emptyText: { color: '#777', fontSize: 16 },
});
