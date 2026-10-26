/*
PROYECTO DE BASE DE DATOS: MISHUTECT2
Capítulo 8: Sentencias DDL y DML
Motor: Microsoft SQL Server

CÓMO FUNCIONA ESTE SCRIPT
1. NO se crea ninguna tabla extra (no hay tablas "Demo"). Todas las sentencias
   se aplican sobre las tablas reales del proyecto.
2. Cada sentencia se demuestra con un "error y corrección":
   - CREATE : algunas tablas se crean a propósito incompletas o con un error.
   - TRUNCATE: se cargan filas erróneas en Mov_Inventario y se vacía la tabla.
   - ALTER  : se completan/corrigen las tablas (columnas, PK, UNIQUE, CHECK, DEFAULT, FK).
   - DROP   : se elimina una tabla creada con el nombre mal escrito y se crea la correcta.
   - INSERT / DELETE / UPDATE: se ingresan datos con errores de digitación,
     se eliminan o se corrigen, y quedan los datos correctos del negocio.
3. Los datos finales QUEDAN GUARDADOS (no hay ROLLBACK).
4. Ejecuta el archivo COMPLETO una sola vez sobre una instancia sin la base MishutecT2.
   Si necesitas repetirlo, primero ejecuta:
       USE master; ALTER DATABASE MishutecT2 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
       DROP DATABASE MishutecT2;
*/

-- =====================================================================
-- 8.1. SENTENCIAS DDL (DATA DEFINITION LANGUAGE)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 8.1.1. CREATE
-- ---------------------------------------------------------------------
Create database MishutecT2
GO

USE MishutecT2;
GO

-- Tablas catálogo
CREATE TABLE dbo.Marca (
    ID_marca INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_marca VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dbo.Categoria (
    ID_categoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_cat VARCHAR(50) NOT NULL UNIQUE,
    Descripcion_cat VARCHAR(200)
);

CREATE TABLE dbo.Estado_Prod (
    ID_estado_prod INT IDENTITY(1,1) PRIMARY KEY,
    Estado VARCHAR(30) NOT NULL UNIQUE
);

-- ERROR INTENCIONAL (se corrige en ALTER):
--   * Nombre_prov quedó permitiendo NULL
--   * la columna de correo se escribió mal: "Corero_prov" en vez de "Correo_prov"
CREATE TABLE dbo.Proveedor (
    ID_proveedor INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_prov VARCHAR(100) NULL,
    Corero_prov VARCHAR(100),
    Telefono_prov VARCHAR(15) 
);

CREATE TABLE dbo.Tipo_Comprobante (
    ID_tipo_comp INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_tipo VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE dbo.Metodo_Pago (
    ID_metodo INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_metodo VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE dbo.Tipo_Movimiento (
    ID_tipo_mov INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_tipo VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE dbo.Estado_Dev (
    ID_estado_dev INT IDENTITY(1,1) PRIMARY KEY,
    Nombre_estado VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE dbo.Motivo_Dev (
    ID_motivo INT IDENTITY(1,1) PRIMARY KEY,
    Descripcion_motivo VARCHAR(100) NOT NULL UNIQUE
);

-- Producto
-- INCOMPLETO A PROPÓSITO (se completa en ALTER): falta CHECK de Precio,
-- CHECK de Garantia_meses y el valor DEFAULT de Stock.
CREATE TABLE dbo.Producto (
    Codbarras_prod VARCHAR(13) PRIMARY KEY,
    Nombre_prod VARCHAR(120) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Garantia_meses INT NOT NULL,
    Stock INT NOT NULL,
    ID_estado_prod INT NOT NULL,
    ID_categoria INT NOT NULL,
    ID_marca INT NOT NULL,
    CONSTRAINT CK_Producto_Stock CHECK (Stock >= 0),
    CONSTRAINT FK_Producto_Estado FOREIGN KEY (ID_estado_prod) REFERENCES dbo.Estado_Prod(ID_estado_prod),
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY (ID_categoria) REFERENCES dbo.Categoria(ID_categoria),
    CONSTRAINT FK_Producto_Marca FOREIGN KEY (ID_marca) REFERENCES dbo.Marca(ID_marca)
);

CREATE TABLE dbo.Suministra (
    Codbarras_prod VARCHAR(13) NOT NULL,
    ID_proveedor INT NOT NULL,
    Precio_compra DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_Suministra PRIMARY KEY (Codbarras_prod, ID_proveedor),
    CONSTRAINT CK_Suministra_Precio CHECK (Precio_compra > 0),
    CONSTRAINT FK_Suministra_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod),
    CONSTRAINT FK_Suministra_Proveedor FOREIGN KEY (ID_proveedor) REFERENCES dbo.Proveedor(ID_proveedor)
);

-- Especializaciones de Producto
CREATE TABLE dbo.CPU (
    Codbarras_prod VARCHAR(13) PRIMARY KEY,
    Frecuencia_ghz DECIMAL(4,2) NOT NULL,
    Nucleos INT NOT NULL,
    CONSTRAINT FK_CPU_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod)
);

CREATE TABLE dbo.RAM (
    Codbarras_prod VARCHAR(13) PRIMARY KEY,
    Capacidad_gb INT NOT NULL,
    Velocidad_mhz INT NOT NULL,
    CONSTRAINT FK_RAM_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod)
);

CREATE TABLE dbo.SSD (
    Codbarras_prod VARCHAR(13) PRIMARY KEY,
    Capacidad_gb INT NOT NULL,
    Interfaz VARCHAR(20) NOT NULL,
    CONSTRAINT FK_SSD_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod)
);

CREATE TABLE dbo.Grafica (
    Codbarras_prod VARCHAR(13) PRIMARY KEY,
    Vram_gb INT NOT NULL,
    Chipset VARCHAR(50) NOT NULL,
    CONSTRAINT FK_Grafica_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod)
);

CREATE TABLE dbo.Fuente_Poder (
    Codbarras_prod VARCHAR(13) PRIMARY KEY,
    Potencia_w INT NOT NULL,
    Certificacion VARCHAR(30) NOT NULL,
    CONSTRAINT FK_Fuente_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod)
);

CREATE TABLE dbo.Gabinete (
    Codbarras_prod VARCHAR(13) PRIMARY KEY,
    Formato VARCHAR(20) NOT NULL,
    Material VARCHAR(30) NOT NULL,
    CONSTRAINT FK_Gabinete_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod)
);

-- Personas
-- INCOMPLETO A PROPÓSITO: a Cliente le falta la columna Correo_cl (se agrega en ALTER).
CREATE TABLE dbo.Cliente (
    Dni_cliente VARCHAR(8) PRIMARY KEY,
    Nombre_cl VARCHAR(60) NOT NULL,
    Apellido_cl VARCHAR(60) NOT NULL,
    Telefono_cl VARCHAR(15)
);

-- ERROR INTENCIONAL: Nombre_emp quedó muy corto (20); no cabrían nombres compuestos.
CREATE TABLE dbo.Empleado (
    ID_empleado INT IDENTITY(1,1) PRIMARY KEY,
    Dni_emp VARCHAR(8) NOT NULL UNIQUE,
    Nombre_emp VARCHAR(20) NOT NULL,
    Apellido_emp VARCHAR(60) NOT NULL
);

