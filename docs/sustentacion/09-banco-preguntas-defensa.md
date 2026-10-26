# BANCO DE PREGUNTAS FRECUENTES Y DEFENSA TÉCNICA
## Preparación Integral para Preguntas del Jurado Evaluador — MISHUTEC

Este documento recopila las 14 preguntas técnicas más exigentes y habituales formuladas por docentes de bases de datos e ingeniería de sistemas, acompañadas de sus respuestas fundamentadas con código real y tablas de Mishutec.

---

### Pregunta 1: ¿Por qué eligieron Microsoft SQL Server y no una base de datos NoSQL (MongoDB) o una solución embebida (SQLite)?
* **Respuesta del Estudiante:**  
  *"Elegimos Microsoft SQL Server porque el dominio de negocio de Mishutec es eminentemente comercial, financiero y de inventarios, donde la **consistencia inmediata de datos** y el cumplimiento de las propiedades **ACID** son indispensables. En una tienda de computadoras, el inventario y el dinero no pueden regirse por el modelo de 'consistencia eventual' característico de NoSQL, ya que se correría el riesgo de vender dos veces la misma tarjeta gráfica o generar descuadres en el arqueo de caja.*  
  *Respecto a SQLite, carece de un motor de concurrencia cliente-servidor robusto, no soporta autenticación integrada a nivel de red ni permite bloqueos granulares por fila ante múltiples terminales de cobro concurrentes. SQL Server Express nos brinda un motor relacional de grado industrial, consultas analíticas complejas mediante T-SQL y soporte de restricciones declarativas estrictas."*

---

