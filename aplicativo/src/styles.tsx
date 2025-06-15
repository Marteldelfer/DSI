// aplicativo/src/styles.tsx
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E3D50',
  },
  textInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    color: 'black',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3E9C9C', // Cor principal do tema
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#eaeaea', // Cor do texto dos botões
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#3E9C9C',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  textoBotao: { // Estilo para textos dentro de botões personalizados
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});