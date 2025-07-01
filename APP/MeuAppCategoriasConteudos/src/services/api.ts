// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // Necessário para o interceptor de resposta

// **IMPORTANTE:** Substitua pelo IP real da sua máquina onde o Laravel está rodando
// Se for localhost no emulador, mas testando no físico, precisa do IP.
const API_BASE_URL = 'http://192.168.1.72:8000/api'; // EXEMPLO: use seu IP real aqui!

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Tempo limite para a requisição (10 segundos)
});

// Interceptor de requisição: adiciona o token de autenticação antes de cada requisição
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('user_token'); // Tenta obter o token do AsyncStorage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Adiciona o token ao cabeçalho Authorization
      }
    } catch (error) {
      console.error("Erro ao obter token do AsyncStorage para interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta: lida com erros comuns da API, como autenticação expirada (401)
api.interceptors.response.use(
  (response) => response, // Se a resposta for sucesso, apenas a retorna
  async (error) => {
    if (error.response) {
      // Erro na resposta do servidor (ex: 401 Unauthorized, 404 Not Found)
      console.error('Erro de Resposta da API:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        // Se for um erro de autenticação (token inválido/expirado)
        Alert.alert('Sessão Expirada', 'Sua sessão expirou ou é inválida. Por favor, faça login novamente.');
        await AsyncStorage.removeItem('user_token'); // Remove o token inválido
        // **Atenção:** Redirecionar para o Login aqui é complexo.
        // O ideal é que o AuthProvider monitore o 'user' e redirecione se 'null'.
        // Ou, para uma solução rápida, você pode recarregar o app:
        // RNRestart.Restart(); // Necessita de 'react-native-restart' e configuração nativa
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta (problema de rede/servidor offline)
      console.error('Erro de Rede: Nenhuma resposta do servidor.', error.request);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se o servidor está online.');
    } else {
      // Algum outro erro aconteceu ao configurar a requisição
      console.error('Erro de Requisição:', error.message);
      Alert.alert('Erro', 'Ocorreu um erro inesperado na requisição.');
    }
    return Promise.reject(error); // Rejeita a Promise para propagar o erro
  }
);

export default api;