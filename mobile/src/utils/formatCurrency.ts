/**
 * Format a number as Vietnamese currency (VND)
 * @param amount The amount to format
 * @returns Formatted currency string (e.g., "1.500.000")
 */
export const formatCurrency = (amount?: number | string): string => {
  if (amount === null || amount === undefined) {
    return "0";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0";
  }

  // Format number with thousand separators using Vietnamese locale
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

/**
 * Parse a formatted currency string back to number
 * @param formattedValue The formatted currency string
 * @returns The numeric value
 */
export const parseCurrency = (formattedValue: string): number => {
  const cleaned = formattedValue.replace(/\./g, "").replace(/,/g, ".");
  return parseFloat(cleaned) || 0;
};
