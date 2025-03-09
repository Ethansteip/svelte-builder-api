import { ProjectSettings } from '../models/ProjectSettings';

export interface IStorageRepository {
  createNewProjectFromTemplate(
    projectSettings: ProjectSettings
  ): Promise<{ projectId: string }>;
}
