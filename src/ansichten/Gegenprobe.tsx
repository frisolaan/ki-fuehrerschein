import { useState } from "react";
import { Eintrag, Modus, Station } from "../typen";
import { Feld, Kachel, Marke } from "../bausteine";
import { gegenprobeVollstaendig } from "../tore";
import haertefaelle from "../../content/haertefaelle.json";

type Props = {
  station: Station;
  eintrag: Eintrag;
  modus: Modus;
  name: string;
  aendern: (teil: Partial<Eintrag>) => void;
  fertig: () => void;
};

const bankFuer = (nr: number): string[] =>
  (haertefaelle.stationen as Record<string, string[]>)[String(nr)] ?? [];

export default function Gegenprobe({
  station,
  eintrag,
  modus,
  name,
  aendern,
  fertig,
}: Props) {
  // Bei Partnerarbeit zuerst die Geräteweitergabe, dann das Formular.
  const [schritt, setSchritt] = useState<"weitergabe" | "formular">(
    modus === "zweit" ? "weitergabe" : "formular",
  );
  const regel = eintrag.kriterium.trim();
  const vollstaendig = gegenprobeVollstaendig(eintrag, modus);

  if (modus === "zweit" && schritt === "weitergabe") {
    return (
      <div className="gegenprobe">
        <div className="gp-kopf" style={{ borderColor: station.akzent }}>
          <Marke>Gegenprobe · Station {station.nr}</Marke>
          <h2>Gib das Gerät weiter.</h2>
          <p className="gp-lead">
            Den nächsten Schritt macht nicht du, sondern deine Partnerin oder
            dein Partner. Lies selbst nicht mit.
          </p>
        </div>
        <Kachel ton="dunkel">
          <p className="gp-auftrag">{station.wp4.gegenprobe}</p>
        </Kachel>
        <div className="gp-knopfreihe">
          <button
            className="knopf stark"
            style={{ background: station.akzent }}
            onClick={() => setSchritt("formular")}
          >
            Ich habe das Gerät – weiter
          </button>
          <button className="knopf leise" onClick={fertig}>
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gegenprobe">
      <div className="gp-kopf" style={{ borderColor: station.akzent }}>
        <Marke>Gegenprobe · Station {station.nr}</Marke>
        <h2>
          {modus === "zweit"
            ? "Suche den Fall, den diese Regel nicht erwischt."
            : "Prüfe deine Regel am vorbereiteten Fall."}
        </h2>
      </div>

      <Kachel marke={`Die Regel von ${name.trim() || "der Person vor dir"}`}>
        <p className="gp-regel">{regel || "– noch keine Regel formuliert –"}</p>
      </Kachel>

      <Kachel marke="So steht es auf der Karte" ton="dunkel">
        <p className="gp-auftrag">{station.wp4.gegenprobe}</p>
      </Kachel>

      {modus === "zweit" ? (
        <>
          <Feld
            marke="Der Härtefall"
            hinweis="Ein Fall, an dem die Regel vorbeigeht. Kein Urteil über die Regel – ein Beispiel."
            wert={eintrag.haertefall}
            setzen={(w) => aendern({ haertefall: w, haertefallQuelle: "partner" })}
            zeilen={4}
            platzhalter="Ich habe folgenden Fall gefunden …"
          />
          <Feld
            marke="Wer gegengelesen hat"
            wert={eintrag.partnerName}
            setzen={(w) => aendern({ partnerName: w })}
            platzhalter="Vorname genügt"
          />
          <label className="mitzeichnung">
            <input
              type="checkbox"
              checked={eintrag.partnerBestaetigt}
              onChange={(e) => aendern({ partnerBestaetigt: e.target.checked })}
            />
            <span>
              Ich habe die Regel gelesen und diesen Fall selbst geprüft.
            </span>
          </label>
        </>
      ) : (
        <>
          <div className="bank">
            <Marke>Vorbereitete Härtefälle – einen auswählen</Marke>
            {bankFuer(station.nr).map((fall, i) => (
              <button
                key={i}
                className={`bankfall ${eintrag.haertefall === fall ? "gewaehlt" : ""}`}
                onClick={() => aendern({ haertefall: fall, haertefallQuelle: "bank" })}
              >
                {fall}
              </button>
            ))}
          </div>
          <Feld
            marke="Hält deine Regel?"
            hinweis="Erwischt sie diesen Fall – oder geht sie daran vorbei? Begründe in zwei Sätzen."
            wert={eintrag.pruefung}
            setzen={(w) => aendern({ pruefung: w })}
            zeilen={4}
          />
        </>
      )}

      <div className="gp-knopfreihe">
        <button
          className="knopf stark"
          style={{ background: vollstaendig ? station.akzent : undefined }}
          disabled={!vollstaendig}
          onClick={fertig}
        >
          {modus === "zweit" ? "Zurück an die Person" : "Weiter"}
        </button>
        {!vollstaendig && (
          <p className="tor-hinweis">
            {modus === "zweit"
              ? "Härtefall, Name und Mitzeichnung fehlen noch."
              : "Fall auswählen und die Prüfung schreiben."}
          </p>
        )}
      </div>
    </div>
  );
}
