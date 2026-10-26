/* ==============================================================================
   MISHUTEC — BANCO DE CONSULTAS SQL SEGURAS PARA DEFENSA ACADÉMICA (SSMS)
   Motor: Microsoft SQL Server 2022 Express Edition
   Bases compatibles: MishutecT2 (Académica) y MishutecT2_Aceptacion (Aceptación)
   CARÁCTER: 100% SOLO LECTURA (SELECT). Cero modificaciones a los datos.
   ============================================================================== */

-- Seleccionar la base activa deseada (Aceptación o Académica):
USE MishutecT2_Aceptacion;
-- USE MishutecT2;
GO

-- ==============================================================================
-- 1. CONSULTA BÁSICA: SELECT, WHERE Y ORDER BY
-- Objetivo: Listar productos disponibles con precio mayor o igual a S/ 250.00
-- ==============================================================================
SELECT 
    p.Codbarras_prod AS Codigo,
    p.Nombre_prod AS Producto,
    p.Precio,
    p.Stock,
    p.Garantia_meses AS MesesGarantia
FROM dbo.Producto p
WHERE p.Precio >= 250.00 AND p.Stock > 0
ORDER BY p.Precio DESC;

-- ==============================================================================
-- 2. OPERADORES ARITMÉTICOS Y VALORIZACIÓN DE STOCK
-- Objetivo: Calcular el precio con IGV (18%) y el valor del inventario por SKU
-- ==============================================================================
SELECT 
    p.Codbarras_prod AS Codigo,
    p.Nombre_prod AS Producto,
    p.Precio AS Precio_Unitario_Sin_IGV,
    CAST(p.Precio * 1.18 AS DECIMAL(10,2)) AS Precio_Estimado_Con_IGV,
    p.Stock,
    CAST(p.Precio * p.Stock AS DECIMAL(10,2)) AS Valor_Total_Inventario_Retail
FROM dbo.Producto p
WHERE p.Stock > 0
ORDER BY Valor_Total_Inventario_Retail DESC;

-- ==============================================================================
-- 3. INNER JOIN (3 TABLAS): PRODUCTOS CON MARCA Y CATEGORÍA
-- Objetivo: Demostrar normalización de catálogos y enlace relacional
-- ==============================================================================
SELECT 
    p.Codbarras_prod AS Codigo,
    p.Nombre_prod AS Producto,
    m.Nombre_marca AS Marca,
    c.Nombre_cat AS Categoria,
    ep.Estado AS Estado_Comercial,
    p.Precio,
    p.Stock
FROM dbo.Producto p
INNER JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
INNER JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
INNER JOIN dbo.Estado_Prod ep ON p.ID_estado_prod = ep.ID_estado_prod
ORDER BY c.Nombre_cat, p.Nombre_prod;

-- ==============================================================================
-- 4. LEFT JOIN: DETECCIÓN DE PRODUCTOS SIN ESPECIALIZACIÓN OBTENIDA
-- Objetivo: Evidenciar productos del supertipo que no son procesadores ni memorias
-- ==============================================================================
SELECT 
    p.Codbarras_prod,
    p.Nombre_prod,
    c.Nombre_cat AS Categoria,
    r.Capacidad_gb AS RAM_GB,
    cpu.Nucleos AS CPU_Nucleos,
    ssd.Interfaz AS SSD_Interfaz
FROM dbo.Producto p
INNER JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
LEFT JOIN dbo.RAM r ON p.Codbarras_prod = r.Codbarras_prod
LEFT JOIN dbo.CPU cpu ON p.Codbarras_prod = cpu.Codbarras_prod
LEFT JOIN dbo.SSD ssd ON p.Codbarras_prod = ssd.Codbarras_prod
ORDER BY p.Codbarras_prod;

