-- Seed de posts para el blog (idempotente por slug)
INSERT INTO posts (title, slug, excerpt, content, image_url, published)
VALUES
  (
    'Los secretos del caldo tlalpeno',
    'los-secretos-del-caldo-tlalpeno',
    'Ingredientes clave y tips para lograr un caldo con caracter, aroma y mucho sabor.',
    'En este post te contamos los pasos basicos para un caldo tlalpeno con buen balance. Ajusta el picante, cuida el punto del arroz y termina con aguacate fresco.',
    NULL,
    1
  ),
  (
    'Como nacio La Siberia Central',
    'como-nacio-la-siberia-central',
    'Una historia familiar, recetas heredadas y la pasion por cocinar para compartir.',
    'Desde la primera cocina hasta el restaurante de hoy, esta historia resume el origen y los sabores que nos definen.',
    NULL,
    1
  ),
  (
    'Combos que si convienen',
    'combos-que-si-convienen',
    'Guia rapida para elegir el combo perfecto segun el antojo y el presupuesto.',
    'Comparamos opciones y porciones para que encuentres el combo ideal. Incluye recomendaciones para pechuga o pierna.',
    NULL,
    1
  ),
  (
    'El toque ideal en tus tacos',
    'el-toque-ideal-en-tus-tacos',
    'Salsas, texturas y recomendaciones para armar el bocado perfecto.',
    'Un buen taco necesita contraste: crujiente, fresco y picante equilibrado. Aqui tienes nuestras combinaciones favoritas.',
    NULL,
    1
  ),
  (
    'Bebidas que acompan~an mejor',
    'bebidas-que-acompanan-mejor',
    'De refrescos clasicos a sabores frutales, elige la pareja ideal.',
    'Te damos una guia corta para maridar bebidas con tacos, tostadas y caldos.',
    NULL,
    1
  )
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image_url = excluded.image_url,
  published = excluded.published,
  updated_at = CURRENT_TIMESTAMP;
