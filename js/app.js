document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://script.google.com/macros/s/AKfycbzm9d1lbPkS7_kCIClR5EjDTsLa2pZPfiK6SgE6_mpMJ071pQ8gJKnCW2Kl9qQ6F1KL/exec";

  const form = document.querySelector('#participation-form');
  const messageContainer = document.querySelector('#form-message');
  const submitBtn = form.querySelector('button[type="submit"]');
  const localSelect = document.querySelector('#localSelect');

  const localDisplayElements = document.querySelectorAll('.local-name');
  const localCards = document.querySelectorAll('.local-card');

  const heroLogo = document.querySelector('#heroLogo');
  const heroTapa = document.querySelector('#heroTapa');
  const flyerImage = document.querySelector('#flyerImage');
  const tapaName = document.querySelector('#tapaName');
  const tapaDescription = document.querySelector('#tapaDescription');

  const localData = {
    belcebu: {
      displayName: 'BELCEBÚ',
      logo: 'assets/logos/logo-belcebu.png',
      tapa: 'assets/tapas/tapa-belcebu.jpg',
      flyer: 'assets/flyers/flyer-belcebu.jpg',
      tapaName: 'Donut relleno de Pulled Pork',
      tapaDescription: 'Donut relleno de pulled pork, cebolla encurtida, salsa cheddar y jalapeños.'
    },
    pecat: {
      displayName: 'EL PECAT',
      logo: 'assets/logos/logo-pecat.png',
      tapa: 'assets/tapas/tapa-pecat.jpg',
      flyer: 'assets/flyers/flyer-pecat.jpg',
      tapaName: 'Mini burger de sepia',
      tapaDescription: 'Mini burger de sepia con cebolla caramelizada, mezclum y salsa de la casa.'
    }
  };

  function getLocalData(value) {
    return localData[value] || localData.belcebu;
  }

  function updateLocalVisuals(value) {
    const local = value || 'belcebu';
    const data = getLocalData(local);

    localDisplayElements.forEach(el => {
      el.textContent = data.displayName;
    });

    localCards.forEach(card => {
      card.classList.toggle('active', card.dataset.local === local);
    });

    if (heroLogo) {
      heroLogo.src = data.logo;
      heroLogo.alt = data.displayName;
    }

    if (heroTapa) {
      heroTapa.src = data.tapa;
      heroTapa.alt = data.tapaName;
    }

    if (flyerImage) {
      flyerImage.src = data.flyer;
      flyerImage.alt = `Flyer ${data.displayName}`;
    }

    if (tapaName) {
      tapaName.textContent = data.tapaName;
    }

    if (tapaDescription) {
      tapaDescription.textContent = data.tapaDescription;
    }

    if (localSelect && localSelect.value !== local) {
      localSelect.value = local;
    }
  }

  localSelect.addEventListener('change', () => {
    updateLocalVisuals(localSelect.value || 'belcebu');
  });

  localCards.forEach(card => {
    card.addEventListener('click', () => {
      updateLocalVisuals(card.dataset.local);
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
      updateLocalVisuals('belcebu');

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

  updateLocalVisuals('belcebu');
});