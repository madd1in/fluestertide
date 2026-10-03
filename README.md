# Flüstertide

Ein eigenständiges, deutschsprachiges Piraten-Point-and-Click-Abenteuer mit einer vollständigen Geschichte, kombinierbaren Gegenständen, Dialogrätseln und einem Finale. Das Spiel erinnert an klassische humorvolle Piratenabenteuer; Figuren, Orte, Rätsel, Geschichte und Grafik wurden für Flüstertide neu geschaffen. Die Optik ist bewusst retro gehalten: grobe Pixel, Dithering und eine SCUMM-artige Bildschirmbedienung wie zu LucasArts-Zeiten.

## Veröffentlichen

Die Adresse lautet `https://madd1in.github.io/fluestertide/` — **ohne** `test/`. Dazu liegt dieser Ordner im `madd1in.github.io`-Repository direkt unter `fluestertide/` (nicht mehr unter `test/fluestertide/`). Alle Pfade im Spiel sind relativ; Spielstände bleiben beim Umzug erhalten, weil sie pro Browser und Adresse der Seite (`madd1in.github.io`) gespeichert werden.

## Spielen

Am einfachsten `index.html` direkt im Browser öffnen. Das Spiel funktioniert ohne Installation und ohne Internet. Für eine stabile Adresse des automatischen Spielstands empfiehlt sich der lokale Server.

Unter Windows `STARTEN.cmd` doppelklicken. Der Helfer startet den lokalen Server im Hintergrund und öffnet das Spiel im Standardbrowser. Er benötigt Node.js unter `C:\Program Files\nodejs\node.exe`.

Alternativ im Spielordner:

```powershell
& 'C:\Program Files\nodejs\node.exe' .\serve.cjs
```

Dann `http://127.0.0.1:4187` öffnen. Mit `Strg+C` im Terminal endet der manuell gestartete Server. Für einen anderen Port zunächst `$env:FLUESTERTIDE_PORT = '4188'` setzen und dieselbe Adresse mit diesem Port aufrufen.

Der Server ist nur auf diesem Computer erreichbar. Das Spiel benötigt keine Anmeldung, Netzwerkdienste oder kostenpflichtigen Inhalte.

## Bedienung

Orte und Personen in der Szene anklicken. Die Aktionsleiste bietet Ansehen, Reden, Nehmen und Benutzen. Einen Gegenstand im Inventar auswählen, um ihn auf eine Person, ein Objekt oder einen weiteren Gegenstand anzuwenden. Die Karte führt zwischen erreichbaren Orten. Das Logbuch sammelt Ziele und Erkenntnisse; die Hinweisfunktion hilft in drei Stufen vom kleinen Wink bis zur konkreten Lösung. Der Hotspot-Schalter zeigt anklickbare Stellen.

Das Spiel füllt das Fenster weitgehend aus; mit `F` oder dem ⛶-Schalter geht es in den echten Vollbildmodus. Die Bedienung ist auf eine schmale Leiste unten reduziert: Satzteile, vier Verben und das Inventar als Icon-Kacheln — Namen erscheinen als Tooltip beziehungsweise in der Satzzeile. Im Menü `☰` lassen sich die Retro-Pixeloptik und die Röhren-Scanlines einzeln abschalten. Beim Ortswechsel löst sich die Szene in Pixelblöcken auf, und jede Szene zeigt ihren Namen als kurzen Titel im Bild.

Mit der Maus oder per Berührung spielen. Tastenkürzel: `1–4` wählen die Aktion, `M` öffnet die Karte, `J` das Logbuch, `H` einen Hinweis, `F` das Vollbild, `V` die Stimme, die Leertaste die Hotspots und `Enter` führt Dialoge weiter. Ton lässt sich über die Musiknote einschalten — dann gibt es auch Schritte und gelegentlich Möwen.

Dialoge werden optional vorgelesen: Die Stimme (❝) nutzt die Sprachausgabe des Browsers, braucht kein Internet und gibt jeder Figur eine eigene Tonhöhe und ein eigenes Tempo — Pippa quasselt schnell, Balthasar dröhnt tief. Abschaltbar über `V`, den ❝-Knopf oder im Menü.

## Edge und Xbox-Controller

Das Spiel ist auf Microsoft Edge optimiert: Es rendert sparsam in niedriger Auflösung, läuft stabil im Vollbildmodus (`F`) und lässt sich über die Adressleiste als App installieren (Web-Manifest liegt bei) — dann startet es rahmenlos im Vollbild, passend für Couch und Konsole.

Ein angeschlossener Xbox-Controller wird automatisch erkannt (Gamepad API, auch im Edge der Xbox): Der linke Stick bewegt einen goldenen Pixel-Cursor, `A` klickt bzw. bestätigt Dialoge, `B` geht zurück (Fenster schließen, Auswahl aufheben), `X` blendet die Hotspots ein, `Y` schaltet das Verb weiter, `LB`/`RB` blättern durchs Inventar, `LT` öffnet die Karte, `RT` gibt einen Hinweis, `View` schaltet den Ton, `Menu` öffnet die Einstellungen. Erfolge und Fehler geben kurzes Rumble-Feedback.

Spielstände werden im Browser auf diesem Computer gespeichert. Derselbe Browser und dieselbe Adresse laden denselben Fortschritt. Im Menü `☰` lassen sich Spielstände als JSON-Datei exportieren und wieder importieren. Neues Spiel ersetzt nach Bestätigung den Fortschritt. `Esc` schließt Fenster und hebt eine Auswahl auf.

Musik und Geräusche entstehen mit WebAudio im Browser. Es werden keine externen Audiodateien geladen.

## Projekt

- `index.html`, `style.css`, `game.js`: Oberfläche, Szenendarstellung und Spielsteuerung.
- `story.js`: Geschichte, Dialoge, Inventar, Rätsel und Fortschritt.
- `art.js`: eigens gezeichnete, animierte Szenen und Figuren.
- `serve.cjs`: kleiner lokaler Server ohne Zusatzpakete.
- `tests/story.test.cjs`: automatischer Durchlauf der Spielgeschichte.
- `tests/server.test.cjs`: Prüfungen des lokalen Servers und seiner Dateigrenzen.

Die Prüfungen aus dem Spielordner starten:

```powershell
& 'C:\Program Files\nodejs\node.exe' --test .\tests\story.test.cjs .\tests\server.test.cjs
```

Die Browserprüfung benötigt die bereits vorhandene Playwright-Installation im benachbarten Ordner `game-design-toolbox`. Sie spielt die Geschichte über echte Schaltflächen bis zum Finale, prüft automatische Spielstände und Mobilbedienung und schreibt Bilder nach `screenshots/`:

```powershell
& 'C:\Program Files\nodejs\node.exe' --test .\tests\ui.test.cjs
```

