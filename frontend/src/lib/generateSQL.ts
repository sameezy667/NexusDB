/**
 * Generate SQL DDL or schema definitions for various database dialects
 */

interface Column {
  name: string;
  type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_key_target?: string;
}

interface Table {
  name: string;
  columns: Column[];
}

interface Relationship {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
}

export interface Schema {
  tables: Table[];
  relationships?: Relationship[];
}

/**
 * Main function to generate SQL/schema for any dialect
 */
export function generateSQL(schema: Schema, dialect: string): string {
  switch (dialect) {
    case "postgresql":
      return generatePostgreSQL(schema);
    case "mysql":
      return generateMySQL(schema);
    case "sqlite":
    case "sqlite-mobile":
      return generateSQLite(schema);
    case "mssql":
      return generateMSSQL(schema);
    case "oracle":
      return generateOracle(schema);
    case "cockroachdb":
      return generateCockroachDB(schema);
    case "planetscale":
      return generatePlanetScale(schema);
    case "mongodb":
      return generateMongoDB(schema);
    case "firestore":
      return generateFirestore(schema);
    case "cassandra":
      return generateCassandra(schema);
    case "dynamodb":
      return generateDynamoDB(schema);
    case "watermelondb":
      return generateWatermelonDB(schema);
    case "redis":
      return generateRedis(schema);
    default:
      return generatePostgreSQL(schema); // Default fallback
  }
}

// ============================================================================
// SQL DIALECTS
// ============================================================================

function generatePostgreSQL(schema: Schema): string {
  let sql = "-- PostgreSQL DDL\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];
    const constraints: string[] = [];

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} `;

      // Map type
      if (col.is_primary_key && col.type.toLowerCase().includes("int")) {
        colDef += "SERIAL PRIMARY KEY";
      } else {
        colDef += mapTypeToPostgreSQL(col.type);
        if (col.is_primary_key) {
          colDef += " PRIMARY KEY";
        }
      }

      columnDefs.push(colDef);

      // Foreign key constraints
      if (col.is_foreign_key && col.foreign_key_target) {
        const [refTable, refCol] = col.foreign_key_target.split(".");
        constraints.push(
          `  CONSTRAINT fk_${table.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refCol || "id"})`
        );
      }
    });

    sql += columnDefs.join(",\n");
    if (constraints.length > 0) {
      sql += ",\n" + constraints.join(",\n");
    }
    sql += "\n);\n\n";
  });

  return sql;
}

function generateMySQL(schema: Schema): string {
  let sql = "-- MySQL DDL\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];
    const constraints: string[] = [];

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} `;

      if (col.is_primary_key && col.type.toLowerCase().includes("int")) {
        colDef += "INT AUTO_INCREMENT PRIMARY KEY";
      } else {
        colDef += mapTypeToMySQL(col.type);
        if (col.is_primary_key) {
          colDef += " PRIMARY KEY";
        }
      }

      columnDefs.push(colDef);

      if (col.is_foreign_key && col.foreign_key_target) {
        const [refTable, refCol] = col.foreign_key_target.split(".");
        constraints.push(
          `  CONSTRAINT fk_${table.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refCol || "id"})`
        );
      }
    });

    sql += columnDefs.join(",\n");
    if (constraints.length > 0) {
      sql += ",\n" + constraints.join(",\n");
    }
    sql += "\n) ENGINE=InnoDB;\n\n";
  });

  return sql;
}

function generateSQLite(schema: Schema): string {
  let sql = "-- SQLite DDL\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} `;

      if (col.is_primary_key && col.type.toLowerCase().includes("int")) {
        colDef += "INTEGER PRIMARY KEY AUTOINCREMENT";
      } else {
        colDef += mapTypeToSQLite(col.type);
        if (col.is_primary_key) {
          colDef += " PRIMARY KEY";
        }
      }

      if (col.is_foreign_key && col.foreign_key_target) {
        const [refTable, refCol] = col.foreign_key_target.split(".");
        colDef += ` REFERENCES ${refTable}(${refCol || "id"})`;
      }

      columnDefs.push(colDef);
    });

    sql += columnDefs.join(",\n");
    sql += "\n);\n\n";
  });

  return sql;
}

