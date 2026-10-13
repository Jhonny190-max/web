# MailFlow · Sistema de notificaciones por correo electrónico

Aplicación web que permite a un usuario ingresar sus datos, **enviar un correo real mediante EmailJS** y visualizar una notificación que indica si el envío fue exitoso o si ocurrió un error.

> **Proyecto académico — Desarrollo Web Full Stack.**
> Rama de trabajo del examen: **`parcial-emailjs`**.

---

## 1. Descripción

MailFlow es una interfaz premium (inspirada en el estilo de SaaS modernos) construida con **HTML5 semántico, Tailwind CSS, Flowbite y JavaScript vanilla**. El formulario valida los datos en el navegador y, si son correctos, usa el **EmailJS Browser SDK** para enviar el mensaje al correo destinatario indicado.

### Objetivo académico

Cumplir el enunciado del examen parcial:

1. Desarrollar en una rama independiente de GitHub (`parcial-emailjs`).
2. Interfaz funcional con HTML5, CSS3 y JavaScript.
3. Integración real de EmailJS (servicio + plantilla + Public Key).
4. Envío de un mensaje al correo del estudiante/destinatario.
5. Validación de datos.
6. Mensajes de confirmación y error.
7. Publicación de la rama y enlace al repositorio.

---

## 2. Tecnologías utilizadas

| Tecnología        | Uso                                                        |
| ----------------- | ---------------------------------------------------------- |
| HTML5 semántico   | Estructura de la página.                                    |
| CSS3 + Tailwind   | Diseño, utilidades y componentes (v3.4).                    |
| Flowbite          | Componentes de interfaz y estilos (v2.5, plugin + JS CDN).  |
| JavaScript vanilla| Toda la lógica (validación, estado, envío).                 |
| EmailJS Browser SDK | Envío de correos desde el navegador (v4).                 |
| npm + Tailwind CLI| Compilación del CSS.                                        |
| Git y GitHub      | Control de versiones y rama del examen.                     |

> No se utilizan React, Vue, Angular ni otros frameworks de JavaScript.

---

## 3. Estructura de carpetas

```
Parcial/
├── index.html              # Interfaz (HTML5 semántico + clases Tailwind/Flowbite)
├── src/
│   ├── input.css           # Directivas @tailwind + clases personalizadas
│   └── script.js           # Lógica: EmailJS, validación, estado y notificaciones
├── dist/
│   └── output.css          # CSS compilado (generado por Tailwind; no editar a mano)
├── tailwind.config.js      # Configuración de Tailwind + plugin de Flowbite
├── package.json            # Dependencias y scripts (dev/build/serve)
├── .gitignore
└── README.md
```

---

## 4. Requisitos previos

