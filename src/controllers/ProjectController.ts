import { Request, Response } from 'express';
import { StorageRepository } from '../repositories/StorageRepository';
import { ProjectSettings } from '../models/ProjectSettings';

export class ProjectController {
  private storageRepository: StorageRepository;

  constructor() {
    this.storageRepository = new StorageRepository();
  }

  createProject = async (req: Request, res: Response) => {
    const projectSettings: ProjectSettings = req.body;

    console.log('Project Settings: ', projectSettings);

    try {
      console.log('Creating project');

      const result = await this.storageRepository.createNewProjectFromTemplate(
        projectSettings
      );

      res.status(200).json({
        success: true,
        projectId: result.projectId,
        downloadUrl: result.downloadUrl
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
