/**
 * ui-karte
 * -----------------------------
 * Frei konfigurierbare Home-Assistant-Dashboard-Karte: ein Canvas fester
 * Höhe, auf dem sich beliebig viele Elemente frei mit der Maus (oder per
 * Finger) positionieren lassen - siehe Editor-Abschnitt unten. Es gibt drei
 * Elementtypen:
 *
 * - "text": frei formatierbarer Text.
 * - "sensor": ein einzelner Sensor mit Icon, Name und Zustand/Attribut.
 * - "list": eine Gruppe von Sensoren als Zeilen-Liste, selbst wieder frei
 *   auf der Canvas positionierbar - siehe "Sensoren in dieser Liste" im
 *   Editor. Ersetzt das frühere eigenständige Listen-Layout dieser Karte
 *   (siehe Migration weiter unten).
 *
 * Bei "sensor"- und "list"-Elementen wird das Icon jedes Sensors, genau wie
 * bei der fritzbox-anrufe-card (color_icon_* / color_row_icon dort),
 * abhängig vom aktuellen Wert eingefärbt. Anders als dort ist die
 * Wert->Farbe-Zuordnung hier aber nicht auf ein festes Set bekannter
 * Zustände (eingehend/ausgehend/...) beschränkt, sondern pro Sensor frei im
 * Editor definierbar - siehe "colors" im Konfigurationsschema unten.
 *
 * Angezeigter/abgeglichener Wert (per Sensor, "attribute"): standardmäßig
 * leer, dann zählt der Hauptzustand (state.state). Wird stattdessen ein
 * Attributname hinterlegt (im Editor per Dropdown aus den aktuell
 * gemeldeten Attributen des gewählten Sensors auswählbar, oder frei
 * eintippbar), wird stattdessen state.attributes[attribute] anzeigt UND
 * für den Farbabgleich herangezogen.
 *
 * Grafischer, WYSIWYG-artiger Editor (getConfigElement):
 * - Allgemeine Darstellungsoptionen (Titel, Icon/Zustand/Einheit ein-/
 *   ausblenden) über ein Standard-<ha-form>.
 * - Canvas-Einstellungen (Höhe, Hintergrundfarbe/-bild).
 * - Elemente (Text/Sensor/Liste) per <ha-entity-picker>/Button hinzufügen,
 *   entfernen, umsortieren und auf einer eigenen, im Editor eingebetteten
 *   Canvas-Vorschau direkt mit der Maus/dem Finger verschieben (Pointer
 *   Events, siehe _attachDrag()) - jede Bewegung schreibt die neue Position
 *   sofort in die Konfiguration, wodurch sich auch die von Home Assistant
 *   selbst über dem Editor angezeigte Live-Vorschau der eigentlichen Karte
 *   in Echtzeit mitbewegt. X/Y lassen sich ergänzend auch als Zahl
 *   eingeben, für pixelgenaues Justieren ohne Maus.
 * - Sobald ein Sensor hinzugefügt wird, klappt direkt dessen eigener
 *   Farb-Abschnitt auf: dort lassen sich beliebig viele Wert->Farbe-
 *   Zuordnungen anlegen, jeweils per Dropdown aus plausiblen Werten (aktuell
 *   gemeldeter Wert, typische Zustände der Entity-Domäne) oder frei über
 *   "Eigener Wert ..." eingetippt, dazu ein grafischer Farbwähler (natives
 *   <input type="color">, wie im Farben-Bereich der fritzbox-anrufe-card).
 *   Ein "Aktuellen Zustand übernehmen"-Knopf legt aus dem gerade live
 *   gemeldeten Wert direkt eine neue Zeile an.
 * - Weil Home Assistant beim Bearbeiten einer Karte automatisch eine Live-
 *   Vorschau der Karte selbst über dem Editor anzeigt, wirkt sich jede
 *   Änderung hier sofort sichtbar aus - das ist der WYSIWYG-Effekt, den
 *   dieses Projekt vorsieht, und kommt größtenteils "kostenlos" von Home
 *   Assistants eigenem Editor-Dialog. Die Drag-Canvas im Editor selbst
 *   (siehe oben) ist die einzige Stelle, an der diese Karte dafür
 *   zusätzlich selbst eine Mini-Vorschau mitbaut, weil <ha-form> keinen
 *   Selector-Typ für "Position per Maus ziehen" mitbringt.
 *
 * Wert->Farbe-Zuordnung (per Sensor, "colors"): eine Liste aus
 * { state, color }. Der Rohwert (Hauptzustand oder gewähltes Attribut) wird
 * exakt (ohne Groß-/Kleinschreibung, getrimmt) mit dem hinterlegten
 * "state"-Wert verglichen - die erste Übereinstimmung gewinnt. Trifft keine
 * Regel zu, greift "default_color" (falls gesetzt), sonst bleibt das Icon
 * in der vom aktuellen Home-Assistant-Theme vorgegebenen Standardfarbe.
 * Bewusst eine einfache exakte Zuordnung (keine Zahlen-Schwellenwerte/
 * Templates) - siehe Projektentscheidung "Einfache Zustand->Farbe-
 * Zuordnung".
 *
 * Migration von älteren Versionen dieser Karte: v1/v2 kannten noch ein
 * eigenständiges Listen-Layout ("layout: list" mit top-level "entities").
 * Eine so aufgebaute, gespeicherte Konfiguration wird beim Laden
 * automatisch und verlustfrei in ein neues "list"-Element auf der Canvas
 * umgewandelt (inkl. grober Canvas-Höhen-Anpassung) - siehe
 * withCardDefaults(). Sobald im Editor irgendetwas geändert wird, wird die
 * neue Struktur dauerhaft gespeichert.
 *
 * Konfigurationsschema (YAML-Äquivalent, komplett auch grafisch editierbar):
 *
 *   type: custom:ui-karte
 *   title: "Mein Dashboard-Ausschnitt"
 *   show_icon: true
 *   show_state: true
 *   show_unit: true
 *   canvas:
 *     height: 300               # Pixel
 *     background_color: ""
 *     background_image: ""
 *   elements:
 *     - type: sensor
 *       entity: sensor.aussentemperatur
 *       attribute: ""           # leer = Hauptzustand, sonst z.B. "battery_level"
 *       x: 30                  # Prozent, Mittelpunkt des Elements
 *       y: 50
 *       colors: []
 *     - type: text
 *       text: "Willkommen!"
 *       x: 70
 *       y: 20
 *       font_size: 20
 *       color: ""
 *       bold: true
 *       align: center
 *     - type: list
 *       x: 50
 *       y: 70
 *       width: 60               # Prozent Canvas-Breite
 *       dense: false
 *       entities:
 *         - entity: binary_sensor.haustuer
 *           name: "Haustür"
 *           icon: "mdi:door"
 *           attribute: ""
 *           default_color: ""
 *           colors:
 *             - state: "on"
 *               color: "#db4437"
 *             - state: "off"
 *               color: "#4caf50"
 *
 * Nicht an echter Home-Assistant-Hardware/jeder Frontend-Version getestet
 * (dieses Projekt wurde ohne laufende Home-Assistant-Instanz entwickelt) -
 * bei Auffälligkeiten (z. B. <ha-entity-picker>/<ha-form> verhalten sich in
 * einer bestimmten Frontend-Version anders) bitte prüfen, ob eine neuere
 * Home-Assistant-Version das behebt.
 */

// --- Hilfsfunktionen ---------------------------------------------------

function escapeHtml(value) {
  return String(value === undefined || value === null ? "" : value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c])
  );
}

