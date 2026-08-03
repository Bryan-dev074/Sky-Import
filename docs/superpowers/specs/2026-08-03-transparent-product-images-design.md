# Diseño: imágenes de producto transparentes

**Fecha:** 2026-08-03  
**Estado:** aprobado para planificación

## Objetivo

Reemplazar el tratamiento fotográfico actual de los 38 productos por recortes
limpios que muestren únicamente el artículo comprado. La portada, el catálogo,
las fichas, el carrito y el armador deben sentirse como una tienda real: producto
auténtico, legible y sin fondos promocionales que compitan con la interfaz.

## Regla visual única

- Fondo completamente transparente.
- Un único producto o el contenido comercial real del kit.
- Sin caja, manuales, tornillos, cables sueltos, pedestales, insignias de campaña,
  fondos de estudio, pisos, reflejos ni sombras proyectadas.
- Se conservan logos, etiquetas y textos impresos físicamente en el producto.
- El objeto queda centrado, sin recortes y con margen transparente uniforme.
- La fotografía mantiene la perspectiva oficial más clara del modelo.

En kits se muestra lo que define la compra: dos módulos en un kit de RAM, el AIO
con radiador, bloque y tubos, y las unidades incluidas en un pack de ventiladores.
No se muestran elementos auxiliares que no ayuden a reconocer el producto.

## Estrategia de producción

Se aplicará un flujo híbrido para maximizar fidelidad:

1. Conservar y normalizar los recursos oficiales que ya sean recortes limpios.
2. Extraer el producto de fotografías con fondo simple, respetando sus bordes.
3. Editar con alta fidelidad las composiciones problemáticas —especialmente la
   RTX 5090 de portada y recursos con packaging o elementos publicitarios—.
4. Descartar cualquier resultado que cambie conectores, cantidad de ventiladores,
   geometría, color, marca, modelo o texto físico relevante.

No se regenerará todo el catálogo desde cero: una imagen visualmente bonita pero
incorrecta no es aceptable para una tienda de componentes.

## Formato y encuadre

- Los archivos finales mantienen la ruta estable
  `public/products/<slug>/primary.webp`.
- El WebP debe incluir canal alfa real.
- Lienzo recomendado: 1600 × 1600 px, sin ampliar destructivamente una fuente
  insuficiente. La RTX 5090 de portada puede usar hasta 2048 × 2048 px.
- El producto ocupa aproximadamente entre 78 % y 88 % del lienzo, ajustado por
  categoría para evitar que gabinetes verticales o SSD largos parezcan pequeños.
- El margen de seguridad mínimo es 6 % en cada lado.
- No se hornean halos, degradados ni sombras en el archivo.

## Integración en la interfaz

`ProductImage` seguirá usando `object-fit: contain` y el movimiento por puntero,
pero se eliminará el halo visual propio de la fotografía. Las tarjetas y paneles
de la página pueden conservar su diseño; el asset del producto no debe llevar un
fondo adicional.

La RTX 5090 aislada será la imagen principal del hero. Debe conservar una vista
clara de su cuerpo completo y responder al movimiento del mouse sin revelar
bordes o residuos del fondo eliminado.

## Fuentes y trazabilidad

Se mantienen las páginas oficiales y créditos ya registrados. La edición cambia
la presentación, no la identidad ni la procedencia declarada del producto. El
manifest continuará relacionando cada archivo con su producto y fuente.

## Validación

La entrega se acepta únicamente si cumple todo lo siguiente:

- Los 38 archivos tienen canal alfa y esquinas transparentes.
- Ningún producto contiene fondos, cajas, insignias o accesorios ajenos.
- Ningún borde presenta halo blanco, verde o negro visible sobre la página.
- No hay objetos cortados y la escala es coherente entre productos de una misma
  categoría.
- La RTX 5090 se ve nítida en hero de escritorio y móvil.
- Se genera una hoja de contacto para revisar los 38 recortes en conjunto.
- Se revisan portada, catálogo, ficha, carrito y armador en escritorio y móvil.
- El validador de medios, lint, tipos, pruebas y build terminan correctamente.

## Recuperación y alcance

Los archivos actuales quedan recuperables mediante Git. No se cambia el catálogo,
precios, compatibilidad, textos comerciales ni el modelo 3D; este trabajo se limita
a los assets raster y a su presentación directa en `ProductImage`.
