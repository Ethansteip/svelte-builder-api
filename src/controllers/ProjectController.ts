import { Request, Response } from 'express';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ProjectSettings } from '../models/ProjectSettings';
import { supabase } from '../utils/supabase';

export class ProjectController {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  createProject = async (req: Request, res: Response) => {
    const projectSettings: ProjectSettings = req.body;
    console.log('Creating project...');
    try {
      const result = await this.projectRepository.createProject(
        projectSettings
      );

      res.status(200).json({
        success: true,
        message: 'Project created successfully'
      });
    } catch (error) {
      console.error(JSON.stringify(error, null, 2));
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