### Pregunta 2: ¿Qué es una clave primaria y qué criterios se usaron para elegirlas en Mishutec?
* **Respuesta del Estudiante:**  
  *"Una clave primaria es una columna o conjunto de columnas que identifica de forma unívoca, no nula e irreducible a cada tupla dentro de una relación relacional.*  
  *En Mishutec aplicamos dos criterios de diseño:*  
  1. **Claves Naturales de Negocio:** En \`dbo.Producto\` usamos el estándar internacional EAN-13 (\`Codbarras_prod VARCHAR(13)\`) porque es el código físico escaneado por el POS. En \`dbo.Cliente\` usamos el documento de identidad (\`Dni_cliente VARCHAR(8)\`).  
  2. **Claves Subrogadas Numéricas:** En tablas transaccionales y catálogos usamos \`INT IDENTITY(1,1)\` (ej. \`ID_venta\`, \`ID_movimiento\`, \`ID_categoria\`) para optimizar el rendimiento de los índices B-Tree y evitar claves compuestas excesivamente anchas en las relaciones foráneas."*

---

### Pregunta 3: ¿Qué es una clave foránea y cómo protege la integridad referencial en el sistema?
* **Respuesta del Estudiante:**  
  *"Una clave foránea es un atributo de una tabla que hace referencia a la clave primaria de otra tabla, estableciendo una relación formal entre ambas entidades.*  
  *En Mishutec, el motor SQL Server vigila que nunca existan 'registros huérfanos'. Por ejemplo, la restricción \`FK_Venta_Cliente\` impide registrar una venta con un DNI inexistente en la tabla \`Cliente\`. Asimismo, la restricción \`FK_Producto_Categoria\` impide borrar accidentalmente la categoría 'RAM' mientras existan memorias Kingston o Corsair asociadas en la tabla \`Producto\`. La integridad referencial garantiza que la base de datos sea autoprotegida a nivel de motor, con independencia de la aplicación."*

---

### Pregunta 4: ¿Cómo evitan registros duplicados en el sistema?
* **Respuesta del Estudiante:**  
  *"Mediante dos mecanismos declarativos:*  
  1. **Restricciones \`UNIQUE\` Simples:** En \`dbo.Venta\`, la restricción \`UQ_Venta_Numero_comprobante\` prohíbe terminantemente duplicar un número de boleta o factura (ej. no pueden existir dos ventas con código \`B001-000001\`). Los catálogos (\`Marca\`, \`Categoria\`, etc.) también poseen restricciones \`UNIQUE\` en sus nombres.  
  2. **Restricciones \`UNIQUE\` Compuestas:** En \`dbo.Detalle_Venta\`, la restricción \`UQ_Detalle_Venta_Prod\` sobre \`(ID_venta, Codbarras_prod)\` impide que un mismo producto aparezca dos veces como renglones separados en la misma venta; si el cliente agrega más unidades, se incrementa la columna \`Cantidad\`."*

---

### Pregunta 5: ¿Qué es una transacción y qué significa el acrónimo ACID?
* **Respuesta del Estudiante:**  
  *"Una transacción es una unidad lógica de trabajo compuesta por una o varias operaciones de base de datos que deben ejecutarse bajo el principio de 'todo o nada'. El acrónimo ACID define las cuatro propiedades indispensables:*  
  * **A (Atomicidad):** Todas las instrucciones de la transacción se ejecutan con éxito o ninguna surte efecto.  
  * **C (Consistencia):** La base de datos pasa de un estado válido a otro estado válido, respetando todas las claves foráneas, restricciones \`CHECK\` y disparadores.  
  * **I (Aislamiento):** Las transacciones concurrentes se ejecutan sin interferir entre sí, evitando lecturas sucias mediante niveles de aislamiento relacional.  
  * **D (Durabilidad):** Una vez confirmada (\`COMMIT\`), las modificaciones persisten permanentemente en disco, incluso ante caídas del servidor eléctrico."*

---

### Pregunta 6: ¿Qué sucede si ocurre un corte de luz o un error al procesar una venta en el POS?
* **Respuesta del Estudiante:**  
  *"En la capa de aplicación (\`SaleService.ts\`) abrimos una transacción explícita mediante \`new sql.Transaction(pool)\` y encapsulamos todas las escrituras en un bloque \`try/catch\`.*  
  *Si el sistema inserta la cabecera en \`dbo.Venta\` y el detalle en \`dbo.Detalle_Venta\`, pero ocurre un error al registrar el método de pago o se cae la red, el flujo salta automáticamente al bloque \`catch\` donde se invoca \`await transaction.rollback()\`.*  
  *SQL Server revierte instantáneamente todas las operaciones parciales utilizando el archivo de registro de transacciones (\`MishutecT2.ldf\`). Ni la venta queda a medias, ni el stock se descuenta, ni el dinero se descuadra."*

---

### Pregunta 7: ¿Cómo evitan el stock negativo?
* **Respuesta del Estudiante:**  
  *"Aplicamos un modelo de defensa en profundidad en dos capas:*  
  1. **A nivel de Motor SQL (Barrera Definitiva):** La tabla \`dbo.Producto\` cuenta con la restricción \`CONSTRAINT CK_Producto_Stock CHECK (Stock >= 0)\`. Si cualquier proceso intentara descontar existencias por debajo de cero, el propio motor aborta la instrucción y dispara un error de restricción violada.  
  2. **A nivel de Lógica de Negocio (Barrera Preventiva):** En \`SaleService\`, antes de emitir la venta, se valida que \`producto.Stock >= item.Cantidad\`. Si no hay existencias suficientes, la transacción ni siquiera se abre y la interfaz POS notifica al cajero con una alerta de stock insuficiente."*

---

### Pregunta 8: ¿Cómo trabajan los JOIN y cuál es la diferencia entre INNER JOIN y LEFT JOIN en su modelo?
* **Respuesta del Estudiante:**  
  *"El \`JOIN\` realiza el producto cartesiano de dos tablas y filtra las tuplas que satisfacen la condición de enlace (\`ON\`):*  
  * **\`INNER JOIN\` (Intersección Estricta):** Devuelve solo las filas que tienen correspondencia en ambas tablas. Por ejemplo, al consultar ventas con clientes (\`dbo.Venta INNER JOIN dbo.Cliente\`), solo se devuelven ventas que tengan un cliente válido asociado.  
  * **\`LEFT JOIN\` (Preservación de la Tabla Izquierda):** Devuelve todas las filas de la tabla de la izquierda, y si no existe coincidencia en la derecha, rellena sus columnas con \`NULL\`. En Mishutec lo usamos en la consulta de especialización técnica: consultamos \`dbo.Producto LEFT JOIN dbo.RAM\`; si el producto es un procesador, los datos del producto aparecen completos y las columnas de la memoria RAM devuelven \`NULL\`."*

---

### Pregunta 9: ¿Cómo funciona la relación entre Producto y Proveedor mediante la tabla Suministra?
* **Respuesta del Estudiante:**  
  *"Representa una relación muchos a muchos ($M:N$). Un producto puede ser suministrado por varios distribuidores mayoristas, y cada distribuidor comercializa múltiples productos.*  
  *La tabla asociativa \`dbo.Suministra\` resuelve la relación mediante una clave primaria compuesta: \`PK_Suministra (Codbarras_prod, ID_proveedor)\`. Además, almacena el atributo \`Precio_compra\`. Esto nos permite modelar la realidad del mercado: por ejemplo, la memoria Kingston Fury es suministrada por 'Tecno Import Perú SAC' a S/ 130.00 y por 'Distribuidora Andina de Cómputo' a S/ 135.00, permitiendo al sistema comparar márgenes brutos de ganancia."*

---

### Pregunta 10: ¿Qué pasa si dos cajeros intentan vender la última unidad de un producto al mismo tiempo?
* **Respuesta del Estudiante:**  
  *"SQL Server gestiona este escenario mediante su gestor de bloqueos de concurrencia (Lock Manager).*  
  *Cuando el primer cajero inicia la transacción e intenta actualizar el stock con \`UPDATE dbo.Producto SET Stock = Stock - 1 WHERE Codbarras_prod = ...\`, el motor adquiere un **bloqueo exclusivo (Exclusive Lock - X)** sobre la fila del producto.*  
  *El segundo cajero queda temporalmente retenido en espera. Una vez que la primera transacción hace \`COMMIT\`, el stock pasa a 0. Cuando la segunda transacción intenta ejecutar su actualización, la restricción \`CHECK (Stock >= 0)\` o la verificación de existencia detecta que el stock es 0, impidiendo la venta con error y protegiendo el inventario contra sobreventas."*

---

### Pregunta 11: ¿Cómo se gestionan las devoluciones y por qué no incrementan automáticamente el inventario?
* **Respuesta del Estudiante:**  
  *"En la industria del hardware, una devolución por falla técnica (ej. una tarjeta gráfica quemada) **no puede retornar al stock comercial vendible**, porque se volvería a vender un componente dañado a otro cliente.*  
  *Por ello, en Mishutec la aprobación de una garantía formaliza el derecho comercial del cliente pero mantiene el producto averiado en custodia de descarte técnico. Únicamente cuando la causal justificada es 'Producto equivocado' con certificación de empaque intacto, el jefe de almacén registra de manera deliberada un movimiento de Entrada en el Kardex (como ocurrió en el Movimiento Kardex #52). Asimismo, en el modelo de Mishutec no existen devoluciones de dinero ni notas de crédito monetarias; el monto facturado original permanece inmutable."*

---

### Pregunta 12: ¿Cómo protegieron la aplicación contra ataques informáticos?
* **Respuesta del Estudiante:**  
  *"Implementamos una estrategia de defensa en profundidad:*  
  1. **Inyección SQL (CWE-89):** Erradicada mediante consultas 100% parametrizadas con el driver \`mssql\` (\`request.input()\`). Cero concatenación de cadenas SQL en toda la aplicación.  
  2. **Open Redirect (CWE-601):** Neutralizado mediante la función \`sanitizeRedirectUrl\` en el login, que valida que el parámetro \`?from=\` sea estrictamente una ruta interna relativa.  
  3. **Robo de Sesión (XSS / CSRF):** Empleamos tokens JWT firmados con HS256 empaquetados en cookies con directivas \`HttpOnly: true\` (inaccesibles por JavaScript) y \`SameSite: Lax\`.  
  4. **Protección de Datos Personales (Ley N° 29733):** Enmascaramiento de DNIs (\`72****90\`), correos y teléfonos en vistas públicas y exportaciones."*

---

### Pregunta 13: ¿Qué limitaciones técnicas tiene el sistema actualmente?
* **Respuesta del Estudiante:**  
  *"Reconocemos con rigor profesional cuatro limitaciones del alcance actual:*  
  1. **Comprobantes Comerciales Internos:** No se cuenta con conexión web service SOAP/REST hacia SUNAT para el timbrado con firma digital electrónica (se emiten comprobantes para control interno).  
  2. **Autenticación Administrativa Local:** El sistema utiliza una cuenta de administrador centralizada en lugar de un módulo de gestión de usuarios multi-rol (RBAC) con contraseñas en base de datos.  
  3. **Garantía Histórica en Detalle de Venta:** El plazo de garantía se consulta en \`Producto\`; si el fabricante reduce la garantía en el catálogo futuro, no queda congelado el plazo histórico en la línea de venta previa.  
  4. **Riesgo de Infraestructura H-05:** La aplicación se conecta mediante Windows Authentication utilizando el usuario del host (\`DESKTOP-QV4VK5K\USER\`), teniendo pendiente la creación de un usuario dedicado en SQL Server con privilegios mínimos."*

---

### Pregunta 14: ¿Qué es el Kardex y cómo se concilia matemáticamente con el stock físico?
* **Respuesta del Estudiante:**  
  *"El Kardex es el registro cronológico y formal de todos los movimientos de entrada, salida y ajuste que afectan a las existencias físicas de un almacén (\`dbo.Mov_Inventario\`).*  
  *En Mishutec, el stock actual de 76 unidades se valida mediante la siguiente fórmula de cuadratura:*  
  $$\text{Stock Total} = \sum \text{Entradas} - \sum \text{Salidas} \pm \text{Ajustes}$$  
  *En la base de aceptación, las entradas acumuladas suman **113 unidades**, las salidas acumuladas por ventas suman **37 unidades**, arrojando exactamente: $113 - 37 = \mathbf{76\text{ unidades físicas disponibles}}$. Esta conciliación matemática demuestra la integridad total de nuestro almacén."*