function generateMSSQL(schema: Schema): string {
  let sql = "-- Microsoft SQL Server DDL\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];
    const constraints: string[] = [];

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} `;

      if (col.is_primary_key && col.type.toLowerCase().includes("int")) {
        colDef += "INT IDENTITY(1,1) PRIMARY KEY";
      } else {
        colDef += mapTypeToMSSQL(col.type);
        if (col.is_primary_key) {
          colDef += " PRIMARY KEY";
        }
      }

      columnDefs.push(colDef);

      if (col.is_foreign_key && col.foreign_key_target) {
        const [refTable, refCol] = col.foreign_key_target.split(".");
        constraints.push(
          `  CONSTRAINT fk_${table.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refCol || "id"})`
        );
      }
    });

    sql += columnDefs.join(",\n");
    if (constraints.length > 0) {
      sql += ",\n" + constraints.join(",\n");
    }
    sql += "\n);\n\n";
  });

  return sql;
}

function generateOracle(schema: Schema): string {
  let sql = "-- Oracle Database DDL\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];
    const constraints: string[] = [];

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} `;

      if (col.is_primary_key && col.type.toLowerCase().includes("int")) {
        colDef += "NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY";
      } else {
        colDef += mapTypeToOracle(col.type);
        if (col.is_primary_key) {
          colDef += " PRIMARY KEY";
        }
      }

      columnDefs.push(colDef);

      if (col.is_foreign_key && col.foreign_key_target) {
        const [refTable, refCol] = col.foreign_key_target.split(".");
        constraints.push(
          `  CONSTRAINT fk_${table.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refCol || "id"})`
        );
      }
    });

    sql += columnDefs.join(",\n");
    if (constraints.length > 0) {
      sql += ",\n" + constraints.join(",\n");
    }
    sql += "\n);\n\n";
  });

  return sql;
}

function generateCockroachDB(schema: Schema): string {
  let sql = "-- CockroachDB DDL\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];
    const constraints: string[] = [];

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} `;

      if (col.is_primary_key && col.type.toLowerCase().includes("int")) {
        colDef += "UUID PRIMARY KEY DEFAULT gen_random_uuid()";
      } else {
        colDef += mapTypeToPostgreSQL(col.type); // CockroachDB uses PostgreSQL syntax
        if (col.is_primary_key) {
          colDef += " PRIMARY KEY";
        }
      }

      columnDefs.push(colDef);

      if (col.is_foreign_key && col.foreign_key_target) {
        const [refTable, refCol] = col.foreign_key_target.split(".");
        constraints.push(
          `  CONSTRAINT fk_${table.name}_${col.name} FOREIGN KEY (${col.name}) REFERENCES ${refTable}(${refCol || "id"})`
        );
      }
    });

    sql += columnDefs.join(",\n");
    if (constraints.length > 0) {
      sql += ",\n" + constraints.join(",\n");
    }
    sql += "\n);\n\n";
  });

  return sql;
}

function generatePlanetScale(schema: Schema): string {
  let sql = "-- PlanetScale (MySQL-compatible) DDL\n";
  sql += "-- Note: PlanetScale does not support foreign key constraints\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} `;

      if (col.is_primary_key && col.type.toLowerCase().includes("int")) {
        colDef += "INT AUTO_INCREMENT PRIMARY KEY";
      } else {
        colDef += mapTypeToMySQL(col.type);
        if (col.is_primary_key) {
          colDef += " PRIMARY KEY";
        }
      }

      columnDefs.push(colDef);

      // Add comment for FK relationships (PlanetScale doesn't support FK constraints)
      if (col.is_foreign_key && col.foreign_key_target) {
        columnDefs.push(`  -- ${col.name} references ${col.foreign_key_target}`);
      }
    });

    sql += columnDefs.join(",\n");
    sql += "\n) ENGINE=InnoDB;\n\n";
  });

  return sql;
}

// ============================================================================
// NoSQL DIALECTS
// ============================================================================

function generateMongoDB(schema: Schema): string {
  let output = "// MongoDB Collection Schema (JavaScript)\n\n";

  schema.tables.forEach((table) => {
    output += `// Collection: ${table.name}\n`;
    output += `db.createCollection("${table.name}", {\n`;
    output += `  validator: {\n`;
    output += `    $jsonSchema: {\n`;
    output += `      bsonType: "object",\n`;
    output += `      required: [${table.columns
      .filter((c) => c.is_primary_key || !c.name.toLowerCase().includes("optional"))
      .map((c) => `"${c.name}"`)
      .join(", ")}],\n`;
    output += `      properties: {\n`;

    table.columns.forEach((col, idx) => {
      output += `        ${col.name}: {\n`;
      output += `          bsonType: "${mapTypeToMongoDB(col.type)}",\n`;
      output += `          description: "${col.name} field"`;
      if (col.is_foreign_key && col.foreign_key_target) {
        output += `,\n          // References ${col.foreign_key_target}`;
      }
      output += `\n        }${idx < table.columns.length - 1 ? "," : ""}\n`;
    });

    output += `      }\n`;
    output += `    }\n`;
    output += `  }\n`;
    output += `});\n\n`;

    // Add index for primary key
    const pkCol = table.columns.find((c) => c.is_primary_key);
    if (pkCol) {
      output += `db.${table.name}.createIndex({ ${pkCol.name}: 1 }, { unique: true });\n\n`;
    }
  });

  return output;
}

