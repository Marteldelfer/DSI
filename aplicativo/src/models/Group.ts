// aplicativo/src/models/Group.ts
// Modelo de dados para Grupos de Amigos

export class Group {
    id: string;
    name: string;
    description: string | null;
    ownerId: string; // ID do usuário que criou o grupo
    memberIds: string[]; // IDs dos membros do grupo
    memberEmails: string[]; // Emails dos membros do grupo
    sharedPlaylistIds: string[]; // IDs das playlists compartilhadas no grupo
    timestamp?: string;

    constructor(data: {
        id?: string;
        name: string;
        description?: string | null;
        ownerId: string;
        memberIds?: string[];
        memberEmails?: string[];
        sharedPlaylistIds?: string[];
        timestamp?: string;
    }) {
        this.id = data.id || '';
        this.name = data.name;
        this.description = data.description ?? null; // Usar ?? null para garantir que undefined vire null
        this.ownerId = data.ownerId;
        this.memberIds = data.memberIds || [];
        this.memberEmails = data.memberEmails || [];
        this.sharedPlaylistIds = data.sharedPlaylistIds || [];
        this.timestamp = data.timestamp;
    }
}
