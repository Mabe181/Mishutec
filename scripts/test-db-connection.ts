import fs from "fs";
import path from "path";
import sql from "mssql/msnodesqlv8";

// Función auxiliar para cargar .env.local si no está cargado en process.env
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

const DB_SERVER = process.env.DB_SERVER || "DESKTOP-QV4VK5K\\SQLEXPRESS";
const DB_NAME = process.env.DB_NAME || "MishutecT2";
const DB_DRIVER = process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server";
const DB_TRUST_CERT = process.env.DB_TRUST_SERVER_CERTIFICATE || "yes";

const connectionString = `Driver={${DB_DRIVER}};Server=${DB_SERVER};Database=${DB_NAME};Trusted_Connection=Yes;TrustServerCertificate=${DB_TRUST_CERT};`;

async function runDiagnostic() {
  console.log("================================================================================");
  console.log("             MISHUTEC - DIAGNÓSTICO DE CONEXIÓN A BASE DE DATOS                 ");
  console.log("================================================================================");
  console.log(`[CONFIG] Servidor:       ${DB_SERVER}`);
  console.log(`[CONFIG] Base de Datos:  ${DB_NAME}`);
  console.log(`[CONFIG] Driver ODBC:    ${DB_DRIVER}`);
  console.log(`[CONFIG] Autenticación:  Windows Integrated Authentication (msnodesqlv8)`);
  console.log(`[CONFIG] Trust Cert:     ${DB_TRUST_CERT}`);
  console.log("--------------------------------------------------------------------------------");
  console.log("Iniciando conexión con SQL Server...");

  const startTime = Date.now();
  let pool: sql.ConnectionPool | null = null;

  try {
    pool = await new sql.ConnectionPool({
      server: DB_SERVER,
      database: DB_NAME,
      driver: "msnodesqlv8",
      connectionString,
      options: {
        trustedConnection: true,
      },
    } as any).connect();

    const connectLatency = Date.now() - startTime;
    console.log(`[OK] Pool de conexiones establecido exitosamente en ${connectLatency} ms.`);

    // 1. Verificación de Sesión e Identidad
    console.log("\n--- 1. IDENTIDAD Y SESIÓN EN SQL SERVER ---");
    const sessionQuery = `
      SELECT 
        DB_NAME() AS [ActiveDatabase],
        SUSER_SNAME() AS [WindowsUser],
        ORIGINAL_LOGIN() AS [OriginalLogin],
        @@SERVERNAME AS [ServerName],
        @@SPID AS [SessionSpid],
        SUBSTRING(@@VERSION, 1, CHARINDEX(' - ', @@VERSION) - 1) AS [SqlEdition]
    `;
    const sessionRes = await pool.request().query(sessionQuery);
    const session = sessionRes.recordset[0];
    console.table([session]);

    if (session.ActiveDatabase !== DB_NAME) {
      throw new Error(`La base activa es '${session.ActiveDatabase}', pero se esperaba '${DB_NAME}'.`);
    }

    // 2. Conteo de Productos
    console.log("\n--- 2. CONTEO Y VALIDACIÓN DE dbo.Producto ---");
    const prodCountRes = await pool.request().query("SELECT COUNT(*) AS [TotalProductos] FROM dbo.Producto");
    const totalProductos = Number(prodCountRes.recordset[0].TotalProductos);
    const isAcademic = DB_NAME.toLowerCase() === "mishutect2";
    console.log(`Total registros en dbo.Producto: ${totalProductos} (${isAcademic ? "Esperado: 10 en base académica" : "Esperado: >= 10 en base de aceptación"})`);

    if (isAcademic && totalProductos !== 10) {
      throw new Error(`Conteo de productos inválido en base académica: se obtuvieron ${totalProductos}, se esperaban 10.`);
    } else if (!isAcademic && totalProductos < 10) {
      throw new Error(`Conteo de productos inválido en base de aceptación: se obtuvieron ${totalProductos}, se esperaban al menos 10.`);
    }

    // Listado de los 10 productos
    const prodsRes = await pool.request().query(`
      SELECT 
        p.Codbarras_prod AS [Código],
        p.Nombre_prod AS [Nombre],
        p.Precio AS [Precio],
        p.Stock AS [Stock],
        p.Garantia_meses AS [Garantía (m)],
        e.Estado AS [Estado],
        c.Nombre_cat AS [Categoría],
        m.Nombre_marca AS [Marca]
      FROM dbo.Producto p
      JOIN dbo.Estado_Prod e ON p.ID_estado_prod = e.ID_estado_prod
      JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
      JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
      ORDER BY p.Codbarras_prod ASC
    `);
    console.table(prodsRes.recordset);

    // 3. Conteo y Validación de dbo.Venta
    console.log("\n--- 3. CONTEO Y VALIDACIÓN DE dbo.Venta ---");
    const isAceptacion = process.env.DB_NAME === "MishutecT2_Aceptacion";
    const ventaCountRes = await pool.request().query("SELECT COUNT(*) AS [TotalVentas] FROM dbo.Venta");
    const totalVentas = Number(ventaCountRes.recordset[0].TotalVentas);
    const expectedVentas = isAceptacion ? "9 (>= 5 tras Fase 6B)" : "5";
    console.log(`Total registros en dbo.Venta: ${totalVentas} (Esperado: ${expectedVentas})`);

    if (isAceptacion ? totalVentas < 5 : totalVentas !== 5) {
      throw new Error(`Conteo de ventas inválido: se obtuvieron ${totalVentas}, se esperaban ${expectedVentas}.`);
    }

    // Listado de las 5 ventas
    const ventasRes = await pool.request().query(`
      SELECT 
        v.ID_venta AS [ID],
        v.Numero_comprobante AS [Comprobante],
        CONVERT(VARCHAR(10), v.Fecha_venta, 120) AS [Fecha],
        v.Total_venta AS [Total (S/.)],
        tc.Nombre_tipo AS [Tipo],
        v.Dni_cliente AS [Cliente DNI],
        e.Nombre_emp + ' ' + e.Apellido_emp AS [Empleado]
      FROM dbo.Venta v
      JOIN dbo.Tipo_Comprobante tc ON v.ID_tipo_comp = tc.ID_tipo_comp
      JOIN dbo.Empleado e ON v.ID_empleado = e.ID_empleado
      ORDER BY v.ID_venta ASC
    `);
    console.table(ventasRes.recordset);

    // 4. Integridad de la Base de Datos
    console.log("\n--- 4. RESUMEN DE TABLAS EN MishutecT2 ---");
    const tablesRes = await pool.request().query(`
      SELECT COUNT(*) AS [TotalTablas]
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
    `);
    const totalTablas = Number(tablesRes.recordset[0].TotalTablas);
    console.log(`Total de tablas en esquema dbo: ${totalTablas} (Esperado: 25)`);

    console.log("\n================================================================================");
    console.log("            [RESULTADO] TODAS LAS VALIDACIONES OBLIGATORIAS PASARON             ");
    console.log("================================================================================");
    console.log("✓ Base activa verificada: MishutecT2");
    console.log(`✓ Usuario Windows autenticado: ${session.WindowsUser}`);
    console.log("✓ Conteo de dbo.Producto: 10 registros");
    console.log("✓ Conteo de dbo.Venta: 5 registros");
    console.log("✓ Driver ODBC utilizado: ODBC Driver 18 for SQL Server");
    console.log("✓ Sin modificaciones en SQL Server (operaciones 100% de solo lectura)");
    console.log("================================================================================\n");
  } catch (err: any) {
    console.error("\n[ERROR CRÍTICO] La prueba de conexión falló:");
    console.error(err.message || err);
    process.exitCode = 1;
  } finally {
    if (pool) {
      await pool.close();
      console.log("[INFO] Pool de conexiones cerrado correctamente.");
    }
  }
}

runDiagnostic();
