#!/usr/bin/env python3
"""
Liest die vier Word-Masken und schreibt content/stationen.json.

Die Masken sind die Quelle. Dieses Skript ist die Brücke von dort in die App –
dieselbe Quelle, aus der der Kartengenerator die Druckvorlagen baut.

Aufruf aus dem Projektverzeichnis:
    python3 werkzeug/masken-einlesen.py ../pfad/zu/02_Masken

Ohne Argument wird ./masken erwartet.
"""

import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

DATEIEN = [
    "KIF-1-Werkzeug-Z3.docx",
    "KIF-2-Tutor-Z3.docx",
    "KIF-3-Coach-Z3.docx",
    "KIF-4-Schueler-Z3.docx",
]

# Stationsfarben wie im Kartengenerator
AKZENT = {
    "Werkzeug": "#3FA46A",
    "Tutor": "#4A9BD8",
    "Coach": "#E08A3C",
    "Schüler": "#A07CD6",
    "Schülerin": "#A07CD6",
}


def absatz_text(p):
    return "".join(t.text or "" for t in p.iter(W + "t"))


def absaetze(tc):
    raus = []
    for p in tc.iter(W + "p"):
        txt = absatz_text(p).strip()
        if not txt:
            continue
        raus.append({"text": txt, "liste": p.find(".//" + W + "numPr") is not None})
    return raus


def felder_lesen(pfad):
    z = zipfile.ZipFile(pfad)
    doc = ET.fromstring(z.read("word/document.xml"))
    felder = {}
    for tbl in doc.iter(W + "tbl"):
        for tr in tbl.iter(W + "tr"):
            tcs = [c for c in tr if c.tag == W + "tc"]
            if len(tcs) < 2:
                continue
            erste = tcs[0].find(".//" + W + "p")
            if erste is None:
                continue
            name = absatz_text(erste).strip()
            if not re.fullmatch(r"[A-ZÄÖÜ0-9_]+", name):
                continue
            felder[name] = absaetze(tcs[1])
    return felder


# --- Hilfsfunktionen zum Umformen ----------------------------------------


def text(felder, key, trenner=" "):
    """Alle Absätze eines Feldes zu einem Fliesstext."""
    return trenner.join(a["text"] for a in felder.get(key, [])).strip()


def liste(felder, key):
    """Nur die Aufzählungspunkte eines Feldes."""
    return [a["text"] for a in felder.get(key, [])]


def vorspann_und_punkte(felder, key):
    """Erster Absatz ohne Aufzählungszeichen wird Vorspann, der Rest Punkte.

    Entspricht der Logik des Kartengenerators. Masken, in denen alle Zeilen
    ohne Aufzählungszeichen stehen, werden gleich behandelt: erste Zeile
    Vorspann, danach Punkte.
    """
    absatz = felder.get(key, [])
    if not absatz:
        return {"vorspann": "", "punkte": []}
    vorspann = ""
    rest = absatz
    if not absatz[0]["liste"]:
        vorspann = absatz[0]["text"]
        rest = absatz[1:]
    return {"vorspann": vorspann, "punkte": [a["text"] for a in rest]}


def punkt_mit(punkte, anfang):
    """Den Punkt holen, der mit einem bestimmten Wort beginnt."""
    for p in punkte:
        if p.lower().startswith(anfang.lower()):
            return p
    return ""


def ohne_praefix(satz, praefix):
    return re.sub(r"^" + re.escape(praefix) + r"\s*:?\s*", "", satz).strip()


# --- Hauptteil ------------------------------------------------------------


