export function getCurrencySymbol(currency?: string): string {
  switch (currency) {
    case 'MAD':
      return 'MAD';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return currency || 'MAD';
  }
}

export function convertToDisplayValue(value: number, currency?: string): number {
  switch (currency) {
    case 'MAD':
      return value * 10;
    case 'USD':
    case 'EUR':
    default:
      return value;
  }
} 