-- ==============================================================================
-- 5. RELACIÓN MUCHOS A MUCHOS (M:N): PRODUCTO - PROVEEDOR (SUMINISTRA)
-- Objetivo: Analizar proveedores mayoristas y dispersión del precio de compra
-- ==============================================================================
SELECT 
    p.Codbarras_prod AS Codigo,
    p.Nombre_prod AS Producto,
    pr.Nombre_prov AS Proveedor,
    pr.Telefono_prov AS Contacto,
    s.Precio_compra AS Costo_Adquisicion,
    p.Precio AS Precio_Venta_Publico,
    CAST(p.Precio - s.Precio_compra AS DECIMAL(10,2)) AS Margen_Bruto_Unitario
FROM dbo.Suministra s
INNER JOIN dbo.Producto p ON s.Codbarras_prod = p.Codbarras_prod
INNER JOIN dbo.Proveedor pr ON s.ID_proveedor = pr.ID_proveedor
ORDER BY p.Codbarras_prod, s.Precio_compra ASC;

-- ==============================================================================
-- 6. VENTAS Y COMPROBANTES CON CLIENTE Y CAJERO (INNER JOIN 4 TABLAS)
-- Objetivo: Trazabilidad completa de comprobantes emitidos en el POS
-- ==============================================================================
SELECT 
    v.Numero_comprobante AS Nro_Comprobante,
    tc.Nombre_tipo AS Tipo_Doc,
    CONVERT(VARCHAR(10), v.Fecha_venta, 120) AS Fecha_Emision,
    cl.Dni_cliente AS DNI_Cliente,
    CONCAT(cl.Nombre_cl, ' ', cl.Apellido_cl) AS Cliente,
    CONCAT(e.Nombre_emp, ' ', e.Apellido_emp) AS Cajero_Responsable,
    v.Total_venta AS Total_Facturado
FROM dbo.Venta v
INNER JOIN dbo.Tipo_Comprobante tc ON v.ID_tipo_comp = tc.ID_tipo_comp
INNER JOIN dbo.Cliente cl ON v.Dni_cliente = cl.Dni_cliente
INNER JOIN dbo.Empleado e ON v.ID_empleado = e.ID_empleado
ORDER BY v.Fecha_venta DESC, v.Numero_comprobante DESC;

-- ==============================================================================
-- 7. DETALLE DE VENTAS COMPLETO CON SUBYTOTÁLES Y PRODUCTO
-- Objetivo: Auditar líneas de comprobantes y validación de Subtotal
-- ==============================================================================
SELECT 
    v.Numero_comprobante,
    dv.ID_detalle,
    p.Nombre_prod AS Articulo_Despachado,
    dv.Cantidad,
    dv.Precio_unitario AS Precio_Aplicado,
    dv.Subtotal AS Subtotal_Calculado
FROM dbo.Detalle_Venta dv
INNER JOIN dbo.Venta v ON dv.ID_venta = v.ID_venta
INNER JOIN dbo.Producto p ON dv.Codbarras_prod = p.Codbarras_prod
ORDER BY v.Numero_comprobante, dv.ID_detalle;

-- ==============================================================================
-- 8. PAGOS MIXTOS POR COMPROBANTE Y DETECCIÓN MULTI-MÉTODO
-- Objetivo: Identificar ventas liquidadas con más de un método de pago
-- ==============================================================================
SELECT 
    v.Numero_comprobante,
    v.Total_venta AS Total_Comprobante,
    mp.Nombre_metodo AS Metodo_Pago_Utilizado,
    vmp.Monto_pagado AS Monto_Abonado
FROM dbo.Venta_Metodo_Pago vmp
INNER JOIN dbo.Venta v ON vmp.ID_venta = v.ID_venta
INNER JOIN dbo.Metodo_Pago mp ON vmp.ID_metodo = mp.ID_metodo
ORDER BY v.Numero_comprobante, mp.Nombre_metodo;

