/**
 * Berichtenboard Backend - Google Apps Script
 *
 * Dit script beheert een berichtenboard met Google Sheets als database.
 * Sheet structuur: Timestamp | Voornaam | Tussenvoegsel | Achternaam | Email | Boodschap | Status
 */

// Configuratie
const SPREADSHEET_ID = '1rxiSCZfAMIpEOsSrzXF1ANjErMFOGfOVGYPgv3SrhVA';
const SHEET_NAME = 'Berichten';
const STATUS_PENDING = 'pending';
const STATUS_APPROVED = 'approved';
const STATUS_REJECTED = 'rejected';

/**
 * GET request handler
 * - Zonder parameters: serveert de HTML pagina
 * - Met action=getMessages: retourneert goedgekeurde berichten als JSON
 */
function doGet(e) {
  // Check of er een action parameter is (met null check voor e)
  const action = e && e.parameter ? e.parameter.action : null;

  if (action === 'getMessages') {
    return getApprovedMessages();
  }

  // Serveer de HTML pagina
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Steun een vluchtelingstudent')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * POST request handler
 * Voegt een nieuw bericht toe aan de sheet
 */
function doPost(e) {
  try {
    // Parse de POST data
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error('Geen data ontvangen');
    }

    const voornaam = data.voornaam || 'Anoniem';
    const tussenvoegsel = data.tussenvoegsel || '';
    const achternaam = data.achternaam || '';
    const email = data.email || '';
    const boodschap = data.boodschap;

    // Validatie
    if (!boodschap || boodschap.trim() === '') {
      return createJsonResponse({
        success: false,
        error: 'Boodschap is verplicht'
      });
    }

    if (boodschap.length > 500) {
      return createJsonResponse({
        success: false,
        error: 'Boodschap mag maximaal 500 karakters bevatten'
      });
    }

    // Voeg toe aan sheet
    const sheet = getOrCreateSheet();
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      voornaam.trim(),
      tussenvoegsel.trim(),
      achternaam.trim(),
      email.trim(),
      boodschap.trim(),
      STATUS_PENDING
    ]);

    return createJsonResponse({
      success: true,
      message: 'Bericht succesvol verstuurd'
    });

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * Haalt alle goedgekeurde berichten op, gesorteerd op datum (nieuwste eerst)
 */
function getApprovedMessages() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  // Skip header rij en filter op approved status
  const messages = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[6] === STATUS_APPROVED) {
      const voornaam = row[1] || '';
      const tussenvoegsel = row[2] || '';
      const achternaam = row[3] || '';
      const displayNaam = [voornaam, tussenvoegsel, achternaam].filter(Boolean).join(' ') || 'Anoniem';
      messages.push({
        timestamp: row[0].toString(),
        naam: displayNaam,
        boodschap: row[5],
        datum: formatDate(row[0])
      });
    }
  }

  // Sorteer op datum (nieuwste eerst)
  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return createJsonResponse({
    success: true,
    messages: messages
  });
}

/**
 * Client-side functie om berichten op te halen (voor google.script.run)
 */
function getMessagesForClient() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  const messages = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[6] === STATUS_APPROVED) {
      const voornaam = row[1] || '';
      const tussenvoegsel = row[2] || '';
      const achternaam = row[3] || '';
      const displayNaam = [voornaam, tussenvoegsel, achternaam].filter(Boolean).join(' ') || 'Anoniem';
      messages.push({
        timestamp: String(row[0]),
        naam: displayNaam,
        boodschap: row[5],
        datum: formatDate(row[0])
      });
    }
  }

  messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    success: true,
    messages: messages
  };
}

/**
 * Client-side functie om een bericht toe te voegen (voor google.script.run)
 */
function addMessageFromClient(voornaam, tussenvoegsel, achternaam, email, boodschap) {
  try {
    if (!boodschap || boodschap.trim() === '') {
      return { success: false, error: 'Boodschap is verplicht' };
    }

    if (boodschap.length > 500) {
      return { success: false, error: 'Boodschap mag maximaal 500 karakters bevatten' };
    }

    const sheet = getOrCreateSheet();
    const timestamp = new Date();

    sheet.appendRow([
      timestamp,
      (voornaam || 'Anoniem').trim(),
      (tussenvoegsel || '').trim(),
      (achternaam || '').trim(),
      (email || '').trim(),
      boodschap.trim(),
      STATUS_PENDING
    ]);

    return { success: true, message: 'Bericht succesvol verstuurd' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Haalt de sheet op of maakt deze aan als deze niet bestaat
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Voornaam', 'Tussenvoegsel', 'Achternaam', 'Email', 'Boodschap', 'Status']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Formatteert een datum naar Nederlands formaat
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return d.toLocaleDateString('nl-NL', options);
}

/**
 * Maakt een JSON response aan
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test functie om sample data toe te voegen
 * Voer deze handmatig uit vanuit de Apps Script editor
 */
function addSampleMessages() {
  const sheet = getOrCreateSheet();

  const sampleMessages = [
    [new Date(), 'Maria', '', 'Santos', 'maria@example.com', 'Veel succes met je studie! Je bent een inspiratie voor velen.', STATUS_APPROVED],
    [new Date(), 'Jan', 'de', 'Vries', '', 'Blijf doorzetten, je gaat dit halen!', STATUS_APPROVED],
    [new Date(), 'Anoniem', '', '', '', 'Onderwijs is de sleutel tot een betere toekomst. Trots op jullie!', STATUS_APPROVED],
    [new Date(), 'Sophie', 'van der', 'Berg', 'sophie@test.nl', 'Welkom in Nederland, en veel succes met je studies!', STATUS_PENDING],
    [new Date(), 'Peter', '', 'Jansen', '', 'Kennis is macht. Ga ervoor!', STATUS_APPROVED],
  ];

  sampleMessages.forEach(msg => {
    sheet.appendRow(msg);
  });

  Logger.log('Sample berichten toegevoegd!');
}

/**
 * Functie om alle pending berichten goed te keuren
 * Handig voor bulk-goedkeuring
 */
function approveAllPending() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  let approved = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][6] === STATUS_PENDING) {
      sheet.getRange(i + 1, 7).setValue(STATUS_APPROVED);
      approved++;
    }
  }

  Logger.log(`${approved} berichten goedgekeurd`);
}

/**
 * Menu toevoegen aan Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Berichtenboard')
    .addItem('Voeg sample berichten toe', 'addSampleMessages')
    .addItem('Keur alle pending berichten goed', 'approveAllPending')
    .addToUi();
}
