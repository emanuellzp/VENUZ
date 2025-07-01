// src/screens/ViewContentListScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TextInput,
} from 'react-native';
import api from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');
const PRIMARY = '#4a3fce';
const SECONDARY = '#6A5ACD';
const GREY_LIGHT = '#e0e0e0';

type Props = NativeStackScreenProps<RootStackParamList, 'ViewContentList'>;

interface Content {
  id: number;
  titulo: string;
  descricao: string;
  categoria?: { id: number; nome: string };
}

interface Category {
  id: number;
  nome: string;
}

export default function ViewContentListScreen({ navigation }: Props) {
  const [contents, setContents] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cResp, catResp] = await Promise.all([
        api.get<Content[]>('/conteudos'),
        api.get<Category[]>('/categorias'),
      ]);
      setContents(cResp.data);
      setCategories(catResp.data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (err) {
      console.warn('Erro ao carregar dados', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contents
    .filter(item =>
      (!selectedCategory || item.categoria?.id === selectedCategory) &&
      item.titulo.toLowerCase().includes(search.toLowerCase())
    );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conteúdos</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        <FlatList
          data={[{ id: 0, nome: 'Todos' }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={({ id }) => id.toString()}
          renderItem={({ item }) => {
            const selected = item.id === selectedCategory || (item.id === 0 && !selectedCategory);
            return (
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  selected && styles.filterBtnActive
                ]}
                onPress={() => setSelectedCategory(item.id === 0 ? null : item.id)}
              >
                <Text style={[
                  styles.filterTxt,
                  selected && styles.filterTxtActive
                ]}>{item.nome}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={filtered.length ? {} : styles.centerEmpty}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nenhum conteúdo encontrado.</Text>
        )}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ContentView', { contentId: item.id, contentTitle: item.titulo })}
          >
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardDesc}>{item.descricao.slice(0, 60)}...</Text>
            {item.categoria && (
              <Text style={styles.cardCat}>{item.categoria.nome}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  filterRow: { paddingVertical: 10, paddingHorizontal: 12 },
  filterBtn: {
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: GREY_LIGHT,
  },
  filterBtnActive: {
    backgroundColor: SECONDARY,
  },
  filterTxt: { color: '#495057' },
  filterTxtActive: { color: '#fff', fontWeight: '600' },
  row: { justifyContent: 'space-between', paddingHorizontal: 12 },
  card: {
    backgroundColor: '#fff',
    width: (width - 48) / 2,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  cardDesc: { fontSize: 13, color: '#666', marginVertical: 6 },
  cardCat: { fontSize: 12, color: SECONDARY, fontStyle: 'italic' },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
  },
  centerEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
