function doGet(e) {
    const sheetName = e.parameter?.sheetName || "PAUD"; // Ambil nama sheet dari parameter, default ke "PAUD"
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    // Periksa apakah sheet ada
    if (!sheet) {
        let response = responseFormater(null, `Sheet "${sheetName}" not found`, 404, 'error sheet')

        return ContentService.createTextOutput(JSON.stringify(response))
            .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues(); // Ambil semua data di sheet
    const headers = data[0]; // Ambil header di baris pertama
    const rows = data.slice(1); // Data setelah header

    // Ambil parameter dari query string
    const no_hp = e.parameter?.number; // Ambil parameter `number`
    const mapel = e.parameter?.mapel; // Ambil parameter `mapel`
    const jenjang = e.parameter?.jenjang; // Ambil parameter `jenjang`
    const email = e.parameter?.email; // Ambil parameter `number`

    // Buat array data sebagai JSON
    const jsonData = rows.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });

    // Konversi keys ke camelCase
    const camelCaseData = convertKeysToCamelCase(jsonData);

    // Filter data berdasarkan semua parameter yang tersedia
    const result = camelCaseData.filter(item => {
        return (!no_hp || item["nomorwhatsapp"] == no_hp) &&
            (!mapel || item["matapelajaran"] == mapel) &&
            (!jenjang || item["jenjang"] == jenjang) &&
            (!email || item["email"] == email);
    });


    let response = responseFormater(result, `Data Sheet ${sheetName} Berhasil Ditampilkan`, 200)

    // Response JSON
    return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    const sheetName = e.parameter?.sheetName || "PAUD";
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify(responseFormater(null, `Sheet "${sheetName}" not found`, 404, 'error sheet')))
            .setMimeType(ContentService.MimeType.JSON);
    }

    // Parsing data POST
    let postData;
    try {
        postData = JSON.parse(e.postData.contents);

        const email = postData.Email;
        const nomorWhatsapp = postData.NOMOR_WHATSAPP;
        const mataPelajaran = postData.MATA_PELAJARAN;
        const idUnik = postData.ID_UNIK;
        const newStatus = "SUDAH ABSEN"; // Default status

        if (!idUnik || !nomorWhatsapp || !mataPelajaran) {
            return ContentService.createTextOutput(JSON.stringify(responseFormater(null, "Missing required fields: ID_UNIK, NOMOR_WHATSAPP, MATA_PELAJARAN", 400, 'error')))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Ambil data dari sheet
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const rows = data.slice(1);

        // Header row index
        const headerRow = 1;

        const emailIndex = headers.indexOf("Email");
        const nomorWhatsappIndex = headers.indexOf("NOMOR_WHATSAPP");
        const mataPelajaranIndex = headers.indexOf("MATA_PELAJARAN");
        const idUnikIndex = headers.indexOf("ID_UNIK");
        const statusIndex = headers.indexOf("STATUS");

        if (emailIndex === -1 || nomorWhatsappIndex === -1 || mataPelajaranIndex === -1 || statusIndex === -1 || idUnikIndex === -1) {
            return ContentService.createTextOutput(JSON.stringify(responseFormater(null, "Required columns not found in sheet", 500, 'error')))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // Loop through rows to find a match
        for (let i = headerRow; i < data.length; i++) {
            if (
                // data[i][emailIndex] === email &&
                data[i][nomorWhatsappIndex] === nomorWhatsapp &&
                data[i][mataPelajaranIndex] === mataPelajaran &&
                data[i][idUnikIndex] === idUnik
            ) {

                if (data[i][statusIndex] != newStatus) {
                    // Update status for this row
                    const row = i + 1; // Convert to 1-based index
                    sheet.getRange(row, statusIndex + 1).setValue(newStatus).setBackground('#00ff15');

                    let response = responseFormater(null, `Status updated successfully for Email: ${email}, NOMOR_WHATSAPP: ${nomorWhatsapp}, and MATA_PELAJARAN: ${mataPelajaran} ID_UNIK: ${idUnik}`, 200, 'success')

                    return ContentService.createTextOutput(JSON.stringify(response))
                        .setMimeType(ContentService.MimeType.JSON);
                } else {
                    let response = responseFormater(null, `Data  Email: ${email}, NOMOR_WHATSAPP: ${nomorWhatsapp}, and MATA_PELAJARAN: ${mataPelajaran} ID_UNIK: ${idUnik} telah dilakukan absensi! `, 202, 'accepted')

                    return ContentService.createTextOutput(JSON.stringify(response))
                        .setMimeType(ContentService.MimeType.JSON);
                }
            }
        }

        let response = responseFormater(null, `Data not found for Email ${email}, NOMOR_WHATSAPP ${nomorWhatsapp}, MATA_PELAJARAN ${mataPelajaran}, AND ID_UNIK: ${idUnik} on sheet ${sheetName}`, 404, 'error')
        return ContentService.createTextOutput(JSON.stringify(response))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify(responseFormater(null, "Invalid JSON format", 400, 'error')))
            .setMimeType(ContentService.MimeType.JSON);
    }

}




function responseFormater(data = null, message = null, code = 200, status = 'success') {
    let response = {
        meta: {
            code: code,
            message: message,
            status: status,
        },
        data: {
            data: data,
        }
    };
    return response
}



// Fungsi utilitas yang sama seperti di atas
function toCamelCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, "");
}

function convertKeysToCamelCase(data) {
    return data.map(item => {
        let newItem = {};
        Object.keys(item).forEach(key => {
            const newKey = toCamelCase(key);
            newItem[newKey] = item[key];
        });
        return newItem;
    });
}
