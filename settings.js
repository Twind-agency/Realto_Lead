const CLIENT_ID = "realto";
const CLIENT_NAME = "Realto Lead Desk";
const STORAGE_KEY = `leaddesk-${CLIENT_ID}-state-v1`;
const SETTINGS_KEY = `leaddesk-${CLIENT_ID}-settings-v1`;

const defaultStatuses = [
  "Nuovo",
  "Da contattare",
  "Contattato",
  "Fissato Colloquio",
  "Non interessato",
  "Chiuso",
];

const defaultDynamicFields = [
  { key: "Attivita attuale", label: "Attivita attuale" },
  { key: "Iscritto RUI", label: "Iscritto RUI" },
  { key: "Portafoglio clienti", label: "Portafoglio clienti" },
  { key: "Esperienza (anni)", label: "Esperienza (anni)" },
  { key: "Tipo collaborazione", label: "Tipo collaborazione" },
  { key: "Perche interessato", label: "Perche ti interessa il Progetto Realto" },
];

const legacyFirstTemplate = "Ciao {{nome}}, ti contatto per la richiesta che hai inviato su {{campagna}}. Quando ti sarebbe comodo sentirci?";
const defaultFirstTemplate = `Ciao {{nome}}, ti contatto per la richiesta che hai inviato tramite {{campagna}}. Quando ti sarebbe comodo sentirci?`;
const legacyFollowUpTemplate = "Ciao {{nome}}, ti riscrivo per sapere se hai avuto modo di valutare la nostra proposta. Rimango a disposizione.";
const defaultFollowUpTemplate = `Ciao {{nome}}, ti riscrivo per sapere se hai avuto modo di valutare la nostra proposta. Rimango a disposizione.`;
const legacyLastCallTemplate = "Ciao {{nome}}, ultimo avviso: non vorrei farti perdere l'occasione legata a {{campagna}}. Fammi sapere se sei ancora interessato, altrimenti chiudo la pratica.";
const defaultLastCallTemplate = `Ciao {{nome}}, ultimo promemoria per la richiesta arrivata da {{campagna}}. Fammi sapere se sei ancora interessato, altrimenti archivio la pratica.`;
const defaultPostRegistrationTemplate = `Ciao {{nome}}, ti confermo che la registrazione e' stata ricevuta correttamente. Se hai bisogno di supporto o vuoi aggiornare qualche informazione, siamo a disposizione.`;

const els = {
  endpointInput: document.querySelector("#endpointInput"),
  firstMessageTemplate: document.querySelector("#firstMessageTemplate"),
  followUpMessageTemplate: document.querySelector("#followUpMessageTemplate"),
  lastCallMessageTemplate: document.querySelector("#lastCallMessageTemplate"),
  postRegistrationMessageTemplate: document.querySelector("#postRegistrationMessageTemplate"),
  statusNames: document.querySelector("#statusNames"),
  dynamicFields: document.querySelector("#dynamicFields"),
  detectFieldsBtn: document.querySelector("#detectFieldsBtn"),
  detectNotice: document.querySelector("#detectNotice"),
  shareLinkInput: document.querySelector("#shareLinkInput"),
  copyShareLinkBtn: document.querySelector("#copyShareLinkBtn"),
  shareNotice: document.querySelector("#shareNotice"),
  settingsForm: document.querySelector("#settingsForm"),
  settingsNotice: document.querySelector("#settingsNotice"),
  syncDot: document.querySelector("#syncDot"),
  syncLabel: document.querySelector("#syncLabel"),
  syncHelp: document.querySelector("#syncHelp"),
};

let settings = loadSettings();

function loadSettings() {
  const defaults = {
    endpoint: "",
    firstTemplate: defaultFirstTemplate,
    followUpTemplate: defaultFollowUpTemplate,
    lastCallTemplate: defaultLastCallTemplate,
    postRegistrationTemplate: defaultPostRegistrationTemplate,
    statuses: defaultStatuses,
    dynamicFields: defaultDynamicFields,
  };
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return defaults;

  try {
    const parsed = JSON.parse(saved);
    return {
      ...defaults,
      ...parsed,
      firstTemplate: normalizeFirstTemplate(parsed.firstTemplate || parsed.template),
      followUpTemplate: normalizeFollowUpTemplate(parsed.followUpTemplate),
      lastCallTemplate: normalizeLastCallTemplate(parsed.lastCallTemplate),
      postRegistrationTemplate: normalizePostRegistrationTemplate(parsed.postRegistrationTemplate),
      statuses: defaultStatuses,
      dynamicFields: normalizeDynamicFields(parsed.dynamicFields, defaultDynamicFields),
    };
  } catch {
    return defaults;
  }
}

function normalizeFirstTemplate(value) {
  const template = String(value || "").trim();
  return !template || template === legacyFirstTemplate ? defaultFirstTemplate : template;
}

function normalizeFollowUpTemplate(value) {
  const template = String(value || "").trim();
  return !template || template === legacyFollowUpTemplate ? defaultFollowUpTemplate : template;
}

function normalizeLastCallTemplate(value) {
  const template = String(value || "").trim();
  return !template || template === legacyLastCallTemplate ? defaultLastCallTemplate : template;
}

function normalizePostRegistrationTemplate(value) {
  const template = String(value || "").trim();
  return template || defaultPostRegistrationTemplate;
}

function normalizeDynamicFields(value, fallback = []) {
  if (Array.isArray(value)) {
    const fields = value
      .map((field) => ({
        key: String(field.key || "").trim(),
        label: String(field.label || field.key || "").trim(),
      }))
      .filter((field) => field.key);
    return fields.length ? fields : fallback;
  }

  const fields = String(value || "")
    .split(/\n/)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      return { key: parts[0] || "", label: parts[1] || parts[0] || "" };
    })
    .filter((field) => field.key);
  return fields.length ? fields : fallback;
}

