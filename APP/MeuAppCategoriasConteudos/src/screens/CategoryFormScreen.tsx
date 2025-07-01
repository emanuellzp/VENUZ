// ..//src/screens/CategoryFormScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import InputField from '../components/InputField';
import ButtonPrimary from '../components/ButtonPrimary';
import api from '../services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoadingOverlay from '../components/LoadingOverlay';

const CategorySchema = Yup.object().shape({
  nome: Yup.string().required('Obrigatório'),
  icone: Yup.string().nullable(),
});

const CategoryFormScreen = ({ route, navigation }: any) => {
  const categoryId: number | undefined = route.params?.categoryId;
  const [initialValues, setInitialValues] = useState({ nome: '', icone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId) {
      // carregar dados existentes
      setLoading(true);
      api.get(`/categorias/${categoryId}`)
        .then(resp => {
          setInitialValues({ nome: resp.data.nome, icone: resp.data.icone || '' });
        })
        .catch(error => {
          console.error('Erro ao buscar categoria', error);
          Alert.alert('Erro', 'Não foi possível carregar categoria');
          navigation.goBack();
        })
        .finally(() => setLoading(false));
    }
  }, [categoryId]);

  const handleSubmit = async (values: { nome: string; icone: string }) => {
    setLoading(true);
    try {
      if (categoryId) {
        // rota de update usa POST /categorias/{id}
        await api.post(`/categorias/${categoryId}`, values);
      } else {
        await api.post('/categorias', values);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar categoria', error);
      Alert.alert('Erro', 'Não foi possível salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay />}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={CategorySchema}
        onSubmit={values => handleSubmit(values)}
      >
        {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
          <>
            <InputField
              label="Nome"
              value={values.nome}
              onChangeText={handleChange('nome')}
              errorMessage={touched.nome ? errors.nome : undefined}
            />
            <InputField
              label="Ícone (URL ou nome)"
              value={values.icone}
              onChangeText={handleChange('icone')}
              errorMessage={touched.icone ? errors.icone : undefined}
            />
            <ButtonPrimary
              title={categoryId ? 'Atualizar' : 'Criar'}
              onPress={() => handleSubmit()}
              loading={isSubmitting}
            />
          </>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

export default CategoryFormScreen;
