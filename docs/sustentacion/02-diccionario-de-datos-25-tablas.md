# DICCIONARIO DE DATOS TÉCNICO DE LAS 25 TABLAS FÍSICAS
## Sistema de Gestión Comercial, Inventario y POS — MISHUTEC

> **Base de Datos:** `MishutecT2` / `MishutecT2_Aceptacion`  
> **Motor:** Microsoft SQL Server 2022 Express Edition (Esquema `dbo`)  
> **Conformidad Relacional:** 25 tablas en Tercera Forma Normal (3FN) con integridad referencial estricta.

---

## 1. ESTRUCTURA Y ORGANIZACIÓN DEL ESQUEMA

Las 25 tablas físicas del esquema `dbo` se encuentran organizadas en 7 agrupaciones funcionales que representan la totalidad del ciclo de vida comercial:

| Agrupación Funcional | Tablas Integradas | Cantidad | Propósito General |
|----------------------|-------------------|:--------:|-------------------|
| **1. Catálogos Maestros** | `Marca`, `Categoria`, `Estado_Prod`, `Tipo_Comprobante`, `Metodo_Pago`, `Tipo_Movimiento`, `Estado_Dev`, `Motivo_Dev` | 8 | Normalización de dominios cerrados y descripciones. |
| **2. Productos y Especializaciones** | `Producto`, `CPU`, `RAM`, `SSD`, `Grafica`, `Fuente_Poder`, `Gabinete` | 7 | Catálogo general y herencia relacional de especificaciones técnicas. |
| **3. Personas y Entidades** | `Cliente`, `Empleado`, `Proveedor` | 3 | Actores comerciales y personal operativo. |
| **4. Cadena de Suministro** | `Suministra` | 1 | Resolución $M:N$ Producto-Proveedor con precio de compra. |
| **5. Ventas y Facturación** | `Venta`, `Detalle_Venta`, `Venta_Metodo_Pago` | 3 | Cabeceras de comprobante, líneas de detalle y pagos mixtos. |
| **6. Inventario y Almacén** | `Mov_Inventario` | 1 | Kardex cronológico de entradas, salidas y ajustes. |
| **7. Devoluciones y Garantías** | `Devolucion`, `Detalle_Dev` | 2 | Expedientes RMA, resolución técnica y aislamiento de averías. |
| **TOTAL GENERAL** | — | **25** | **Esquema relacional físico completo.** |

---

## 1. CATÁLOGOS MAESTROS

### Tabla Física: `dbo.Marca`

* **Finalidad:** Almacena las marcas fabricantes de componentes de hardware comercializados.
* **Rol en Mishutec:** Estandariza los nombres de fabricantes (ej. Kingston, Corsair, AMD, Intel, ASUS, Samsung, Cooler Master). Evita errores tipográficos en el catálogo.
* **Clave Primaria (PK):** `ID_marca` (PK__Marca__36DBB8CBE983C532)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_marca` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Nombre_marca` | `VARCHAR(50)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Marca__A1F7E18A2B3E2780`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Marca__A1F7E18A2B3E2780`: Columnas `(Nombre_marca)`

---

### Tabla Física: `dbo.Categoria`

* **Finalidad:** Clasifica los productos según su familia técnica o segmento de hardware.
* **Rol en Mishutec:** Categorías como RAM, SSD, CPU, Grafica, Fuente de poder y Gabinete. Determina qué tabla de especialización debe completarse.
* **Clave Primaria (PK):** `ID_categoria` (PK__Categori__3790015670028896)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_categoria` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Nombre_cat` | `VARCHAR(50)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Categori__3FE29294B02AA9CD`) |
| 3 | `Descripcion_cat` | `VARCHAR(200)` | NULL | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Categori__3FE29294B02AA9CD`: Columnas `(Nombre_cat)`

---

### Tabla Física: `dbo.Estado_Prod`

