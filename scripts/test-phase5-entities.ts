import fs from "fs";
import path from "path";

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

import sql from "mssql/msnodesqlv8";
import { getPool, closePool } from "../src/lib/db";
import {
  createClient,
  updateClient,
  getClientDetail,
  DuplicateDniError,
} from "../src/lib/repositories/client.repository";
import {
  createSupplier,
  updateSupplier,
  addOrUpdateSuppliedProduct,
  getSupplierDetail,
} from "../src/lib/repositories/supplier.repository";
import {
  createEmployee,
  updateEmployee,
  getEmployeeDetail,
} from "../src/lib/repositories/employee.repository";
import { registerClient } from "../src/lib/services/client.service";
import { registerSupplier } from "../src/lib/services/supplier.service";
import { registerEmployee } from "../src/lib/services/employee.service";
import { clientSchema, employeeSchema } from "../src/lib/validations/entity.schema";

async function runPhase5Tests() {
  console.log("================================================================================");
  console.log("    MISHUTEC - PRUEBAS DE CLIENTES, PROVEEDORES Y EMPLEADOS (FASE 5)            ");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail = "") {
    if (condition) {
      console.log(`[PASS] ${name}${detail ? ` -> ${detail}` : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}${detail ? ` -> ${detail}` : ""}`);
      failed++;
    }
  }

  const pool = await getPool();

  try {
    const activeDbRes = await pool.request().query("SELECT DB_NAME() AS db");
    const activeDb = activeDbRes.recordset[0].db;
    console.log(`[INFO] Base de datos activa para pruebas: ${activeDb}`);
    assert(
      "Entorno de pruebas: Base de aceptación MishutecT2_Aceptacion activa",
      activeDb.toLowerCase() === "mishutect2_aceptacion",
      `BD: ${activeDb}`
    );

    // Preparar identificadores únicos de prueba
    const testClientDni = "79990001";
    const testEmployeeDni = "49990001";

    // Limpiar registros de prueba previos para garantizar idempotencia
    await pool.request().query(`
      DELETE FROM dbo.Suministra WHERE ID_proveedor IN (SELECT ID_proveedor FROM dbo.Proveedor WHERE Nombre_prov = 'Tech Distributors Test SAC');
      DELETE FROM dbo.Proveedor WHERE Nombre_prov = 'Tech Distributors Test SAC';
      DELETE FROM dbo.Cliente WHERE Dni_cliente = '${testClientDni}';
      DELETE FROM dbo.Empleado WHERE Dni_emp = '${testEmployeeDni}';
    `);

    // 1. Registro de cliente
    console.log("\n--- PRUEBA 1: Registro de cliente ---");
    const cliRes = await createClient({
      dni: testClientDni,
      nombre: "Carlos Roberto",
      apellido: "Méndez Silva",
      telefono: "998877665",
      correo: "carlos.mendez@test.pe",
    });
    assert("1. Cliente registrado exitosamente en SQL Server", cliRes.dni === testClientDni);

    // 2. Rechazo de DNI duplicado de cliente
    console.log("\n--- PRUEBA 2: Rechazo de DNI duplicado de cliente ---");
    let duplicateClientRejected = false;
    try {
      await createClient({
        dni: testClientDni,
        nombre: "Otro",
        apellido: "Cliente",
        telefono: undefined,
        correo: "otro@test.pe",
      });
    } catch (err) {
      if (err instanceof DuplicateDniError) {
        duplicateClientRejected = true;
      }
    }
    assert("2. Rechazo de cliente con DNI duplicado", duplicateClientRejected);

    // 3. Edición de cliente
    console.log("\n--- PRUEBA 3: Edición de cliente ---");
    await updateClient(testClientDni, {
      nombre: "Carlos Roberto",
      apellido: "Méndez Modificado",
      telefono: "998877000",
      correo: "carlos.modificado@test.pe",
    });
    const updatedCli = await getClientDetail(testClientDni);
    assert(
      "3. Cliente editado correctamente en SQL Server",
      updatedCli?.apellido === "Méndez Modificado" && updatedCli?.telefono === "998877000"
    );

    // 4. Registro de proveedor
    console.log("\n--- PRUEBA 4: Registro de proveedor ---");
    const provRes = await createSupplier({
      nombre: "Tech Distributors Test SAC",
      correo: "ventas@techdisttest.pe",
      telefono: "019876543",
    });
    assert("4. Proveedor registrado exitosamente con ID generado", provRes.idProveedor > 0);
    const testProvId = provRes.idProveedor;

    // 5. Edición de proveedor
    console.log("\n--- PRUEBA 5: Edición de proveedor ---");
    await updateSupplier(testProvId, {
      nombre: "Tech Distributors Test SAC Actualizado",
      correo: "contacto@techdisttest.pe",
      telefono: "019876999",
    });
    const updatedProv = await getSupplierDetail(testProvId);
    assert(
      "5. Proveedor editado correctamente",
      updatedProv?.nombre === "Tech Distributors Test SAC Actualizado" &&
        updatedProv?.correo === "contacto@techdisttest.pe"
    );

    // 6. Consulta de productos suministrados (dbo.Suministra)
    console.log("\n--- PRUEBA 6: Asociación y consulta de productos suministrados ---");
    await addOrUpdateSuppliedProduct({
      idProveedor: testProvId,
      codbarras: "7750000000001",
      precioCompra: 142.5,
    });
    const provWithProd = await getSupplierDetail(testProvId);
    assert(
      "6. Producto asociado al proveedor en dbo.Suministra",
      provWithProd?.productos.length === 1 && provWithProd.productos[0].precioCompra === 142.5
    );

    // 7. Registro de empleado
    console.log("\n--- PRUEBA 7: Registro de empleado ---");
    const empRes = await createEmployee({
      dni: testEmployeeDni,
      nombre: "Fernando",
      apellido: "Castillo Bravo",
    });
    assert("7. Empleado registrado exitosamente con ID generado", empRes.idEmpleado > 0);
    const testEmpId = empRes.idEmpleado;

    // 8. Rechazo de DNI de empleado duplicado
    console.log("\n--- PRUEBA 8: Rechazo de DNI de empleado duplicado ---");
    let duplicateEmpRejected = false;
    try {
      await createEmployee({
        dni: testEmployeeDni,
        nombre: "Otro",
        apellido: "Empleado",
      });
    } catch (err) {
      if (err instanceof DuplicateDniError) {
        duplicateEmpRejected = true;
      }
    }
    assert("8. Rechazo de empleado con DNI duplicado", duplicateEmpRejected);

    // 9. Edición de empleado
    console.log("\n--- PRUEBA 9: Edición de empleado ---");
    await updateEmployee(testEmpId, {
      nombre: "Fernando Javier",
      apellido: "Castillo Bravo",
    });
    const updatedEmp = await getEmployeeDetail(testEmpId);
    assert("9. Empleado editado correctamente", updatedEmp?.nombre === "Fernando Javier");

    // 10. Historial de ventas por cliente
    console.log("\n--- PRUEBA 10: Historial de ventas por cliente ---");
    const clientWithSales = await getClientDetail("72145890"); // Ana Torres Quispe
    assert(
      "10. Historial de ventas por cliente recuperado",
      (clientWithSales?.ventas.length ?? 0) === 2 && clientWithSales?.montoTotalComprado === 2090
    );

    // 11. Historial de movimientos y ventas por empleado
    console.log("\n--- PRUEBA 11: Historial operativo por empleado ---");
    const empHistory = await getEmployeeDetail(1); // Carlos Vega Ramos
    assert(
      "11. Historial operativo de empleado recuperado",
      empHistory !== null &&
        empHistory.ventas.length === 2 &&
        empHistory.movimientos.length >= 10 &&
        empHistory.devoluciones.length === 1
    );

    // 12. Validaciones del servidor (Zod)
    console.log("\n--- PRUEBA 12: Validaciones de esquemas Zod ---");
    const invalidDni = clientSchema.safeParse({
      dni: "123", // menos de 8
      nombre: "A",
      apellido: "B",
      correo: "invalido",
    });
    const invalidEmpDni = employeeSchema.safeParse({
      dni: "abcdefgh", // letras
      nombre: "Test",
      apellido: "Test",
    });
    assert("12. Esquema cliente rechaza DNI inválido y correo malformado", !invalidDni.success);
    assert("12. Esquema empleado rechaza DNI no numérico", !invalidEmpDni.success);

    // 13 & 14. Rechazo de mutaciones no autorizadas (Sesión administrativa)
    console.log("\n--- PRUEBA 13 & 14: Protección de autorización y sesión admin ---");
    const unauthCli = await registerClient({
      dni: "78881111",
      nombre: "Test",
      apellido: "Test",
      correo: "test@test.pe",
    });
    const unauthProv = await registerSupplier({
      nombre: "Test",
      correo: "test@test.pe",
      telefono: "999888777",
    });
    const unauthEmp = await registerEmployee({
      dni: "48881111",
      nombre: "Test",
      apellido: "Test",
    });
    assert("13. registerClient sin sesión devuelve HTTP 401", unauthCli.statusCode === 401);
    assert("14. registerSupplier sin sesión devuelve HTTP 401", unauthProv.statusCode === 401);
    assert("14. registerEmployee sin sesión devuelve HTTP 401", unauthEmp.statusCode === 401);

    // 15. Integridad de relaciones FK
    console.log("\n--- PRUEBA 15: Integridad de relaciones FK ---");
    const fkReq = pool.request();
    const fkCheck = await fkReq.query(`
      SELECT 
        (SELECT COUNT(*) FROM dbo.Venta v LEFT JOIN dbo.Cliente c ON v.Dni_cliente = c.Dni_cliente WHERE c.Dni_cliente IS NULL) AS VentasSinCliente,
        (SELECT COUNT(*) FROM dbo.Suministra s LEFT JOIN dbo.Proveedor pr ON s.ID_proveedor = pr.ID_proveedor WHERE pr.ID_proveedor IS NULL) AS SuministraSinProv,
        (SELECT COUNT(*) FROM dbo.Mov_Inventario m LEFT JOIN dbo.Empleado e ON m.ID_empleado = e.ID_empleado WHERE e.ID_empleado IS NULL) AS MovsSinEmp;
    `);
    const fks = fkCheck.recordset[0];
    assert("15. Cero ventas huérfanas sin cliente", fks.VentasSinCliente === 0);
    assert("15. Cero relaciones Suministra huérfanas", fks.SuministraSinProv === 0);
    assert("15. Cero movimientos de inventario huérfanos sin empleado", fks.MovsSinEmp === 0);

    // 16. Integridad de la base académica original MishutecT2
    console.log("\n--- PRUEBA 16: Integridad estricta de la base académica MishutecT2 ---");
    const acadPool = await new sql.ConnectionPool({
      server: process.env.DB_SERVER,
      database: "MishutecT2",
      driver: "msnodesqlv8",
      connectionString: `Driver={ODBC Driver 18 for SQL Server};Server=${process.env.DB_SERVER};Database=MishutecT2;Trusted_Connection=yes;TrustServerCertificate=yes;`,
    } as any).connect();

    const [acadProd, acadStock, acadVent, acadImp, acadCli, acadProv, acadEmp] =
      await Promise.all([
        acadPool.request().query("SELECT COUNT(*) AS total FROM dbo.Producto"),
        acadPool.request().query("SELECT SUM(Stock) AS totalStock FROM dbo.Producto"),
        acadPool.request().query("SELECT COUNT(*) AS total FROM dbo.Venta"),
        acadPool.request().query("SELECT SUM(Total_venta) AS totalVenta FROM dbo.Venta"),
        acadPool.request().query("SELECT COUNT(*) AS total FROM dbo.Cliente"),
        acadPool.request().query("SELECT COUNT(*) AS total FROM dbo.Proveedor"),
        acadPool.request().query("SELECT COUNT(*) AS total FROM dbo.Empleado"),
      ]);

    const aProd = Number(acadProd.recordset[0].total);
    const aStock = Number(acadStock.recordset[0].totalStock);
    const aVent = Number(acadVent.recordset[0].total);
    const aImp = Number(acadImp.recordset[0].totalVenta);
    const aCli = Number(acadCli.recordset[0].total);
    const aProv = Number(acadProv.recordset[0].total);
    const aEmp = Number(acadEmp.recordset[0].total);

    assert("16. Base académica conserva exactamente 10 productos", aProd === 10, `Productos: ${aProd}`);
    assert("16. Base académica conserva exactamente 73 unidades de stock", aStock === 73, `Stock: ${aStock}`);
    assert("16. Base académica conserva exactamente 5 ventas", aVent === 5, `Ventas: ${aVent}`);
    assert("16. Base académica conserva exactamente S/ 4,050.00 en ventas", aImp === 4050, `Ventas: S/ ${aImp}`);
    assert("16. Base académica conserva exactamente 5 clientes originales", aCli === 5, `Clientes: ${aCli}`);
    assert("16. Base académica conserva exactamente 3 proveedores originales", aProv === 3, `Proveedores: ${aProv}`);
    assert("16. Base académica conserva exactamente 3 empleados originales", aEmp === 3, `Empleados: ${aEmp}`);

    await acadPool.close();

    console.log("\n================================================================================");
    console.log(`                     RESUMEN: ${passed} PASADAS | ${failed} FALLADAS                   `);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await closePool();
  }
}

runPhase5Tests().catch((err) => {
  console.error("Error fatal en pruebas de Fase 5:", err);
  process.exit(1);
});
