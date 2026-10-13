/* =========================================================================
   MailFlow · src/script.js
   Lógica de la aplicación: validación, estado, notificaciones y EmailJS.
   JavaScript vanilla (sin frameworks).
   ========================================================================= */

(function () {
  "use strict";

  /* =======================================================================
     1) CONFIGURACIÓN DE EMAILJS
     -----------------------------------------------------------------------
     Reemplaza los marcadores de posición con tus credenciales reales del
     panel de EmailJS (https://dashboard.emailjs.com/).

       PUBLIC_KEY  -> Account > API Keys > Public Key
       SERVICE_ID  -> Email Services > (tu servicio) > Service ID
       TEMPLATE_ID -> Email Templates > (tu plantilla) > Template ID

     - La Public Key está diseñada para usarse en el navegador.
     - NUNCA incluyas contraseñas de correo ni claves privadas aquí.
     ======================================================================= */
  const EMAILJS_CONFIG = {
    PUBLIC_KEY: "HINDKH_WSOJVVw7f_",
    SERVICE_ID: "service_h2jsjo7",
    TEMPLATE_ID: "template_gv1bevk"
  };

  const PLACEHOLDER_VALUES = ["", "TU_PUBLIC_KEY", "TU_SERVICE_ID", "TU_TEMPLATE_ID"];

  function isConfigured() {
    return (
      !PLACEHOLDER_VALUES.includes(EMAILJS_CONFIG.PUBLIC_KEY.trim()) &&
      !PLACEHOLDER_VALUES.includes(EMAILJS_CONFIG.SERVICE_ID.trim()) &&
      !PLACEHOLDER_VALUES.includes(EMAILJS_CONFIG.TEMPLATE_ID.trim())
    );
  }

  function missingCredentials() {
    const missing = [];
    if (PLACEHOLDER_VALUES.includes(EMAILJS_CONFIG.PUBLIC_KEY.trim())) missing.push("PUBLIC_KEY");
    if (PLACEHOLDER_VALUES.includes(EMAILJS_CONFIG.SERVICE_ID.trim())) missing.push("SERVICE_ID");
    if (PLACEHOLDER_VALUES.includes(EMAILJS_CONFIG.TEMPLATE_ID.trim())) missing.push("TEMPLATE_ID");
    return missing;
  }

  /* =======================================================================
     2) REFERENCIAS DEL DOM
     ======================================================================= */
  const form = document.getElementById("mailflow-form");
  const submitBtn = document.getElementById("submit-btn");
  const submitBtnText = document.getElementById("submit-btn-text");
  const submitSpinner = document.getElementById("submit-spinner");
  const submitIcon = document.getElementById("submit-icon");
  const formAlert = document.getElementById("form-alert");
  const toastContainer = document.getElementById("toast-container");

  const statusDot = document.getElementById("service-status-dot");
  const statusText = document.getElementById("service-status-text");
  const configWarning = document.getElementById("config-warning");
  const configWarningText = document.getElementById("config-warning-text");
  const statusSteps = document.querySelectorAll("#status-steps [data-step]");

  const fields = {
    nombre: {
      input: document.getElementById("nombre"),
      error: document.getElementById("error-nombre"),
      validate: (v) => (v.length >= 2 ? "" : "El nombre debe contener al menos 2 caracteres.")
    },
    email: {
      input: document.getElementById("email"),
      error: document.getElementById("error-email"),
      validate: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Ingresa un correo electrónico con formato válido."
    },
    asunto: {
      input: document.getElementById("asunto"),
      error: document.getElementById("error-asunto"),
      validate: (v) => (v.length >= 3 ? "" : "El asunto debe contener al menos 3 caracteres.")
    },
    mensaje: {
      input: document.getElementById("mensaje"),
      error: document.getElementById("error-mensaje"),
      validate: (v) => (v.length >= 5 ? "" : "El mensaje debe contener al menos 5 caracteres.")
    }
  };

  /* =======================================================================
     3) NOTIFICACIONES (toast + alerta del formulario) · estilo Flowbite
     ======================================================================= */

  const TOAST_STYLES = {
    success: {
      wrapper: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: "text-emerald-600",
      svg: '<path d="M20 6 9 17l-5-5" />'
    },
    error: {
      wrapper: "border-red-200 bg-red-50 text-red-800",
      icon: "text-red-600",
      svg: '<circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />'
    },
    warning: {
      wrapper: "border-amber-200 bg-amber-50 text-amber-800",
      icon: "text-amber-600",
      svg: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" />'
    },
    info: {
      wrapper: "border-navy-200 bg-navy-50 text-navy-800",
      icon: "text-navy-600",
      svg: '<circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />'
    }
  };

  function showToast(type, title, message, options) {
    const opts = options || {};
    const style = TOAST_STYLES[type] || TOAST_STYLES.info;

    const toast = document.createElement("div");
    toast.className =
      "pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-soft " +
      "animate-fade-in-up " + style.wrapper;
    toast.setAttribute("role", "alert");
    toast.dataset.toast = "true";

    toast.innerHTML =
      '<div class="flex items-start gap-3">' +
        '<svg class="mt-0.5 h-5 w-5 shrink-0 ' + style.icon + '" viewBox="0 0 24 24" fill="none" ' +
          'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          style.svg +
        "</svg>" +
        '<div class="flex-1">' +
          '<p class="text-sm font-semibold">' + escapeHtml(title) + "</p>" +
          '<p class="mt-1 text-sm opacity-90">' + escapeHtml(message) + "</p>" +
        "</div>" +
        '<button type="button" class="ml-1 rounded-lg p-1 opacity-70 transition hover:opacity-100" ' +
          'aria-label="Cerrar notificación">' +
          '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M18 6 6 18M6 6l12 12" /></svg>' +
        "</button>" +
      "</div>";

    toast.querySelector("button").addEventListener("click", () => dismissToast(toast));
    toastContainer.appendChild(toast);

    if (opts.autoDismiss !== false) {
      const delay = typeof opts.duration === "number" ? opts.duration : 5000;
      setTimeout(() => dismissToast(toast), delay);
    }

    return toast;
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.transition = "opacity .25s ease, transform .25s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    setTimeout(() => toast.remove(), 260);
  }

  function showFormAlert(type, title, message) {
    const style = TOAST_STYLES[type] || TOAST_STYLES.info;
    formAlert.className = "mb-6 rounded-xl border p-4 " + style.wrapper;
    formAlert.classList.remove("hidden");
    formAlert.innerHTML =
      '<div class="flex items-start gap-3">' +
        '<svg class="mt-0.5 h-5 w-5 shrink-0 ' + style.icon + '" viewBox="0 0 24 24" fill="none" ' +
          'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          style.svg +
        "</svg>" +
        '<div><p class="text-sm font-semibold">' + escapeHtml(title) + "</p>" +
        '<p class="mt-1 text-sm opacity-90">' + escapeHtml(message) + "</p></div>" +
      "</div>";
  }

  function hideFormAlert() {
    formAlert.classList.add("hidden");
    formAlert.innerHTML = "";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* =======================================================================
     4) ESTADO DEL SERVICIO
     ======================================================================= */
  const STATUS_MAP = {
    ready: { dot: "bg-navy-400", text: "Listo para enviar" },
    validating: { dot: "bg-accent-500", text: "Validando datos..." },
    sending: { dot: "bg-accent-500", text: "Enviando mensaje..." },
    sent: { dot: "bg-emerald-500", text: "Correo enviado" },
    error: { dot: "bg-red-500", text: "Error de envío" },
    unconfigured: { dot: "bg-amber-500", text: "Falta configurar EmailJS" }
  };

  function setStatus(key) {
    const state = STATUS_MAP[key] || STATUS_MAP.ready;
    statusDot.className = "status-dot " + state.dot;
    statusText.textContent = state.text;

    statusSteps.forEach((step) => {
      const marker = step.querySelector("span:first-child");
      const isActive = step.dataset.step === key;
      marker.className =
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold " +
        (isActive ? "bg-accent-600 text-white" : "bg-navy-100 text-navy-500");
    });
  }

  function refreshConfigurationState() {
    const missing = missingCredentials();

    if (missing.length === 0) {
      configWarning.classList.add("hidden");
      setStatus("ready");
      return true;
    }

    configWarning.classList.remove("hidden");
    configWarningText.innerHTML =
      "Faltan las siguientes credenciales: <strong>" +
      missing.join(", ") +
      "</strong>. Edítalas en <code class=\"rounded bg-amber-100 px-1 py-0.5\">src/script.js</code> " +
      "(objeto EMAILJS_CONFIG).";
    setStatus("unconfigured");
    return false;
  }

  /* =======================================================================
     5) VALIDACIÓN
     ======================================================================= */
  function getFieldValue(key) {
    return fields[key].input.value.trim().replace(/\s+/g, " ").trim();
  }

  function validateField(key) {
    const field = fields[key];
    const value = getFieldValue(key);
    const message = field.error;

    if (value === "") {
      setFieldState(field, false, "Este campo es obligatorio.");
      return false;
    }

    const errorText = field.validate(value);
    if (errorText) {
      setFieldState(field, false, errorText);
      return false;
    }

    setFieldState(field, true, "");
    return true;
  }

  function setFieldState(field, isValid, errorText) {
    if (isValid === false) {
      field.input.classList.add("is-invalid");
      field.input.classList.remove("is-valid");
      field.input.setAttribute("aria-invalid", "true");
      field.error.textContent = errorText;
      field.error.classList.add("is-visible");
    } else if (isValid === true) {
      field.input.classList.add("is-valid");
      field.input.classList.remove("is-invalid");
      field.input.removeAttribute("aria-invalid");
      field.error.textContent = "";
      field.error.classList.remove("is-visible");
    }
  }

  function validateForm() {
    let firstInvalid = null;
    let isValid = true;

    Object.keys(fields).forEach((key) => {
      const ok = validateField(key);
      if (!ok) {
        isValid = false;
        if (!firstInvalid) firstInvalid = fields[key].input;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return isValid;
  }

  Object.keys(fields).forEach((key) => {
    const input = fields[key].input;
    input.addEventListener("blur", () => validateField(key));
    input.addEventListener("input", () => {
      if (input.classList.contains("is-invalid")) validateField(key);
    });
  });

  /* =======================================================================
     6) ESTADO DEL BOTÓN
     ======================================================================= */
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtnText.textContent = isLoading ? "Enviando..." : "Enviar correo";
    submitSpinner.classList.toggle("hidden", !isLoading);
    submitIcon.classList.toggle("hidden", isLoading);
  }

  /* =======================================================================
     7) ENVÍO CON EMAILJS
     ======================================================================= */
  function initEmailJS() {
    if (typeof emailjs === "undefined") {
      console.error("[MailFlow] El SDK de EmailJS no está disponible. Verifica el CDN.");
      return false;
    }
    try {
      emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
      return true;
    } catch (error) {
      console.error("[MailFlow] Error al inicializar EmailJS:", error.message);
      return false;
    }
  }

  function buildTemplateParams(data) {
    return {
      nombre: data.nombre,
      email: data.email,
      asunto: data.asunto,
      mensaje: data.mensaje,
      to_email: data.email
    };
  }

  async function sendEmail(data) {
    return emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      buildTemplateParams(data)
    );
  }

  /* =======================================================================
     8) MANEJADOR DEL FORMULARIO
     ======================================================================= */
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideFormAlert();

    setStatus("validating");

    if (!validateForm()) {
      setStatus("ready");
      showFormAlert("error", "Formulario inválido", "Revisa los campos marcados en rojo antes de continuar.");
      showToast("error", "Formulario inválido", "Corrige los campos señalados e inténtalo de nuevo.");
      return;
    }

    if (!refreshConfigurationState()) {
      showFormAlert(
        "warning",
        "Falta configurar EmailJS",
        "Completa PUBLIC_KEY, SERVICE_ID y TEMPLATE_ID en src/script.js antes de enviar."
      );
      showToast("warning", "Configuración incompleta", "Aún no se han definido tus credenciales de EmailJS.");
      return;
    }

    if (typeof emailjs === "undefined") {
      setStatus("error");
      showFormAlert("error", "SDK no disponible", "No se pudo cargar EmailJS. Revisa tu conexión a internet.");
      showToast("error", "Problema de conexión", "La librería de EmailJS no está disponible.");
      return;
    }

    const data = {
      nombre: getFieldValue("nombre"),
      email: getFieldValue("email"),
      asunto: getFieldValue("asunto"),
      mensaje: getFieldValue("mensaje")
    };

    setLoading(true);
    setStatus("sending");
    showToast("info", "Enviando mensaje", "Estamos procesando tu solicitud con EmailJS.", {
      duration: 2500
    });

    try {
      const response = await sendEmail(data);

      if (!response || (response.status !== 200 && response.status !== 201)) {
        throw new Error("Respuesta inesperada del servicio (status: " +
          (response && response.status) + ")");
      }

      setStatus("sent");
      showFormAlert("success", "Correo enviado", "La confirmación se envió correctamente a " + data.email + ".");
      showToast("success", "¡Correo enviado!", "El mensaje se envió correctamente a " + data.email + ".");
      console.info("[MailFlow] Envío exitoso. Status:", response.status);

      form.reset();
      Object.keys(fields).forEach((key) => setFieldState(fields[key], null, ""));
    } catch (error) {
      setStatus("error");

      const detail = (error && (error.text || error.message)) || "Error desconocido";
      console.error("[MailFlow] Falló el envío:", detail);

      let userMessage = "No se pudo enviar el correo. Inténtalo nuevamente.";
      if (typeof detail === "string" && /network|fetch|conexi/i.test(detail)) {
        userMessage = "Parece haber un problema de conexión. Revisa tu red e inténtalo de nuevo.";
      }

      showFormAlert("error", "Error de envío", userMessage);
      showToast("error", "Error de envío", userMessage);
    } finally {
      setLoading(false);
    }
  });

  /* =======================================================================
     9) INICIALIZACIÓN
     ======================================================================= */
  function init() {
    const configured = refreshConfigurationState();

    if (configured) {
      const sdkReady = initEmailJS();
      if (!sdkReady) {
        setStatus("error");
        showToast("error", "Problema de conexión", "No se pudo inicializar EmailJS.");
      } else {
        showToast("info", "Servicio preparado", "EmailJS está listo para enviar tu mensaje.", {
          duration: 3500
        });
      }
    } else {
      showToast(
        "warning",
        "Configuración pendiente",
        "Agrega tus credenciales de EmailJS en src/script.js para habilitar el envío."
      );
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
