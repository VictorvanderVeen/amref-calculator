# Berichtenboard - Google Apps Script

Een berichtenboard voor het ondersteunen van vluchtelingstudenten, gebouwd met Google Apps Script en Google Sheets als backend.

## Features

- Publiek berichtenboard met goedgekeurde berichten
- Formulier voor het indienen van nieuwe berichten
- Moderatie via Google Sheets (pending/approved/rejected)
- Masonry grid layout, mobile responsive
- Karakterteller (max 500 karakters)

## Setup Instructies

### Stap 1: Google Sheet aanmaken

1. Ga naar [Google Sheets](https://sheets.google.com)
2. Maak een nieuwe spreadsheet aan
3. Geef het een naam, bijv. "Berichtenboard Database"

### Stap 2: Google Apps Script project aanmaken

1. In je Google Sheet, ga naar **Extensions > Apps Script**
2. Verwijder de standaard code in `Code.gs`
3. Kopieer de inhoud van `Code.gs` uit dit project
4. Ga naar **File > New > HTML file**
5. Noem het bestand `Index` (zonder .html)
6. Kopieer de inhoud van `Index.html` uit dit project
7. Sla beide bestanden op (Ctrl+S of Cmd+S)

### Stap 3: Web App deployen

1. In de Apps Script editor, klik op **Deploy > New deployment**
2. Klik op het tandwiel naast "Select type" en kies **Web app**
3. Configureer:
   - **Description**: Berichtenboard v1.0
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Klik op **Deploy**
5. Autoriseer de app wanneer daarom gevraagd wordt
6. Kopieer de Web app URL

### Stap 4: Testen

1. Open de Web app URL in je browser
2. Je zou de lege berichtenboard pagina moeten zien
3. Klik op "Laat een boodschap achter" om een bericht te versturen

## Berichten modereren

### Handmatig in Google Sheet

1. Open je Google Sheet
2. Ga naar de "Berichten" tab (wordt automatisch aangemaakt)
3. Nieuwe berichten hebben status "pending"
4. Wijzig de status naar "approved" om een bericht te publiceren
5. Wijzig naar "rejected" om een bericht af te wijzen

### Bulk goedkeuring

1. In de Apps Script editor, selecteer de functie `approveAllPending`
2. Klik op "Run"
3. Alle pending berichten worden goedgekeurd

### Via het menu in Google Sheets

Na het openen van de spreadsheet verschijnt er een menu "Berichtenboard" met opties:
- **Voeg sample berichten toe**: Voegt testdata toe
- **Keur alle pending berichten goed**: Bulk goedkeuring

## Sheet Structuur

| Kolom | Inhoud |
|-------|--------|
| A | Timestamp |
| B | Naam |
| C | Email |
| D | Boodschap |
| E | Status (pending/approved/rejected) |

## API Endpoints

### GET Request

```
GET {SCRIPT_URL}?action=getMessages
```

Retourneert JSON met alle goedgekeurde berichten:

```json
{
  "success": true,
  "messages": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "naam": "Jan",
      "boodschap": "Veel succes!",
      "datum": "15 januari 2024"
    }
  ]
}
```

### POST Request

```
POST {SCRIPT_URL}
Content-Type: application/json

{
  "naam": "Jan",
  "email": "jan@example.com",
  "boodschap": "Veel succes met je studie!"
}
```

Retourneert:

```json
{
  "success": true,
  "message": "Bericht succesvol verstuurd"
}
```

## Updaten na wijzigingen

Na het wijzigen van de code:

1. Ga naar **Deploy > Manage deployments**
2. Klik op het potlood-icoon om te bewerken
3. Selecteer **New version** bij "Version"
4. Klik op **Deploy**

**Let op**: De URL blijft hetzelfde, maar wijzigingen zijn pas zichtbaar na een nieuwe deployment.

## Aanpassen

### Kleuren wijzigen

In `Index.html`, pas de CSS variabelen aan in `:root`:

```css
:root {
  --primary: #2563eb;      /* Hoofdkleur */
  --primary-dark: #1d4ed8; /* Donkerdere variant */
  /* etc. */
}
```

### Achtergrond gradient

Pas de `body` styling aan:

```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Teksten aanpassen

Zoek naar de Nederlandse teksten in `Index.html` en pas ze aan naar wens.

## Troubleshooting

### "Script function not found"
- Controleer of `Code.gs` correct is gekopieerd
- Zorg dat de functienamen `doGet` en `doPost` exact zo geschreven zijn

### Berichten laden niet
- Check de browser console voor errors
- Controleer of de deployment correct is met "Anyone" access
- Maak een nieuwe deployment als de URL niet werkt

### CORS errors
- Google Apps Script handelt CORS automatisch af
- Als je errors krijgt, maak een nieuwe deployment

## Licentie

Dit project is vrij te gebruiken en aan te passen.
