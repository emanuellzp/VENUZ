// src/screens/ContentFormScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import InputField from '../components/InputField';
import ButtonPrimary from '../components/ButtonPrimary';
import LoadingOverlay from '../components/LoadingOverlay';
import api from '../services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';

const PRIMARY = '#4a3fce';

type Category = { id: number; nome: string };

const ContentSchema = Yup.object().shape({
  titulo: Yup.string().required('Título obrigatório'),
  descricao: Yup.string().nullable(),
  link: Yup.string().url('URL inválida').nullable(),
  categoria_id: Yup.number().required('Selecione uma categoria'),
});

export default function ContentFormScreen({ route, navigation }: any) {
  const contentId: number | undefined = route.params?.contentId;
  const [initialValues, setInitialValues] = useState({
    titulo: '',
    descricao: '',
    link: '',
    categoria_id: undefined as number | undefined,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in dos campos
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Carregar categorias
  const fetchCategories = async () => {
    try {
      const resp = await api.get<Category[]>('/categorias');
      setCategories(resp.data);
    } catch (error) {
      console.error('Erro ao buscar categorias', error);
      Alert.alert('Erro', 'Não foi possível carregar categorias');
    }
  };

  // Se for edição, busca dados iniciais
  useEffect(() => {
    fetchCategories();
    if (contentId) {
      setLoading(true);
      api.get(`/conteudos/${contentId}`)
        .then(resp => {
          setInitialValues({
            titulo: resp.data.titulo,
            descricao: resp.data.descricao || '',
            link: resp.data.link || '',
            categoria_id: resp.data.categoria_id,
          });
        })
        .catch(err => {
          console.error('Erro ao buscar conteúdo', err);
          Alert.alert('Erro', 'Não foi possível carregar conteúdo');
          navigation.goBack();
        })
        .finally(() => setLoading(false));
    }
  }, [contentId]);

  // Submit do formulário
  const handleSubmit = async (values: typeof initialValues) => {
    setLoading(true);
    try {
      const payload = {
        titulo: values.titulo,
        descricao: values.descricao || null,
        link: values.link || null,
        categoria_id: values.categoria_id,
      };
      if (contentId) {
        await api.put(`/conteudos/${contentId}`, payload);
      } else {
        await api.post('/conteudos', payload);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar conteúdo', error);
      Alert.alert('Erro', 'Não foi possível salvar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {loading && <LoadingOverlay />}

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={ContentSchema}
            onSubmit={values => handleSubmit(values)}
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
              isSubmitting,
            }) => (
              <>
                {/* Título */}
                <InputField
                  label="Título"
                  value={values.titulo}
                  onChangeText={handleChange('titulo')}
                  errorMessage={touched.titulo ? errors.titulo : undefined}
                />

                {/* Descrição: TextInput multiline */}
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={styles.textarea}
                  value={values.descricao}
                  onChangeText={handleChange('descricao')}
                  placeholder="Digite a descrição"
                  multiline
                  numberOfLines={4}
                />
                {touched.descricao && errors.descricao && (
                  <Text style={styles.errorText}>{errors.descricao}</Text>
                )}

                {/* Link */}
                <InputField
                  label="Link"
                  value={values.link}
                  onChangeText={handleChange('link')}
                  placeholder="https://..."
                  errorMessage={touched.link ? errors.link : undefined}
                />

                {/* Seletor de categoria */}
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Categoria</Text>
                  <View style={styles.pickerBox}>
                    <Picker
                      selectedValue={values.categoria_id}
                      onValueChange={itemValue =>
                        setFieldValue('categoria_id', itemValue)
                      }
                      dropdownIconColor={PRIMARY}
                    >
                      <Picker.Item label="Selecione..." value={undefined} />
                      {categories.map(cat => (
                        <Picker.Item
                          key={cat.id}
                          label={cat.nome}
                          value={cat.id}
                        />
                      ))}
                    </Picker>
                  </View>
                  {touched.categoria_id && errors.categoria_id && (
                    <Text style={styles.errorText}>
                      {errors.categoria_id}
                    </Text>
                  )}
                </View>

                {/* Botão */}
                <ButtonPrimary
                  title={contentId ? 'Atualizar' : 'Criar Conteúdo'}
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  style={styles.button}
                />
              </>
            )}
          </Formik>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    // sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevação Android
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Inter-SemiBold',
  },
  textarea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginVertical: 12,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    fontFamily: 'Inter-SemiBold',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    marginTop: 20,
    backgroundColor: PRIMARY,
  },
});

