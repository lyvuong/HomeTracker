import type { MaintenanceCategory, Home } from '../types';

export const buildTransactionCategory = (category: MaintenanceCategory, home: Home): string =>
  `Home - ${category} - ${home.nickname}`;
