## 1. OV-APP

Aplicación para el registro de Contratos con cliente y pedidos de venta.

## 2. Funcionalidades principales. 

Esta es una empresa que vende principalmente aceite de palma. Nosotros primero firmamos contratos con los clientes, que pueden abarcar un periodo de tiempo prolongado (meses a un año). Los contratos suelen tener los siguientes datos: cliente, Fecha de cierre, Periodo de cierre (mes del año en el que se realiza el cierre), volumen de ventas, precio total de venta, base de la materia prima, el numero de contrato (correlativo de 6 dígitos), volumen atendido y volumen por atender. Para ejecutar un contrato se puede registrar uno o más pedidos de venta. Los pedidos de venta tienen fecha de pedido, volumen de pedido y están amarrados siempre a un contrato. Cuando un pedido de venta se registra, en el contrato se actualiza el volumen atendido (se suma al valor actual el volumen del pedido de venta) y el volumen por atender (la resta del volumen del contrato, menos lo ya atendido). 

Nosotros necesitamos poder registrar los contratos y pedidos de venta. Como los contratos están amarrados al cliente, también necesitamos poder mantener una lista de clientes. Tambien quiero poder ver los contratos recientemente firmados y sus pedidos de venta relacionados. 

## 2. Requerimientos técnicos.

Aplicación de React construída con ViteJs y Typescript. 
La aplicación debe tener una base de datos propia, no se conecta a un API externa. 
Debe tener una pantalla de inicio de sesión. 
Debe seguir estándares de Material Design. 