-- Ventas, detalle y pagos
-- INCOMPLETO A PROPÓSITO: falta UNIQUE en Numero_comprobante y el DEFAULT de Fecha_venta.
CREATE TABLE dbo.Venta (
    ID_venta INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_venta DATE NOT NULL,
    Total_venta DECIMAL(10,2) NOT NULL,
    Numero_comprobante VARCHAR(20) NOT NULL,
    ID_tipo_comp INT NOT NULL,
    Dni_cliente VARCHAR(8) NOT NULL,
    ID_empleado INT NOT NULL,
    CONSTRAINT CK_Venta_Total CHECK (Total_venta >= 0),
    CONSTRAINT FK_Venta_TipoComp FOREIGN KEY (ID_tipo_comp) REFERENCES dbo.Tipo_Comprobante(ID_tipo_comp),
    CONSTRAINT FK_Venta_Cliente FOREIGN KEY (Dni_cliente) REFERENCES dbo.Cliente(Dni_cliente),
    CONSTRAINT FK_Venta_Empleado FOREIGN KEY (ID_empleado) REFERENCES dbo.Empleado(ID_empleado)
);

CREATE TABLE dbo.Detalle_Venta (
    ID_detalle INT IDENTITY(1,1) PRIMARY KEY,
    Cantidad INT NOT NULL,
    Precio_unitario DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    ID_venta INT NOT NULL,
    Codbarras_prod VARCHAR(13) NOT NULL,
    CONSTRAINT CK_Detalle_Cantidad CHECK (Cantidad > 0),
    CONSTRAINT CK_Detalle_Subtotal CHECK (Subtotal = Cantidad * Precio_unitario),
    CONSTRAINT UQ_Detalle_Venta_Prod UNIQUE (ID_venta, Codbarras_prod),
    CONSTRAINT FK_Detalle_Venta FOREIGN KEY (ID_venta) REFERENCES dbo.Venta(ID_venta),
    CONSTRAINT FK_Detalle_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod)
);

-- ERROR INTENCIONAL: el nombre de la tabla se escribió mal ("Venta_Metdo_Pago").
-- Se elimina con DROP TABLE en la sección 8.1.4 y se crea con el nombre correcto.
CREATE TABLE dbo.Venta_Metdo_Pago (
    ID_venta INT NOT NULL,
    ID_metodo INT NOT NULL,
    Monto_pagado DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_Venta_Metdo_Pago PRIMARY KEY (ID_venta, ID_metodo),
    CONSTRAINT CK_VMetdoP_Monto CHECK (Monto_pagado > 0),
    CONSTRAINT FK_VMetdoP_Venta FOREIGN KEY (ID_venta) REFERENCES dbo.Venta(ID_venta),
    CONSTRAINT FK_VMetdoP_Metodo FOREIGN KEY (ID_metodo) REFERENCES dbo.Metodo_Pago(ID_metodo)
);

-- Inventario
-- INCOMPLETO A PROPÓSITO (se completa en ALTER): sin PRIMARY KEY y sin FOREIGN KEY.
CREATE TABLE dbo.Mov_Inventario (
    ID_movimiento INT IDENTITY(1,1) NOT NULL,
    Fecha DATE NOT NULL,
    Cantidad INT NOT NULL,
    ID_tipo_mov INT NOT NULL,
    Codbarras_prod VARCHAR(13) NOT NULL,
    ID_empleado INT NOT NULL,
    CONSTRAINT CK_Mov_Cantidad CHECK (Cantidad > 0)
);

-- Devoluciones
CREATE TABLE dbo.Devolucion (
    ID_devolucion INT IDENTITY(1,1) PRIMARY KEY,
    Fecha_dev DATE NOT NULL,
    ID_estado_dev INT NOT NULL,
    ID_venta INT NOT NULL,
    ID_empleado INT NOT NULL,
    CONSTRAINT FK_Dev_Estado FOREIGN KEY (ID_estado_dev) REFERENCES dbo.Estado_Dev(ID_estado_dev),
    CONSTRAINT FK_Dev_Venta FOREIGN KEY (ID_venta) REFERENCES dbo.Venta(ID_venta),
    CONSTRAINT FK_Dev_Empleado FOREIGN KEY (ID_empleado) REFERENCES dbo.Empleado(ID_empleado)
);

CREATE TABLE dbo.Detalle_Dev (
    ID_detalle_dev INT IDENTITY(1,1) PRIMARY KEY,
    Cantidad_dev INT NOT NULL,
    ID_devolucion INT NOT NULL,
    ID_detalle INT NOT NULL,
    ID_motivo INT NOT NULL,
    CONSTRAINT CK_DetDev_Cantidad CHECK (Cantidad_dev > 0),
    CONSTRAINT UQ_DetDev UNIQUE (ID_devolucion, ID_detalle),
    CONSTRAINT FK_DetDev_Devolucion FOREIGN KEY (ID_devolucion) REFERENCES dbo.Devolucion(ID_devolucion),
    CONSTRAINT FK_DetDev_Detalle FOREIGN KEY (ID_detalle) REFERENCES dbo.Detalle_Venta(ID_detalle),
    CONSTRAINT FK_DetDev_Motivo FOREIGN KEY (ID_motivo) REFERENCES dbo.Motivo_Dev(ID_motivo)
);
GO

-- Verificar las tablas creadas (se observa "Venta_Metdo_Pago" con el nombre mal escrito)
SELECT TABLE_NAME AS Tabla_Creada
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

-- ---------------------------------------------------------------------
-- 8.1.2. TRUNCATE
-- TRUNCATE elimina TODAS las filas, no admite WHERE y reinicia el IDENTITY.
-- No funciona sobre tablas referenciadas por una FOREIGN KEY, por eso se
-- aplica a Mov_Inventario (nadie la referencia y aún no tiene sus FK).
-- Se cargan movimientos erróneos (cantidades y códigos mal digitados) y se vacía la tabla.
-- ---------------------------------------------------------------------
INSERT INTO dbo.Mov_Inventario (Fecha, Cantidad, ID_tipo_mov, Codbarras_prod, ID_empleado)
VALUES ('2026-08-25', 700, 1, '7750000000001', 1),   -- cantidad mal digitada
       ('2026-08-25', 900, 1, '7750000000002', 1),   -- cantidad mal digitada
       ('2026-08-25',  50, 2, '7750000000099', 1);   -- código de barras inexistente

SELECT * FROM dbo.Mov_Inventario;      -- Antes del TRUNCATE: 3 filas erróneas

TRUNCATE TABLE dbo.Mov_Inventario;

SELECT * FROM dbo.Mov_Inventario;      -- Después del TRUNCATE: tabla vacía
GO

-- ---------------------------------------------------------------------
-- 8.1.3. ALTER
-- Se corrigen y completan las tablas reales creadas incompletas.
-- ---------------------------------------------------------------------

-- ADD (columna): agregar la columna Correo_cl que faltó en Cliente
ALTER TABLE dbo.Cliente ADD Correo_cl VARCHAR(100) not NULL;
GO

