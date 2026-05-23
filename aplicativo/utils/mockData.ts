// aplicativo/utils/mockData.ts
// Este arquivo agora contém apenas tipos auxiliares ou pode ser removido
// após a migração completa para as classes e serviços de OO.

// Se ainda precisar de MovieStatus em algum lugar que não use a classe Movie
export type MovieStatus = "like2" | "dislike2" | "staro" | null;

// Remova todas as interfaces (Movie, Playlist, Avaliacao, Comentario, Tags)
// Elas foram substituídas por classes em:
// aplicativo/src/models/Movie.ts
// aplicativo/src/models/Playlist.ts
// aplicativo/src/models/Review.ts
// aplicativo/src/models/Comment.ts
// aplicativo/src/models/Tag.ts

// Remova todas as variáveis de mock de dados (mockMovies, mockPlaylists, etc.)
// Elas foram movidas para dentro dos serviços correspondentes como caches em memória.

// Remova todas as funções de mock (getPlaylists, addPlaylist, createAvaliacao, etc.)
// Elas foram substituídas por métodos nas classes de serviço:
// aplicativo/src/services/MovieService.ts
// aplicativo/src/services/ReviewService.ts
// aplicativo/src/services/CommentService.ts
// aplicativo/src/services/PlaylistService.ts
// aplicativo/src/services/TagService.ts

// O arquivo mockData.ts deve ficar vazio ou conter apenas exportações de tipos
// que não são diretamente parte de uma classe de modelo.