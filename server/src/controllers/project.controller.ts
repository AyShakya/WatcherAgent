import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.js';
import * as ProjectModel from '../models/project.js';
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    github_owner: z.string().min(1, 'GitHub owner is required'),
    github_repo: z.string().min(1, 'GitHub repo is required'),
    github_token: z.string().min(1, 'GitHub token is required'),
    discord_channel_id: z.string().min(1, 'Discord channel ID is required'),
    openrouter_key: z.string().min(1, 'OpenRouter key is required'),
    pinecone_namespace: z.string().min(1, 'Pinecone namespace is required'),
    pinecone_api_key: z.string().optional(),
  }),
});

export const UpdateProjectSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    github_owner: z.string().optional(),
    github_repo: z.string().optional(),
    github_token: z.string().optional(),
    discord_channel_id: z.string().optional(),
    openrouter_key: z.string().optional(),
    pinecone_namespace: z.string().optional(),
    pinecone_api_key: z.string().optional(),
    active: z.boolean().optional(),
  }),
});

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      description,
      github_owner,
      github_repo,
      github_token,
      discord_channel_id,
      openrouter_key,
      pinecone_namespace,
      pinecone_api_key,
    } = req.body;

    // Generate a secure unique webhook secret for alert ingestion
    const webhook_secret = `wh_${crypto.randomBytes(24).toString('hex')}`;

    const project = await ProjectModel.createProject({
      user_id: userId,
      name,
      description,
      webhook_secret,
      github_owner,
      github_repo,
      github_token,
      discord_channel_id,
      openrouter_key,
      pinecone_namespace,
      pinecone_api_key,
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const projects = await ProjectModel.listProjects(userId);
    return res.json({ projects });
  } catch (error: any) {
    console.error('List projects error:', error);
    return res.status(500).json({ error: 'Failed to list projects' });
  }
}

export async function get(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = await ProjectModel.getProjectById(id, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ project });
  } catch (error: any) {
    console.error('Get project error:', error);
    return res.status(500).json({ error: 'Failed to get project details' });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updated = await ProjectModel.updateProject(id, userId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Project not found or update failed' });
    }

    return res.json({
      message: 'Project updated successfully',
      project: updated,
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = await ProjectModel.deleteProject(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}
