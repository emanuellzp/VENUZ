import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image, 
  Dimensions,
  Alert,
  ActivityIndicator // Adicionado para o ActivityIndicator no botão se ButtonPrimary não gerenciar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InputField from '../components/InputField';
import ButtonPrimary from '../components/ButtonPrimary';
import { useAuth } from '../contexts/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const { width, height } = Dimensions.get('window');

const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  password: Yup.string().min(4, 'Mínimo 4 caracteres').required('Senha é obrigatória'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'As senhas não conferem') // Valida que as senhas são iguais
    .required('Confirmação de senha é obrigatória'),
});

const RegisterScreen = ({ navigation }: any) => {
  const { signIn } = useAuth(); // Usaremos signIn após o registro bem-sucedido
  const [generalError, setGeneralError] = useState<string | null>(null);

  // A função de registro será local, chamando a API diretamente, pois não está no AuthContext
  const handleRegister = async (values: any, setSubmitting: (isSubmitting: boolean) => void) => {
    setGeneralError(null);
    try {
      setSubmitting(true);
      const response = await fetch('http://192.168.1.72:8000/api/register', { // <--- AJUSTE SEU IP AQUI!
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          name: values.name,
          email: values.email,
          password: values.password,
          password_confirmation: values.password_confirmation // Laravel espera password_confirmation
        }),
      });

      const data = await response.json();

      if (!response.ok) { // Se a resposta não for 2xx (ex: 422, 500)
        let errorMessage = 'Falha no registro. Verifique seus dados.';
        if (data.errors) {
          // Erros de validação do Laravel
          const firstError = Object.values(data.errors)[0] as string[];
          errorMessage = firstError[0] || errorMessage;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setGeneralError(errorMessage);
        Alert.alert('Erro no Registro', errorMessage);
        return; // Sai da função em caso de erro
      }

      // Se o registro for bem-sucedido, o Laravel já retorna o token e user.
      // Você pode fazer login automaticamente aqui ou navegar para a tela de login.
      Alert.alert('Sucesso', 'Usuário registrado com sucesso! Faça login para continuar.');
      navigation.replace('Login'); // Redireciona para a tela de login

    } catch (error: any) {
      console.error("RegisterScreen - Erro no registro:", error);
      const msg = error.message || 'Ocorreu um erro de rede ou servidor.';
      setGeneralError(msg);
      Alert.alert('Erro', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#6A5ACD', '#9370DB', '#BA55D3']}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.topContainer}>
          <Image
            source={require('../../assets/images/logo.png')} // AJUSTE O CAMINHO DA SUA LOGO AQUI!
            style={styles.mainLogo}
            resizeMode="contain"
          />
          <Text style={styles.appTagline}>Comece sua jornada de estudos agora!</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Cadastre-se</Text>
          <Formik
            initialValues={{ name: '', email: '', password: '', password_confirmation: '' }}
            validationSchema={RegisterSchema}
            onSubmit={(values, { setSubmitting }) => handleRegister(values, setSubmitting)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                {generalError && <Text style={styles.generalErrorText}>{generalError}</Text>}

                <InputField
                  label="Nome Completo"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  placeholder="Seu nome"
                  autoCapitalize="words"
                  errorMessage={touched.name ? errors.name : undefined}
                  iconSource={require('../../assets/images/email.png')} // Usando o ícone de email temporariamente, pode criar um de pessoa
                  isPassword={false}
                />
                <InputField
                  label="E-mail"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="seu@exemplo.com"
                  errorMessage={touched.email ? errors.email : undefined}
                  iconSource={require('../../assets/images/email.png')}
                  isPassword={false}
                />
                <InputField
                  label="Senha"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  placeholder="••••••"
                  errorMessage={touched.password ? errors.password : undefined}
                  iconSource={require('../../assets/images/senha.png')}
                  isPassword={true}
                />
                <InputField
                  label="Confirmar Senha"
                  value={values.password_confirmation}
                  onChangeText={handleChange('password_confirmation')}
                  onBlur={handleBlur('password_confirmation')}
                  placeholder="••••••"
                  errorMessage={touched.password_confirmation ? errors.password_confirmation : undefined}
                  iconSource={require('../../assets/images/senha.png')}
                  isPassword={true}
                />

                <ButtonPrimary 
                  title="CADASTRAR" 
                  onPress={() => handleSubmit()} 
                  loading={isSubmitting} 
                  style={styles.registerButton} 
                  textStyle={styles.registerButtonText} 
                />

                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLinkButton}>
                  <Text style={styles.loginLinkText}>Já tem conta? Faça Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.05,
  },
  topContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    paddingTop: height * 0.05, // Ajuste para mover a logo e tagline para cima
  },
  mainLogo: {
    width: width * 0.4, // Um pouco menor que na tela de login, para caber tudo
    height: width * 0.4,
    marginBottom: 0,
  },
  appTagline: {
    fontSize: width * 0.045,
    fontFamily: 'Inter-Regular', 
    color: '#FFFAFA',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
    opacity: 0.9,
  },
  formCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: height * 0.05, // Ajuste para centralizar
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold', 
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  generalErrorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontFamily: 'Inter-Regular', 
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold', 
  },
  loginLinkButton: {
    padding: 10,
  },
  loginLinkText: {
    color: '#6A5ACD',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Regular', 
    fontWeight: '600',
  },
  particle: { // Mantenha os estilos da partícula (mesmos da LoginScreen)
    position: 'absolute',
    borderRadius: 50,
    zIndex: -1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Cor branca
  },
});

export default RegisterScreen;