- **Node.js** 18 o superior y **npm**.
- Conexión a internet (para cargar el SDK de EmailJS y el JS de Flowbite por CDN).
- Una cuenta gratuita en [EmailJS](https://dashboard.emailjs.com/sign-up).
- (Opcional) Una cuenta de GitHub y `git` configurado.

---

## 5. Instalación de dependencias

Desde la carpeta del proyecto:

```bash
npm install
```

Esto instala `tailwindcss` (con su CLI) y `flowbite` (para el plugin de Tailwind) como dependencias de desarrollo.

---

## 6. Ejecución local

1. Compila el CSS (o usa el modo observación):

   ```bash
   npm run build      # compilación única y minificada
   # o
   npm run dev        # recompila al guardar cambios
   ```

2. Sirve la carpeta con cualquier servidor estático. La opción más sencilla:

   ```bash
   npm run serve
   ```

   También puedes usar la extensión **Live Server** de VS Code, o:

   ```bash
   npx serve .
   ```

3. Abre la URL que indique la herramienta (normalmente `http://localhost:3000`).

> **Importante:** abre el proyecto a través de un servidor (`http://localhost`), no con doble clic sobre `index.html` (`file://`), porque el SDK de EmailJS y los módulos funcionan mejor servidos por HTTP.

---

## 7. Compilación de Tailwind CSS

- Entrada: `src/input.css`
- Salida: `dist/output.css`
- La ruta de contenido está definida en `tailwind.config.js` (incluye `index.html`, `src/**` y `node_modules/flowbite/**`), de modo que **Tailwind procesa también las clases usadas por Flowbite**.

```bash
npm run dev     # tailwindcss -i ./src/input.css -o ./dist/output.css --watch
npm run build   # tailwindcss -i ./src/input.css -o ./dist/output.css --minify
```

Si modificas clases en `index.html`, vuelve a compilar para regenerar `dist/output.css`.

---

## 8. Configuración de Flowbite

1. **Estilos:** el plugin se registra en `tailwind.config.js` mediante
   `plugins: [require("flowbite/plugin")]`. Al compilar, se incluyen los estilos de Flowbite que se usan en el proyecto.
2. **Componentes interactivos:** se carga el JavaScript de Flowbite por CDN en `index.html`:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script>
   ```

   Esto habilita los componentes con comportamiento (por ejemplo, alerts/tooltips). La aplicación usa sobre todo las **alertas** con los estilos de Flowbite.

---

## 9. Creación del servicio EmailJS

1. Crea tu cuenta en [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/) (plan gratuito).
2. Ve a **Email Services → Add New Service** y conecta tu proveedor de correo
   (por ejemplo Gmail). Autoriza la cuenta.
3. Copia el **Service ID** del servicio creado (aparece como `service_xxxxxxx`).

> En el plan gratuito, con Gmail, el remitente suele ser tu propio correo y los **destinatarios dinámicos** pueden estar restringidos. Fíjate en la documentación: si el servicio no permite destinatarios dinámicos, **configura como destinatario de prueba un correo autorizado** en tu plantilla.

---

## 10. Creación de la plantilla de correo

1. Ve a **Email Templates → New Template**.
2. En el campo **To Email (destinatario)** de la plantilla, escribe la variable:

   ```
   {{to_email}}
   ```

   > EmailJS **no** toma el destinatario solo por enviarlo desde JavaScript: hay que colocar `{{to_email}}` en el campo *To Email* de la plantilla. Si tu cuenta no permite destinatarios dinámicos, sustituye esa variable por tu correo de prueba autorizado.
3. **Subject (asunto)** de la plantilla:

   ```
   Confirmación: {{asunto}}
   ```

4. **Content (contenido)** de la plantilla:

   ```
   Hola {{nombre}}:

   Has recibido una notificación desde el formulario web MailFlow.

   Asunto: {{asunto}}

   Mensaje:
   {{mensaje}}

   Correo de contacto: {{email}}
   ```

5. Copia el **Template ID** de la plantilla (`template_xxxxxxx`).

### Variables de la plantilla

Los nombres deben coincidir **exactamente** con las enviadas desde `src/script.js`:

| Variable     | Origen                                        |
| ------------ | --------------------------------------------- |
| `{{nombre}}` | Campo "Nombres y apellidos".                  |
| `{{email}}`  | Campo "Correo electrónico destinatario".      |
| `{{asunto}}` | Campo "Asunto".                               |
| `{{mensaje}}`| Campo "Mensaje".                              |
| `{{to_email}}`| Destinatario (mismo valor que `email`).      |

---

## 11. Ubicación de Public Key, Service ID y Template ID

- **Public Key:** panel de EmailJS → **Account → API Keys → Public Key**.
- **Service ID:** **Email Services → (tu servicio) → Service ID**.
- **Template ID:** **Email Templates → (tu plantilla) → Template ID**.

---

## 12. Configuración de credenciales

Abre `src/script.js` y edita el objeto `EMAILJS_CONFIG` (sección **1** del archivo):

```js
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "TU_PUBLIC_KEY",
  SERVICE_ID: "TU_SERVICE_ID",
  TEMPLATE_ID: "TU_TEMPLATE_ID"
};
```

Reemplaza los marcadores por tus valores reales, por ejemplo:

```js
const EMAILJS_CONFIG = {
  PUBLIC_KEY: "AbCdEfGhIjKlMnOp",
  SERVICE_ID: "service_abc1234",
  TEMPLATE_ID: "template_xyz9876"
};
```

Vuelve a compilar (`npm run build`) y recarga la página. Si falta alguna credencial, la interfaz muestra **"Falta configurar EmailJS"** y detalla cuál falta.

> La **Public Key** está diseñada por EmailJS para usarse en el navegador. Aun así, **nunca** coloques contraseñas de correo ni claves privadas en el frontend.

---

## 13. Prueba de envío

1. Configura las credenciales (sección 12).
2. Ejecuta `npm run build` y `npm run serve`.
3. Completa el formulario con datos válidos y pulsa **Enviar correo**.
4. Observa el **Estado del servicio**: `Validando datos → Enviando mensaje → Correo enviado`.
5. Revisa la bandeja del correo destinatario (incluida la carpeta de spam).
6. Si aparece **"Error de envío"**, revisa la consola (F12) y la sección 15.

---

## 14. Solución de errores frecuentes

| Síntoma | Causa probable | Solución |
| ------- | -------------- | -------- |
| "Falta configurar EmailJS" | Quedan placeholders | Edita `EMAILJS_CONFIG` en `src/script.js`. |
| Estado "Error de envío" y consola con `400`/`412` | Service ID / Template ID / Public Key incorrectos o servicio sin autorizar | Verifica las tres credenciales y que el servicio esté conectado. |
| "The recipients address is empty" | Falta `{{to_email}}` en el campo *To Email* de la plantilla | Añade la variable en la plantilla. |
| El correo no llega | Destinatario no autorizado / restricción del plan gratuito | Usa un destinatario autorizado o revisa spam. |
| El diseño se ve sin estilos | No se compiló el CSS o se abrió con `file://` | Ejecuta `npm run build` y sirve con `npm run serve`. |
| "SDK no disponible" | Sin internet o CDN bloqueado | Verifica la conexión; el SDK se carga por CDN. |
| Los componentes de Flowbite no responden | JS de Flowbite no cargado | Comprueba el `<script>` de Flowbite en `index.html`. |