-- ==============================================================================
-- 9. CONCILIACIÓN FINANCIERA TRIPLE: VENTA VS DETALLES VS PAGOS
-- Objetivo: Demostrar consistencia matemática estricta a nivel de motor
-- ==============================================================================
SELECT 
    v.Numero_comprobante,
    v.Total_venta AS Total_Cabecera,
    det.Suma_Subtotales,
    pag.Suma_Pagos,
    CASE 
        WHEN v.Total_venta = det.Suma_Subtotales AND v.Total_venta = pag.Suma_Pagos 
        THEN 'CONCILIACIÓN EXACTA (OK)' 
        ELSE 'ERROR DE CUADRATURA' 
    END AS Estado_Auditoria
FROM dbo.Venta v
INNER JOIN (
    SELECT ID_venta, SUM(Subtotal) AS Suma_Subtotales
    FROM dbo.Detalle_Venta
    GROUP BY ID_venta
) det ON v.ID_venta = det.ID_venta
INNER JOIN (
    SELECT ID_venta, SUM(Monto_pagado) AS Suma_Pagos
    FROM dbo.Venta_Metodo_Pago
    GROUP BY ID_venta
) pag ON v.ID_venta = pag.ID_venta
ORDER BY v.Numero_comprobante;

-- ==============================================================================
-- 10. KARDEX POR PRODUCTO: HISTORIAL CRONOLÓGICO DE EXISTENCIAS
-- Objetivo: Trazabilidad de entradas, salidas y reingresos para un SKU
-- ==============================================================================
SELECT 
    m.ID_movimiento,
    CONVERT(VARCHAR(10), m.Fecha, 120) AS Fecha,
    tm.Nombre_tipo AS Tipo_Movimiento,
    m.Cantidad,
    p.Nombre_prod AS Producto,
    CONCAT(e.Nombre_emp, ' ', e.Apellido_emp) AS Responsable
FROM dbo.Mov_Inventario m
INNER JOIN dbo.Tipo_Movimiento tm ON m.ID_tipo_mov = tm.ID_tipo_mov
INNER JOIN dbo.Producto p ON m.Codbarras_prod = p.Codbarras_prod
INNER JOIN dbo.Empleado e ON m.ID_empleado = e.ID_empleado
WHERE m.Codbarras_prod = '7750000000001' -- Kingston Fury Beast 16GB
ORDER BY m.Fecha ASC, m.ID_movimiento ASC;

-- ==============================================================================
-- 11. GESTIÓN DE DEVOLUCIONES Y GARANTÍAS (RMA) CON RESOLUCIÓN TÉCNICA
-- Objetivo: Expedientes RMA, motivos justificados y estado del trámite
-- ==============================================================================
SELECT 
    d.ID_devolucion AS Nro_Expediente,
    CONVERT(VARCHAR(10), d.Fecha_dev, 120) AS Fecha_Solicitud,
    ed.Nombre_estado AS Estado_Resolucion,
    v.Numero_comprobante AS Comprobante_Origen,
    p.Nombre_prod AS Componente_Reclamado,
    dd.Cantidad_dev AS Unidades_Afectadas,
    md.Descripcion_motivo AS Motivo_Declarado,
    CONCAT(e.Nombre_emp, ' ', e.Apellido_emp) AS Evaluador_Tecnico
FROM dbo.Devolucion d
INNER JOIN dbo.Estado_Dev ed ON d.ID_estado_dev = ed.ID_estado_dev
INNER JOIN dbo.Venta v ON d.ID_venta = v.ID_venta
INNER JOIN dbo.Detalle_Dev dd ON d.ID_devolucion = dd.ID_devolucion
INNER JOIN dbo.Detalle_Venta dv ON dd.ID_detalle = dv.ID_detalle
INNER JOIN dbo.Producto p ON dv.Codbarras_prod = p.Codbarras_prod
INNER JOIN dbo.Motivo_Dev md ON dd.ID_motivo = md.ID_motivo
INNER JOIN dbo.Empleado e ON d.ID_empleado = e.ID_empleado
ORDER BY d.ID_devolucion ASC;

