import { ReactNode, useState } from "react";

export function Achteck({
  zahl,
  stand,
  titel,
}: {
  zahl: number | string;
  stand?: "offen" | "aktiv" | "fertig" | "gesperrt";
  titel?: string;
}) {
  return (
    <span className={`achteck ${stand ?? "offen"}`} title={titel}>
      {zahl}
    </span>
  );
}

export function Marke({ children }: { children: ReactNode }) {
  return <div className="marke">{children}</div>;
}

export function Kachel({
  marke,
  children,
  ton,
}: {
  marke?: string;
  children: ReactNode;
  ton?: "hell" | "dunkel" | "warn";
}) {
  return (
    <section className={`kachel ${ton ?? "hell"}`}>
      {marke && <Marke>{marke}</Marke>}
      {children}
    </section>
  );
}

/** Das «Weiter, wenn»-Tor. Ohne Haken geht es nicht weiter. */
export function Tor({
  text,
  gesetzt,
  frei,
  hinweis,
  setzen,
}: {
  text: string;
  gesetzt: boolean;
  frei: boolean;
  hinweis?: string;
  setzen: (wert: boolean) => void;
}) {
  return (
    <div className={`tor ${gesetzt ? "zu" : frei ? "frei" : "gesperrt"}`}>
      <label>
        <input
          type="checkbox"
          checked={gesetzt}
          disabled={!frei && !gesetzt}
          onChange={(e) => setzen(e.target.checked)}
        />
        <span>
          <b>Weiter, wenn</b> {text}
        </span>
      </label>
      {!frei && !gesetzt && hinweis && <p className="tor-hinweis">{hinweis}</p>}
    </div>
  );
}

/**
 * Gestufte Hilfe: Suchräume, keine Lösungen – und nie alle Stufen gleichzeitig
 * sichtbar, sonst wird die Abkürzung attraktiver als der Weg.
 */
export function GestufteHilfe({ stufen }: { stufen: string[] }) {
  const [offen, setOffen] = useState(0);
  const vorhanden = stufen.filter((s) => s.trim().length > 0);
  if (!vorhanden.length) return null;

  return (
    <div className="hilfe">
      <Marke>Festgefahren? Gestufte Hilfe</Marke>
      {offen === 0 ? (
        <button className="knopf leise" onClick={() => setOffen(1)}>
          Erste Stufe zeigen
        </button>
      ) : (
        <>
          <p className="hilfe-text">{vorhanden[offen - 1]}</p>
          <div className="hilfe-fuss">
            <span>
              Stufe {offen} von {vorhanden.length}
            </span>
            {offen < vorhanden.length && (
              <button className="knopf leise" onClick={() => setOffen(offen + 1)}>
                Nächste Stufe
              </button>
            )}
            <button className="knopf leise" onClick={() => setOffen(0)}>
              Zuklappen
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Feld({
  marke,
  hinweis,
  wert,
  setzen,
  zeilen,
  platzhalter,
}: {
  marke: string;
  hinweis?: string;
  wert: string;
  setzen: (w: string) => void;
  zeilen?: number;
  platzhalter?: string;
}) {
  return (
    <div className="feld">
      <Marke>{marke}</Marke>
      {hinweis && <p className="feld-hinweis">{hinweis}</p>}
      {zeilen && zeilen > 1 ? (
        <textarea
          rows={zeilen}
          value={wert}
          placeholder={platzhalter}
          onChange={(e) => setzen(e.target.value)}
        />
      ) : (
        <input
          type="text"
          value={wert}
          placeholder={platzhalter}
          onChange={(e) => setzen(e.target.value)}
        />
      )}
    </div>
  );
}

export function KopierKnopf({
  text,
  beschriftung = "Kopieren",
}: {
  text: string;
  beschriftung?: string;
}) {
  const [stand, setStand] = useState<"ruhe" | "ok" | "fehler">("ruhe");

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(text);
      setStand("ok");
    } catch {
      setStand("fehler");
    }
    setTimeout(() => setStand("ruhe"), 2500);
  }

  return (
    <button className="knopf" onClick={kopieren}>
      {stand === "ok"
        ? "Kopiert"
        : stand === "fehler"
          ? "Bitte von Hand markieren"
          : beschriftung}
    </button>
  );
}