* **Finalidad:** Define la condición comercial del producto en el catálogo.
* **Rol en Mishutec:** Estados: 'Disponible' (apto para venta), 'Agotado' (stock 0 temporal) y 'Descontinuado' (retirado del catálogo).
* **Clave Primaria (PK):** `ID_estado_prod` (PK__Estado_P__36C7CB802EBC65B4)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_estado_prod` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Estado` | `VARCHAR(30)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Estado_P__36DF552F067A51A0`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Estado_P__36DF552F067A51A0`: Columnas `(Estado)`

---

### Tabla Física: `dbo.Tipo_Comprobante`

* **Finalidad:** Catalogación de comprobantes de pago comerciales emitidos por la tienda.
* **Rol en Mishutec:** Valores: 'Boleta' (consumidor final) y 'Factura' (empresas con RUC/contabilidad). Rige el prefijo B001 o F001.
* **Clave Primaria (PK):** `ID_tipo_comp` (PK__Tipo_Com__BD7FEE17C2C76EE6)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_tipo_comp` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Nombre_tipo` | `VARCHAR(30)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Tipo_Com__A3F0A41FAEF57FAC`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Tipo_Com__A3F0A41FAEF57FAC`: Columnas `(Nombre_tipo)`

---

### Tabla Física: `dbo.Metodo_Pago`

* **Finalidad:** Catálogo de medios de pago financieros admitidos en el Punto de Venta (POS).
* **Rol en Mishutec:** Valores: 'Efectivo', 'Tarjeta', 'Transferencia' y 'Yape'. Permite combinar múltiples modalidades en una misma venta.
* **Clave Primaria (PK):** `ID_metodo` (PK__Metodo_P__645FC8982CD9F7E4)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_metodo` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Nombre_metodo` | `VARCHAR(40)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Metodo_P__CC422F4DA51F2931`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Metodo_P__CC422F4DA51F2931`: Columnas `(Nombre_metodo)`

---

### Tabla Física: `dbo.Tipo_Movimiento`

* **Finalidad:** Tipifica la naturaleza de los registros de auditoría en el inventario Kardex.
* **Rol en Mishutec:** Valores: 'Entrada' (recepción o reingreso RMA), 'Salida' (despacho por venta) y 'Ajuste' (cuadratura física).
* **Clave Primaria (PK):** `ID_tipo_mov` (PK__Tipo_Mov__2C1E3A9CCE9CF232)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_tipo_mov` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Nombre_tipo` | `VARCHAR(40)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Tipo_Mov__A3F0A41F2F01E3F3`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Tipo_Mov__A3F0A41F2F01E3F3`: Columnas `(Nombre_tipo)`

---

### Tabla Física: `dbo.Estado_Dev`

* **Finalidad:** Controla las etapas del flujo administrativo y técnico de garantías.
* **Rol en Mishutec:** Valores: 'Pendiente' (en evaluación), 'Aprobada' (garantía admitida) y 'Rechazada' (improcedente o daño inducido).
* **Clave Primaria (PK):** `ID_estado_dev` (PK__Estado_D__E48F68983CC9AE90)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_estado_dev` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Nombre_estado` | `VARCHAR(30)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Estado_D__BE574DFBC0CDA877`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Estado_D__BE574DFBC0CDA877`: Columnas `(Nombre_estado)`

---

### Tabla Física: `dbo.Motivo_Dev`

* **Finalidad:** Clasifica la causa declarada por el cliente al presentar un reclamo de postventa.
* **Rol en Mishutec:** Valores: 'Producto defectuoso' (falla física), 'Producto equivocado' (despacho erróneo de empaque sellado) y 'Garantía' (falla diferida).
* **Clave Primaria (PK):** `ID_motivo` (PK__Motivo_D__9535A4ADD394EB2D)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_motivo` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Descripcion_motivo` | `VARCHAR(100)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Motivo_D__856297614BBC3A9D`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Motivo_D__856297614BBC3A9D`: Columnas `(Descripcion_motivo)`

---

## 2. PRODUCTOS Y ESPECIALIZACIONES DE HARDWARE

### Tabla Física: `dbo.Producto`

