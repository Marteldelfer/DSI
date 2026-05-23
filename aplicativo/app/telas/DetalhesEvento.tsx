// aplicativo/app/telas/DetalhesEvento.tsx
import React, { useState, useCallback } from 'react';
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
    Platform,
    SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons, Feather, MaterialIcons, AntDesign } from '@expo/vector-icons';

import { styles } from '../styles';
import { Evento } from '../../src/models/Evento';
import { Movie } from '../../src/models/Movie';
import { EventoService } from '../../src/services/EventoService';
import { MovieService } from '../../src/services/MovieService';
import OSMMapView, { OSMMarker } from '../../src/componentes/OSMMapView';

// Formata uma data ISO para DD/MM/AAAA
function formatarData(isoString: string): string {
    try {
        const date = new Date(isoString);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
    } catch {
        return '';
    }
}

// Formata uma data ISO para HH:MM
function formatarHora(isoString: string): string {
    try {
        const date = new Date(isoString);
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    } catch {
        return '';
    }
}

// Converte data (DD/MM/AAAA) e hora (HH:MM) para ISO 8601
function converterParaISO(dataStr: string, horaStr: string): string | null {
    const partes = dataStr.split('/');
    if (partes.length !== 3) return null;
    const [dia, mes, ano] = partes;
    if (!dia || !mes || !ano || ano.length !== 4) return null;

    const horaPartes = horaStr.split(':');
    if (horaPartes.length !== 2) return null;
    const [hh, mm] = horaPartes;
    if (!hh || !mm) return null;

    const diaNum = parseInt(dia, 10);
    const mesNum = parseInt(mes, 10);
    const anoNum = parseInt(ano, 10);
    const hhNum = parseInt(hh, 10);
    const mmNum = parseInt(mm, 10);

    if (isNaN(diaNum) || isNaN(mesNum) || isNaN(anoNum) || isNaN(hhNum) || isNaN(mmNum)) return null;
    if (mesNum < 1 || mesNum > 12 || diaNum < 1 || diaNum > 31) return null;
    if (hhNum < 0 || hhNum > 23 || mmNum < 0 || mmNum > 59) return null;

    const dateObj = new Date(anoNum, mesNum - 1, diaNum, hhNum, mmNum);
    return dateObj.toISOString();
}

