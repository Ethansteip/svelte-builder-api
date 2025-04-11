import { ProjectSettings } from '../models/ProjectSettings';

export interface ProjectRepositoryInterface {
  createProject(
    projectSettings: ProjectSettings
  ): Promise<{ projectId: string; downloadUrl: string }>;
}
