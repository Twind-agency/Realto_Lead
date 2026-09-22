# Deploy Realto Lead Desk

Realto Lead Desk e' una dashboard statica. Pubblica questi file nello stesso progetto/cartella dell'hosting:

- `index.html`
- `settings.html`
- `styles.css`
- `app.js`
- `settings.js`

Tieni questi file come setup e documentazione:

- `google-apps-script.gs`
- `README.md`
- `DEPLOY.md`

## Google Sheet Realto

1. Crea o apri il Google Sheet dedicato a Realto.
2. Controlla che il foglio principale dei lead si chiami `Leads`.
3. Vai su `Estensioni > Apps Script`.
4. Incolla tutto il contenuto di `google-apps-script.gs`.
5. Esegui una volta `setupLeadDesk`.
6. Distribuisci come Web App.
7. Copia l'URL della Web App.

## Dashboard Realto

1. Apri `/settings.html` sul deploy Realto.
2. Incolla l'endpoint Apps Script Realto.
3. Configura messaggi WhatsApp e campi dinamici.
4. Salva.
5. Copia il link dashboard cliente generato.

## Note importanti

- Non usare Google Sheet di altre istanze.
- Non usare endpoint Apps Script di altre istanze.
- Non caricare questi file nella cartella o nel deploy di altre istanze.
- Ogni nuova versione Realto va tracciata nel `RELEASES.md` di `clienti/realto/`.
