import { run, get, all, lastInsertRowid, saveDatabase } from '../config/database.js';

export const Candidate = {
  findAll(filters = {}) {
    let query = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.cv_analysis_status) {
      query += ' AND cv_analysis_status = ?';
      params.push(filters.cv_analysis_status);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY submitted_at DESC';

    const candidates = all(query, params);
    return candidates.map(c => ({
      ...c,
      cv_analysis: c.cv_analysis ? JSON.parse(c.cv_analysis) : null
    }));
  },

  findById(id) {
    const candidate = get('SELECT * FROM candidates WHERE id = ?', [id]);
    if (!candidate) return null;
    return {
      ...candidate,
      cv_analysis: candidate.cv_analysis ? JSON.parse(candidate.cv_analysis) : null
    };
  },

  findBySheetsRowId(sheetsRowId) {
    const candidate = get('SELECT * FROM candidates WHERE sheets_row_id = ?', [sheetsRowId]);
    if (!candidate) return null;
    return {
      ...candidate,
      cv_analysis: candidate.cv_analysis ? JSON.parse(candidate.cv_analysis) : null
    };
  },

  create(data) {
    run(
      `INSERT INTO candidates (sheets_row_id, name, email, phone, country, role, video_link, cv_file_id, linkedin_url, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.sheets_row_id,
        data.name,
        data.email,
        data.phone || null,
        data.country || null,
        data.role,
        data.video_link || null,
        data.cv_file_id || null,
        data.linkedin_url || null,
        data.submitted_at
      ]
    );

    const id = lastInsertRowid();
    return this.findById(id);
  },

  update(id, data) {
    const fields = [];
    const params = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      params.push(data.name);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      params.push(data.email);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      params.push(data.phone);
    }
    if (data.country !== undefined) {
      fields.push('country = ?');
      params.push(data.country);
    }
    if (data.role !== undefined) {
      fields.push('role = ?');
      params.push(data.role);
    }
    if (data.video_link !== undefined) {
      fields.push('video_link = ?');
      params.push(data.video_link);
    }
    if (data.cv_file_id !== undefined) {
      fields.push('cv_file_id = ?');
      params.push(data.cv_file_id);
    }
    if (data.linkedin_url !== undefined) {
      fields.push('linkedin_url = ?');
      params.push(data.linkedin_url);
    }
    if (data.cv_analysis !== undefined) {
      fields.push('cv_analysis = ?');
      params.push(JSON.stringify(data.cv_analysis));
    }
    if (data.cv_analysis_status !== undefined) {
      fields.push('cv_analysis_status = ?');
      params.push(data.cv_analysis_status);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    run(`UPDATE candidates SET ${fields.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  },

  getRoles() {
    const roles = all('SELECT DISTINCT role FROM candidates ORDER BY role', []);
    return roles.map(r => r.role);
  },

  upsertFromSheets(data) {
    const existing = this.findBySheetsRowId(data.sheets_row_id);

    if (existing) {
      return this.update(existing.id, data);
    }

    return this.create(data);
  }
};

export default Candidate;