-- ALTER COLUMN (tamaño): ampliar Nombre_emp de 20 a 60 caracteres
ALTER TABLE dbo.Empleado ALTER COLUMN Nombre_emp VARCHAR(60) NOT NULL;
GO
Alter table dbo.Proveedor alter column Telefono_prov VARCHAR(15) not null
-- ALTER COLUMN (NOT NULL): el nombre del proveedor debe ser obligatorio
ALTER TABLE dbo.Proveedor ALTER COLUMN Nombre_prov VARCHAR(100) NOT NULL;
GO
ALTER TABLE dbo.Proveedor ADD Correo_prov VARCHAR(100) Not NULL;
GO
ALTER TABLE dbo.Proveedor DROP COLUMN Corero_prov;
GO

-- ADD CONSTRAINT PRIMARY KEY: Mov_Inventario no tenía clave primaria
ALTER TABLE dbo.Mov_Inventario
ADD CONSTRAINT PK_Mov_Inventario PRIMARY KEY (ID_movimiento); 
GO

-- ADD CONSTRAINT UNIQUE: no pueden repetirse los números de comprobante
ALTER TABLE dbo.Venta
ADD CONSTRAINT UQ_Venta_Numero_comprobante UNIQUE (Numero_comprobante);
GO

-- ADD CONSTRAINT CHECK: el precio de un producto debe ser mayor a cero
ALTER TABLE dbo.Producto
ADD CONSTRAINT CK_Producto_Precio CHECK (Precio > 0);
GO

-- ADD CONSTRAINT CHECK (con error) + DROP CONSTRAINT + ADD CONSTRAINT (correcto):
-- 1) Regla mal definida: exige garantía > 0, pero hay productos sin garantía (0 meses)
ALTER TABLE dbo.Producto
ADD CONSTRAINT CK_Producto_Garantia CHECK (Garantia_meses > 0);
GO
-- 2) Se elimina la restricción incorrecta
ALTER TABLE dbo.Producto DROP CONSTRAINT CK_Producto_Garantia;
GO
-- 3) Se crea la restricción correcta (la garantía puede ser 0 o más meses)
ALTER TABLE dbo.Producto
ADD CONSTRAINT CK_Producto_Garantia CHECK (Garantia_meses >= 0);
GO

-- ADD CONSTRAINT DEFAULT: un producto nuevo inicia con stock 0
ALTER TABLE dbo.Producto
ADD CONSTRAINT DF_Producto_Stock DEFAULT (0) FOR Stock;
GO

-- ADD CONSTRAINT DEFAULT: si no se indica fecha, la venta toma la fecha actual
ALTER TABLE dbo.Venta
ADD CONSTRAINT DF_Venta_Fecha DEFAULT (CAST(GETDATE() AS DATE)) FOR Fecha_venta;
GO

-- ADD CONSTRAINT FOREIGN KEY (con error) + DROP CONSTRAINT + ADD CONSTRAINT (correcto):
-- 1) FK mal definida: ID_tipo_mov apuntando a Estado_Dev en lugar de Tipo_Movimiento
ALTER TABLE dbo.Mov_Inventario
ADD CONSTRAINT FK_Mov_Tipo FOREIGN KEY (ID_tipo_mov) REFERENCES dbo.Estado_Dev(ID_estado_dev);
GO
-- 2) Se elimina la FK incorrecta
ALTER TABLE dbo.Mov_Inventario DROP CONSTRAINT FK_Mov_Tipo;
GO
-- 3) Se crea la FK correcta
ALTER TABLE dbo.Mov_Inventario
ADD CONSTRAINT FK_Mov_Tipo FOREIGN KEY (ID_tipo_mov) REFERENCES dbo.Tipo_Movimiento(ID_tipo_mov);
GO

-- ADD CONSTRAINT FOREIGN KEY: relaciones restantes de Mov_Inventario
ALTER TABLE dbo.Mov_Inventario
ADD CONSTRAINT FK_Mov_Producto FOREIGN KEY (Codbarras_prod) REFERENCES dbo.Producto(Codbarras_prod);
GO
ALTER TABLE dbo.Mov_Inventario
ADD CONSTRAINT FK_Mov_Empleado FOREIGN KEY (ID_empleado) REFERENCES dbo.Empleado(ID_empleado);
GO

-- Verificar el resultado de los ALTER
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE (TABLE_NAME = 'Proveedor')
   OR (TABLE_NAME = 'Cliente' AND COLUMN_NAME = 'Correo_cl')
   OR (TABLE_NAME = 'Empleado' AND COLUMN_NAME = 'Nombre_emp')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

SELECT OBJECT_NAME(parent_object_id) AS Tabla, name AS Restriccion, 'CHECK' AS Tipo
FROM sys.check_constraints
WHERE name IN ('CK_Producto_Precio', 'CK_Producto_Garantia')
UNION ALL
SELECT OBJECT_NAME(parent_object_id), name, 'DEFAULT'
FROM sys.default_constraints
WHERE name IN ('DF_Producto_Stock', 'DF_Venta_Fecha')
UNION ALL
SELECT OBJECT_NAME(parent_object_id), name, 'FOREIGN KEY'
FROM sys.foreign_keys
WHERE parent_object_id = OBJECT_ID('dbo.Mov_Inventario');
GO

-- ---------------------------------------------------------------------
-- 8.1.4. DROP
-- DROP elimina el objeto completo (estructura y datos).
-- Se elimina la tabla que se creó con el nombre mal escrito y se crea la correcta.
-- ---------------------------------------------------------------------
SELECT TABLE_NAME AS Tabla_Antes_del_DROP
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'Venta_Met%';
GO

DROP TABLE dbo.Venta_Metdo_Pago;
GO


CREATE TABLE dbo.Venta_Metodo_Pago (
    ID_venta INT NOT NULL,
    ID_metodo INT NOT NULL,
    Monto_pagado DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_Venta_Metodo_Pago PRIMARY KEY (ID_venta, ID_metodo),
    CONSTRAINT CK_VMP_Monto CHECK (Monto_pagado > 0),
    CONSTRAINT FK_VMP_Venta FOREIGN KEY (ID_venta) REFERENCES dbo.Venta(ID_venta),
    CONSTRAINT FK_VMP_Metodo FOREIGN KEY (ID_metodo) REFERENCES dbo.Metodo_Pago(ID_metodo)
);
GO

SELECT TABLE_NAME AS Tabla_Despues_del_DROP
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'Venta_Met%';
GO
-- No se ejecuta DROP DATABASE MishutecT2 porque eliminaría todo el proyecto.

-- =====================================================================
-- 8.2. SENTENCIAS DML (DATA MANIPULATION LANGUAGE)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 8.2.1. INSERT
-- Primero los catálogos, luego personas, productos, ventas, pagos,
-- inventario y devoluciones (respetando las claves foráneas).
-- ---------------------------------------------------------------------
select * from dbo.Marca
select * from dbo.Categoria
select * from dbo.Estado_Prod
select * from dbo.Proveedor


INSERT INTO dbo.Marca (Nombre_marca)
VALUES ('Kingston'), ('Corsair'), ('Samsung'), ('AMD'), ('Intel'), ('ASUS'), ('Cooler Master');

INSERT INTO dbo.Categoria (Nombre_cat, Descripcion_cat)
VALUES ('RAM', 'Memorias RAM'),
       ('SSD', 'Unidades de estado sólido'),
       ('CPU', 'Procesadores'),
       ('Grafica', 'Tarjetas gráficas'),
       ('Fuente de poder', 'Fuentes de alimentación para PC'),
       ('Gabinete', 'Cases y gabinetes para PC');

