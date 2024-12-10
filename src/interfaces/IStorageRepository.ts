export interface IStorageRepository {
  createNewProjectFromTemplate(): Promise<{ projectId: string }>;
}
