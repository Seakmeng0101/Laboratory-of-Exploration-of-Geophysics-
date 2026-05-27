import pool from '../config/db';

export async function getAllMembers() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, position, specialty, role, link, image, created_at FROM members ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getMemberById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, position, specialty, role, link, image FROM members WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createMember(name: string, position: string, specialty: string, role: string, link: string | null, image: string | null) {
  await pool.execute(
    `INSERT INTO members (name, position, specialty, role, link, image) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, position, specialty, role, link, image],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, name, position, specialty, role, link, image FROM members ORDER BY created_at DESC LIMIT 1`,
  );
  return rows[0];
}

export async function updateMember(id: string, name: string, position: string, specialty: string, role: string, link: string | null, image: string | null) {
  await pool.execute(
    `UPDATE members SET name = ?, position = ?, specialty = ?, role = ?, link = ?, image = ? WHERE id = ?`,
    [name, position, specialty, role, link, image, id],
  );
  return getMemberById(id);
}

export async function deleteMember(id: string) {
  await pool.execute(`DELETE FROM members WHERE id = ?`, [id]);
}