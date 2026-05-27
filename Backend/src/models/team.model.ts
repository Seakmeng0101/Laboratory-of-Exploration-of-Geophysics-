import pool from '../config/db';

export async function getAllTeams() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, email, position, image, created_at FROM teams ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getTeamById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, email, position, image FROM teams WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createTeam(name: string, email: string, position: string, image: string | null) {
  await pool.execute(
    `INSERT INTO teams (name, email, position, image) VALUES (?, ?, ?, ?)`,
    [name, email, position, image],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, email, position, image FROM teams ORDER BY created_at DESC LIMIT 1`,
  );
  return rows[0];
}

export async function updateTeam(id: string, name: string, email: string, position: string, image: string | null) {
  await pool.execute(
    `UPDATE teams SET name = ?, email = ?, position = ?, image = ? WHERE id = ?`,
    [name, email, position, image, id],
  );
  return getTeamById(id);
}

export async function deleteTeam(id: string) {
  await pool.execute(`DELETE FROM teams WHERE id = ?`, [id]);
}