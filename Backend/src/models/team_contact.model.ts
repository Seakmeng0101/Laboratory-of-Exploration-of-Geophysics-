import pool from '../config/db';

export async function getAllTeamContacts() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, faculty, institute, address, email, tel, image, created_at FROM team_contacts ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getTeamContactById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, faculty, institute, address, email, tel, image FROM team_contacts WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createTeamContact(name: string, faculty: string, institute: string, address: string, email: string, tel: string, image: string | null) {
  await pool.execute(
    `INSERT INTO team_contacts (name, faculty, institute, address, email, tel, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, faculty, institute, address, email, tel, image],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, faculty, institute, address, email, tel, image FROM team_contacts ORDER BY created_at DESC LIMIT 1`,
  );
  return rows[0];
}

export async function updateTeamContact(id: string, name: string, faculty: string, institute: string, address: string, email: string, tel: string, image: string | null) {
  await pool.execute(
    `UPDATE team_contacts SET name = ?, faculty = ?, institute = ?, address = ?, email = ?, tel = ?, image = ? WHERE id = ?`,
    [name, faculty, institute, address, email, tel, image, id],
  );
  return getTeamContactById(id);
}

export async function deleteTeamContact(id: string) {
  await pool.execute(`DELETE FROM team_contacts WHERE id = ?`, [id]);
}