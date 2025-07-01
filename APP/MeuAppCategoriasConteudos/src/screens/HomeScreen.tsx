// src/screens/HomeScreen.tsx

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH   = 240;
const STORAGE_KEY_FAVS = '@venuz:favorites';

interface Category { id: number; nome: string; }
interface Content  { id: number; titulo: string; }

const CATEGORY_ICONS: Record<string, any> = {
  Matemática:               require('../../assets/images/matematica.png'),
  Português:                require('../../assets/images/portugues.png'),
  Biologia:                 require('../../assets/images/bio.png'),
  'Direito Constitucional': require('../../assets/images/direitoc.png'),
  'Direito Administrativo': require('../../assets/images/admin.png'),
  'Direito Penal':          require('../../assets/images/penal.png'),
  random:                   require('../../assets/images/random.png'),
  default:                  require('../../assets/images/category-placeholder.png'),
};

export default function HomeScreen({ navigation }: any) {
  const { user, signOut, hasShownWelcomeMentor, setHasShownWelcomeMentor } = useAuth();

  const [categories, setCategories]           = useState<Category[]>([]);
  const [contents, setContents]               = useState<Content[]>([]);
  const [favorites, setFavorites]             = useState<Content[]>([]);
  const [loadingCats, setLoadingCats]         = useState(true);
  const [loadingContents, setLoadingContents] = useState(true);
  const [recentQuiz, setRecentQuiz]           = useState<{ id:number; pergunta:string; pontuacao:number }|null>(null);
  const [showFavModal, setShowFavModal]       = useState(false);
  const [showMentor, setShowMentor]           = useState(false);
  const [menuOpen, setMenuOpen]               = useState(false);

  const overlayFade = useRef(new Animated.Value(0)).current;
  const mentorFade  = useRef(new Animated.Value(0)).current;
  const blinkAnim   = useRef(new Animated.Value(0)).current;
  const menuAnim    = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  // Faz piscar o "Toque para continuar"
  const startBlink = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue:1, duration:800, useNativeDriver:true }),
        Animated.timing(blinkAnim, { toValue:0, duration:800, useNativeDriver:true }),
      ])
    ).start();
  },[blinkAnim]);

  // Carrega categorias, conteúdos e quiz recente
  useEffect(() => {
    (async () => {
      try {
        setLoadingCats(true);
        const { data: cats }  = await api.get<Category[]>('/categorias');
        setCategories(cats);

        setLoadingContents(true);
        const { data: cnts } = await api.get<Content[]>('/conteudos');
        setContents(cnts);

        const { data: rq }   = await api.get('/me/quizzes/last');
        if (rq?.pergunta) setRecentQuiz(rq);

        await loadFavorites();
      } catch (e) {
        console.warn(e);
      } finally {
        setLoadingCats(false);
        setLoadingContents(false);
      }
    })();
  },[user]);

  // Mentor de boas-vindas
  useEffect(() => {
    if (user && !hasShownWelcomeMentor) {
      setShowMentor(true);
      Animated.parallel([
        Animated.timing(overlayFade, { toValue:0.9, duration:400, useNativeDriver:true }),
        Animated.timing(mentorFade,  { toValue:1,   duration:600, delay:200, useNativeDriver:true }),
      ]).start(startBlink);
      setHasShownWelcomeMentor(true);
    }
  },[user]);

  // Favoritos: load/save
  const loadFavorites = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY_FAVS);
    if (json) {
      try {
        const ids = JSON.parse(json) as number[];
        setFavorites(contents.filter(c => ids.includes(c.id)));
      } catch{}
    }
  };
  const saveFavorites = async (ids: number[]) => {
    await AsyncStorage.setItem(STORAGE_KEY_FAVS, JSON.stringify(ids));
  };
  const handleAddFavorite = async (cnt: Content) => {
    const ids = favorites.map(f=>f.id);
    if (!ids.includes(cnt.id)) {
      const newIds = [...ids, cnt.id];
      await saveFavorites(newIds);
      setFavorites(prev=>[...prev,cnt]);
    }
  };

  // Sidebar open/close
  const openMenu  = () => {
    setMenuOpen(true);
    Animated.timing(menuAnim,{ toValue:0, duration:300, useNativeDriver:true }).start();
  };
  const closeMenu = () => {
    Animated.timing(menuAnim,{ toValue:-SIDEBAR_WIDTH, duration:300, useNativeDriver:true }).start(()=>{
      setMenuOpen(false);
    });
  };
  const navigateDirect = (screen:string) => {
    closeMenu();
    switch(screen){
      case 'Quiz':            navigation.navigate('Quizzes'); break;
      case 'CategoryList':    navigation.navigate('Quizzes',{screen:'CategoryList'}); break;
      case 'ContentList':     navigation.navigate('Quizzes',{screen:'ContentList'}); break;
      case 'ViewContentList': navigation.navigate('ViewContentList'); break;
      case 'MyQuizzes':       navigation.navigate('Quizzes',{screen:'MyQuizzes'}); break;
    }
  };

  const getProgress = (id:number)=>({1:0.7,2:0.65,3:0.8,4:0.5,5:0.9}[id]||0);

  // Cabeçalho do FlatList de categorias
  const renderHeader = () => (
    <>
      {/* QUIZ RECENTE */}
      {recentQuiz && (
        <TouchableOpacity style={styles.recentCard}
          onPress={()=>navigation.navigate('QuizPlay',{
            tipo:'last',
            quizId: recentQuiz.id,
            categoriaNome: 'Aleatório'
          })}
        >
          <Text style={styles.recentLabel}>Quiz Recente</Text>
          <View style={styles.recentInfo}>
            <Text style={styles.recentQ} numberOfLines={1}>{recentQuiz.pergunta}</Text>
            <Text style={styles.recentPct}>Acertos: {recentQuiz.pontuacao}%</Text>
            {/* Pill progress bar */}
            <View style={styles.pillBarBackground}>
              <View style={[styles.pillBarFill,{ width:`${recentQuiz.pontuacao}%` }]} />
            </View>
          </View>
          <Image source={require('../../assets/images/quiz-coins.png')} style={styles.recentImg}/>
        </TouchableOpacity>
      )}

      {/* FAVORITOS */}
      <Text style={styles.sectionTitle}>Meus Favoritos</Text>
      <FlatList
        horizontal
        data={favorites}
        keyExtractor={item=>item.id.toString()}
        showsHorizontalScrollIndicator={false}
        style={styles.favRow}
        renderItem={({item})=>(
          <View style={styles.favItem}>
            <View style={styles.favBubble}>
              <Image source={require('../../assets/images/love.png')} style={styles.favIcon}/>
            </View>
            <Text style={styles.favLabel} numberOfLines={1}>{item.titulo}</Text>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.favItem} onPress={()=>setShowFavModal(true)}>
            <View style={[styles.favBubble,styles.favAdd]}>
              <Text style={styles.favAddTxt}>＋</Text>
            </View>
            <Text style={styles.favLabel}>Adicionar</Text>
          </TouchableOpacity>
        }
      />

      {/* QUIZ ALEATÓRIO */}
      <TouchableOpacity style={styles.randomCard}
        onPress={()=>navigation.navigate('QuizPlay',{
          tipo:'random',
          categoriaNome: 'Aleatório'
        })}
      >
        <Image source={CATEGORY_ICONS.random} style={styles.randomIcon}/>
        <View style={styles.randomTxt}>
          <Text style={styles.randomTitle}>Quiz Aleatório</Text>
          <Text style={styles.randomDesc}>Perguntas variadas para você</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Categorias de Quiz</Text>
    </>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={['#4a3fce','#5a4ae1']} style={styles.header}>
        <View style={styles.row}>
          <TouchableOpacity onPress={openMenu} style={styles.menuToggle}>
            <Image source={require('../../assets/images/menu.png')} style={styles.menuIcon}/>
          </TouchableOpacity>
          <View style={styles.greetingBox}>
            <Text style={styles.greeting}>Olá, {user?.name.split(' ')[0]}!</Text>
            <Text style={styles.subGreeting}>Vamos começar seus estudos</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate('Profile')} style={styles.avatarBtn}>
            <Image source={require('../../assets/images/user-avatar.png')} style={styles.avatar}/>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* GRID DE CATEGORIAS */}
      {loadingCats
        ? <ActivityIndicator style={{flex:1}} size="large" color="#6A5ACD"/>
        : (
          <FlatList
            data={categories}
            keyExtractor={item=>item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.catRow}
            ListHeaderComponent={renderHeader}
            renderItem={({item})=>(
              <TouchableOpacity style={styles.catCard}
                onPress={()=>navigation.navigate('QuizPlay',{
                  tipo: 'categoria',
                  categoriaId: item.id,
                  categoriaNome: item.nome
                })}
              >
                <Image source={CATEGORY_ICONS[item.nome]||CATEGORY_ICONS.default} style={styles.catImg}/>
                <Text style={styles.catTitle}>{item.nome}</Text>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{Math.round(getProgress(item.id)*100)}%</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding:20, paddingBottom:Platform.OS==='ios'?90:70 }}
          />
        )
      }

      {/* Mentor overlay de boas-vindas */}
      {showMentor && (
        <Animated.View style={[styles.mentorOverlay,{opacity:overlayFade}]}>
          <TouchableWithoutFeedback onPress={()=>{
            Animated.parallel([
              Animated.timing(mentorFade,{ toValue:0, duration:400, useNativeDriver:true }),
              Animated.timing(overlayFade,{ toValue:0, duration:600, delay:100, useNativeDriver:true }),
            ]).start(()=>setShowMentor(false));
          }}>
            <Animated.View style={[styles.mentorWrap,{opacity:mentorFade}]}>
              <Image source={require('../../assets/images/mentor.png')} style={styles.mentorImg}/>
              <Text style={styles.mentorTitle}>Bem‑vindo ao Venuz!</Text>
              <Text style={styles.mentorSub}>Vamos iniciar seus estudos?</Text>
              <Animated.Text style={[styles.mentorTap,{opacity:blinkAnim}]}>
                Toque para continuar
              </Animated.Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )}

      {/* SIDEBAR */}
      <Modal transparent visible={menuOpen} animationType="none">
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.menuBg}/>
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sidebar,{transform:[{translateX:menuAnim}]}]}>
          <LinearGradient colors={['#5a4ae1','#4a3fce']} style={styles.sidebarHeader}>
            <Text style={styles.menuHd}>Venuz</Text>
          </LinearGradient>
          {['Quiz','CategoryList','ContentList','ViewContentList','MyQuizzes'].map((screen,i)=>(
            <TouchableOpacity key={i} style={styles.menuItem} onPress={()=>navigateDirect(screen)}>
              <Text style={styles.menuItemTxt}>
                {screen==='Quiz'? 'Quiz'
                 :screen==='MyQuizzes'? 'Meus Quizzes'
                 :screen==='ViewContentList'? 'Ver Conteúdos'
                 :screen==='CategoryList'? 'Categorias'
                 :'Conteúdos'}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem,styles.logoutBtn]} onPress={()=>signOut()}>
            <Text style={[styles.menuItemTxt,styles.logoutTxt]}>Sair</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* MODAL DE FAVORITOS */}
      <Modal visible={showFavModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={()=>setShowFavModal(false)}>
          <View style={styles.modalBg}/>
        </TouchableWithoutFeedback>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecione um conteúdo</Text>
          {loadingContents
            ? <ActivityIndicator size="large" color="#6A5ACD"/>
            : (
              <FlatList
                data={contents}
                keyExtractor={item=>item.id.toString()}
                renderItem={({item})=>(
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={()=>{
                      handleAddFavorite(item);
                      setShowFavModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.titulo}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={()=> <View style={styles.separator}/>}
              />
            )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex:1, backgroundColor:'#f0f2f5' },
  header:           { paddingTop:Platform.OS==='android'?40:50, padding:20, borderBottomLeftRadius:30, borderBottomRightRadius:30 },
  row:              { flexDirection:'row', alignItems:'center' },
  menuToggle:       { width:44,height:44,borderRadius:22,backgroundColor:'#5a4ae1',justifyContent:'center',alignItems:'center' },
  menuIcon:         { width:22,height:22,tintColor:'#fff' },
  greetingBox:      { flex:1, marginLeft:12 },
  greeting:         { color:'#fff', fontSize:18, fontFamily:'Inter-Bold' },
  subGreeting:      { color:'#eee', fontSize:13, fontFamily:'Inter-Regular' },
  avatarBtn:        { width:44,height:44,borderRadius:22,overflow:'hidden',backgroundColor:'#fff',justifyContent:'center',alignItems:'center',marginLeft:12 },
  avatar:           { width:'100%',height:'100%' },

  recentCard:       { backgroundColor:'#fff',borderRadius:18,padding:14,marginBottom:16,flexDirection:'row',alignItems:'center',elevation:4 },
  recentLabel:      { position:'absolute',top:10,left:14,fontSize:12,color:'#666' },
  recentInfo:       { flex:1,marginLeft:16,marginTop:14 },
  recentQ:          { fontSize:15,fontFamily:'Inter-Bold',color:'#333' },
  recentPct:        { fontSize:13,color:'#6A5ACD',marginTop:4 },
  pillBarBackground:{ height:6, backgroundColor:'#eee', borderRadius:3, overflow:'hidden', marginTop:6 },
  pillBarFill:      { height:6, backgroundColor:'#6A5ACD' },
  recentImg:        { width:50,height:50,tintColor:'#6A5ACD' },

  sectionTitle:     { fontSize:18,fontFamily:'Inter-Bold',color:'#333',marginVertical:12, marginLeft:20 },

  favRow:           { marginBottom:20, paddingLeft:20 },
  favItem:          { alignItems:'center',marginRight:16,width:70 },
  favBubble:        { width:60,height:60,borderRadius:30,backgroundColor:'#fff',justifyContent:'center',alignItems:'center',elevation:3 },
  favIcon:          { width:32,height:32 },
  favLabel:         { fontSize:12,fontFamily:'Inter-Bold',color:'#4a3fce',marginTop:6,textAlign:'center' },
  favAdd:           { backgroundColor:'#6A5ACD' },
  favAddTxt:        { fontSize:24,color:'#fff',fontFamily:'Inter-Bold' },

  randomCard:       { flexDirection:'row',backgroundColor:'#fff',borderRadius:15,padding:12,alignItems:'center',marginHorizontal:20,marginBottom:20,elevation:3 },
  randomIcon:       { width:40,height:40,marginRight:12 },
  randomTxt:        { flex:1 },
  randomTitle:      { fontSize:16,fontFamily:'Inter-Bold',color:'#333' },
  randomDesc:       { fontSize:13,fontFamily:'Inter-Regular',color:'#666' },

  catRow:           { justifyContent:'space-between', marginBottom:16 },
  catCard:          { backgroundColor:'#fff', borderRadius:12, padding:16, width:(width-60)/2, alignItems:'center', elevation:3 },
  catImg:           { width:40,height:40,marginBottom:8 },
  catTitle:         { fontSize:14,fontFamily:'Inter-Bold',color:'#333',marginBottom:4,textAlign:'center' },
  pill:             { backgroundColor:'#6A5ACD', borderRadius:8, paddingHorizontal:6, paddingVertical:2 },
  pillText:         { fontSize:10,color:'#fff',fontFamily:'Inter-Bold' },

  mentorOverlay:    { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.9)', justifyContent:'center', alignItems:'center' },
  mentorWrap:       { width:width*0.8, backgroundColor:'#fff', borderRadius:20, padding:20, alignItems:'center', elevation:5 },
  mentorImg:        { width:width*0.4, height:width*0.4, marginBottom:12 },
  mentorTitle:      { fontSize:18,fontFamily:'Inter-Bold',color:'#333',marginBottom:6 },
  mentorSub:        { fontSize:14,fontFamily:'Inter-Regular',color:'#666',marginBottom:12 },
  mentorTap:        { fontSize:14,fontFamily:'Inter-Regular',color:'#4a3fce', textShadowColor:'rgba(0,0,0,0.4)', textShadowOffset:{width:1,height:1}, textShadowRadius:2 },

  menuBg:           { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.5)' },
  sidebar:          { position:'absolute', top:0, left:0, width:SIDEBAR_WIDTH, height, backgroundColor:'#f7f7fa', borderTopRightRadius:20, borderBottomRightRadius:20, elevation:8 },
  sidebarHeader:    { paddingVertical:20, paddingHorizontal:16, borderTopRightRadius:20, backgroundColor:'#5a4ae1' },
  menuHd:           { fontSize:22,fontFamily:'Inter-Bold',color:'#fff',textAlign:'center' },
  menuItem:         { paddingVertical:14,paddingHorizontal:16 },
  menuItemTxt:      { fontSize:18,fontFamily:'Inter-Regular',color:'#4a3fce' },
  logoutBtn:        { marginTop:20,borderTopWidth:1,borderTopColor:'#ddd' },
  logoutTxt:        { color:'#d9534f' },

  modalBg:          { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.5)' },
  modalContainer:   { position:'absolute', top:height*0.2, left:20, right:20, bottom:height*0.2, backgroundColor:'#fff', borderRadius:12, padding:16, elevation:8 },
  modalTitle:       { fontSize:18,fontFamily:'Inter-Bold',marginBottom:12 },
  modalItem:        { paddingVertical:12 },
  modalItemText:    { fontSize:16,color:'#333' },
  separator:        { height:1, backgroundColor:'#eee' },
});