* **Finalidad:** Entidad central del catálogo maestro comercial de componentes tecnológicos.
* **Rol en Mishutec:** Contiene el código de barras único (EAN-13), nombre, precio unitario de venta, meses de garantía, existencias y referencias a marca y categoría.
* **Clave Primaria (PK):** `Codbarras_prod` (PK__Producto__76879DAF6B710861)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK** |
| 2 | `Nombre_prod` | `VARCHAR(120)` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Precio` | `DECIMAL(10,2)` | **NOT NULL** | No | — | Dato operacional |
| 4 | `Garantia_meses` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 5 | `Stock` | `INT` | **NOT NULL** | No | `((0))` | Dato operacional |
| 6 | `ID_estado_prod` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Estado_Prod.ID_estado_prod` |
| 7 | `ID_categoria` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Categoria.ID_categoria` |
| 8 | `ID_marca` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Marca.ID_marca` |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Producto_Categoria`: `ID_categoria` $\rightarrow$ `dbo.Categoria(ID_categoria)`
  - `FK_Producto_Estado`: `ID_estado_prod` $\rightarrow$ `dbo.Estado_Prod(ID_estado_prod)`
  - `FK_Producto_Marca`: `ID_marca` $\rightarrow$ `dbo.Marca(ID_marca)`
- **Restricciones de Dominio (CHECK):**
  - `CK_Producto_Garantia`: Condición lógica `([Garantia_meses]>=(0))`
  - `CK_Producto_Precio`: Condición lógica `([Precio]>(0))`
  - `CK_Producto_Stock`: Condición lógica `([Stock]>=(0))`

---

### Tabla Física: `dbo.CPU`

* **Finalidad:** Tabla hija de especialización técnica para procesadores centrales.
* **Rol en Mishutec:** Almacena Frecuencia_ghz (ej. 3.40 GHz) y Nucleos (ej. 8 núcleos) para CPUs como AMD Ryzen 7 5700X o Intel i5-12400F.
* **Clave Primaria (PK):** `Codbarras_prod` (PK__CPU__76879DAF66F70FD2)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 2 | `Frecuencia_ghz` | `DECIMAL(4,2)` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Nucleos` | `INT` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_CPU_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`

---

### Tabla Física: `dbo.RAM`

* **Finalidad:** Tabla hija de especialización técnica para memorias de acceso aleatorio.
* **Rol en Mishutec:** Almacena Capacidad_gb (ej. 16 GB) y Velocidad_mhz (ej. 3200 MHz) para memorias DDR4/DDR5.
* **Clave Primaria (PK):** `Codbarras_prod` (PK__RAM__76879DAF71C902B3)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 2 | `Capacidad_gb` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Velocidad_mhz` | `INT` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_RAM_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`

---

### Tabla Física: `dbo.SSD`

* **Finalidad:** Tabla hija de especialización técnica para unidades de almacenamiento sólido.
* **Rol en Mishutec:** Almacena Capacidad_gb (ej. 1000 GB) e Interfaz (ej. 'NVMe', 'SATA III') para discos rápidos.
* **Clave Primaria (PK):** `Codbarras_prod` (PK__SSD__76879DAFDE9E4EFB)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 2 | `Capacidad_gb` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Interfaz` | `VARCHAR(20)` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_SSD_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`

---

### Tabla Física: `dbo.Grafica`

* **Finalidad:** Tabla hija de especialización técnica para adaptadores de video y GPUs.
* **Rol en Mishutec:** Almacena Vram_gb (ej. 8 GB) y Chipset (ej. 'GeForce RTX 4060') para tarjetas dedicadas.
* **Clave Primaria (PK):** `Codbarras_prod` (PK__Grafica__76879DAFFA63713B)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 2 | `Vram_gb` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Chipset` | `VARCHAR(50)` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Grafica_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`

---

### Tabla Física: `dbo.Fuente_Poder`

* **Finalidad:** Tabla hija de especialización técnica para fuentes de alimentación.
* **Rol en Mishutec:** Almacena Potencia_w (ej. 650 W) y Certificacion (ej. '80 Plus Bronze') para suministros eléctricos de PC.
* **Clave Primaria (PK):** `Codbarras_prod` (PK__Fuente_P__76879DAFAE14DE6A)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 2 | `Potencia_w` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Certificacion` | `VARCHAR(30)` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Fuente_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`

---

### Tabla Física: `dbo.Gabinete`

* **Finalidad:** Tabla hija de especialización técnica para chasis y cases de computadoras.
* **Rol en Mishutec:** Almacena Formato (ej. 'Micro-ATX', 'ATX') y Material (ej. 'Acero y acrílico') para gabinetes.
* **Clave Primaria (PK):** `Codbarras_prod` (PK__Gabinete__76879DAF8B1C50F2)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 2 | `Formato` | `VARCHAR(20)` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Material` | `VARCHAR(30)` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Gabinete_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`

---

## 3. PERSONAS Y ENTIDADES COMERCIALES

### Tabla Física: `dbo.Cliente`

* **Finalidad:** Registro de clientes (personas naturales o jurídicas) compradores de la tienda.
* **Rol en Mishutec:** Identificado por Dni_cliente (8 caracteres), almacena nombres, apellidos, teléfono y correo electrónico. Susceptible a enmascaramiento según Ley 29733.
* **Clave Primaria (PK):** `Dni_cliente` (PK__Cliente__538EA93AD4432791)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Dni_cliente` | `VARCHAR(8)` | **NOT NULL** | No | — | **PK** |
| 2 | `Nombre_cl` | `VARCHAR(60)` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Apellido_cl` | `VARCHAR(60)` | **NOT NULL** | No | — | Dato operacional |
| 4 | `Telefono_cl` | `VARCHAR(15)` | NULL | No | — | Dato operacional |
| 5 | `Correo_cl` | `VARCHAR(100)` | **NOT NULL** | No | — | Dato operacional |

---

### Tabla Física: `dbo.Empleado`

* **Finalidad:** Personal comercial y operativo responsable de ventas, movimientos y garantías.
* **Rol en Mishutec:** Cajeros y almacenistas (ej. Carlos Vega Ramos, Rosa Paredes Luna) vinculados a la autoría de transacciones y Kardex.
* **Clave Primaria (PK):** `ID_empleado` (PK__Empleado__FC29D6F610D41C5E)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_empleado` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Dni_emp` | `VARCHAR(8)` | **NOT NULL** | No | — | **UNIQUE** (`UQ__Empleado__70F104C0B1BB2F5A`) |
| 3 | `Nombre_emp` | `VARCHAR(60)` | **NOT NULL** | No | — | Dato operacional |
| 4 | `Apellido_emp` | `VARCHAR(60)` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ__Empleado__70F104C0B1BB2F5A`: Columnas `(Dni_emp)`

