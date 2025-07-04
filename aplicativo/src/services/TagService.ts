// aplicativo/src/services/TagService.ts
import { Tag, WatchedStatus, InterestStatus, RewatchStatus } from '../models/Tag';
import { Movie } from '../models/Movie';
import { User } from 'firebase/auth'; // Importe User do firebase/auth

let localTags: Tag[] = [];

export class TagService {
  private static instance: TagService;

  private constructor() {}

  public static getInstance(): TagService {
    if (!TagService.instance) {
      TagService.instance = new TagService();
    }
    return TagService.instance;
  }

  getAllTags(): Tag[] {
    return [...localTags];
  }

  addTag(tagData: { userId: string; movieId: string; watched?: WatchedStatus; interest?: InterestStatus; rewatch?: RewatchStatus }): Tag {
    const existingTag = this.getTagByMovieAndUser(tagData.movieId, tagData.userId);
    if (existingTag) {
      // Se a tag já existe, atualize-a em vez de adicionar uma nova
      existingTag.watched = tagData.watched !== undefined ? tagData.watched : existingTag.watched;
      existingTag.interest = tagData.interest !== undefined ? tagData.interest : existingTag.interest;
      existingTag.rewatch = tagData.rewatch !== undefined ? tagData.rewatch : existingTag.rewatch;
      this.updateTag(existingTag);
      return existingTag;
    } else {
      const newTag = new Tag(tagData);
      localTags.push(newTag);
      return newTag;
    }
  }

  updateTag(updatedTag: Tag): void {
    const index = localTags.findIndex(t => t.id === updatedTag.id);
    if (index !== -1) {
      localTags[index] = updatedTag;
    }
  }

  deleteTag(tagId: string): void {
    localTags = localTags.filter(t => t.id !== tagId);
  }

  getTagByMovieAndUser(movieId: string, userId: string): Tag | undefined {
    return localTags.find(tag => tag.movieId === movieId && tag.userId === userId);
  }
}