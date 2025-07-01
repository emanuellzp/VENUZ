// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Alert } from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
  pontuacao_total: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasShownWelcomeMentor: boolean; // Estado para controlar se o mentor de boas-vindas já foi exibido
  setHasShownWelcomeMentor: (value: boolean) => void; // Função para atualizar este estado
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasShownWelcomeMentor, setHasShownWelcomeMentor] = useState(false); // Estado para o mentor de boas-vindas

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('user_token');
        if (storedToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await api.get('/me');
          if (response.data && typeof response.data === 'object' && response.data !== null) {
              setUser(response.data);
          } else {
              console.warn("AuthContext - /me retornou dados inesperados:", response.data);
              await AsyncStorage.removeItem('user_token');
              setUser(null);
          }
        }
      } catch (e: any) {
        console.error("AuthContext - Falha ao carregar usuário ou token:", e.response?.data || e.message);
        await AsyncStorage.removeItem('user_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user: userData } = response.data;
      await AsyncStorage.setItem('user_token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      if (userData && typeof userData === 'object' && userData !== null) {
          setUser(userData);
          setHasShownWelcomeMentor(false); // ESSENCIAL: Reseta o flag do mentor ao fazer login
      } else {
          console.error("AuthContext - Resposta de login sem dados de usuário válidos:", userData);
          await AsyncStorage.removeItem('user_token');
          throw new Error('Dados de usuário inválidos recebidos no login.');
      }

    } catch (e: any) {
      console.error("AuthContext - Erro no processo de login:", e);
      let errorMessage = 'Falha no login. Verifique suas credenciais.';
      if (e.response && e.response.data && e.response.data.message) {
          errorMessage = e.response.data.message;
      } else if (e.message) {
          errorMessage = e.message;
      }
      throw new Error(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await api.post('/logout');
      await AsyncStorage.removeItem('user_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setHasShownWelcomeMentor(false); // ESSENCIAL: Reseta o flag do mentor ao fazer logout
    } catch (e: any) {
      console.error("AuthContext - Erro no logout:", e.response?.data || e.message);
      Alert.alert('Erro', e.response?.data?.message || 'Não foi possível fazer logout.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, hasShownWelcomeMentor, setHasShownWelcomeMentor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};