-- ==============================================================================
-- 12. SUBCONSULTA MONO-REGISTRO: PRODUCTOS POR ENCIMA DEL PRECIO PROMEDIO
-- Objetivo: Identificar gama alta respecto a la media de catálogo
-- ==============================================================================
SELECT 
    p.Nombre_prod, 
    p.Precio,
    (SELECT CAST(AVG(Precio) AS DECIMAL(10,2)) FROM dbo.Producto) AS Promedio_General
FROM dbo.Producto p
WHERE p.Precio > (SELECT AVG(Precio) FROM dbo.Producto)
ORDER BY p.Precio DESC;

-- ==============================================================================
-- 13. SUBCONSULTA MULTI-REGISTRO (IN): PRODUCTOS DE FAMILIAS RAM Y SSD
-- Objetivo: Filtrar subconjunto de categorías mediante conjunto derivado
-- ==============================================================================
SELECT 
    p.Codbarras_prod,
    p.Nombre_prod,
    c.Nombre_cat AS Categoria,
    p.Precio
FROM dbo.Producto p
INNER JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
WHERE p.ID_categoria IN (
    SELECT ID_categoria 
    FROM dbo.Categoria 
    WHERE Nombre_cat IN ('RAM', 'SSD')
)
ORDER BY c.Nombre_cat, p.Precio ASC;

-- ==============================================================================
-- 14. SUBCONSULTA MULTI-COLUMNA: PRODUCTO MÁS COSTOSO DE CADA CATEGORÍA
-- Objetivo: Demostrar enlace por clave compuesta en tabla derivada
-- ==============================================================================
SELECT 
    c.Nombre_cat AS Categoria,
    p.Nombre_prod AS Producto_Top,
    p.Precio AS Precio_Maximo
FROM dbo.Producto p
INNER JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
INNER JOIN (
    SELECT ID_categoria, MAX(Precio) AS Max_Precio
    FROM dbo.Producto
    GROUP BY ID_categoria
) mx ON p.ID_categoria = mx.ID_categoria AND p.Precio = mx.Max_Precio
ORDER BY p.Precio DESC;

-- ==============================================================================
-- 15. AGREGACIÓN CON GROUP BY Y HAVING: MARCAS CON AL MENOS 2 PRODUCTOS
-- Objetivo: Filtrar grupos consolidados tras agregación
-- ==============================================================================
SELECT 
    m.Nombre_marca AS Marca,
    COUNT(p.Codbarras_prod) AS Total_Modelos_Registrados,
    SUM(p.Stock) AS Existencias_Acumuladas,
    CAST(AVG(p.Precio) AS DECIMAL(10,2)) AS Precio_Promedio_Marca
FROM dbo.Producto p
INNER JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
GROUP BY m.Nombre_marca
HAVING COUNT(p.Codbarras_prod) >= 2
ORDER BY Total_Modelos_Registrados DESC;

-- ==============================================================================
-- 16. CONSOLIDACIÓN DE VENTAS POR CLIENTE (RECURRENCIA COMERCIAL)
-- Objetivo: Ranking de clientes por volumen de compra y facturación
-- ==============================================================================
SELECT 
    cl.Dni_cliente AS DNI,
    CONCAT(cl.Nombre_cl, ' ', cl.Apellido_cl) AS Cliente,
    COUNT(v.ID_venta) AS Cantidad_Compras,
    SUM(v.Total_venta) AS Total_Gastado_Acumulado,
    CAST(AVG(v.Total_venta) AS DECIMAL(10,2)) AS Ticket_Promedio_Cliente
FROM dbo.Venta v
INNER JOIN dbo.Cliente cl ON v.Dni_cliente = cl.Dni_cliente
GROUP BY cl.Dni_cliente, cl.Nombre_cl, cl.Apellido_cl
ORDER BY Total_Gastado_Acumulado DESC;
