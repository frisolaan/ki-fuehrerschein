export type Auftrag = { vorspann: string; punkte: string[] };

export type Station = {
  nr: number;
  id: string;
  nutzungsart: string;
  verb: string;
  untertitel: string;
  perspektive: string;
  zeitrahmen: string;
  arbeitsweise: string;
  kompetenzsatz: string;
  akzent: string;
  braucht: string[];
  wp1: { worum: string; leitfrage: string; tor: string };
  wp2: { prompt: string; hinweis: string; tor: string };
  wp3: {
    auftrag: Auftrag;
    suchraum: string;
    hilfe: string[];
    nachschlagen: string;
    arbeitsspur: string;
    tor: string;
  };
  wp4: {
    vorspann: string;
    mechanismusfrage: string;
    gegenprobe: string;
    denkanstoss: string;
    vertiefung: string;
    tor: string;
  };
  wp5: { doku: Auftrag; learningview: string; tor: string };
  wp6: {
    wirkungsfrage: string;
    kuer: string;
    bestanden: string;
    weiter_zu: string;
  };
  lp: {
    kurz: string;
    worum: string;
    zielstufen: string[];
    sozialformen: string;
    herausforderungen: string[];
    rolle: string[];
    material: string[];
    reality_check: string;
    differenzierung: string;
    lp21: string;
    interaktiv: { typ: string; inhalt: string };
  };
};

export type Inhalt = {
  titel: string;
  einheit: string;
  version: string;
  stand: string;
  lizenz: string;
  stationen: Station[];
};

export type Modus = "zweit" | "allein";

export type Eintrag = {
  arbeitsspur: string;
  kriterium: string;
  haertefall: string;
  haertefallQuelle: "partner" | "bank" | "";
  partnerName: string;
  partnerBestaetigt: boolean;
  pruefung: string;
  kriteriumFinal: string;
  mechanismus: string;
  ertrag: string;
  wirkung: string;
  tore: Record<number, boolean>;
};

export type Zustand = {
  modus: Modus | null;
  name: string;
  klasse: string;
  eintraege: Record<number, Eintrag>;
};

export const leererEintrag = (): Eintrag => ({
  arbeitsspur: "",
  kriterium: "",
  haertefall: "",
  haertefallQuelle: "",
  partnerName: "",
  partnerBestaetigt: false,
  pruefung: "",
  kriteriumFinal: "",
  mechanismus: "",
  ertrag: "",
  wirkung: "",
  tore: {},
});
