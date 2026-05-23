// aplicativo/app/telas/CriarGrupo.tsx
// Tela modal para criar um novo grupo de amigos
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { styles } from '../styles';
import { GroupService } from '../../src/services/GroupService';

function CriarGrupoScreen() {
    const router = useRouter();
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const groupService = GroupService.getInstance();

    // Valida e cria o grupo, navegando para detalhes após sucesso
    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert("Atenção", "O nome do grupo é obrigatório.");
            return;
        }

        setLoading(true);
        try {
            const newGroup = await groupService.createGroup(
                groupName.trim(),
                groupDescription.trim() || undefined
            );
            Alert.alert("Sucesso", "Grupo criado com sucesso!");
            // Navega para a tela de detalhes do grupo recém-criado
            router.replace({ pathname: '/telas/DetalhesGrupo', params: { groupId: newGroup.id } });
        } catch (error) {
            console.error("Erro ao criar grupo:", error);
            Alert.alert("Erro", "Não foi possível criar o grupo. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header com botão voltar e título */}
                <View style={grupoStyles.header}>
                    <Pressable onPress={() => router.back()} style={grupoStyles.backButton}>
                        <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
                    </Pressable>
                    <View style={grupoStyles.headerTitleContainer}>
                        <MaterialIcons name="group-add" size={24} color="#3E9C9C" style={{ marginRight: 10 }} />
                        <Text style={grupoStyles.headerTitle}>Novo Grupo</Text>
                    </View>
                    <View style={{ width: 26 }} />
                </View>

                <ScrollView style={grupoStyles.formContainer} keyboardShouldPersistTaps="handled">
                    {/* Ícone decorativo do grupo */}
                    <View style={grupoStyles.iconContainer}>
                        <View style={grupoStyles.iconCircle}>
                            <Ionicons name="people" size={48} color="#3E9C9C" />
                        </View>
                        <Text style={grupoStyles.iconSubtext}>Crie um grupo para compartilhar playlists com seus amigos</Text>
                    </View>

                    {/* Campo: Nome do grupo (obrigatório) */}
                    <Text style={grupoStyles.label}>Nome do Grupo *</Text>
                    <View style={grupoStyles.inputWrapper}>
                        <Ionicons name="text-outline" size={20} color="#B0C4DE" style={{ marginRight: 10 }} />
                        <TextInput
                            style={grupoStyles.inputField}
                            placeholder="Ex: Cinéfilos da UFRPE"
                            placeholderTextColor="#999"
                            value={groupName}
                            onChangeText={setGroupName}
                            maxLength={50}
                        />
                    </View>

                    {/* Campo: Descrição (opcional, multiline) */}
                    <Text style={grupoStyles.label}>Descrição (Opcional)</Text>
                    <View style={[grupoStyles.inputWrapper, grupoStyles.textAreaWrapper]}>
                        <Ionicons name="document-text-outline" size={20} color="#B0C4DE" style={{ marginRight: 10, alignSelf: 'flex-start', marginTop: 4 }} />
                        <TextInput
                            style={[grupoStyles.inputField, grupoStyles.textArea]}
                            placeholder="Uma breve descrição sobre o grupo..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={4}
                            value={groupDescription}
                            onChangeText={setGroupDescription}
                            maxLength={200}
                        />
                    </View>

                    {/* Botão de criar grupo */}
                    <Pressable
                        style={({ pressed }) => [
                            grupoStyles.createButton,
                            pressed && { opacity: 0.8 },
                        ]}
                        onPress={handleCreateGroup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <View style={grupoStyles.createButtonContent}>
                                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={grupoStyles.createButtonText}>Criar Grupo</Text>
                            </View>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default CriarGrupoScreen;

const grupoStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: 'transparent',
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    formContainer: {
        padding: 20,
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#1A2B3E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#3E9C9C',
    },
    iconSubtext: {
        color: '#B0C4DE',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 26,
        paddingHorizontal: 15,
        marginBottom: 25,
        minHeight: 50,
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingVertical: 10,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        color: 'black',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    createButton: {
        backgroundColor: '#3E9C9C',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
        elevation: 4,
        shadowColor: '#3E9C9C',
        shadowRadius: 8,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 3 },
    },
    createButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
