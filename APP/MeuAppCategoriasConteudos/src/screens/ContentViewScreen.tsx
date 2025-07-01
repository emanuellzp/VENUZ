// src/screens/ContentViewScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import api from '../services/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'ContentView'>;

interface ContentDetails {
  id: number;
  titulo: string;
  descricao: string;
  link?: string;
  categoria?: { nome: string };
}

const { width } = Dimensions.get('window');
const PRIMARY = '#4a3fce';
const SECONDARY = '#6A5ACD';
const SUCCESS = '#28a745';
const TEXT = '#333';
const BG = '#f0f2f5';

export default function ContentViewScreen({ route, navigation }: Props) {
  const { contentId, contentTitle } = route.params;
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // animações de fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    navigation.setOptions({
      title: contentTitle || 'Detalhes do Conteúdo',
      headerStyle: { backgroundColor: PRIMARY },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '600' },
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });

    api.get(`/conteudos/${contentId}`)
      .then(resp => setContent(resp.data))
      .catch(err => {
        console.error('Erro ao carregar detalhes:', err);
        Alert.alert('Erro', 'Não foi possível carregar os detalhes.');
        navigation.goBack();
      })
      .finally(() => {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
  }, [contentId]);

  const handleOpenLink = async () => {
    if (!content?.link) return;
    const supported = await Linking.canOpenURL(content.link);
    if (supported) {
      // efeito de clique
      Animated.sequence([
        Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();

      Linking.openURL(content.link);
    } else {
      Alert.alert('Erro', `Não foi possível abrir: ${content.link}`);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={s.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!content) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Conteúdo não encontrado.</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[s.screen, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={s.container}>
        {content.categoria && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{content.categoria.nome.toUpperCase()}</Text>
          </View>
        )}

        <Text style={s.title}>{content.titulo}</Text>
        <Text style={s.description}>{content.descricao}</Text>

        {content.link ? (
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity style={s.linkButton} onPress={handleOpenLink} activeOpacity={0.8}>
              <Ionicons name="link-outline" size={20} color="#fff" />
              <Text style={s.linkButtonText}>ABRIR MATERIAL</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Text style={s.noLinkText}>Nenhum link disponível para este conteúdo.</Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: PRIMARY,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: SECONDARY,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noLinkText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
