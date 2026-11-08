import { Eintrag, Inhalt, Modus } from "../typen";
import { KopierKnopf, Marke } from "../bausteine";
import { regelVon, stationFertig, textblock } from "../tore";

type Props = {
  inhalt: Inhalt;
  eintraege: Record<number, Eintrag>;
  modus: Modus;
  name: string;
  klasse: string;
  gehZu: (ziel: string) => void;
};

export default function Regelblatt({
  inhalt,
  eintraege,
  modus,
  name,
  klasse,
  gehZu,
}: Props) {
  const alleTexte = inhalt.stationen
    .map((s) => textblock(s, eintraege[s.nr], modus))
    .join("\n\n––––––––––\n\n");

  return (
    <div className="regelblatt">
      <div className="rb-steuerung">
        <button className="knopf leise" onClick={() => gehZu("/")}>
          Zurück
        </button>
        <div className="rb-knoepfe">
          <KopierKnopf text={alleTexte} beschriftung="Alle vier Textblöcke kopieren" />
          <button className="knopf stark" onClick={() => window.print()}>
            Drucken
          </button>
        </div>
      </div>

      <article className="blatt">
        <header className="blattkopf">
          <Marke>{inhalt.einheit} · {inhalt.titel}</Marke>
          <h1>Vier Regeln, selbst geschrieben</h1>
          <div className="blattperson">
            <span>
              <small>Name</small>
              <b>{name || " "}</b>
            </span>
            <span>
              <small>Klasse</small>
              <b>{klasse || " "}</b>
            </span>
            <span>
              <small>Datum</small>
              <b>{new Date().toLocaleDateString("de-CH")}</b>
            </span>
          </div>
        </header>

        {inhalt.stationen.map((s) => {
          const e = eintraege[s.nr];
          const regel = regelVon(e);
          return (
            <section
              key={s.nr}
              className="blattregel"
              style={{ ["--akzent" as string]: s.akzent }}
            >
              <div className="br-kopf">
                <span className="br-nr">{s.nr}</span>
                <div>
                  <strong>{s.nutzungsart}</strong>
                  <span className="verb">{s.verb}</span>
                </div>
                {!stationFertig(e) && <span className="br-offen">offen</span>}
              </div>
              {regel ? (
                <p className="br-regel">{regel}</p>
              ) : (
                <p className="br-linien">
                  <span />
                  <span />
                </p>
              )}
              {e.mechanismus.trim() && (
                <p className="br-mechanismus">
                  <small>Warum die KI so reagiert</small>
                  {e.mechanismus}
                </p>
              )}
            </section>
          );
        })}

        <footer className="blattfuss">
          <p>
            Dieses Blatt ist kein Nachweis. Der Nachweis ist die Dokumentation in
            LearningView mit der Mitzeichnung der Gegenprobe – beurteilt wird sie
            von der Lehrperson.
          </p>
          <p className="klein">
            {inhalt.einheit} · Version {inhalt.version} · {inhalt.stand} ·{" "}
            {inhalt.lizenz}
          </p>
        </footer>
      </article>
    </div>
  );
}
