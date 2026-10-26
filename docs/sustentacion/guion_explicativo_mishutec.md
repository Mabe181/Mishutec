# 🎙️ Guion Explicativo y Estructura del Proyecto MISHUTEC

Este documento contiene la explicación técnica y funcional del proyecto **Mishutec**, diseñada tanto para narración en audio como para guía de estudio y sustentación.

---

## 📌 1. ¿Qué es Mishutec y qué problema resuelve?

**Mishutec** es un sistema web empresarial de gestión comercial, inventario y punto de venta (POS) de alta precisión, desarrollado para una tienda especializada en hardware, componentes de computadoras y ensamblaje.

### Problemas que resuelve:
1. **Desfase de Inventario:** Erradica el descuadre entre el stock físico y el mostrado en vitrina gracias a un control estricto de **Kardex** y transacciones atómicas.
2. **Descuadres de Caja en Ventas:** Soporta **pagos mixtos** (efectivo + tarjeta + transferencias digitales como Yape/Plin), asegurando que el total facturado coincida al céntimo con la suma de métodos de pago.
3. **Control de Garantías y Devoluciones (RMA):** Aplica una política de restock donde los productos dañados o defectuosos **no** regresan al stock vendible, evitando pérdidas y reclamos de clientes.
4. **Protección de Datos e Integridad:** Cumple con la Ley N° 29733 de Protección de Datos Personales (enmascaramiento de DNI, teléfono y correo) e implementa separación entre una base académica protegida de solo lectura y una base activa de aceptación.

---

## 📁 2. Desglose Carpeta por Carpeta

A continuación se detalla la función de cada directorio y archivo clave del repositorio:

```
Mishutec/
├── src/                      # Código fuente de la aplicación (Next.js 16 + React 19)
│   ├── app/                  # Enrutamiento App Router y vistas
│   │   ├── (admin)/          # Rutas comerciales protegidas por autenticación
│   │   │   ├── dashboard/    # Panel principal con KPIs, gráficas y alertas
│   │   │   ├── productos/    # Catálogo de componentes y fichas técnicas
│   │   │   ├── inventario/   # Existencias y auditoría de movimientos Kardex
│   │   │   ├── ventas/       # Terminal Punto de Venta (POS) y facturación
│   │   │   ├── devoluciones/ # Gestión de garantías y políticas de restock
│   │   │   ├── clientes/     # Maestro de clientes con datos enmascarados
│   │   │   ├── proveedores/  # Gestión de compras mayoristas (tabla Suministra)
│   │   │   ├── empleados/    # Personal comercial y cajeros autorizados
│   │   │   └── reportes/     # Analítica financiera con Recharts
│   │   ├── api/              # Endpoints de API (/api/db-status, /api/products)
│   │   ├── diagnostico/      # Monitor en vivo del estado de SQL Server
│   │   ├── login/            # Pantalla de acceso con protección Open Redirect
│   │   ├── layout.tsx        # Estructura visual global y fuentes tipográficas
│   │   └── proxy.ts          # Firewall perimetral de Next.js 16 (reemplazo de middleware)
│   │
│   ├── components/           # Componentes visuales reutilizables
│   │   ├── layout/           # Sidebar, encabezado y navegación
│   │   ├── pos/              # Carrito de compras reactivo, buscador y teclado numérico
│   │   ├── modals/           # Ventanas emergentes de registro, edición y confirmación
│   │   └── ui/               # Botones, tablas, insignias de estado e inputs accesibles
│   │
│   ├── lib/                  # Arquitectura desacoplada y lógica de negocio
│   │   ├── actions/          # Server Actions (puntos de entrada seguros desde la UI)
│   │   ├── services/         # Lógica de dominio (reglas de cálculo y validaciones financieras)
│   │   ├── repositories/     # Capa de datos SQL parametrizada y transacciones ACID
│   │   ├── validations/      # Esquemas de validación estricta con Zod
│   │   ├── auth/             # Criptografía PBKDF2/SHA-256, tokens JWT y sesiones seguras
│   │   ├── db.ts             # Pool Singleton ODBC (msnodesqlv8 + Windows Auth)
│   │   └── db-guard.ts       # Muro de protección contra escrituras en la base académica
│   │
│   └── types/                # Definiciones de tipos e interfaces de TypeScript
│
├── docs/                     # Documentación técnica, modelo relacional y sustentación
│   ├── sustentacion/         # Guiones de defensa, diccionarios de datos y matrices
│   ├── FinalFinalisisimo.sql # Script DDL y DML de las 25 tablas en SQL Server
│   └── PROYECTO_FINAL.pdf    # Diapositivas e informe formal de arquitectura
│
├── scripts/                  # Scripts de diagnóstico, respaldos y pruebas automatizadas E2E
├── public/                   # Recursos estáticos (iconos, imágenes, fuentes)
├── .env.local                # Variables de entorno locales (servidor SQL, secretos)
└── package.json              # Manifiesto de dependencias y scripts de ejecución
```

---

## ⚡ 3. Arquitectura y Ciclo de Vida de una Transacción

La arquitectura sigue el patrón **Clean Layered Architecture (Capas Desacopladas)**:

$$\text{Navegador (POS)} \longrightarrow \text{Proxy (JWT)} \longrightarrow \text{Server Action} \longrightarrow \text{Zod Schema} \longrightarrow \text{Domain Service} \longrightarrow \text{Repository} \longrightarrow \text{SQL Server 2022}$$

