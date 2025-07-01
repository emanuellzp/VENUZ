// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { Image, StyleSheet, Platform } from 'react-native'; 
import { useAuth } from '../contexts/AuthContext'; 

// Telas
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen'; 
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen'; 
import StartQuizScreen from '../screens/StartQuizScreen';
import QuizPlayScreen from '../screens/QuizPlayScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import CategoryFormScreen from '../screens/CategoryFormScreen';
import ContentListScreen from '../screens/ContentListScreen';
import ContentFormScreen from '../screens/ContentFormScreen';
import ViewContentListScreen from '../screens/ViewContentListScreen'; 
import ContentViewScreen from '../screens/ContentViewScreen'; 
import QuizListScreen from '../screens/QuizListScreen'; 
import QuizFormScreen from '../screens/QuizFormScreen';
import MyQuizzesScreen from '../screens/MyQuizzesScreen'; 
import QuizManagementOptionsScreen from '../screens/QuizManagementOptionsScreen';
import StudyPlanScreen from '../screens/StudyPlanScreen';


// Tipagens de rota
export type BottomTabParamList = {
  Home: undefined;
  ViewContentList: undefined;
  Profile: undefined;
  StudyPlan: undefined;       // nova aba
  Notifications: undefined;
};

export type QuizManagementStackParamList = {
  Quizzes: undefined;
  MyQuizzes: undefined;
  QuizForm: { quizId?: number };
  StartQuiz: { tipo?: 'random' | 'categoria'; categoriaId?: number };
  QuizPlay: { tipo: 'random' | 'categoria'; categoriaId?: number };
  AllQuizzesList: undefined;
  ViewContentList: undefined;
  ContentView: { contentId: number; contentTitle: string };
  CategoryList: undefined;
  CategoryForm: { categoryId?: number };
  ContentList: undefined;
  ContentForm: { contentId?: number };
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Quizzes: undefined;            
  QuizForm: { quizId?: number }; 
  StartQuiz: { tipo?: 'random' | 'categoria'; categoriaId?: number };
  QuizPlay: { tipo: 'random' | 'categoria'; categoriaId?: number };
  CategoryList: undefined;
  CategoryForm: { categoryId?: number };
  ContentList: undefined;
  ContentForm: { contentId?: number };
  ViewContentList: undefined;
  ContentView: { contentId: number; contentTitle: string };
  MyQuizzes: undefined;
  AllQuizzesList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<BottomTabParamList>();
const QuizStack = createNativeStackNavigator<QuizManagementStackParamList>();

// Navigator aninhado de Gerenciamento de Quizzes
function QuizManagementNavigator() {
  return (
    <QuizStack.Navigator screenOptions={{ headerShown: false }}>
      <QuizStack.Screen name="Quizzes"        component={QuizManagementOptionsScreen} />
      <QuizStack.Screen name="MyQuizzes"      component={MyQuizzesScreen} />
      <QuizStack.Screen name="QuizForm"       component={QuizFormScreen} />
      <QuizStack.Screen name="StartQuiz"      component={StartQuizScreen} />
      <QuizStack.Screen name="QuizPlay"       component={QuizPlayScreen} />
      <QuizStack.Screen name="AllQuizzesList" component={QuizListScreen} />
      <QuizStack.Screen name="ViewContentList"component={ViewContentListScreen} />
      <QuizStack.Screen name="ContentView"    component={ContentViewScreen} />
      <QuizStack.Screen name="CategoryList"   component={CategoryListScreen} />
      <QuizStack.Screen name="CategoryForm"   component={CategoryFormScreen} />
      <QuizStack.Screen name="ContentList"    component={ContentListScreen} />
      <QuizStack.Screen name="ContentForm"    component={ContentFormScreen} />
    </QuizStack.Navigator>
  );
}

// Navigator principal de abas
function MainTabsNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6A5ACD',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: { fontFamily: 'Inter-Regular', fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/home-icon.png')}
              style={[styles.tabBarIcon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ViewContentList"
        component={ViewContentListScreen}
        options={{
          tabBarLabel: 'Conteúdos',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/book-icon.png')}
              style={[styles.tabBarIcon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={MyQuizzesScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/profile-icon.png')}
              style={[styles.tabBarIcon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />

      {/* Aba Plano de Estudos */}
      <Tab.Screen
        name="StudyPlan"
        component={StudyPlanScreen}
        options={{
          tabBarLabel: 'Plano',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/studyplan-icon.png')}
              style={[styles.tabBarIcon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={QuizListScreen}
        options={{
          tabBarLabel: 'Notificações',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/images/notifications-icon.png')}
              style={[styles.tabBarIcon, { tintColor: color, width: size, height: size }]}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Navigator raiz
export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />

      {user ? (
        <>
          {/* Tela principal com Tab Bar */}
          <Stack.Screen name="MainTabs" component={MainTabsNavigator} options={{ headerShown: false }} />

          {/* Roteamento direto às telas de CRUD fora das abas */}
          <Stack.Screen name="CategoryForm" component={CategoryFormScreen} options={{ title: 'Formulário de Categoria' }} />
          <Stack.Screen name="ContentForm" component={ContentFormScreen} options={{ title: 'Formulário de Conteúdo' }} />
          <Stack.Screen name="ContentView" component={ContentViewScreen} options={{ title: 'Detalhes do Conteúdo' }} />

          {/* Quiz Management (aninhado) */}
          <Stack.Screen name="Quizzes" component={QuizManagementNavigator} options={{ headerShown: false }} />

          {/* Roteamento direto */}
          <Stack.Screen name="QuizForm" component={QuizFormScreen} options={{ title: 'Formulário de Quiz' }} />
          <Stack.Screen name="StartQuiz" component={StartQuizScreen} options={{ title: 'Iniciar Quiz' }} />
          <Stack.Screen name="QuizPlay" component={QuizPlayScreen} options={{ title: 'Jogar Quiz' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    height: Platform.OS === 'ios' ? 80 : 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 15,
  },
  tabBarIcon: {
    // largura, altura e tintColor são definidos dinamicamente
  },
});
