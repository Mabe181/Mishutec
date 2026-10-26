-- ============================================================================
-- MISHUTEC - SCRIPT DE RESPALDO Y CREACIÓN DE BASE DE ACEPTACIÓN
-- Base de Datos Origen: MishutecT2
-- Base de Datos Destino: MishutecT2_Aceptacion
-- Servidor: DESKTOP-QV4VK5K\SQLEXPRESS
-- ============================================================================
-- ADVERTENCIA:
-- Este script es preparado para revisión del Administrador / Arquitecto.
-- NO se ejecuta automáticamente para proteger la integridad de MishutecT2.
-- ============================================================================

USE [master];
GO

-- 1. Crear respaldo completo de la base académica MishutecT2
BACKUP DATABASE [MishutecT2]
TO DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Backup\MishutecT2_Academica.bak'
WITH FORMAT, INIT, NAME = N'MishutecT2-Respaldo-Completo', SKIP, NOREWIND, NOUNLOAD, STATS = 10;
GO

-- 2. Restaurar copia persistente e independiente como MishutecT2_Aceptacion
RESTORE DATABASE [MishutecT2_Aceptacion]
FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Backup\MishutecT2_Academica.bak'
WITH 
  MOVE N'MishutecT2' TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\MishutecT2_Aceptacion.mdf',
  MOVE N'MishutecT2_log' TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\MishutecT2_Aceptacion_log.ldf',
  NOUNLOAD, STATS = 10;
GO

-- 3. Verificación de integridad y contenido de la nueva base de aceptación
SELECT name, database_id, create_date FROM sys.databases WHERE name IN ('MishutecT2', 'MishutecT2_Aceptacion');
GO

USE [MishutecT2_Aceptacion];
GO
SELECT 'Producto' AS Tabla, COUNT(*) AS TotalRegistros FROM dbo.Producto
UNION ALL
SELECT 'Venta', COUNT(*) FROM dbo.Venta
UNION ALL
SELECT 'Tablas Esquema dbo', COUNT(*) FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo');
GO
