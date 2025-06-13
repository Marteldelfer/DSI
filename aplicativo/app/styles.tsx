import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Telas e componentes
  container: {
    flex: 1,
    backgroundColor: "#1C1C1C", // Cor de fundo escura
  },

  viewCentralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#eaeaea", // Cor de texto clara
    marginBottom: 20,
  },

  textoPadrao: {
    fontSize: 16,
    color: "#eaeaea", // Cor de texto clara
    textAlign: "center",
  },

  input: {
    width: "100%",
    height: 40,
    backgroundColor: "#333333", // Fundo do input mais escuro
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#eaeaea", // Cor do texto do input
  },

  Botao: {
    backgroundColor: "#007bff", // Azul padrão para botões
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  textoBotao: {
    color: "#ffffff", // Texto branco para botões
    fontSize: 16,
    fontWeight: "bold",
  },

  link: {
    color: "#007bff", // Azul para links
    marginTop: 10,
    fontSize: 16,
  },

  // Estilos específicos para a tela de perfil (exemplo)
  perfilHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  userPic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ccc', // Cor de fundo para a imagem do perfil
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  nomePerfil: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  emailPerfil: {
    fontSize: 16,
    color: '#ccc',
  },
  botaoDeslogar: {
    backgroundColor: "#808080", // Uma cor diferente para o botão de deslogar
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },

  // Estilos da Barra de Força da Senha
  containerBarra: {
    width: '100%',
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barraForca: {
    height: '100%',
    borderRadius: 5,
  },
  textoForca: {
    textAlign: 'center',
    marginBottom: 10,
  },

  // Estilos da TabBar
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2C2C2C', // Fundo da TabBar
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabBarText: {
    fontSize: 12,
    color: '#eaeaea',
    marginTop: 4,
  },
});