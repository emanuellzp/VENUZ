// create-structure.js
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd(); // deve ser a pasta do projeto

// Defina aqui a estrutura de pastas e arquivos com conteúdo inicial (boilerplate ou comentário)
const structure = {
  'src/navigation': {
    'AppNavigator.tsx':
`// AppNavigator.tsx
// Aqui você configura o NavigationContainer e Stack/Tab navigators
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../contexts/AuthContext';
// importe suas telas:
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import CategoryFormScreen from '../screens/CategoryFormScreen';
import ContentListScreen from '../screens/ContentListScreen';
import ContentFormScreen from '../screens/ContentFormScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Categories: undefined;
  CategoryForm: { categoryId?: number } | undefined;
  Contents: undefined;
  ContentForm: { contentId?: number } | undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // ou exiba um loading
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Categories" component={CategoryListScreen} options={{ title: 'Categorias' }} />
            <Stack.Screen name="CategoryForm" component={CategoryFormScreen} options={{ title: 'Categoria' }} />
            <Stack.Screen name="Contents" component={ContentListScreen} options={{ title: 'Conteúdos' }} />
            <Stack.Screen name="ContentForm" component={ContentFormScreen} options={{ title: 'Conteúdo' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
`
  },
  'src/contexts': {
    'AuthContext.tsx':
`// AuthContext.tsx
// Aqui implementa autenticação: login, register, logout, guarda token em AsyncStorage, obtém /me
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

type User = {
  id: number;
  nome: string;
  email: string;
  pontuacao_total: number;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      const token = await AsyncStorage.getItem('@token');
      if (token) {
        try {
          const resp = await api.get('/me');
          setUser(resp.data);
        } catch (error) {
          await AsyncStorage.removeItem('@token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadStorageData();
  }, []);

  const signIn = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const resp = await api.post('/login', { email, senha });
      const token = resp.data.token || resp.data.access_token;
      await AsyncStorage.setItem('@token', token);
      const userResp = await api.get('/me');
      setUser(userResp.data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (nome: string, email: string, senha: string) => {
    setLoading(true);
    try {
      const resp = await api.post('/register', { nome, email, senha });
      const token = resp.data.token || resp.data.access_token;
      await AsyncStorage.setItem('@token', token);
      const userResp = await api.get('/me');
      setUser(userResp.data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.post('/logout');
    } catch {}
    await AsyncStorage.removeItem('@token');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
`
  },
  'src/services': {
    'api.ts':
`// api.ts
// Instância Axios configurada com baseURL e interceptor para incluir token
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://seu-backend.com/api'; // ajuste conforme ambiente

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('@token');
    if (token && config.headers) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
`
  },
  'src/screens': {
    'LoginScreen.tsx':
`// LoginScreen.tsx
import React, { useContext } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import InputField from '../components/InputField';
import ButtonPrimary from '../components/ButtonPrimary';
import { AuthContext } from '../contexts/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  senha: Yup.string().min(4, 'Mínimo 4 caracteres').required('Obrigatório'),
});

const LoginScreen = ({ navigation }: any) => {
  const { signIn } = useContext(AuthContext);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Formik
        initialValues={{ email: '', senha: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await signIn(values.email, values.senha);
          } catch (error: any) {
            setErrors({ senha: 'Credenciais inválidas' });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.form}>
            <InputField
              label="E-mail"
              value={values.email}
              onChangeText={handleChange('email')}
              placeholder="seu@exemplo.com"
              errorMessage={touched.email ? errors.email : undefined}
            />
            <InputField
              label="Senha"
              value={values.senha}
              onChangeText={handleChange('senha')}
              placeholder="••••••"
              secureTextEntry
              errorMessage={touched.senha ? errors.senha : undefined}
            />
            <ButtonPrimary title="Entrar" onPress={() => handleSubmit()} loading={isSubmitting} />
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  form: {},
  link: { color: '#007bff', marginTop: 16, textAlign: 'center' },
});

export default LoginScreen;
`,
    'RegisterScreen.tsx':
`// RegisterScreen.tsx
import React, { useContext } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import InputField from '../components/InputField';
import ButtonPrimary from '../components/ButtonPrimary';
import { AuthContext } from '../contexts/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
  nome: Yup.string().required('Obrigatório'),
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  senha: Yup.string().min(4, 'Mínimo 4 caracteres').required('Obrigatório'),
  confirmarSenha: Yup.string()
    .oneOf([Yup.ref('senha')], 'Senhas não coincidem')
    .required('Obrigatório'),
});

const RegisterScreen = ({ navigation }: any) => {
  const { signUp } = useContext(AuthContext);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Formik
        initialValues={{ nome: '', email: '', senha: '', confirmarSenha: '' }}
        validationSchema={RegisterSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await signUp(values.nome, values.email, values.senha);
          } catch (error: any) {
            setErrors({ email: 'Erro no cadastro' });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.form}>
            <InputField
              label="Nome"
              value={values.nome}
              onChangeText={handleChange('nome')}
              placeholder="Seu nome"
              errorMessage={touched.nome ? errors.nome : undefined}
            />
            <InputField
              label="E-mail"
              value={values.email}
              onChangeText={handleChange('email')}
              placeholder="seu@exemplo.com"
              errorMessage={touched.email ? errors.email : undefined}
            />
            <InputField
              label="Senha"
              value={values.senha}
              onChangeText={handleChange('senha')}
              placeholder="••••••"
              secureTextEntry
              errorMessage={touched.senha ? errors.senha : undefined}
            />
            <InputField
              label="Confirmar Senha"
              value={values.confirmarSenha}
              onChangeText={handleChange('confirmarSenha')}
              placeholder="••••••"
              secureTextEntry
              errorMessage={touched.confirmarSenha ? errors.confirmarSenha : undefined}
            />
            <ButtonPrimary title="Cadastrar" onPress={() => handleSubmit()} loading={isSubmitting} />
            <Text style={styles.link} onPress={() => navigation.goBack()}>
              Já tem conta? Entrar
            </Text>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  form: {},
  link: { color: '#007bff', marginTop: 16, textAlign: 'center' },
});

export default RegisterScreen;
`,
    'HomeScreen.tsx':
`// HomeScreen.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const HomeScreen = ({ navigation }: any) => {
  const { user, signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Olá, {user?.nome}!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Categories')}>
        <Text style={styles.buttonText}>Gerenciar Categorias</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Contents')}>
        <Text style={styles.buttonText}>Gerenciar Conteúdos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  welcome: { fontSize: 18, marginBottom: 24 },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 4,
    marginVertical: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  logout: { marginTop: 32, alignItems: 'center' },
  logoutText: { color: 'red' },
});

export default HomeScreen;
`,
    'CategoryListScreen.tsx':
`// CategoryListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import api from '../services/api';
import { useIsFocused } from '@react-navigation/native';
import LoadingOverlay from '../components/LoadingOverlay';

type Category = {
  id: number;
  nome: string;
  icone?: string;
};

const CategoryListScreen = ({ navigation }: any) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/categorias');
      setCategories(resp.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchCategories();
    }
  }, [isFocused]);

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Deseja deletar esta categoria?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(\`/categorias/\${id}\`);
            fetchCategories();
          } catch {
            Alert.alert('Erro', 'Não foi possível deletar');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.nome}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('CategoryForm', { categoryId: item.id })}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={[styles.actionText, { color: 'red' }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay />}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CategoryForm')}>
        <Text style={styles.addButtonText}>+ Nova Categoria</Text>
      </TouchableOpacity>
      {categories.length === 0 && !loading ? (
        <Text style={styles.emptyText}>Nenhuma categoria cadastrada.</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16 },
  actions: { flexDirection: 'row' },
  actionText: { color: '#007bff', marginHorizontal: 8 },
  emptyText: { textAlign: 'center', marginTop: 24, color: '#666' },
});

export default CategoryListScreen;
`,
    'CategoryFormScreen.tsx':
`// CategoryFormScreen.tsx
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
      setLoading(true);
      api.get(\`/categorias/\${categoryId}\`)
        .then(resp => {
          setInitialValues({ nome: resp.data.nome, icone: resp.data.icone || '' });
        })
        .catch(() => {
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
        await api.post(\`/categorias/\${categoryId}\`, values);
      } else {
        await api.post('/categorias', values);
      }
      navigation.goBack();
    } catch {
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
`,
    'ContentListScreen.tsx':
`// ContentListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import api from '../services/api';
import { useIsFocused } from '@react-navigation/native';
import LoadingOverlay from '../components/LoadingOverlay';

type Content = {
  id: number;
  titulo: string;
  descricao?: string;
  link?: string;
  categoria_id?: number;
};

const ContentListScreen = ({ navigation }: any) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();

  const fetchContents = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/conteudos');
      setContents(resp.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar conteúdos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchContents();
    }
  }, [isFocused]);

  const handleDelete = (id: number) => {
    Alert.alert('Confirmar', 'Deseja deletar este conteúdo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(\`/conteudos/\${id}\`);
            fetchContents();
          } catch {
            Alert.alert('Erro', 'Não foi possível deletar');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Content }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.titulo}</Text>
        {item.descricao ? <Text style={styles.subtitle}>{item.descricao}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('ContentForm', { contentId: item.id })}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={[styles.actionText, { color: 'red' }]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay />}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ContentForm')}>
        <Text style={styles.addButtonText}>+ Novo Conteúdo</Text>
      </TouchableOpacity>
      {contents.length === 0 && !loading ? (
        <Text style={styles.emptyText}>Nenhum conteúdo cadastrado.</Text>
      ) : (
        <FlatList
          data={contents}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 16 },
  subtitle: { color: '#666' },
  actions: { flexDirection: 'row' },
  actionText: { color: '#007bff', marginHorizontal: 8 },
  emptyText: { textAlign: 'center', marginTop: 24, color: '#666' },
});

export default ContentListScreen;
`,
    'ContentFormScreen.tsx':
`// ContentFormScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import InputField from '../components/InputField';
import ButtonPrimary from '../components/ButtonPrimary';
import api from '../services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';
import LoadingOverlay from '../components/LoadingOverlay';
import { Picker } from '@react-native-picker/picker';

type Category = { id: number; nome: string };

const ContentSchema = Yup.object().shape({
  titulo: Yup.string().required('Obrigatório'),
  descricao: Yup.string().nullable(),
  link: Yup.string().url('URL inválida').nullable(),
  categoria_id: Yup.number().required('Obrigatório'),
});

const ContentFormScreen = ({ route, navigation }: any) => {
  const contentId: number | undefined = route.params?.contentId;
  const [initialValues, setInitialValues] = useState({ titulo: '', descricao: '', link: '', categoria_id: undefined as number | undefined });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const resp = await api.get('/categorias');
      setCategories(resp.data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar categorias');
    }
  };

  useEffect(() => {
    fetchCategories();
    if (contentId) {
      setLoading(true);
      api.get(\`/conteudos/\${contentId}\`)
        .then(resp => {
          setInitialValues({
            titulo: resp.data.titulo,
            descricao: resp.data.descricao || '',
            link: resp.data.link || '',
            categoria_id: resp.data.categoria_id,
          });
        })
        .catch(() => {
          Alert.alert('Erro', 'Não foi possível carregar conteúdo');
          navigation.goBack();
        })
        .finally(() => setLoading(false));
    }
  }, [contentId]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        titulo: values.titulo,
        descricao: values.descricao || null,
        link: values.link || null,
        categoria_id: values.categoria_id,
      };
      if (contentId) {
        await api.post(\`/conteudos/\${contentId}\`, payload);
      } else {
        await api.post('/conteudos', payload);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar conteúdo');
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
        validationSchema={ContentSchema}
        onSubmit={values => handleSubmit(values)}
      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
          <>
            <InputField
              label="Título"
              value={values.titulo}
              onChangeText={handleChange('titulo')}
              errorMessage={touched.titulo ? errors.titulo : undefined}
            />
            <InputField
              label="Descrição"
              value={values.descricao}
              onChangeText={handleChange('descricao')}
              errorMessage={touched.descricao ? errors.descricao : undefined}
            />
            <InputField
              label="Link"
              value={values.link}
              onChangeText={handleChange('link')}
              placeholder="https://..."
              errorMessage={touched.link ? errors.link : undefined}
            />
            <View style={{ marginVertical: 8 }}>
              <Picker
                selectedValue={values.categoria_id}
                onValueChange={(itemValue) => setFieldValue('categoria_id', itemValue)}
              >
                <Picker.Item label="Selecione Categoria" value={undefined} />
                {categories.map(cat => (
                  <Picker.Item key={cat.id.toString()} label={cat.nome} value={cat.id} />
                ))}
              </Picker>
              {touched.categoria_id && errors.categoria_id ? (
                <Text style={{ color: 'red' }}>{errors.categoria_id}</Text>
              ) : null}
            </View>
            <ButtonPrimary
              title={contentId ? 'Atualizar' : 'Criar'}
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

export default ContentFormScreen;
`
  },
  'src/components': {
    'InputField.tsx':
`// InputField.tsx
import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  errorMessage?: string;
};

const InputField: React.FC<Props> = ({ label, value, onChangeText, placeholder, secureTextEntry, errorMessage }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, errorMessage ? styles.inputError : null]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
    />
    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 4, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', marginTop: 4 },
});

export default InputField;
`,
    'ButtonPrimary.tsx':
`// ButtonPrimary.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const ButtonPrimary: React.FC<Props> = ({ title, onPress, disabled, loading }) => (
  <TouchableOpacity
    style={[styles.button, disabled ? styles.disabled : null]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.text}>{title}</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginVertical: 8,
  },
  disabled: { backgroundColor: '#aaa' },
  text: { color: '#fff', fontWeight: 'bold' },
});

export default ButtonPrimary;
`,
    'LoadingOverlay.tsx':
`// LoadingOverlay.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingOverlay: React.FC = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#007bff" />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingOverlay;
`
  },
  'src/utils': {
    'constants.ts':
`// constants.ts
// Coloque aqui constantes globais, e.g. URL da API em dev/prod
export const API_BASE_URL = 'https://seu-backend.com/api';`,
    'storage.ts':
`// storage.ts
// Wrappers para AsyncStorage se desejar
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem('@token', token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('@token');
};

export const removeToken = async () => {
  await AsyncStorage.removeItem('@token');
};`
  }
};

