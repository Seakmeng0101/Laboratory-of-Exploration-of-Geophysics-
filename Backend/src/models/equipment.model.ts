import pool from '../config/db';

export async function getAllEquipments() {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, machine, model, capacity, image, link, created_at FROM equipments ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getEquipmentById(id: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT id, machine, model, capacity, image, link FROM equipments WHERE id = ?`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createEquipment(machine: string, model: string, capacity: string, image: string | null, link: string | null) {
  await pool.execute(
    `INSERT INTO equipments (machine, model, capacity, image, link) VALUES (?, ?, ?, ?, ?)`,
    [machine, model, capacity, image, link],
  );
  const [rows] = await pool.execute<any[]>(
    `SELECT id, machine, model, capacity, image, link FROM equipments ORDER BY created_at DESC LIMIT 1`,
  );
  return rows[0];
}

export async function updateEquipment(id: string, machine: string, model: string, capacity: string, image: string | null, link: string | null) {
  await pool.execute(
    `UPDATE equipments SET machine = ?, model = ?, capacity = ?, image = ?, link = ? WHERE id = ?`,
    [machine, model, capacity, image, link, id],
  );
  return getEquipmentById(id);
}

export async function deleteEquipment(id: string) {
  await pool.execute(`DELETE FROM equipments WHERE id = ?`, [id]);
}