INSERT INTO dbo.Estado_Prod (Estado)
VALUES ('Disponible'), ('Agotado'), ('Descontinuado');

INSERT INTO dbo.Proveedor (Nombre_prov, Correo_prov, Telefono_prov)
VALUES ('Tecno Import Perú SAC', 'ventas@tecnoimport.pe', '014567890'),
       ('Distribuidora Andina de Cómputo', 'contacto@andinacomputo.pe', '014123456'),
       ('Global Hardware SAC', 'pedidos@globalhardware.pe', '017894561');

INSERT INTO dbo.Tipo_Comprobante (Nombre_tipo)
VALUES ('Boleta'), ('Factura');

INSERT INTO dbo.Metodo_Pago (Nombre_metodo)
VALUES ('Efectivo'), ('Tarjeta'), ('Transferencia'), ('Yape');

INSERT INTO dbo.Tipo_Movimiento (Nombre_tipo)
VALUES ('Entrada'), ('Salida'), ('Ajuste');

INSERT INTO dbo.Estado_Dev (Nombre_estado)
VALUES ('Pendiente'), ('Aprobada'), ('Rechazada');

INSERT INTO dbo.Motivo_Dev (Descripcion_motivo)
VALUES ('Producto defectuoso'), ('Producto equivocado'), ('Garantía');

-- Clientes
-- ERROR DE DIGITACIÓN: el teléfono de Mia tiene 8 dígitos (se corrige en UPDATE)
INSERT INTO dbo.Cliente (Dni_cliente, Nombre_cl, Apellido_cl, Telefono_cl, Correo_cl)
VALUES ('72145890', 'Ana',   'Torres Quispe', '987654321', 'ana.torres@gmail.com'),
       ('70231456', 'Luis',  'Rojas Medina',  '986112233', 'luis.rojas@outlook.com'),
       ('75896412', 'Mia',   'Salas Campos',  '98456123',  'mia.salas@gmail.com'),
       ('71458963', 'Pedro', 'Huamán Soto',   '965874123', 'pedro.huaman@gmail.com'),
       ('73654128', 'Lucía', 'Flores Rivas',  '917233318',  'lucia.flores@gmail.com');
select * from dbo.Cliente

-- Empleados
INSERT INTO dbo.Empleado (Dni_emp, Nombre_emp, Apellido_emp)
VALUES ('45871236', 'Carlos', 'Vega Ramos'),
       ('46925874', 'Rosa',   'Paredes Luna'),
       ('41236587', 'Jorge',  'Mendoza Cruz');
select * from Empleado
-- Productos (las claves de catálogo se buscan por nombre)
-- ERRORES DE DIGITACIÓN que se corrigen en UPDATE:
--   * Samsung 980 500GB: precio 19.00 (debía ser 190.00)
--   * Intel Core i5-12400F: estado 'Agotado' aunque tiene stock
--   * ASUS RTX 4060: stock 40 (debía ser 4)
INSERT INTO dbo.Producto
(Codbarras_prod, Nombre_prod, Precio, Garantia_meses, Stock, ID_estado_prod, ID_categoria, ID_marca)
SELECT v.cod, v.nombre, v.precio, v.garantia, v.stock, e.ID_estado_prod, c.ID_categoria, m.ID_marca
FROM (VALUES
    ('7750000000001', 'Kingston Fury Beast 16GB DDR4 3200', 180.00, 24, 15, 'Disponible', 'RAM',             'Kingston'),
    ('7750000000002', 'Corsair Vengeance LPX 32GB DDR4 3600', 320.00, 36,  8, 'Disponible', 'RAM',             'Corsair'),
    ('7750000000003', 'Kingston NV2 1TB NVMe',                 260.00, 24, 10, 'Disponible', 'SSD',             'Kingston'),
    ('7750000000004', 'Samsung 980 500GB NVMe',                 19.00, 36, 12, 'Disponible', 'SSD',             'Samsung'),
    ('7750000000005', 'AMD Ryzen 7 5700X',                     950.00, 36,  5, 'Disponible', 'CPU',             'AMD'),
    ('7750000000006', 'Intel Core i5-12400F',                  620.00, 36,  6, 'Agotado',    'CPU',             'Intel'),
    ('7750000000007', 'ASUS Dual GeForce RTX 4060 8GB',       1450.00, 36, 40, 'Disponible', 'Grafica',         'ASUS'),
    ('7750000000008', 'Corsair CV650 650W 80 Plus Bronze',     280.00, 36,  7, 'Disponible', 'Fuente de poder', 'Corsair'),
    ('7750000000009', 'Cooler Master MasterBox Q300L',         240.00, 12,  6, 'Disponible', 'Gabinete',        'Cooler Master')
) AS v(cod, nombre, precio, garantia, stock, estado, cat, marca)
JOIN dbo.Estado_Prod e ON e.Estado = v.estado
JOIN dbo.Categoria  c ON c.Nombre_cat = v.cat
JOIN dbo.Marca      m ON m.Nombre_marca = v.marca;

-- Producto nuevo SIN indicar Stock: toma el DEFAULT (0) creado en ALTER
INSERT INTO dbo.Producto
(Codbarras_prod, Nombre_prod, Precio, Garantia_meses, ID_estado_prod, ID_categoria, ID_marca)
VALUES
('7750000000010', 'Samsung 870 EVO 1TB SATA', 330.00, 36,
 (SELECT ID_estado_prod FROM dbo.Estado_Prod WHERE Estado = 'Agotado'),
 (SELECT ID_categoria FROM dbo.Categoria WHERE Nombre_cat = 'SSD'),
 (SELECT ID_marca FROM dbo.Marca WHERE Nombre_marca = 'Samsung'));

-- Especializaciones
INSERT INTO dbo.RAM (Codbarras_prod, Capacidad_gb, Velocidad_mhz)
VALUES ('7750000000001', 16, 3200), ('7750000000002', 32, 3600);

INSERT INTO dbo.SSD (Codbarras_prod, Capacidad_gb, Interfaz)
VALUES ('7750000000003', 1000, 'NVMe'),
       ('7750000000004',  500, 'NVMe'),
       ('7750000000010', 1000, 'SATA III');

INSERT INTO dbo.CPU (Codbarras_prod, Frecuencia_ghz, Nucleos)
VALUES ('7750000000005', 3.40, 8), ('7750000000006', 2.50, 6);

INSERT INTO dbo.Grafica (Codbarras_prod, Vram_gb, Chipset)
VALUES ('7750000000007', 8, 'GeForce RTX 4060');

INSERT INTO dbo.Fuente_Poder (Codbarras_prod, Potencia_w, Certificacion)
VALUES ('7750000000008', 650, '80 Plus Bronze');

INSERT INTO dbo.Gabinete (Codbarras_prod, Formato, Material)
VALUES ('7750000000009', 'Micro-ATX', 'Acero y acrílico');

