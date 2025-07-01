// src/screens/QuizPlayScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import api from '../services/api';

const { width } = Dimensions.get('window');

const COLORS = {
  PRIMARY: '#4a3fce',
  SECONDARY: '#6A5ACD',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  GREY: '#aaa',
};

interface Question {
  id: number;
  pergunta: string;
  alternativas: Record<'a' | 'b' | 'c' | 'd', string>;
  respostaCorreta: 'a' | 'b' | 'c' | 'd';
}

export default function QuizPlayScreen({ route, navigation }: any) {
  const { tipo, categoriaId, categoriaNome, quizId } = route.params;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showMentor, setShowMentor] = useState(true);

  // Animações gerais
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const congratsAnim = useRef(new Animated.Value(0)).current;

  // Animações do mentor de início
  const overlayMentor = useRef(new Animated.Value(0)).current;
  const mentorFade = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(0)).current;

  // Mensagens e imagens por disciplina
  const mentorMessages = {
    Biologia: {
      title: 'Olá, sou a professora Isadora!',
      sub: 'Vamos explorar o mundo celular juntos?',
      img: require('../../assets/images/profbio.png'),
    },
    Matemática: {
      title: 'Olá, sou a professora Jeane!',
      sub: 'Preparado para desafios numéricos?',
      img: require('../../assets/images/profmat.png'),
    },
    'Direito Penal': {
      title: 'Olá, sou o General Fábio!',
      sub: 'Hora de dominar o código penal!',
      img: require('../../assets/images/profpenal.png'),
    },
    'Direito Administrativo': {
      title: 'Olá, sou o professor Nicolas!',
      sub: 'Pronto para entendimento administrativo?',
      img: require('../../assets/images/parabens.png'),
    },
    default: {
      title: 'Olá, sou o professor Emanuell!',
      sub: 'Vamos começar o quiz?',
      img: require('../../assets/images/mentor.png'),
    },
  };
  const key = mentorMessages[categoriaNome as keyof typeof mentorMessages]
    ? (categoriaNome as keyof typeof mentorMessages)
    : 'default';
  const { title, sub, img } = mentorMessages[key];

  // Faz piscar “Toque para começar”
  const startBlink = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  useEffect(() => {
    // Exibe overlay do mentor
    Animated.sequence([
      Animated.timing(overlayMentor, { toValue: 0.9, duration: 300, useNativeDriver: true }),
      Animated.timing(mentorFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(startBlink);

    // Carrega perguntas
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    let url = '';
    if (tipo === 'random') url = '/play/quizzes/random';
    else if (tipo === 'last') url = `/play/quizzes/${quizId}`;
    else url = `/play/quizzes/by-category/${categoriaId}`;

    try {
      const resp = await api.get(url);
      const data = Array.isArray(resp.data) ? resp.data : [resp.data];
      setQuestions(data);
      animateIn();
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o quiz.');
      navigation.popToTop();
    } finally {
      setLoading(false);
    }
  };

  const animateIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const animateOut = (cb: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(cb);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Carregando perguntas...</Text>
      </View>
    );
  }

  const cur = questions[index];
  const total = questions.length;

  const handleAnswer = (letter: 'a' | 'b' | 'c' | 'd') => {
    setSelected(letter);
    if (letter === cur.respostaCorreta) {
      setScore((s) => s + 1);
    }

    setTimeout(() => {
      setSelected(null);
      if (index + 1 < total) {
        animateOut(() => {
          setIndex((i) => i + 1);
          animateIn();
        });
      } else {
        setQuizFinished(true);
        Animated.parallel([
          Animated.timing(overlayAnim, { toValue: 0.8, duration: 400, useNativeDriver: true }),
          Animated.timing(congratsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
      }
    }, 800);
  };

  const finishQuiz = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(congratsAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      navigation.popToTop();
    });
  };

  const handleStartQuiz = () => {
    // Toca no mentor para iniciar o quiz
    Animated.parallel([
      Animated.timing(mentorFade, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(overlayMentor, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(() => setShowMentor(false));
  };

  const progressPercent = ((index + 1) / total) * 100;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.PRIMARY} barStyle="light-content" />

      {/* Overlay Mentor */}
      {showMentor && (
        <Animated.View style={[styles.mentorOverlay, { opacity: overlayMentor }]}>
          <TouchableWithoutFeedback onPress={handleStartQuiz}>
            <Animated.View style={[styles.mentorWrap, { opacity: mentorFade }]}>
              <Image source={img} style={styles.mentorImg} resizeMode="contain" />
              <Text style={styles.mentorTitle}>{title}</Text>
              <Text style={styles.mentorSub}>{sub}</Text>
              <Animated.Text style={[styles.mentorTap, { opacity: blinkAnim }]}>
                Toque para começar
              </Animated.Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )}

      {/* Barra de progresso */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Questões */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>
          Pergunta {index + 1} de {total}
        </Text>
        <Text style={styles.question}>{cur.pergunta}</Text>
        {(['a', 'b', 'c', 'd'] as const).map((l) => {
          const isSel = selected === l;
          const isCorrect = l === cur.respostaCorreta;
          let bg = COLORS.PRIMARY;
          if (selected) {
            if (isSel) bg = isCorrect ? COLORS.SUCCESS : COLORS.DANGER;
            else if (isCorrect) bg = COLORS.SUCCESS;
            else bg = COLORS.GREY;
          }
          return (
            <TouchableOpacity
              key={l}
              disabled={!!selected}
              style={[styles.btn, { backgroundColor: bg }]}
              onPress={() => handleAnswer(l)}
            >
              <Text style={styles.btnText}>
                {l.toUpperCase()}. {cur.alternativas[l]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {/* Overlay “Parabéns” */}
      {quizFinished && (
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <TouchableWithoutFeedback onPress={finishQuiz}>
            <Animated.View style={[styles.modal, { opacity: congratsAnim }]}>
              <Image source={require('../../assets/images/parabens.png')} style={styles.image} />
              <Text style={styles.congratsTitle}>Parabéns!</Text>
              <Text style={styles.congratsSub}>
                Você acertou {score} de {total}.
              </Text>
              <Text style={styles.congratsTap}>Toque para finalizar</Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.PRIMARY },

  progressBar: { height: 6, backgroundColor: '#e0e0e0', margin: 20, borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: COLORS.SECONDARY, borderRadius: 3 },

  content: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.PRIMARY, textAlign: 'center' },
  question: { fontSize: 20, marginVertical: 16, color: '#333', textAlign: 'center' },
  btn: { padding: 14, borderRadius: 8, marginBottom: 12, elevation: 2 },
  btnText: { color: '#fff', fontSize: 16, textAlign: 'center' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: width * 0.8,
    elevation: 8,
    zIndex: 1001,
  },
  image: { width: width * 0.5, height: width * 0.5 },
  congratsTitle: { fontSize: 22, fontWeight: '700', color: COLORS.PRIMARY, marginTop: 12 },
  congratsSub: { fontSize: 16, color: '#555', marginVertical: 8 },
  congratsTap: { fontSize: 14, color: COLORS.SECONDARY, marginTop: 12 },

  // Mentor styles
  mentorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  mentorWrap: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: width * 0.8,
    elevation: 10,
    zIndex: 2001,
  },
  mentorImg: { width: width * 0.4, height: width * 0.4, marginBottom: 12 },
  mentorTitle: { fontSize: 20, fontWeight: '600', color: COLORS.PRIMARY, marginBottom: 6 },
  mentorSub: { fontSize: 16, color: '#333', marginBottom: 12 },
  mentorTap: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
