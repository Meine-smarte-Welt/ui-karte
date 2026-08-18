# Manuelle Dashboardkarte

Eine frei konfigurierbare Home-Assistant-Lovelace-Karte mit zwei Layouts:

- **Liste**: beliebig viele Sensoren als Zeilen, jede mit Icon, Name und
  Zustand.
- **Frei**: ein Canvas fester Höhe, auf dem sich beliebig viele Text- und
  Sensor-Elemente direkt mit der Maus (oder dem Finger) frei positionieren
  lassen - siehe Abschnitt [Layout "Frei"](#layout-frei-positionierung-per-maus)
  unten.

In beiden Layouts wird das Icon eines Sensors abhängig von dessen Zustand
eingefärbt, genau wie bei der `fritzbox-anrufe-card` (dort sind es die
Anruf-/Kategorie-Symbole, hier ist es pro Sensor frei editierbar).

Kompletter grafischer Editor - keine YAML-Kenntnisse nötig:

- Sensoren per Entity-Picker hinzufügen, entfernen, umsortieren (Liste) bzw.
  frei auf dem Canvas platzieren (Frei).
- Für jeden Sensor eine eigene, aufklappbare Zustand-\>Farbe-Zuordnung mit
  grafischem Farbwähler (Klick auf das Farbfeld öffnet die
  Systemfarbauswahl) plus Textfeld für erweiterte CSS-Werte
  (`rgb()`/`hsl()`/`var(--...)`).
- "Aktuellen Zustand übernehmen"-Knopf legt aus dem gerade live gemeldeten
  Rohzustand direkt eine neue Farbregel an - praktisch bei Sensoren, deren
  genauer Zustandstext (z. B. `on`/`off` vs. `open`/`closed` vs. ein
  beliebiger Zahlenwert) man nicht auswendig kennt.
- Da Home Assistant beim Bearbeiten einer Karte automatisch eine Live-
  Vorschau über dem Editor anzeigt, wirkt sich jede Änderung sofort sichtbar
  aus (WYSIWYG) - das übernimmt Home Assistants Editor-Dialog selbst, ohne
  eigenen Zusatzaufwand dieser Karte. Im Layout "Frei" bewegt sich diese
  Live-Vorschau live mit, während man einen Marker auf der
  editor-eigenen Positionier-Fläche zieht.

## Installation über HACS (eigenes GitHub-Repository)

Dieses Repository ist so aufgebaut, dass es sich direkt als **eigenes,
privates HACS-Repository** ("Custom repository") nutzen lässt - es muss
dafür nicht im offiziellen HACS-Store gelistet sein.

**Wichtig - Repository-Name:** HACS verlangt bei Lovelace-Plugins, dass eine
`.js`-Datei im Repository denselben Namen trägt wie das Repository selbst
(Ausnahme: Repository-Namen mit Präfix `lovelace-`, dort darf die Datei den
Rest des Namens ohne Präfix tragen). Diese Karte heißt
`manuelle-dashboardkarte-card.js` - das neue GitHub-Repository muss also
entweder exakt **`manuelle-dashboardkarte-card`** heißen, oder z. B.
**`lovelace-manuelle-dashboardkarte-card`**. Bei einem anderen Namen bitte
zusätzlich die `.js`-Datei entsprechend umbenennen (und `filename` in
`hacs.json` anpassen).

1. Neues **öffentliches** GitHub-Repository mit passendem Namen (siehe
   oben) anlegen.
2. Den Inhalt dieses Ordners (`manuelle-dashboardkarte-card.js`,
   `hacs.json`, `README.md`) 1:1 in das neue Repository hochladen/pushen -
   alle drei Dateien müssen im **Wurzelverzeichnis** liegen, nicht in einem
   Unterordner.
3. In Home Assistant: HACS → oben rechts die drei Punkte →
   **Benutzerdefinierte Repositories** → Repository-URL eintragen,
   Kategorie **"Dashboard"**/**"Plugin"** wählen → Hinzufügen.
4. Die Karte erscheint danach in HACS zur Installation; HACS registriert
   die Lovelace-Ressource dabei automatisch (kein manueller Ressourcen-
   Eintrag nötig, anders als bei der rein manuellen Installation unten).
5. Optional, aber empfohlen: in GitHub unter "Releases" einen ersten
   Release (z. B. Tag `v1.0.0`) veröffentlichen - HACS bevorzugt Releases
   gegenüber dem Stand des Default-Branches und zeigt dann auch eine
   nachvollziehbare Versionsnummer an.

## Installation (manuell, ohne HACS)

1. Datei `manuelle-dashboardkarte-card.js` nach
   `<Home-Assistant-Konfigurationsverzeichnis>/www/` kopieren (Ordner `www`
   im Zweifel selbst anlegen, falls noch nicht vorhanden - alles darin ist
   automatisch unter `/local/...` erreichbar).
2. Einstellungen → Dashboards → oben rechts die drei Punkte →
   **Ressourcen** → **+ Ressource hinzufügen**.
   - URL: `/local/manuelle-dashboardkarte-card.js`
   - Ressourcentyp: **JavaScript-Modul**
3. Seite einmal neu laden (F5) - danach steht der Kartentyp
   **"Manuelle Dashboardkarte"** in der normalen Kartenauswahl zur
   Verfügung.

## Karte hinzufügen

1. Auf einem Dashboard **Bearbeiten** → **+ Karte hinzufügen**.
2. Nach "Manuelle Dashboardkarte" suchen (oder unten in der Liste, Kategorie
   "Von diesem Server").
3. Es öffnet sich direkt der grafische Editor mit Live-Vorschau - Titel
   vergeben, unter "Darstellung" das gewünschte Layout wählen (Liste oder
   Frei), dann Sensoren/Text hinzufügen und je Sensor Farben festlegen.

Alternativ funktioniert auch die YAML-Ansicht des Karten-Editors, z. B.:

```yaml
type: custom:manuelle-dashboardkarte-card
title: "Meine Sensoren"
layout: list
show_icon: true
show_state: true
show_unit: true
dense: false
entities:
  - entity: binary_sensor.haustuer
    name: "Haustür"
    icon: "mdi:door"
    default_color: ""
    colors:
      - state: "on"
        color: "#db4437"
      - state: "off"
        color: "#4caf50"
  - entity: sensor.aussentemperatur
    colors: []
```

## Layout "Frei" (Positionierung per Maus)

Im Editor unter "Darstellung" → "Layout" auf **"Frei positionierbar"**
umstellen. Es erscheinen dann:

1. **Canvas-Einstellungen**: Höhe in Pixeln, optionale Hintergrundfarbe,
   optionale Hintergrundbild-URL (z. B. ein Grundriss unter `/local/...`).
2. Eine **Positionier-Fläche** in genau dieser Höhe: unten zunächst "Text
   hinzufügen" oder über den Entity-Picker einen Sensor hinzufügen - das
   neue Element erscheint als kleiner, mit der Maus greifbarer Marker in
   der Mitte der Fläche. Marker anklicken, halten und an die gewünschte
   Stelle ziehen (auch touch-fähig) - die Position wird laufend
   gespeichert, und die von Home Assistant über dem Editor angezeigte
   echte Kartenvorschau bewegt sich dabei live mit.
3. Eine **Elementeliste** darunter mit einem aufklappbaren Eintrag je
   Element: X/Y-Position auch als Zahl eingebbar (für pixelgenaues
   Justieren ohne Maus), dazu je nach Typ:
   - **Text**: Textinhalt, Schriftgröße, Ausrichtung, Farbe, Fett.
   - **Sensor**: Entity, Anzeigename, Icon, sowie dieselbe
     Zustand-\>Farbe-Zuordnung wie im Layout "Liste".
   - Pfeil-Buttons ändern die Vordergrund-/Hintergrund-Reihenfolge
     (überlappende Elemente), der Papierkorb-Button entfernt das Element.

YAML-Beispiel für dasselbe Ergebnis:

```yaml
type: custom:manuelle-dashboardkarte-card
title: "Eingangsbereich"
layout: freeform
canvas:
  height: 300
  background_color: ""
  background_image: "/local/grundriss.png"
elements:
  - type: sensor
    entity: binary_sensor.haustuer
    name: "Haustür"
    x: 25
    y: 60
    colors:
      - state: "on"
        color: "#db4437"
      - state: "off"
        color: "#4caf50"
  - type: text
    text: "Eingang"
    x: 25
    y: 40
    font_size: 18
    bold: true
    align: center
```

## Konfigurationsschlüssel

| Schlüssel | Bedeutung | Standard |
| --- | --- | --- |
| `title` | Kartentitel, leer = kein Titel | `""` |
| `layout` | `list` oder `freeform` | `list` |
| `show_icon` | Icon je Sensor anzeigen | `true` |
| `show_state` | Zustand je Sensor anzeigen | `true` |
| `show_unit` | Einheit (`unit_of_measurement`) an Zahlenwerte anhängen | `true` |
| `dense` | Kompaktere Zeilenhöhe (nur Layout `list`) | `false` |
| `entities` | Liste der Sensoren (nur Layout `list`, siehe unten) | `[]` |
| `canvas` | Canvas-Einstellungen (nur Layout `freeform`, siehe unten) | s. u. |
| `elements` | Liste der Text-/Sensor-Elemente (nur Layout `freeform`, siehe unten) | `[]` |

`entities` und `elements` bleiben beim Umschalten des Layouts jeweils
erhalten (nur eines von beiden wird gerade angezeigt/gerendert) - ein
Wechsel hin und zurück verliert also keine Konfiguration.

Je Eintrag in `entities` (Layout `list`):

| Schlüssel | Bedeutung |
| --- | --- |
| `entity` | Entity-ID (Pflichtfeld) |
| `name` | Anzeigename, leer = `friendly_name` der Entity |
| `icon` | mdi-Icon, leer = Icon der Entity bzw. ein Domänen-Standardicon |
| `default_color` | Rückfallfarbe, wenn kein `colors`-Eintrag passt; leer = Theme-Standardfarbe |
| `colors` | Liste aus `state`/`color`-Paaren |

`canvas` (Layout `freeform`):

| Schlüssel | Bedeutung | Standard |
| --- | --- | --- |
| `height` | Höhe der Canvas in Pixeln | `300` |
| `background_color` | Optionale Hintergrundfarbe | `""` |
| `background_image` | Optionale Hintergrundbild-URL | `""` |

Je Eintrag in `elements` (Layout `freeform`), gemeinsame Felder:

| Schlüssel | Bedeutung |
| --- | --- |
| `type` | `sensor` oder `text` |
| `x` / `y` | Position in Prozent (0-100), bezeichnet den Mittelpunkt des Elements |

Zusätzlich bei `type: sensor`: `entity`/`name`/`icon`/`default_color`/`colors`
(identisch zu `entities` oben). Zusätzlich bei `type: text`: `text` (Inhalt),
`font_size` (Pixel, Standard `16`), `color` (leer = Theme-Standard), `bold`
(`true`/`false`), `align` (`left`/`center`/`right`).

**Wie die Farbzuordnung funktioniert:** Der Rohzustand der Entity
(`state.state`, z. B. `on`/`off`, `open`/`closed`, ein Zahlenwert wie `21.5`)
wird exakt (ohne Groß-/Kleinschreibung, getrimmt) mit dem hinterlegten
`state`-Wert jeder Regel verglichen - die erste Übereinstimmung gewinnt.
Trifft keine zu, greift `default_color`, sonst bleibt das Icon in der vom
aktuellen Home-Assistant-Theme vorgegebenen Standardfarbe. Es handelt sich
bewusst um eine einfache, exakte Zuordnung - keine Zahlen-Schwellenwerte
(z. B. "Akku < 20 %") oder Vorlagen/Templates.

Für gängige Domänen (`binary_sensor`, `switch`, `input_boolean`, `light`,
`lock`, `cover`) legt der Editor beim Hinzufügen eines Sensors automatisch
sinnvolle Start-Farben an (z. B. `on`/`off` bei `binary_sensor` rot/grün) -
das bleibt jederzeit im Editor änder- oder löschbar. Gilt in beiden
Layouts.

## Bekannte Einschränkungen

- Wie bei der `fritzbox-anrufe-card` gilt: "Bild" bzw. "Symbol" bedeutet
  hier ein **mdi-Vektor-Icon** (`<ha-icon>`), keine hochgeladene
  Rasterbild-Datei - nur ein Vektor-Icon lässt sich per CSS zuverlässig
  einfärben. Ein beliebiges hochgeladenes Bild könnte technisch nicht auf
  dieselbe Art eingefärbt werden.
- Diese Karte wurde ohne eine laufende Home-Assistant-Instanz entwickelt
  (keine echte Hardware-/Frontend-Version zum Testen verfügbar) und ist
  daher nicht an echter Hardware bestätigt. Die Kernlogik (Farbzuordnung,
  Editor-Zustandsverwaltung) ist automatisiert getestet; falls sich
  `<ha-entity-picker>` oder `<ha-form>` in einer bestimmten Home-Assistant-
  Frontend-Version anders verhalten als erwartet, bitte melden.
- Ein Klick auf eine Sensorzeile bzw. ein Sensor-Element öffnet den
  Standard-"Mehr Informationen"-Dialog der jeweiligen Entity; ein eigenes,
  konfigurierbares Klickverhalten (`tap_action` u. ä.) gibt es (noch) nicht.
- Das Ziehen der Marker im Layout "Frei" nutzt Pointer Events
  (`pointerdown`/`pointermove`/`pointerup`), die praktisch jeder aktuelle
  Browser (auch mobil/Companion-App-WebView) unterstützt; auf sehr alten
  Browsern ohne Pointer-Events-Unterstützung würde das Ziehen mit der Maus
  nicht funktionieren - die X/Y-Zahlenfelder je Element funktionieren als
  Ausweichmöglichkeit trotzdem immer.
- Die Positionier-Fläche im Editor übernimmt exakt dieselbe Pixel-Höhe wie
  die echte Karte (`canvas.height`), aber nicht zwingend dieselbe Breite
  (abhängig vom Editor-Dialog-Fenster vs. der tatsächlichen Dashboard-
  Spaltenbreite) - da x/y-Positionen in Prozent gespeichert werden, ist das
  nur ein kleiner optischer Unterschied beim Ziehen selbst; wie es auf dem
  echten Dashboard aussieht, zeigt zuverlässig die separate Live-Vorschau,
  die Home Assistant automatisch über dem Editor anzeigt.
- Elemente lassen sich nur verschieben (Größe wird nicht per Ziehen
  verändert) - Schriftgröße bei Text-Elementen ist über ein eigenes
  Zahlenfeld einstellbar, eine direkte Größenänderung von Sensor-Icons per
  Ziehen gibt es (noch) nicht.
- Die `hacs.json`/HACS-Einbindung wurde nicht gegen eine echte laufende
  HACS-Instanz getestet (in dieser Session nicht verfügbar) - Aufbau und
  Felder folgen der offiziellen HACS-Dokumentation
  ([hacs.xyz/docs/publish](https://hacs.xyz/docs/publish/start/)); falls
  HACS die Karte nach dem Hinzufügen als Custom Repository nicht findet,
  zuerst prüfen, ob der Repository-Name wie oben beschrieben zur `.js`-Datei
  passt und ob alle drei Dateien wirklich im Wurzelverzeichnis liegen.
