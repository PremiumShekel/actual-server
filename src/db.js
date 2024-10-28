import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

class WrappedDatabase {
  constructor(db) {
    this.db = db;
  }

  /**
   * @param {string} sql
   * @param {string[]} params
   */
  all(sql, params = []) {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  /**
   * @param {string} sql
   * @param {string[]} params
   */
  first(sql, params = []) {
    const rows = this.all(sql, params);
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
    const stmt = this.db.prepare(sql);
    const info = stmt.run(...params);
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

/** 
 * Öffnet die Datenbank und stellt sicher, dass das Verzeichnis existiert.
 * @param {string} filename - Der Name der Datenbankdatei
 * @returns {WrappedDatabase} - Eine Instanz der WrappedDatabase
 */
export default function openDatabase(filename) {
  // Setze den Pfad zur Datenbankdatei
  const dataDir = path.join(process.cwd(), 'data');
  const dbPath = path.join(dataDir, filename);

  // Verzeichnis überprüfen oder erstellen
  if (!fs.existsSync(dataDir)) {
    console.log(`Verzeichnis "${dataDir}" existiert nicht. Erstelle Verzeichnis...`);
    fs.mkdirSync(dataDir, { recursive: true });
  } else {
    console.log(`Verzeichnis "${dataDir}" existiert bereits.`);
  }

  console.log(`Datenbank wird unter folgendem Pfad geöffnet: "${dbPath}"`);

  // Datenbank öffnen
  return new WrappedDatabase(new Database(dbPath));
}
