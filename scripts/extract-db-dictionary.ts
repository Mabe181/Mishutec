import fs from "fs";
import path from "path";
import sql from "mssql/msnodesqlv8";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvLocal();

async function main() {
  const pool = await new sql.ConnectionPool({
    connectionString: `Driver={${process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server"}};Server=${process.env.DB_SERVER};Database=MishutecT2_Aceptacion;Trusted_Connection=yes;TrustServerCertificate=yes;`,
  } as any).connect();

  // 1. All tables
  const tablesRes = await pool.request().query(`
    SELECT t.object_id, t.name AS TableName
    FROM sys.tables t
    WHERE t.schema_id = SCHEMA_ID('dbo')
    ORDER BY t.name;
  `);

  const tables = tablesRes.recordset;

  // 2. Columns
  const colsRes = await pool.request().query(`
    SELECT 
      c.object_id,
      t.name AS TableName,
      c.column_id,
      c.name AS ColumnName,
      tp.name AS DataType,
      c.max_length,
      c.precision,
      c.scale,
      c.is_nullable,
      c.is_identity,
      dc.definition AS DefaultDefinition
    FROM sys.columns c
    JOIN sys.tables t ON t.object_id = c.object_id
    JOIN sys.types tp ON tp.user_type_id = c.user_type_id
    LEFT JOIN sys.default_constraints dc ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE t.schema_id = SCHEMA_ID('dbo')
    ORDER BY t.name, c.column_id;
  `);

  // 3. Primary keys
  const pkRes = await pool.request().query(`
    SELECT 
      t.name AS TableName,
      i.name AS PkName,
      c.name AS ColumnName,
      ic.key_ordinal
    FROM sys.indexes i
    JOIN sys.tables t ON t.object_id = i.object_id
    JOIN sys.index_columns ic ON ic.object_id = t.object_id AND ic.index_id = i.index_id
    JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = ic.column_id
    WHERE i.is_primary_key = 1 AND t.schema_id = SCHEMA_ID('dbo')
    ORDER BY t.name, ic.key_ordinal;
  `);

  // 4. Foreign keys
  const fkRes = await pool.request().query(`
    SELECT 
      fk.name AS FkName,
      tp.name AS ParentTable,
      cp.name AS ParentColumn,
      tr.name AS ReferencedTable,
      cr.name AS ReferencedColumn
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
    JOIN sys.tables tp ON tp.object_id = fk.parent_object_id
    JOIN sys.columns cp ON cp.object_id = tp.object_id AND cp.column_id = fkc.parent_column_id
    JOIN sys.tables tr ON tr.object_id = fk.referenced_object_id
    JOIN sys.columns cr ON cr.object_id = tr.object_id AND cr.column_id = fkc.referenced_column_id
    WHERE tp.schema_id = SCHEMA_ID('dbo')
    ORDER BY tp.name, fk.name;
  `);

  // 5. Unique constraints
  const uqRes = await pool.request().query(`
    SELECT 
      t.name AS TableName,
      i.name AS UniqueConstraintName,
      c.name AS ColumnName,
      ic.key_ordinal
    FROM sys.indexes i
    JOIN sys.tables t ON t.object_id = i.object_id
    JOIN sys.index_columns ic ON ic.object_id = t.object_id AND ic.index_id = i.index_id
    JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = ic.column_id
    WHERE i.is_unique = 1 AND i.is_primary_key = 0 AND t.schema_id = SCHEMA_ID('dbo')
    ORDER BY t.name, i.name, ic.key_ordinal;
  `);

  // 6. Check constraints
  const ckRes = await pool.request().query(`
    SELECT 
      t.name AS TableName,
      ck.name AS CheckName,
      ck.definition AS CheckDefinition
    FROM sys.check_constraints ck
    JOIN sys.tables t ON t.object_id = ck.parent_object_id
    WHERE t.schema_id = SCHEMA_ID('dbo')
    ORDER BY t.name, ck.name;
  `);

  const output = {
    tables: tables.map(t => t.TableName),
    columns: colsRes.recordset,
    primaryKeys: pkRes.recordset,
    foreignKeys: fkRes.recordset,
    uniqueConstraints: uqRes.recordset,
    checkConstraints: ckRes.recordset,
  };

  fs.writeFileSync(path.resolve(process.cwd(), "docs/schema-metadata.json"), JSON.stringify(output, null, 2), "utf-8");
  console.log(`Metadatos extraídos exitosamente: ${tables.length} tablas.`);
  await pool.close();
}

main().catch(console.error);
