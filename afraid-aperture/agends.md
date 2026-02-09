# Guia de plantilla de menu (Americas)

Este archivo documenta como funciona la plantilla de menu en `src/pages/menus/americas.astro` para agregar imagenes, textos y bloques sin romper layout ni capas.

## 1. Modelo de layout

La pagina trabaja como un lienzo fijo:

- Ancho base: `1080px` (`CANVAS_W` y `--canvas-w`).
- Alto base: `13320px` (`CANVAS_H` y `--canvas-h`).
- Todo se posiciona en coordenadas absolutas dentro de `.canvas`.
- En pantallas chicas no se reacomoda: se escala todo el canvas con `transform: scale(...)` en `.frame`.

Implicacion: mueve elementos con `top/left/width/height` en px, no con layout responsivo tradicional.

## 2. Flujo de render

1. Importas assets en el frontmatter (`... ?url`).
2. Agregas el nodo dentro de `.canvas` (normalmente un `div.abs.img` o un `section.section`).
3. Defines clase CSS con coordenadas y estilo.
4. Si usas variable CSS (`define:vars`), la declaras ahi y la consumes con `var(--...)`.

## 3. Como agregar imagenes decorativas

Patron recomendado (sprite con background):

1. Importar:

```astro
import grupo999Url from '../../assets/media/AMERICAS-menu/Grupo 999.svg?url';
```

2. Agregar nodo en `.canvas`:

```astro
<div class="abs img g999" style={`background-image: url(${grupo999Url});`} aria-hidden="true"></div>
```

3. Definir clase:

```css
.g999 {
  top: 5000px;
  left: 300px;
  width: 400px;
  height: 220px;
  z-index: 2;
  opacity: 1;
}
```

Notas:

- `.img` ya trae `background-repeat: no-repeat`, `background-position: center`, `background-size: contain`.
- Si necesitas control extra (rotacion, matrix, etc.), agregalo en la clase puntual (`.g999`).

## 4. Como agregar imagenes tipo foto con `<img>`

Usalo cuando necesites tamano natural o transformaciones directas:

```astro
<img
  src={grupo999Url}
  alt=""
  class="abs"
  style="top: 5000px; left: 300px; width: 400px; height: auto; z-index: 3;"
/>
```

## 5. Como agregar textos

### Texto suelto absoluto

Usa `.txt`:

```astro
<div class="txt" style="--x: 120px; --y: 300px; --w: 300px; --fs: 34px; --c: #fff;">
  TEXTO
</div>
```

### Bloques de menu (items/precios)

Usa `section.section` + clase posicionadora:

```astro
<section class="section mi-seccion">
  ...
</section>
```

```css
.mi-seccion {
  --x: 112px;
  --y: 9000px;
  --w: 851px;
  --h: 500px;
}
```

Reutiliza las clases existentes (`menu-item`, `caldo-item`, `bebida-item`, etc.) para mantener estilo consistente.

## 6. Capas: como poner algo encima de otra cosa

Reglas reales en esta plantilla:

1. `z-index` manda cuando los elementos son posicionados.
2. Si dos elementos tienen mismo `z-index`, manda el orden en el DOM (el que esta mas abajo en el archivo se pinta encima).
3. Helpers base:
- `.img` arranca en `z-index: 2`.
- `.txt` arranca en `z-index: 3`.
- `.section` arranca en `z-index: 2`.
- Botones flotantes usan valores altos (`100`, `200`).

Convencion practica recomendada:

- Fondo/decoracion: `z-index: 1-2`
- Titulos/textos importantes: `z-index: 3-4`
- Elemento que debe ganar sobre otros: `z-index: 5+`
- UI fija (botones): `100+`

Si algo sigue detras:

1. Sube `z-index` del elemento objetivo.
2. Baja `z-index` del elemento que tapa.
3. Mueve el nodo objetivo mas abajo en `.canvas` (ultimo recurso para empate de capas).

## 7. Buenas practicas para no romper nada

- Mantener todas las coordenadas en px (la plantilla esta hecha pixel-perfect).
- No cambiar `.frame`/`.canvas`/script de escala salvo que sea intencional.
- Si aumentas contenido vertical, actualiza altura de canvas en estos 2 puntos: `CANVAS_H` (frontmatter) y `--canvas-h` (`:root`).
- Evita mezclar demasiados patrones de carga para un mismo elemento.
- Usa solo uno por elemento: import directo en `style={...}` o `define:vars` + `var(--...)`.
- Para decoraciones sin funcion semantica usar `aria-hidden="true"`.

## 8. Checklist rapido antes de cerrar un cambio

1. El asset existe en `src/assets/...` o `public/img/...`.
2. El import apunta al archivo correcto (`.svg`/`.png`).
3. El nodo esta dentro de `.canvas`.
4. La clase tiene `top/left/width/height`.
5. La capa (`z-index`) quedo correcta frente a elementos vecinos.
6. No se desalineo al hacer scroll completo del menu.
