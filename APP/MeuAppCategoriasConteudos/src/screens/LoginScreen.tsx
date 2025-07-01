// screens/LoginScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import InputField from '../components/InputField';
import ButtonPrimary from '../components/ButtonPrimary';
import { useAuth } from '../contexts/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const { width, height } = Dimensions.get('window');

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('Obrigatório'),
  senha: Yup.string().min(4, 'Mínimo 4 caracteres').required('Obrigatório'),
});

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [generalError, setGeneralError] = useState<string | null>(null);

  // --- Animação de partículas (estrelas) no fundo ---
  const numStars = 30;
  const starData = useMemo(() => {
    return Array.from({ length: numStars }).map(() => ({
      value: new Animated.Value(-20),
      x: Math.random() * width,
      size: 5 + Math.random() * 5, // tamanho reduzido
      opacity: 0.3 + Math.random() * 0.7,
    }));
  }, []);

  useEffect(() => {
    starData.forEach(star => {
      const loop = () => {
        star.value.setValue(-star.size);
        Animated.timing(star.value, {
          toValue: height + star.size,
          duration: 3000 + Math.random() * 4000,
          delay: Math.random() * 2000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(loop);
      };
      loop();
    });
  }, [starData]);

  return (
    <LinearGradient
      colors={['#6A5ACD', '#9370DB', '#BA55D3']}
      style={styles.gradientBackground}
    >
      {/* Estrelas animadas em texto */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {starData.map((star, index) => (
          <Animated.Text
            key={index}
            style={{
              position: 'absolute',
              left: star.x,
              transform: [{ translateY: star.value }],
              fontSize: star.size,
              color: '#fff',
              opacity: star.opacity,
            }}
          >★</Animated.Text>
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <View style={styles.topContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.mainLogo}
            resizeMode="contain"
          />
          <Text style={styles.appTagline}>Brighter Minds Begin Here.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Bem-vindo!</Text>
          <Formik
            initialValues={{ email: '', senha: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values, { setSubmitting }) => {
              setGeneralError(null);
              try {
                await signIn(values.email, values.senha);
              } catch (error: any) {
                setGeneralError(error.message);
                Alert.alert('Erro no Login', error.message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <View style={styles.form}>
                {generalError && <Text style={styles.generalErrorText}>{generalError}</Text>}
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
                  value={values.senha}
                  onChangeText={handleChange('senha')}
                  onBlur={handleBlur('senha')}
                  placeholder="••••••"
                  errorMessage={touched.senha ? errors.senha : undefined}
                  iconSource={require('../../assets/images/senha.png')}
                  isPassword={true}
                />
                <ButtonPrimary
                  title="ENTRAR"
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  style={[styles.loginButton, { backgroundColor: '#6A5ACD' }]}
                  textStyle={styles.loginButtonText}
                />
                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.createAccountButton}>
                  <Text style={styles.createAccountText}>Não tem conta? Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainLogo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  appTagline: {
    fontSize: width * 0.045,
    fontFamily: 'Inter-Regular',
    color: '#FFFAFA',
    textAlign: 'center',
    marginTop: 10,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
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
  },
  loginButton: {
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    textDecorationLine: 'none',
  },
  createAccountButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#6A5ACD',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    fontWeight: '600',
  },
});
