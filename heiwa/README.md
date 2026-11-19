# HEIWA Web

Interfaccia HTML indipendente, nello stile di [DAN-Web](https://dimitriazzarone.github.io/DAN-Web/): tema scuro/ciano, orb animato, chat, memoria e impostazioni. Nessun dato personale o credenziale precompilato.

- Groq online, con chiave personale conservata nella sessione del browser. Il modello può essere scelto dalla lista restituita dall'API.
- Qwen tramite un'istanza Ollama configurata dall'utente (`/api/chat`, modello iniziale `qwen3:0.6b`). Il browser non esegue il modello GGUF dell'APK e non lo scarica automaticamente. L'accesso HTTP locale da GitHub Pages può essere bloccato da CORS, HTTPS/HTTP o permessi di rete locale; va verificato nel browser del dispositivo. Nessun passaggio automatico da locale a cloud.
- Cambiare motore apre una nuova conversazione previa conferma, per evitare di trasferire la cronologia tra servizi. Le note rimangono condivise tra i motori della pagina: fino a 4.000 caratteri vengono inclusi quando si invia il messaggio, anche online se Groq è selezionato.
- Memoria modificabile, importazione JSON/JSONL/testo ed esportazione JSON. Limite note 20.000 caratteri, file 2 MB. Importazione con filtro dei campi segreti e dei messaggi di sistema/tool. Non è indicizzazione completa di grandi archivi né sincronizzazione con Drive o APK.
- Allegati di testo/JSON/CSV, fino a quattro per messaggio; estratti fino a 12.000 caratteri per file e messaggio complessivo limitato a 14.000 caratteri. Immagini e PDF non vengono presentati come analizzati.
- Dettatura e sintesi tramite API del browser, quando disponibili. La trascrizione va controllata e inviata; non è live continua.

Chat e note sono in localStorage; chiave Groq in sessionStorage. Nomi di memoria separati da DAN-Web, senza importare automaticamente le sue chiavi o conversazioni. I dati del browser non sono un archivio cifrato; GitHub Pages serve le pagine dallo stesso dominio. I messaggi sono renderizzati come testo e non eseguono HTML del modello.

## Avvio

Aprire il sito, andare in Impostazioni, inserire la chiave Groq oppure configurare Ollama e selezionare Qwen locale. Nessun account ChatGPT, plugin Termux o accesso ai file del telefono è incorporato nella pagina.

## Verifiche

`node --check app.js` e `node --check orb.js`.

`python3 tests/browser.py` richiede Playwright e Chromium (`/usr/bin/chromium`). Verifica layout telefono/tablet, invio, memoria, separazione delle chiavi di storage e richieste Groq/Ollama con risposte simulate. Nessuna chiave reale usata; modelli, microfono e accesso locale sul dispositivo da verificare separatamente.
