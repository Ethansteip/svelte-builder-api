import { Request, Response } from 'express';
import { StorageRepository } from '../repositories/StorageRepository';
import type { IStorageRepository } from '../interfaces/IStorageRepository';
import { ProjectSettings } from '../models/ProjectSettings';
import { supabase } from '../utils/supabase';

export class ProjectController {
  private storageRepository: IStorageRepository;

  constructor(storageRepository: IStorageRepository = new StorageRepository()) {
    this.storageRepository = storageRepository;
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

  submitEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    console.log('Email: ', email);

    try {
      const { data, error } = await supabase.from('emails').insert({
        email
      });

      if (error) throw Error;

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