-- Suministra (un producto puede tener varios proveedores)
INSERT INTO dbo.Suministra (Codbarras_prod, ID_proveedor, Precio_compra)
SELECT v.cod, p.ID_proveedor, v.precio
FROM (VALUES
    ('7750000000001', 'Tecno Import Perú SAC',              130.00),
    ('7750000000001', 'Distribuidora Andina de Cómputo',    135.00),
    ('7750000000002', 'Distribuidora Andina de Cómputo',    245.00),
    ('7750000000003', 'Tecno Import Perú SAC',              200.00),
    ('7750000000004', 'Global Hardware SAC',                140.00),
    ('7750000000005', 'Tecno Import Perú SAC',              780.00),
    ('7750000000007', 'Distribuidora Andina de Cómputo',   1200.00),
    ('7750000000008', 'Tecno Import Perú SAC',              215.00),
    ('7750000000009', 'Global Hardware SAC',                170.00)
) AS v(cod, prov, precio)
JOIN dbo.Proveedor p ON p.Nombre_prov = v.prov;

-- Ventas (fechas explícitas; Total_venta = suma de los subtotales del detalle)
INSERT INTO dbo.Venta
(Fecha_venta, Total_venta, Numero_comprobante, ID_tipo_comp, Dni_cliente, ID_empleado)
SELECT CAST(v.fecha AS DATE), v.total, v.num, t.ID_tipo_comp, v.dni, e.ID_empleado
FROM (VALUES
    ('2026-09-01',  360.00, 'B001-000001', 'Boleta',  '72145890', '45871236'),
    ('2026-09-10', 1190.00, 'F001-000001', 'Factura', '70231456', '46925874'),
    ('2026-09-22',  260.00, 'B001-000002', 'Boleta',  '75896412', '45871236'),
    ('2026-10-01', 1730.00, 'B001-000003', 'Boleta',  '72145890', '46925874'),
    ('2026-10-05',  510.00, 'B001-000004', 'Boleta',  '71458963', '41236587')
) AS v(fecha, total, num, tipo, dni, dni_emp)
JOIN dbo.Tipo_Comprobante t ON t.Nombre_tipo = v.tipo
JOIN dbo.Empleado e ON e.Dni_emp = v.dni_emp;

INSERT INTO dbo.Detalle_Venta (Cantidad, Precio_unitario, Subtotal, ID_venta, Codbarras_prod)
SELECT v.cant, v.precio, v.cant * v.precio, ve.ID_venta, v.cod
FROM (VALUES
    ('B001-000001', '7750000000001', 2,  180.00),
    ('F001-000001', '7750000000005', 1,  950.00),
    ('F001-000001', '7750000000009', 1,  240.00),
    ('B001-000002', '7750000000003', 1,  260.00),
    ('B001-000003', '7750000000007', 1, 1450.00),
    ('B001-000003', '7750000000008', 1,  280.00),
    ('B001-000004', '7750000000002', 1,  320.00),
    ('B001-000004', '7750000000004', 1,  190.00)
) AS v(num, cod, cant, precio)
JOIN dbo.Venta ve ON ve.Numero_comprobante = v.num;
truncate table dbo.Detalle_Venta
-- Pagos (la factura F001-000001 se pagó con dos métodos)
INSERT INTO dbo.Venta_Metodo_Pago (ID_venta, ID_metodo, Monto_pagado)
SELECT ve.ID_venta, mp.ID_metodo, v.monto
FROM (VALUES
    ('B001-000001', 'Efectivo',      360.00),
    ('F001-000001', 'Tarjeta',       700.00),
    ('F001-000001', 'Transferencia', 490.00),
    ('B001-000002', 'Yape',          260.00),
    ('B001-000003', 'Tarjeta',      1730.00),
    ('B001-000004', 'Efectivo',      510.00)
) AS v(num, metodo, monto)
JOIN dbo.Venta ve ON ve.Numero_comprobante = v.num
JOIN dbo.Metodo_Pago mp ON mp.Nombre_metodo = v.metodo;

-- Movimientos de inventario
-- ERROR DE DIGITACIÓN: la entrada de Kingston Fury se registró con 7 unidades (eran 17).
-- Se corrige en UPDATE.
INSERT INTO dbo.Mov_Inventario (Fecha, Cantidad, ID_tipo_mov, Codbarras_prod, ID_empleado)
SELECT CAST(v.fecha AS DATE), v.cant, t.ID_tipo_mov, v.cod, e.ID_empleado
FROM (VALUES
    ('2026-08-25',  7, 'Entrada', '7750000000001', '45871236'),
    ('2026-08-25',  9, 'Entrada', '7750000000002', '45871236'),
    ('2026-08-25', 11, 'Entrada', '7750000000003', '45871236'),
    ('2026-08-25', 13, 'Entrada', '7750000000004', '45871236'),
    ('2026-08-25',  6, 'Entrada', '7750000000005', '45871236'),
    ('2026-08-25',  6, 'Entrada', '7750000000006', '45871236'),
    ('2026-08-25',  5, 'Entrada', '7750000000007', '45871236'),
    ('2026-08-25',  8, 'Entrada', '7750000000008', '45871236'),
    ('2026-08-25',  7, 'Entrada', '7750000000009', '45871236'),
    ('2026-09-01',  2, 'Salida',  '7750000000001', '45871236'),
    ('2026-09-10',  1, 'Salida',  '7750000000005', '46925874'),
    ('2026-09-10',  1, 'Salida',  '7750000000009', '46925874'),
    ('2026-09-22',  1, 'Salida',  '7750000000003', '45871236'),
    ('2026-10-01',  1, 'Salida',  '7750000000007', '46925874'),
    ('2026-10-01',  1, 'Salida',  '7750000000008', '46925874'),
    ('2026-10-05',  1, 'Salida',  '7750000000002', '41236587'),
    ('2026-10-05',  1, 'Salida',  '7750000000004', '41236587')
) AS v(fecha, cant, tipo, cod, dni_emp)
JOIN dbo.Tipo_Movimiento t ON t.Nombre_tipo = v.tipo
JOIN dbo.Empleado e ON e.Dni_emp = v.dni_emp;

-- Devolución: la Kingston NV2 de la boleta B001-000002 llegó defectuosa
INSERT INTO dbo.Devolucion (Fecha_dev, ID_estado_dev, ID_venta, ID_empleado)
VALUES ('2026-09-25',
        (SELECT ID_estado_dev FROM dbo.Estado_Dev WHERE Nombre_estado = 'Pendiente'),
        (SELECT ID_venta FROM dbo.Venta WHERE Numero_comprobante = 'B001-000002'),
        (SELECT ID_empleado FROM dbo.Empleado WHERE Dni_emp = '45871236'));

INSERT INTO dbo.Detalle_Dev (Cantidad_dev, ID_devolucion, ID_detalle, ID_motivo)
VALUES (1,
        (SELECT TOP 1 ID_devolucion FROM dbo.Devolucion ORDER BY ID_devolucion DESC),
        (SELECT dv.ID_detalle
         FROM dbo.Detalle_Venta dv
         JOIN dbo.Venta v ON v.ID_venta = dv.ID_venta
         WHERE v.Numero_comprobante = 'B001-000002'
           AND dv.Codbarras_prod = '7750000000003'),
        (SELECT ID_motivo FROM dbo.Motivo_Dev WHERE Descripcion_motivo = 'Producto defectuoso'));

