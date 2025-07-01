// screens/QuizManagementOptionsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function QuizManagementOptionsScreen({ navigation }: any) {
  return (
    <View style={s.container}>
      <Text style={s.title}>Gerenciar Quizzes</Text>

      <TouchableOpacity
        style={s.optionButton}
        onPress={() => navigation.navigate('MyQuizzes')}
      >
        <Text style={s.optionButtonText}>Meus Quizzes (Criação/Edição)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.optionButton}
        onPress={() => navigation.navigate('StartQuiz')}
      >
        <Text style={s.optionButtonText}>Iniciar um Quiz</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={s.optionButton}
        onPress={() => navigation.navigate('AllQuizzesList')}
      >
        <Text style={s.optionButtonText}>Ver/Gerenciar Todos os Quizzes (Admin)</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});