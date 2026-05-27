import pool from '../config/db';

export async function getAllProjects() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, description, image, created_at FROM projects ORDER BY created_at DESC`,
  );
  return rows.map(row => ({
    ...row,
    description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description,
  }));
}

export async function getProjectById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, description, image FROM projects WHERE id = ?`,
    [id],
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return { ...row, description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description };
}

export async function createProject(title: string, description: string[] | string, image: string | null) {
  const descriptionJson = Array.isArray(description) ? JSON.stringify(description) : JSON.stringify([description]);
  await pool.execute(
    `INSERT INTO projects (title, description, image) VALUES (?, ?, ?)`,
    [title, descriptionJson, image],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, description, image FROM projects ORDER BY created_at DESC LIMIT 1`,
  );
  const row = rows[0];
  return { ...row, description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description };
}

export async function updateProject(id: string, title: string, description: string[] | string, image: string | null) {
  const descriptionJson = Array.isArray(description) ? JSON.stringify(description) : JSON.stringify([description]);
  await pool.execute(
    `UPDATE projects SET title = ?, description = ?, image = ? WHERE id = ?`,
    [title, descriptionJson, image, id],
  );
  return getProjectById(id);
}

export async function deleteProject(id: string) {
  await pool.execute(`DELETE FROM projects WHERE id = ?`, [id]);
}