// File: src/screens/ContentListScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import api from '../services/api';
import { useIsFocused } from '@react-navigation/native';
import LoadingOverlay from '../components/LoadingOverlay';

interface Content {
  id: number;
  titulo: string;
  descricao?: string;
  link?: string;
  categoria_id?: number;
}

export default function ContentListScreen({ navigation }: any) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const fetchContents = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/conteudos');
      setContents(resp.data);
    } catch (error) {
      console.error('Erro ao buscar conteúdos', error);
      Alert.alert('Erro', 'Não foi possível carregar conteúdos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchContents();
  }, [isFocused]);

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Deseja deletar este conteúdo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/conteudos/${id}`);
            fetchContents();
          } catch (error) {
            console.error('Erro ao deletar conteúdo', error);
            Alert.alert('Erro', 'Não foi possível deletar');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Content }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        {item.descricao ? (
          <Text style={styles.cardSubtitle}>{item.descricao}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ContentForm', { contentId: item.id })}
        >
          <Text style={[styles.actionText, styles.edit]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={[styles.actionText, styles.remove]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay />}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ContentForm')}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      {contents.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum conteúdo cadastrado.</Text>
        </View>
      ) : (
        <FlatList
          data={contents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a3fce',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 10,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  edit: {
    color: '#4a3fce',
  },
  remove: {
    color: '#dc3545',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});
