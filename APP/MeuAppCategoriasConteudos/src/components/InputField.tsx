import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, NativeSyntheticEvent, TextInputFocusEventData, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // secureTextEntry?: boolean; -> Esta linha foi removida da interface Props
  errorMessage?: string;
  iconSource?: ImageSourcePropType;
  isPassword?: boolean; // Prop para indicar se é um campo de senha e ativar a visualização
};

const InputField: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  keyboardType,
  autoCapitalize,
  // CORREÇÃO: REMOVIDO secureTextEntry daqui da desestruturação
  errorMessage,
  iconSource,
  isPassword,
}) => {
  // Inicializa internalSecureTextEntry com base em isPassword
  // Se isPassword for true, começa como seguro; caso contrário, não é seguro.
  const [internalSecureTextEntry, setInternalSecureTextEntry] = useState(!!isPassword); // Usar !!isPassword para garantir boolean

  const toggleSecureEntry = () => {
    setInternalSecureTextEntry(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errorMessage ? styles.inputWrapperError : null]}>
        {iconSource && (
          <Image 
            source={iconSource} 
            style={styles.icon} 
            resizeMode="contain" 
          />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          // USA O ESTADO INTERNO para secureTextEntry se for um campo de senha
          // Se isPassword for true, usa o valor de internalSecureTextEntry; caso contrário, é sempre false (não seguro)
          secureTextEntry={isPassword ? internalSecureTextEntry : false} 
          placeholderTextColor="#999"
        />
        {isPassword && ( // Renderiza o botão de alternar senha apenas se isPassword for true
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIconContainer}>
            <Image
              source={internalSecureTextEntry 
                ? require('../../assets/images/eye-off.png') // Caminho para o ícone de olho fechado
                : require('../../assets/images/eye.png') // Caminho para o ícone de olho aberto
              }
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 4, fontWeight: 'bold', color: '#555' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  inputWrapperError: { borderColor: 'red' },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#6A5ACD',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 40,
  },
  eyeIconContainer: {
    paddingLeft: 10,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#6A5ACD',
  },
  errorText: { color: 'red', marginTop: 4, fontSize: 12 },
});

export default InputField;