-- Comprobar que el TRUNCATE reinició el IDENTITY: el primer movimiento tiene ID 1
SELECT MIN(ID_movimiento) AS Primer_ID_movimiento, COUNT(*) AS Total_movimientos
FROM dbo.Mov_Inventario;
GO

-- ---------------------------------------------------------------------
-- 8.2.2. DELETE
-- Se eliminan registros cargados por error (siempre con WHERE) y,
-- cuando corresponde, se vuelve a insertar el registro correcto.
-- ---------------------------------------------------------------------

-- 1) Cliente duplicado por error de digitación del DNI (72145809 en vez de 72145890)
INSERT INTO dbo.Cliente (Dni_cliente, Nombre_cl, Apellido_cl, Telefono_cl, Correo_cl)
VALUES ('72145809', 'Ana', 'Torres Quispe', '987654321', 'ana.torres@gmail.com');

DELETE FROM dbo.Cliente
WHERE Dni_cliente = '72145809';
select * from Cliente

-- 2) Suministra del Intel Core i5-12400F cargado con proveedor y precio equivocados
INSERT INTO dbo.Suministra (Codbarras_prod, ID_proveedor, Precio_compra)
VALUES ('7750000000006',
        (SELECT ID_proveedor FROM dbo.Proveedor WHERE Nombre_prov = 'Global Hardware SAC'),
        62.00);

DELETE FROM dbo.Suministra
WHERE Codbarras_prod = '7750000000006'
  AND Precio_compra = 62.00;

-- ...y se inserta el registro correcto
INSERT INTO dbo.Suministra (Codbarras_prod, ID_proveedor, Precio_compra)
VALUES ('7750000000006',
        (SELECT ID_proveedor FROM dbo.Proveedor WHERE Nombre_prov = 'Global Hardware SAC'),
        500.00);

-- 3) Salida de inventario registrada por error (el Intel i5 nunca se vendió)
INSERT INTO dbo.Mov_Inventario (Fecha, Cantidad, ID_tipo_mov, Codbarras_prod, ID_empleado)
VALUES ('2026-10-06', 1,
        (SELECT ID_tipo_mov FROM dbo.Tipo_Movimiento WHERE Nombre_tipo = 'Salida'),
        '7750000000006',
        (SELECT ID_empleado FROM dbo.Empleado WHERE Dni_emp = '41236587'));

DELETE FROM dbo.Mov_Inventario
WHERE Codbarras_prod = '7750000000006'
  AND ID_tipo_mov = (SELECT ID_tipo_mov FROM dbo.Tipo_Movimiento WHERE Nombre_tipo = 'Salida');
GO

-- ---------------------------------------------------------------------
-- 8.2.3. UPDATE
-- Se corrigen los datos mal digitados en el INSERT (siempre con WHERE).
-- ---------------------------------------------------------------------
UPDATE d
SET 
    d.Cantidad = v.nueva_cant,
    d.Subtotal = v.nueva_cant * d.Precio_unitario
FROM dbo.Detalle_Venta d
INNER JOIN dbo.Venta ve ON ve.ID_venta = d.ID_venta
INNER JOIN (
    VALUES 
    -- F001-000001: Rompemos el empate (Un ganador claro)
    ('F001-000001', '7750000000005', 5), -- Ganador de esta venta
    ('F001-000001', '7750000000009', 2), -- Ignorado

    -- B001-000003: Mantenemos un empate, pero subimos la cantidad
    ('B001-000003', '7750000000007', 3), -- MÁXIMO (Empate)
    ('B001-000003', '7750000000008', 3), -- MÁXIMO (Empate)

    -- B001-000004: Rompemos el empate (Otro ganador claro)
    ('B001-000004', '7750000000002', 1), -- Ignorado
    ('B001-000004', '7750000000004', 4)  -- Ganador de esta venta
) AS v(num_comprobante, cod_barras, nueva_cant) 
    ON ve.Numero_comprobante = v.num_comprobante 
    AND d.Codbarras_prod = v.cod_barras;

UPDATE p
SET 
    p.Nombre_prod = v.nuevo_nombre,
    p.Precio = v.nuevo_precio,
    p.ID_marca = m.ID_marca,
    p.ID_categoria = c.ID_categoria
FROM dbo.Producto p
INNER JOIN (
    VALUES 
    -- 1. Convertimos el Prod 002 (RAM Corsair) en una "Kingston RAM" de lujo (550.00).
    -- Esto hará que la Kingston RAM barata original (Prod 001 de 180.00) AHORA SÍ aparezca.
    ('7750000000002', 'Kingston Fury Renegade 32GB', 550.00, 'Kingston', 'RAM'),

    -- 2. Convertimos el Prod 003 (SSD Kingston) en un "Samsung SSD" (260.00).
    -- Hará dupla con tu Samsung corregido (Prod 004 de 190.00). 
    -- Como NINGUNO de los dos pasa de 500, la consulta EXISTS ignorará a ambos.
    ('7750000000003', 'Samsung 870 EVO 1TB SATA', 260.00, 'Samsung', 'SSD'),

    -- 3. Convertimos el Prod 009 (Gabinete) en un "Intel CPU" barato (240.00).
    -- Será "rescatado" por tu Intel i5 (Prod 006 de 620.00) y obligará a que este barato también salga.
    ('7750000000009', 'Intel Core i3-12100F', 240.00, 'Intel', 'CPU')

) AS v(cod, nuevo_nombre, nuevo_precio, marca, categoria) 
    ON p.Codbarras_prod = v.cod
INNER JOIN dbo.Marca m ON m.Nombre_marca = v.marca
INNER JOIN dbo.Categoria c ON c.Nombre_cat = v.categoria;

select * from Producto
-- Corregir el precio del Samsung 980 500GB (19.00 -> 190.00)
UPDATE dbo.Producto
SET Precio = 190.00
WHERE Codbarras_prod = '7750000000004';

-- Corregir el stock de la ASUS RTX 4060 (40 -> 4)
UPDATE dbo.Producto
SET Stock = 4
WHERE Codbarras_prod = '7750000000007';

-- Corregir el estado del Intel i5 (tiene stock, por lo tanto está Disponible)
UPDATE dbo.Producto
SET ID_estado_prod = (SELECT ID_estado_prod FROM dbo.Estado_Prod WHERE Estado = 'Disponible')
WHERE Codbarras_prod = '7750000000006'
  AND Stock > 0;

  SELECT 
    p.Codbarras_prod, 
    p.Nombre_prod, 
    p.Precio, 
    p.Garantia_meses, 
    p.Stock, 
    e.Estado AS Estado_Producto, 
    c.Nombre_cat AS Categoria, 
    m.Nombre_marca AS Marca
FROM 
    dbo.Producto p
INNER JOIN 
    dbo.Estado_Prod e ON p.ID_estado_prod = e.ID_estado_prod
INNER JOIN 
    dbo.Categoria c ON p.ID_categoria = c.ID_categoria
INNER JOIN 
    dbo.Marca m ON p.ID_marca = m.ID_marca;

-- Corregir el teléfono de la clienta Mia (8 dígitos -> 9 dígitos)
UPDATE dbo.Cliente
SET Telefono_cl = '984561237'
WHERE Dni_cliente = '75896412';

