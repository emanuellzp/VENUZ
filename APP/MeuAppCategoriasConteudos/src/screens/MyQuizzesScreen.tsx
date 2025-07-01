import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const star = require('../../assets/images/star.png');
const starFilled = require('../../assets/images/star-filled.png');

interface UserQuiz {
  id: number;
  pergunta: string;
  categoria?: { id: number; nome: string };
}

export default function MyQuizzesScreen({ navigation }: any) {
  const [myQuizzes, setMyQuizzes] = useState<UserQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  const fetchMyQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/me/quizzes');
      if (Array.isArray(data)) {
        setMyQuizzes(data);
      } else {
        console.error('Formato inesperado em /me/quizzes:', data);
        Alert.alert('Erro', 'Resposta inválida ao carregar quizzes.');
      }
    } catch (err: any) {
      console.error('Erro ao carregar meus quizzes:', err.response?.data || err.message);
      Alert.alert('Erro', 'Não foi possível carregar seus quizzes.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFavoritos = useCallback(async () => {
    try {
      const { data } = await api.get('/me/favoritos/quizzes');
      if (Array.isArray(data)) {
        setFavoritos(data.map((q: any) => q.id));
      } else {
        console.error('Formato inesperado em /me/favoritos/quizzes:', data);
        setFavoritos([]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar favoritos:', err.response?.data || err.message);
      Alert.alert('Erro', 'Não foi possível buscar favoritos.');
    }
  }, []);

  const toggleFavorito = async (quizId: number) => {
    try {
      if (favoritos.includes(quizId)) {
        await api.delete(`/desfavoritar-quiz/${quizId}`);
        setFavoritos(prev => prev.filter(id => id !== quizId));
      } else {
        await api.post(`/favoritar-quiz/${quizId}`);
        setFavoritos(prev => [...prev, quizId]);
      }
    } catch (err: any) {
      console.error('Erro ao favoritar:', err.response?.data || err.message);
      Alert.alert('Erro', 'Não foi possível alterar favorito.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyQuizzes();
      fetchFavoritos();
    }, [fetchMyQuizzes, fetchFavoritos])
  );

  const handleDeleteQuiz = (quizId: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este quiz?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/quizzes/${quizId}`);
              Alert.alert('Sucesso', 'Quiz excluído.');
              fetchMyQuizzes();
              fetchFavoritos();
            } catch (err: any) {
              console.error('Erro ao excluir quiz:', err.response?.data || err.message);
              Alert.alert('Erro', 'Não foi possível excluir o quiz.');
            }
          }
        }
      ]
    );
  };

  const renderQuizItem = ({ item }: { item: UserQuiz }) => (
    <View style={s.quizCard}>
      <View style={s.quizHeader}>
        <Text style={s.quizQuestion}>{item.pergunta}</Text>
        <TouchableOpacity onPress={() => toggleFavorito(item.id)}>
          <Image
            source={favoritos.includes(item.id) ? starFilled : star}
            style={s.starIcon}
          />
        </TouchableOpacity>
      </View>
      {item.categoria && (
        <Text style={s.quizCategory}>Categoria: {item.categoria.nome}</Text>
      )}
      <View style={s.actionsContainer}>
        <TouchableOpacity
          style={[s.actionButton, s.editButton]}
          onPress={() =>
            navigation.navigate('Quizzes', {
              screen: 'QuizForm',
              params: { quizId: item.id }
            })
          }
        >
          <Text style={s.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionButton, s.deleteButton]}
          onPress={() => handleDeleteQuiz(item.id)}
        >
          <Text style={s.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#4a3fce" />
        <Text style={{ marginTop: 10 }}>Carregando seus quizzes...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.createButton}
        onPress={() =>
          navigation.navigate('Quizzes', { screen: 'QuizForm' })
        }
      >
        <Text style={s.createButtonText}>Criar Novo Quiz</Text>
      </TouchableOpacity>
      <FlatList
        data={myQuizzes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderQuizItem}
        ListEmptyComponent={
          <View style={s.centerEmptyList}>
            <Text style={s.emptyListText}>
              Você ainda não criou nenhum quiz.
            </Text>
          </View>
        }
        contentContainerStyle={
          myQuizzes.length === 0 && s.centerListEmpty
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  createButton: {
    backgroundColor: '#4a3fce', padding: 15, borderRadius: 8,
    alignItems: 'center', marginBottom: 20, elevation: 4
  },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quizCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 15,
    marginBottom: 12, elevation: 3
  },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizQuestion: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  quizCategory: { fontSize: 13, color: '#777', marginTop: 6, fontStyle: 'italic' },
  starIcon: { width: 22, height: 22, tintColor: '#f9c600' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6, marginLeft: 10 },
  editButton: { backgroundColor: '#ffc107' },
  deleteButton: { backgroundColor: '#dc3545' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyListText: { textAlign: 'center', fontSize: 16, color: '#777' },
  centerListEmpty: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  centerEmptyList: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
