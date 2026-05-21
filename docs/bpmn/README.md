# Modelado de Procesos de Negocio (BPMN 2.0)

Diagramas BPMN 2.0 para los procesos clave del e-commerce de librería.

## Archivos

| Archivo | Proceso | Actores |
|---|---|---|
| [`01-registro-autenticacion.bpmn`](01-registro-autenticacion.bpmn) | Registro y Autenticación de Usuario | Usuario, Sistema (user-microservice), Base de Datos |
| [`02-carrito-pedido.bpmn`](02-carrito-pedido.bpmn) | Gestión de Carrito y Creación de Pedido | Usuario, API Gateway, Cart-Microservice, Product-Microservice, Inventory-Microservice, Order-Microservice |
| [`03-inventario.bpmn`](03-inventario.bpmn) | Gestión de Inventario y Reposición | Administrador, Inventory-Microservice, Base de Datos |
| [`04-cancelacion-pedido.bpmn`](04-cancelacion-pedido.bpmn) | Cancelación de Pedido y Restauración de Stock | Usuario/Admin, Order-Microservice, Inventory-Microservice, Base de Datos |

## Cómo visualizar los diagramas

Los archivos `.bpmn` siguen el estándar **BPMN 2.0** (OMG). Se pueden abrir con:

- **Camunda Modeler** (recomendado) — https://camunda.com/download/modeler/
- **draw.io / diagrams.net** — File → Open → seleccionar `.bpmn`
- **Bizagi Modeler** — https://www.bizagi.com/es/modeler
- **Eclipse BPMN2 Modeler**
- **Visual Studio Code** con extensión "vscode-bpmn-io"

## Resumen de Procesos

### 1. Registro y Autenticación (`01-registro-autenticacion.bpmn`)
- Usuario elige registro o login
- Validación de datos / credenciales
- Verificación de unicidad de email (BD)
- Generación de JWT token
- Bloqueo de cuenta tras 3 intentos fallidos

### 2. Carrito y Creación de Pedido (`02-carrito-pedido.bpmn`)
- Usuario navega productos y agrega al carrito
- Cart-microservice verifica producto y stock via Feign
- Reduce stock en inventory-microservice via PATCH
- Usuario confirma pedido → Order-microservice crea orden
- Vacía el carrito tras crear la orden

### 3. Gestión de Inventario (`03-inventario.bpmn`)
- Administrador consulta stock actual
- Sistema detecta productos con stock bajo (stock ≤ stock_minimo)
- Administrador repone stock o ajusta límites
- Validación de límites (no exceder stock_maximo)
- Alerta de stock bajo

### 4. Cancelación de Pedido (`04-cancelacion-pedido.bpmn`)
- Usuario solicita cancelación de orden
- Sistema verifica si el estado permite cancelación
- Por cada item: busca producto → restaura stock en inventario
- Marca orden como CANCELADO
- Notifica al usuario