### Ejemplo de flujo en una Venta POS:
1. El cajero agrega productos al carrito y selecciona múltiples métodos de pago (ej. S/ 100 en efectivo y S/ 80 con tarjeta).
2. Se invoca la Server Action `createSaleAction`.
3. Se verifica la sesión del administrador y el esquema de datos con **Zod**.
4. El servicio (`SaleService`) valida que: $\text{Total Facturado} = \sum \text{Subtotales} = \sum \text{Pagos}$.
5. Se inicia una transacción ACID en SQL Server (`BEGIN TRANSACTION`):
   - Se inserta la cabecera en `dbo.Venta`.
   - Se insertan las filas en `dbo.Detalle_Venta`.
   - Se descuenta el stock físico en `dbo.Producto`.
   - Se registra el movimiento de auditoría en `dbo.Mov_Inventario` (Kardex).
   - Se insertan los registros de abono en `dbo.Venta_Metodo_Pago`.
6. Si todo concilia, se ejecuta `COMMIT TRANSACTION`. Si ocurre cualquier falla, se ejecuta `ROLLBACK`, garantizando cero inconsistencias.

---

## 🗣️ 4. Guion de Locución para Audio o Presentación Oral

> **Tiempo estimado de lectura:** ~3 minutos  
> **Tono:** Dinámico, profesional, seguro y claro.

*(Inicio)*

"¡Hola! Te doy la bienvenida a la presentación del proyecto **Mishutec**. En este audio te explicaré de forma clara qué hace el sistema, cómo está diseñado y qué función cumple cada una de sus carpetas.

**Mishutec** es una solución integral de gestión comercial, inventario y punto de venta creada específicamente para empresas que comercializan hardware, componentes informáticos y servicios de ensamblaje.

El núcleo de datos del sistema está montado sobre **Microsoft SQL Server 2022**, con una base estructurada en **veinticinco tablas normalizadas en Tercera Forma Normal**, con herencia técnica para procesadores, tarjetas gráficas, memorias y fuentes de poder. 

En la parte visual y de aplicación, utilizamos **Next.js 16 con React 19 y TypeScript**, implementando una arquitectura por capas desacopladas que garantiza máxima seguridad y rendimiento.

---

Veamos ahora la estructura del proyecto carpeta por carpeta:

La carpeta principal es **SRC**, donde reside el código de la plataforma. Dentro encontramos:

1. **La carpeta `app`**: Representa el enrutamiento moderno mediante App Router.
   - En el grupo **`admin`** encontramos todas las pantallas de negocio: el **Dashboard** con métricas en tiempo real; el catálogo de **Productos** con fichas técnicas; el control de **Inventario** con su respectivo **Kardex** de entradas y salidas; el módulo de **Ventas** con el Punto de Venta interactivo que admite lectores de código de barras y cobros mixtos; los módulos de **Clientes, Proveedores y Empleados** con protección y enmascaramiento de datos personales; el módulo de **Devoluciones y Garantías** con políticas estrictas de reingreso; y el módulo de **Reportes** analíticos interactivos.
   - Además, incluye el panel de **Diagnóstico** en vivo para monitorear la salud de SQL Server y el archivo **`proxy.ts`**, el cual funciona como un firewall perimetral que valida tokens JWT en cookies HttpOnly y previene redirecciones maliciosas.

2. **La carpeta `components`**: Contiene los bloques reutilizables de la interfaz, como barras de navegación, modales emergentes y el visor reactivo del carrito de compras.

3. **La carpeta `lib`**: Es el cerebro del proyecto y se divide en capas muy ordenadas:
   - **`actions`**: Aloja las Server Actions para comunicar la interfaz con el servidor de forma nativa y protegida.
   - **`services`**: Contiene la lógica de negocio, reglas financieras y validaciones previas a la base de datos.
   - **`repositories`**: Centraliza todas las consultas SQL mediante sentencias parametrizadas para erradicar cualquier intento de inyección de código, orquestando transacciones ACID de confirmación inmediata.
   - **`validations`**: Emplea la librería Zod para verificar que ningún dato erróneo o incompleto llegue a procesarse.
   - **`auth`**: Gestiona la encriptación de credenciales y la seguridad de las sesiones.
   - Y los módulos **`db.ts`** y **`db-guard.ts`**, que controlan el pool de conexiones y blindan la base académica original contra escrituras accidentales.

4. **La carpeta `types`**: Define los tipos de datos e interfaces TypeScript para garantizar un desarrollo robusto y sin errores en tiempo de ejecución.

Fuera de `src`, en la raíz del proyecto, tenemos:
- **`docs`**: Con toda la documentación formal, el diagrama entidad-relación, diccionarios de datos de las 25 tablas y el guion técnico de sustentación.
- **`scripts`**: Con utilidades para diagnósticos automáticos, pruebas integrales y respaldos.
- Y los archivos de configuración como **`package.json`** y **`.env.local`**, donde se gestionan las librerías y las variables de conexión local.

En conclusión, Mishutec no es solo una página web ni una base de datos aislada, sino una plataforma empresarial transaccional completa, segura y lista para operar en producción. ¡Muchas gracias!"

*(Fin)*