---

### Tabla Física: `dbo.Proveedor`

* **Finalidad:** Empresas distribuidoras mayoristas que abastecen hardware a Mishutec.
* **Rol en Mishutec:** Empresas registradas como 'Tecno Import Perú SAC', 'Distribuidora Andina de Cómputo' y 'Global Hardware SAC'.
* **Clave Primaria (PK):** `ID_proveedor` (PK__Proveedo__74AD766F03A05FFC)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_proveedor` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Nombre_prov` | `VARCHAR(100)` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Correo_prov` | `VARCHAR(100)` | **NOT NULL** | No | — | Dato operacional |
| 4 | `Telefono_prov` | `VARCHAR(15)` | **NOT NULL** | No | — | Dato operacional |

---

## 4. CADENA DE SUMINISTRO Y ABASTECIMIENTO

### Tabla Física: `dbo.Suministra`

* **Finalidad:** Tabla asociativa que resuelve la relación muchos a muchos (M:N) entre Producto y Proveedor.
* **Rol en Mishutec:** Permite que múltiples mayoristas coticen y abastezcan el mismo producto con su respectivo Precio_compra (ej. S/ 130 vs S/ 135 para Kingston Fury).
* **Clave Primaria (PK):** `Codbarras_prod, ID_proveedor` (PK_Suministra)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 2 | `ID_proveedor` | `INT` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Proveedor.ID_proveedor` |
| 3 | `Precio_compra` | `DECIMAL(10,2)` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Suministra_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`
  - `FK_Suministra_Proveedor`: `ID_proveedor` $\rightarrow$ `dbo.Proveedor(ID_proveedor)`
- **Restricciones de Dominio (CHECK):**
  - `CK_Suministra_Precio`: Condición lógica `([Precio_compra]>(0))`

---

## 5. VENTAS, DETALLES Y PAGOS MIXTOS (POS)

### Tabla Física: `dbo.Venta`

* **Finalidad:** Cabecera de transacciones comerciales de venta y comprobantes emitidos.
* **Rol en Mishutec:** Almacena la fecha, número de comprobante único (UQ), tipo de comprobante, cliente, cajero y monto total facturado.
* **Clave Primaria (PK):** `ID_venta` (PK__Venta__39DDE5E4BF8DE087)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_venta` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Fecha_venta` | `DATE` | **NOT NULL** | No | `(CONVERT([date],getdate()))` | Dato operacional |
| 3 | `Total_venta` | `DECIMAL(10,2)` | **NOT NULL** | No | — | Dato operacional |
| 4 | `Numero_comprobante` | `VARCHAR(20)` | **NOT NULL** | No | — | **UNIQUE** (`UQ_Venta_Numero_comprobante`) |
| 5 | `ID_tipo_comp` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Tipo_Comprobante.ID_tipo_comp` |
| 6 | `Dni_cliente` | `VARCHAR(8)` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Cliente.Dni_cliente` |
| 7 | `ID_empleado` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Empleado.ID_empleado` |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Venta_Cliente`: `Dni_cliente` $\rightarrow$ `dbo.Cliente(Dni_cliente)`
  - `FK_Venta_Empleado`: `ID_empleado` $\rightarrow$ `dbo.Empleado(ID_empleado)`
  - `FK_Venta_TipoComp`: `ID_tipo_comp` $\rightarrow$ `dbo.Tipo_Comprobante(ID_tipo_comp)`
- **Restricciones de Dominio (CHECK):**
  - `CK_Venta_Total`: Condición lógica `([Total_venta]>=(0))`
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ_Venta_Numero_comprobante`: Columnas `(Numero_comprobante)`

