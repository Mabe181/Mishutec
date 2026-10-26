# MATRIZ DE TRAZABILIDAD ACADÉMICA Y RÚBRICA DE CUMPLIMIENTO
## Sistema de Gestión Comercial MISHUTEC

**Proyecto:** MISHUTEC (Tienda de Componentes de Cómputo)  
**Documento Fuente:** \`PROYECTO_FINAL.pdf\` y script DDL/DML \`FinalFinalisisimo.sql\`  
**Estado General:** **100% DE REQUISITOS ACADÉMICOS OBLIGATORIOS CUMPLIDOS + FUNCIONALIDADES EMPRESARIALES DE VALOR AGREGADO**

---

## 1. RÚBRICA METODOLÓGICA DE EVALUACIÓN

Para evitar valoraciones subjetivas, el cumplimiento del proyecto se categoriza en dos dimensiones claramente diferenciadas:
1. **Requisitos Académicos Obligatorios (Bloque Base):** Exigencias del curso de Taller de Base de Datos reflejadas en la presentación de propuesta (\`PROYECTO_FINAL.pdf\`) y en las sentencias SQL (\`FinalFinalisisimo.sql\`).
2. **Funcionalidades Empresariales de Valor Agregado (Bloque Plus):** Características avanzadas de ingeniería de software implementadas para convertir el modelo académico en una plataforma comercial operativa (Next.js 16, seguridad web, POS reactivo, BI y exportaciones).

---

## 2. MATRIZ DE TRAZABILIDAD DETALLADA

| ID | Requisito Académico / Funcional | Proceso de Negocio | Tablas SQL Server Involucradas | Funcionalidad Web Implementada | Componente / Servicio Responsable | Evidencia SQL / Código | Evidencia Visual (Captura) | Estado | Observaciones Técnicas |
|:--:|---------------------------------|--------------------|--------------------------------|--------------------------------|-----------------------------------|------------------------|----------------------------|:------:|------------------------|
| **REQ-01** | Modelado y normalización hasta 3FN de 25 tablas físicas | Todos los procesos | Las 25 tablas de \`dbo\` | Arquitectura de base de datos relacional | \`scripts/backup-and-create-aceptacion.sql\` | Script DDL \`FinalFinalisisimo.sql\`, metadatos \`sys.tables\` | \`02-diccionario-de-datos-25-tablas.md\` | **CUMPLIDO** | Cumplimiento estricto de 3FN con claves foráneas e integridad referencial. |
| **REQ-02** | Registro y especialización técnica de componentes de PC | Proceso 01 (Inventario y Productos) | \`Producto\`, \`Categoria\`, \`Marca\`, \`Estado_Prod\`, \`CPU\`, \`RAM\`, \`SSD\`, \`Grafica\`, \`Fuente_Poder\`, \`Gabinete\` | Módulo de Catálogo y Ficha Técnica de Producto | \`ProductRepository\`, \`ProductService\`, \`ProductDetailModal.tsx\` | \`SELECT ... FROM dbo.Producto p JOIN dbo.RAM r ON ...\` | \`phase3a/02-productos-detail-desktop.png\` | **CUMPLIDO** | Herencia relacional 1:1 donde la PK de la tabla hija es FK hacia la tabla padre. |
| **REQ-03** | Control de existencias físicas no negativas (\`CHECK Stock >= 0\`) | Proceso 01 (Inventario y Productos) | \`Producto\`, \`Mov_Inventario\`, \`Tipo_Movimiento\` | Módulo de Inventario y Auditoría Kardex | \`KardexRepository\`, \`InventoryService\`, \`KardexTable.tsx\` | Restricción \`CK_Producto_Stock\`, consultas a \`Mov_Inventario\` | \`phase4/02-fase4-kardex-table-desktop.png\` | **CUMPLIDO** | 31 movimientos Kardex auditados en aceptación; 76 unidades disponibles en stock. |
| **REQ-04** | Registro de ventas comerciales con emisión de comprobantes | Proceso 02 (Ventas y Facturación) | \`Venta\`, \`Detalle_Venta\`, \`Tipo_Comprobante\`, \`Cliente\`, \`Empleado\` | Módulo de Ventas y Punto de Venta (POS) | \`SaleRepository\`, \`SaleService\`, \`POSClientView.tsx\` | \`UQ_Venta_Numero_comprobante\`, \`CK_Detalle_Subtotal\` | \`ventas-desktop.png\` | **CUMPLIDO** | Emisión correlativa de Boletas y Facturas. 9 ventas acumuladas (S/ 5,500.00). |
| **REQ-05** | Registro de pagos mixtos y conciliación financiera | Proceso 02 (Ventas y Facturación) | \`Venta_Metodo_Pago\`, \`Metodo_Pago\`, \`Venta\` | Pasarela de Cobro en POS y desglose de pagos | \`SaleRepository.createPayment\`, \`SaleService\` | Restricción \`PK_Venta_Metodo_Pago\`, \`CK_VMP_Monto\` | \`ventas-desktop.png\` | **CUMPLIDO** | Factura \`F001-000001\` pagada con Tarjeta (700) + Transferencia (490) conciliada al céntimo. |
| **REQ-06** | Gestión de proveedores y catálogo de abastecimiento | Proceso 03 (Proveedores y Suministro) | \`Proveedor\`, \`Suministra\`, \`Producto\` | Directorio de Proveedores y Relaciones de Costo | \`SupplierRepository\`, \`SuppliersView.tsx\` | Restricción \`PK_Suministra (Codbarras, ID_prov)\`, \`CK_Suministra_Precio\` | \`proveedores-desktop.png\` | **CUMPLIDO** | Resuelve relación $M:N$. Permite comparar precios de compra entre distribuidores mayoristas. |
| **REQ-07** | Control de devoluciones por falla de fábrica con motivo justificado | Proceso 04 (Control de Devoluciones) | \`Devolucion\`, \`Detalle_Dev\`, \`Estado_Dev\`, \`Motivo_Dev\`, \`Venta\` | Módulo de Devoluciones y Registro de Trámite RMA | \`ReturnRepository\`, \`ReturnService\`, \`ReturnsClientView.tsx\` | Restricción \`UQ_DetDev\`, \`CK_DetDev_Cantidad\` | \`devoluciones-desktop.png\` | **CUMPLIDO** | 7 trámites registrados (5 aprobadas, 1 pendiente, 1 rechazada). No emite reembolso monetario. |
| **REQ-08** | Demostración de sentencias DDL (CREATE, TRUNCATE, ALTER, DROP) | Transversal (Base de Datos) | Tablas del esquema \`dbo\` | Script reproducible con errores y correcciones | Archivo SQL \`docs/FinalFinalisisimo.sql\` | Bloques 8.1.1 a 8.1.4 en \`FinalFinalisisimo.sql\` | Diapositivas 10 a 13 en \`PROYECTO_FINAL.pdf\` | **CUMPLIDO** | Documentado en el script académico original con evidencias paso a paso. |
| **REQ-09** | Demostración de sentencias DML (INSERT, DELETE, UPDATE, SELECT) | Transversal (Base de Datos) | Tablas del esquema \`dbo\` | Manipulación y corrección de datos del negocio | Archivo SQL \`docs/FinalFinalisisimo.sql\` | Bloques 8.2.1 a 8.2.3 en \`FinalFinalisisimo.sql\` | Diapositivas 14 a 16 en \`PROYECTO_FINAL.pdf\` | **CUMPLIDO** | Registros corregidos y conservados permanentemente en la base de datos. |
| **REQ-10** | Consultas avanzadas (Subconsultas, JOINs, GROUP BY, HAVING, Fechas) | Transversal (Consultas SQL) | \`Producto\`, \`Venta\`, \`Cliente\`, \`Mov_Inventario\`, \`Marca\`, \`Categoria\` | Centro de Consultas y Reportes | \`ReportRepository\`, \`ReportService\` | Bloques 8.2.4 a 8.2.6 en \`FinalFinalisisimo.sql\` | Diapositivas 17 a 24 en \`PROYECTO_FINAL.pdf\` | **CUMPLIDO** | Más de 20 consultas complejas listas para ejecución en SSMS durante la sustentación. |

---

## 3. FUNCIONALIDADES EMPRESARIALES DE VALOR AGREGADO (BLOQUE PLUS)

Las siguientes capacidades exceden los requerimientos básicos del curso y fueron desarrolladas para elevar la calidad profesional del proyecto:

| ID | Funcionalidad Adicional | Capa / Módulo | Medida Implementada | Justificación de Ingeniería | Estado |
|:--:|-------------------------|---------------|---------------------|-----------------------------|:------:|
| **PLUS-01** | Autenticación Segura y Edge Proxy | Seguridad / Perímetro | Cifrado JWT (HS256), cookies \`HttpOnly\`, proxy en \`src/proxy.ts\` | Protege los módulos administrativos contra accesos no autorizados. | **CERTIFICADO** |
| **PLUS-02** | Inmunidad contra Open Redirect (CWE-601) | Seguridad / Autenticación | Función centralizada \`sanitizeRedirectUrl\` en login | Evita ataques de suplantación y desvío de tráfico hacia sitios maliciosos. | **CERTIFICADO** |
| **PLUS-03** | Protección de Datos Personales (PII) | Privacidad / Cumplimiento | Enmascaramiento de DNI (\`72****90\`), teléfonos y correos | Cumplimiento preventivo con la Ley N° 29733 de Protección de Datos Personales. | **CERTIFICADO** |
| **PLUS-04** | Punto de Venta (POS) con Lector de Código de Barras | Ventas / Caja | Endpoint público sanitizado \`/api/products/[barcode]\` | Permite agilizar la atención en caja con pistolas lectoras EAN-13. | **CERTIFICADO** |
| **PLUS-05** | Desglose Metodológico de Indicadores RMA | Analítica / Calidad | Diferenciación de Indicador A (53.33%), B (40.00%) y C (6.67%) | Elimina ambigüedades entre reclamos presentados, garantías aprobadas y restock. | **CERTIFICADO** |
| **PLUS-06** | Exportación Tabular CSV con Inmunidad a Fórmulas | Reportes / Exportación | Incorporación de BOM UTF-8 y neutralización de caracteres ejecutables | Permite exportar datos a Excel previniendo ataques de CSV Injection (CWE-1236). | **CERTIFICADO** |
| **PLUS-07** | Diseño Responsive Multidispositivo | Frontend / UX | Interfaz adaptativa sin scroll horizontal en 5 resoluciones | Garantiza operatividad en tablets de almacén, móviles y monitores de caja. | **CERTIFICADO** |

---

## 4. BALANCE DE CUMPLIMIENTO GLOBAL

$$\text{Porcentaje de Cumplimiento de Requisitos Académicos:} \quad \frac{10\text{ Requisitos Aprobados}}{10\text{ Requisitos Exigidos}} \times 100 = \mathbf{100.00\%}$$

$$\text{Funcionalidades de Valor Agregado Integradas:} \quad \mathbf{7\text{ Módulos Avanzados Operativos}}$$
