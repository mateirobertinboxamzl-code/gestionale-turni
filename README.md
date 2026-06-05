# 📅 Gestionale Turni

Un'applicazione web per gestire i turni di lavoro in modo semplice e intuitivo.

## ✨ Funzionalità

- **3 tipi di turno** con colori distintivi: Mattina (giallo), Pomeriggio (verde), Sera (blu)
- **Turni preimpostati** configurabili per ogni categoria
- **Vista settimanale** con navigazione facile
- **Gestione dipendenti** (aggiungi/rimuovi)
- **Funziona offline** come PWA (Progressive Web App)
- **Installabile** su Android come app nativa
- **Export/Import** dei dati per backup
- **Design responsive** ottimizzato per smartphone

## 🚀 Come Usare

### Opzione 1: Uso Locale
1. Apri `index.html` nel browser
2. L'app funziona subito!

### Opzione 2: Installare su Android (Consigliato)
Per usare l'app come una vera app sul telefono:

1. **Pubblica su GitHub Pages** (gratis):
   - Crea un account su [GitHub](https://github.com)
   - Crea un nuovo repository
   - Carica tutti i file di questa cartella
   - Vai in Settings → Pages → Source: "main" → Save
   - Dopo qualche minuto l'app sarà online su `tuonome.github.io/nome-repo`

2. **Installa sul telefono**:
   - Apri il link dal browser Chrome su Android
   - Tocca i 3 puntini in alto a destra
   - Seleziona "Aggiungi a schermata Home"
   - L'app apparirà come icona sul telefono!

## 📱 Prima Configurazione

### 1. Genera le Icone
Prima di pubblicare, genera le icone PNG:
1. Apri `icons/generate-icons.html` nel browser
2. Clicca "Genera e Scarica Tutte le Icone"
3. Sposta i file scaricati nella cartella `icons/`

### 2. Configura i Dipendenti
1. Apri l'app
2. Tocca l'icona ⚙️ in alto a destra
3. Nella tab "Dipendenti" aggiungi i nomi del tuo team

### 3. Configura i Turni Preset
1. Vai nella tab "Turni Preset"
2. Aggiungi gli orari che usi più spesso per ogni categoria

## 🎨 Colori dei Turni

| Tipo | Colore | Uso |
|------|--------|-----|
| Mattina | 🟡 Giallo | Turni dalle 6:00 alle 13:00 circa |
| Pomeriggio | 🟢 Verde | Turni dalle 13:00 alle 18:00 circa |
| Sera | 🔵 Blu | Turni dalle 18:00 in poi |
| Riposo | 🔴 Rosso | Giorni di riposo |
| Ferie | 🟣 Viola | Giorni di ferie |
| Malattia | 🟠 Arancione | Giorni di malattia |
| Permesso | ⚪ Grigio | Permessi vari |

## 💾 Backup dei Dati

I dati sono salvati nel browser (localStorage). Per fare backup:
1. Vai in Impostazioni → Tab "Dati"
2. Clicca "Esporta tutti i dati"
3. Salva il file JSON

Per ripristinare:
1. Clicca "Importa dati"
2. Seleziona il file JSON di backup

## 🔧 Struttura File

```
GESTIONALE TURNI CHRIS/
├── index.html          # Pagina principale
├── manifest.json       # Configurazione PWA
├── sw.js              # Service Worker (offline)
├── css/
│   └── style.css      # Stili
├── js/
│   └── app.js         # Logica applicazione
└── icons/
    ├── icon.svg       # Icona sorgente
    └── icon-*.png     # Icone generate
```

## ❓ FAQ

**D: I dati si perdono se chiudo il browser?**
R: No, i dati sono salvati automaticamente nel browser e rimangono anche dopo la chiusura.

**D: Posso usare l'app su più dispositivi?**
R: Sì, ma i dati non si sincronizzano automaticamente. Usa Export/Import per trasferire i dati.

**D: Funziona senza internet?**
R: Sì! Una volta caricata la prima volta, l'app funziona completamente offline.

---

Creato con ❤️ per Chris
