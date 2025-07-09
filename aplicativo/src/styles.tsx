// O CONTEÚDO DESTE ARQUIVO FOI ATUALIZADO: aplicativo/src/styles.tsx
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1F2D',
  },
  title: {
    color: '#eaeaea',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    color: '#b0b0b0',
    fontSize: 16,
    textAlign: 'left',
    width: '100%',
    marginBottom: 10,
  },
  textInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2B3E',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 8,
    height: 50,
    borderWidth: 1,
    borderColor: '#4A6B8A',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#eaeaea',
  },
  button: {
    backgroundColor: '#3E9C9C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Estilo genérico para texto de botões, para manter consistência
  textoBotao: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});