// screens/CategoryListScreen.tsx

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
import { useIsFocused } from '@react-navigation/native';
import LoadingOverlay from '../components/LoadingOverlay';
import api from '../services/api';

interface Category {
  id: number;
  nome: string;
  icone?: string;
}

export default function CategoryListScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/categorias');
      setCategories(resp.data);
    } catch (err: any) {
      console.error('Erro ao buscar categorias', err);
      Alert.alert('Erro', 'Não foi possível carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchCategories();
  }, [isFocused]);

  const onDelete = (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categorias/${id}`);
              fetchCategories();
            } catch (err: any) {
              console.error('Erro ao deletar categoria', err);
              Alert.alert('Erro', 'Não foi possível excluir.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nome}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate('CategoryForm', { categoryId: item.id })
          }
        >
          <Text style={[styles.btnText, styles.edit]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onDelete(item.id)}
        >
          <Text style={[styles.btnText, styles.remove]}>Excluir</Text>
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
        onPress={() => navigation.navigate('CategoryForm')}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      {categories.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma categoria cadastrada.</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
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
    backgroundColor: '#6A5ACD',
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
    paddingBottom: 80, // espaço para o FAB
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    // sombras iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // elevação Android
    elevation: 3,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  btn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  btnText: {
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
