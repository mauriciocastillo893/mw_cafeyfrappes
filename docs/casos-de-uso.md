# Casos de uso — lo que hace el cliente

> Creado 2026-10-07 (Fase 2). Un flujo por sección; se agregan los de
> pedir, pagar y seguir el pedido en las Fases 5 y 6.

## 1. Ver el menú

**Cómo llega:** QR de la mesa (`/menu?mesa=4`), QR del mostrador o de la
publicidad (`/menu`), botón "Ver menú" de la portada, o un link
compartido a un producto (`/menu?producto=frappe-moka`).

1. Ve el menú por categorías (Waffles, Café, Frappés, Crepas, Sodas
   italianas) con foto, precio y etiquetas (Frío, Caliente, Nuevo,
   Favorito). Con tamaños, el precio dice "desde $70".
2. Arriba ve si está **Abierto** o **Cerrado**. Si está cerrado, un aviso
   dice cuándo abren: "Abrimos hoy / mañana / el jueves a las 7:00 p. m."
   (sigue pudiendo ver el menú).
3. Si llegó por el QR de una mesa, ve "Mesa 4". La mesa se recuerda en
   esa pestaña aunque vaya a la portada y regrese; el pedido la usará
   (Fase 5).
4. Puede **buscar** ("nutella", "frappe" sin acento) y **filtrar** Frío /
   Caliente. Si no hay resultados, un botón regresa a todo el menú.
5. La barra de categorías se queda fija arriba, salta a cada sección y
   marca en cuál va.
6. Al tocar un producto se abre el **detalle**: foto grande, descripción,
   tamaños con su precio y extras por grupo ("Opcional · hasta 4"). El
   total cambia al elegir. Por ahora dice "Muy pronto vas a poder pedir
   desde aquí" (el pedido llega en la Fase 5).
7. El detalle se cierra con la ✕, tocando fuera, con Esc o con el botón
   "atrás" del celular (no se sale del menú).

**Agotado:** el producto se ve en gris con la etiqueta "Agotado" y en el
detalle dice "Agotado por ahora", sin tamaños ni extras. Un extra agotado
se ve deshabilitado con "· agotado".

**Oculto:** un producto o categoría oculto en `/admin` no aparece.

**Cambios desde `/admin`:** se ven en el menú en menos de un minuto.
