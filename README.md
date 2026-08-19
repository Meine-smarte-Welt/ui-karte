# UI Karte

Eine frei konfigurierbare Home-Assistant-Lovelace-Karte: ein Canvas fester
Höhe, auf dem sich beliebig viele Elemente direkt mit der Maus (oder dem
Finger) frei positionieren lassen. Es gibt drei Elementtypen:

- **Text**: frei formatierbarer Text.
- **Sensor**: ein einzelner Sensor mit Icon, Name und Zustand/Attribut.
- **Liste**: eine Gruppe von Sensoren als Zeilen-Liste - selbst wieder frei
  auf der Canvas positionierbar. Ersetzt das frühere eigenständige
  Listen-Layout dieser Karte (siehe [Migration](#migration-von-älteren-versionen)
  unten).

Bei Sensor- und Listen-Elementen wird das Icon jedes Sensors abhängig von
dessen Zustand eingefärbt, genau wie bei der `fritzbox-anrufe-card` (dort
sind es die Anruf-/Kategorie-Symbole, hier ist es pro Sensor frei
editierbar). Dabei lässt sich pro Sensor wählen, ob der **Hauptzustand**
oder ein beliebiges **Attribut** (z. B. `battery_level`) angezeigt und für
die Farbzuordnung herangezogen wird - beides per Dropdown auswählbar.

Kompletter grafischer Editor - keine YAML-Kenntnisse nötig:

- Text-, Sensor- und Listen-Elemente über Buttons bzw. Entity-Picker
  hinzufügen, entfernen, umsortieren und frei auf der Canvas platzieren.
- Bei jedem Sensor per Dropdown wählbar, ob Zustand oder ein Attribut
  angezeigt/abgeglichen werden soll - die Liste der Attribute wird direkt
  aus dem aktuell gemeldeten Zustand der gewählten Entity befüllt, ein
  Attributname lässt sich aber auch frei eintippen ("Anderes Attribut ...").
- Für jeden Sensor eine eigene, aufklappbare Zustand-\>Farbe-Zuordnung:
  der abzugleichende Wert wird ebenfalls per Dropdown aus plausiblen
  Vorschlägen (aktuell gemeldeter Wert, typische Zustände der
  Entity-Domäne) gewählt oder frei über "Eigener Wert ..." eingetippt,
  dazu ein grafischer Farbwähler (Klick auf das Farbfeld öffnet die
  Systemfarbauswahl) plus Textfeld für erweiterte CSS-Werte
  (`rgb()`/`hsl()`/`var(--...)`).
- "Aktuellen Zustand übernehmen"-Knopf legt aus dem gerade live gemeldeten
  Rohwert direkt eine neue Farbregel an.
- Da Home Assistant beim Bearbeiten einer Karte automatisch eine Live-
  Vorschau über dem Editor anzeigt, wirkt sich jede Änderung sofort sichtbar
  aus (WYSIWYG) - das übernimmt Home Assistants Editor-Dialog selbst, ohne
  eigenen Zusatzaufwand dieser Karte. Diese Live-Vorschau bewegt sich live
  mit, während man einen Marker auf der editor-eigenen Positionier-Fläche
  zieht.

## Installation (manuell, ohne HACS)

1. Datei `ui-karte.js` nach
   `<Home-Assistant-Konfigurationsverzeichnis>/www/` kopieren (Ordner `www`
   im Zweifel selbst anlegen, falls noch nicht vorhanden - alles darin ist
   automatisch unter `/local/...` erreichbar).
2. Einstellungen → Dashboards → oben rechts die drei Punkte →
   **Ressourcen** → **+ Ressource hinzufügen**.
   - URL: `/local/ui-karte.js`
   - Ressourcentyp: **JavaScript-Modul**
3. Seite einmal neu laden (F5) - danach steht der Kartentyp
   **"UI Karte"** in der normalen Kartenauswahl zur
   Verfügung.

## Installation über HACS

Dieses Repository lässt sich als benutzerdefiniertes HACS-Repository
(Kategorie "Frontend") hinzufügen. Siehe die separate `hacs.json` in diesem
Ordner bzw. die Anleitung im Repository selbst.

## Karte hinzufügen

1. Auf einem Dashboard **Bearbeiten** → **+ Karte hinzufügen**.
2. Nach "UI Karte" suchen (oder unten in der Liste, Kategorie
   "Von diesem Server").
3. Es öffnet sich direkt der grafische Editor mit Live-Vorschau - Titel
   vergeben, dann Canvas-Höhe festlegen und Text-/Sensor-/Listen-Elemente
   hinzufügen und per Maus positionieren.

Alternativ funktioniert auch die YAML-Ansicht des Karten-Editors, z. B.:

```yaml
type: custom:ui-karte
title: "Eingangsbereich"
show_icon: true
show_state: true
show_unit: true
canvas:
  height: 300
  background_color: ""
  background_image: "/local/grundriss.png"
elements:
  - type: sensor
    entity: binary_sensor.haustuer
    name: "Haustür"
    attribute: ""
    x: 25
    y: 40
    colors:
      - state: "on"
        color: "#db4437"
      - state: "off"
        color: "#4caf50"
  - type: text
    text: "Eingang"
    x: 25
    y: 20
    font_size: 18
    bold: true
    align: center
  - type: list
    x: 70
    y: 60
    width: 50
    dense: false
    entities:
      - entity: sensor.aussentemperatur
        colors: []
      - entity: light.wohnzimmer
        colors:
          - state: "on"
            color: "#ffc107"
```

## Positionierung per Maus

1. **Canvas-Einstellungen**: Höhe in Pixeln, optionale Hintergrundfarbe,
   optionale Hintergrundbild-URL (z. B. ein Grundriss unter `/local/...`).
2. Eine **Positionier-Fläche** in genau dieser Höhe: unten "Text
   hinzufügen", "Liste hinzufügen" oder über den Entity-Picker einen
   Sensor hinzufügen - das neue Element erscheint als kleiner, mit der Maus
   greifbarer Marker in der Mitte der Fläche. Marker anklicken, halten und
   an die gewünschte Stelle ziehen (auch touch-fähig) - die Position wird
   laufend gespeichert, und die von Home Assistant über dem Editor
   angezeigte echte Kartenvorschau bewegt sich dabei live mit.
3. Eine **Elementeliste** darunter mit einem aufklappbaren Eintrag je
   Element: X/Y-Position auch als Zahl eingebbar (für pixelgenaues
   Justieren ohne Maus), dazu je nach Typ:
   - **Text**: Textinhalt, Schriftgröße, Ausrichtung, Farbe, Fett.
   - **Sensor**: Entity, Anzeigename, Icon, Zustand/Attribut-Dropdown sowie
     Zustand-\>Farbe-Zuordnung.
   - **Liste**: Breite (%), kompakte Zeilen ein/aus, dazu eine eigene,
     verschachtelte Sensoren-Liste (jeder Eintrag mit denselben Feldern wie
     ein einzelnes Sensor-Element).
   - Pfeil-Buttons ändern die Vordergrund-/Hintergrund-Reihenfolge
     (überlappende Elemente), der Papierkorb-Button entfernt das Element.

## Konfigurationsschlüssel

| Schlüssel | Bedeutung | Standard |
| --- | --- | --- |
| `title` | Kartentitel, leer = kein Titel | `""` |
| `show_icon` | Icon je Sensor anzeigen | `true` |
| `show_state` | Zustand/Attributwert je Sensor anzeigen | `true` |
| `show_unit` | Einheit (`unit_of_measurement`) an Zahlenwerte des Hauptzustands anhängen | `true` |
| `canvas` | Canvas-Einstellungen, siehe unten | s. u. |
| `elements` | Liste der Text-/Sensor-/Listen-Elemente, siehe unten | `[]` |

`canvas`:

| Schlüssel | Bedeutung | Standard |
| --- | --- | --- |
| `height` | Höhe der Canvas in Pixeln | `300` |
| `background_color` | Optionale Hintergrundfarbe | `""` |
| `background_image` | Optionale Hintergrundbild-URL | `""` |

Je Eintrag in `elements`, gemeinsame Felder:

| Schlüssel | Bedeutung |
| --- | --- |
| `type` | `sensor`, `text` oder `list` |
| `x` / `y` | Position in Prozent (0-100), bezeichnet den Mittelpunkt des Elements |

Zusätzlich bei `type: sensor`: `entity`, `name` (Anzeigename, leer =
`friendly_name`), `icon` (leer = Icon der Entity bzw. ein
Domänen-Standardicon), `attribute` (leer = Hauptzustand, sonst ein
Attributname), `default_color`, `colors` (siehe unten).

Zusätzlich bei `type: text`: `text` (Inhalt), `font_size` (Pixel, Standard
`16`), `color` (leer = Theme-Standard), `bold` (`true`/`false`), `align`
(`left`/`center`/`right`).

Zusätzlich bei `type: list`: `width` (Prozent der Canvas-Breite, Standard
`60`), `dense` (kompaktere Zeilenhöhe, Standard `false`), `entities` (Liste
von Sensoren, je Eintrag identisch zu den `sensor`-Feldern `entity`/
`name`/`icon`/`attribute`/`default_color`/`colors` oben - ohne eigenes
`x`/`y`, da die Position über das umschließende `list`-Element bestimmt
wird).

**Wie die Wert-\>Farbe-Zuordnung funktioniert:** Der Rohwert eines Sensors
(Hauptzustand `state.state`, oder bei gesetztem `attribute` der Wert
`state.attributes[attribute]`) wird exakt (ohne Groß-/Kleinschreibung,
getrimmt) mit dem hinterlegten `state`-Wert jeder `colors`-Regel
verglichen - die erste Übereinstimmung gewinnt. Trifft keine zu, greift
`default_color`, sonst bleibt das Icon in der vom aktuellen
Home-Assistant-Theme vorgegebenen Standardfarbe. Es handelt sich bewusst um
eine einfache, exakte Zuordnung - keine Zahlen-Schwellenwerte (z. B. "Akku
< 20 %") oder Vorlagen/Templates.

Für gängige Domänen (`binary_sensor`, `switch`, `input_boolean`, `light`,
`lock`, `cover`) legt der Editor beim Hinzufügen eines Sensors automatisch
sinnvolle Start-Farben an (z. B. `on`/`off` bei `binary_sensor` rot/grün) -
das bleibt jederzeit im Editor änder- oder löschbar.

## Migration von älteren Versionen

Frühere Versionen dieser Karte kannten noch ein eigenständiges
Listen-Layout (`layout: list` mit einer top-level `entities`-Liste). Eine
so aufgebaute, bereits gespeicherte Konfiguration wird beim Laden
automatisch und **verlustfrei** in ein neues `list`-Element auf der Canvas
umgewandelt (inklusive einer groben Anpassung der Canvas-Höhe, damit alle
Zeilen sichtbar bleiben). Nichts weiter nötig - sobald im grafischen Editor
irgendetwas geändert wird, wird die neue Struktur dauerhaft gespeichert.

## Bekannte Einschränkungen

- Wie bei der `fritzbox-anrufe-card` gilt: "Bild" bzw. "Symbol" bedeutet
  hier ein **mdi-Vektor-Icon** (`<ha-icon>`), keine hochgeladene
  Rasterbild-Datei - nur ein Vektor-Icon lässt sich per CSS zuverlässig
  einfärben. Ein beliebiges hochgeladenes Bild könnte technisch nicht auf
  dieselbe Art eingefärbt werden.
- Diese Karte wurde ohne eine laufende Home-Assistant-Instanz entwickelt
  (keine echte Hardware-/Frontend-Version zum Testen verfügbar) und ist
  daher nicht an echter Hardware bestätigt. Die Kernlogik (Farbzuordnung,
  Migration, Editor-Zustandsverwaltung) ist automatisiert getestet; falls
  sich `<ha-entity-picker>` oder `<ha-form>` in einer bestimmten
  Home-Assistant-Frontend-Version anders verhalten als erwartet, bitte
  melden.
- Die Attribut-Dropdown-Liste wird beim Öffnen/Aufbauen des jeweiligen
  Editor-Abschnitts aus den zu diesem Zeitpunkt gemeldeten Attributen der
  gewählten Entity befüllt - meldet eine Entity erst später ein neues
  Attribut, taucht es im Dropdown nicht automatisch nach, sondern erst nach
  einem erneuten Öffnen des Editors. Ein Attributname lässt sich in der
  Zwischenzeit jederzeit über "Anderes Attribut ..." frei eintippen.
- Ein Klick auf eine Sensorzeile bzw. ein Sensor-Element öffnet den
  Standard-"Mehr Informationen"-Dialog der jeweiligen Entity; ein eigenes,
  konfigurierbares Klickverhalten (`tap_action` u. ä.) gibt es (noch) nicht.
- Das Ziehen der Marker nutzt Pointer Events
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
  verändert) - Schriftgröße bei Text-Elementen bzw. Breite bei
  Listen-Elementen ist über ein eigenes Zahlenfeld einstellbar, eine
  direkte Größenänderung per Ziehen gibt es (noch) nicht.
