const SHEET_NAME = 'Participaciones';
const ALLOWED_LOCALS = ['belcebu', 'pecat'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const result = registerEntry_(data);
    return json_(result);
  } catch (err) {
    return json_({ ok: false, message: 'Error interno al registrar la participación.' });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Belcebú Promos API activa.' });
}

function registerEntry_(data) {
  const now = new Date();
  const local = clean_(data.local).toLowerCase();
  const name = clean_(data.name);
  const phone = clean_(data.phone);
  const email = clean_(data.email).toLowerCase();
  const ticket = clean_(data.ticket).toUpperCase();
  const acceptRules = data.acceptRules === true;
  const acceptPrivacy = data.acceptPrivacy === true;
  const acceptMarketing = data.acceptMarketing === true;
  const honeypot = clean_(data.website);

  if (honeypot) return { ok: false, message: 'No se ha podido registrar la participación.' };
  if (!ALLOWED_LOCALS.includes(local)) return { ok: false, message: 'Local no válido.' };
  if (!name || !phone || !email || !ticket) return { ok: false, message: 'Faltan campos obligatorios.' };
  if (!isValidEmail_(email)) return { ok: false, message: 'Email no válido.' };
  if (!acceptRules || !acceptPrivacy) return { ok: false, message: 'Debes aceptar las bases legales y la política de privacidad.' };

  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const ticketKey = `${local}::${ticket}`;
  let duplicate = false;

  for (let i = 1; i < values.length; i++) {
    const existingLocal = String(values[i][1] || '').toLowerCase();
    const existingTicket = String(values[i][5] || '').toUpperCase();
    if (`${existingLocal}::${existingTicket}` === ticketKey) {
      duplicate = true;
      break;
    }
  }

  const valid = !duplicate;
  sheet.appendRow([
    now,
    local,
    name,
    phone,
    email,
    ticket,
    acceptRules ? 'SI' : 'NO',
    acceptPrivacy ? 'SI' : 'NO',
    acceptMarketing ? 'SI' : 'NO',
    duplicate ? 'SI' : 'NO',
    valid ? 'SI' : 'NO',
    Session.getScriptTimeZone()
  ]);

  if (duplicate) {
    return { ok: false, message: 'Este ticket ya ha sido registrado. Solo cuenta la primera participación.' };
  }

  return { ok: true, message: 'Participación registrada correctamente. ¡Suerte!' };
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'timestamp',
      'local',
      'nombre',
      'telefono',
      'email',
      'ticket',
      'acepta_bases',
      'acepta_privacidad',
      'acepta_marketing',
      'duplicado',
      'valido',
      'timezone'
    ]);
  }
  return sheet;
}

function clean_(value) {
  return String(value || '').trim();
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
