document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://script.google.com/macros/s/AKfycbzm9d1lbPkS7_kCIClR5EjDTsLa2pZPfiK6SgE6_mpMJ071pQ8gJKnCW2Kl9qQ6F1KL/exec";

  const form = document.querySelector('#participation-form');
  const messageContainer = document.querySelector('#form-message');
  const localDisplayElements = document.querySelectorAll('.local-name');
  const submitBtn = form.querySelector('button[type="submit"]');
  const localSelect = document.querySelector('#localSelect');

  const getLocalDisplay = (value) => {
    if (value === 'pecat') return 'EL PECAT';
    if (value === 'belcebu') return 'BELCEBÚ';
    return 'BELCEBÚ';
  };

  localSelect.addEventListener('change', () => {
    const displayName = getLocalDisplay(localSelect.value);
    localDisplayElements.forEach(el => {
      el.textContent = displayName;
    });
  });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage();

    const formData = new FormData(form);

    if (!localSelect.value) {
      showMessage('Selecciona el local.', 'error');
      return;
    }

    const payload = {
      local: localSelect.value,
      nombre: String(formData.get('nombre') || '').trim(),
      telefono: String(formData.get('telefono') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      ticket: String(formData.get('ticket') || '').trim(),
      aceptaPrivacidad: formData.get('aceptaPrivacidad') === 'on',
      aceptaBases: formData.get('aceptaBases') === 'on',
      aceptaPromociones: formData.get('aceptaPromociones') === 'on',
      origen: window.location.href,
      userAgent: navigator.userAgent,
      timestampCliente: new Date().toISOString()
    };

    if (!payload.nombre || !payload.telefono || !payload.email || !payload.ticket) {
      showMessage('Completa todos los campos obligatorios.', 'error');
      return;
    }

    if (!isValidEmail(payload.email)) {
      showMessage('Introduce un correo electrónico válido.', 'error');
      return;
    }

    if (!payload.aceptaPrivacidad || !payload.aceptaBases) {
      showMessage('Debes aceptar la política de privacidad y las bases legales para participar.', 'error');
      return;
    }

    if (API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_URL')) {
      showMessage('Falta configurar la URL de Google Apps Script.', 'error');
      return;
    }

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.ok) {
        showMessage(result.message || 'No se ha podido registrar la participación.', 'error');
        return;
      }

      showMessage(result.message || '¡Participación registrada con éxito! Mucha suerte.', 'success');
      form.reset();

      localDisplayElements.forEach(el => {
        el.textContent = 'BELCEBÚ';
      });

    } catch (error) {
      console.error(error);
      showMessage('Error de conexión. Inténtalo de nuevo en unos minutos.', 'error');

    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function showMessage(text, type) {
    messageContainer.textContent = text;
    messageContainer.className = `message ${type}`;
    messageContainer.style.display = 'block';
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideMessage() {
    messageContainer.textContent = '';
    messageContainer.className = 'message';
    messageContainer.style.display = 'none';
  }
});