-- Corregir la cantidad de la entrada de Kingston Fury (7 -> 17)
UPDATE dbo.Mov_Inventario
SET Cantidad = 17
WHERE Codbarras_prod = '7750000000001'
  AND Cantidad = 7
  AND ID_tipo_mov = (SELECT ID_tipo_mov FROM dbo.Tipo_Movimiento WHERE Nombre_tipo = 'Entrada');

-- UPDATE de varias columnas: actualizar contacto de un proveedor
UPDATE dbo.Proveedor
SET Correo_prov = 'ventas@globalhardware.pe',
    Telefono_prov = '017894562'
WHERE Nombre_prov = 'Global Hardware SAC';

-- UPDATE de un proceso real: la devolución defectuosa fue aprobada
UPDATE dbo.Devolucion
SET ID_estado_dev = (SELECT ID_estado_dev FROM dbo.Estado_Dev WHERE Nombre_estado = 'Aprobada')
WHERE ID_venta = (SELECT ID_venta FROM dbo.Venta WHERE Numero_comprobante = 'B001-000002');
GO

-- ---------------------------------------------------------------------
-- 8.2.4. SELECT
-- 8.2.4.1. Consultas (mínimo 2)
-- ---------------------------------------------------------------------

-- Consulta 1: operadores relacionales, lógicos, WHERE y ORDER BY.
SELECT Nombre_prod, Precio, Stock
FROM dbo.Producto
WHERE Precio >= 250 AND Stock > 0
ORDER BY Precio DESC;

-- Consulta 2: operadores aritméticos, alias y filtro OR.
SELECT Nombre_prod, Precio,
       Precio * 1.18 AS Precio_con_IGV,
       Stock,
       Precio * Stock AS Valor_stock
FROM dbo.Producto
WHERE ID_categoria = (SELECT ID_categoria FROM dbo.Categoria WHERE Nombre_cat = 'RAM')
   OR Precio > 900
ORDER BY Nombre_prod ASC;

-- ---------------------------------------------------------------------
-- 8.2.4.2. Subconsultas mono registro (mínimo 3)
-- ---------------------------------------------------------------------

-- Mono registro 1: productos con precio mayor al precio promedio.
SELECT Nombre_prod, Precio
FROM dbo.Producto
WHERE Precio > (SELECT AVG(Precio) FROM dbo.Producto);

-- Mono registro 2: producto(s) con el precio máximo.
SELECT Nombre_prod, Precio
FROM dbo.Producto
WHERE Precio = (SELECT MAX(Precio) FROM dbo.Producto);

-- Mono registro 3: productos de la marca Kingston.
SELECT Nombre_prod, Precio
FROM dbo.Producto
WHERE ID_marca = (SELECT ID_marca FROM dbo.Marca WHERE Nombre_marca = 'Kingston');

-- ---------------------------------------------------------------------
-- 8.2.4.3. Subconsultas multi registro (mínimo 3): IN, ANY y ALL
-- ---------------------------------------------------------------------

-- Multi registro 1 (IN): productos de las categorías RAM y SSD.
SELECT Nombre_prod, Precio
FROM dbo.Producto
WHERE ID_categoria IN (
    SELECT ID_categoria
    FROM dbo.Categoria
    WHERE Nombre_cat IN ('RAM', 'SSD')
);

-- Multi registro 2 (ANY): productos más caros que al menos un producto de RAM.
SELECT Nombre_prod, Precio
FROM dbo.Producto
WHERE Precio > ANY (
    SELECT p2.Precio
    FROM dbo.Producto p2
    INNER JOIN dbo.Categoria c2 ON c2.ID_categoria = p2.ID_categoria
    WHERE c2.Nombre_cat = 'RAM'
);

-- Multi registro 3 (ALL): productos más caros que TODOS los SSD.
SELECT Nombre_prod, Precio
FROM dbo.Producto
WHERE Precio > ALL (
    SELECT p2.Precio
    FROM dbo.Producto p2
    INNER JOIN dbo.Categoria c2 ON c2.ID_categoria = p2.ID_categoria
    WHERE c2.Nombre_cat = 'SSD'
);
select*from Producto

-- ---------------------------------------------------------------------
-- 8.2.4.4. Subconsultas multi columna (mínimo 3)
-- La subconsulta devuelve más de una columna y se compara por varias a la vez.
-- SQL Server no admite (col1, col2) IN (subconsulta); se usa EXISTS o tabla derivada.
-- ---------------------------------------------------------------------

-- Multi columna 1: productos que comparten marca Y categoría con algún
-- producto de precio mayor a 500.
SELECT p.Nombre_prod, p.ID_marca, p.ID_categoria, p.Precio
FROM dbo.Producto p
WHERE EXISTS (
    SELECT 1
    FROM dbo.Producto x
    WHERE x.ID_marca = p.ID_marca
      AND x.ID_categoria = p.ID_categoria
      AND x.Precio > 500
);

-- Multi columna 2: producto más caro de cada categoría
-- (la subconsulta devuelve ID_categoria y el precio máximo).
SELECT p.Nombre_prod, p.ID_categoria, p.Precio
FROM dbo.Producto p
INNER JOIN (
    SELECT ID_categoria, MAX(Precio) AS Precio_max
    FROM dbo.Producto
    GROUP BY ID_categoria
) mx ON mx.ID_categoria = p.ID_categoria AND mx.Precio_max = p.Precio;

-- Multi columna 3: línea de venta con mayor cantidad en cada venta
-- (la subconsulta devuelve ID_venta y la cantidad máxima).
SELECT 
    d.ID_venta, 
    d.Codbarras_prod, 
    p.Nombre_prod, 
    d.Cantidad
FROM dbo.Detalle_Venta d
INNER JOIN (
    SELECT ID_venta, MAX(Cantidad) AS Cant_max
    FROM dbo.Detalle_Venta
    GROUP BY ID_venta
) mx ON mx.ID_venta = d.ID_venta AND mx.Cant_max = d.Cantidad
INNER JOIN dbo.Producto p 
    ON p.Codbarras_prod = d.Codbarras_prod; 

-- ---------------------------------------------------------------------
-- 8.2.4.5. Consultas combinadas INNER JOIN (mínimo 6)
-- ---------------------------------------------------------------------

-- INNER JOIN 1: productos con marca y categoría.
SELECT p.Codbarras_prod, p.Nombre_prod, m.Nombre_marca, c.Nombre_cat, p.Precio
FROM dbo.Producto p
INNER JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
INNER JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
ORDER BY m.Nombre_marca, p.Nombre_prod;

-- INNER JOIN 2: ventas con cliente y empleado.
SELECT v.Numero_comprobante, v.Fecha_venta, v.Total_venta,
       cl.Nombre_cl, cl.Apellido_cl, e.Nombre_emp, e.Apellido_emp
FROM dbo.Venta v
INNER JOIN dbo.Cliente cl ON v.Dni_cliente = cl.Dni_cliente
INNER JOIN dbo.Empleado e ON v.ID_empleado = e.ID_empleado
ORDER BY v.Fecha_venta DESC;

-- INNER JOIN 3: detalle de venta con nombre del producto.
SELECT v.Numero_comprobante, p.Nombre_prod, dv.Cantidad,
       dv.Precio_unitario, dv.Subtotal
