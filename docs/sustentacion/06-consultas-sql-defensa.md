# COLECCIÓN DE CONSULTAS SQL SEGURAS PARA DEFENSA ACADÉMICA
## Guía de Demostración en SQL Server Management Studio (SSMS)

**Motor:** Microsoft SQL Server 2022 Express Edition  
**Base Activa Recomendada:** \`MishutecT2_Aceptacion\` (permite mostrar el volumen completo de 9 ventas y 7 devoluciones)  
**Base Académica Original:** \`MishutecT2\` (compatible al 100% para las consultas 1 a 16)  
**Naturaleza:** 100% de Solo Lectura (\`SELECT\`). Ninguna de estas consultas altera registros ni bloquea recursos.

---

## 1. ÍNDICE DE CONSULTAS PARA LA SUSTENTACIÓN

| # | Categoría Técnica | Objetivo Demostrativo | Complejidad |
|---|-------------------|------------------------|:-----------:|
| **Q1** | Filtro y Ordenamiento | Productos disponibles con precio $\ge$ S/ 250.00 | Básica |
| **Q2** | Aritmética y Negocio | Cálculo de IGV (18%) y valorización de inventario retail | Básica |
| **Q3** | INNER JOIN (3 tablas) | Cruce de Catálogo con Marca y Categoría | Intermedia |
| **Q4** | LEFT JOIN | Inspección de especializaciones heterogéneas (CPU, RAM, SSD) | Intermedia |
| **Q5** | Relación Muchos a Muchos | Cruce de \`Suministra\` y análisis de margen de compra | Intermedia |
| **Q6** | INNER JOIN (4 tablas) | Trazabilidad de Comprobante con Cliente y Cajero | Intermedia |
| **Q7** | Líneas de Comprobante | Detalle de Venta con verificación de subtotal | Intermedia |
| **Q8** | Pagos Fraccionados | Identificación de comprobantes con pagos mixtos | Intermedia |
| **Q9** | Conciliación Financiera | Cuadratura triple: Total Venta = $\sum$ Subtotales = $\sum$ Pagos | Avanzada |
| **Q10** | Trazabilidad de Kardex | Historial cronológico de existencias de un SKU específico | Intermedia |
| **Q11** | Postventa y Garantías | Expedientes RMA con motivo y resolución técnica | Intermedia |
| **Q12** | Subconsulta Escalar | Productos con precio superior a la media general | Avanzada |
| **Q13** | Subconsulta Multi-Fila | Operador \`IN\` con subconjunto de categorías | Intermedia |
| **Q14** | Subconsulta Correlacionada | Producto más costoso de cada categoría | Avanzada |
| **Q15** | Agregación y \`HAVING\` | Marcas con al menos 2 modelos en catálogo | Intermedia |
| **Q16** | Consolidación Comercial | Ranking de clientes recurrentes y facturación acumulada | Intermedia |

---

## 2. DETALLE DE LAS 16 CONSULTAS PARA DEMOSTRACIÓN

### Consulta Q1: Filtro y Ordenamiento Básico
* **Objetivo:** Mostrar filtrado lógico y ordenamiento descendente por precio.
* **Tablas Involucradas:** \`dbo.Producto\`.
* **SQL:**
\`\`\`sql
SELECT 
    p.Codbarras_prod AS Codigo,
    p.Nombre_prod AS Producto,
    p.Precio,
    p.Stock,
    p.Garantia_meses AS MesesGarantia
FROM dbo.Producto p
WHERE p.Precio >= 250.00 AND p.Stock > 0
ORDER BY p.Precio DESC;
\`\`\`
* **Interpretación:** Demuestra el uso de operadores relacionales (\`>=\`), lógicos (\`AND\`) y ordenamiento (\`ORDER BY DESC\`). En aceptación retorna tarjetas gráficas ASUS RTX 4060 (S/ 1,450.00), CPUs Ryzen 7 y memorias Corsair.

---

### Consulta Q2: Operadores Aritméticos y Valorización de Stock
* **Objetivo:** Demostrar columnas calculadas y valorización total del almacén.
* **Tablas Involucradas:** \`dbo.Producto\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Permite explicar al docente que la base de datos almacena precios base y que los cálculos comerciales derivados se resuelven en la capa de proyección relacional.

---

### Consulta Q3: Normalización de Catálogos (INNER JOIN 3 Tablas)
* **Objetivo:** Evidenciar cómo se reconstruye la información descompuesta en Tercera Forma Normal.
* **Tablas Involucradas:** \`dbo.Producto\`, \`dbo.Marca\`, \`dbo.Categoria\`, \`dbo.Estado_Prod\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** En lugar de cadenas duplicadas de marcas, los IDs se traducen a nombres amigables mediante \`INNER JOIN\`.

---

### Consulta Q4: Especialización de Hardware y Manejo de Nulos (LEFT JOIN)
* **Objetivo:** Demostrar que los subtipos de producto se consultan limpiamente sin almacenar columnas irrelevantes en la tabla padre.
* **Tablas Involucradas:** \`dbo.Producto\`, \`dbo.Categoria\`, \`dbo.RAM\`, \`dbo.CPU\`, \`dbo.SSD\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Si el producto es una memoria RAM, \`RAM_GB\` tiene valor y los otros campos son \`NULL\`. Esto demuestra que la especialización mantiene normalizado el modelo físico.

---

### Consulta Q5: Relación Muchos a Muchos ($M:N$) y Margen Bruto
* **Objetivo:** Sustentar el papel de la tabla asociativa \`dbo.Suministra\`.
* **Tablas Involucradas:** \`dbo.Suministra\`, \`dbo.Producto\`, \`dbo.Proveedor\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Se observa que la memoria Kingston Fury es abastecida tanto por *Tecno Import* (S/ 130.00) como por *Distribuidora Andina* (S/ 135.00), lo que ilustra una relación $M:N$ real con variación de costo.

---

### Consulta Q6: Comprobantes con Cliente y Cajero
* **Objetivo:** Demostrar la trazabilidad de la venta comercial.
* **Tablas Involucradas:** \`dbo.Venta\`, \`dbo.Tipo_Comprobante\`, \`dbo.Cliente\`, \`dbo.Empleado\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Muestra las 9 ventas en aceptación con sus comprobantes correlativos (\`B001-000001\` a \`B001-000007\`, \`F001-000001\`, \`F001-000002\`).

---

### Consulta Q7: Detalle de Venta y Verificación de Subtotales
* **Objetivo:** Auditar los renglones individuales despachados en cada venta.
* **Tablas Involucradas:** \`dbo.Detalle_Venta\`, \`dbo.Venta\`, \`dbo.Producto\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Se comprueba que cada fila cumple la restricción \`Subtotal = Cantidad * Precio_unitario\`.

---

### Consulta Q8: Desglose de Métodos de Pago y Detección de Pagos Mixtos
* **Objetivo:** Evidenciar la capacidad de liquidar una venta con múltiples modalidades de pago.
* **Tablas Involucradas:** \`dbo.Venta_Metodo_Pago\`, \`dbo.Venta\`, \`dbo.Metodo_Pago\`.
* **SQL:**
\`\`\`sql
SELECT 
    v.Numero_comprobante,
    v.Total_venta AS Total_Comprobante,
    mp.Nombre_metodo AS Metodo_Pago_Utilizado,
    vmp.Monto_pagado AS Monto_Abonado
FROM dbo.Venta_Metodo_Pago vmp
INNER JOIN dbo.Venta v ON vmp.ID_venta = v.ID_venta
INNER JOIN dbo.Metodo_Pago mp ON vmp.ID_metodo = mp.ID_metodo
ORDER BY v.Numero_comprobante, mp.Nombre_metodo;
\`\`\`
* **Interpretación:** Destacar ante el docente la factura \`F001-000001\` (S/ 1,190.00), pagada con S/ 700.00 en Tarjeta y S/ 490.00 en Transferencia.

---

### Consulta Q9: Conciliación Financiera Triple (Prueba de Cuadratura)
* **Objetivo:** Demostrar que el sistema no presenta fugas ni descuadres monetarios.
* **Tablas Involucradas:** \`dbo.Venta\`, \`dbo.Detalle_Venta\`, \`dbo.Venta_Metodo_Pago\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** El 100% de las ventas arrojó \`CONCILIACIÓN EXACTA (OK)\`.

---

### Consulta Q10: Trazabilidad de Kardex por Producto
* **Objetivo:** Demostrar la auditoría secuencial de existencias de un SKU crítico.
* **Tablas Involucradas:** \`dbo.Mov_Inventario\`, \`dbo.Tipo_Movimiento\`, \`dbo.Producto\`, \`dbo.Empleado\`.
* **SQL:**
\`\`\`sql
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
WHERE m.Codbarras_prod = '7750000000001'
ORDER BY m.Fecha ASC, m.ID_movimiento ASC;
\`\`\`
* **Interpretación:** Muestra la entrada inicial (17 unidades), salidas por ventas y el reingreso autorizado (Kardex #52) tras resolución técnica de RMA.

---

### Consulta Q11: Devoluciones y Trámites de Garantía (RMA)
* **Objetivo:** Consultar el estado y justificación técnica de expedientes postventa.
* **Tablas Involucradas:** \`dbo.Devolucion\`, \`dbo.Estado_Dev\`, \`dbo.Venta\`, \`dbo.Detalle_Dev\`, \`dbo.Detalle_Venta\`, \`dbo.Producto\`, \`dbo.Motivo_Dev\`, \`dbo.Empleado\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Evidencia los 7 trámites de aceptación desglosados en aprobados (5), pendientes (1) y rechazados (1).

---

### Consulta Q12: Subconsulta Escalar (Productos sobre la Media)
* **Objetivo:** Demostrar subconsultas mono-registro que retornan un único valor escalar.
* **Tablas Involucradas:** \`dbo.Producto\`.
* **SQL:**
\`\`\`sql
SELECT 
    p.Nombre_prod, 
    p.Precio,
    (SELECT CAST(AVG(Precio) AS DECIMAL(10,2)) FROM dbo.Producto) AS Promedio_General
FROM dbo.Producto p
WHERE p.Precio > (SELECT AVG(Precio) FROM dbo.Producto)
ORDER BY p.Precio DESC;
\`\`\`
* **Interpretación:** La subconsulta calcula dinámicamente el precio promedio de catálogo y filtra los artículos cuyo precio unitario lo supera.

---

### Consulta Q13: Subconsulta Multi-Registro con Operador \`IN\`
* **Objetivo:** Filtrar tuplas usando un conjunto dinámico retornado por una subconsulta.
* **Tablas Involucradas:** \`dbo.Producto\`, \`dbo.Categoria\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Resuelve la extracción de productos pertenecientes a múltiples categorías sin cablear IDs numéricos fijos.

---

### Consulta Q14: Subconsulta Correlacionada Multi-Columna (Top por Categoría)
* **Objetivo:** Demostrar tablas derivadas con agrupación y enlace compuesto.
* **Tablas Involucradas:** \`dbo.Producto\`, \`dbo.Categoria\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Identifica el componente más costoso dentro de cada familia de hardware.

---

### Consulta Q15: Agregación con \`GROUP BY\` y Cláusula \`HAVING\`
* **Objetivo:** Demostrar filtros sobre funciones agregadas posteriores al agrupamiento.
* **Tablas Involucradas:** \`dbo.Producto\`, \`dbo.Marca\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Explica al docente la diferencia fundamental entre \`WHERE\` (filtra filas antes de agrupar) y \`HAVING\` (filtra grupos calculados).

---

### Consulta Q16: Recurrencia Comercial de Clientes
* **Objetivo:** Ranking de clientes por compras efectuadas y facturación acumulada.
* **Tablas Involucradas:** \`dbo.Venta\`, \`dbo.Cliente\`.
* **SQL:**
\`\`\`sql
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
\`\`\`
* **Interpretación:** Demuestra analítica de clientes recurrentes (ej. clienta Ana Torres Quispe con 4 compras registradas).
