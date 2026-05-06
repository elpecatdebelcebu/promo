# Belcebú Promos v1

Landing promocional sencilla para campañas de Belcebú y El Pecat de Belcebú.

## Arquitectura

- GitHub Pages: landing pública.
- Apps Script: endpoint seguro para guardar participaciones.
- Google Sheets: base privada de participaciones.
- Canva: imágenes de campaña y preview social.

## URLs por local

- `index.html?local=belcebu`
- `index.html?local=pecat`

Cada local puede tener su propio QR apuntando a su URL.

## Despliegue Apps Script

1. Crear un Google Sheet nuevo.
2. Extensiones → Apps Script.
3. Pegar el contenido de `apps-script/Code.gs`.
4. Guardar.
5. Desplegar → Nueva implementación → Aplicación web.
6. Ejecutar como: tú.
7. Quién tiene acceso: cualquier usuario.
8. Copiar la URL terminada en `/exec`.
9. Pegarla en `js/app.js`, variable `CONFIG.endpoint`.

## Campos guardados

- timestamp
- local
- nombre
- telefono
- email
- ticket
- acepta_bases
- acepta_privacidad
- acepta_marketing
- duplicado
- valido
- timezone

## Regla de tickets

Cada ticket solo cuenta una vez por local. Si se repite, queda marcado como duplicado y no es válido para sorteo.
