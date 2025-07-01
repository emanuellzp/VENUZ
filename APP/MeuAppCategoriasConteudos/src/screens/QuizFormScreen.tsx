// src/screens/QuizFormScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizForm'>;

interface QuizForForm {
  id?: number;
  categoria_id: number | null;
  pergunta: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  resposta_correta: 'a' | 'b' | 'c' | 'd' | '';
}

export default function QuizFormScreen({ route, navigation }: Props) {
  const quizId = route.params?.quizId;
  const [quiz, setQuiz] = useState<QuizForForm>({
    id: undefined,
    categoria_id: null,
    pergunta: '',
    alternativa_a: '',
    alternativa_b: '',
    alternativa_c: '',
    alternativa_d: '',
    resposta_correta: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: number; nome: string }[]>([]);

  // animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    navigation.setOptions({
      title: quizId ? 'Editar Quiz' : 'Novo Quiz',
      headerStyle: { backgroundColor: '#4a3fce' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '600' },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });

    (async () => {
      try {
        const [{ data: cats }, quizResp] = await Promise.all([
          api.get('/categorias'),
          quizId ? api.get(`/quizzes/${quizId}`) : Promise.resolve({ data: null }),
        ]);
        setCategories(cats);
        if (quizResp.data) {
          setQuiz({
            id: quizResp.data.id,
            categoria_id: quizResp.data.categoria_id,
            pergunta: quizResp.data.pergunta,
            alternativa_a: quizResp.data.alternativa_a,
            alternativa_b: quizResp.data.alternativa_b,
            alternativa_c: quizResp.data.alternativa_c,
            alternativa_d: quizResp.data.alternativa_d,
            resposta_correta: quizResp.data.resposta_correta,
          });
        }
      } catch (err: any) {
        console.error('Erro ao carregar formulário:', err);
        Alert.alert('Erro', 'Falha ao carregar dados.');
        navigation.goBack();
      } finally {
        setLoading(false);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
      }
    })();
  }, [quizId]);

  const handleChange = (field: keyof QuizForForm, value: any) =>
    setQuiz(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (
      !quiz.pergunta ||
      !quiz.alternativa_a ||
      !quiz.alternativa_b ||
      !quiz.alternativa_c ||
      !quiz.alternativa_d ||
      !quiz.resposta_correta ||
      quiz.categoria_id === null
    ) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }
    setSaving(true);
    try {
      if (quizId) {
        await api.put(`/quizzes/${quizId}`, quiz);
        Alert.alert('Sucesso', 'Quiz atualizado!');
      } else {
        await api.post('/quizzes', quiz);
        Alert.alert('Sucesso', 'Quiz criado!');
        setQuiz({
          id: undefined,
          categoria_id: null,
          pergunta: '',
          alternativa_a: '',
          alternativa_b: '',
          alternativa_c: '',
          alternativa_d: '',
          resposta_correta: '',
        });
      }
      navigation.goBack();
    } catch (err: any) {
      console.error('Erro ao salvar quiz:', err);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a3fce" />
        <Text style={styles.loadingText}>Carregando formulário...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.sectionTitle}>Selecione Categoria</Text>
        <View style={styles.pickerContainer}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryBtn,
                quiz.categoria_id === cat.id && styles.categoryBtnSelected,
              ]}
              onPress={() => handleChange('categoria_id', cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  quiz.categoria_id === cat.id && styles.categoryTextSelected,
                ]}
              >
                {cat.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Pergunta</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Digite a pergunta"
          value={quiz.pergunta}
          onChangeText={text => handleChange('pergunta', text)}
        />

        {['a', 'b', 'c', 'd'].map(letter => (
          <View key={letter}>
            <Text style={styles.sectionTitle}>Alternativa {letter.toUpperCase()}</Text>
            <TextInput
              style={styles.input}
              placeholder={`Opção ${letter.toUpperCase()}`}
              value={quiz[`alternativa_${letter}` as keyof QuizForForm] as string}
              onChangeText={text => handleChange(`alternativa_${letter}` as keyof QuizForForm, text)}
            />
          </View>
        ))}

        <Text style={styles.sectionTitle}>Resposta Correta</Text>
        <View style={styles.radioGroup}>
          {['a', 'b', 'c', 'd'].map(letter => (
            <TouchableOpacity
              key={letter}
              style={styles.radioBtn}
              onPress={() => handleChange('resposta_correta', letter as any)}
            >
              <View
                style={[
                  styles.radioCircle,
                  quiz.resposta_correta === letter && styles.radioCircleSelected,
                ]}
              />
              <Text style={styles.radioLabel}>{letter.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Salvar Quiz</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#4a3fce', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryBtnSelected: {
    backgroundColor: '#6A5ACD',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 40,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  radioBtn: { flexDirection: 'row', alignItems: 'center' },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4a3fce',
    marginRight: 6,
  },
  radioCircleSelected: {
    backgroundColor: '#4a3fce',
  },
  radioLabel: { fontSize: 16, color: '#333' },
  saveBtn: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
