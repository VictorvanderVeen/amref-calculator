/**
 * Berichtenboard Backend - Google Apps Script
 *
 * Dit script beheert een berichtenboard met Google Sheets als database.
 * Sheet structuur: Timestamp | Naam | Email | Boodschap | Status
 */

// Configuratie
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

    const naam = data.naam || 'Anoniem';
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
      naam.trim(),
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
    if (row[4] === STATUS_APPROVED) {
      messages.push({
        timestamp: row[0],
        naam: row[1] || 'Anoniem',
        boodschap: row[3],
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
 * Haalt de sheet op of maakt deze aan als deze niet bestaat
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Voeg header rij toe
    sheet.appendRow(['Timestamp', 'Naam', 'Email', 'Boodschap', 'Status']);
    // Maak header vet
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    // Stel kolom breedtes in
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 120); // Naam
    sheet.setColumnWidth(3, 180); // Email
    sheet.setColumnWidth(4, 400); // Boodschap
    sheet.setColumnWidth(5, 100); // Status
    // Freeze header
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
    [new Date(), 'Maria', 'maria@example.com', 'Veel succes met je studie! Je bent een inspiratie voor velen.', STATUS_APPROVED],
    [new Date(), 'Jan', '', 'Blijf doorzetten, je gaat dit halen!', STATUS_APPROVED],
    [new Date(), 'Anoniem', '', 'Onderwijs is de sleutel tot een betere toekomst. Trots op jullie!', STATUS_APPROVED],
    [new Date(), 'Sophie', 'sophie@test.nl', 'Welkom in Nederland, en veel succes met je studies!', STATUS_PENDING],
    [new Date(), 'Peter', '', 'Kennis is macht. Ga ervoor!', STATUS_APPROVED],
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
    if (data[i][4] === STATUS_PENDING) {
      sheet.getRange(i + 1, 5).setValue(STATUS_APPROVED);
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