---

## 15. Seguridad y limitaciones

- La **Public Key** de EmailJS está pensada para el navegador; no es un secreto de servidor.
- **No** se incluyen contraseñas de correo ni claves privadas en el frontend.
- **No** se guardan los datos del formulario en `localStorage`.
- La consola registra solo información técnica (estado), **sin** el contenido completo de los mensajes personales ni credenciales.
- En EmailJS se pueden configurar **restricciones de dominio** y controles **antispam**; se recomienda activarlos.
- Una aplicación **estática** no puede proteger por sí sola un servicio de correo frente a todos los usos abusivos. Para producción se recomienda un backend que valide y limite los envíos.

---

## 16. Creación y publicación de la rama GitHub

La rama del examen se llama **`parcial-emailjs`**.

```bash
# 1. Verificar estado
git status

# 2. Crear y cambiar a la rama del examen
git checkout -b parcial-emailjs

# 3. Agregar únicamente el proyecto (no node_modules)
git add web/Parcial
git commit -m "feat(mailflow): sistema de notificaciones con EmailJS"

# 4. Publicar la rama en GitHub
git push -u origin parcial-emailjs
```

---

## 17. Enlace de entrega

- Repositorio: `https://github.com/Jhonny190-max/web`
- Rama: `parcial-emailjs`
- **Enlace de la rama (completar tras el push):** `https://github.com/Jhonny190-max/web/tree/parcial-emailjs`

> Este enlace solo es válido una vez realizado el `git push` de la rama.

---

## 18. Créditos

Proyecto académico — Desarrollo Web Full Stack. Tecnologías documentadas en:

- Tailwind CSS: https://tailwindcss.com/docs
- Flowbite: https://flowbite.com/docs/getting-started/introduction/
- EmailJS: https://www.emailjs.com/docs/
- GitHub: https://docs.github.com/