// Gleiche defensive Allowlist wie bei der fritzbox-anrufe-card: Farbwerte
// landen als CSS-Custom-Property/Inline-Style im gerenderten HTML (via
// innerHTML) - erlaubt Hex, rgb()/rgba()/hsl()/hsla(), CSS-Variablen
// (var(--name, fallback)) und Farbnamen, verbietet alles, was aus der
// Style-Deklaration ausbrechen könnte. Ein ungültiger Wert wird wie "nicht
// gesetzt" behandelt statt einen Fehler zu werfen, da das bei jedem Render
// läuft.
const SAFE_COLOR_RE = /^[a-zA-Z0-9#(),.%\-\s]+$/;

function sanitizeColor(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (!SAFE_COLOR_RE.test(trimmed)) {
    // eslint-disable-next-line no-console
    console.warn(
      "ui-karte: ungültiger Farbwert ignoriert (nur Hex/rgb()/hsl()/var()/CSS-Farbnamen erlaubt):",
      value
    );
    return "";
  }
  return trimmed;
}

// Gleiche Idee wie SAFE_COLOR_RE, für die Canvas-Hintergrundbild-URL
// (landet ebenfalls über innerHTML in einem style-Attribut, siehe
// _renderFreeformCanvas()). Erlaubt gängige URL-Zeichen, verbietet
// Anführungszeichen/spitze Klammern/Backslash, über die sich die
// style-Deklaration bzw. das umgebende HTML-Attribut verlassen ließe.
const SAFE_URL_RE = /^[a-zA-Z0-9:/?#[\]@!$&'()*+,;=._~%\-]+$/;

function sanitizeImageUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (!SAFE_URL_RE.test(trimmed)) {
    // eslint-disable-next-line no-console
    console.warn("ui-karte: ungültige Bild-URL ignoriert:", value);
    return "";
  }
  return trimmed;
}

function normalizeStateKey(value) {
  return String(value === undefined || value === null ? "" : value)
    .trim()
    .toLowerCase();
}

function clampNumber(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

// Grobe deutsche Übersetzung häufiger, technischer Rohzustände für die
// Anzeige (NICHT für den Farb-Abgleich - dort zählt immer der Rohwert,
// siehe Moduldoku). Unbekannte Werte werden unverändert angezeigt.
const STATE_DISPLAY_LABELS = {
  on: "An",
  off: "Aus",
  open: "Offen",
  closed: "Geschlossen",
  opening: "Öffnet",
  closing: "Schließt",
  locked: "Verriegelt",
  unlocked: "Entriegelt",
  home: "Zuhause",
  not_home: "Abwesend",
  unavailable: "Nicht verfügbar",
  unknown: "Unbekannt",
  idle: "Inaktiv",
  playing: "Spielt",
  paused: "Pausiert",
  detected: "Erkannt",
  clear: "Frei",
  wet: "Nass",
  dry: "Trocken",
  problem: "Problem",
  ok: "OK",
  charging: "Lädt",
  not_charging: "Lädt nicht",
  full: "Voll",
  heat: "Heizen",
  cool: "Kühlen",
  auto: "Automatik",
  standby: "Standby",
  true: "Ja",
  false: "Nein",
};

// Grobe Icon-Vorgabe je Domäne, nur als letzter Rückfall, falls weder ein
// im Editor gesetztes Icon noch state.attributes.icon (von Home Assistant
// meist über den device_class ohnehin gesetzt) vorhanden ist.
const DOMAIN_DEFAULT_ICONS = {
  binary_sensor: "mdi:checkbox-blank-circle-outline",
  sensor: "mdi:eye-outline",
  switch: "mdi:toggle-switch-outline",
  light: "mdi:lightbulb-outline",
  lock: "mdi:lock-outline",
  cover: "mdi:window-shutter",
  climate: "mdi:thermostat",
  fan: "mdi:fan",
  media_player: "mdi:cast",
  person: "mdi:account-outline",
  device_tracker: "mdi:map-marker-outline",
  input_boolean: "mdi:toggle-switch-outline",
  automation: "mdi:robot-outline",
  script: "mdi:script-text-outline",
};

function domainOf(entityId) {
  return String(entityId || "").split(".")[0] || "";
}

function defaultIconForEntity(entityId, stateObj) {
  if (stateObj && stateObj.attributes && stateObj.attributes.icon) {
    return stateObj.attributes.icon;
  }
  return DOMAIN_DEFAULT_ICONS[domainOf(entityId)] || "mdi:help-circle-outline";
}

// Liefert den für Anzeige UND Farbabgleich relevanten Rohwert eines
// Sensors: ohne gesetztes "attribute" der Hauptzustand (state.state), sonst
// der Wert des gleichnamigen Eintrags in state.attributes. undefined, wenn
// die Entity nicht gefunden wird oder das gewählte Attribut nicht
// (mehr) existiert.
function getRawValue(entityConfig, stateObj) {
  if (!stateObj) return undefined;
  const attribute = entityConfig && entityConfig.attribute;
  if (!attribute) return stateObj.state;
  return stateObj.attributes ? stateObj.attributes[attribute] : undefined;
}

// Formatiert einen Rohwert (siehe getRawValue()) für die Anzeige. Beim
// Hauptzustand gilt weiterhin die deutsche Übersetzungstabelle plus
// optionaler Einheitenanhang; bei Attributwerten (die praktisch jeden
// JS-Typ annehmen können) eine einfache, robuste Textdarstellung.
function formatDisplayValue(rawValue, attribute, stateObj, showUnit) {
  if (rawValue === undefined || rawValue === null) return "";
  if (!attribute) {
    const label = STATE_DISPLAY_LABELS[normalizeStateKey(rawValue)];
    if (label) return label;
    const unit = showUnit && stateObj && stateObj.attributes ? stateObj.attributes.unit_of_measurement : "";
    return unit ? `${rawValue} ${unit}` : String(rawValue);
  }
  if (typeof rawValue === "boolean") return rawValue ? "Ja" : "Nein";
  if (Array.isArray(rawValue)) return rawValue.join(", ");
  if (typeof rawValue === "object") {
    try {
      return JSON.stringify(rawValue);
    } catch (e) {
      return String(rawValue);
    }
  }
  return String(rawValue);
}

// --- Konfigurations-Defaults --------------------------------------------

const CARD_DEFAULTS = {
  title: "",
  show_icon: true,
  show_state: true,
  show_unit: true,
  canvas: { height: 300, background_color: "", background_image: "" },
  elements: [],
};

// Gemeinsame Form eines einzelnen Sensors, egal ob als eigenständiges
// "sensor"-Element auf der Canvas oder als Zeile innerhalb eines
// "list"-Elements - siehe withEntityItemDefaults().
const ENTITY_ITEM_DEFAULTS = {
  entity: "",
  name: "",
  icon: "",
  attribute: "",
  default_color: "",
  colors: [],
};

function withEntityItemDefaults(entityConfig) {
  const merged = { ...ENTITY_ITEM_DEFAULTS, ...(entityConfig || {}) };
  merged.attribute = String(merged.attribute || "");
  merged.colors = Array.isArray(merged.colors)
    ? merged.colors.map((rule) => ({ state: String((rule && rule.state) || ""), color: String((rule && rule.color) || "") }))
    : [];
  return merged;
}

const CANVAS_DEFAULTS = { height: 300, background_color: "", background_image: "" };

function withCanvasDefaults(canvasConfig) {
  const merged = { ...CANVAS_DEFAULTS, ...(canvasConfig || {}) };
  merged.height = clampNumber(merged.height, 80, 4000, CANVAS_DEFAULTS.height);
  return merged;
}

// Gemeinsame Felder aller Canvas-Elemente ("type" entscheidet, welches der
// folgenden Default-Sets zusätzlich gemischt wird). x/y sind Prozentwerte
// (0-100) und bezeichnen den MITTELPUNKT des Elements (siehe CSS
// transform: translate(-50%, -50%) in CARD_STYLES) - das entspricht
// intuitiv dem Punkt, an dem man beim Ziehen mit der Maus "zupackt".
const ELEMENT_BASE_DEFAULTS = { type: "sensor", x: 50, y: 50 };

// Ein eigenständiges Sensor-Element hat exakt dieselbe Form wie ein
// Sensor-Eintrag innerhalb eines "list"-Elements.
const SENSOR_ELEMENT_DEFAULTS = ENTITY_ITEM_DEFAULTS;

const TEXT_ELEMENT_DEFAULTS = {
  text: "Text",
  font_size: 16,
  color: "",
  bold: false,
  align: "center",
};

const LIST_ELEMENT_DEFAULTS = {
  width: 60,
  dense: false,
  entities: [],
};

function withElementDefaults(elementConfig) {
  const base = { ...ELEMENT_BASE_DEFAULTS, ...(elementConfig || {}) };
  base.type = ["text", "list"].includes(base.type) ? base.type : "sensor";
  base.x = clampNumber(base.x, 0, 100, 50);
  base.y = clampNumber(base.y, 0, 100, 50);

  if (base.type === "text") {
    const merged = { ...TEXT_ELEMENT_DEFAULTS, ...base };
    merged.font_size = clampNumber(merged.font_size, 6, 200, TEXT_ELEMENT_DEFAULTS.font_size);
    merged.align = ["left", "center", "right"].includes(merged.align) ? merged.align : "center";
    merged.bold = !!merged.bold;
    return merged;
  }

  if (base.type === "list") {
    const merged = { ...LIST_ELEMENT_DEFAULTS, ...base };
    merged.width = clampNumber(merged.width, 10, 100, LIST_ELEMENT_DEFAULTS.width);
    merged.dense = !!merged.dense;
    merged.entities = Array.isArray(merged.entities) ? merged.entities.map(withEntityItemDefaults) : [];
    return merged;
  }

  // sensor
  const merged = { ...SENSOR_ELEMENT_DEFAULTS, ...base };
  merged.attribute = String(merged.attribute || "");
  merged.colors = Array.isArray(merged.colors)
    ? merged.colors.map((rule) => ({ state: String((rule && rule.state) || ""), color: String((rule && rule.color) || "") }))
    : [];
  return merged;
}

function withCardDefaults(config) {
  const raw = config || {};
  const merged = { ...CARD_DEFAULTS, ...raw };
  delete merged.layout;
  delete merged.entities;
  delete merged.dense;
  merged.canvas = withCanvasDefaults(raw.canvas);
  merged.elements = Array.isArray(raw.elements) ? raw.elements.map(withElementDefaults) : [];

  // Migration: alte Konfigurationen (v1/v2 dieser Karte) kannten noch ein
  // eigenständiges Listen-Layout mit top-level `entities`/`dense`/`layout`.
  // Für Rückwärtskompatibilität wird so eine alte Konfiguration beim Laden
  // automatisch verlustfrei in ein neues "list"-Element auf der Canvas
  // umgewandelt (inkl. Höhen-Anpassung, damit alle Zeilen sichtbar
  // bleiben). Sobald im Editor etwas geändert wird, wird die neue Struktur
  // über config-changed dauerhaft gespeichert.
  const hasLegacyEntities = Array.isArray(raw.entities) && raw.entities.length > 0;
  if (hasLegacyEntities || raw.layout === "list") {
    const legacyEntities = Array.isArray(raw.entities) ? raw.entities.map(withEntityItemDefaults) : [];
    const listElement = withElementDefaults({
      type: "list",
      x: 50,
      y: 50,
      width: 90,
      dense: !!raw.dense,
      entities: legacyEntities,
    });
    const rowHeight = listElement.dense ? 34 : 56;
    const neededHeight = Math.max(merged.canvas.height, legacyEntities.length * rowHeight + 24);
    merged.canvas = { ...merged.canvas, height: clampNumber(neededHeight, 80, 4000, merged.canvas.height) };
    merged.elements = [listElement, ...merged.elements];
  }

  return merged;
}

// Ermittelt die Icon-Farbe für einen Sensor (eigenständiges Element ODER
// Zeile innerhalb eines "list"-Elements - beide haben dieselbe Form:
// colors[]/default_color) anhand der konfigurierten Wert->Farbe-Liste
// (erste exakte Übereinstimmung gewinnt, Vergleich getrimmt/ohne
// Groß-Kleinschreibung), sonst default_color, sonst "" (= Theme-
// Standardfarbe, kein Inline-Style gesetzt). rawValue kommt aus
// getRawValue() - respektiert also ein evtl. gesetztes "attribute".
function resolveEntityColor(entityConfig, rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === "") return "";
  const currentKey = normalizeStateKey(rawValue);
  const rule = (entityConfig.colors || []).find((r) => normalizeStateKey(r.state) === currentKey && currentKey !== "");
  if (rule) {
    const sanitized = sanitizeColor(rule.color);
    if (sanitized) return sanitized;
  }
  return sanitizeColor(entityConfig.default_color);
}

// --- Karte ---------------------------------------------------------------

const CARD_STYLES = `
  ha-card { overflow: hidden; }
  .mdk-empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--secondary-text-color, #727272);
  }
  .mdk-title {
    padding: 12px 16px 4px;
    font-size: 1.2em;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }
  .mdk-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
  }
  .mdk-row.dense { padding: 6px 16px; }
  .mdk-row:hover { background: var(--secondary-background-color, rgba(0, 0, 0, 0.04)); }
  .mdk-row-icon {
    flex: 0 0 auto;
    color: var(--mdk-row-icon-color, var(--state-icon-color, #44739e));
  }
  .mdk-row-icon.unavailable { color: var(--disabled-text-color, #bdbdbd); }
  .mdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .mdk-row-name {
    color: var(--primary-text-color, #212121);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mdk-row-sub {
    font-size: 0.8em;
    color: var(--secondary-text-color, #727272);
  }
  .mdk-row-state {
    flex: 0 0 auto;
    color: var(--primary-text-color, #212121);
    font-weight: 500;
    text-align: right;
  }

  /* Canvas: absolut positionierte Elemente auf einer Fläche fester Höhe -
     siehe _renderFreeformCanvas()/_renderFreeformElement(). x/y sind
     Prozentwerte, transform zentriert das Element auf seinem Ankerpunkt
     (siehe ELEMENT_BASE_DEFAULTS-Kommentar oben). */
  .mdk-canvas {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    box-sizing: border-box;
  }
  .mdk-canvas-empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    text-align: center;
    color: var(--secondary-text-color, #727272);
  }
  .mdk-element {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    max-width: 90%;
    text-align: center;
  }
  .mdk-element.clickable { cursor: pointer; }
  .mdk-element-icon { color: var(--mdk-row-icon-color, var(--state-icon-color, #44739e)); }
  .mdk-element-icon.unavailable { color: var(--disabled-text-color, #bdbdbd); }
  .mdk-element-name {
    font-size: 0.85em;
    color: var(--primary-text-color, #212121);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .mdk-element-state { font-size: 0.8em; color: var(--secondary-text-color, #727272); }
  .mdk-element-text {
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--primary-text-color, #212121);
  }

  /* "list"-Element: eine Gruppe von Sensor-Zeilen, selbst frei auf der
     Canvas positionierbar - anders als die übrigen Elementtypen linksbündig
     und über die volle konfigurierte Breite (nicht zentriert-kompakt). */
  .mdk-element.mdk-list-element {
    align-items: stretch;
    text-align: left;
    max-width: none;
  }
  .mdk-list-block {
    width: 100%;
    background: var(--card-background-color, rgba(255, 255, 255, 0.85));
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }
  .mdk-list-block .mdk-row { padding: 8px 10px; }
  .mdk-list-block .mdk-row.dense { padding: 4px 10px; }
  .mdk-list-block .mdk-empty { padding: 12px; font-size: 0.85em; }
`;

class UiKarteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("ui-karte: Ungültige Konfiguration.");
    }
    this._config = withCardDefaults(config);
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  // Grobe Größenangabe für den Lovelace-Masonry-View.
  getCardSize() {
    if (!this._config) return 1;
    const titleRow = this._config.title ? 1 : 0;
    return Math.max(1, titleRow + Math.round((this._config.canvas.height || 300) / 50));
  }

  static getConfigElement() {
    return document.createElement("ui-karte-editor");
  }

  // Vorbelegung beim erstmaligen Hinzufügen der Karte über die UI - nimmt,
  // sofern vorhanden, die ersten paar existierenden Entities als Beispiel,
  // damit die Karte nicht komplett leer startet.
  static getStubConfig(hass) {
    const entityIds = hass && hass.states ? Object.keys(hass.states).slice(0, 3) : [];
    return withCardDefaults({
      title: "Meine Sensoren",
      elements: entityIds.map((entity, i) =>
        withElementDefaults({ type: "sensor", entity, x: 20 + i * 30, y: 50, colors: [] })
      ),
    });
  }

  _rowClickHandler(entityId) {
    return (ev) => {
      ev.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("hass-more-info", {
          detail: { entityId },
          bubbles: true,
          composed: true,
        })
      );
    };
  }

  _renderRow(entityConfig, dense) {
    const stateObj = this._hass && this._hass.states ? this._hass.states[entityConfig.entity] : undefined;
    const name = entityConfig.name || (stateObj && stateObj.attributes && stateObj.attributes.friendly_name) || entityConfig.entity;

    if (!stateObj) {
      return `
        <div class="mdk-row ${dense ? "dense" : ""}" data-entity="${escapeHtml(entityConfig.entity)}">
          ${this._config.show_icon ? `<ha-icon class="mdk-row-icon unavailable" icon="mdi:help-circle-outline"></ha-icon>` : ""}
          <div class="mdk-row-main">
            <span class="mdk-row-name">${escapeHtml(name)}</span>
            <span class="mdk-row-sub">Entity nicht gefunden</span>
          </div>
        </div>
      `;
    }

    const rawValue = getRawValue(entityConfig, stateObj);
    const color = resolveEntityColor(entityConfig, rawValue);
    const icon = entityConfig.icon || defaultIconForEntity(entityConfig.entity, stateObj);
    const iconStyle = color ? ` style="color: ${escapeHtml(color)};"` : "";
    const stateText = this._config.show_state ? formatDisplayValue(rawValue, entityConfig.attribute, stateObj, this._config.show_unit) : "";

    return `
      <div class="mdk-row ${dense ? "dense" : ""}" data-entity="${escapeHtml(entityConfig.entity)}">
        ${this._config.show_icon ? `<ha-icon class="mdk-row-icon" icon="${escapeHtml(icon)}"${iconStyle}></ha-icon>` : ""}
        <div class="mdk-row-main">
          <span class="mdk-row-name">${escapeHtml(name)}</span>
        </div>
        ${stateText ? `<div class="mdk-row-state">${escapeHtml(stateText)}</div>` : ""}
      </div>
    `;
  }

  _renderListBlock(elementConfig) {
    const left = clampNumber(elementConfig.x, 0, 100, 50);
    const top = clampNumber(elementConfig.y, 0, 100, 50);
    const width = clampNumber(elementConfig.width, 10, 100, 60);
    const posStyle = `left: ${left}%; top: ${top}%; width: ${width}%;`;

    const entities = elementConfig.entities || [];
    const rows = entities.length
      ? entities.map((e) => this._renderRow(e, elementConfig.dense)).join("")
      : `<div class="mdk-empty">Keine Sensoren in dieser Liste konfiguriert.</div>`;

    return `<div class="mdk-element mdk-list-element" style="${posStyle}"><div class="mdk-list-block">${rows}</div></div>`;
  }

  _renderFreeformCanvas() {
    const canvas = this._config.canvas || CANVAS_DEFAULTS;
    const height = clampNumber(canvas.height, 80, 4000, CANVAS_DEFAULTS.height);
    const bgColor = sanitizeColor(canvas.background_color);
    const bgImage = sanitizeImageUrl(canvas.background_image);
    const styleParts = [`height: ${height}px;`];
    if (bgColor) styleParts.push(`background-color: ${bgColor};`);
    if (bgImage) styleParts.push(`background-image: url('${bgImage}');`);

    const elements = this._config.elements || [];
    const body = elements.length
      ? elements.map((el) => this._renderFreeformElement(el)).join("")
      : `<div class="mdk-canvas-empty">Keine Elemente konfiguriert. Über den Karten-Editor Text-, Sensor- oder Listen-Elemente hinzufügen und per Maus positionieren.</div>`;

    return `<div class="mdk-canvas" style="${styleParts.join(" ")}">${body}</div>`;
  }

  _renderFreeformElement(elementConfig) {
    if (elementConfig.type === "list") {
      return this._renderListBlock(elementConfig);
    }

    const left = clampNumber(elementConfig.x, 0, 100, 50);
    const top = clampNumber(elementConfig.y, 0, 100, 50);
    const posStyle = `left: ${left}%; top: ${top}%;`;

    if (elementConfig.type === "text") {
      const fontSize = clampNumber(elementConfig.font_size, 6, 200, 16);
      const color = sanitizeColor(elementConfig.color);
      const align = ["left", "center", "right"].includes(elementConfig.align) ? elementConfig.align : "center";
      const alignItemsMap = { left: "flex-start", center: "center", right: "flex-end" };
      const styleParts = [
        posStyle,
        `font-size: ${fontSize}px;`,
        `align-items: ${alignItemsMap[align]};`,
        `text-align: ${align};`,
      ];
      if (color) styleParts.push(`color: ${color};`);
      if (elementConfig.bold) styleParts.push("font-weight: 600;");
      return `<div class="mdk-element" style="${styleParts.join(" ")}"><span class="mdk-element-text">${escapeHtml(elementConfig.text || "")}</span></div>`;
    }

    // Sensor-Element
    const stateObj = elementConfig.entity && this._hass && this._hass.states ? this._hass.states[elementConfig.entity] : undefined;
    const name = elementConfig.name || (stateObj && stateObj.attributes && stateObj.attributes.friendly_name) || elementConfig.entity;
    const dataEntityAttr = elementConfig.entity ? ` data-entity="${escapeHtml(elementConfig.entity)}"` : "";

    if (!stateObj) {
      return `
        <div class="mdk-element" style="${posStyle}"${dataEntityAttr}>
          ${this._config.show_icon ? `<ha-icon class="mdk-element-icon unavailable" icon="mdi:help-circle-outline"></ha-icon>` : ""}
          <span class="mdk-element-name">${escapeHtml(name || "Kein Sensor gewählt")}</span>
        </div>
      `;
    }

    const rawValue = getRawValue(elementConfig, stateObj);
    const color = resolveEntityColor(elementConfig, rawValue);
    const icon = elementConfig.icon || defaultIconForEntity(elementConfig.entity, stateObj);
    const iconStyle = color ? ` style="color: ${escapeHtml(color)};"` : "";
    const stateText = this._config.show_state ? formatDisplayValue(rawValue, elementConfig.attribute, stateObj, this._config.show_unit) : "";

    return `
      <div class="mdk-element clickable" style="${posStyle}"${dataEntityAttr}>
        ${this._config.show_icon ? `<ha-icon class="mdk-element-icon" icon="${escapeHtml(icon)}"${iconStyle}></ha-icon>` : ""}
        <span class="mdk-element-name">${escapeHtml(name)}</span>
        ${stateText ? `<span class="mdk-element-state">${escapeHtml(stateText)}</span>` : ""}
      </div>
    `;
  }

  _render() {
    if (!this._config) return;

    const body = this._renderFreeformCanvas();

    this.shadowRoot.innerHTML = `
      <style>${CARD_STYLES}</style>
      <ha-card>
        ${this._config.title ? `<div class="mdk-title">${escapeHtml(this._config.title)}</div>` : ""}
        ${body}
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll("[data-entity]").forEach((row) => {
      row.addEventListener("click", this._rowClickHandler(row.getAttribute("data-entity")));
    });
  }
}

// --- Editor ----------------------------------------------------------
//
// Aufbau in zwei Teilen, analog zur fritzbox-anrufe-card:
// 1. Allgemeine Darstellungsoptionen (Titel, show_icon/show_state/
//    show_unit) über ein Standard-<ha-form> mit einer einzigen
//    "Darstellung"-Gruppe.
// 2. Der Canvas-Bereich - bewusst NICHT über <ha-form> gelöst (kein
//    Selector-Typ kann dort verschachtelte, dynamisch wachsende Listen mit
//    eigenem Innenleben wie einer Wert->Farbe-Zuordnung samt grafischem
//    Farbwähler ODER eine per Maus ziehbare Positions-Canvas abbilden),
//    sondern mit einfachem, direkt erzeugtem HTML: <ha-entity-picker> zur
//    Sensorauswahl, <input type="color"> plus Textfeld je Farbregel
//    (identisches Muster wie im "Farben"-Abschnitt der
//    fritzbox-anrufe-card), dazu eine Canvas-Vorschau mit ziehbaren Markern
//    (Pointer Events).
//
// Wichtiges Prinzip gegen Fokus-/Eingabeverlust: ein volles Neu-Aufbauen
// eines Abschnitts (z. B. this._rebuildElementRows()/
// this._rebuildCanvasPreview()/this._rebuildListEntityRows()) passiert
// AUSSCHLIESSLICH bei strukturellen Änderungen, die die Karte selbst über
// ihre eigenen Buttons/Drag-Geste auslöst (Element/Sensor hinzufügen/
// entfernen/verschieben) - niemals als Reaktion auf einen neuen
// `hass`-Tick (der bei jeder Zustandsänderung irgendeiner Home-Assistant-
// Entity system-weit ankommt) und niemals bei einer reinen Texteingabe/
// einem Drag-Schritt (Name/Icon/Zustand/Farbe/Position). Reine
// Werteänderungen mutieren `this._config` und feuern `config-changed`,
// ohne das DOM neu aufzubauen. Beim Ziehen eines Markers (viele
// Mausbewegungen pro Sekunde) ist das nicht nur eine Stilfrage, sondern
// notwendig: ein DOM-Rebuild pro Pixel würde den Marker unter dem
// Mauszeiger "wegreißen".

const GENERAL_EDITOR_SCHEMA = [
  { name: "title", selector: { text: {} } },
  {
    name: "",
    type: "expandable",
    title: "Darstellung",
    icon: "mdi:view-list",
    flatten: true,
    expanded: true,
    schema: [
      { name: "show_icon", selector: { boolean: {} } },
      { name: "show_state", selector: { boolean: {} } },
      { name: "show_unit", selector: { boolean: {} } },
    ],
  },
];

const GENERAL_EDITOR_LABELS = {
  title: "Titel",
  show_icon: "Icon je Sensor anzeigen",
  show_state: "Zustand je Sensor anzeigen",
  show_unit: "Einheit an Zahlenwerte anhängen",
};

function computeGeneralEditorLabel(schemaItem) {
  return GENERAL_EDITOR_LABELS[schemaItem.name] || schemaItem.name;
}

// Vorschläge für häufige Domänen, direkt beim Hinzufügen eines Sensors
// vorbelegt (bleibt jederzeit im Editor änder-/löschbar) - reine
// Komfortfunktion, damit nicht jeder binary_sensor/switch/... von Null an
// eingefärbt werden muss. Für alle anderen Domänen (allen voran "sensor",
// dessen Zustände beliebige Zahlen/Texte sein können) gibt es bewusst
// keine Vorbelegung - dort hilft der "Aktuellen Zustand übernehmen"-Knopf.
const PRESET_COLORS_BY_DOMAIN = {
  binary_sensor: [
    { state: "on", color: "#db4437" },
    { state: "off", color: "#4caf50" },
  ],
  switch: [
    { state: "on", color: "#4caf50" },
    { state: "off", color: "#9e9e9e" },
  ],
  input_boolean: [
    { state: "on", color: "#4caf50" },
    { state: "off", color: "#9e9e9e" },
  ],
  light: [
    { state: "on", color: "#ffc107" },
    { state: "off", color: "#9e9e9e" },
  ],
  lock: [
    { state: "locked", color: "#4caf50" },
    { state: "unlocked", color: "#db4437" },
  ],
  cover: [
    { state: "closed", color: "#4caf50" },
    { state: "open", color: "#ff9800" },
  ],
};

function presetColorsForEntity(entityId) {
  const preset = PRESET_COLORS_BY_DOMAIN[domainOf(entityId)];
  return preset ? preset.map((rule) => ({ ...rule })) : [];
}

// Typische Rohzustände je Domäne, NUR für die Dropdown-Vorschläge im
// "Zustand"-Kombifeld einer Farbregel (siehe buildCombobox()/
// _stateOptionsFor()) - unabhängig von PRESET_COLORS_BY_DOMAIN oben, das
// zusätzlich auch gleich eine Farbe vorschlägt.
const COMMON_STATE_OPTIONS_BY_DOMAIN = {
  binary_sensor: ["on", "off"],
  switch: ["on", "off"],
  input_boolean: ["on", "off"],
  light: ["on", "off"],
  lock: ["locked", "unlocked", "locking", "unlocking", "jammed"],
  cover: ["open", "closed", "opening", "closing"],
  climate: ["heat", "cool", "auto", "off", "dry", "fan_only"],
  fan: ["on", "off"],
  person: ["home", "not_home"],
  device_tracker: ["home", "not_home"],
  media_player: ["playing", "paused", "idle", "off"],
  automation: ["on", "off"],
};

// <input type="color"> verlangt zwingend die 6-stellige #rrggbb-Form -
// gleiche Hilfsfunktionen wie im Farben-Editor der fritzbox-anrufe-card.
const HEX_COLOR_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

function normalizeHex(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length === 3) {
    return "#" + h.split("").map((c) => c + c).join("");
  }
  return "#" + h;
}

function swatchValueFor(rawColor, fallbackHex) {
  const trimmed = String(rawColor || "").trim();
  return HEX_COLOR_RE.test(trimmed) ? normalizeHex(trimmed) : fallbackHex;
}

// Generisches Dropdown+Freitext-Kombifeld: ein <select> mit den
// übergebenen "options" plus einer letzten "Eigener Wert ..."-Option; wird
// diese gewählt (oder passt der aktuelle Wert zu keiner Option), erscheint
// stattdessen/zusätzlich ein Textfeld. Dadurch lässt sich sowohl aus
// plausiblen Vorschlägen wählen als auch jeder beliebige Wert eintippen -
// notwendig, weil sich z. B. die Zustände einer "sensor"-Domain-Entity
// (Zahlen/Freitext) nicht sinnvoll abschließend aufzählen lassen.
function buildCombobox({ options, value, customLabel, placeholder, onChange }) {
  const CUSTOM_VALUE = "__custom__";
  let currentOptions = options || [];

  const wrapper = document.createElement("div");
  wrapper.className = "mdk-combo";

  const select = document.createElement("select");
  select.className = "mdk-input mdk-combo-select";

  const customInput = document.createElement("input");
  customInput.type = "text";
  customInput.className = "mdk-input mdk-combo-custom";
  customInput.placeholder = placeholder || "";

  function populate(currentValue) {
    select.innerHTML = "";
    currentOptions.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt.value;
      o.textContent = opt.label;
      select.appendChild(o);
    });
    const customOpt = document.createElement("option");
    customOpt.value = CUSTOM_VALUE;
    customOpt.textContent = customLabel || "Eigener Wert …";
    select.appendChild(customOpt);

    const matches = currentOptions.some((o) => o.value === String(currentValue || ""));
    if (matches && currentValue !== "" && currentValue !== undefined) {
      select.value = String(currentValue);
      customInput.style.display = "none";
    } else {
      select.value = CUSTOM_VALUE;
      customInput.style.display = "";
      customInput.value = currentValue || "";
    }
  }
  populate(value);

  select.addEventListener("change", () => {
    if (select.value === CUSTOM_VALUE) {
      customInput.style.display = "";
      customInput.value = "";
      customInput.focus();
      onChange(customInput.value);
    } else {
      customInput.style.display = "none";
      onChange(select.value);
    }
  });
  customInput.addEventListener("input", () => {
    onChange(customInput.value);
  });

  wrapper.appendChild(select);
  wrapper.appendChild(customInput);

  return {
    element: wrapper,
    setOptions(newOptions, newValue) {
      currentOptions = newOptions || [];
      populate(newValue);
    },
  };
}

const EDITOR_STYLES = `
  :host { display: block; }
  .mdk-editor-heading {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 16px 0 8px;
    font-size: 1em;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }
  .mdk-editor-hint {
    font-size: 0.85em;
    color: var(--secondary-text-color, #727272);
    margin-bottom: 12px;
  }
  .mdk-entities { display: flex; flex-direction: column; gap: 8px; }
  .mdk-entities-empty {
    padding: 12px;
    border: 1px dashed var(--divider-color, #e0e0e0);
    border-radius: 8px;
    color: var(--secondary-text-color, #727272);
    font-size: 0.9em;
  }
  .mdk-entity {
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 8px;
    padding: 0 12px;
  }
  .mdk-entity-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    cursor: pointer;
    list-style: none;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }
  .mdk-entity-summary::-webkit-details-marker { display: none; }
  .mdk-entity-summary::marker { display: none; }
  .mdk-entity-chevron {
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color, #727272);
    transition: transform 0.2s ease;
  }
  .mdk-entity[open] > .mdk-entity-summary .mdk-entity-chevron { transform: rotate(90deg); }
  .mdk-entity-type-icon { --mdc-icon-size: 16px; color: var(--secondary-text-color, #727272); }
  .mdk-entity-summary-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mdk-entity-summary-actions { display: flex; align-items: center; gap: 2px; }
  .mdk-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    color: var(--secondary-text-color, #727272);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
  }
  .mdk-icon-btn:hover { background: var(--secondary-background-color, rgba(0, 0, 0, 0.06)); }
  .mdk-icon-btn:disabled { opacity: 0.35; cursor: default; }
  .mdk-icon-btn:disabled:hover { background: none; }
  .mdk-icon-btn ha-icon { --mdc-icon-size: 18px; }
  .mdk-entity-body { padding: 0 0 12px; display: flex; flex-direction: column; gap: 10px; }
  .mdk-field-row { display: flex; flex-direction: column; gap: 4px; }
  .mdk-field-row-split { flex-direction: row; gap: 12px; }
  .mdk-field { flex: 1 1 0; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .mdk-field-label { font-size: 0.8em; color: var(--secondary-text-color, #727272); }
  .mdk-input {
    padding: 8px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 6px;
    font: inherit;
    color: var(--primary-text-color, #212121);
    background: var(--card-background-color, #fff);
    box-sizing: border-box;
    width: 100%;
  }
  textarea.mdk-input { resize: vertical; min-height: 48px; }
  .mdk-checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 0.9em; color: var(--primary-text-color, #212121); }
  .mdk-bold-field { justify-content: flex-end; display: flex; }
  .mdk-combo { display: flex; flex-direction: column; gap: 4px; width: 100%; }
  .mdk-colors {
    margin-top: 4px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .mdk-colors-heading {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }
  .mdk-colors-heading ha-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color, #727272); }
  .mdk-default-color-row { display: flex; flex-direction: column; gap: 4px; }
  .mdk-default-color-label { font-size: 0.8em; color: var(--secondary-text-color, #727272); }
  .mdk-color-rules { display: flex; flex-direction: column; gap: 6px; }
  .mdk-color-rules-empty { font-size: 0.8em; color: var(--secondary-text-color, #727272); }
  .mdk-color-rule-row { display: flex; align-items: center; gap: 6px; }
  .mdk-color-rule-state { flex: 0 0 38%; }
  .mdk-color-rule-color { flex: 1 1 auto; min-width: 0; }
  .mdk-color-swatch {
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    padding: 0;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 6px;
    cursor: pointer;
    background: none;
  }
  .mdk-color-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .mdk-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: 6px;
    padding: 6px 10px;
    background: none;
    color: var(--primary-text-color, #212121);
    font: inherit;
    font-size: 0.85em;
    cursor: pointer;
  }
  .mdk-btn:hover { background: var(--secondary-background-color, rgba(0, 0, 0, 0.06)); }
  .mdk-btn ha-icon { --mdc-icon-size: 16px; }
  .mdk-add-row { margin-top: 12px; }
  .mdk-add-row-label { font-size: 0.85em; color: var(--secondary-text-color, #727272); margin-bottom: 4px; }
  .mdk-add-row-split { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; margin-top: 12px; }
  .mdk-add-sensor-wrap { flex: 1 1 240px; min-width: 200px; }

  /* Canvas-Einstellungen + Drag-Vorschau im Editor */
  .mdk-canvas-settings { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
  .mdk-canvas-editor {
    position: relative;
    width: 100%;
    border: 1px dashed var(--divider-color, #e0e0e0);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--secondary-background-color, #f5f5f5);
    background-size: cover;
    background-position: center;
    touch-action: none;
    margin-bottom: 12px;
    box-sizing: border-box;
  }
  .mdk-canvas-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    text-align: center;
    color: var(--secondary-text-color, #727272);
    font-size: 0.85em;
    pointer-events: none;
  }
  .mdk-marker {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--card-background-color, rgba(255, 255, 255, 0.9));
    border: 1px solid var(--divider-color, #e0e0e0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    font-size: 0.75em;
    max-width: 140px;
    text-align: center;
    cursor: grab;
    touch-action: none;
    user-select: none;
  }
  .mdk-marker:active { cursor: grabbing; }
  .mdk-marker ha-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color, #727272); }
  .mdk-marker-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 130px;
  }

  /* "list"-Element: eigene, verschachtelte Sensoren-Liste im Editor */
  .mdk-list-entities-heading { margin-top: 8px; }
`;

class UiKarteCardEditor extends HTMLElement {
  constructor() {
    super();
    this._pickers = [];
    // Farbregel-Container, generisch für alle Sensor-Kontexte (Element
    // UND Zeile innerhalb eines "list"-Elements) - key-Format
    // "element-<index>"/"list-<elementIndex>-<entityIndex>" - siehe
    // _buildColorSection().
    this._colorRuleContainers = {};
    this._elementMarkers = {};
    this._positionInputs = {};
    this._listEntitiesContainers = {};
    this._built = false;
  }

  setConfig(config) {
    this._config = withCardDefaults(config);
    this._maybeInitialBuild();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) {
      this._maybeInitialBuild();
      return;
    }
    // Nur bestehende Elemente mit dem neuen hass-Objekt versorgen (für
    // z.B. Entity-Picker-Vorschläge/-Anzeigenamen) - siehe Modulkommentar
    // oben, warum hier bewusst NICHT neu aufgebaut wird.
    if (this._generalForm) this._generalForm.hass = hass;
    this._pickers.forEach((picker) => {
      if (picker && picker.isConnected) picker.hass = hass;
    });
  }

  get hass() {
    return this._hass;
  }

  _maybeInitialBuild() {
    if (this._built || !this._hass || !this._config) return;
    this._built = true;
    this._buildEditor();
  }

  _emitConfigChanged() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _generalValueChanged(ev) {
    ev.stopPropagation();
    // ev.detail.value enthält nur die im Schema gelisteten Schlüssel
    // (title/show_icon/show_state/show_unit) - "canvas"/"elements" bleiben
    // aus dem bestehenden this._config unverändert erhalten.
    this._config = { ...this._config, ...ev.detail.value };
    this._emitConfigChanged();
  }

  _buildEditor() {
    this.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = EDITOR_STYLES;
    this.appendChild(style);

    this._generalForm = document.createElement("ha-form");
    this._generalForm.hass = this._hass;
    this._generalForm.schema = GENERAL_EDITOR_SCHEMA;
    this._generalForm.computeLabel = computeGeneralEditorLabel;
    this._generalForm.data = this._config;
    this._generalForm.addEventListener("value-changed", (ev) => this._generalValueChanged(ev));
    this.appendChild(this._generalForm);

    this._canvasSectionContainer = document.createElement("div");
    this.appendChild(this._canvasSectionContainer);
    this._buildCanvasSection(this._canvasSectionContainer);
  }

  // --- Canvas mit Text-/Sensor-/Listen-Elementen --------------------------

  _buildCanvasSection(container) {
    const canvasHeading = document.createElement("div");
    canvasHeading.className = "mdk-editor-heading";
    canvasHeading.innerHTML = `<ha-icon icon="mdi:image-frame"></ha-icon><span>Canvas</span>`;
    container.appendChild(canvasHeading);

    container.appendChild(this._buildCanvasSettings());

    const dragHeading = document.createElement("div");
    dragHeading.className = "mdk-editor-heading";
    dragHeading.innerHTML = `<ha-icon icon="mdi:cursor-move"></ha-icon><span>Positionieren</span>`;
    container.appendChild(dragHeading);

    const dragHint = document.createElement("div");
    dragHint.className = "mdk-editor-hint";
    dragHint.textContent =
      "Elemente hier mit der Maus (oder dem Finger) frei verschieben - die Kartenvorschau oben aktualisiert sich dabei live mit. Für die exakte Position lassen sich X/Y unten bei jedem Element auch direkt eingeben.";
    container.appendChild(dragHint);

    this._canvasPreview = document.createElement("div");
    this._canvasPreview.className = "mdk-canvas-editor";
    container.appendChild(this._canvasPreview);

    const elementsHeading = document.createElement("div");
    elementsHeading.className = "mdk-editor-heading";
    elementsHeading.innerHTML = `<ha-icon icon="mdi:shape-outline"></ha-icon><span>Elemente</span>`;
    container.appendChild(elementsHeading);

    this._elementsContainer = document.createElement("div");
    this._elementsContainer.className = "mdk-entities";
    container.appendChild(this._elementsContainer);

    const addRow = document.createElement("div");
    addRow.className = "mdk-add-row-split";

    const addTextBtn = document.createElement("button");
    addTextBtn.type = "button";
    addTextBtn.className = "mdk-btn";
    addTextBtn.innerHTML = `<ha-icon icon="mdi:format-text"></ha-icon><span>Text hinzufügen</span>`;
    addTextBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      this._addElement("text");
    });
    addRow.appendChild(addTextBtn);

    const addListBtn = document.createElement("button");
    addListBtn.type = "button";
    addListBtn.className = "mdk-btn";
    addListBtn.innerHTML = `<ha-icon icon="mdi:format-list-bulleted"></ha-icon><span>Liste hinzufügen</span>`;
    addListBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      this._addElement("list");
    });
    addRow.appendChild(addListBtn);

    const addSensorWrap = document.createElement("div");
    addSensorWrap.className = "mdk-add-sensor-wrap";
    addSensorWrap.innerHTML = `<div class="mdk-add-row-label">Sensor hinzufügen</div>`;
    this._newElementEntityPicker = document.createElement("ha-entity-picker");
    this._newElementEntityPicker.hass = this._hass;
    this._newElementEntityPicker.value = "";
    this._newElementEntityPicker.label = "Entity auswählen …";
    this._newElementEntityPicker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      const value = ev.detail.value;
      if (value) this._addElement("sensor", value);
    });
    this._pickers.push(this._newElementEntityPicker);
    addSensorWrap.appendChild(this._newElementEntityPicker);
    addRow.appendChild(addSensorWrap);

    container.appendChild(addRow);

    this._rebuildCanvasPreview();
    this._rebuildElementRows();
  }

  _buildCanvasSettings() {
    const wrapper = document.createElement("div");
    wrapper.className = "mdk-canvas-settings";
    wrapper.innerHTML = `
      <div class="mdk-field-row mdk-field-row-split">
        <div class="mdk-field">
          <div class="mdk-field-label">Höhe (px)</div>
          <input type="number" min="80" max="4000" step="10" class="mdk-input mdk-canvas-height" />
        </div>
        <div class="mdk-field">
          <div class="mdk-field-label">Hintergrundbild-URL (optional)</div>
          <input type="text" class="mdk-input mdk-canvas-bg-image" placeholder="/local/hintergrund.jpg" />
        </div>
      </div>
      <div class="mdk-field">
        <div class="mdk-field-label">Hintergrundfarbe (optional)</div>
        <div class="mdk-color-rule-row">
          <input type="color" class="mdk-color-swatch mdk-canvas-bg-swatch" />
          <input type="text" class="mdk-input mdk-color-rule-color mdk-canvas-bg-color" placeholder="leer = transparent" />
        </div>
      </div>
    `;

    const heightInput = wrapper.querySelector(".mdk-canvas-height");
    heightInput.value = this._config.canvas.height;
    heightInput.addEventListener("input", () => {
      const height = clampNumber(heightInput.value, 80, 4000, this._config.canvas.height);
      this._updateCanvas({ height });
      if (this._canvasPreview) this._canvasPreview.style.height = `${height}px`;
    });

    const bgImageInput = wrapper.querySelector(".mdk-canvas-bg-image");
    bgImageInput.value = this._config.canvas.background_image || "";
    bgImageInput.addEventListener("input", () => {
      this._updateCanvas({ background_image: bgImageInput.value });
      this._syncCanvasPreviewBackground();
    });

    const bgSwatch = wrapper.querySelector(".mdk-canvas-bg-swatch");
    bgSwatch.value = swatchValueFor(this._config.canvas.background_color, "#ffffff");
    const bgColorInput = wrapper.querySelector(".mdk-canvas-bg-color");
    bgColorInput.value = this._config.canvas.background_color || "";
    bgSwatch.addEventListener("input", () => {
      bgColorInput.value = bgSwatch.value;
      this._updateCanvas({ background_color: bgSwatch.value });
      this._syncCanvasPreviewBackground();
    });
    bgColorInput.addEventListener("input", () => {
      const trimmed = bgColorInput.value.trim();
      if (HEX_COLOR_RE.test(trimmed)) bgSwatch.value = normalizeHex(trimmed);
      this._updateCanvas({ background_color: bgColorInput.value });
      this._syncCanvasPreviewBackground();
    });

    return wrapper;
  }

  // Aktualisiert Hintergrundfarbe/-bild der Editor-eigenen Canvas-Vorschau
  // direkt über die style-Eigenschaften des DOM-Elements (nicht über
  // innerHTML) - dadurch ist hier, anders als im HTML-String-basierten
  // Karten-Rendering, keine sanitizeColor()/sanitizeImageUrl()-Allowlist
  // nötig: der Browser interpretiert einen ungültigen CSSOM-Wert einfach
  // als "nicht gesetzt", ohne dass daraus eine Möglichkeit entstünde, aus
  // dem style-Kontext auszubrechen.
  _syncCanvasPreviewBackground() {
    if (!this._canvasPreview) return;
    this._canvasPreview.style.backgroundColor = this._config.canvas.background_color || "";
    const image = this._config.canvas.background_image;
    this._canvasPreview.style.backgroundImage = image ? `url("${String(image).replace(/"/g, "%22")}")` : "";
  }

  _rebuildCanvasPreview() {
    if (!this._canvasPreview) return;
    this._canvasPreview.innerHTML = "";
    this._elementMarkers = {};
    this._canvasPreview.style.height = `${this._config.canvas.height}px`;
    this._syncCanvasPreviewBackground();

    const elements = this._config.elements || [];
    if (!elements.length) {
      const hint = document.createElement("div");
      hint.className = "mdk-canvas-hint";
      hint.textContent = "Noch keine Elemente - unten hinzufügen, dann hier per Maus positionieren.";
      this._canvasPreview.appendChild(hint);
      return;
    }
    elements.forEach((elementConfig, index) => {
      this._canvasPreview.appendChild(this._buildCanvasMarker(elementConfig, index));
    });
  }

  _elementMarkerIcon(elementConfig) {
    if (elementConfig.type === "text") return "mdi:format-text";
    if (elementConfig.type === "list") return "mdi:format-list-bulleted";
    return "mdi:radar";
  }

  _elementMarkerLabel(elementConfig) {
    if (elementConfig.type === "text") return elementConfig.text || "Text";
    if (elementConfig.type === "list") return `Liste (${(elementConfig.entities || []).length})`;
    return elementConfig.name || elementConfig.entity || "Sensor";
  }

  _buildCanvasMarker(elementConfig, index) {
    const marker = document.createElement("div");
    marker.className = "mdk-marker";
    marker.style.left = `${elementConfig.x}%`;
    marker.style.top = `${elementConfig.y}%`;

    marker.innerHTML = `<ha-icon icon="${this._elementMarkerIcon(elementConfig)}"></ha-icon><span class="mdk-marker-label"></span>`;
    marker.querySelector(".mdk-marker-label").textContent = this._elementMarkerLabel(elementConfig);

    this._attachDrag(marker, index);
    this._elementMarkers[index] = marker;
    return marker;
  }

  // Pointer-Events (statt separater mouse-/touch-Handler) decken Maus,
  // Stift und Touch einheitlich ab. setPointerCapture() sorgt dafür, dass
  // "pointermove" auch dann weiter am Marker ankommt, wenn der Zeiger
  // schnell über den Canvas-Rand hinaus bewegt wird. Jede Bewegung ruft
  // _updateElement() auf (reine Werteänderung, siehe Modulkommentar oben) -
  // dadurch bewegt sich die von Home Assistant angezeigte Live-Vorschau der
  // eigentlichen Karte in Echtzeit mit, ohne dass hier irgendetwas neu
  // aufgebaut wird.
  _attachDrag(marker, index) {
    marker.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (marker.setPointerCapture) {
        try {
          marker.setPointerCapture(ev.pointerId);
        } catch (e) {
          // Manche Umgebungen (z.B. ältere WebViews) unterstützen
          // Pointer-Capture nicht vollständig - Ziehen funktioniert dann
          // weiterhin, nur ohne Capture-Absicherung außerhalb des Elements.
        }
      }
      const rect = this._canvasPreview.getBoundingClientRect();

      const applyPosition = (clientX, clientY) => {
        if (!rect.width || !rect.height) return;
        const x = round1(clampNumber(((clientX - rect.left) / rect.width) * 100, 0, 100, elementConfigAt(index).x));
        const y = round1(clampNumber(((clientY - rect.top) / rect.height) * 100, 0, 100, elementConfigAt(index).y));
        marker.style.left = `${x}%`;
        marker.style.top = `${y}%`;
        this._updateElement(index, { x, y });
        this._syncPositionInputs(index, x, y);
      };
      const elementConfigAt = (i) => this._config.elements[i];

      applyPosition(ev.clientX, ev.clientY);

      const onMove = (moveEv) => applyPosition(moveEv.clientX, moveEv.clientY);
      const onUp = (upEv) => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        if (marker.releasePointerCapture) {
          try {
            marker.releasePointerCapture(upEv.pointerId);
          } catch (e) {
            // siehe Kommentar bei setPointerCapture oben.
          }
        }
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
  }

  _syncPositionInputs(index, x, y) {
    const inputs = this._positionInputs[index];
    if (!inputs) return;
    inputs.x.value = x;
    inputs.y.value = y;
  }

  _rebuildElementRows() {
    this._elementsContainer.innerHTML = "";
    this._positionInputs = {};
    const elements = this._config.elements || [];
    if (!elements.length) {
      const empty = document.createElement("div");
      empty.className = "mdk-entities-empty";
      empty.textContent = "Noch keine Elemente hinzugefügt - unten Text, Sensor oder Liste hinzufügen.";
      this._elementsContainer.appendChild(empty);
      return;
    }
    elements.forEach((elementConfig, index) => {
      this._elementsContainer.appendChild(this._buildElementRow(elementConfig, index, elements.length));
    });
  }

  _buildElementRow(elementConfig, index, total) {
    const details = document.createElement("details");
    details.className = "mdk-entity";
    details.open = !!elementConfig.__justAdded;
    delete elementConfig.__justAdded;

    const label = this._elementMarkerLabel(elementConfig);
    const typeIcon = this._elementMarkerIcon(elementConfig);

    details.innerHTML = `
      <summary class="mdk-entity-summary">
        <ha-icon icon="mdi:chevron-right" class="mdk-entity-chevron"></ha-icon>
        <ha-icon icon="${typeIcon}" class="mdk-entity-type-icon"></ha-icon>
        <span class="mdk-entity-summary-label">${escapeHtml(label)}</span>
        <span class="mdk-entity-summary-actions">
          <button type="button" class="mdk-icon-btn mdk-move-up" title="Weiter nach hinten (Vordergrund-Reihenfolge)" ${index === 0 ? "disabled" : ""}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button type="button" class="mdk-icon-btn mdk-move-down" title="Weiter nach vorne (Vordergrund-Reihenfolge)" ${index === total - 1 ? "disabled" : ""}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <button type="button" class="mdk-icon-btn mdk-remove" title="Element entfernen">
            <ha-icon icon="mdi:trash-can-outline"></ha-icon>
          </button>
        </span>
      </summary>
      <div class="mdk-entity-body">
        <div class="mdk-field-row mdk-field-row-split">
          <div class="mdk-field">
            <div class="mdk-field-label">X-Position (%)</div>
            <input type="number" min="0" max="100" step="0.5" class="mdk-input mdk-pos-x" />
          </div>
          <div class="mdk-field">
            <div class="mdk-field-label">Y-Position (%)</div>
            <input type="number" min="0" max="100" step="0.5" class="mdk-input mdk-pos-y" />
          </div>
        </div>
        <div class="mdk-element-specific-slot"></div>
      </div>
    `;

    const summaryLabel = details.querySelector(".mdk-entity-summary-label");

    details.querySelector(".mdk-move-up").addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this._moveElement(index, -1);
    });
    details.querySelector(".mdk-move-down").addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this._moveElement(index, 1);
    });
    details.querySelector(".mdk-remove").addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this._removeElement(index);
    });

    const xInput = details.querySelector(".mdk-pos-x");
    const yInput = details.querySelector(".mdk-pos-y");
    xInput.value = elementConfig.x;
    yInput.value = elementConfig.y;
    const syncMarkerPosition = () => {
      const marker = this._elementMarkers[index];
      if (!marker) return;
      marker.style.left = `${xInput.value}%`;
      marker.style.top = `${yInput.value}%`;
    };
    xInput.addEventListener("input", () => {
      const x = clampNumber(xInput.value, 0, 100, elementConfig.x);
      this._updateElement(index, { x });
      syncMarkerPosition();
    });
    yInput.addEventListener("input", () => {
      const y = clampNumber(yInput.value, 0, 100, elementConfig.y);
      this._updateElement(index, { y });
      syncMarkerPosition();
    });
    this._positionInputs[index] = { x: xInput, y: yInput };

    const slot = details.querySelector(".mdk-element-specific-slot");
    if (elementConfig.type === "text") {
      slot.appendChild(this._buildTextElementFields(index, summaryLabel));
    } else if (elementConfig.type === "list") {
      slot.appendChild(this._buildListElementFields(index, summaryLabel));
    } else {
      slot.appendChild(this._buildSensorElementFields(index, summaryLabel));
    }

    return details;
  }

  _syncMarkerLabel(index, text) {
    const marker = this._elementMarkers[index];
    if (!marker) return;
    const labelSpan = marker.querySelector(".mdk-marker-label");
    if (labelSpan) labelSpan.textContent = text;
  }

  _buildTextElementFields(index, summaryLabel) {
    const elementConfig = this._config.elements[index];
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="mdk-field-row">
        <div class="mdk-field-label">Text</div>
        <textarea class="mdk-input mdk-text-input" rows="2" placeholder="Beliebiger Text"></textarea>
      </div>
      <div class="mdk-field-row mdk-field-row-split">
        <div class="mdk-field">
          <div class="mdk-field-label">Schriftgröße (px)</div>
          <input type="number" min="6" max="200" step="1" class="mdk-input mdk-font-size-input" />
        </div>
        <div class="mdk-field">
          <div class="mdk-field-label">Ausrichtung</div>
          <select class="mdk-input mdk-align-input">
            <option value="left">Links</option>
            <option value="center">Mittig</option>
            <option value="right">Rechts</option>
          </select>
        </div>
      </div>
      <div class="mdk-field-row mdk-field-row-split">
        <div class="mdk-field">
          <div class="mdk-field-label">Farbe (optional)</div>
          <div class="mdk-color-rule-row">
            <input type="color" class="mdk-color-swatch mdk-text-color-swatch" />
            <input type="text" class="mdk-input mdk-color-rule-color mdk-text-color-input" placeholder="leer = Theme-Standard" />
          </div>
        </div>
        <div class="mdk-field mdk-bold-field">
          <label class="mdk-checkbox-label">
            <input type="checkbox" class="mdk-bold-input" />
            <span>Fett</span>
          </label>
        </div>
      </div>
    `;

    const textInput = wrapper.querySelector(".mdk-text-input");
    textInput.value = elementConfig.text || "";
    textInput.addEventListener("input", () => {
      this._updateElement(index, { text: textInput.value });
      const label = textInput.value || "Text";
      if (summaryLabel) summaryLabel.textContent = label;
      this._syncMarkerLabel(index, label);
    });

    const fontSizeInput = wrapper.querySelector(".mdk-font-size-input");
    fontSizeInput.value = elementConfig.font_size;
    fontSizeInput.addEventListener("input", () => {
      const fontSize = clampNumber(fontSizeInput.value, 6, 200, elementConfig.font_size);
      this._updateElement(index, { font_size: fontSize });
    });

    const alignInput = wrapper.querySelector(".mdk-align-input");
    alignInput.value = elementConfig.align || "center";
    alignInput.addEventListener("change", () => {
      this._updateElement(index, { align: alignInput.value });
    });

    const colorSwatch = wrapper.querySelector(".mdk-text-color-swatch");
    const colorInput = wrapper.querySelector(".mdk-text-color-input");
    colorSwatch.value = swatchValueFor(elementConfig.color, "#212121");
    colorInput.value = elementConfig.color || "";
    colorSwatch.addEventListener("input", () => {
      colorInput.value = colorSwatch.value;
      this._updateElement(index, { color: colorSwatch.value });
    });
    colorInput.addEventListener("input", () => {
      const trimmed = colorInput.value.trim();
      if (HEX_COLOR_RE.test(trimmed)) colorSwatch.value = normalizeHex(trimmed);
      this._updateElement(index, { color: colorInput.value });
    });

    const boldInput = wrapper.querySelector(".mdk-bold-input");
    boldInput.checked = !!elementConfig.bold;
    boldInput.addEventListener("change", () => {
      this._updateElement(index, { bold: boldInput.checked });
    });

    return wrapper;
  }

  _buildSensorElementFields(index, summaryLabel) {
    return this._buildEntityFields(
      () => this._config.elements[index],
      (patch) => this._updateElement(index, patch),
      `element-${index}`,
      (label) => {
        if (summaryLabel) summaryLabel.textContent = label;
        this._syncMarkerLabel(index, label);
      }
    );
  }

  _buildListElementFields(index, summaryLabel) {
    const elementConfig = this._config.elements[index];
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="mdk-field-row mdk-field-row-split">
        <div class="mdk-field">
          <div class="mdk-field-label">Breite (%)</div>
          <input type="number" min="10" max="100" step="1" class="mdk-input mdk-list-width-input" />
        </div>
        <div class="mdk-field mdk-bold-field">
          <label class="mdk-checkbox-label">
            <input type="checkbox" class="mdk-list-dense-input" />
            <span>Kompakte Zeilen</span>
          </label>
        </div>
      </div>
      <div class="mdk-editor-heading mdk-list-entities-heading"><ha-icon icon="mdi:format-list-bulleted"></ha-icon><span>Sensoren in dieser Liste</span></div>
      <div class="mdk-entities mdk-list-entities-container"></div>
      <div class="mdk-add-row">
        <div class="mdk-add-row-label">Sensor zur Liste hinzufügen</div>
      </div>
    `;

    const widthInput = wrapper.querySelector(".mdk-list-width-input");
    widthInput.value = elementConfig.width;
    widthInput.addEventListener("input", () => {
      const width = clampNumber(widthInput.value, 10, 100, elementConfig.width);
      this._updateElement(index, { width });
    });

    const denseInput = wrapper.querySelector(".mdk-list-dense-input");
    denseInput.checked = !!elementConfig.dense;
    denseInput.addEventListener("change", () => {
      this._updateElement(index, { dense: denseInput.checked });
    });

    const listEntitiesContainer = wrapper.querySelector(".mdk-list-entities-container");
    this._listEntitiesContainers[index] = listEntitiesContainer;
    this._rebuildListEntityRows(index);

    const addRow = wrapper.querySelector(".mdk-add-row");
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass;
    picker.value = "";
    picker.label = "Entity auswählen …";
    picker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      const value = ev.detail.value;
      if (value) this._addListEntity(index, value);
    });
    this._pickers.push(picker);
    addRow.appendChild(picker);

    return wrapper;
  }

  _rebuildListEntityRows(elementIndex) {
    const container = this._listEntitiesContainers[elementIndex];
    if (!container) return;
    container.innerHTML = "";
    const elementConfig = this._config.elements[elementIndex];
    const entities = (elementConfig && elementConfig.entities) || [];
    if (!entities.length) {
      const empty = document.createElement("div");
      empty.className = "mdk-entities-empty";
      empty.textContent = "Noch keine Sensoren in dieser Liste - unten einen Sensor auswählen.";
      container.appendChild(empty);
      return;
    }
    entities.forEach((entityConfig, entityIndex) => {
      container.appendChild(this._buildListEntityRow(elementIndex, entityConfig, entityIndex, entities.length));
    });
  }

  _buildListEntityRow(elementIndex, entityConfig, entityIndex, total) {
    const details = document.createElement("details");
    details.className = "mdk-entity";
    details.open = !!entityConfig.__justAdded;
    delete entityConfig.__justAdded;

    const label = entityConfig.name || entityConfig.entity || "Neuer Sensor";

    details.innerHTML = `
      <summary class="mdk-entity-summary">
        <ha-icon icon="mdi:chevron-right" class="mdk-entity-chevron"></ha-icon>
        <span class="mdk-entity-summary-label">${escapeHtml(label)}</span>
        <span class="mdk-entity-summary-actions">
          <button type="button" class="mdk-icon-btn mdk-move-up" title="Nach oben verschieben" ${entityIndex === 0 ? "disabled" : ""}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button type="button" class="mdk-icon-btn mdk-move-down" title="Nach unten verschieben" ${entityIndex === total - 1 ? "disabled" : ""}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <button type="button" class="mdk-icon-btn mdk-remove" title="Sensor entfernen">
            <ha-icon icon="mdi:trash-can-outline"></ha-icon>
          </button>
        </span>
      </summary>
      <div class="mdk-entity-body">
        <div class="mdk-entity-fields-slot"></div>
      </div>
    `;

    const summaryLabel = details.querySelector(".mdk-entity-summary-label");

    details.querySelector(".mdk-move-up").addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this._moveListEntity(elementIndex, entityIndex, -1);
    });
    details.querySelector(".mdk-move-down").addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this._moveListEntity(elementIndex, entityIndex, 1);
    });
    details.querySelector(".mdk-remove").addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      this._removeListEntity(elementIndex, entityIndex);
    });

    const slot = details.querySelector(".mdk-entity-fields-slot");
    slot.appendChild(
      this._buildEntityFields(
        () => this._config.elements[elementIndex].entities[entityIndex],
        (patch) => this._updateListEntity(elementIndex, entityIndex, patch),
        `list-${elementIndex}-${entityIndex}`,
        (labelText) => {
          summaryLabel.textContent = labelText;
        }
      )
    );

    return details;
  }

  // --- Gemeinsame Sensor-Felder (eigenständiges "sensor"-Element UND Zeile
  //     innerhalb eines "list"-Elements) -----------------------------------
  //
  // getEntity(): liefert das aktuelle Sensor-Konfigurationsobjekt (entity/
  //   name/icon/attribute/default_color/colors).
  // patchEntity(patch): mutiert genau dieses Objekt immutable und feuert
  //   config-changed - reine Werteänderung, siehe Modulkommentar oben.
  // colorKey: eindeutiger String zur Ablage des zugehörigen Farbregel-
  //   Containers in this._colorRuleContainers.
  // onLabelChange(label): wird bei jeder Änderung aufgerufen, die die
  //   Zusammenfassungs-/Marker-Beschriftung beeinflusst (Entity-Auswahl,
  //   Name).

  _buildEntityFields(getEntity, patchEntity, colorKey, onLabelChange) {
    const entityConfig = getEntity();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="mdk-field-row">
        <div class="mdk-field-label">Entity</div>
        <ha-entity-picker class="mdk-entity-picker"></ha-entity-picker>
      </div>
      <div class="mdk-field-row mdk-field-row-split">
        <div class="mdk-field">
          <div class="mdk-field-label">Anzeigename (optional)</div>
          <input type="text" class="mdk-input mdk-name-input" placeholder="z.B. Wohnzimmer" />
        </div>
        <div class="mdk-field">
          <div class="mdk-field-label">Icon (optional, mdi:...)</div>
          <input type="text" class="mdk-input mdk-icon-input" placeholder="mdi:thermometer" />
        </div>
      </div>
      <div class="mdk-field-row">
        <div class="mdk-field-label">Anzuzeigender/abzugleichender Wert</div>
        <div class="mdk-attribute-slot"></div>
      </div>
      <div class="mdk-colors-slot"></div>
    `;

    const entityPicker = wrapper.querySelector(".mdk-entity-picker");
    entityPicker.hass = this._hass;
    entityPicker.value = entityConfig.entity || "";

    const nameInput = wrapper.querySelector(".mdk-name-input");
    nameInput.value = entityConfig.name || "";

    const iconInput = wrapper.querySelector(".mdk-icon-input");
    iconInput.value = entityConfig.icon || "";

    const attributeSlot = wrapper.querySelector(".mdk-attribute-slot");
    const colorsSlot = wrapper.querySelector(".mdk-colors-slot");

    const rebuildAttributeCombo = () => {
      attributeSlot.innerHTML = "";
      const current = getEntity();
      const stateObj = this._hass && this._hass.states ? this._hass.states[current.entity] : undefined;
      const options = [{ value: "", label: "Zustand (state)" }];
      if (stateObj && stateObj.attributes) {
        Object.keys(stateObj.attributes).forEach((key) => options.push({ value: key, label: `Attribut: ${key}` }));
      }
      const combo = buildCombobox({
        options,
        value: current.attribute || "",
        customLabel: "Anderes Attribut (Name eingeben) …",
        placeholder: "z.B. battery_level",
        onChange: (value) => {
          patchEntity({ attribute: value });
          rebuildColorSection();
        },
      });
      attributeSlot.appendChild(combo.element);
    };

    const rebuildColorSection = () => {
      colorsSlot.innerHTML = "";
      colorsSlot.appendChild(
        this._buildColorSection(
          colorKey,
          () => getEntity(),
          (patch) => patchEntity(patch),
          () => {
            const c = getEntity();
            const stateObj = this._hass && this._hass.states ? this._hass.states[c.entity] : undefined;
            return getRawValue(c, stateObj);
          }
        )
      );
    };

    entityPicker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      const value = ev.detail.value || "";
      patchEntity({ entity: value, attribute: "" });
      const label = nameInput.value || value || "Sensor";
      if (onLabelChange) onLabelChange(label);
      rebuildAttributeCombo();
      rebuildColorSection();
    });
    this._pickers.push(entityPicker);

    nameInput.addEventListener("input", () => {
      patchEntity({ name: nameInput.value });
      const label = nameInput.value || entityPicker.value || "Sensor";
      if (onLabelChange) onLabelChange(label);
    });

    iconInput.addEventListener("input", () => {
      patchEntity({ icon: iconInput.value });
    });

    rebuildAttributeCombo();
    rebuildColorSection();

    return wrapper;
  }

  // Liefert plausible Dropdown-Vorschläge für das "Zustand"-Kombifeld einer
  // Farbregel: den aktuell live gemeldeten Wert (respektiert ein evtl.
  // gesetztes "attribute"), dazu bei Hauptzustand die typischen Zustände
  // der Entity-Domäne (COMMON_STATE_OPTIONS_BY_DOMAIN) bzw. bei einem
  // Bool'schen Attributwert schlicht "true"/"false". Kein Anspruch auf
  // Vollständigkeit - über "Eigener Wert ..." bleibt jeder Wert weiterhin
  // frei eintippbar.
  _stateOptionsFor(entityConfig) {
    const stateObj = this._hass && this._hass.states ? this._hass.states[entityConfig.entity] : undefined;
    const rawValue = getRawValue(entityConfig, stateObj);
    const seen = new Set();
    const options = [];
    const push = (v, label) => {
      if (v === undefined || v === null || v === "") return;
      const key = String(v);
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ value: key, label: label || key });
    };
    if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
      push(rawValue, `Aktueller Wert: ${rawValue}`);
    }
    if (!entityConfig.attribute) {
      (COMMON_STATE_OPTIONS_BY_DOMAIN[domainOf(entityConfig.entity)] || []).forEach((s) => push(s));
      push("unavailable");
      push("unknown");
    } else if (typeof rawValue === "boolean" || rawValue === undefined) {
      push("true");
      push("false");
    }
    return options;
  }

  // --- Generischer Wert->Farbe-Editor (Sensor-Elemente UND Zeilen
  //     innerhalb von "list"-Elementen) ------------------------------------
  //
  // key: eindeutiger String, nur zur Ablage des zugehörigen Zeilen-
  //   Containers in this._colorRuleContainers.
  // getConf(): liefert das aktuelle { default_color, colors } tragende
  //   Objekt (Sensor-Konfiguration).
  // patchConf(patch): mutiert genau dieses Objekt immutable und feuert
  //   config-changed - reine Werteänderung, siehe Modulkommentar oben.
  // getCurrentStateValue(): liefert den aktuell live gemeldeten Rohwert des
  //   zugehörigen Sensors (respektiert "attribute"), oder undefined - für
  //   den "Aktuellen Zustand übernehmen"-Knopf.

  _buildColorSection(key, getConf, patchConf, getCurrentStateValue) {
    const section = document.createElement("div");
    section.className = "mdk-colors";

    const heading = document.createElement("div");
    heading.className = "mdk-colors-heading";
    heading.innerHTML = `<ha-icon icon="mdi:palette-outline"></ha-icon><span>Zustand → Icon-Farbe</span>`;
    section.appendChild(heading);

    section.appendChild(this._buildDefaultColorRow(getConf, patchConf));

    const rulesContainer = document.createElement("div");
    rulesContainer.className = "mdk-color-rules";
    section.appendChild(rulesContainer);
    this._colorRuleContainers[key] = rulesContainer;

    const actionsRow = document.createElement("div");
    actionsRow.className = "mdk-color-actions";

    const addRuleBtn = document.createElement("button");
    addRuleBtn.type = "button";
    addRuleBtn.className = "mdk-btn";
    addRuleBtn.innerHTML = `<ha-icon icon="mdi:plus"></ha-icon><span>Zustand hinzufügen</span>`;
    addRuleBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      this._addColorRule(key, getConf, patchConf, "");
    });
    actionsRow.appendChild(addRuleBtn);

    const useCurrentBtn = document.createElement("button");
    useCurrentBtn.type = "button";
    useCurrentBtn.className = "mdk-btn";
    useCurrentBtn.innerHTML = `<ha-icon icon="mdi:target"></ha-icon><span>Aktuellen Zustand übernehmen</span>`;
    useCurrentBtn.title = "Legt eine neue Zeile mit dem gerade live gemeldeten Rohwert dieses Sensors an.";
    useCurrentBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      const current = getCurrentStateValue();
      if (current === undefined) return;
      this._addColorRule(key, getConf, patchConf, current);
    });
    actionsRow.appendChild(useCurrentBtn);

    section.appendChild(actionsRow);

    this._rebuildColorRuleRows(key, getConf, patchConf);

    return section;
  }

  _buildDefaultColorRow(getConf, patchConf) {
    const conf = getConf();
    const wrapper = document.createElement("div");
    wrapper.className = "mdk-default-color-row";

    const label = document.createElement("div");
    label.className = "mdk-default-color-label";
    label.textContent = "Rückfallfarbe (wenn unten kein Zustand passt, leer = Theme-Standardfarbe)";
    wrapper.appendChild(label);

    const controls = document.createElement("div");
    controls.className = "mdk-color-rule-row";

    const swatch = document.createElement("input");
    swatch.type = "color";
    swatch.className = "mdk-color-swatch";
    swatch.value = swatchValueFor(conf.default_color, "#727272");
    controls.appendChild(swatch);

    const colorInput = document.createElement("input");
    colorInput.type = "text";
    colorInput.className = "mdk-input mdk-color-rule-color";
    colorInput.placeholder = "#rrggbb, rgb(), hsl(), var(--...) - leer lassen für Theme-Standard";
    colorInput.value = conf.default_color || "";
    controls.appendChild(colorInput);

    swatch.addEventListener("input", () => {
      colorInput.value = swatch.value;
      patchConf({ default_color: swatch.value });
    });
    colorInput.addEventListener("input", () => {
      const trimmed = colorInput.value.trim();
      if (HEX_COLOR_RE.test(trimmed)) swatch.value = normalizeHex(trimmed);
      patchConf({ default_color: colorInput.value });
    });

    wrapper.appendChild(controls);
    return wrapper;
  }

  _rebuildColorRuleRows(key, getConf, patchConf) {
    const container = this._colorRuleContainers[key];
    if (!container) return;
    container.innerHTML = "";
    const rules = getConf().colors || [];
    if (!rules.length) {
      const empty = document.createElement("div");
      empty.className = "mdk-color-rules-empty";
      empty.textContent = "Noch keine Zustands-Farben definiert - Icon nutzt die Theme-Standardfarbe (bzw. die Rückfallfarbe oben).";
      container.appendChild(empty);
      return;
    }
    rules.forEach((rule, ruleIndex) => {
      container.appendChild(this._buildColorRuleRow(key, getConf, patchConf, ruleIndex, rule));
    });
  }

  _buildColorRuleRow(key, getConf, patchConf, ruleIndex, rule) {
    const row = document.createElement("div");
    row.className = "mdk-color-rule-row";

    const combo = buildCombobox({
      options: this._stateOptionsFor(getConf()),
      value: rule.state || "",
      customLabel: "Eigener Wert …",
      placeholder: "Zustand/Wert, z.B. on",
      onChange: (value) => {
        this._updateColorRule(getConf, patchConf, ruleIndex, { state: value });
      },
    });
    combo.element.classList.add("mdk-color-rule-state");
    row.appendChild(combo.element);

    const swatch = document.createElement("input");
    swatch.type = "color";
    swatch.className = "mdk-color-swatch";
    swatch.value = swatchValueFor(rule.color, "#03a9f4");
    row.appendChild(swatch);

    const colorInput = document.createElement("input");
    colorInput.type = "text";
    colorInput.className = "mdk-input mdk-color-rule-color";
    colorInput.placeholder = "#rrggbb / rgb() / var(--...)";
    colorInput.value = rule.color || "";
    row.appendChild(colorInput);

    swatch.addEventListener("input", () => {
      colorInput.value = swatch.value;
      this._updateColorRule(getConf, patchConf, ruleIndex, { color: swatch.value });
    });
    colorInput.addEventListener("input", () => {
      const trimmed = colorInput.value.trim();
      if (HEX_COLOR_RE.test(trimmed)) swatch.value = normalizeHex(trimmed);
      this._updateColorRule(getConf, patchConf, ruleIndex, { color: colorInput.value });
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "mdk-icon-btn";
    removeBtn.title = "Zeile entfernen";
    removeBtn.innerHTML = `<ha-icon icon="mdi:trash-can-outline"></ha-icon>`;
    removeBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      this._removeColorRule(key, getConf, patchConf, ruleIndex);
    });
    row.appendChild(removeBtn);

    return row;
  }

  _updateColorRule(getConf, patchConf, ruleIndex, patch) {
    const colors = (getConf().colors || []).slice();
    colors[ruleIndex] = { ...colors[ruleIndex], ...patch };
    patchConf({ colors });
  }

  _addColorRule(key, getConf, patchConf, state) {
    const colors = [...(getConf().colors || []), { state: state || "", color: "" }];
    patchConf({ colors });
    this._rebuildColorRuleRows(key, getConf, patchConf);
  }

  _removeColorRule(key, getConf, patchConf, ruleIndex) {
    const colors = (getConf().colors || []).slice();
    colors.splice(ruleIndex, 1);
    patchConf({ colors });
    this._rebuildColorRuleRows(key, getConf, patchConf);
  }

  // --- Konfigurations-Mutationen ---------------------------------------
  //
  // Alle _update*/_add*/_remove*/_move*-Methoden bauen this._config
  // unveränderlich (immutable) neu zusammen (slice()/Spread statt
  // In-Place-Mutation), damit Home Assistant zuverlässig erkennt, dass sich
  // die Config geändert hat. Nur die strukturellen Varianten
  // (_addElement/_removeElement/_moveElement/_addListEntity/
  // _removeListEntity/_moveListEntity) bauen anschließend auch das
  // betroffene DOM-Stück neu auf - reine Werteänderungen (_updateElement/
  // _updateCanvas/_updateListEntity) tun das bewusst NICHT, siehe
  // Modulkommentar oben.

  _updateCanvas(patch) {
    this._config = { ...this._config, canvas: { ...this._config.canvas, ...patch } };
    this._emitConfigChanged();
  }

  _updateElement(index, patch) {
    const elements = this._config.elements.slice();
    elements[index] = { ...elements[index], ...patch };
    this._config = { ...this._config, elements };
    this._emitConfigChanged();
  }

  _addElement(type, entityId) {
    let base;
    if (type === "text") {
      base = { type: "text", x: 50, y: 50 };
    } else if (type === "list") {
      base = { type: "list", x: 50, y: 50, width: 60, dense: false, entities: [] };
    } else {
      base = { type: "sensor", x: 50, y: 50, entity: entityId || "", colors: presetColorsForEntity(entityId || "") };
    }
    const newElement = withElementDefaults(base);
    newElement.__justAdded = true;
    const elements = [...(this._config.elements || []), newElement];
    this._config = { ...this._config, elements };
    if (type === "sensor" && this._newElementEntityPicker) this._newElementEntityPicker.value = "";
    this._rebuildCanvasPreview();
    this._rebuildElementRows();
    this._emitConfigChanged();
  }

  _removeElement(index) {
    const elements = this._config.elements.slice();
    elements.splice(index, 1);
    this._config = { ...this._config, elements };
    this._rebuildCanvasPreview();
    this._rebuildElementRows();
    this._emitConfigChanged();
  }

  _moveElement(index, delta) {
    const elements = this._config.elements.slice();
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= elements.length) return;
    const [item] = elements.splice(index, 1);
    elements.splice(newIndex, 0, item);
    this._config = { ...this._config, elements };
    this._rebuildCanvasPreview();
    this._rebuildElementRows();
    this._emitConfigChanged();
  }

  // --- "list"-Element: verschachtelte Sensoren-CRUD -----------------------

  _updateListEntity(elementIndex, entityIndex, patch) {
    const elements = this._config.elements.slice();
    const el = elements[elementIndex];
    const entities = (el.entities || []).slice();
    entities[entityIndex] = { ...entities[entityIndex], ...patch };
    elements[elementIndex] = { ...el, entities };
    this._config = { ...this._config, elements };
    this._emitConfigChanged();
  }

  _addListEntity(elementIndex, entityId) {
    const elements = this._config.elements.slice();
    const el = elements[elementIndex];
    const newEntity = withEntityItemDefaults({ entity: entityId, colors: presetColorsForEntity(entityId) });
    newEntity.__justAdded = true;
    const entities = [...(el.entities || []), newEntity];
    elements[elementIndex] = { ...el, entities };
    this._config = { ...this._config, elements };
    this._rebuildListEntityRows(elementIndex);
    this._syncMarkerLabel(elementIndex, this._elementMarkerLabel(elements[elementIndex]));
    this._emitConfigChanged();
  }

  _removeListEntity(elementIndex, entityIndex) {
    const elements = this._config.elements.slice();
    const el = elements[elementIndex];
    const entities = (el.entities || []).slice();
    entities.splice(entityIndex, 1);
    elements[elementIndex] = { ...el, entities };
    this._config = { ...this._config, elements };
    this._rebuildListEntityRows(elementIndex);
    this._syncMarkerLabel(elementIndex, this._elementMarkerLabel(elements[elementIndex]));
    this._emitConfigChanged();
  }

  _moveListEntity(elementIndex, entityIndex, delta) {
    const elements = this._config.elements.slice();
    const el = elements[elementIndex];
    const entities = (el.entities || []).slice();
    const newIndex = entityIndex + delta;
    if (newIndex < 0 || newIndex >= entities.length) return;
    const [item] = entities.splice(entityIndex, 1);
    entities.splice(newIndex, 0, item);
    elements[elementIndex] = { ...el, entities };
    this._config = { ...this._config, elements };
    this._rebuildListEntityRows(elementIndex);
    this._emitConfigChanged();
  }
}

customElements.define("ui-karte", UiKarteCard);
customElements.define("ui-karte-editor", UiKarteCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ui-karte",
  name: "UI Karte",
  description:
    "Frei per Maus positionierbares Canvas-Layout (Text, Sensoren, Sensor-Listen) mit grafischem Editor, zustandsabhängiger Icon-Farbe und per Dropdown wählbaren Zuständen/Attributen je Sensor.",
});
