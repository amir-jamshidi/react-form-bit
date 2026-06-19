import { IField, IFormSchema, ISection } from "../types";

export type FormPrimitive = string | number | boolean | null | undefined;
export type FormValue =
  | FormPrimitive
  | { [key: string]: FormValue }
  | FormValue[];

export type FormValues = Record<string, FormValue>;
export type FormErrorTree = Record<
  string,
  string[] | FormErrorTree[] | undefined
>;

const PATH_SEGMENT_PATTERN = /[^.[\]]+/g;

const isIndexSegment = (segment: string): boolean => /^\d+$/.test(segment);

const cloneContainer = (value: unknown): Record<string, unknown> | unknown[] => {
  if (Array.isArray(value)) return [...value];
  if (value && typeof value === "object") return { ...(value as Record<string, unknown>) };
  return {};
};

export const splitPath = (path: string): string[] => {
  if (!path) return [];
  return path.match(PATH_SEGMENT_PATTERN) ?? [path];
};

export const getIn = <T = unknown>(
  source: unknown,
  path: string,
  fallback?: T
): T | undefined => {
  if (!path) return (source as T) ?? fallback;

  const segments = splitPath(path);
  let current: unknown = source;

  for (const segment of segments) {
    if (current == null) return fallback;

    const key: string | number = isIndexSegment(segment)
      ? Number(segment)
      : segment;

    const container = current as Record<string, unknown>;
    current = container[key as string];
  }

  return (current as T | undefined) ?? fallback;
};

export const setIn = <T extends Record<string, unknown> | unknown[]>(
  source: T,
  path: string,
  value: unknown
): T => {
  const segments = splitPath(path);

  if (segments.length === 0) {
    return value as T;
  }

  const root = cloneContainer(source);
  let cursor: Record<string, unknown> | unknown[] = root;
  let currentSource: unknown = source;

  segments.forEach((segment, index) => {
    const key: string | number = isIndexSegment(segment)
      ? Number(segment)
      : segment;
    const isLast = index === segments.length - 1;

    if (isLast) {
      (cursor as any)[key] = value;
      return;
    }

    const currentContainer = currentSource as Record<string, unknown> | undefined;
    const currentValue = currentContainer?.[key as string];
    const nextValue = cloneContainer(currentValue);

    (cursor as Record<string, unknown>)[key as string] = nextValue;
    cursor = nextValue;
    currentSource = currentValue;
  });

  return root as T;
};

const deepClone = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        deepClone(entry),
      ])
    ) as T;
  }

  return value;
};

export const getFieldSchema = (
  formSchema: IFormSchema,
  fieldName: string
): IField | undefined => {
  for (const section of formSchema.sections) {
    const fieldSchema = section.fields[fieldName];
    if (fieldSchema) return fieldSchema;
  }

  return undefined;
};

export const getSectionFields = (section: ISection): Record<string, IField> => {
  return { ...section.fields };
};

export const getAllFields = (sections: ISection[]): Record<string, IField> => {
  return sections.reduce<Record<string, IField>>(
    (allFields, section) => ({ ...allFields, ...section.fields }),
    {}
  );
};

const createEmptyRow = (section: ISection): Record<string, string> => {
  return Object.keys(section.fields).reduce<Record<string, string>>(
    (row, fieldName) => {
      row[fieldName] = "";
      return row;
    },
    {}
  );
};

export const buildEmptySectionData = (
  section: ISection
): Record<string, FormValue> | FormValue[] => {
  if (section.isArray && section.arrayName) {
    if (section.defaultItems?.length) {
      return deepClone(section.defaultItems) as FormValue[];
    }

    return [createEmptyRow(section)] as FormValue[];
  }

  return Object.keys(section.fields).reduce<Record<string, FormValue>>(
    (result, fieldName) => {
      result[fieldName] = "";
      return result;
    },
    {}
  );
};

export const buildInitialFormData = (
  formSchema: IFormSchema,
  remoteDefaults?: Record<string, FormValue>
): Record<string, FormValue> => {
  const initialFormData = deepClone((formSchema.defaultValue ?? {}) as Record<
    string,
    FormValue
  >);

  formSchema.sections.forEach((section) => {
    if (!section.isArray || !section.arrayName) return;

    const existingValue = initialFormData[section.arrayName];
    if (Array.isArray(existingValue) && existingValue.length > 0) return;

    if (section.defaultItems?.length) {
      initialFormData[section.arrayName] = deepClone(section.defaultItems);
      return;
    }

    initialFormData[section.arrayName] = [createEmptyRow(section)];
  });

  return {
    ...initialFormData,
    ...(remoteDefaults ?? {}),
  };
};
