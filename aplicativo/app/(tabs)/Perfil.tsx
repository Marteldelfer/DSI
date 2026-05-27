// GARANTA QUE ESTE É O CONTEÚDO DE: aplicativo/app/(tabs)/Perfil.tsx
import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, Image, Alert, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AntDesign, Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { deleteUser, getAuth, onAuthStateChanged, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { styles } from '../styles';
import { BarraForcaSenha } from '../componentes/BarraForcaSenha';
import { validarSenha } from '../validacao/Validacao';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../src/config/supabaseConfig';

function TelaPerfil() {
  const router = useRouter();
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...');
  const [emailUsuario, setEmailUsuario] = useState('Carregando...');
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(undefined);

  const [modalExcluirVisivel, setModalExcluirVisivel] = useState(false);

  const [modalFotoVisivel, setModalFotoVisivel] = useState(false);
  const [novaFotoTemp, setNovaFotoTemp] = useState<string | undefined>(undefined); // Alterado para NovaFotoTemp

  const [modalNomeVisivel, setModalNomeVisivel] = useState(false);
  const [novoNomeUsuario, setNovoNomeUsuario] = useState("");

  const [modalSenhaVisivel, setModalSenhaVisivel] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagemErro, setMensagemErro] = useState("");

  const [visivel, setVisivel] = useState(false);
  const [visivelConfirmar, setVisivelConfirmar] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setNomeUsuario(user.displayName || 'Nome não definido');
        setEmailUsuario(user.email || 'Email não definido');
        setFotoUrl(user.photoURL || undefined)
      }
    });
    return () => unsubscribe();
  }, []);

  // Upload da imagem para o Supabase Storage com retry
  const uploadProfilePicture = async (uri: string): Promise<string | null> => {
    if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return null;
    }
    try {
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            return uri;
        }

        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
            console.error('Arquivo de imagem não encontrado:', uri);
            Alert.alert('Erro', 'Arquivo de imagem não encontrado.');
            return null;
        }

        console.log(`Upload perfil - Arquivo: ${uri}, Tamanho: ${fileInfo.size ? Math.round(fileInfo.size / 1024) + 'KB' : 'desconhecido'}`);

        const fileExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
        const validExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExtension) ? fileExtension : 'jpg';
        const fileName = `${user.uid}-${Date.now()}.${validExtension}`;
        const filePath = `profile_pictures/${user.uid}/${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        if (!base64 || base64.length === 0) {
            console.error('Falha ao ler arquivo como base64');
            Alert.alert('Erro', 'Falha ao ler arquivo de imagem.');
            return null;
        }

        console.log(`Upload perfil - Base64 size: ${Math.round(base64.length / 1024)}KB`);
        const arrayBuffer = decode(base64);

        const contentTypeMap: Record<string, string> = { 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp' };
        const contentType = contentTypeMap[validExtension] || 'image/jpeg';

        // Retry com backoff
        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Upload perfil tentativa ${attempt}/${maxRetries} para Supabase Storage...`);
                const { data, error } = await supabase.storage
                    .from('photos')
                    .upload(filePath, arrayBuffer, {
                        contentType: contentType,
                        upsert: true,
                    });

                if (error) {
                    console.error(`Upload perfil erro (tentativa ${attempt}):`, error.message);
                    throw error;
                }

                const publicUrl = supabase.storage.from('photos').getPublicUrl(filePath);
                console.log('Upload perfil sucesso! URL:', publicUrl.data.publicUrl);
                return publicUrl.data.publicUrl;
            } catch (uploadError: any) {
                const errorMsg = uploadError?.message || '';
                const isNetworkError = errorMsg.includes('Network request failed') ||
                                        uploadError?.name === 'StorageUnknownError' ||
                                        errorMsg.includes('Failed to fetch');
                if (isNetworkError && attempt < maxRetries) {
                    const delay = attempt * 2000;
                    console.warn(`Upload perfil tentativa ${attempt} falhou (rede: ${errorMsg}). Retentando em ${delay/1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw uploadError;
                }
            }
        }
        return null;
    } catch (error: any) {
        console.error('Erro ao fazer upload da foto de perfil:', error.message || error);
        Alert.alert('Erro', 'Não foi possível fazer upload da foto de perfil. Verifique sua conexão e tente novamente.');
        return null;
    }
  };

  // Função para deletar a foto de perfil do Supabase Storage
  const deleteProfilePicture = async (photoUrl: string): Promise<void> => {
    if (!user) return;

    if (photoUrl.includes('supabase.co/storage/v1/object/public/photos/')) {
        try {
            const pathInBucket = photoUrl.split('/storage/v1/object/public/photos/')[1];
            const { error } = await supabase.storage.from('photos').remove([pathInBucket]);

            if (error) {
                console.error('Erro ao deletar foto de perfil do Supabase:', error.message);
            } else {
                console.log('Foto de perfil deletada do Supabase Storage:', photoUrl);
            }
        } catch (error) {
            console.error('Erro no processo de deleção da foto de perfil:', error);
        }
    }
  };


  const pickImageFromGallery = async () => {
    setModalFotoVisivel(false);
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Proporção 1:1 para foto de perfil
        quality: 0.6,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        setNovaFotoTemp(result.assets[0].uri);
        handleAtualizarFoto(result.assets[0].uri); // Chamar a atualização com a URI local
    }
  };

  const handleAplicarFotoUrl = (url: string) => {
    setModalFotoVisivel(false);
    setNovaFotoTemp(url);
    handleAtualizarFoto(url); // Chamar a atualização com a URL
  };

  const handleAtualizarFoto = async (uriOrUrl?: string) => {
    const photoSource = uriOrUrl || novaFotoTemp; // Usar a URI passada ou a do estado
    if (!user || !photoSource) {
      Alert.alert('Erro', 'Nenhuma foto selecionada ou usuário não autenticado.');
      return;
    }
    
    // Se já existe uma foto no Supabase, deleta a antiga primeiro
    if (fotoUrl && fotoUrl.includes('supabase.co/storage/v1/object/public/photos/')) {
        await deleteProfilePicture(fotoUrl);
    }

    const publicUrl = await uploadProfilePicture(photoSource);
    if (publicUrl) {
      setFotoUrl(publicUrl);
      try {
        await updateProfile(user, {photoURL: publicUrl});
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      } catch (error: any) {
        Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil no Firebase. Tente novamente.');
        console.error('Erro ao atualizar foto no Firebase:', error.message);
      }
    }
    setModalFotoVisivel(false);
    setNovaFotoTemp(undefined);
  };


  const handleAtualizarNome = async () => { if (user && novoNomeUsuario) {
    setModalNomeVisivel(false);
    setNomeUsuario(novoNomeUsuario);
    updateProfile(user,{displayName:novoNomeUsuario})}
  }
  const handleRedefinirSenha = async () => {
    const ValSenha = validarSenha(novaSenha)
    if (ValSenha.tamanhoValido && novaSenha === confirmarSenha && user) {try {await updatePassword(user, novaSenha); setModalSenhaVisivel(false)
    } catch (error) {
      setMensagemErro("Erro na autenticação. Por favor desconecte e reconecte a sua conta.");
      console.log(error)
    }
  } else if (novaSenha !== confirmarSenha) {
      setMensagemErro("As duas senhas devem ser iguais")
    } else if (!ValSenha.tamanhoValido) {
      setMensagemErro("Senha muito curta")
    }
  };
  const handleExcluirConta = async () => { // Tornar assíncrona
    if (user) {
        // Antes de excluir a conta, se houver uma foto de perfil no Supabase, tente excluí-la
        if (fotoUrl && fotoUrl.includes('supabase.co/storage/v1/object/public/photos/')) {
            await deleteProfilePicture(fotoUrl);
        }
        await deleteUser(user); // Espera a exclusão da conta
        handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/telas/Login');
    } catch (error: any) {
      Alert.alert('Erro ao deslogar', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={perfilStyles.header}>
        <Pressable onPress={() => router.canGoBack() && router.back()}>
          <AntDesign name="arrowleft" size={24} color="#eaeaea" />
        </Pressable>
      </View>
      <View style={perfilStyles.content}>
        
        <View style={perfilStyles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalFotoVisivel}
            onRequestClose={() => setModalFotoVisivel(false)}>
              <View style={perfilStyles.centeredView}>
            <View style={perfilStyles.modalView}>
              <View style={styles.textInput}>
                <TextInput
                  placeholder="URL da foto"
                  style={[styles.input, { flex: 1 }]}
                  placeholderTextColor={"black"}
                  value={novaFotoTemp} // Usar novaFotoTemp
                  onChangeText={setNovaFotoTemp} // Atualizar novaFotoTemp
                  onSubmitEditing={() => handleAplicarFotoUrl(novaFotoTemp || '')} // Chamar handleAplicarFotoUrl
                />
              </View>
              {/* Novo botão para escolher da galeria */}
              <TouchableOpacity style={perfilStyles.uploadButton} onPress={pickImageFromGallery}>
                  <Text style={perfilStyles.uploadButtonText}>Escolher da Galeria</Text>
              </TouchableOpacity>
              <Pressable style={styles.Botao} onPress={() => handleAplicarFotoUrl(novaFotoTemp || '')}><Text style={styles.textoBotao}>Atualizar Foto</Text></Pressable>
            </View></View>
          </Modal>
        </View>

        <View style={perfilStyles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalNomeVisivel}
            onRequestClose={() => setModalNomeVisivel(false)}>
              <View style={perfilStyles.centeredView}>
            <View style={perfilStyles.modalView}>
              <View style={styles.textInput}>
                <TextInput
                  maxLength={20}
                  placeholder="Novo nome"
                  style={[styles.input, { flex: 1 }]}
                  placeholderTextColor={"black"}
                  onChangeText={setNovoNomeUsuario}
                  onSubmitEditing={handleAtualizarNome}
                />
              </View>
              <Pressable style={styles.Botao} onPress={handleAtualizarNome}><Text style={styles.textoBotao}>Atualizar Nome</Text></Pressable>
            </View></View>
          </Modal>
        </View>

        <View style={perfilStyles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalSenhaVisivel}
            onRequestClose={() => setModalSenhaVisivel(false)}>
            <View style={perfilStyles.centeredView}>
              <View style={perfilStyles.modalView}>
                <View style={[styles.textInput, { flexDirection: "row", alignItems: "center" }]}>
                  <Feather name="lock" size={24} color="black" />
                  <TextInput
                    placeholder="Nova Senha"
                    style={[styles.input, { flex: 1 }]}
                    placeholderTextColor={"black"}
                    onChangeText={setNovaSenha}
                    secureTextEntry={!visivel}
                  />
                  <Pressable onPress={() => setVisivel(!visivel)} style={{ marginLeft: 10 }}>
                    <Feather name={visivel ? "eye" : "eye-off"} size={24} color="black" />
                  </Pressable>
                </View>
                {mensagemErro && (<View style={{width:"100%", paddingHorizontal: 10}}><Text style={perfilStyles.mensagemErro}>{mensagemErro}</Text></View>)}
                {/* <BarraForcaSenha senha={NovaSenha} /> */}
                <View style={[styles.textInput, { flexDirection: "row", alignItems: "center" }]}>
                  <Feather name="lock" size={24} color="black" />
                  <TextInput
                    placeholder="Confirmar Senha"
                    style={[styles.input, { flex: 1 }]}
                    placeholderTextColor={"black"}
                    onChangeText={setConfirmarSenha}
                    secureTextEntry={!visivelConfirmar}
                  />
                  <Pressable onPress={() => setVisivelConfirmar(!visivelConfirmar)} style={{ marginLeft: 10 }}>
                    <Feather name={visivelConfirmar ? "eye" : "eye-off"} size={24} color="black" />
                  </Pressable>
                </View>

                <Pressable style={styles.Botao} onPress={handleRedefinirSenha}><Text style={styles.textoBotao}>Atualizar Senha</Text></Pressable>

              </View>
            </View>
          </Modal>
        </View>

        <View style={perfilStyles.centeredView}>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalExcluirVisivel}
            onRequestClose={() => setModalExcluirVisivel(false)}>
              <View style={perfilStyles.centeredView}>
            <View style={perfilStyles.modalView}>
              <Pressable style={styles.Botao} onPress={() => setModalExcluirVisivel(false)}><Text style={styles.textoBotao}>Mudei de ideia</Text></Pressable>
              <Pressable style={[styles.Botao, {backgroundColor: "#ff6347"}]} onPress={handleExcluirConta}><Text style={styles.textoBotao}>Excluir a conta</Text></Pressable>

            </View></View>
          </Modal>
        </View>

        <View style={perfilStyles.profilePicContainer}>
          {fotoUrl ? (
                              <Image
                                  source={{ uri: fotoUrl }}
                                  style={ perfilStyles.imagem}
                              />
                          ) : (
                              <AntDesign name="user" size={80} color="black" />
                          )}
          
        </View>
        <Text style={perfilStyles.userName}>{nomeUsuario}</Text>
        <Text style={perfilStyles.userEmail}>{emailUsuario}</Text>

        <View style={perfilStyles.buttonContainer}>
          <Pressable style={styles.Botao} onPress={() => setModalFotoVisivel(true)}><Text style={styles.textoBotao}>Atualizar Foto</Text></Pressable>
          <Pressable style={styles.Botao} onPress={() => setModalNomeVisivel(true)}><Text style={styles.textoBotao}>Atualizar Nome</Text></Pressable>
          <Pressable style={styles.Botao} onPress={() => setModalSenhaVisivel(true)}><Text style={styles.textoBotao}>Redefinir Senha</Text></Pressable>
          {/* Botões de navegação para novas features */}
          <Pressable style={[styles.Botao, perfilStyles.navButton]} onPress={() => router.push('/telas/ListaEventos')}>
            <View style={perfilStyles.navButtonContent}>
              <MaterialIcons name="event" size={20} color="#FFFFFF" />
              <Text style={styles.textoBotao}>Meus Eventos</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.Botao, perfilStyles.navButton]} onPress={() => router.push('/telas/ListaGrupos')}>
            <View style={perfilStyles.navButtonContent}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
              <Text style={styles.textoBotao}>Meus Grupos</Text>
            </View>
          </Pressable>
          {/* Novo botão de Deslogar */}
          <Pressable style={[styles.Botao, perfilStyles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.textoBotao}>Deslogar</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.Botao, perfilStyles.deleteButton]} onPress={() => setModalExcluirVisivel(true)}>
          <Text style={styles.textoBotao}>Excluir a conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const perfilStyles = StyleSheet.create({
  header: { paddingTop: 50, paddingHorizontal: 20, alignSelf: 'flex-start' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingBottom: 80 },
  profilePicContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#3E9C9C', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  userName: { color: '#eaeaea', fontSize: 24, fontWeight: 'bold' },
  userEmail: { color: '#ccc', fontSize: 16, marginBottom: 40 },
  buttonContainer: { width: '100%', gap: 5 },
  deleteButton: { backgroundColor: '#FF6347', position: 'absolute', bottom: 20, width: '100%' },
  logoutButton: {
    backgroundColor: '#6C7A89',
  },
  mensagemErro: {
    color: "white",
    textAlign: "left",
  },
  modalView: {
    flexDirection: 'column',
    
    margin: 20,
    backgroundColor: '#1a2b3e',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    }},
    centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: "100%",
    flexDirection: 'column',
  },
  imagem: {
    height: "100%",
    width: "100%",
    borderRadius: 100,
  },
  uploadButton: { // Novo estilo para o botão de upload
    backgroundColor: '#4A6B8A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 10, // Adicionado para espaçamento
    width: '100%', // Para ocupar a largura total do modal
    alignItems: 'center',
  },
  uploadButtonText: { // Estilo para o texto do botão de upload
    color: '#eaeaea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navButton: {
    backgroundColor: '#4A6B8A',
  },
  navButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

});

export default TelaPerfil;