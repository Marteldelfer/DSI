// aplicativo/app/telas/ListaEventos.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';

import { styles } from '../styles';
import { Evento } from '../../src/models/Evento';
import { EventoService } from '../../src/services/EventoService';

// Tipo para as abas de filtro
type FiltroTab = 'proximos' | 'passados' | 'todos';

// Formata uma data ISO para DD/MM/AAAA às HH:MM
function formatarDataHora(isoString: string): string {
    try {
        const date = new Date(isoString);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${ano} às ${hh}:${mm}`;
    } catch {
        return '';
    }
}

function ListaEventosScreen() {
    const router = useRouter();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroAtivo, setFiltroAtivo] = useState<FiltroTab>('proximos');

    const eventoService = EventoService.getInstance();

    // Busca todos os eventos do usuário
    const fetchEventos = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedEventos = await eventoService.getAllUserEventos();
            setEventos(fetchedEventos);
        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
            Alert.alert("Erro", "Não foi possível carregar seus eventos.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Recarrega a lista ao focar na tela
    useFocusEffect(
        useCallback(() => {
            fetchEventos();
        }, [fetchEventos])
    );

    // Filtra os eventos de acordo com a aba selecionada
    const eventosFiltrados = eventos.filter(evento => {
        const agora = new Date();
        const dataEvento = new Date(evento.dataHora);

        if (filtroAtivo === 'proximos') return dataEvento >= agora;
        if (filtroAtivo === 'passados') return dataEvento < agora;
        return true; // 'todos'
    }).sort((a, b) => {
        // Próximos: ordem ascendente; Passados/Todos: ordem descendente
        if (filtroAtivo === 'proximos') {
            return new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime();
        }
        return new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
    });

    // Navega para a tela de detalhes do evento
    const navigateToDetalhes = (eventoId: string) => {
        router.push({ pathname: '/telas/DetalhesEvento', params: { eventoId } });
    };

    // Renderiza cada card de evento na lista
    const renderEventoItem = ({ item }: { item: Evento }) => {
        const isFuturo = new Date(item.dataHora) >= new Date();

        return (
            <Pressable
                style={listaStyles.eventoCard}
                onPress={() => navigateToDetalhes(item.id)}
                android_ripple={{ color: '#4A6B8A' }}
            >
                {/* Ícone de status (futuro ou passado) */}
                <View style={[listaStyles.statusIcon, { backgroundColor: isFuturo ? '#2E7D32' : '#5D4037' }]}>
                    <Ionicons
                        name={isFuturo ? "time-outline" : "checkmark-done-outline"}
                        size={22}
                        color="#FFFFFF"
                    />
                </View>

                {/* Informações do evento */}
                <View style={listaStyles.eventoInfo}>
                    <Text style={listaStyles.cinemaName} numberOfLines={1}>
                        {item.cinemaName}
                    </Text>
                    <View style={listaStyles.detailRow}>
                        <MaterialIcons name="date-range" size={14} color="#B0C4DE" />
                        <Text style={listaStyles.dataHoraText}>
                            {formatarDataHora(item.dataHora)}
                        </Text>
                    </View>
                    {item.movieTitle && (
                        <View style={listaStyles.detailRow}>
                            <MaterialIcons name="movie" size={14} color="#3E9C9C" />
                            <Text style={listaStyles.movieText} numberOfLines={1}>
                                {item.movieTitle}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Seta de navegação */}
                <Ionicons name="chevron-forward" size={20} color="#4A6B8A" />
            </Pressable>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3E9C9C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Cabeçalho */}
            <View style={listaStyles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
                </Pressable>
                <Text style={listaStyles.headerTitle}>Meus Eventos</Text>
                <View style={{ width: 26 }} />
            </View>

            {/* Abas de filtro */}
            <View style={listaStyles.tabContainer}>
                {(['proximos', 'passados', 'todos'] as FiltroTab[]).map((tab) => {
                    const isActive = filtroAtivo === tab;
                    // Labels das abas em português
                    const label = tab === 'proximos' ? 'Próximos' : tab === 'passados' ? 'Passados' : 'Todos';

                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[listaStyles.tab, isActive && listaStyles.tabAtiva]}
                            onPress={() => setFiltroAtivo(tab)}
                            activeOpacity={0.7}
                        >
                            <Text style={[listaStyles.tabText, isActive && listaStyles.tabTextAtiva]}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Lista de eventos */}
            <FlatList
                data={eventosFiltrados}
                renderItem={renderEventoItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={listaStyles.listContent}
                ListEmptyComponent={
                    <View style={listaStyles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={60} color="#4A6B8A" />
                        <Text style={listaStyles.emptyText}>Nenhum evento encontrado</Text>
                        <Text style={listaStyles.emptySubText}>
                            {filtroAtivo === 'proximos'
                                ? 'Você não tem eventos futuros agendados.'
                                : filtroAtivo === 'passados'
                                ? 'Você ainda não participou de nenhum evento.'
                                : 'Crie um novo evento no botão abaixo!'}
                        </Text>
                    </View>
                }
            />

            {/* Botão FAB para criar novo evento */}
            <Pressable
                style={listaStyles.fab}
                onPress={() => router.push('/telas/CriarEvento')}
            >
                <AntDesign name="plus" size={28} color="black" />
            </Pressable>
        </View>
    );
}

export default ListaEventosScreen;

const listaStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    // Abas de filtro
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 15,
        marginBottom: 10,
        backgroundColor: '#1A2B3E',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabAtiva: {
        backgroundColor: '#3E9C9C',
    },
    tabText: {
        color: '#B0C4DE',
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextAtiva: {
        color: '#000000',
        fontWeight: 'bold',
    },
    // Lista
    listContent: {
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 120,
    },
    // Card de evento
    eventoCard: {
        flexDirection: 'row',
        backgroundColor: '#1A2B3E',
        borderRadius: 14,
        marginBottom: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#4A6B8A',
        elevation: 3,
        shadowColor: '#000',
        shadowRadius: 4,
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
    },
    statusIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    eventoInfo: {
        flex: 1,
        marginRight: 8,
    },
    cinemaName: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    dataHoraText: {
        color: '#B0C4DE',
        fontSize: 13,
        marginLeft: 5,
    },
    movieText: {
        color: '#3E9C9C',
        fontSize: 13,
        marginLeft: 5,
        fontWeight: '500',
    },
    // Estado vazio
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#B0C4DE',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 16,
        fontWeight: '600',
    },
    emptySubText: {
        color: '#4A6B8A',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    // Botão FAB (Floating Action Button)
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 25,
        bottom: 25,
        backgroundColor: '#3E9C9C',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
    },
});