FROM dbo.Detalle_Venta dv
INNER JOIN dbo.Venta v ON dv.ID_venta = v.ID_venta
INNER JOIN dbo.Producto p ON dv.Codbarras_prod = p.Codbarras_prod
ORDER BY v.Numero_comprobante;

-- INNER JOIN 4: proveedores que suministran productos.
SELECT pr.Nombre_prov, p.Nombre_prod, s.Precio_compra
FROM dbo.Suministra s
INNER JOIN dbo.Proveedor pr ON s.ID_proveedor = pr.ID_proveedor
INNER JOIN dbo.Producto p ON s.Codbarras_prod = p.Codbarras_prod
ORDER BY pr.Nombre_prov;

-- INNER JOIN 5: método(s) de pago utilizados en cada venta.
SELECT v.Numero_comprobante, mp.Nombre_metodo, vmp.Monto_pagado
FROM dbo.Venta_Metodo_Pago vmp
INNER JOIN dbo.Venta v ON vmp.ID_venta = v.ID_venta
INNER JOIN dbo.Metodo_Pago mp ON vmp.ID_metodo = mp.ID_metodo
ORDER BY v.Numero_comprobante;

-- INNER JOIN 6: devoluciones con estado, comprobante, producto y motivo.
SELECT d.ID_devolucion, d.Fecha_dev, ed.Nombre_estado,
       v.Numero_comprobante, p.Nombre_prod, md.Descripcion_motivo, dd.Cantidad_dev
FROM dbo.Devolucion d
INNER JOIN dbo.Estado_Dev ed ON d.ID_estado_dev = ed.ID_estado_dev
INNER JOIN dbo.Venta v ON d.ID_venta = v.ID_venta
INNER JOIN dbo.Detalle_Dev dd ON d.ID_devolucion = dd.ID_devolucion
INNER JOIN dbo.Detalle_Venta dv ON dd.ID_detalle = dv.ID_detalle
INNER JOIN dbo.Producto p ON dv.Codbarras_prod = p.Codbarras_prod
INNER JOIN dbo.Motivo_Dev md ON dd.ID_motivo = md.ID_motivo;

-- INNER JOIN 7: inventario con tipo de movimiento, producto y empleado.
SELECT mi.Fecha, tm.Nombre_tipo, p.Nombre_prod, mi.Cantidad,
       e.Nombre_emp, e.Apellido_emp
FROM dbo.Mov_Inventario mi
INNER JOIN dbo.Tipo_Movimiento tm ON mi.ID_tipo_mov = tm.ID_tipo_mov
INNER JOIN dbo.Producto p ON mi.Codbarras_prod = p.Codbarras_prod
INNER JOIN dbo.Empleado e ON mi.ID_empleado = e.ID_empleado
ORDER BY mi.Fecha DESC;

-- INNER JOIN 8: productos especializados en RAM y sus características.
SELECT p.Nombre_prod, r.Capacidad_gb, r.Velocidad_mhz
FROM dbo.Producto p
INNER JOIN dbo.RAM r ON p.Codbarras_prod = r.Codbarras_prod;

-- ---------------------------------------------------------------------
-- 8.2.5. Funciones de columna
-- COUNT, SUM, AVG, MIN, MAX y GROUP BY / HAVING
-- ---------------------------------------------------------------------

-- COUNT: cantidad de productos registrados.
SELECT COUNT(*) AS Cantidad_productos
FROM dbo.Producto;

-- SUM: valor del inventario (precio de venta por stock).
SELECT SUM(Precio * Stock) AS Valor_total_inventario
FROM dbo.Producto;

-- AVG, MIN y MAX: resumen de precios.
SELECT AVG(Precio) AS Precio_promedio,
       MIN(Precio) AS Precio_minimo,
       MAX(Precio) AS Precio_maximo
FROM dbo.Producto;

-- GROUP BY: cantidad de productos y valor del stock por marca.
SELECT m.Nombre_marca,
       COUNT(*) AS Cantidad_productos,
       SUM(p.Precio * p.Stock) AS Valor_stock
FROM dbo.Producto p
INNER JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
GROUP BY m.Nombre_marca
ORDER BY Valor_stock DESC;

-- HAVING: marcas con al menos dos productos.
SELECT m.Nombre_marca, COUNT(*) AS Cantidad_productos
FROM dbo.Producto p
INNER JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
GROUP BY m.Nombre_marca
HAVING COUNT(*) >= 2;

-- GROUP BY con SUM: total comprado por cada cliente.
SELECT cl.Nombre_cl, cl.Apellido_cl, SUM(v.Total_venta) AS Total_comprado
FROM dbo.Venta v
INNER JOIN dbo.Cliente cl ON v.Dni_cliente = cl.Dni_cliente
GROUP BY cl.Nombre_cl, cl.Apellido_cl
ORDER BY Total_comprado DESC;

-- ---------------------------------------------------------------------
-- 8.2.6. Funciones de fecha
-- GETDATE, YEAR, MONTH, DAY, DATEADD, DATEDIFF, EOMONTH, FORMAT
-- ---------------------------------------------------------------------

-- Fecha y hora actuales.
SELECT GETDATE() AS FechaHoraActual;

-- Extraer año, mes y día de cada venta.
SELECT Numero_comprobante, Fecha_venta,
       YEAR(Fecha_venta)  AS Anio,
       MONTH(Fecha_venta) AS Mes,
       DAY(Fecha_venta)   AS Dia
FROM dbo.Venta;

-- Ventas de septiembre de 2026.
SELECT Numero_comprobante, Fecha_venta, Total_venta
FROM dbo.Venta
WHERE Fecha_venta >= '2026-09-01'
  AND Fecha_venta <  '2026-10-01'
ORDER BY Fecha_venta;

-- DATEADD: fecha estimada de fin de garantía de cada producto vendido.
SELECT v.Numero_comprobante, p.Nombre_prod, p.Garantia_meses,
       DATEADD(MONTH, p.Garantia_meses, v.Fecha_venta) AS FinGarantiaEstimado
FROM dbo.Detalle_Venta dv
INNER JOIN dbo.Venta v ON dv.ID_venta = v.ID_venta
INNER JOIN dbo.Producto p ON dv.Codbarras_prod = p.Codbarras_prod;

-- DATEDIFF: días transcurridos desde cada venta hasta hoy.
SELECT Numero_comprobante, Fecha_venta,
       DATEDIFF(DAY, Fecha_venta, CAST(GETDATE() AS DATE)) AS DiasDesdeVenta
FROM dbo.Venta;

-- EOMONTH: último día del mes de cada venta.
SELECT Numero_comprobante, Fecha_venta, EOMONTH(Fecha_venta) AS UltimoDiaDelMes
FROM dbo.Venta;

-- FORMAT: mostrar la fecha con formato legible.
SELECT Numero_comprobante,
       FORMAT(Fecha_venta, 'dd/MM/yyyy') AS Fecha_Formateada
FROM dbo.Venta;
GO

-- =====================================================================
-- VERIFICACIÓN FINAL
-- La estructura y los datos correctos quedan guardados en MishutecT2.
-- No existe ninguna tabla adicional a las del modelo.
-- =====================================================================
SELECT TABLE_NAME AS Tabla_Final
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
  AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME;
GO

