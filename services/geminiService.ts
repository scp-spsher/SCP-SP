import { ObjectClass } from '../types';

export interface GeneratedSCPReport {
  itemNumber: string;
  objectClass: string;
  containmentProcedures: string;
  description: string;
}

const objectClasses = [
  ObjectClass.SAFE,
  ObjectClass.EUCLID,
  ObjectClass.KETER,
  ObjectClass.THAUMIEL,
];

const chooseObjectClass = (num: number) => {
  return objectClasses[Math.abs(num) % objectClasses.length];
};

// Lightweight local fallback to keep the app operational if external AI is unavailable.
export const generateSCPReport = async (rawNumber: string): Promise<GeneratedSCPReport> => {
  const digitsOnly = String(rawNumber || '').replace(/\D/g, '');
  if (!digitsOnly) {
    throw new Error('SCP number is required');
  }

  const normalized = digitsOnly.padStart(3, '0');
  const numericValue = Number(digitsOnly);
  const objectClass = chooseObjectClass(numericValue);
  const itemNumber = `SCP-${normalized}`;

  return {
    itemNumber,
    objectClass,
    containmentProcedures:
      `Объект ${itemNumber} должен содержаться в стандартной изолированной камере. ` +
      `Доступ разрешен персоналу с соответствующим допуском. Изменения режима содержания фиксируются в журнале смены.`,
    description:
      `Сгенерированный досье-заглушка для ${itemNumber}. ` +
      `Полная карточка объекта недоступна в локальном режиме и требует удаленного источника данных.`,
  };
};

