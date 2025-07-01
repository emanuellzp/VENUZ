import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Você precisará instalar esta biblioteca
import studyPlanService from '../services/studyPlan';
import { StudyPlan } from '../types';

// Largura da tela para layout responsivo
const { width } = Dimensions.get('window');

// Dados mock para tópicos e notas (você deve buscar isso da sua API/estado)
interface Topic {
  id: string;
  name: string;
  completed: boolean;
}

interface Note {
  id: string;
  text: string;
}

export default function StudyPlanScreen() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Direito Administrativo');
  const [topics, setTopics] = useState<Topic[]>([
    { id: '1', name: 'Introdução', completed: false },
    { id: '2', name: 'Agências Reguladoras', completed: false },
    { id: '3', name: 'Servidores Públicos', completed: false },
  ]);
  const [progress, setProgress] = useState<number>(76); // Placeholder para progresso
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', text: 'Estudar tópicos da PMTO' },
  ]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyPlans();
  }, []);

  const fetchStudyPlans = async () => {
    setLoading(true);
    try {
      const resp = await studyPlanService.list();
      setStudyPlans(resp.data);
      // Você precisará mapear os dados do studyPlan para os tópicos e notas
      // e calcular o progresso com base nos quizzes, se eles existirem
    } catch (error) {
      console.error("Erro ao carregar planos de estudo:", error);
      Alert.alert('Erro', 'Não foi possível carregar o cronograma.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicCompletion = (id: string) => {
    setTopics(topics.map(topic =>
      topic.id === id ? { ...topic, completed: !topic.completed } : topic
    ));
    // Aqui você também deve persistir essa mudança no backend
  };

  const handleAddTask = () => {
    Alert.alert('Adicionar Tarefa', 'Funcionalidade para adicionar tarefa.');
    // Implementar a lógica para adicionar uma nova tarefa
  };

  const handleAddNote = () => {
    Alert.alert('Adicionar Nota', 'Funcionalidade para adicionar uma nova nota.');
    // Implementar a lógica para adicionar uma nova nota
  };

  // Funções de placeholder para o calendário e quiz (se você quiser implementá-las)
  const calculateProgressFromQuiz = () => {
    // Lógica para calcular o progresso com base nos quizzes
    // Por enquanto, é um valor fixo.
    // setProgress(novoProgresso);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando plano de estudos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Plano de Estudo</Text>

      <View style={styles.topBar}>
        <View style={styles.disciplinePickerContainer}>
          <Picker
            selectedValue={selectedDiscipline}
            onValueChange={(itemValue: string) => setSelectedDiscipline(itemValue)}
            style={styles.disciplinePicker}
            dropdownIconColor="#4a3fce"
          >
            <Picker.Item label="Direito Administrativo" value="Direito Administrativo" />
            <Picker.Item label="Direito Constitucional" value="Direito Constitucional" />
            <Picker.Item label="Português" value="Português" />
          </Picker>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Adicionar Tarefa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
          <Text style={styles.addButtonText}>Adicionar Nota</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.leftColumn}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Topics</Text>
            {topics.map(topic => (
              <TouchableOpacity key={topic.id} style={styles.topicItem} onPress={() => toggleTopicCompletion(topic.id)}>
                <View style={[styles.checkbox, topic.completed && styles.checkboxCompleted]} />
                <Text style={styles.topicText}>{topic.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                <Text key={day} style={styles.calendarDay}>{day}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {[...Array(5)].map((_, colIndex) => (
                <View key={colIndex} style={styles.calendarColumn}>
                  {['9:00', '10:00', '11:00', '12:00', '13:00'].map((time, rowIndex) => (
                    <View key={`${colIndex}-${rowIndex}`} style={styles.calendarTimeSlot}>
                      {colIndex === 1 && rowIndex === 1 && ( // Exemplo: Agências Reguladoras na Terça às 10:00
                        <View style={styles.eventBubble}>
                          <Text style={styles.eventText}>Agências Reguladoras</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <View style={styles.card}>
            <Text style={styles.progressText}>{progress}% completo</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
            {/* Botão de quiz - Opcional, se você quiser integrá-lo aqui */}
            { <TouchableOpacity style={styles.quizButton} onPress={calculateProgressFromQuiz}>
              <Text style={styles.quizButtonText}>Fazer Quiz</Text>
            </TouchableOpacity> }
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notas</Text>
            {notes.map(note => (
              <Text key={note.id} style={styles.noteItem}>• {note.text}</Text>
            ))}
            {/* Você pode adicionar um TextInput aqui para adicionar notas rapidamente */}
            {<TextInput
              placeholder="Adicionar nova nota..."
              style={styles.noteInput}
              onChangeText={text => console.log(text)}
            /> }
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Para hoje</Text>
            {/* Outra seção de notas ou um placeholder */}
            <Text style={styles.noteItem}>• ...</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF0F8', // Cor de fundo suave para combinar com a imagem
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF0F8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10, // Para o Picker aparecer sobre outros elementos
  },
  disciplinePickerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    overflow: 'hidden', // Necessário para Android no Picker
  },
  disciplinePicker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4a3fce',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Permite que as colunas quebrem linha em telas menores
  },
  leftColumn: {
    flex: 2, // Ajuste a proporção conforme necessário
    marginRight: 10,
    minWidth: (width / 2) - 30, // Para telas menores
  },
  rightColumn: {
    flex: 1, // Ajuste a proporção conforme necessário
    marginLeft: 10,
    minWidth: (width / 3) - 30, // Para telas menores
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#4a3fce',
    marginRight: 10,
  },
  checkboxCompleted: {
    backgroundColor: '#4a3fce',
    borderColor: '#4a3fce',
  },
  topicText: {
    fontSize: 16,
    color: '#555',
  },
  progressText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4a3fce',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4a3fce',
    borderRadius: 5,
  },
  quizButton: {
    backgroundColor: '#4a3fce',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quizButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noteItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarDay: {
    fontWeight: 'bold',
    color: '#333',
    width: '20%', // 5 dias, então 20% para cada
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
  },
  calendarColumn: {
    flex: 1, // Divide o espaço igualmente entre as colunas
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    paddingHorizontal: 2, // Espaçamento entre as colunas
  },
  calendarTimeSlot: {
    height: 60, // Altura para cada slot de tempo
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventBubble: {
    backgroundColor: '#d0e0f8', // Cor clara para o bubble de evento
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    // Ajustar a largura para que não ultrapasse a coluna, se necessário
    maxWidth: '95%',
    alignSelf: 'center', // Centralizar o bubble dentro do slot
  },
  eventText: {
    fontSize: 12,
    color: '#4a3fce',
    textAlign: 'center',
  },
});