/**
 * Utilitario para concatenar classes CSS (Tailwind).
 * Substituir por clsx + tailwind-merge se necessario.
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(' ');
}