def station_bauen(felder):
    pruefen = vorspann_und_punkte(felder, "PRUEFEN")
    mechanismusfrage = punkt_mit(pruefen["punkte"], "WARUM")
    gegenprobe = ohne_praefix(punkt_mit(pruefen["punkte"], "Gegenprobe"), "Gegenprobe")
    nutzungsart = text(felder, "NUTZUNGSART")

    return {
        "nr": int(text(felder, "STATION_NR")),
        "id": text(felder, "STATION_ID"),
        "nutzungsart": nutzungsart,
        "verb": text(felder, "KOMPETENZVERB"),
        "untertitel": text(felder, "UNTERTITEL"),
        "perspektive": text(felder, "PERSPEKTIVE"),
        "zeitrahmen": text(felder, "ZEITRAHMEN"),
        "arbeitsweise": text(felder, "ARBEITSWEISE"),
        "kompetenzsatz": text(felder, "KOMPETENZSATZ"),
        "akzent": AKZENT.get(nutzungsart, "#8A9099"),
        "braucht": liste(felder, "BRAUCHT") or [text(felder, "BRAUCHT")],
        "wp1": {
            "worum": text(felder, "WORUM_GEHTS"),
            "leitfrage": text(felder, "LEITFRAGE"),
            "tor": text(felder, "WEITER_1"),
        },
        "wp2": {
            "prompt": text(felder, "EINSTIEGS_PROMPT"),
            "hinweis": text(felder, "EINSTIEGS_HINWEIS"),
            "tor": text(felder, "WEITER_2"),
        },
        "wp3": {
            "auftrag": vorspann_und_punkte(felder, "AUFTRAG"),
            "suchraum": text(felder, "AUFTRAG_HILFE"),
            "hilfe": [
                text(felder, "WEB_HILFE_1"),
                text(felder, "WEB_HILFE_2"),
                text(felder, "WEB_HILFE_3"),
            ],
            "nachschlagen": text(felder, "WEB_NACHSCHLAGEN"),
            "arbeitsspur": text(felder, "ARBEITSSPUR"),
            "tor": text(felder, "WEITER_3"),
        },
        "wp4": {
            "vorspann": pruefen["vorspann"],
            "mechanismusfrage": mechanismusfrage,
            "gegenprobe": gegenprobe,
            "denkanstoss": text(felder, "PRUEFEN_HILFE"),
            "vertiefung": text(felder, "WEB_VERTIEFUNG"),
            "tor": text(felder, "WEITER_4"),
        },
        "wp5": {
            "doku": vorspann_und_punkte(felder, "DOKU"),
            "learningview": text(felder, "LEARNINGVIEW_AUFTRAG"),
            "tor": text(felder, "WEITER_5"),
        },
        "wp6": {
            "wirkungsfrage": text(felder, "WIRKUNGSFRAGE"),
            "kuer": text(felder, "KUER"),
            "bestanden": text(felder, "BESTANDEN_WENN"),
            "weiter_zu": text(felder, "WEITER_ZU"),
        },
        "lp": {
            "kurz": text(felder, "LP_KURZ"),
            "worum": text(felder, "WORUM_GEHTS_LP"),
            "zielstufen": liste(felder, "ZIELSTUFEN"),
            "sozialformen": text(felder, "SOZIALFORMEN"),
            "herausforderungen": liste(felder, "HERAUSFORDERUNGEN"),
            "rolle": liste(felder, "ROLLE_LP"),
            "material": liste(felder, "MATERIAL"),
            "reality_check": text(felder, "REALITY_CHECK"),
            "differenzierung": text(felder, "DIFFERENZIERUNG"),
            "lp21": text(felder, "LP21"),
            "interaktiv": {
                "typ": text(felder, "INTERAKTIV_TYP"),
                "inhalt": text(felder, "INTERAKTIV_INHALT"),
            },
        },
    }


def main():
    quelle = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("masken")
    if not quelle.is_dir():
        sys.exit(f"Maskenordner nicht gefunden: {quelle}")

    stationen = []
    erste = None
    for name in DATEIEN:
        pfad = quelle / name
        if not pfad.exists():
            sys.exit(f"Maske fehlt: {pfad}")
        felder = felder_lesen(pfad)
        if erste is None:
            erste = felder
        stationen.append(station_bauen(felder))
        print(f"gelesen: {name} ({len(felder)} Felder)")

    ergebnis = {
        "titel": "Wer hat das Steuer?",
        "einheit": "KI-Führerschein",
        "version": text(erste, "VERSION"),
        "stand": text(erste, "STAND"),
        "lizenz": text(erste, "LIZENZ"),
        "stationen": sorted(stationen, key=lambda s: s["nr"]),
    }

    ziel = Path("content/stationen.json")
    ziel.parent.mkdir(exist_ok=True)
    ziel.write_text(
        json.dumps(ergebnis, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"geschrieben: {ziel}")


if __name__ == "__main__":
    main()
