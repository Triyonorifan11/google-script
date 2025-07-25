function extractPhoneNumbers(cellValue) {
  var phoneRegex = /08\d{8,12}/g;
  var matches = cellValue.match(phoneRegex);
  return matches ? matches.join(", ") : "";
}


// format phone number to whatsapp 628****
function formatPhoneWA(phoneNumber) {
  // Remove all hyphens from the phone number
  var cleaned = phoneNumber.replace(/-/g, "");
  
  // If the phone number starts with +62, remove + and keep the rest
  if (cleaned.startsWith("+62")) {
    cleaned = cleaned.replace("+", "");
  }

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  
  return cleaned;
}