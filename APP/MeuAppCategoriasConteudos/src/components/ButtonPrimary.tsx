import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  GestureResponderEvent,
  ViewStyle, // Importe ViewStyle para tipar o estilo do botão
  TextStyle, // Importe TextStyle para tipar o estilo do texto
  StyleProp // Importe StyleProp para tipagem flexível de estilos
} from 'react-native';

interface ButtonPrimaryProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  // NOVAS PROPS: para permitir a personalização de estilos externos
  style?: StyleProp<ViewStyle>; 
  textStyle?: StyleProp<TextStyle>;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({ 
  title, 
  onPress, 
  loading, 
  disabled, 
  style, 
  textStyle 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]} // Aplica os estilos padrão e os passados via prop
      onPress={onPress}
      disabled={loading || disabled} // Desabilita se estiver carregando ou explicitamente desabilitado
      activeOpacity={0.7} // Feedback visual ao tocar
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text> // Aplica os estilos padrão e os passados
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff', // Cor padrão, pode ser sobrescrita
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // Garante que o botão tenha uma altura mínima para o loader
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ButtonPrimary;
