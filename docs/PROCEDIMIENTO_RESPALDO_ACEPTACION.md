# Procedimiento de Respaldo y Entorno de Aceptación: MishutecT2_Aceptacion

## 1. Justificación y Directriz de Seguridad
La base de datos original **`MishutecT2`** contiene la información académica y de referencia inicial (10 productos, 5 ventas, 25 tablas en SQL Server Express).
Con el fin de garantizar que ninguna prueba o mutación de la Fase 3B (creación, edición o descontinuación) altere dicha información:
1. Se ha implementado un mecanismo de seguridad programático en [`src/lib/db-guard.ts`](file:///c:/Users/USER/Downloads/Mishutec/src/lib/db-guard.ts) que **bloquea cualquier mutación** dirigida a `MishutecT2` por defecto (`AcademicDatabaseProtectedError`).
2. Se formula el presente procedimiento para crear la base de datos independiente y persistente **`MishutecT2_Aceptacion`**.
3. **No se ejecuta ninguna restauración o creación de base de datos sin autorización previa del usuario.**

---

## 2. Metadatos de Almacenamiento en SQL Server

A partir de la consulta a `sys.database_files` en `DESKTOP-QV4VK5K\SQLEXPRESS`:
- **Archivo de Datos (MDF):**
  - Nombre Lógico: `MishutecT2`
  - Ruta Física: `C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\MishutecT2.mdf`
- **Archivo de Log Transaccional (LDF):**
  - Nombre Lógico: `MishutecT2_log`
  - Ruta Física: `C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\MishutecT2_log.ldf`

---

## 3. Instrucciones de Ejecución (Previa Aprobación)

El script SQL completo se encuentra disponible en:
[`scripts/backup-and-create-aceptacion.sql`](file:///c:/Users/USER/Downloads/Mishutec/scripts/backup-and-create-aceptacion.sql)

### Pasos para el Administrador:
1. Abrir **SQL Server Management Studio (SSMS)** o ejecutar mediante `sqlcmd`:
   ```bash
   sqlcmd -S DESKTOP-QV4VK5K\SQLEXPRESS -E -i scripts/backup-and-create-aceptacion.sql
   ```
2. Verificar que `MishutecT2_Aceptacion` se encuentre en línea y que reporte:
   - 10 productos
   - 5 ventas
   - 25 tablas
3. Para apuntar la aplicación a esta base de pruebas de aceptación, actualizar únicamente `.env.local`:
   ```ini
   DB_NAME=MishutecT2_Aceptacion
   ```
4. Ejecutar el diagnóstico para validar el cambio:
   ```bash
   npm run db:test
   ```
5. La base de aceptación será persistente entre fases y permitirá acumular los nuevos componentes registrados y probados.
