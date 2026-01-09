type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | ClassValue[]
  | { [key: string]: boolean | undefined | null };

export function cn(...classes: ClassValue[]): string {
  const classList: string[] = [];

  function processClass(cls: ClassValue) {
    if (!cls) return;

    if (typeof cls === 'string' || typeof cls === 'number') {
      classList.push(String(cls));
      return;
    }

    if (Array.isArray(cls)) {
      cls.forEach(processClass);
      return;
    }

    if (typeof cls === 'object') {
      Object.keys(cls).forEach(key => {
        if (cls[key]) {
          classList.push(key);
        }
      });
    }
  }

  classes.forEach(processClass);

  const classMap = new Map<string, string>();

  const tailwindPrefixes = [
    'text-', 'bg-', 'border-', 'rounded-', 'shadow-',
    'p-', 'px-', 'py-', 'pt-', 'pr-', 'pb-', 'pl-',
    'm-', 'mx-', 'my-', 'mt-', 'mr-', 'mb-', 'ml-',
    'w-', 'h-', 'min-w-', 'min-h-', 'max-w-', 'max-h-',
    'flex-', 'grid-', 'gap-', 'space-x-', 'space-y-',
    'font-', 'leading-', 'tracking-', 'opacity-',
    'z-', 'top-', 'right-', 'bottom-', 'left-',
    'inset-', 'order-', 'col-', 'row-'
  ];

  classList.forEach(cls => {
    let prefix = 'other';

    for (const p of tailwindPrefixes) {
      if (cls.startsWith(p)) {
        const parts = cls.split(':');
        const actualClass = parts[parts.length - 1];
        const modifiers = parts.slice(0, -1).join(':');

        if (actualClass.startsWith(p)) {
          prefix = modifiers ? `${modifiers}:${p}` : p;
          break;
        }
      }
    }

    classMap.set(prefix + (prefix === 'other' ? cls : ''), cls);
  });

  return Array.from(classMap.values()).join(' ');
}