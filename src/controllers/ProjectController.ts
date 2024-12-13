import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StorageRepository } from '../repositories/StorageRepository';

export class ProjectController {
  private storageRepository: StorageRepository;

  constructor() {
    this.storageRepository = new StorageRepository();
  }

  createProject = async (req: Request, res: Response) => {
    try {
      console.log('Creating project');
      const projectId = uuidv4();
      const result =
        await this.storageRepository.createNewProjectFromTemplate();

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
