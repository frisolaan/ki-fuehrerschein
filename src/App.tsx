import { useCallback, useEffect, useMemo, useState } from "react";
import inhaltRoh from "../content/stationen.json";
import { Eintrag, Inhalt, Modus, Zustand } from "./typen";
import { laden, loeschen, sichern } from "./speicher";
import Start from "./ansichten/Start";
import StationAnsicht from "./ansichten/Station";
import Regelblatt from "./ansichten/Regelblatt";
import Lehrpersonen from "./ansichten/Lehrpersonen";

const inhalt = inhaltRoh as Inhalt;

/**
 * Adressen laufen über das Hash – so funktioniert die App auch aus einem
 * Unterordner und ohne Server-Umschreibung. Gedruckte QR-Codes können direkt
 * auf #/station/2 zeigen.
 */
function useRoute(): [string, (ziel: string) => void] {
  const lesen = () => window.location.hash.replace(/^#/, "") || "/";
  const [route, setRoute] = useState(lesen);

  useEffect(() => {
    const auf = () => setRoute(lesen());
    window.addEventListener("hashchange", auf);
    return () => window.removeEventListener("hashchange", auf);
  }, []);

  const gehZu = useCallback((ziel: string) => {
    window.location.hash = ziel;
    window.scrollTo(0, 0);
  }, []);

  return [route, gehZu];
}

export default function App() {
  const [route, gehZu] = useRoute();
  const [zustand, setZustand] = useState<Zustand>(laden);

  useEffect(() => sichern(zustand), [zustand]);

  const aendern = useCallback(
    (nr: number, teil: Partial<Eintrag>) =>
      setZustand((z) => ({
        ...z,
        eintraege: {
          ...z.eintraege,
          [nr]: { ...z.eintraege[nr], ...teil },
        },
      })),
    [],
  );

  const modus: Modus = zustand.modus ?? "zweit";

  const stationsNr = useMemo(() => {
    const treffer = route.match(/^\/station\/(\d)/);
    return treffer ? Number(treffer[1]) : null;
  }, [route]);

  const station = stationsNr
    ? inhalt.stationen.find((s) => s.nr === stationsNr)
    : undefined;

  const alleZuruecksetzen = () => {
    if (!window.confirm("Alle eigenen Einträge in diesem Browser löschen?")) return;
    loeschen();
    setZustand(laden());
    gehZu("/");
  };

  return (
    <div className="rahmen">
      <div className="kopfleiste">
        <button className="textknopf" onClick={() => gehZu("/")}>
          {inhalt.titel}
        </button>
        <span className="klein">
          Version {inhalt.version} · {inhalt.lizenz}
        </span>
      </div>

      {route === "/lehrpersonen" ? (
        <Lehrpersonen inhalt={inhalt} gehZu={gehZu} />
      ) : route === "/regelblatt" ? (
        <Regelblatt
          inhalt={inhalt}
          eintraege={zustand.eintraege}
          modus={modus}
          name={zustand.name}
          klasse={zustand.klasse}
          gehZu={gehZu}
        />
      ) : station ? (
        <StationAnsicht
          station={station}
          eintrag={zustand.eintraege[station.nr]}
          modus={modus}
          name={zustand.name}
          aendern={(teil) => aendern(station.nr, teil)}
          gehZu={gehZu}
        />
      ) : (
        <Start
          inhalt={inhalt}
          modus={zustand.modus}
          name={zustand.name}
          klasse={zustand.klasse}
          eintraege={zustand.eintraege}
          setzeModus={(m) => setZustand((z) => ({ ...z, modus: m }))}
          setzeName={(n) => setZustand((z) => ({ ...z, name: n }))}
          setzeKlasse={(k) => setZustand((z) => ({ ...z, klasse: k }))}
          gehZu={gehZu}
        />
      )}

      <footer className="fussleiste">
        <span>
          {inhalt.einheit} · {inhalt.stand} · {inhalt.lizenz}
        </span>
        <button className="textknopf" onClick={alleZuruecksetzen}>
          Einträge löschen
        </button>
      </footer>
    </div>
  );
}