function generateFirestore(schema: Schema): string {
  let output = "// Firebase Firestore Schema (TypeScript Interfaces)\n\n";

  schema.tables.forEach((table) => {
    output += `// Collection: ${table.name}\n`;
    output += `interface ${capitalize(table.name)} {\n`;

    table.columns.forEach((col) => {
      const tsType = mapTypeToTypeScript(col.type);
      output += `  ${col.name}: ${tsType};`;
      if (col.is_foreign_key && col.foreign_key_target) {
        output += ` // References ${col.foreign_key_target}`;
      }
      output += `\n`;
    });

    output += `}\n\n`;
  });

  output += `// Usage example:\n`;
  output += `// import { collection, addDoc } from 'firebase/firestore';\n`;
  output += `// const docRef = await addDoc(collection(db, '${schema.tables[0]?.name || "collection"}'), data);\n`;

  return output;
}

function generateCassandra(schema: Schema): string {
  let sql = "-- Apache Cassandra CQL\n\n";

  schema.tables.forEach((table) => {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs: string[] = [];
    const pkCols = table.columns.filter((c) => c.is_primary_key);

    table.columns.forEach((col) => {
      let colDef = `  ${col.name} ${mapTypeToCassandra(col.type)}`;
      columnDefs.push(colDef);
    });

    sql += columnDefs.join(",\n");

    if (pkCols.length > 0) {
      sql += `,\n  PRIMARY KEY (${pkCols.map((c) => c.name).join(", ")})`;
    }

    sql += "\n);\n\n";
  });

  return sql;
}

function generateDynamoDB(schema: Schema): string {
  let output = "// Amazon DynamoDB Table Definitions (JSON)\n\n";

  schema.tables.forEach((table) => {
    const pkCol = table.columns.find((c) => c.is_primary_key);

    output += `// Table: ${table.name}\n`;
    output += `{\n`;
    output += `  "TableName": "${table.name}",\n`;
    output += `  "KeySchema": [\n`;
    output += `    { "AttributeName": "${pkCol?.name || "id"}", "KeyType": "HASH" }\n`;
    output += `  ],\n`;
    output += `  "AttributeDefinitions": [\n`;

    const attrs = table.columns.map((col, idx) => {
      const dynamoType = mapTypeToDynamoDB(col.type);
      return `    { "AttributeName": "${col.name}", "AttributeType": "${dynamoType}" }${
        idx < table.columns.length - 1 ? "," : ""
      }`;
    });

    output += attrs.join("\n") + "\n";
    output += `  ],\n`;
    output += `  "BillingMode": "PAY_PER_REQUEST"\n`;
    output += `}\n\n`;
  });

  return output;
}

function generateWatermelonDB(schema: Schema): string {
  let output = "// WatermelonDB Schema (TypeScript)\n\n";
  output += `import { appSchema, tableSchema } from '@nozbe/watermelondb';\n\n`;
  output += `export default appSchema({\n`;
  output += `  version: 1,\n`;
  output += `  tables: [\n`;

  schema.tables.forEach((table, tableIdx) => {
    output += `    tableSchema({\n`;
    output += `      name: '${table.name}',\n`;
    output += `      columns: [\n`;

    table.columns
      .filter((c) => !c.is_primary_key) // WatermelonDB auto-manages id
      .forEach((col, colIdx, arr) => {
        output += `        { name: '${col.name}', type: '${mapTypeToWatermelonDB(col.type)}' }${
          colIdx < arr.length - 1 ? "," : ""
        }\n`;
      });

    output += `      ]\n`;
    output += `    })${tableIdx < schema.tables.length - 1 ? "," : ""}\n`;
  });

  output += `  ]\n`;
  output += `});\n`;

  return output;
}

