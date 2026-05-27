import pool from '../config/db';

export async function getAllServices() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, description, image, link, created_at FROM services ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getServiceById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, description, image, link FROM services WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createService(title: string, description: string, image: string | null, link: string | null) {
  await pool.execute(
    `INSERT INTO services (title, description, image, link) VALUES (?, ?, ?, ?)`,
    [title, description, image, link],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, title, description, image, link FROM services ORDER BY created_at DESC LIMIT 1`,
  );
  return rows[0];
}

export async function updateService(id: string, title: string, description: string, image: string | null, link: string | null) {
  await pool.execute(
    `UPDATE services SET title = ?, description = ?, image = ?, link = ? WHERE id = ?`,
    [title, description, image, link, id],
  );
  return getServiceById(id);
}

export async function deleteService(id: string) {
  await pool.execute(`DELETE FROM services WHERE id = ?`, [id]);
}