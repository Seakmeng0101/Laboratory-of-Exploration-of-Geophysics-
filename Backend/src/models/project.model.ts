import pool from '../config/db';

export async function getAllProjects() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, company_title, description, images, created_at FROM projects ORDER BY created_at DESC`,
  );
  return rows.map(row => ({
    ...row,
    description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images ?? []),
  }));
}

export async function getProjectById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, company_title, description, images FROM projects WHERE id = ?`,
    [id],
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    ...row,
    description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images ?? []),
  };
}

export async function createProject(
  title: string,
  company_title: string | null,
  description: string[] | string,
  images: string[],
) {
  const descriptionJson = Array.isArray(description)
    ? JSON.stringify(description)
    : JSON.stringify([description]);
  const imagesJson = JSON.stringify(images);

  await pool.execute(
    `INSERT INTO projects (title, company_title, description, images) VALUES (?, ?, ?, ?)`,
    [title, company_title, descriptionJson, imagesJson],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, company_title, description, images FROM projects ORDER BY created_at DESC LIMIT 1`,
  );
  const row = rows[0];
  return {
    ...row,
    description: typeof row.description === 'string' ? JSON.parse(row.description) : row.description,
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images ?? []),
  };
}

export async function updateProject(
  id: string,
  title: string,
  company_title: string | null,
  description: string[] | string,
  images: string[],
) {
  const descriptionJson = Array.isArray(description)
    ? JSON.stringify(description)
    : JSON.stringify([description]);
  const imagesJson = JSON.stringify(images);

  await pool.execute(
    `UPDATE projects SET title = ?, company_title = ?, description = ?, images = ? WHERE id = ?`,
    [title, company_title, descriptionJson, imagesJson, id],
  );
  return getProjectById(id);
}

export async function deleteProject(id: string) {
  await pool.execute(`DELETE FROM projects WHERE id = ?`, [id]);
}

export async function getProjectImages(id: string): Promise<string[]> {
  const [rows] = await pool.execute<any[]>(
    `SELECT images FROM projects WHERE id = ?`,
    [id],
  );
  if (!rows[0]) return [];
  const raw = rows[0].images;
  return typeof raw === 'string' ? JSON.parse(raw) : (raw ?? []);
}