---

### Tabla Física: `dbo.Detalle_Venta`

* **Finalidad:** Líneas de detalle o artículos despachados en cada comprobante de venta.
* **Rol en Mishutec:** Registra cada producto, cantidad despachada, precio unitario aplicado y subtotal verificado por CHECK (Subtotal = Cantidad * Precio).
* **Clave Primaria (PK):** `ID_detalle` (PK__Detalle___83B6061E5B296E19)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_detalle` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Cantidad` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Precio_unitario` | `DECIMAL(10,2)` | **NOT NULL** | No | — | Dato operacional |
| 4 | `Subtotal` | `DECIMAL(10,2)` | **NOT NULL** | No | — | Dato operacional |
| 5 | `ID_venta` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Venta.ID_venta`, **UNIQUE** (`UQ_Detalle_Venta_Prod`) |
| 6 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Producto.Codbarras_prod`, **UNIQUE** (`UQ_Detalle_Venta_Prod`) |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Detalle_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`
  - `FK_Detalle_Venta`: `ID_venta` $\rightarrow$ `dbo.Venta(ID_venta)`
- **Restricciones de Dominio (CHECK):**
  - `CK_Detalle_Cantidad`: Condición lógica `([Cantidad]>(0))`
  - `CK_Detalle_Subtotal`: Condición lógica `([Subtotal]=[Cantidad]*[Precio_unitario])`
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ_Detalle_Venta_Prod`: Columnas `(ID_venta, Codbarras_prod)`

---

### Tabla Física: `dbo.Venta_Metodo_Pago`

* **Finalidad:** Registro desglosado de medios de pago aplicados a cada transacción de venta.
* **Rol en Mishutec:** Permite registrar pagos combinados (ej. Factura F001-000001 pagada con S/ 700.00 en Tarjeta y S/ 490.00 en Transferencia bancaria).
* **Clave Primaria (PK):** `ID_venta, ID_metodo` (PK_Venta_Metodo_Pago)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_venta` | `INT` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Venta.ID_venta` |
| 2 | `ID_metodo` | `INT` | **NOT NULL** | No | — | **PK**, **FK** $\rightarrow$ `Metodo_Pago.ID_metodo` |
| 3 | `Monto_pagado` | `DECIMAL(10,2)` | **NOT NULL** | No | — | Dato operacional |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_VMP_Metodo`: `ID_metodo` $\rightarrow$ `dbo.Metodo_Pago(ID_metodo)`
  - `FK_VMP_Venta`: `ID_venta` $\rightarrow$ `dbo.Venta(ID_venta)`
- **Restricciones de Dominio (CHECK):**
  - `CK_VMP_Monto`: Condición lógica `([Monto_pagado]>(0))`

---

## 6. GESTIÓN DE INVENTARIO Y ALMACÉN (KARDEX)

### Tabla Física: `dbo.Mov_Inventario`

