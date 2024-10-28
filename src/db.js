import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

class WrappedDatabase {
  constructor(db) {
    this.db = db;
  }

  all(sql, params = []) {
    let stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  first(sql, params = []) {
    let rows = this.all(sql, params);
    return rows.length === 0 ? null : rows[0];
  }

  exec(sql) {
    return this.db.exec(sql);
  }

  mutate(sql, params = []) {
    let stmt = this.db.prepare(sql);
    let info = stmt.run(...params);
    return { changes: info.changes, insertId: info.lastInsertRowid };
  }

  transaction(fn) {
    return this.db.transaction(fn)();
  }

  close() {
    this.db.close();
  }
}

/** @param {string} filename */
export default function openDatabase(filename) {
  const dataDir = '/opt/render/project/src/data';

  // Logging zur Überprüfung
  console.log(`Überprüfe, ob das Verzeichnis "${dataDir}" existiert.`);

  if (!fs.existsSync(dataDir)) {
    console.log(`Verzeichnis "${dataDir}" existiert nicht. Erstelle es nun.`);
    fs.mkdirSync(dataDir, { recursive: true });
  } else {
    console.log(`Verzeichnis "${dataDir}" existiert bereits.`);
  }

  const dbPath = path.join(dataDir, filename);

  // Log für den Datenbankpfad
  console.log(`Datenbank wird unter folgendem Pfad geöffnet: "${dbPath}"`);

  return new WrappedDatabase(new Database(dbPath));
}
