import fs from "fs";
import path from "path";

interface ColumnMeta {
  TableName: string;
  column_id: number;
  ColumnName: string;
  DataType: string;
  max_length: number;
  precision: number;
  scale: number;
  is_nullable: boolean;
  is_identity: boolean;
  DefaultDefinition: string | null;
}

interface PkMeta {
  TableName: string;
  PkName: string;
  ColumnName: string;
  key_ordinal: number;
}

interface FkMeta {
  FkName: string;
  ParentTable: string;
  ParentColumn: string;
  ReferencedTable: string;
  ReferencedColumn: string;
}

interface UqMeta {
  TableName: string;
  UniqueConstraintName: string;
  ColumnName: string;
  key_ordinal: number;
}

interface CkMeta {
  TableName: string;
  CheckName: string;
  CheckDefinition: string;
}

interface SchemaMeta {
  tables: string[];
  columns: ColumnMeta[];
  primaryKeys: PkMeta[];
  foreignKeys: FkMeta[];
  uniqueConstraints: UqMeta[];
  checkConstraints: CkMeta[];
}

const tableDescriptions: Record<string, { purpose: string; roleExample: string; processGroup: string }> = {
  // Catálogos
  Marca: {
    processGroup: "Catálogos Maestros",
    purpose: "Almacena las marcas fabricantes de componentes de hardware comercializados.",
    roleExample: "Estandariza los nombres de fabricantes (ej. Kingston, Corsair, AMD, Intel, ASUS, Samsung, Cooler Master). Evita errores tipográficos en el catálogo.",
  },
  Categoria: {
    processGroup: "Catálogos Maestros",
    purpose: "Clasifica los productos según su familia técnica o segmento de hardware.",
    roleExample: "Categorías como RAM, SSD, CPU, Grafica, Fuente de poder y Gabinete. Determina qué tabla de especialización debe completarse.",
  },
  Estado_Prod: {
    processGroup: "Catálogos Maestros",
    purpose: "Define la condición comercial del producto en el catálogo.",
    roleExample: "Estados: 'Disponible' (apto para venta), 'Agotado' (stock 0 temporal) y 'Descontinuado' (retirado del catálogo).",
  },
  Tipo_Comprobante: {
    processGroup: "Catálogos Maestros",
    purpose: "Catalogación de comprobantes de pago comerciales emitidos por la tienda.",
    roleExample: "Valores: 'Boleta' (consumidor final) y 'Factura' (empresas con RUC/contabilidad). Rige el prefijo B001 o F001.",
  },
  Metodo_Pago: {
    processGroup: "Catálogos Maestros",
    purpose: "Catálogo de medios de pago financieros admitidos en el Punto de Venta (POS).",
    roleExample: "Valores: 'Efectivo', 'Tarjeta', 'Transferencia' y 'Yape'. Permite combinar múltiples modalidades en una misma venta.",
  },
  Tipo_Movimiento: {
    processGroup: "Catálogos Maestros",
    purpose: "Tipifica la naturaleza de los registros de auditoría en el inventario Kardex.",
    roleExample: "Valores: 'Entrada' (recepción o reingreso RMA), 'Salida' (despacho por venta) y 'Ajuste' (cuadratura física).",
  },
  Estado_Dev: {
    processGroup: "Catálogos Maestros",
    purpose: "Controla las etapas del flujo administrativo y técnico de garantías.",
    roleExample: "Valores: 'Pendiente' (en evaluación), 'Aprobada' (garantía admitida) y 'Rechazada' (improcedente o daño inducido).",
  },
  Motivo_Dev: {
    processGroup: "Catálogos Maestros",
    purpose: "Clasifica la causa declarada por el cliente al presentar un reclamo de postventa.",
    roleExample: "Valores: 'Producto defectuoso' (falla física), 'Producto equivocado' (despacho erróneo de empaque sellado) y 'Garantía' (falla diferida).",
  },

  // Productos y Especializaciones
  Producto: {
    processGroup: "Productos y Especializaciones",
    purpose: "Entidad central del catálogo maestro comercial de componentes tecnológicos.",
    roleExample: "Contiene el código de barras único (EAN-13), nombre, precio unitario de venta, meses de garantía, existencias y referencias a marca y categoría.",
  },
  CPU: {
    processGroup: "Productos y Especializaciones",
    purpose: "Tabla hija de especialización técnica para procesadores centrales.",
    roleExample: "Almacena Frecuencia_ghz (ej. 3.40 GHz) y Nucleos (ej. 8 núcleos) para CPUs como AMD Ryzen 7 5700X o Intel i5-12400F.",
  },
  RAM: {
    processGroup: "Productos y Especializaciones",
    purpose: "Tabla hija de especialización técnica para memorias de acceso aleatorio.",
    roleExample: "Almacena Capacidad_gb (ej. 16 GB) y Velocidad_mhz (ej. 3200 MHz) para memorias DDR4/DDR5.",
  },
  SSD: {
    processGroup: "Productos y Especializaciones",
    purpose: "Tabla hija de especialización técnica para unidades de almacenamiento sólido.",
    roleExample: "Almacena Capacidad_gb (ej. 1000 GB) e Interfaz (ej. 'NVMe', 'SATA III') para discos rápidos.",
  },
  Grafica: {
    processGroup: "Productos y Especializaciones",
    purpose: "Tabla hija de especialización técnica para adaptadores de video y GPUs.",
    roleExample: "Almacena Vram_gb (ej. 8 GB) y Chipset (ej. 'GeForce RTX 4060') para tarjetas dedicadas.",
  },
  Fuente_Poder: {
    processGroup: "Productos y Especializaciones",
    purpose: "Tabla hija de especialización técnica para fuentes de alimentación.",
    roleExample: "Almacena Potencia_w (ej. 650 W) y Certificacion (ej. '80 Plus Bronze') para suministros eléctricos de PC.",
  },
  Gabinete: {
    processGroup: "Productos y Especializaciones",
    purpose: "Tabla hija de especialización técnica para chasis y cases de computadoras.",
    roleExample: "Almacena Formato (ej. 'Micro-ATX', 'ATX') y Material (ej. 'Acero y acrílico') para gabinetes.",
  },

  // Personas y Proveedores
  Cliente: {
    processGroup: "Personas y Entidades Comerciales",
    purpose: "Registro de clientes (personas naturales o jurídicas) compradores de la tienda.",
    roleExample: "Identificado por Dni_cliente (8 caracteres), almacena nombres, apellidos, teléfono y correo electrónico. Susceptible a enmascaramiento según Ley 29733.",
  },
  Empleado: {
    processGroup: "Personas y Entidades Comerciales",
    purpose: "Personal comercial y operativo responsable de ventas, movimientos y garantías.",
    roleExample: "Cajeros y almacenistas (ej. Carlos Vega Ramos, Rosa Paredes Luna) vinculados a la autoría de transacciones y Kardex.",
  },
  Proveedor: {
    processGroup: "Personas y Entidades Comerciales",
    purpose: "Empresas distribuidoras mayoristas que abastecen hardware a Mishutec.",
    roleExample: "Empresas registradas como 'Tecno Import Perú SAC', 'Distribuidora Andina de Cómputo' y 'Global Hardware SAC'.",
  },

  // Cadena de Suministro
  Suministra: {
    processGroup: "Cadena de Suministro y Abastecimiento",
    purpose: "Tabla asociativa que resuelve la relación muchos a muchos (M:N) entre Producto y Proveedor.",
    roleExample: "Permite que múltiples mayoristas coticen y abastezcan el mismo producto con su respectivo Precio_compra (ej. S/ 130 vs S/ 135 para Kingston Fury).",
  },

  // Ventas y Pagos
  Venta: {
    processGroup: "Ventas y Facturación Comercial",
    purpose: "Cabecera de transacciones comerciales de venta y comprobantes emitidos.",
    roleExample: "Almacena la fecha, número de comprobante único (UQ), tipo de comprobante, cliente, cajero y monto total facturado.",
  },
  Detalle_Venta: {
    processGroup: "Ventas y Facturación Comercial",
    purpose: "Líneas de detalle o artículos despachados en cada comprobante de venta.",
    roleExample: "Registra cada producto, cantidad despachada, precio unitario aplicado y subtotal verificado por CHECK (Subtotal = Cantidad * Precio).",
  },
  Venta_Metodo_Pago: {
    processGroup: "Ventas y Facturación Comercial",
    purpose: "Registro desglosado de medios de pago aplicados a cada transacción de venta.",
    roleExample: "Permite registrar pagos combinados (ej. Factura F001-000001 pagada con S/ 700.00 en Tarjeta y S/ 490.00 en Transferencia bancaria).",
  },

  // Inventario
  Mov_Inventario: {
    processGroup: "Gestión de Inventario y Almacén",
    purpose: "Libro mayor de movimientos físicos de almacén (Kardex transaccional).",
    roleExample: "Audita cada entrada por compras, salida por ventas o reingreso formal de garantías, con fecha, cantidad y empleado responsable.",
  },

  // Devoluciones y Garantías
  Devolucion: {
    processGroup: "Devoluciones y Garantías Postventa (RMA)",
    purpose: "Cabecera de expedientes de reclamación y trámites de garantía técnica.",
    roleExample: "Vinculada obligatoriamente a una Venta previa y a un Empleado técnico, almacena la fecha del trámite y su estado administrativo.",
  },
  Detalle_Dev: {
    processGroup: "Devoluciones y Garantías Postventa (RMA)",
    purpose: "Líneas de productos afectados en una solicitud de garantía.",
    roleExample: "Vinculada a una línea de Detalle_Venta específica y a un Motivo_Dev, registra la cantidad devuelta bajo restricción UNIQUE de línea.",
  },
};

