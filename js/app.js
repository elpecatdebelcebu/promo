document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://script.google.com/macros/s/AKfycbzm9d1lbPkS7_kCIClR5EjDTsLa2pZPfiK6SgE6_mpMJ071pQ8gJKnCW2Kl9qQ6F1KL/exec";

  const form = document.querySelector('#participation-form');
  const messageContainer = document.querySelector('#form-message');
  const localSelect = document.querySelector('#localSelect');
  const submitBtn = form?.querySelector('button[type="submit"]');

  if (!form || !messageContainer || !localSelect || !submitBtn) {
    console.error('Faltan elementos necesarios del formulario.');
    return;
  }

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage();

    const formData = new FormData(form);

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

    if (!payload.local) {
      showMessage('Selecciona el local donde has consumido la tapa.', 'error');
      localSelect.focus();
      return;
    }

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
      localSelect.value = '';

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
    messageContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  function hideMessage() {
    messageContainer.textContent = '';
    messageContainer.className = 'message';
    messageContainer.style.display = 'none';
  }
});