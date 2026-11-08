import { Zustand, leererEintrag } from "./typen";

const SCHLUESSEL = "kif-lernweg-v1";

export const frischerZustand = (): Zustand => ({
  modus: null,
  name: "",
  klasse: "",
  eintraege: {
    1: leererEintrag(),
    2: leererEintrag(),
    3: leererEintrag(),
    4: leererEintrag(),
  },
});

/**
 * Alles bleibt in diesem Browser. Kein Konto, kein Server, keine Übermittlung.
 * Deshalb muss jeder Zugriff abgesichert sein: In privaten Fenstern oder bei
 * gesperrten Website-Daten wirft der Zugriff, und die App soll dann trotzdem
 * laufen – nur ohne Gedächtnis.
 */
export function laden(): Zustand {
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    if (!roh) return frischerZustand();
    const gelesen = JSON.parse(roh) as Partial<Zustand>;
    const basis = frischerZustand();
    return {
      ...basis,
      ...gelesen,
      eintraege: {
        ...basis.eintraege,
        ...(gelesen.eintraege ?? {}),
      },
    };
  } catch {
    return frischerZustand();
  }
}

export function sichern(zustand: Zustand): void {
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand));
  } catch {
    /* ohne Gedächtnis weiterarbeiten */
  }
}

export function loeschen(): void {
  try {
    localStorage.removeItem(SCHLUESSEL);
  } catch {
    /* nichts zu tun */
  }
}
