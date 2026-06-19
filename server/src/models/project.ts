import { query } from '../db/index.js';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  webhook_secret: string;
  github_owner: string;
  github_repo: string;
  github_token: string;
  discord_channel_id: string;
  openrouter_key: string;
  pinecone_namespace: string;
  pinecone_api_key: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectInput {
  user_id: string;
  name: string;
  description?: string;
  webhook_secret: string;
  github_owner: string;
  github_repo: string;
  github_token: string;
  discord_channel_id: string;
  openrouter_key: string;
  pinecone_namespace: string;
  pinecone_api_key?: string;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const sql = `
    INSERT INTO projects (
      user_id, name, description, webhook_secret, 
      github_owner, github_repo, github_token, 
      discord_channel_id, openrouter_key, pinecone_namespace,
      pinecone_api_key
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  const params = [
    input.user_id,
    input.name,
    input.description || null,
    input.webhook_secret,
    input.github_owner,
    input.github_repo,
    input.github_token,
    input.discord_channel_id,
    input.openrouter_key,
    input.pinecone_namespace,
    input.pinecone_api_key || null,
  ];
  const result = await query(sql, params);
  return result.rows[0];
}

export async function getProjectById(id: string, userId?: string): Promise<Project | null> {
  let sql = 'SELECT * FROM projects WHERE id = $1';
  const params: any[] = [id];

  if (userId) {
    sql += ' AND user_id = $2';
    params.push(userId);
  }

  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function getProjectBySecret(webhookSecret: string): Promise<Project | null> {
  const sql = 'SELECT * FROM projects WHERE webhook_secret = $1 AND active = TRUE';
  const result = await query(sql, [webhookSecret]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function listProjects(userId: string): Promise<Project[]> {
  const sql = 'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC';
  const result = await query(sql, [userId]);
  return result.rows;
}

export async function updateProject(id: string, userId: string, fields: Partial<CreateProjectInput> & { active?: boolean }): Promise<Project | null> {
  const setClauses: string[] = [];
  const params: any[] = [id, userId];
  let paramIndex = 3;

  const allowedFields = [
    'name', 'description', 'webhook_secret', 'github_owner', 'github_repo',
    'github_token', 'discord_channel_id', 'openrouter_key', 'pinecone_namespace', 'pinecone_api_key', 'active'
  ];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && allowedFields.includes(key)) {
      setClauses.push(`"${key}" = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return getProjectById(id, userId);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

  const sql = `
    UPDATE projects
    SET ${setClauses.join(', ')}
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await query(sql, params);
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function deleteProject(id: string, userId: string): Promise<boolean> {
  const sql = 'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id';
  const result = await query(sql, [id, userId]);
  return result.rows.length > 0;
}