function DetalhesEventoScreen() {
    const router = useRouter();
    const { eventoId } = useLocalSearchParams<{ eventoId: string }>();

    const [evento, setEvento] = useState<Evento | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Campos de edição
    const [editedCinemaName, setEditedCinemaName] = useState('');
    const [editedData, setEditedData] = useState('');
    const [editedHora, setEditedHora] = useState('');
    const [editedNotas, setEditedNotas] = useState('');
    const [editedMovie, setEditedMovie] = useState<{ id: string | null; title: string | null }>({ id: null, title: null });

    // Modal de seleção de filme na edição
    const [showMovieModal, setShowMovieModal] = useState(false);
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [loadingMovies, setLoadingMovies] = useState(false);

    const eventoService = EventoService.getInstance();
    const movieService = MovieService.getInstance();

    // Busca os detalhes do evento
    const fetchEvento = useCallback(async () => {
        if (!eventoId) return;
        setLoading(true);
        try {
            const fetchedEvento = await eventoService.getEventoById(eventoId);
            setEvento(fetchedEvento || null);

            if (fetchedEvento) {
                setEditedCinemaName(fetchedEvento.cinemaName);
                setEditedData(formatarData(fetchedEvento.dataHora));
                setEditedHora(formatarHora(fetchedEvento.dataHora));
                setEditedNotas(fetchedEvento.notas || '');
                setEditedMovie({ id: fetchedEvento.movieId, title: fetchedEvento.movieTitle });
            } else {
                Alert.alert("Erro", "Evento não encontrado.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes do evento:", error);
            Alert.alert("Erro", "Não foi possível carregar os detalhes do evento.");
        } finally {
            setLoading(false);
        }
    }, [eventoId]);

    // Recarrega ao focar na tela
    useFocusEffect(useCallback(() => {
        fetchEvento();
    }, [fetchEvento]));

    // Carrega filmes para o modal de edição
    const fetchMovies = async () => {
        setLoadingMovies(true);
        try {
            const movies = await movieService.getAllMovies();
            setAllMovies(movies);
            setFilteredMovies(movies);
        } catch (error) {
            console.error("Erro ao carregar filmes:", error);
        } finally {
            setLoadingMovies(false);
        }
    };

    // Filtra filmes no modal
    React.useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredMovies(allMovies);
        } else {
            setFilteredMovies(
                allMovies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
    }, [searchTerm, allMovies]);

    // Salva as alterações do evento
    const handleSalvar = async () => {
        if (!evento || !editedCinemaName.trim()) {
            Alert.alert("Atenção", "O nome do cinema não pode ser vazio.");
            return;
        }

        const dataHoraISO = converterParaISO(editedData.trim(), editedHora.trim());
        if (!dataHoraISO) {
            Alert.alert("Atenção", "Data ou hora em formato inválido. Use DD/MM/AAAA e HH:MM.");
            return;
        }

        try {
            await eventoService.updateEvento(evento.id, {
                cinemaName: editedCinemaName.trim(),
                dataHora: dataHoraISO,
                notas: editedNotas.trim() || null,
                movieId: editedMovie.id,
                movieTitle: editedMovie.title,
            });
            Alert.alert("Sucesso", "Evento atualizado!");
            setIsEditing(false);
            fetchEvento();
        } catch (error) {
            console.error("Erro ao atualizar evento:", error);
            Alert.alert("Erro", "Não foi possível atualizar o evento.");
        }
    };

    // Exclui o evento com confirmação
    const handleExcluir = () => {
        if (!evento) return;
        Alert.alert(
            "Excluir Evento",
            `Tem certeza que deseja excluir o evento em "${evento.cinemaName}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            await eventoService.deleteEvento(evento.id);
                            Alert.alert("Sucesso", "Evento excluído.");
                            router.back();
                        } catch (error) {
                            console.error("Erro ao excluir evento:", error);
                            Alert.alert("Erro", "Não foi possível excluir o evento.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    // Seleciona um filme no modal de edição
    const handleSelectMovie = (movie: Movie) => {
        setEditedMovie({ id: movie.id, title: movie.title });
        setShowMovieModal(false);
        setSearchTerm('');
    };

    // Verifica se o evento é no futuro
    const isFuturo = evento ? new Date(evento.dataHora) >= new Date() : false;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    if (!evento) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={detalhesStyles.emptyText}>Evento não encontrado.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Cabeçalho */}
            <View style={detalhesStyles.header}>
                <Pressable onPress={() => router.back()} style={{ position: 'absolute', left: 20, top: 50, zIndex: 1 }}>
                    <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
                </Pressable>
                <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 60 }}>
                    <Text style={detalhesStyles.headerTitle} numberOfLines={1}>Detalhes do Evento</Text>
                </View>
                <Pressable onPress={() => setIsEditing(!isEditing)} style={detalhesStyles.headerButton}>
                    <Feather name={isEditing ? "x-circle" : "edit"} size={22} color={isEditing ? "#FFC107" : "#3E9C9C"} />
                </Pressable>
                <Pressable onPress={handleExcluir} style={detalhesStyles.headerButton}>
                    <Feather name="trash-2" size={22} color="#FF6347" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={detalhesStyles.scrollContent}>
                {isEditing ? (
                    /* ===== MODO EDIÇÃO ===== */
                    <View style={detalhesStyles.editContainer}>
                        <Text style={detalhesStyles.label}>Nome do Cinema</Text>
                        <TextInput
                            value={editedCinemaName}
                            onChangeText={setEditedCinemaName}
                            style={detalhesStyles.inputField}
                        />

                        {/* Data e Hora na edição */}
                        <View style={detalhesStyles.row}>
                            <View style={detalhesStyles.halfColumn}>
                                <Text style={detalhesStyles.label}>Data</Text>
                                <TextInput
                                    value={editedData}
                                    onChangeText={setEditedData}
                                    style={detalhesStyles.inputField}
                                    placeholder="DD/MM/AAAA"
                                    placeholderTextColor="grey"
                                    keyboardType="numeric"
                                    maxLength={10}
                                />
                            </View>
                            <View style={detalhesStyles.halfColumn}>
                                <Text style={detalhesStyles.label}>Hora</Text>
                                <TextInput
                                    value={editedHora}
                                    onChangeText={setEditedHora}
                                    style={detalhesStyles.inputField}
                                    placeholder="HH:MM"
                                    placeholderTextColor="grey"
                                    keyboardType="numeric"
                                    maxLength={5}
                                />
                            </View>
                        </View>

                        {/* Seleção de filme na edição */}
                        <Text style={detalhesStyles.label}>Filme</Text>
                        <Pressable
                            style={detalhesStyles.selectButton}
                            onPress={() => {
                                setShowMovieModal(true);
                                if (allMovies.length === 0) fetchMovies();
                            }}
                        >
                            {editedMovie.title ? (
                                <View style={detalhesStyles.selectedMovieRow}>
                                    <MaterialIcons name="movie-filter" size={20} color="#3E9C9C" />
                                    <Text style={detalhesStyles.selectedMovieText} numberOfLines={1}>{editedMovie.title}</Text>
                                    <Pressable onPress={() => setEditedMovie({ id: null, title: null })}>
                                        <AntDesign name="closecircle" size={18} color="#FF6347" />
                                    </Pressable>
                                </View>
                            ) : (
                                <View style={detalhesStyles.selectedMovieRow}>
                                    <AntDesign name="pluscircleo" size={18} color="#3E9C9C" />
                                    <Text style={detalhesStyles.selectButtonText}>Selecionar filme</Text>
                                </View>
                            )}
                        </Pressable>

                        <Text style={detalhesStyles.label}>Notas</Text>
                        <TextInput
                            style={[detalhesStyles.inputField, detalhesStyles.textArea]}
                            value={editedNotas}
                            onChangeText={setEditedNotas}
                            placeholder="Notas sobre o evento..."
                            placeholderTextColor="grey"
                            multiline
                        />

                        <Pressable style={detalhesStyles.saveButton} onPress={handleSalvar}>
                            <Text style={detalhesStyles.saveButtonText}>Salvar Alterações</Text>
                        </Pressable>
                    </View>
                ) : (
                    /* ===== MODO VISUALIZAÇÃO ===== */
                    <>
                        {/* Card com informações principais */}
                        <View style={detalhesStyles.infoCard}>
                            {/* Badge de status */}
                            <View style={[detalhesStyles.statusBadge, { backgroundColor: isFuturo ? '#2E7D32' : '#5D4037' }]}>
                                <Ionicons name={isFuturo ? "time" : "checkmark-done"} size={14} color="#FFFFFF" />
                                <Text style={detalhesStyles.statusText}>{isFuturo ? 'Próximo' : 'Realizado'}</Text>
                            </View>

                            {/* Nome do cinema */}
                            <View style={detalhesStyles.infoRow}>
                                <Ionicons name="business" size={20} color="#3E9C9C" />
                                <Text style={detalhesStyles.infoLabel}>Cinema</Text>
                            </View>
                            <Text style={detalhesStyles.infoValue}>{evento.cinemaName}</Text>

                            {/* Data e hora */}
                            <View style={detalhesStyles.infoRow}>
                                <MaterialIcons name="date-range" size={20} color="#3E9C9C" />
                                <Text style={detalhesStyles.infoLabel}>Data e Hora</Text>
                            </View>
                            <Text style={detalhesStyles.infoValue}>
                                {formatarData(evento.dataHora)} às {formatarHora(evento.dataHora)}
                            </Text>

                            {/* Filme vinculado */}
                            {evento.movieTitle && (
                                <>
                                    <View style={detalhesStyles.infoRow}>
                                        <MaterialIcons name="movie" size={20} color="#3E9C9C" />
                                        <Text style={detalhesStyles.infoLabel}>Filme</Text>
                                    </View>
                                    <Pressable
                                        onPress={() => {
                                            if (evento.movieId) {
                                                // Navega para a tela de detalhes do filme
                                                router.push({
                                                    pathname: '/telas/DetalhesFilmeExterno',
                                                    params: { movieId: evento.movieId },
                                                });
                                            }
                                        }}
                                    >
                                        <Text style={[detalhesStyles.infoValue, evento.movieId && detalhesStyles.linkText]}>
                                            {evento.movieTitle} {evento.movieId ? '→' : ''}
                                        </Text>
                                    </Pressable>
                                </>
                            )}

                            {/* Notas */}
                            {evento.notas && (
                                <>
                                    <View style={detalhesStyles.infoRow}>
                                        <MaterialIcons name="notes" size={20} color="#3E9C9C" />
                                        <Text style={detalhesStyles.infoLabel}>Notas</Text>
                                    </View>
                                    <Text style={detalhesStyles.notasText}>{evento.notas}</Text>
                                </>
                            )}
                        </View>

                        {/* Mini-mapa com localização do cinema */}
                        {Platform.OS !== 'web' && evento.cinemaLat !== 0 && evento.cinemaLon !== 0 && (
                            <View style={detalhesStyles.mapContainer}>
                                <View style={detalhesStyles.infoRow}>
                                    <Ionicons name="location" size={20} color="#3E9C9C" />
                                    <Text style={detalhesStyles.infoLabel}>Localização</Text>
                                </View>
                                <OSMMapView
                                    style={detalhesStyles.map}
                                    initialRegion={{
                                        latitude: evento.cinemaLat,
                                        longitude: evento.cinemaLon,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    }}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    markers={[{
                                        id: 'cinema-marker',
                                        latitude: evento.cinemaLat,
                                        longitude: evento.cinemaLon,
                                        title: evento.cinemaName,
                                    }]}
                                />
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Modal de seleção de filme (para edição) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showMovieModal}
                onRequestClose={() => setShowMovieModal(false)}
            >
                <View style={detalhesStyles.modalBackground}>
                    <View style={detalhesStyles.modalContainer}>
                        <View style={detalhesStyles.modalHeader}>
                            <Text style={detalhesStyles.modalTitle}>Selecionar Filme</Text>
                            <Pressable onPress={() => setShowMovieModal(false)}>
                                <AntDesign name="closecircle" size={24} color="#eaeaea" />
                            </Pressable>
                        </View>
                        <TextInput
                            style={detalhesStyles.modalSearchInput}
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
                                        style={detalhesStyles.modalMovieItem}
                                        onPress={() => handleSelectMovie(item)}
                                    >
                                        <MaterialIcons name="movie" size={22} color="#3E9C9C" />
                                        <View style={detalhesStyles.modalMovieInfo}>
                                            <Text style={detalhesStyles.modalMovieTitle} numberOfLines={1}>{item.title}</Text>
                                            <Text style={detalhesStyles.modalMovieYear}>{item.releaseYear || 'Sem ano'}</Text>
                                        </View>
                                        <MaterialIcons name="add-circle-outline" size={24} color="#3E9C9C" />
                                    </Pressable>
                                )}
                                ListEmptyComponent={
                                    <Text style={detalhesStyles.emptyText}>Nenhum filme encontrado.</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default DetalhesEventoScreen;

const detalhesStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: 'transparent',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerButton: {
        padding: 5,
        marginLeft: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    // Card de informações principal
    infoCard: {
        backgroundColor: '#1A2B3E',
        borderRadius: 16,
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 16,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 4,
    },
    infoLabel: {
        color: '#B0C4DE',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        color: '#FFFFFF',
        fontSize: 17,
        marginLeft: 28,
        marginBottom: 2,
    },
    linkText: {
        color: '#3E9C9C',
        textDecorationLine: 'underline',
    },
    notasText: {
        color: '#B0C4DE',
        fontSize: 15,
        marginLeft: 28,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    // Mini-mapa
    mapContainer: {
        backgroundColor: '#1A2B3E',
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    map: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 10,
    },
    // Modo edição
    editContainer: {
        backgroundColor: '#1A2B3E',
        borderRadius: 16,
        padding: 20,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#4A6B8A',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 15,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    inputField: {
        fontSize: 16,
        backgroundColor: '#2E3D50',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        minHeight: 50,
        color: '#eaeaea',
        marginBottom: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfColumn: {
        flex: 1,
    },
    selectButton: {
        backgroundColor: '#2E3D50',
        borderColor: '#4A6B8A',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        minHeight: 50,
        justifyContent: 'center',
        marginBottom: 15,
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
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#B0C4DE',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 40,
    },
    // Modal
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
});