* **Finalidad:** Libro mayor de movimientos físicos de almacén (Kardex transaccional).
* **Rol en Mishutec:** Audita cada entrada por compras, salida por ventas o reingreso formal de garantías, con fecha, cantidad y empleado responsable.
* **Clave Primaria (PK):** `ID_movimiento` (PK_Mov_Inventario)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_movimiento` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Fecha` | `DATE` | **NOT NULL** | No | — | Dato operacional |
| 3 | `Cantidad` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 4 | `ID_tipo_mov` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Tipo_Movimiento.ID_tipo_mov` |
| 5 | `Codbarras_prod` | `VARCHAR(13)` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Producto.Codbarras_prod` |
| 6 | `ID_empleado` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Empleado.ID_empleado` |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Mov_Empleado`: `ID_empleado` $\rightarrow$ `dbo.Empleado(ID_empleado)`
  - `FK_Mov_Producto`: `Codbarras_prod` $\rightarrow$ `dbo.Producto(Codbarras_prod)`
  - `FK_Mov_Tipo`: `ID_tipo_mov` $\rightarrow$ `dbo.Tipo_Movimiento(ID_tipo_mov)`
- **Restricciones de Dominio (CHECK):**
  - `CK_Mov_Cantidad`: Condición lógica `([Cantidad]>(0))`

---

## 7. DEVOLUCIONES Y GARANTÍAS POSTVENTA (RMA)

### Tabla Física: `dbo.Devolucion`

* **Finalidad:** Cabecera de expedientes de reclamación y trámites de garantía técnica.
* **Rol en Mishutec:** Vinculada obligatoriamente a una Venta previa y a un Empleado técnico, almacena la fecha del trámite y su estado administrativo.
* **Clave Primaria (PK):** `ID_devolucion` (PK__Devoluci__BB82C4B17E07AEFB)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_devolucion` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Fecha_dev` | `DATE` | **NOT NULL** | No | — | Dato operacional |
| 3 | `ID_estado_dev` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Estado_Dev.ID_estado_dev` |
| 4 | `ID_venta` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Venta.ID_venta` |
| 5 | `ID_empleado` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Empleado.ID_empleado` |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_Dev_Empleado`: `ID_empleado` $\rightarrow$ `dbo.Empleado(ID_empleado)`
  - `FK_Dev_Estado`: `ID_estado_dev` $\rightarrow$ `dbo.Estado_Dev(ID_estado_dev)`
  - `FK_Dev_Venta`: `ID_venta` $\rightarrow$ `dbo.Venta(ID_venta)`

---

### Tabla Física: `dbo.Detalle_Dev`

* **Finalidad:** Líneas de productos afectados en una solicitud de garantía.
* **Rol en Mishutec:** Vinculada a una línea de Detalle_Venta específica y a un Motivo_Dev, registra la cantidad devuelta bajo restricción UNIQUE de línea.
* **Clave Primaria (PK):** `ID_detalle_dev` (PK__Detalle___13D297565D790C78)

| # | Columna | Tipo de Dato | Nulo | Identidad | Valor Default | Descripción / Restricción |
|---|---------|--------------|:----:|:---------:|:-------------:|---------------------------|
| 1 | `ID_detalle_dev` | `INT` | **NOT NULL** | IDENTITY(1,1) | — | **PK** |
| 2 | `Cantidad_dev` | `INT` | **NOT NULL** | No | — | Dato operacional |
| 3 | `ID_devolucion` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Devolucion.ID_devolucion`, **UNIQUE** (`UQ_DetDev`) |
| 4 | `ID_detalle` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Detalle_Venta.ID_detalle`, **UNIQUE** (`UQ_DetDev`) |
| 5 | `ID_motivo` | `INT` | **NOT NULL** | No | — | **FK** $\rightarrow$ `Motivo_Dev.ID_motivo` |

**Restricciones de Integridad y Reglas de Negocio:**
- **Claves Foráneas (FK):**
  - `FK_DetDev_Detalle`: `ID_detalle` $\rightarrow$ `dbo.Detalle_Venta(ID_detalle)`
  - `FK_DetDev_Devolucion`: `ID_devolucion` $\rightarrow$ `dbo.Devolucion(ID_devolucion)`
  - `FK_DetDev_Motivo`: `ID_motivo` $\rightarrow$ `dbo.Motivo_Dev(ID_motivo)`
- **Restricciones de Dominio (CHECK):**
  - `CK_DetDev_Cantidad`: Condición lógica `([Cantidad_dev]>(0))`
- **Restricciones de Unicidad (UNIQUE):**
  - `UQ_DetDev`: Columnas `(ID_devolucion, ID_detalle)`

---

