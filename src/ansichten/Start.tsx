import { Eintrag, Inhalt, Modus } from "../typen";
import { Achteck, Kachel, Marke } from "../bausteine";
import { regelVon, stationFertig, torGesetzt } from "../tore";

type Props = {
  inhalt: Inhalt;
  modus: Modus | null;
  name: string;
  klasse: string;
  eintraege: Record<number, Eintrag>;
  setzeModus: (m: Modus) => void;
  setzeName: (n: string) => void;
  setzeKlasse: (k: string) => void;
  gehZu: (ziel: string) => void;
};

const fortschritt = (e: Eintrag) =>
  [1, 2, 3, 4, 5, 6].filter((n) => torGesetzt(n, e)).length;

export default function Start({
  inhalt,
  modus,
  name,
  klasse,
  eintraege,
  setzeModus,
  setzeName,
  setzeKlasse,
  gehZu,
}: Props) {
  const fertigeStationen = inhalt.stationen.filter((s) =>
    stationFertig(eintraege[s.nr]),
  ).length;

  return (
    <div className="start">
      <header className="startkopf">
        <Marke>{inhalt.einheit}</Marke>
        <h1>{inhalt.titel}</h1>
        <p className="startlead">
          Vier Stationen. An jeder bringst du eine KI gezielt an ihre Grenze,
          schreibst daraus eine eigene Regel und verteidigst sie gegen einen
          Fall, der sie aushebeln soll. Am Ende hast du vier Regeln, die du
          selbst formuliert hast.
        </p>
      </header>

      {!modus ? (
        <Kachel marke="Zuerst: Wie arbeitest du?">
          <p>
            Die Gegenprobe ist der Kern dieser Einheit – jemand sucht den Fall,
            den deine Regel nicht erwischt. Am besten macht das ein Mensch.
          </p>
          <div className="moduswahl">
            <button className="moduskarte" onClick={() => setzeModus("zweit")}>
              <strong>Zu zweit</strong>
              <span>
                Ihr habt ein Gerät und wechselt euch ab. Für die Gegenprobe gibst
                du das Gerät weiter, dein Partner trägt den Härtefall ein und
                zeichnet mit.
              </span>
              <em>Empfohlen</em>
            </button>
            <button className="moduskarte" onClick={() => setzeModus("allein")}>
              <strong>Allein</strong>
              <span>
                Niemand da zum Gegenlesen. Statt eines Partners kommen
                vorbereitete Härtefälle – prüfen musst du selbst und schriftlich.
              </span>
            </button>
          </div>
        </Kachel>
      ) : (
        <>
          <Kachel marke="Dein Blatt">
            <div className="personzeile">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setzeName(e.target.value)}
                  placeholder="Vorname"
                />
              </label>
              <label>
                <span>Klasse</span>
                <input
                  type="text"
                  value={klasse}
                  onChange={(e) => setzeKlasse(e.target.value)}
                  placeholder="z. B. 2b"
                />
              </label>
              <p className="klein">
                Bleibt in diesem Browser. Nichts wird übermittelt.{" "}
                {modus === "zweit" ? "Modus: zu zweit." : "Modus: allein."}{" "}
                <button className="textknopf" onClick={() => setzeModus(modus === "zweit" ? "allein" : "zweit")}>
                  wechseln
                </button>
              </p>
            </div>
          </Kachel>

          <div className="stationsliste">
            {inhalt.stationen.map((s) => {
              const e = eintraege[s.nr];
              const getan = fortschritt(e);
              const regel = regelVon(e);
              return (
                <button
                  key={s.nr}
                  className="stationskarte"
                  style={{ ["--akzent" as string]: s.akzent }}
                  onClick={() => gehZu(`/station/${s.nr}`)}
                >
                  <div className="stk-kopf">
                    <Achteck
                      zahl={s.nr}
                      stand={stationFertig(e) ? "fertig" : getan ? "aktiv" : "offen"}
                    />
                    <div>
                      <strong>{s.nutzungsart}</strong>
                      <span className="verb">{s.verb}</span>
                    </div>
                  </div>
                  <p className="stk-unter">{s.untertitel}</p>
                  {regel ? (
                    <p className="stk-regel">«{regel}»</p>
                  ) : (
                    <p className="stk-leer">noch keine Regel</p>
                  )}
                  <div className="stk-balken" aria-hidden>
                    <span style={{ width: `${(getan / 6) * 100}%` }} />
                  </div>
                  <span className="klein">{getan} von 6 Wegpunkten</span>
                </button>
              );
            })}
          </div>

          <div className="startfuss">
            <button className="knopf" onClick={() => gehZu("/regelblatt")}>
              Regelblatt ansehen ({fertigeStationen} von 4)
            </button>
            <button className="knopf leise" onClick={() => gehZu("/lehrpersonen")}>
              Für Lehrpersonen
            </button>
          </div>
        </>
      )}
    </div>
  );
}
