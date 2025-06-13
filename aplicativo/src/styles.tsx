// aplicativo/app/styles.tsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  textInput: {
    width: 300,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: "auto",
    marginRight: "auto",
    flexDirection: 'row',
    backgroundColor: '#eaeaea',
    color: "black",
    borderRadius: 26,
    padding: 8,
  },
  userPic: {
    width: 110,
    height: 110,
    margin: 12,
    backgroundColor: '#eaeaea',
    justifyContent: "center",
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 55, // Use um valor numérico para borderRadius em React Native
  },
  Botao: {
    backgroundColor: "#3E9C9C",
    padding: 8,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 26,
    width: 300,
    color: "#eaeaea", // Esta propriedade 'color' aqui no View não faz efeito visualmente
  },
  msgVal: {
    marginLeft: "auto",
    marginRight: "auto",
    width: 300,
    color: "#FFF380",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4, // Adicionei um margin-bottom para espaçamento consistente
  },
  container: {
    backgroundColor: "#2E3D50",
    justifyContent: "center",
    height: "100%",
  },
  textoPadrao: {
    color: "#eaeaea",
    fontWeight: "bold",
    marginLeft: "auto",
    marginRight: "auto",
  },
  // Estilos adicionais para consistência e clareza se forem usados diretamente
  title: {
    color: "#eaeaea",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: { // Geralmente usado para o estilo do TextInput, caso não use textInput do styles.tsx
    paddingLeft: 12,
    color: "black",
    flex: 1, // Para preencher o espaço dentro do View de input
  },
  linkText: { // Estilo para o texto do link
    color: "#FFF380",
    fontWeight: "bold",
  }
});