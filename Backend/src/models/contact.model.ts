import pool from '../config/db';

export async function createContact(name: string, email: string, subject: string, message: string) {
  await pool.execute(
    `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
    [name, email, subject, message],
  );
}