function generateRedis(schema: Schema): string {
  let output = "# Redis Schema Hints (Key Structure)\n\n";

  schema.tables.forEach((table) => {
    output += `# Entity: ${table.name}\n`;
    output += `# Key Pattern: ${table.name}:{id}\n`;
    output += `# Type: Hash\n`;
    output += `# Fields:\n`;

    table.columns.forEach((col) => {
      output += `#   - ${col.name}: ${col.type}`;
      if (col.is_primary_key) output += " (Primary Key)";
      if (col.is_foreign_key && col.foreign_key_target) {
        output += ` (References ${col.foreign_key_target})`;
      }
      output += `\n`;
    });

    output += `\n# Example:\n`;
    output += `# HSET ${table.name}:1 ${table.columns.map((c) => `${c.name} "value"`).join(" ")}\n`;
    output += `# HGETALL ${table.name}:1\n\n`;
  });

  return output;
}

// ============================================================================
// TYPE MAPPING HELPERS
// ============================================================================

function mapTypeToPostgreSQL(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "INTEGER";
  if (lower.includes("varchar") || lower.includes("string")) return "VARCHAR(255)";
  if (lower.includes("text")) return "TEXT";
  if (lower.includes("bool")) return "BOOLEAN";
  if (lower.includes("date")) return "DATE";
  if (lower.includes("time")) return "TIMESTAMP";
  if (lower.includes("float") || lower.includes("decimal")) return "NUMERIC";
  return "TEXT";
}

function mapTypeToMySQL(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "INT";
  if (lower.includes("varchar") || lower.includes("string")) return "VARCHAR(255)";
  if (lower.includes("text")) return "TEXT";
  if (lower.includes("bool")) return "BOOLEAN";
  if (lower.includes("date")) return "DATE";
  if (lower.includes("time")) return "DATETIME";
  if (lower.includes("float") || lower.includes("decimal")) return "DECIMAL(10,2)";
  return "TEXT";
}

function mapTypeToSQLite(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "INTEGER";
  if (lower.includes("varchar") || lower.includes("string") || lower.includes("text")) return "TEXT";
  if (lower.includes("bool")) return "INTEGER"; // SQLite uses 0/1 for boolean
  if (lower.includes("date") || lower.includes("time")) return "TEXT"; // ISO8601 strings
  if (lower.includes("float") || lower.includes("decimal")) return "REAL";
  return "TEXT";
}

function mapTypeToMSSQL(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "INT";
  if (lower.includes("varchar") || lower.includes("string")) return "NVARCHAR(255)";
  if (lower.includes("text")) return "NVARCHAR(MAX)";
  if (lower.includes("bool")) return "BIT";
  if (lower.includes("date")) return "DATE";
  if (lower.includes("time")) return "DATETIME2";
  if (lower.includes("float") || lower.includes("decimal")) return "DECIMAL(10,2)";
  return "NVARCHAR(MAX)";
}

function mapTypeToOracle(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "NUMBER";
  if (lower.includes("varchar") || lower.includes("string")) return "VARCHAR2(255)";
  if (lower.includes("text")) return "CLOB";
  if (lower.includes("bool")) return "NUMBER(1)"; // 0 or 1
  if (lower.includes("date")) return "DATE";
  if (lower.includes("time")) return "TIMESTAMP";
  if (lower.includes("float") || lower.includes("decimal")) return "NUMBER(10,2)";
  return "VARCHAR2(255)";
}

function mapTypeToMongoDB(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "int";
  if (lower.includes("varchar") || lower.includes("string") || lower.includes("text")) return "string";
  if (lower.includes("bool")) return "bool";
  if (lower.includes("date") || lower.includes("time")) return "date";
  if (lower.includes("float") || lower.includes("decimal")) return "double";
  return "string";
}

function mapTypeToTypeScript(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int") || lower.includes("float") || lower.includes("decimal")) return "number";
  if (lower.includes("bool")) return "boolean";
  if (lower.includes("date") || lower.includes("time")) return "Date";
  return "string";
}

function mapTypeToCassandra(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "int";
  if (lower.includes("varchar") || lower.includes("string")) return "text";
  if (lower.includes("text")) return "text";
  if (lower.includes("bool")) return "boolean";
  if (lower.includes("date")) return "date";
  if (lower.includes("time")) return "timestamp";
  if (lower.includes("float") || lower.includes("decimal")) return "decimal";
  return "text";
}

function mapTypeToDynamoDB(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int") || lower.includes("float") || lower.includes("decimal")) return "N"; // Number
  if (lower.includes("bool")) return "BOOL";
  return "S"; // String
}

function mapTypeToWatermelonDB(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes("int")) return "number";
  if (lower.includes("bool")) return "boolean";
  if (lower.includes("string") || lower.includes("varchar") || lower.includes("text")) return "string";
  return "string";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
