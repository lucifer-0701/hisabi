/**
 * Tax utility — returns tax info for a given country code
 * Supports: IN (India GST 18%), AE (UAE VAT 5%), KW (Kuwait 0%)
 */

const TAX_RATES = {
    IN: { name: 'GST', rate: 0.18 },
    AE: { name: 'VAT', rate: 0.05 },
    KW: { name: 'None', rate: 0.00 }
};

/**
 * Calculate tax on a given amount
 * @param {number} amount - base amount in local currency units
 * @param {string} country - 2-letter country code (IN/AE/KW)
 * @returns {{ taxName, taxRate, taxAmount, total }}
 */
const calculateTax = (amount, country = 'AE') => {
    const tax = TAX_RATES[country] || TAX_RATES['AE'];
    const taxAmount = parseFloat((amount * tax.rate).toFixed(2));
    return {
        taxName: tax.name,
        taxRate: tax.rate,
        taxAmount,
        total: parseFloat((amount + taxAmount).toFixed(2))
    };
};

/**
 * Return whether GST applies for a country
 */
const isGSTCountry = (country) => country === 'IN';

module.exports = { calculateTax, isGSTCountry, TAX_RATES };
