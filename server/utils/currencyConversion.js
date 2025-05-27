const conversionRates = {
  MAD: { MAD: 1, USD: 0.10, EUR: 0.09 },
  USD: { MAD: 10, USD: 1, EUR: 0.92 },
  EUR: { MAD: 11, USD: 1.09, EUR: 1 }
};

/**
 * Convert an amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - The source currency (MAD, USD, EUR)
 * @param {string} toCurrency - The target currency (MAD, USD, EUR)
 * @returns {number} The converted amount
 */
const baseRates = { MAD: 1, USD: 0.10, EUR: 0.09 };

const convertAmount = (amount, fromCurrency, toCurrency) => {
  if (!amount || !fromCurrency || !toCurrency) return amount;
  if (fromCurrency === toCurrency) return amount;
  const amountInMAD = amount / baseRates[fromCurrency];
  return amountInMAD * baseRates[toCurrency];
};

/**
 * Convert all amounts in a record to a new currency
 * @param {Object} record - The record containing amount fields
 * @param {string} fromCurrency - The source currency
 * @param {string} toCurrency - The target currency
 * @returns {Object} The record with converted amounts
 */
const convertRecordAmounts = (record, fromCurrency, toCurrency) => {
  if (!record || fromCurrency === toCurrency) return record;

  const convertedRecord = { ...record };
  
  // Convert amount field
  if (record.amount) {
    convertedRecord.amount = convertAmount(record.amount, fromCurrency, toCurrency);
  }
  
  // Convert targetAmount field (for budget goals)
  if (record.targetAmount) {
    convertedRecord.targetAmount = convertAmount(record.targetAmount, fromCurrency, toCurrency);
  }
  
  // Convert currentAmount field (for budget goals)
  if (record.currentAmount) {
    convertedRecord.currentAmount = convertAmount(record.currentAmount, fromCurrency, toCurrency);
  }

  return convertedRecord;
};

module.exports = {
  convertAmount,
  convertRecordAmounts,
  conversionRates
}; 