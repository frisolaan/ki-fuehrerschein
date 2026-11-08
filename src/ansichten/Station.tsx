import { useEffect, useState } from "react";
import { Eintrag, Modus, Station as StationTyp } from "../typen";
import {
  Achteck,
  Feld,
  GestufteHilfe,
  Kachel,
  KopierKnopf,
  Marke,
  Tor,
} from "../bausteine";
import {
  erreichbar,
  gegenprobeVollstaendig,
  regelVon,
  stationFertig,
  textblock,
  torFrei,
  torGesetzt,
} from "../tore";
import Gegenprobe from "./Gegenprobe";

type Props = {
  station: StationTyp;
  eintrag: Eintrag;
  modus: Modus;
  name: string;
  aendern: (teil: Partial<Eintrag>) => void;
  gehZu: (ziel: string) => void;
};

const WEGPUNKTE = [1, 2, 3, 4, 5, 6];
const TITEL: Record<number, string> = {
  1: "Worum es geht",
  2: "Der erste Versuch",
  3: "Dein Auftrag",
  4: "Mechanismus und Gegenprobe",
  5: "Dein Ertrag",
  6: "Wirkung",
};

export default function Station({
  station,
  eintrag,
  modus,
  name,
  aendern,
  gehZu,
}: Props) {
  const [wp, setWp] = useState(() => {
    const offen = WEGPUNKTE.find((n) => !torGesetzt(n, eintrag));
    return offen ?? 6;
  });
  const [inGegenprobe, setInGegenprobe] = useState(false);
  const [denkanstossOffen, setDenkanstossOffen] = useState(false);

  // Beim Stationswechsel beim ersten offenen Wegpunkt beginnen.
  useEffect(() => {
    const offen = WEGPUNKTE.find((n) => !torGesetzt(n, eintrag));
    setWp(offen ?? 6);
    setInGegenprobe(false);
    setDenkanstossOffen(false);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station.nr]);

  const setzeTor = (nummer: number, wert: boolean) => {
    aendern({ tore: { ...eintrag.tore, [nummer]: wert } });
    if (wert && nummer < 6) {
      setWp(nummer + 1);
      window.scrollTo(0, 0);
    }
  };

  // Die Masken führen fünf Tore (WEITER_1 … WEITER_5). Wegpunkt 6 hat keines –
  // dort steht der Satz unten, damit der Wegpunkt denselben Abschluss hat.
  const TORTEXT: Record<number, string> = {
    1: station.wp1.tor,
    2: station.wp2.tor,
    3: station.wp3.tor,
    4: station.wp4.tor,
    5: station.wp5.tor,
    6: "du die Wirkungsfrage beantwortet hast.",
  };

  const tor = (nummer: number, hinweis: string) => (
    <Tor
      text={TORTEXT[nummer]}
      gesetzt={torGesetzt(nummer, eintrag)}
      frei={torFrei(nummer, eintrag, modus)}
      hinweis={hinweis}
      setzen={(w) => setzeTor(nummer, w)}
    />
  );

  if (inGegenprobe) {
    return (
      <Gegenprobe
        station={station}
        eintrag={eintrag}
        modus={modus}
        name={name}
        aendern={aendern}
        fertig={() => {
          setInGegenprobe(false);
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  return (
    <div className="station" style={{ ["--akzent" as string]: station.akzent }}>
      <header className="stationskopf">
        <div className="sk-zeile">
          <Achteck zahl={station.nr} stand="aktiv" />
          <div>
            <h1>
              {station.nutzungsart} <span className="verb">{station.verb}</span>
            </h1>
            <p className="sk-unter">{station.untertitel}</p>
          </div>
        </div>
        <p className="sk-satz">{station.kompetenzsatz}</p>
      </header>

      <nav className="schiene" aria-label="Wegpunkte">
        {WEGPUNKTE.map((n) => {
          const offen = erreichbar(n, eintrag);
          const stand = torGesetzt(n, eintrag)
            ? "fertig"
            : n === wp
              ? "aktiv"
              : offen
                ? "offen"
                : "gesperrt";
          return (
            <button
              key={n}
              className="schienenpunkt"
              disabled={!offen}
              onClick={() => {
                setWp(n);
                window.scrollTo(0, 0);
              }}
              title={TITEL[n]}
            >
              <Achteck zahl={n} stand={stand} />
              <span className="sp-titel">{TITEL[n]}</span>
            </button>
          );
        })}
      </nav>

      {wp === 1 && (
        <>
          <Kachel marke="Worum geht's">
            <p>{station.wp1.worum}</p>
          </Kachel>
          <Kachel marke="Leitfrage" ton="dunkel">
            <p className="leitfrage">{station.wp1.leitfrage}</p>
          </Kachel>
          <Kachel marke="Das brauchst du">
            <ul>
              {station.braucht.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p className="klein">
              {station.arbeitsweise} · {station.zeitrahmen}
            </p>
          </Kachel>
          {tor(1, "")}
        </>
      )}

      {wp === 2 && (
        <>
          <Kachel marke="Gib das genau so ein">
            <pre className="prompt">{station.wp2.prompt}</pre>
            <KopierKnopf text={station.wp2.prompt} beschriftung="Prompt kopieren" />
          </Kachel>
          <Kachel marke="Worauf du achtest">
            <p>{station.wp2.hinweis}</p>
          </Kachel>
          {tor(2, "")}
        </>
      )}

      {wp === 3 && (
        <>
          <Kachel marke="Auftrag">
            {station.wp3.auftrag.vorspann && (
              <p className="vorspann">{station.wp3.auftrag.vorspann}</p>
            )}
            <ol className="punkte">
              {station.wp3.auftrag.punkte.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </Kachel>
          <Kachel marke="Suchraum">
            <p>{station.wp3.suchraum}</p>
          </Kachel>
          <GestufteHilfe stufen={station.wp3.hilfe} />
          <Feld
            marke="Arbeitsspur"
            hinweis={station.wp3.arbeitsspur}
            wert={eintrag.arbeitsspur}
            setzen={(w) => aendern({ arbeitsspur: w })}
            zeilen={7}
          />
          <Feld
            marke="Deine Regel – ein Satz"
            hinweis="Nicht «die KI irrt manchmal», sondern: bei welcher Art von Fall."
            wert={eintrag.kriterium}
            setzen={(w) => aendern({ kriterium: w })}
            zeilen={3}
          />
          {tor(3, "Arbeitsspur und Regel müssen ausgefüllt sein.")}
        </>
      )}

      {wp === 4 && (
        <>
          <Kachel marke="Mechanismus">
            {station.wp4.vorspann && (
              <p className="vorspann">{station.wp4.vorspann}</p>
            )}
            <p className="leitfrage">{station.wp4.mechanismusfrage}</p>
          </Kachel>

          {denkanstossOffen ? (
            <div className="hilfe">
              <Marke>Denkanstoss</Marke>
              <p className="hilfe-text">{station.wp4.denkanstoss}</p>
            </div>
          ) : (
            <button className="knopf leise" onClick={() => setDenkanstossOffen(true)}>
              Denkanstoss zeigen
            </button>
          )}

          <Feld
            marke="Warum die KI hier so reagiert"
            wert={eintrag.mechanismus}
            setzen={(w) => aendern({ mechanismus: w })}
            zeilen={5}
          />

          <Kachel marke="Gegenprobe" ton={gegenprobeVollstaendig(eintrag, modus) ? "hell" : "warn"}>
            <p>{station.wp4.gegenprobe}</p>
            {gegenprobeVollstaendig(eintrag, modus) ? (
              <>
                <div className="gp-ergebnis">
                  <Marke>Härtefall</Marke>
                  <p>{eintrag.haertefall}</p>
                  {modus === "zweit" ? (
                    <p className="klein">
                      Gegengelesen von {eintrag.partnerName} · bestätigt
                    </p>
                  ) : (
                    <>
                      <Marke>Deine Prüfung</Marke>
                      <p>{eintrag.pruefung}</p>
                    </>
                  )}
                </div>
                <button className="knopf leise" onClick={() => setInGegenprobe(true)}>
                  Gegenprobe wiederholen
                </button>
              </>
            ) : (
              <>
                <p className="klein">
                  {modus === "zweit"
                    ? "Dafür gibst du das Gerät weiter. Ohne fremden Härtefall geht es nicht weiter."
                    : "Du arbeitest allein – es gibt vorbereitete Härtefälle."}
                </p>
                <button
                  className="knopf stark"
                  style={{ background: station.akzent }}
                  disabled={!eintrag.kriterium.trim()}
                  onClick={() => {
                    setInGegenprobe(true);
                    window.scrollTo(0, 0);
                  }}
                >
                  Gegenprobe starten
                </button>
                {!eintrag.kriterium.trim() && (
                  <p className="tor-hinweis">
                    Zuerst braucht es eine Regel auf Wegpunkt 3.
                  </p>
                )}
              </>
            )}
          </Kachel>

          <Feld
            marke="Deine Regel, nachgeschärft"
            hinweis="Hält sie, schreib sie unverändert hin. Hält sie nicht, schärfe nach."
            wert={eintrag.kriteriumFinal}
            setzen={(w) => aendern({ kriteriumFinal: w })}
            zeilen={3}
            platzhalter={eintrag.kriterium}
          />
          {tor(
            4,
            "Mechanismus, bestandene Gegenprobe und die nachgeschärfte Regel fehlen noch.",
          )}
        </>
      )}

      {wp === 5 && (
        <>
          <Kachel marke="Das gehört in deinen Ertrag">
            {station.wp5.doku.vorspann && (
              <p className="vorspann">{station.wp5.doku.vorspann}</p>
            )}
            <ul>
              {station.wp5.doku.punkte.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Kachel>
          <Feld
            marke="Ertrag"
            hinweis="Beleg, Beispiel, Vorher-Nachher – was aus deiner Arbeit übrig bleibt."
            wert={eintrag.ertrag}
            setzen={(w) => aendern({ ertrag: w })}
            zeilen={7}
          />
          <Kachel marke="Abgabe in LearningView" ton="dunkel">
            <p>{station.wp5.learningview}</p>
            <div className="abgabe">
              <KopierKnopf
                text={textblock(station, eintrag, modus)}
                beschriftung="Alles als Textblock kopieren"
              />
              <span className="klein">
                Einfügen in LearningView. Die App schickt nichts selbst ab.
              </span>
            </div>
          </Kachel>
          {tor(5, "Der Ertrag muss ausgefüllt sein.")}
        </>
      )}

      {wp === 6 && (
        <>
          <Kachel marke="Wirkungsfrage" ton="dunkel">
            <p className="leitfrage">{station.wp6.wirkungsfrage}</p>
          </Kachel>
          <Feld
            marke="Deine Antwort"
            wert={eintrag.wirkung}
            setzen={(w) => aendern({ wirkung: w })}
            zeilen={5}
          />
          <Kachel marke="Bestanden heisst">
            <p>{station.wp6.bestanden}</p>
            <p className="klein">
              Ob das erreicht ist, stellt nicht diese App fest, sondern deine
              Lehrperson – anhand deines Eintrags in LearningView.
            </p>
          </Kachel>
          {station.wp6.kuer && (
            <Kachel marke="Kür">
              <p>{station.wp6.kuer}</p>
            </Kachel>
          )}
          {tor(6, "Die Antwort auf die Wirkungsfrage fehlt.")}

          {stationFertig(eintrag) && (
            <div className="abschluss">
              <Marke>Deine Regel aus Station {station.nr}</Marke>
              <p className="regel">{regelVon(eintrag)}</p>
              <div className="gp-knopfreihe">
                {station.nr < 4 ? (
                  <button
                    className="knopf stark"
                    onClick={() => gehZu(`/station/${station.nr + 1}`)}
                  >
                    Weiter zu {station.wp6.weiter_zu}
                  </button>
                ) : (
                  <button className="knopf stark" onClick={() => gehZu("/regelblatt")}>
                    Zum Regelblatt
                  </button>
                )}
                <button className="knopf leise" onClick={() => gehZu("/")}>
                  Übersicht
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
