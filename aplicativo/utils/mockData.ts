// aplicativo/utils/mockData.ts

// Tipo para o status de avaliação do filme
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

// Interface para um filme
export interface Movie {
  id: string;
  title: string;
  posterUrl: string | null;
  releaseYear?: string;
  director?: string;
  duration?: string; // Duração em minutos, como string
  genre?: string;
  status?: MovieStatus; // Adicionando campo de status opcional
  isExternal?: boolean; // Novo campo para identificar filmes externos
}

// Interface para uma playlist
export interface Playlist {
  id: string;
  name: string;
  movieIds: string[];
  coverImageUrl?: string | null;
}

export interface Avaliacao {
  id?: string;
  movieId: string;
  content?: string;
  review: "like" | "dislike" | "favorite";
}

export interface Comentario {
  id: string;
  avaliacaoId: string;
  content: string;
}

// Mock dos filmes existentes
// **MUDANÇA AQUI: de 'const' para 'let'**
export let mockMovies: Movie[] = [
  { id: "100", title: "Lock, Stock and Two Smoking Barrels", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/6pJB2t3MbQUy9m5pFIBHXLqnqNd.jpg", status: "like2", isExternal: false },
  { id: "101", title: "Léon: The Professional", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/yI6X2cCM5YPJtxMhUd3dPGqDAhw.jpg", status: "dislike2", isExternal: false },
  { id: "102", title: "Open Hearts", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/hOrV2fCw2kmSiS4ZMGFPfXqr3lt.jpg", status: "staro", isExternal: false },
  { id: "103", title: "Taxi Driver", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/ekstpH614fwDX8DUln1a2Opz0N8.jpg", isExternal: false },
  { id: "104", title: "Run Lola Run", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/u34YzbFvX067IvJX1ocI4JBvYPa.jpg", isExternal: false },
  { id: "105", title: "Back to the Future", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg", isExternal: false },
  { id: "106", title: "Predator", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/k3mW4qfJo6SKqe6laRyNGnbB9n5.jpg", isExternal: false },
  { id: "107", title: "Snatch", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/8KSDI7ijEv7QVZdIyrLw5Gnhhr8.jpg", isExternal: false },
  { id: "108", title: "Three Colors: Blue", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/33wsWxzsNstI8N7dvuwzFmj1qBd.jpg", isExternal: false },
  { id: "109", title: "Three Colors: White", posterUrl: "http://image.tmdb.org/t/p/w600_and_h900_bestv2/fdIet3NSa27gobMbaUml66oCQNT.jpg", isExternal: false },
];

// Armazenamento em memória das playlists (sem alterações)
let mockPlaylists: Playlist[] = [
  { id: "p1", name: "Minhas Favoritas", movieIds: ["100", "103"], coverImageUrl: mockMovies.find(m => m.id === "100")?.posterUrl },
  { id: "p2", name: "Ação e Aventura", movieIds: ["101", "105"], coverImageUrl: mockMovies.find(m => m.id === "101")?.posterUrl },
];

// Armazenamento em memória das avaliações
let mockAvaliacoes: Avaliacao[] = [];

// Armazenamento em memória dos comentarios
let mockComentarios: Comentario[] = []

// Funções CRUD para as playlists (sem alterações)
export function getPlaylists(): Playlist[] {
    return [...mockPlaylists];
}

export function addPlaylist(playlist: Playlist): void {
    mockPlaylists.push(playlist);
}

export function updatePlaylist(updatedPlaylist: Playlist): void {
    mockPlaylists = mockPlaylists.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p);
}

export function deletePlaylist(playlistId: string): void {
    mockPlaylists = mockPlaylists.filter(p => p.id !== playlistId);
}

// Funções CRUD para Filmes (incluindo filmes externos)
export function getMovieById(id: string): Movie | undefined {
    return mockMovies.find(movie => movie.id === id);
}

export function addExternalMovie(movie: Movie): void {
    // Garante que isExternal seja true para filmes adicionados externamente
    mockMovies.push({ ...movie, isExternal: true });
    // TODO: Em uma implementação real com Firebase, você faria uma chamada para salvar no Firestore aqui.
    console.log("Filme externo adicionado (mock):", movie);
}

export function updateMovie(updatedMovie: Movie): void {
    const index = mockMovies.findIndex(m => m.id === updatedMovie.id);
    if (index !== -1) {
        // Mantém a propriedade isExternal original se não for fornecida na atualização
        const originalMovie = mockMovies[index];
        mockMovies[index] = {
            ...originalMovie, // Mantém propriedades existentes
            ...updatedMovie, // Sobrescreve com as atualizadas
            isExternal: originalMovie.isExternal || updatedMovie.isExternal || false // Garante que isExternal seja mantido ou definido
        };
    }
    // TODO: Em uma implementação real com Firebase, você faria uma chamada para atualizar no Firestore aqui.
    console.log("Filme atualizado (mock):", updatedMovie);
}

export function deleteMovie(movieId: string): void {
    mockMovies = mockMovies.filter(movie => movie.id !== movieId);
    // Também remova o filme de quaisquer playlists
    mockPlaylists = mockPlaylists.map(playlist => ({
        ...playlist,
        movieIds: playlist.movieIds.filter(id => id !== movieId),
    }));
    // TODO: Em uma implementação real com Firebase, você faria uma chamada para deletar no Firestore aqui.
    console.log("Filme excluído (mock):", movieId, "Removido de playlists.");
}

// Função para obter filmes com base no filtro e status de avaliação
export type MovieFilterType = 'all' | 'external' | 'app_db';

export function getFilteredAndRatedMovies(filterType: MovieFilterType = 'all'): Movie[] {
    let filteredBySource: Movie[] = [];

    switch (filterType) {
        case 'all':
            filteredBySource = mockMovies;
            break;
        case 'external':
            filteredBySource = mockMovies.filter(movie => movie.isExternal === true);
            break;
        case 'app_db':
            // Filmes do "banco de dados do app" são aqueles que não são externos
            filteredBySource = mockMovies.filter(movie => movie.isExternal === false || movie.isExternal === undefined);
            break;
        default:
            filteredBySource = mockMovies;
            break;
    }
    // Agora filtra apenas os filmes que têm um status de avaliação
    return filteredBySource.filter(movie => movie.status !== undefined && movie.status !== null);
}

//CRUD de avaliações
export function getAvaliacoes() {
  return [...mockAvaliacoes];
}

export function createAvaliacao(avaliacao: Avaliacao): void {
  if (mockAvaliacoes.length > 0) {
    avaliacao.id = (parseInt(mockAvaliacoes[mockAvaliacoes.length - 1].id) + 1).toString();
  } else {
    avaliacao.id = "0"
  }
  mockAvaliacoes.push(avaliacao);
}

export function updateAvaliacao(newAvaliacao: Avaliacao): void {
  let avaliacao = getAvaliacaoById(newAvaliacao.id as string);
  avaliacao = {
    ...avaliacao,
    content: newAvaliacao.content,
  }
}

export function deleteAvaliacao(id: string): void {
  mockAvaliacoes.filter(movie => movie.id !== id);
}

export function getAvaliacaoById(id: string): Avaliacao {
  let index = mockAvaliacoes.findIndex(a => a.id === id);
  return mockAvaliacoes[index];
}

export function getAvaliacoesByMovieId(movieId: string) {
  return mockAvaliacoes.filter(avaliacao => avaliacao.movieId === movieId)
}

// CRUD Comentario
export function getComentariosByAvaliacaoId(avaliacaoId: string): Comentario[] {
  return mockComentarios.filter(c => c.avaliacaoId === avaliacaoId);
}

export function createComentario(avaliacaoId: string, content: string) {
  let index = "0"
  if (mockComentarios.length > 0) {
    index = (parseInt(mockComentarios[mockComentarios.length - 1].id) + 1).toString();
  }
  mockComentarios.push({id: index, avaliacaoId: avaliacaoId, content: content})
}