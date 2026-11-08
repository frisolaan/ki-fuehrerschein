import { Eintrag, Modus, Station } from "./typen";

const gefuellt = (s: string) => s.trim().length > 0;

/**
 * Die Gegenprobe ist das Prüfinstrument der Einheit, nicht die Zugabe.
 * Deshalb ist sie hier ein Tor und keine Empfehlung: Ohne fremden Härtefall
 * und ohne schriftliche Prüfung des eigenen Kriteriums geht es nicht weiter.
 */
export function gegenprobeVollstaendig(e: Eintrag, modus: Modus): boolean {
  if (!gefuellt(e.haertefall)) return false;
  if (modus === "zweit") {
    return gefuellt(e.partnerName) && e.partnerBestaetigt;
  }
  return gefuellt(e.pruefung);
}

/** Was an einem Wegpunkt eingetragen sein muss, bevor sein Tor gesetzt werden darf. */
export function torFrei(wp: number, e: Eintrag, modus: Modus): boolean {
  switch (wp) {
    case 1:
    case 2:
      return true;
    case 3:
      return gefuellt(e.arbeitsspur) && gefuellt(e.kriterium);
    case 4:
      return (
        gefuellt(e.mechanismus) &&
        gegenprobeVollstaendig(e, modus) &&
        gefuellt(e.kriteriumFinal)
      );
    case 5:
      return gefuellt(e.ertrag);
    case 6:
      return gefuellt(e.wirkung);
    default:
      return false;
  }
}

export const torGesetzt = (wp: number, e: Eintrag) => e.tore[wp] === true;

/** Erreichbar ist ein Wegpunkt, wenn alle davor gesetzt sind. */
export function erreichbar(wp: number, e: Eintrag): boolean {
  for (let i = 1; i < wp; i++) if (!torGesetzt(i, e)) return false;
  return true;
}

export const stationFertig = (e: Eintrag) =>
  [1, 2, 3, 4, 5, 6].every((wp) => torGesetzt(wp, e));

export const regelVon = (e: Eintrag) =>
  (e.kriteriumFinal.trim() || e.kriterium.trim()).trim();

/** Der kopierfertige Block für LearningView. */
export function textblock(station: Station, e: Eintrag, modus: Modus): string {
  const zeilen: string[] = [
    `Station ${station.nr} · ${station.nutzungsart} · ${station.verb}`,
    "",
    "MEINE REGEL",
    regelVon(e) || "–",
    "",
    "ARBEITSSPUR",
    e.arbeitsspur.trim() || "–",
    "",
    "HÄRTEFALL DER GEGENPROBE",
    e.haertefall.trim() || "–",
  ];

  if (modus === "zweit") {
    zeilen.push(
      "",
      `Gegengelesen von: ${e.partnerName.trim() || "–"}${
        e.partnerBestaetigt ? " (bestätigt)" : ""
      }`,
    );
  } else {
    zeilen.push("", "MEINE PRÜFUNG DES HÄRTEFALLS", e.pruefung.trim() || "–");
  }

  zeilen.push(
    "",
    "WARUM DIE KI HIER SO REAGIERT",
    e.mechanismus.trim() || "–",
    "",
    "ERTRAG",
    e.ertrag.trim() || "–",
    "",
    "WIRKUNG",
    e.wirkung.trim() || "–",
  );

  return zeilen.join("\n");
}
