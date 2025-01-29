import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

/**
 * Export all tables in the database to separate .sql files.
 * @param db The SQLite database instance.
 * @param outputDir The directory to save the .sql files.
 */
export function exportDatabaseToSQL(db: Database.Database, outputDir: string): void {
  try {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get all table names
    const tableNames = getTableNames(db);

    tableNames.forEach((tableName) => {
      const tableSQL = dumpTableAsSQL(db, tableName);
      const filePath = path.join(outputDir, `${tableName}.sql`);

      fs.writeFileSync(filePath, tableSQL, 'utf-8');
      console.log(`Exported table '${tableName}' to ${filePath}`);
    });
  } catch (error) {
    console.error('Error exporting database:', error);
  }
}

/**
 * Get all table names in the database.
 * @param db The SQLite database instance.
 * @returns Array of table names.
 */
function getTableNames(db: Database.Database): string[] {
  const query = `
    SELECT name 
    FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%';
  `;
  const rows = db.prepare(query).all() as { name: string }[];
  return rows.map((row) => row.name);
}

/**
 * Generate SQL commands to recreate a table and its data.
 * @param db The SQLite database instance.
 * @param tableName The name of the table to dump.
 * @returns SQL commands as a string.
 */
function dumpTableAsSQL(db: Database.Database, tableName: string): string {
  // Get table schema
  const schemaQuery = `
    SELECT name, sql 
    FROM sqlite_master 
    WHERE type='table' AND name = ?;
  `;
  const schemaResult = db.prepare(schemaQuery).get(tableName) as { name: string; sql: string };

  if (!schemaResult) {
    throw new Error(`Table '${tableName}' does not exist.`);
  }
  const createTableSQL = schemaResult.sql;

  // Get table data
  const data = db.prepare(`SELECT * FROM ${tableName};`).all();
  const insertStatements = data
    .map((row) => {
      const columns = Object.keys(row as { [key: string]: any }).map((col) => `"${col}"`).join(', ');
      const values = Object.values(row as { [key: string]: any})
        .map((value) =>
          value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`
        )
        .join(', ');
      return `INSERT INTO "${tableName}" (${columns}) VALUES (${values});`;
    })
    .join('\n');

  return `${createTableSQL};\n\n${insertStatements}`;
}
