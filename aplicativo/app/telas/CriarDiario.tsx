// aplicativo/app/telas/CriarDiario.tsx
// Tela para registrar uma nova entrada no diário cinematográfico com fotos
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    Image,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { DiarioCinemaService } from '../../src/services/DiarioCinemaService';

export default function CriarDiario() {
    const router = useRouter();
    const diarioService = DiarioCinemaService.getInstance();

    const [cinemaName, setCinemaName] = useState('');
    const [movieTitle, setMovieTitle] = useState('');
    const [data, setData] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [salvando, setSalvando] = useState(false);

    // Auto-formatação da data (DD/MM/AAAA)
    const handleDataChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = '';
        if (cleaned.length <= 2) formatted = cleaned;
        else if (cleaned.length <= 4) formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        else formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        setData(formatted);
    };

    // Selecionar fotos (múltiplas)
    const selecionarFotos = async () => {
        if (fotos.length >= 5) {
            Alert.alert('Limite', 'Máximo de 5 fotos por registro.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5 - fotos.length,
            quality: 0.6,
        });

        if (!result.canceled && result.assets) {
            const novasUris = result.assets.map(a => a.uri);
            setFotos(prev => [...prev, ...novasUris].slice(0, 5));
        }
    };

    // Tirar foto com câmera
    const tirarFoto = async () => {
        if (fotos.length >= 5) {
            Alert.alert('Limite', 'Máximo de 5 fotos por registro.');
            return;
        }

        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão', 'Permissão de câmera é necessária.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.6,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            setFotos(prev => [...prev, result.assets[0].uri].slice(0, 5));
        }
    };

    // Remover foto
    const removerFoto = (index: number) => {
        setFotos(prev => prev.filter((_, i) => i !== index));
    };

    // Salvar entrada
    const salvar = async () => {
        if (!cinemaName.trim()) {
            Alert.alert('Campo obrigatório', 'Informe o nome do cinema.');
            return;
        }
        if (!data.trim() || data.length < 10) {
            Alert.alert('Campo obrigatório', 'Informe a data completa (DD/MM/AAAA).');
            return;
        }

        setSalvando(true);

        try {
            // Upload das fotos para o Supabase
            const fotosUrls: string[] = [];
            for (let i = 0; i < fotos.length; i++) {
                console.log(`Uploading foto ${i + 1}/${fotos.length}...`);
                const url = await diarioService.uploadFotoDiario(fotos[i]);
                if (url) fotosUrls.push(url);
            }

            // Criar entrada no Firestore
            await diarioService.createEntrada({
                cinemaName: cinemaName.trim(),
                movieTitle: movieTitle.trim() || null,
                data: data,
                fotos: fotosUrls,
                observacoes: observacoes.trim() || null,
            });

            Alert.alert('Sucesso', 'Registro salvo no diário!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Erro ao salvar entrada do diário:', error);
            Alert.alert('Erro', 'Não foi possível salvar. Verifique sua conexão e tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={criarStyles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={criarStyles.header}>
                <TouchableOpacity onPress={() => router.back()} style={criarStyles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={criarStyles.headerTitle}>Novo Registro</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={criarStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Campo: Cinema */}
                <Text style={criarStyles.label}>Cinema *</Text>
                <TextInput
                    style={criarStyles.input}
                    placeholder="Ex: Cinemark RioMar Recife"
                    placeholderTextColor="#7A8A9E"
                    value={cinemaName}
                    onChangeText={setCinemaName}
                />

                {/* Campo: Filme */}
                <Text style={criarStyles.label}>Filme (opcional)</Text>
                <TextInput
                    style={criarStyles.input}
                    placeholder="Ex: Interestelar"
                    placeholderTextColor="#7A8A9E"
                    value={movieTitle}
                    onChangeText={setMovieTitle}
                />

                {/* Campo: Data */}
                <Text style={criarStyles.label}>Data da visita *</Text>
                <TextInput
                    style={criarStyles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#7A8A9E"
                    value={data}
                    onChangeText={handleDataChange}
                    keyboardType="numeric"
                    maxLength={10}
                />

                {/* Campo: Observações */}
                <Text style={criarStyles.label}>Observações</Text>
                <TextInput
                    style={[criarStyles.input, criarStyles.inputMultiline]}
                    placeholder="Como foi a experiência?"
                    placeholderTextColor="#7A8A9E"
                    value={observacoes}
                    onChangeText={setObservacoes}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                {/* Fotos */}
                <Text style={criarStyles.label}>Fotos ({fotos.length}/5)</Text>
                <View style={criarStyles.fotoBotoes}>
                    <TouchableOpacity style={criarStyles.fotoBtn} onPress={selecionarFotos}>
                        <Ionicons name="images-outline" size={20} color="#FFFFFF" />
                        <Text style={criarStyles.fotoBtnText}>Galeria</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={criarStyles.fotoBtn} onPress={tirarFoto}>
                        <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                        <Text style={criarStyles.fotoBtnText}>Câmera</Text>
                    </TouchableOpacity>
                </View>

                {/* Grid de fotos */}
                {fotos.length > 0 && (
                    <View style={criarStyles.fotoGrid}>
                        {fotos.map((uri, idx) => (
                            <View key={idx} style={criarStyles.fotoItem}>
                                <Image source={{ uri }} style={criarStyles.fotoImg} resizeMode="cover" />
                                <TouchableOpacity
                                    style={criarStyles.fotoRemoverBtn}
                                    onPress={() => removerFoto(idx)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Botão Salvar */}
                <TouchableOpacity
                    style={[criarStyles.salvarBtn, salvando && { opacity: 0.6 }]}
                    onPress={salvar}
                    disabled={salvando}
                >
                    {salvando ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <ActivityIndicator color="#FFFFFF" size="small" />
                            <Text style={criarStyles.salvarBtnText}>Salvando...</Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
                            <Text style={criarStyles.salvarBtnText}>Salvar Registro</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Overlay de loading */}
            {salvando && (
                <View style={criarStyles.overlay}>
                    <View style={criarStyles.overlayCard}>
                        <ActivityIndicator size="large" color="#3E9C9C" />
                        <Text style={criarStyles.overlayText}>
                            Enviando fotos e salvando...
                        </Text>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const criarStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E3D50',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 16,
        backgroundColor: '#1A2B3E',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    label: {
        color: '#B0C4DE',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#3E5063',
    },
    inputMultiline: {
        minHeight: 100,
        paddingTop: 14,
    },
    fotoBotoes: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    fotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#3E9C9C',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        flex: 1,
        justifyContent: 'center',
    },
    fotoBtnText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    fotoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    fotoItem: {
        position: 'relative',
    },
    fotoImg: {
        width: (Platform.OS === 'ios' ? 150 : 145),
        height: 120,
        borderRadius: 12,
        backgroundColor: '#1A2B3E',
    },
    fotoRemoverBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
    },
    salvarBtn: {
        backgroundColor: '#3E9C9C',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 30,
    },
    salvarBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    overlayCard: {
        backgroundColor: '#1A2B3E',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        gap: 16,
    },
    overlayText: {
        color: '#B0C4DE',
        fontSize: 14,
    },
});
