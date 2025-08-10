// pecah data sesuai jumlah mapel
function generateDataRespon() {
    const sheetName = 'Form Responses 1';
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    const data = sheet.getDataRange().getValues(); // Ambil header di baris pertama
    const headers = data[3];
    const rows = data.slice(4); // Data setelah header

    // ambil data sheet
    const dataList = rows.map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });

    const camelCaseData = convertKeysToCamelCase(dataList);

    storeSheetDataCleaned(camelCaseData);
}

// simpan data di spreadsheet baru
function storeSheetDataCleaned(data) {
    const sheetName = 'Data Cleaned';
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
    } else {
        sheet.clear();
    }

    const headerMapping = {
        timestamp: 'Tanggal Daftar',
        emailAddress: 'Email',
        namaLengkap: 'Nama Lengkap',
        provinsi: 'Provinsi',
        kabupatenkota: 'Kabupaten/Kota',
        asalSekolah: 'Asal Sekolah',
        nomorWhatsapp: 'Nomor WhatsApp',
        jenjang: 'Jenjang',
        Mapel: 'Mapel',
        apakahSudahMengikutiAkunInstagramOsn: 'Follow Instagram OSN',
        check: 'Check',
        waktu: 'Waktu Bayar',
        biayaRegistrasi: 'Biaya Registrasi',
        status: 'Status'
    };

    let headers = Object.keys(data[0]).filter(h => h !== 'mataPelajarandapatMemilihLebihDari1Mapel');
    const jenjangIndex = headers.indexOf('jenjang');
    if (jenjangIndex !== -1) {
        headers.splice(jenjangIndex + 1, 0, 'Mapel');
    } else {
        headers.push('Mapel');
    }

    const newHeaders = headers.map(h => headerMapping[h] || h);
    sheet.appendRow(newHeaders);

    data.forEach(item => {
        const mapels = item?.mataPelajarandapatMemilihLebihDari1Mapel
            ? item.mataPelajarandapatMemilihLebihDari1Mapel.split(',').map(m => m.trim())
            : [];

        mapels.forEach(mapel => {
            const row = headers.map(h => {
                if (h === 'Mapel') return mapel;
                if (h === 'nomorWhatsapp') return formatPhoneWAAll(item[h]);
                if (h === 'asalSekolah') return formatNamaSekolah(item[h], 1);
                if (h === 'namaLengkap') return formatTitleCaseName(item[h]); // Title Case
                if (h === 'check') return item[h] ? true : false; // boolean untuk checkbox
                return item[h] || '';
            });
            sheet.appendRow(row);
        });
    });

    // setelah semua data ditulis, ubah kolom 'Check' jadi checkbox
    const checkColIndex = newHeaders.indexOf('Check') + 1; // index kolom
    const lastRow = sheet.getLastRow();
    if (checkColIndex > 0 && lastRow > 1) {
        sheet.getRange(2, checkColIndex, lastRow - 1).insertCheckboxes();
    }
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


// format phone number to whatsapp 628****
// Versi 2: format semua nomor jika ada beberapa, hasil dipisah koma
function formatPhoneWAAll(phoneNumber) {
    if (phoneNumber === undefined || phoneNumber === null) return "";

    var s = String(phoneNumber).replace(/[^\d,+]/g, "");
    if (!s) return "";

    var parts = s.split(",").map(p => p.trim()).filter(Boolean);

    var normalized = parts.map(function (p) {
        if (p.startsWith("+62")) {
            p = "62" + p.slice(3);
        } else if (p.startsWith("62")) {
            // ok
        } else if (p.startsWith("0")) {
            p = "62" + p.slice(1);
        } else if (p.startsWith("8")) {
            p = "62" + p;
        } else {
            p = p.replace(/\D/g, "");
        }
        return p.replace(/\D/g, "");
    }).filter(Boolean);

    return normalized.join(",");
}

// Ubah nama jadi Title Case (huruf depan setiap kata besar)
function formatTitleCaseName(name) {
    if (!name) return "";
    return String(name)
        .toLowerCase()
        .split(" ")
        .filter(Boolean) // hapus spasi kosong
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// ubah nama sekolah
function formatNamaSekolah(input, indexes) {
    if (!input) return '';

    // Hapus titik di akhir kalimat
    input = input.trim().replace(/\.$/, '');

    let words = input.toLowerCase().split(/\s+/);
    if (words.length === 0) return '';

    // Normalize parameter: flatten if needed
    let fullUppercaseIndexes = [];

    if (indexes instanceof Array) {
        // Bisa berupa array baris atau kolom (2D)
        fullUppercaseIndexes = indexes.flat().map(Number);
    } else if (typeof indexes === 'number') {
        fullUppercaseIndexes = [indexes];
    }

    // Kata pertama full kapital
    words[0] = words[0].toUpperCase();

    // Sisanya
    for (let i = 1; i < words.length; i++) {
        let wordIndex = i + 1; // 1-based index for user input

        if (fullUppercaseIndexes.includes(wordIndex)) {
            words[i] = words[i].toUpperCase();
        } else {
            words[i] = words[i]
                .split('-')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join('-');
        }
    }

    return words.join(' ');
}

