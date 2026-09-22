# Realto Lead Desk

Dashboard statica Realto Lead Desk per gestire lead da Meta su Google Sheets.

Questa istanza e' separata dalle altre installazioni LeadDesk. Usa una propria cartella, una propria cronologia release, un proprio pacchetto deploy e un Google Sheet dedicato.

## Configurazione cliente

I default statici sono descritti in `../client.config.json`. Dopo il primo setup, la dashboard legge messaggi WhatsApp e campi dinamici dal foglio `Config` del Google Sheet Realto.

## Come provarla

Apri `index.html` nel browser. Per collegarla ai dati Realto:

1. Crea o apri il Google Sheet dedicato a Realto.
2. Incolla `google-apps-script.gs` in Apps Script.
3. Distribuisci Apps Script come Web App.
4. Apri `settings.html`.
5. Incolla l'endpoint Apps Script Realto.
6. Salva la configurazione e copia il link dashboard cliente.

## Isolamento

Questa istanza usa chiavi browser dedicate:

- `leaddesk-realto-settings-v1`
- `leaddesk-realto-state-v1`

Non usare endpoint, Sheet o deploy Apps Script di altre istanze per Realto.
