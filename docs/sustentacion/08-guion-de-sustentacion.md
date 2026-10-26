# GUION METODOLÓGICO DE SUSTENTACIÓN ACADÉMICA (10 A 15 MINUTOS)
## Defensa Técnica del Sistema y Base de Datos MISHUTEC

**Público Objetivo:** Jurado Evaluador / Docente del Curso de Taller de Base de Datos e Ingeniería de Software  
**Duración Total Estimada:** 12 a 15 minutos  
**Formato de Exposición:** Modular y flexible (adaptable a sustentación individual o en equipo)  
**Herramientas en Vivo:** Diapositivas de apoyo (\`docs/PROYECTO_FINAL.pdf\`), Aplicación Web en ejecución local (\`http://localhost:3000\`) y SQL Server Management Studio (SSMS).

---

## CRONOGRAMA MINUTO A MINUTO DE LA EXPOSICIÓN

```mermaid
timeline
    title Cronograma de la Sustentación Académica (15 Minutos)
    00:00 - 02:00 : 1. Realidad Problemática y Objetivos
    02:00 - 05:00 : 2. Modelo Relacional, 3FN y Especialización de 25 Tablas
    05:00 - 08:00 : 3. Procesos Comerciales: Inventario, Ventas POS y Devoluciones
    08:00 - 11:00 : 4. Arquitectura por Capas y Seguridad en Next.js 16
    11:00 - 13:30 : 5. Demostración en Vivo en SSMS (Consultas SELECT)
    13:30 - 15:00 : 6. Resultados, Certificación y Conclusiones
```

---

## FASE 1: INTRODUCCIÓN Y FUNDAMENTACIÓN (00:00 — 02:00)

### 1. El Problema que Resuelve Mishutec (00:00 - 01:00)
* **Mensaje Clave:**  
  *"Buenos días profesor(a) y jurado calificador. Hoy presentamos el proyecto MISHUTEC, un sistema transaccional desarrollado para resolver la desarticulación operativa que experimentaba una tienda comercial de componentes de hardware y ensamblaje de computadoras."*
* **Puntos a Enfatizar:**
  - Desfase entre stock de almacén y ventas de mostrador.
  - Arqueos de caja erróneos por cobros con múltiples métodos de pago (efectivo, tarjeta, transferencias, Yape).
  - Reingreso inadecuado de piezas dañadas por garantías mal gestionadas.

### 2. Objetivo del Sistema (01:00 - 02:00)
* **Mensaje Clave:**  
  *"El objetivo principal fue modelar e implementar una base de datos relacional sólida en Microsoft SQL Server bajo Tercera Forma Normal (3FN), vinculada a una aplicación web moderna que garantice transacciones atómicas (ACID) y cero descuadre financiero."*

---

## FASE 2: MODELO RELACIONAL Y DISEÑO DE BASE DE DATOS (02:00 — 05:00)

### 3. Procesos Troncales del Negocio (02:00 - 02:40)
* **Mostrar:** Diagrama de procesos (Pág. 5 de \`docs/PROYECTO_FINAL.pdf\`):
  1. *Gestión de Inventario y Productos.*
  2. *Proceso de Ventas y Facturación.*
  3. *Gestión de Proveedores y Suministro.*
  4. *Control de Devoluciones y Garantías.*

### 4. Arquitectura de las 25 Tablas Físicas (02:40 - 03:40)
* **Mensaje Clave:**  
  *"El esquema de base de datos no contiene tablas improvisadas ni 'demos'. Está estructurado en 25 tablas físicas organizadas en 7 grupos funcionales: 8 catálogos maestros, 7 tablas de productos y especialización técnica, 3 tablas de personas y proveedores, 1 tabla asociativa de suministro, 3 tablas de ventas y pagos, 1 tabla Kardex y 2 tablas de devoluciones."*

### 5. Especialización de Hardware y Normalización (3FN) (03:40 - 05:00)
* **Demostrar Técnicamente:**
  - **Herencia 1:1:** \`dbo.Producto\` como supertipo genérico y tablas subtipo (\`CPU\`, \`RAM\`, \`SSD\`, \`Grafica\`, \`Fuente_Poder\`, \`Gabinete\`) donde la clave primaria es a la vez clave foránea. Esto erradica los valores nulos por atributos no aplicables.
  - **Relación $M:N$ Producto-Proveedor:** Resuelta mediante \`dbo.Suministra\` con clave primaria compuesta \`(Codbarras_prod, ID_proveedor)\` y atributo \`Precio_compra\`.
  - **Restricciones de Integridad:** \`CHECK (Stock >= 0)\`, \`CHECK (Precio > 0)\`, \`CHECK (Subtotal = Cantidad * Precio_unitario)\` y \`UNIQUE\` en números de comprobante.

---

## FASE 3: PROCESOS COMERCIALES EN LA APLICACIÓN WEB (05:00 — 08:00)

### 6. Productos y Kardex (05:00 - 06:00)
* **Demostración en Pantalla (\`http://localhost:3000/productos\` e \`/inventario\`):**
  - Mostrar el catálogo de 12 SKUs, la ficha técnica con especialización de hardware y la tabla de auditoría Kardex con sus 31 movimientos registrados cronológicamente.
  - Explicar que el stock físico (76 unidades) es el resultado exacto de: Entradas (113) - Salidas (37) = 76 unidades disponibles.

### 7. Ventas, POS y Pagos Mixtos (06:00 - 07:00)
* **Demostración en Pantalla (\`http://localhost:3000/ventas\`):**
  - Mostrar la interfaz de Punto de Venta (POS) con escáner de código de barras.
  - Explicar la transacción ACID: inserción en \`Venta\`, inserción en \`Detalle_Venta\`, descuento automático en \`Producto.Stock\`, generación del movimiento de salida en \`Mov_Inventario\` y desglose en \`Venta_Metodo_Pago\`.
  - Destacar la conciliación: S/ 5,500.00 facturados = S/ 5,500.00 en detalles = S/ 5,500.00 en pagos.

### 8. Devoluciones y Política de Restock (07:00 - 08:00)
* **Demostración en Pantalla (\`http://localhost:3000/devoluciones\`):**
  - Aclarar al jurado: *En Mishutec no existen notas de crédito ni devolución de efectivo; el total facturado tributario es inmutable*.
  - Mostrar los 7 trámites de garantía y explicar que los productos averiados no vuelven al stock. Solo el caso de *Producto equivocado* con empaque sellado generó el reingreso Kardex #52 (1 memoria Kingston Fury).

---

## FASE 4: ARQUITECTURA DE SOFTWARE Y SEGURIDAD (08:00 — 11:00)

### 9. Arquitectura por Capas en Next.js 16 (08:00 - 09:30)
* **Explicar:**
  - Separación limpia: React Server Components (RSC) $\rightarrow$ Server Actions $\rightarrow$ Domain Services $\rightarrow$ Repositories $\rightarrow$ SQL Server Pool (\`msnodesqlv8\`).
  - Cero código SQL en la vista y cero lógica visual en la base de datos.
  - Empleo de validación de esquemas tipados con **Zod** antes de llegar al motor.

### 10. Seguridad y Protección de Rutas (09:30 - 11:00)
* **Explicar las Mitigaciones Certificadas:**
  - **Edge Proxy (\`src/proxy.ts\`):** Estándar de Next.js 16 que protege las 9 rutas comerciales y \`/diagnostico\`.
  - **Prevención de Open Redirect (CWE-601):** Mediante la función \`sanitizeRedirectUrl\` que neutraliza redirecciones maliciosas post-login.
  - **Inyección SQL erradicada:** 100% de consultas parametrizadas con \`request.input()\`.
  - **Protección de Datos Personales (Ley N° 29733):** Enmascaramiento de DNI (\`72****90\`), correos y teléfonos.

---

## FASE 5: DEMOSTRACIÓN EN VIVO EN SQL SERVER (11:00 — 13:30)

*Abrir SQL Server Management Studio (SSMS), conectarse a \`DESKTOP-QV4VK5K\SQLEXPRESS\` y abrir el archivo \`docs/sustentacion/06-consultas-sql-defensa.sql\`.*

### 11. Ejecución de Consultas Clave en SSMS:
1. **Consulta Q9 (Conciliación Financiera Triple):**  
   *Ejecutar la consulta de cuadratura.*  
   *Comentario:* *"Profesor, aquí demostramos que en las 9 ventas no existe un solo céntimo de descuadre: el total de la cabecera es idéntico a la suma de detalles y a la suma de abonos."*
2. **Consulta Q5 (Relación $M:N$ Producto-Proveedor):**  
   *Ejecutar la consulta sobre \`Suministra\`.*  
   *Comentario:* *"Aquí se aprecia cómo resolvemos la relación muchos a muchos, permitiendo ver los precios de compra de cada mayorista y el margen bruto generado."*
3. **Consulta Q14 (Subconsulta Correlacionada con Top por Categoría):**  
   *Ejecutar la consulta de producto más caro por familia.*  
   *Comentario:* *"Esta consulta utiliza una tabla derivada con agrupación para enlazar por categoría y precio máximo simultáneamente."*

---

## FASE 6: RESULTADOS Y CONCLUSIONES (13:30 — 15:00)

### 12. Resultados de la Auditoría y Cero Deriva (13:30 - 14:15)
* **Métricas Finales Certificadas:**
  - **MishutecT2 (Base Académica Protegida):** 10 productos, 73 stock, 5 ventas, S/ 4,050.00, 17 Kardex, 1 devolución. Intacta sin modificaciones.
  - **MishutecT2_Aceptacion (Base Activa):** 12 productos, 76 stock, 9 ventas, S/ 5,500.00, 31 Kardex, 7 devoluciones.
  - **Pruebas Automatizadas:** 73/73 pruebas E2E aprobadas en Fase 9C (100% PASS).

### 13. Conclusión Final (14:15 - 15:00)
* **Cierre Formal:**  
  *"En conclusión, Mishutec no es solo una base de datos con tablas teóricas, sino una solución comercial completa donde las 25 tablas físicas soportan transacciones reales, resguardan la consistencia de inventarios y garantizan la seguridad operativa de la empresa. Quedamos a disposición del jurado para cualquier pregunta técnica. Muchas gracias."*
