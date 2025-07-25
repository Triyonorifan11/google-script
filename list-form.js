function updateForm() {
    // nama sheet dan url
    const sheetName = 'DAFTAR PESERTA BABAK FINAL';
    const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1ROBwtXl6ujOyiM_Xb0J8fYLMZ2cVwnHyIoHQFibzKNY/edit?resourcekey=&gid=2008734161#gid=2008734161';

    // akses sheet
    const spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    const sheet = spreadsheet.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();

    // ambil sheetName
    let pegawaiList = [];
    const pegawaiData = sheet.getRange(`A2:D${lastRow}`).getValues();

    // isi variabel pegawaiList
    pegawaiData.forEach(el => {
        // jika semua kolom A - C terisi
        if (el[0] && el[1] && el[2] && el[3]) {
            // cegah data ganda
            if (pegawaiList.indexOf(`${el[1]}`) === -1) {
                // tambahkan sheetName ke array pegawaiList
                pegawaiList.push(`${el[1]}`);
            }
        }
    });

    // akses form
    const formUrl = 'https://docs.google.com/forms/d/1sCK8Tz_VpQM0O2SxBwH_uQheOVfPmQqZ3rnOb34mlIA/edit';
    const form = FormApp.openByUrl(formUrl);
    // perbaharui opsi dropdown
    const pegawaiDropdown = form.getItemById('977598318').asListItem();
    pegawaiDropdown.setChoiceValues(pegawaiList);
}


function kirimEmail(tujuan, nama, nip, tugas, tanggal) {
    MailApp.sendEmail({
        name: 'PT. Mending Ngoding',
        to: tujuan,
        subject: `Tugas Kantor ${tanggal.getDate()}-${tanggal.getMonth() + 1}-${tanggal.getFullYear()}`,
        htmlBody: `<h1>TUGAS KANTOR</h1>
  <p>Halo, ${nama} (${nip})</p>
  <p>Berikut adalah tugas untuk Anda kerjakan hari ini, ${tanggal}:</p>
  <p>${tugas}.</p>
  <p>Terima kasih. Selamat bertugas.</p>`
    });

    return MailApp.getRemainingDailyQuota();
}


function salinData(e) {
    // ambil data dari form
    const pegawai = e.namedValues['Pegawai'][0].split(' - ');
    const tugas = e.namedValues['Tugas'][0];

    // pisahkan data pegawai
    const nip = pegawai[0].trim();
    const nama = pegawai[1].trim();
    const email = pegawai[2].trim();

    const tanggalSekarang = new Date();

    // akses sheet
    const sheetName = 'Daftar Tugas';
    const spreadsheetUrl = 'URL_SPREADSHEET_ANDA';

    const spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    const sheet = spreadsheet.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;

    // simpan ke sheet daftar tugas
    sheet.getRange(`A${newRow}`).setValue(lastRow);
    sheet.getRange(`B${newRow}`).setValue(tanggalSekarang);
    sheet.getRange(`C${newRow}`).setValue(nip);
    sheet.getRange(`D${newRow}`).setValue(nama);
    sheet.getRange(`E${newRow}`).setValue(email);
    sheet.getRange(`F${newRow}`).setValue(tugas);

    // kirim email
    const kirim = kirimEmail(email, nama, nip, tugas, tanggalSekarang);

    // catat sisa kuota pengiriman email harian
    sheet.getRange(`G${newRow}`).setValue(kirim);
}