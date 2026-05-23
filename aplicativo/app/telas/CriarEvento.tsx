// aplicativo/app/telas/CriarEvento.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Modal,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { EventoService } from '../../src/services/EventoService';
import { MovieService } from '../../src/services/MovieService';
import { Movie } from '../../src/models/Movie';

function CriarEventoScreen() {
    const router = useRouter();
    // Parâmetros opcionais vindos do mapa
    const params = useLocalSearchParams<{
        cinemaName?: string;
        cinemaLat?: string;
        cinemaLon?: string;
    }>();

    // Estados dos campos do formulário
    const [cinemaName, setCinemaName] = useState(params.cinemaName || '');
    const [cinemaLat, setCinemaLat] = useState(params.cinemaLat || '');
    const [cinemaLon, setCinemaLon] = useState(params.cinemaLon || '');
    const [data, setData] = useState(''); // DD/MM/AAAA
    const [hora, setHora] = useState(''); // HH:MM
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [notas, setNotas] = useState('');
    const [loading, setLoading] = useState(false);

    // Estados do modal de seleção de filme
    const [showMovieModal, setShowMovieModal] = useState(false);
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [loadingMovies, setLoadingMovies] = useState(false);

    // Verifica se o cinema veio pré-preenchido via params do mapa
    const cinemaFromMap = !!(params.cinemaName && params.cinemaLat && params.cinemaLon);

    const eventoService = EventoService.getInstance();
    const movieService = MovieService.getInstance();

    // Carrega os filmes do usuário ao abrir o modal
    const fetchMovies = async () => {
        setLoadingMovies(true);
        try {
            const movies = await movieService.getAllMovies();
            setAllMovies(movies);
            setFilteredMovies(movies);
        } catch (error) {
            console.error("Erro ao carregar filmes:", error);
            Alert.alert("Erro", "Não foi possível carregar seus filmes.");
        } finally {
            setLoadingMovies(false);
        }
    };

    // Filtra a lista de filmes conforme o usuário digita no modal
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredMovies(allMovies);
        } else {
            setFilteredMovies(
                allMovies.filter(movie =>
                    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, allMovies]);

    // Converte data (DD/MM/AAAA) e hora (HH:MM) para ISO 8601
    const converterParaISO = (dataStr: string, horaStr: string): string | null => {
        const partes = dataStr.split('/');
        if (partes.length !== 3) return null;

        const [dia, mes, ano] = partes;
        if (!dia || !mes || !ano || ano.length !== 4) return null;

        const horaPartes = horaStr.split(':');
        if (horaPartes.length !== 2) return null;

        const [hh, mm] = horaPartes;
        if (!hh || !mm) return null;

        // Valida os valores numéricos
        const diaNum = parseInt(dia, 10);
        const mesNum = parseInt(mes, 10);
        const anoNum = parseInt(ano, 10);
        const hhNum = parseInt(hh, 10);
        const mmNum = parseInt(mm, 10);

        if (isNaN(diaNum) || isNaN(mesNum) || isNaN(anoNum) || isNaN(hhNum) || isNaN(mmNum)) return null;
        if (mesNum < 1 || mesNum > 12 || diaNum < 1 || diaNum > 31) return null;
        if (hhNum < 0 || hhNum > 23 || mmNum < 0 || mmNum > 59) return null;

        // Cria a data no formato ISO 8601
        const dateObj = new Date(anoNum, mesNum - 1, diaNum, hhNum, mmNum);
        return dateObj.toISOString();
    };

    // Handler para salvar o evento
    const handleSalvar = async () => {
        // Validação dos campos obrigatórios
        if (!cinemaName.trim()) {
            Alert.alert("Atenção", "O nome do cinema é obrigatório.");
            return;
        }

        if (!data.trim() || !hora.trim()) {
            Alert.alert("Atenção", "Data e hora são obrigatórios.");
            return;
        }

        const dataHoraISO = converterParaISO(data.trim(), hora.trim());
        if (!dataHoraISO) {
            Alert.alert("Atenção", "Data ou hora em formato inválido. Use DD/MM/AAAA e HH:MM.");
            return;
        }

        // Define as coordenadas (padrão 0,0 se não informadas)
        const lat = cinemaLat ? parseFloat(cinemaLat) : 0;
        const lon = cinemaLon ? parseFloat(cinemaLon) : 0;

        setLoading(true);
        try {
            await eventoService.createEvento({
                cinemaName: cinemaName.trim(),
                cinemaLat: lat,
                cinemaLon: lon,
                movieId: selectedMovie?.id || null,
                movieTitle: selectedMovie?.title || null,
                dataHora: dataHoraISO,
                notas: notas.trim() || null,
            });
            Alert.alert("Sucesso", "Evento criado com sucesso!");
            router.back();
        } catch (error) {
            console.error("Erro ao criar evento:", error);
            Alert.alert("Erro", "Não foi possível criar o evento. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // Seleciona um filme no modal e fecha o modal
    const handleSelectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
        setShowMovieModal(false);
        setSearchTerm('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Cabeçalho com botão voltar */}
                <View style={eventoStyles.header}>
                    <Pressable onPress={() => router.back()} style={eventoStyles.backButton}>
                        <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
                    </Pressable>
                    <Text style={eventoStyles.headerTitle}>Novo Evento</Text>
                    <View style={{ width: 26 }} />
                </View>

                <ScrollView
                    style={eventoStyles.formContainer}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Campo Cinema */}
                    <Text style={eventoStyles.label}>
                        <Ionicons name="business" size={16} color="#3E9C9C" /> Cinema
                    </Text>
                    {cinemaFromMap ? (
                        // Cinema pré-preenchido pelo mapa (somente leitura visual)
                        <View style={eventoStyles.readOnlyField}>
                            <Ionicons name="location" size={18} color="#3E9C9C" />
                            <Text style={eventoStyles.readOnlyText}>{cinemaName}</Text>
                        </View>
                    ) : (
                        // Campo editável para digitar o nome do cinema
                        <View style={eventoStyles.inputWrapper}>
                            <TextInput
                                style={eventoStyles.inputField}
                                placeholder="Nome do cinema"
                                placeholderTextColor="#B0C4DE"
                                value={cinemaName}
                                onChangeText={setCinemaName}
                            />
                        </View>
                    )}

                    {/* Campos Data e Hora lado a lado */}
                    <View style={eventoStyles.row}>
                        <View style={eventoStyles.halfColumn}>
                            <Text style={eventoStyles.label}>
                                <MaterialIcons name="date-range" size={16} color="#3E9C9C" /> Data
                            </Text>
                            <View style={eventoStyles.inputWrapper}>
                                <TextInput
                                    style={eventoStyles.inputField}
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor="#B0C4DE"
                                    value={data}
                                    onChangeText={setData}
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            </View>
                        </View>
                        <View style={eventoStyles.halfColumn}>
                            <Text style={eventoStyles.label}>
                                <Ionicons name="time" size={16} color="#3E9C9C" /> Hora
                            </Text>
                            <View style={eventoStyles.inputWrapper}>
                                <TextInput
                                    style={eventoStyles.inputField}
                                    placeholder="HH:MM"
                                    placeholderTextColor="#B0C4DE"
                                    value={hora}
                                    onChangeText={setHora}
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Botão para selecionar filme */}
                    <Text style={eventoStyles.label}>
                        <MaterialIcons name="movie" size={16} color="#3E9C9C" /> Filme (Opcional)
                    </Text>
                    <Pressable
                        style={eventoStyles.selectButton}
                        onPress={() => {
                            setShowMovieModal(true);
                            if (allMovies.length === 0) fetchMovies();
                        }}
                    >
                        {selectedMovie ? (
                            <View style={eventoStyles.selectedMovieRow}>
                                <MaterialIcons name="movie-filter" size={20} color="#3E9C9C" />
                                <Text style={eventoStyles.selectedMovieText} numberOfLines={1}>
                                    {selectedMovie.title}
                                </Text>
                                <Pressable onPress={() => setSelectedMovie(null)}>
                                    <AntDesign name="closecircle" size={18} color="#FF6347" />
                                </Pressable>
                            </View>
                        ) : (
                            <View style={eventoStyles.selectedMovieRow}>
                                <AntDesign name="pluscircleo" size={18} color="#3E9C9C" />
                                <Text style={eventoStyles.selectButtonText}>Selecionar filme</Text>
                            </View>
                        )}
                    </Pressable>

                    {/* Campo Notas */}
                    <Text style={eventoStyles.label}>
                        <MaterialIcons name="notes" size={16} color="#3E9C9C" /> Notas (Opcional)
                    </Text>
                    <View style={eventoStyles.inputWrapper}>
                        <TextInput
                            style={[eventoStyles.inputField, eventoStyles.textArea]}
                            placeholder="Adicione notas sobre o evento..."
                            placeholderTextColor="#B0C4DE"
                            multiline
                            numberOfLines={4}
                            value={notas}
                            onChangeText={setNotas}
                        />
                    </View>

                    {/* Botão Salvar */}
                    <Pressable
                        style={eventoStyles.saveButton}
                        onPress={handleSalvar}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="black" />
                        ) : (
                            <Text style={eventoStyles.saveButtonText}>Criar Evento</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal de seleção de filme */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showMovieModal}
                onRequestClose={() => setShowMovieModal(false)}
            >
                <View style={eventoStyles.modalBackground}>
                    <View style={eventoStyles.modalContainer}>
                        <View style={eventoStyles.modalHeader}>
                            <Text style={eventoStyles.modalTitle}>Selecionar Filme</Text>
                            <Pressable onPress={() => setShowMovieModal(false)}>
                                <AntDesign name="closecircle" size={24} color="#eaeaea" />
                            </Pressable>
                        </View>
                        <TextInput
                            style={eventoStyles.modalSearchInput}
                            placeholder="Buscar nos seus filmes..."
                            placeholderTextColor="grey"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {loadingMovies ? (
                            <ActivityIndicator size="large" color="#3E9C9C" style={{ marginTop: 40 }} />
                        ) : (
                            <FlatList
                                data={filteredMovies}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <Pressable
                                        style={eventoStyles.modalMovieItem}
                                        onPress={() => handleSelectMovie(item)}
                                    >
                                        <MaterialIcons name="movie" size={22} color="#3E9C9C" />
                                        <View style={eventoStyles.modalMovieInfo}>
                                            <Text style={eventoStyles.modalMovieTitle} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                            <Text style={eventoStyles.modalMovieYear}>
                                                {item.releaseYear || 'Sem ano'}
                                            </Text>
                                        </View>
                                        <MaterialIcons name="add-circle-outline" size={24} color="#3E9C9C" />
                                    </Pressable>
                                )}
                                ListEmptyComponent={
                                    <Text style={eventoStyles.emptyText}>Nenhum filme encontrado.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default CriarEventoScreen;

const eventoStyles = StyleSheet.create({
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
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    formContainer: {
        padding: 20,
        flex: 1,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 15,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputWrapper: {
        backgroundColor: 'white',
        borderRadius: 26,
        marginBottom: 20,
        overflow: 'hidden',
    },
    inputField: {
        fontSize: 16,
        paddingHorizontal: 18,
        minHeight: 50,
        color: '#1A2B3E',
    },
    textArea: {
        height: 110,
        textAlignVertical: 'top',
        paddingTop: 14,
    },
    readOnlyField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A2B3E',
        borderRadius: 26,
        paddingHorizontal: 18,
        minHeight: 50,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#3E9C9C',
    },
    readOnlyText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfColumn: {
        flex: 1,
    },
    selectButton: {
        backgroundColor: '#1A2B3E',
        borderRadius: 26,
        paddingHorizontal: 18,
        minHeight: 50,
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    selectButtonText: {
        color: '#B0C4DE',
        fontSize: 16,
        marginLeft: 10,
    },
    selectedMovieRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedMovieText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#3E9C9C',
        padding: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Estilos do Modal
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    modalContainer: {
        width: '95%',
        height: '90%',
        backgroundColor: '#2E3D50',
        borderRadius: 15,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        color: '#eaeaea',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalSearchInput: {
        marginBottom: 15,
        backgroundColor: '#1A2B3E',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 45,
        color: '#eaeaea',
        fontSize: 16,
    },
    modalMovieItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#4A6B8A',
    },
    modalMovieInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 10,
    },
    modalMovieTitle: {
        color: '#eaeaea',
        fontSize: 15,
    },
    modalMovieYear: {
        color: '#b0b0b0',
        fontSize: 12,
    },
    emptyText: {
        color: '#B0C4DE',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 40,
    },
});
