import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

class WrappedDatabase {
  constructor(db) {
    this.db = db;
  }

  /**
   * @param {string} sql
   * @param {string[]} params
   */
  all(sql, params = []) {
    let stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  /**
   * @param {string} sql
   * @param {string[]} params
   */
  first(sql, params = []) {
    let rows = this.all(sql, params);
    return rows.length === 0 ? null : rows[0];
  }

  /**
   * @param {string} sql
   */
  exec(sql) {
    return this.db.exec(sql);
  }

  /**
   * @param {string} sql
   * @param {string[]} params
   */
  mutate(sql, params = []) {
    let stmt = this.db.prepare(sql);
    let info = stmt.run(...params);
    return { changes: info.changes, insertId: info.lastInsertRowid };
  }

  /**
   * @param {() => void} fn
   */
  transaction(fn) {
    return this.db.transaction(fn)();
  }

  close() {
    this.db.close();
  }
}

/** @param {string} filename */
export default function openDatabase(filename) {
  // Absoluter Pfad zum Datenverzeichnis
  const dataDir = '/opt/render/project/src/data';

  // Sicherstellen, dass das Verzeichnis existiert
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Vollständiger Pfad zur Datenbankdatei
  const dbPath = path.join(dataDir, filename);

  // Öffnen der Datenbank mit dem absoluten Pfad
  return new WrappedDatabase(new Database(dbPath));
}
