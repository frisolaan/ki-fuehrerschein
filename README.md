# KI-Führerschein · «Wer hat das Steuer?»

Lernweg durch die vier Stationen als Web-App. Vier Stationen, je sechs
Wegpunkte, am Ende vier selbst geschriebene Regeln.

Die App ersetzt die Challengekarte, nicht das Unterrichtssetting. Sie stellt
nichts fest und bewertet nichts: Der Nachweis bleibt die Dokumentation in
LearningView mit der Mitzeichnung der Gegenprobe, beurteilt von der
Lehrperson.

---

## Wie die Inhalte hierherkommen

**Die vier Word-Masken in `masken/` sind die Quelle.** Nicht die JSON-Datei,
nicht der Code. Wer eine Formulierung ändert, ändert sie in der Maske:

```bash
python3 werkzeug/masken-einlesen.py masken      # schreibt content/stationen.json
npm run dev                                      # ansehen
```

Dasselbe Maskenset speist den `KIF-Kartengenerator.html`, aus dem die
gedruckten Karten, Lehrpersonenblätter und LearningView-Blätter entstehen. Es
darf nur eine Kopie davon geben, sonst driften App und Papier auseinander.

`content/haertefaelle.json` wird **nicht** aus den Masken erzeugt. Dort stehen
die vorbereiteten Härtefälle für Lernende ohne Partner; sie dürfen frei
ergänzt werden.

---

## Entwickeln und veröffentlichen

```bash
npm install
npm run dev        # lokale Vorschau
npm run build      # Typprüfung und Produktionsbuild nach dist/
```

Für Vercel: Repository verbinden, Framework-Voreinstellung **Vite**, Build
`npm run build`, Ausgabeverzeichnis `dist`. `vercel.json` liegt bei.

Adressen laufen über das Hash, damit die App auch in einem Unterordner
funktioniert:

| Adresse | Was sie zeigt |
|---|---|
| `#/` | Übersicht und Moduswahl |
| `#/station/1` … `#/station/4` | die vier Stationen |
| `#/regelblatt` | das Regelblatt zum Drucken |
| `#/lehrpersonen` | fachlicher Hintergrund – nicht im Stationsbetrieb zeigen |

**Für die gedruckten QR-Codes:** Diese Adressen sind stabil und können die
Platzhalter `kif.example.ch` ersetzen, sobald eine eigene Domain mit
Weiterleitung steht. Die gestufte Hilfe und die Mechanismus-Erklärungen
stecken in der App selbst – dafür braucht es keine zusätzlichen Seiten mehr.

---

## Datenschutz

Kein Konto, kein Server, keine Datenbank. Alles, was Lernende eintragen,
bleibt in ihrem Browser (`localStorage`) und wird nirgendwohin übermittelt.
Der Textblock für LearningView wird in die Zwischenablage kopiert und von der
lernenden Person selbst eingefügt.

Folge davon: In einem privaten Fenster oder auf einem anderen Gerät sind die
Einträge weg. Die App weist darauf hin; der verlässliche Ort für Ergebnisse
ist LearningView.

Die App ruft selbst keine KI auf. Gearbeitet wird mit Copilot im Schulkonto –
also mit dem Werkzeug, das die Lernenden danach weiter haben.

---

## Die Gegenprobe

Sie ist in dieser Einheit das Prüfinstrument, nicht die Zugabe. Deshalb ist
sie hier ein Tor und keine Bitte: Ohne fremden Härtefall und ohne
Mitzeichnung kommt niemand an Wegpunkt 4 vorbei.

- **Modus «zu zweit»** (Voreinstellung): Nach dem Formulieren der Regel
  erscheint ein Weitergabe-Bildschirm. Die Partnerin liest nur die Regel,
  trägt den Härtefall ein und zeichnet mit Namen mit.
- **Modus «allein»**: Statt eines Partners kommen drei vorbereitete
  Härtefälle. Jeder ist so gebaut, dass die naheliegende Regel an ihm
  vorbeigeht. Geprüft wird trotzdem schriftlich.

---

## Aufbau

```
content/stationen.json      aus den Masken erzeugt – nicht von Hand ändern
content/haertefaelle.json   von Hand gepflegt
masken/                     die vier Word-Masken, die Quelle
werkzeug/masken-einlesen.py Maske → JSON
src/typen.ts                Datenformen
src/tore.ts                 wann ein Wegpunkt weitergeht, Textblock-Erzeugung
src/speicher.ts             localStorage, abgesichert
src/bausteine.tsx           Tor, gestufte Hilfe, Kachel, Feld, Achteck
src/ansichten/              Start, Station, Gegenprobe, Regelblatt, Lehrpersonen
```

---

## Was noch fehlt

- Die vier interaktiven Aufgaben sind in den Masken spezifiziert, aber nicht
  gebaut (Sortieraufgabe, Dialog-Vergleich, Drei-Stapel-Sortierung,
  Lückensuche).
- Reality-Checks für die Stationen 2, 3 und 4 stehen aus. Hält Copilot bei
  Station 2 dem Widerspruch stand, muss der Auftrag dort umformuliert werden –
  in der Maske, nicht im Code.
- Der Ausweis bleibt Papier und Handschrift. Das Regelblatt aus der App ist
  die Vorstufe, nicht der Ersatz.

---

## Lizenz

Materialien und Inhalte: **CC BY-SA 4.0**. Der fachliche Hintergrund stützt
sich auf die NLQ-Lernangebote «KI verstehen. Zukunft gestalten.» (CC BY 4.0).