function formatType(c: ColumnMeta): string {
  if (c.DataType === "varchar") return `VARCHAR(${c.max_length})`;
  if (c.DataType === "decimal") return `DECIMAL(${c.precision},${c.scale})`;
  if (c.DataType === "int") return "INT";
  if (c.DataType === "date") return "DATE";
  return c.DataType.toUpperCase();
}

function main() {
  const meta: SchemaMeta = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "docs/schema-metadata.json"), "utf-8"));

  let md = `# DICCIONARIO DE DATOS TÉCNICO DE LAS 25 TABLAS FÍSICAS
## Sistema de Gestión Comercial, Inventario y POS — MISHUTEC

> **Base de Datos:** \`MishutecT2\` / \`MishutecT2_Aceptacion\`  
> **Motor:** Microsoft SQL Server 2022 Express Edition (Esquema \`dbo\`)  
> **Conformidad Relacional:** 25 tablas en Tercera Forma Normal (3FN) con integridad referencial estricta.

---

## 1. ESTRUCTURA Y ORGANIZACIÓN DEL ESQUEMA

Las 25 tablas físicas del esquema \`dbo\` se encuentran organizadas en 7 agrupaciones funcionales que representan la totalidad del ciclo de vida comercial:

| Agrupación Funcional | Tablas Integradas | Cantidad | Propósito General |
|----------------------|-------------------|:--------:|-------------------|
| **1. Catálogos Maestros** | \`Marca\`, \`Categoria\`, \`Estado_Prod\`, \`Tipo_Comprobante\`, \`Metodo_Pago\`, \`Tipo_Movimiento\`, \`Estado_Dev\`, \`Motivo_Dev\` | 8 | Normalización de dominios cerrados y descripciones. |
| **2. Productos y Especializaciones** | \`Producto\`, \`CPU\`, \`RAM\`, \`SSD\`, \`Grafica\`, \`Fuente_Poder\`, \`Gabinete\` | 7 | Catálogo general y herencia relacional de especificaciones técnicas. |
| **3. Personas y Entidades** | \`Cliente\`, \`Empleado\`, \`Proveedor\` | 3 | Actores comerciales y personal operativo. |
| **4. Cadena de Suministro** | \`Suministra\` | 1 | Resolución $M:N$ Producto-Proveedor con precio de compra. |
| **5. Ventas y Facturación** | \`Venta\`, \`Detalle_Venta\`, \`Venta_Metodo_Pago\` | 3 | Cabeceras de comprobante, líneas de detalle y pagos mixtos. |
| **6. Inventario y Almacén** | \`Mov_Inventario\` | 1 | Kardex cronológico de entradas, salidas y ajustes. |
| **7. Devoluciones y Garantías** | \`Devolucion\`, \`Detalle_Dev\` | 2 | Expedientes RMA, resolución técnica y aislamiento de averías. |
| **TOTAL GENERAL** | — | **25** | **Esquema relacional físico completo.** |

---

`;

  // Sort tables by process groups
  const groups: Record<string, string[]> = {
    "1. Catálogos Maestros": ["Marca", "Categoria", "Estado_Prod", "Tipo_Comprobante", "Metodo_Pago", "Tipo_Movimiento", "Estado_Dev", "Motivo_Dev"],
    "2. Productos y Especializaciones de Hardware": ["Producto", "CPU", "RAM", "SSD", "Grafica", "Fuente_Poder", "Gabinete"],
    "3. Personas y Entidades Comerciales": ["Cliente", "Empleado", "Proveedor"],
    "4. Cadena de Suministro y Abastecimiento": ["Suministra"],
    "5. Ventas, Detalles y Pagos Mixtos (POS)": ["Venta", "Detalle_Venta", "Venta_Metodo_Pago"],
    "6. Gestión de Inventario y Almacén (Kardex)": ["Mov_Inventario"],
    "7. Devoluciones y Garantías Postventa (RMA)": ["Devolucion", "Detalle_Dev"],
  };

  for (const [groupTitle, tableList] of Object.entries(groups)) {
    md += `## ${groupTitle.toUpperCase()}\n\n`;

    for (const tableName of tableList) {
      const desc = tableDescriptions[tableName] || { purpose: "Sin descripción", roleExample: "N/A" };
      const cols = meta.columns.filter(c => c.TableName === tableName);
      const pks = meta.primaryKeys.filter(p => p.TableName === tableName);
      const fks = meta.foreignKeys.filter(f => f.ParentTable === tableName);
      const uqs = meta.uniqueConstraints.filter(u => u.TableName === tableName);
      const cks = meta.checkConstraints.filter(c => c.TableName === tableName);

      md += `### Tabla Física: \`dbo.${tableName}\`\n\n`;
      md += `* **Finalidad:** ${desc.purpose}\n`;
      md += `* **Rol en Mishutec:** ${desc.roleExample}\n`;
      md += `* **Clave Primaria (PK):** \`${pks.map(p => p.ColumnName).join(", ")}\` (${pks[0]?.PkName || "PK"})\n\n`;

      // Table columns
      md += `| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |\n`;
      md += `|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|\n`;

      for (const col of cols) {
        const isPk = pks.some(p => p.ColumnName === col.ColumnName);
        const fk = fks.find(f => f.ParentColumn === col.ColumnName);
        const uq = uqs.find(u => u.ColumnName === col.ColumnName);

        let notes = [];
        if (isPk) notes.push("**PK**");
        if (fk) notes.push(`**FK** $\\rightarrow$ \`${fk.ReferencedTable}.${fk.ReferencedColumn}\``);
        if (uq) notes.push(`**UNIQUE** (\`${uq.UniqueConstraintName}\`)`);

        md += `| ${col.column_id} | \`${col.ColumnName}\` | \`${formatType(col)}\` | ${col.is_nullable ? "NULL" : "**NOT NULL**"} | ${col.is_identity ? "IDENTITY(1,1)" : "No"} | ${col.DefaultDefinition ? `\`${col.DefaultDefinition}\`` : "—"} | ${notes.join(", ") || "Dato operacional"} |\n`;
      }
      md += `\n`;

      // Constraints details
      if (fks.length > 0 || cks.length > 0 || uqs.length > 0) {
        md += `**Restricciones de Integridad y Reglas de Negocio:**\n`;
        if (fks.length > 0) {
          md += `- **Claves Foráneas (FK):**\n`;
          for (const fk of fks) {
            md += `  - \`${fk.FkName}\`: \`${fk.ParentColumn}\` $\\rightarrow$ \`dbo.${fk.ReferencedTable}(${fk.ReferencedColumn})\`\n`;
          }
        }
        if (cks.length > 0) {
          md += `- **Restricciones de Dominio (CHECK):**\n`;
          for (const ck of cks) {
            md += `  - \`${ck.CheckName}\`: Condición lógica \`${ck.CheckDefinition}\`\n`;
          }
        }
        if (uqs.length > 0) {
          md += `- **Restricciones de Unicidad (UNIQUE):**\n`;
          // Group by unique constraint name
          const uqGrouped: Record<string, string[]> = {};
          for (const uq of uqs) {
            if (!uqGrouped[uq.UniqueConstraintName]) uqGrouped[uq.UniqueConstraintName] = [];
            uqGrouped[uq.UniqueConstraintName].push(uq.ColumnName);
          }
          for (const [uqName, cols] of Object.entries(uqGrouped)) {
            md += `  - \`${uqName}\`: Columnas \`(${cols.join(", ")})\`\n`;
          }
        }
        md += `\n`;
      }

      md += `---\n\n`;
    }
  }

  fs.writeFileSync(path.resolve(process.cwd(), "docs/sustentacion/02-diccionario-de-datos-25-tablas.md"), md, "utf-8");
  console.log("Diccionario de datos generado con éxito en docs/sustentacion/02-diccionario-de-datos-25-tablas.md");
}

main();