async function createStructure(base, struct) {
  for (const [relPath, contentOrChildren] of Object.entries(struct)) {
    const fullPath = path.join(base, relPath);
    if (typeof contentOrChildren === 'object') {
      // é pasta
      await fs.promises.mkdir(fullPath, { recursive: true });
      // conteúdo é objeto de arquivos dentro desta pasta
      await createStructure(fullPath, contentOrChildren);
    } else {
      // não deve ocorrer: estrutura definida assume sempre objeto em níveis intermediários
    }
  }
}

async function createFiles(base, struct) {
  for (const [relPath, contentOrChildren] of Object.entries(struct)) {
    const fullPath = path.join(base, relPath);
    if (typeof contentOrChildren === 'object') {
      // é pasta: iterar dentro
      await createFiles(fullPath, contentOrChildren);
    } else if (typeof contentOrChildren === 'string') {
      // arquivo com conteúdo
      const dir = path.dirname(fullPath);
      await fs.promises.mkdir(dir, { recursive: true });
      if (!fs.existsSync(fullPath)) {
        await fs.promises.writeFile(fullPath, contentOrChildren, 'utf8');
        console.log(`Criado: ${fullPath}`);
      } else {
        console.log(`Já existe, pulando: ${fullPath}`);
      }
    }
  }
}

(async () => {
  try {
    console.log('Criando pastas e arquivos...');
    // Primeiro, criar pastas
    await createStructure(projectRoot, structure);
    // Depois, criar arquivos com conteúdo
    await createFiles(projectRoot, structure);
    console.log('Concluído.');
  } catch (err) {
    console.error('Erro ao criar estrutura:', err);
  }
})();