function dynamicFieldsToText(fields) {
  return normalizeDynamicFields(fields)
    .map((field) => `${field.key} | ${field.label}`)
    .join("\n");
}

function normalizeStatuses(value) {
  const statuses = Array.isArray(value) ? value : String(value || "").split(/\n|,/);
  const cleaned = statuses.map((status) => status.trim()).filter(Boolean);
  return cleaned.length ? cleaned : defaultStatuses;
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { leads: [] };
  try {
    const parsed = JSON.parse(saved);
    return { leads: Array.isArray(parsed.leads) ? parsed.leads : [] };
  } catch {
    return { leads: [] };
  }
}

function render() {
  const connected = Boolean(settings.endpoint);
  els.endpointInput.value = settings.endpoint;
  els.firstMessageTemplate.value = settings.firstTemplate;
  els.followUpMessageTemplate.value = settings.followUpTemplate;
  els.lastCallMessageTemplate.value = settings.lastCallTemplate;
  els.postRegistrationMessageTemplate.value = settings.postRegistrationTemplate;
  els.statusNames.value = settings.statuses.join("\n");
  els.dynamicFields.value = dynamicFieldsToText(settings.dynamicFields);
  els.syncDot.classList.toggle("online", connected);
  els.syncLabel.textContent = connected ? "Google Sheet" : "Locale";
  els.syncHelp.textContent = connected ? "Dashboard in sync automatico" : "Configura l'endpoint Apps Script";
  els.shareLinkInput.value = connected ? buildShareLink(settings.endpoint) : "";
}

function buildShareLink(endpoint) {
  const url = new URL("./index.html", window.location.href);
  url.searchParams.set("endpoint", endpoint);
  return url.toString();
}

els.settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  settings = {
    endpoint: els.endpointInput.value.trim(),
    firstTemplate: els.firstMessageTemplate.value.trim() || defaultFirstTemplate,
    followUpTemplate: els.followUpMessageTemplate.value.trim() || defaultFollowUpTemplate,
    lastCallTemplate: els.lastCallMessageTemplate.value.trim() || defaultLastCallTemplate,
    postRegistrationTemplate: els.postRegistrationMessageTemplate.value.trim() || defaultPostRegistrationTemplate,
    statuses: defaultStatuses,
    dynamicFields: normalizeDynamicFields(els.dynamicFields.value),
  };

  const state = loadState();
  state.leads = state.leads.map((lead) => ({
    ...lead,
    status: settings.statuses.includes(lead.status) ? lead.status : settings.statuses[0],
  }));

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  els.settingsNotice.textContent = "Configurazione salvata";
  await saveConfigToSheet(settings);
  render();
});

async function saveConfigToSheet(config) {
  if (!config.endpoint) return;

  els.settingsNotice.textContent = "Salvo anche su Google Sheet...";
  try {
    const payload = JSON.stringify({ config });
    const params = new URLSearchParams({ action: "saveConfig", payload });
    const response = await fetch(`${config.endpoint}?${params.toString()}`);
    const result = await response.json();
    els.settingsNotice.textContent = result.ok ? "Configurazione salvata su Google Sheet" : "Salvata localmente, Sheet non aggiornato";
  } catch {
    els.settingsNotice.textContent = "Salvata localmente, Sheet non aggiornato";
  }
}

els.detectFieldsBtn.addEventListener("click", async () => {
  const endpoint = els.endpointInput.value.trim();
  if (!endpoint) {
    els.detectNotice.textContent = "Inserisci prima l'endpoint";
    return;
  }

  els.detectNotice.textContent = "Rilevo...";
  try {
    const response = await fetch(`${endpoint}?action=listLeads`);
    const data = await response.json();
    const lead = Array.isArray(data.leads) ? data.leads[0] : null;
    const raw = lead && lead._raw ? lead._raw : {};
    const excluded = new Set([
      "id",
      "lead_id",
      "lead id",
      "leadid",
      "createdat",
      "created_time",
      "created time",
      "timestamp",
      "name",
      "full_name",
      "full name",
      "nome",
      "phone",
      "phone_number",
      "phone number",
      "telefono",
      "email",
      "email_address",
      "campaign",
      "campaign_name",
      "campaign name",
      "campagna",
      "source",
      "platform",
      "city",
      "citta",
      "status",
      "stato",
      "notes",
      "note",
      "updatedat",
      "updated_at",
      "whatsappcount",
      "whatsapp_count",
    ]);
    const detected = Object.keys(raw)
      .filter((key) => !excluded.has(key.trim().toLowerCase()))
      .map((key) => ({ key, label: humanizeField(key) }));

    settings.dynamicFields = detected;
    els.dynamicFields.value = dynamicFieldsToText(detected);
    els.detectNotice.textContent = detected.length ? `${detected.length} campi trovati` : "Nessun campo extra trovato";
  } catch {
    els.detectNotice.textContent = "Rilevamento non riuscito";
  }
});

els.copyShareLinkBtn.addEventListener("click", async () => {
  const endpoint = els.endpointInput.value.trim() || settings.endpoint;
  if (!endpoint) {
    els.shareNotice.textContent = "Inserisci e salva prima l'endpoint";
    return;
  }

  const link = buildShareLink(endpoint);
  els.shareLinkInput.value = link;

  try {
    await navigator.clipboard.writeText(link);
    els.shareNotice.textContent = "Link copiato";
  } catch {
    els.shareLinkInput.select();
    els.shareNotice.textContent = "Link pronto da copiare";
  }
});

function humanizeField(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

render();
