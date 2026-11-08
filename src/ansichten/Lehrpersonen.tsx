import { useState } from "react";
import { Inhalt } from "../typen";
import { Achteck, Kachel, Marke } from "../bausteine";

type Props = { inhalt: Inhalt; gehZu: (ziel: string) => void };

export default function Lehrpersonen({ inhalt, gehZu }: Props) {
  const [nr, setNr] = useState(1);
  const station = inhalt.stationen.find((s) => s.nr === nr) ?? inhalt.stationen[0];
  const lp = station.lp;

  return (
    <div className="lehrpersonen" style={{ ["--akzent" as string]: station.akzent }}>
      <div className="lp-steuerung">
        <button className="knopf leise" onClick={() => gehZu("/")}>
          Zurück
        </button>
        <p className="klein">
          Diese Seite gehört nicht in den Stationsbetrieb – sie nimmt die
          Stationen vorweg.
        </p>
      </div>

      <header className="startkopf">
        <Marke>Für Lehrpersonen</Marke>
        <h1>Hintergrund zu den vier Stationen</h1>
        <p className="startlead">
          Dieselben Angaben wie auf den gedruckten Lehrpersonenblättern. Wer die
          Einheit selbst durchläuft, bevor er sie unterrichtet, liest diese Seite
          erst danach.
        </p>
      </header>

      <nav className="lp-wahl">
        {inhalt.stationen.map((s) => (
          <button
            key={s.nr}
            className={`lp-reiter ${s.nr === nr ? "aktiv" : ""}`}
            style={{ ["--akzent" as string]: s.akzent }}
            onClick={() => setNr(s.nr)}
          >
            <Achteck zahl={s.nr} stand={s.nr === nr ? "aktiv" : "offen"} />
            <span>
              {s.nutzungsart} · {s.verb}
            </span>
          </button>
        ))}
      </nav>

      <Kachel marke="In einem Satz" ton="dunkel">
        <p>{lp.kurz}</p>
      </Kachel>

      <Kachel marke="Worum es didaktisch geht">
        <p>{lp.worum}</p>
      </Kachel>

      <Kachel marke="Reality-Check">
        <p>{lp.reality_check}</p>
      </Kachel>

      <Kachel marke="Rolle der Lehrperson">
        <ul>
          {lp.rolle.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Kachel>

      <Kachel marke="Wo es klemmt">
        <ul>
          {lp.herausforderungen.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </Kachel>

      <Kachel marke="Stufen, Sozialformen, Differenzierung">
        <ul>
          {lp.zielstufen.map((z, i) => (
            <li key={i}>{z}</li>
          ))}
        </ul>
        <p>{lp.sozialformen}</p>
        <p>{lp.differenzierung}</p>
      </Kachel>

      <Kachel marke="Material">
        <ul>
          {lp.material.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
        {lp.lp21 && <p className="klein">Lehrplan 21: {lp.lp21}</p>}
      </Kachel>

      <Kachel marke="Geplante interaktive Aufgabe">
        <p>
          <b>{lp.interaktiv.typ}:</b> {lp.interaktiv.inhalt}
        </p>
        <p className="klein">Spezifiziert, in dieser App noch nicht gebaut.</p>
      </Kachel>
    </div>
  );
}
