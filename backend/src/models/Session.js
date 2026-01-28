import { run, get, all, lastInsertRowid } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const Session = {
  findByToken(token) {
    return get('SELECT * FROM sessions WHERE session_token = ?', [token]);
  },

  create(reviewerEmail, reviewerName) {
    const token = uuidv4();

    run(
      `INSERT INTO sessions (session_token, reviewer_email, reviewer_name)
       VALUES (?, ?, ?)`,
      [token, reviewerEmail, reviewerName]
    );

    return {
      token,
      reviewer_email: reviewerEmail,
      reviewer_name: reviewerName
    };
  },

  delete(token) {
    run('DELETE FROM sessions WHERE session_token = ?', [token]);
  },

  deleteExpired(maxAgeHours = 24 * 7) {
    run(`DELETE FROM sessions WHERE created_at < datetime('now', '-${maxAgeHours} hours')`, []);
  }
};

export default Session;
