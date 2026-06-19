import {
  createContext,
  createElement,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
} from "react";
import useFormState, { TErrorsType } from "./hooks/useFormState";
import useGlobalErrors from "./hooks/useGlobalErrors";
import useResetForm from "./hooks/useResetForm";
import useServices from "./hooks/useServices";
import useValidation from "./hooks/useValidation";
import {
  buildEmptySectionData,
  buildInitialFormData,
  getAllFields,
  getFieldSchema,
  getIn,
  setIn,
  type FormValue,
} from "./utils/formState";
import {
  IConditionProps,
  IField,
  IFieldState,
  IFormSchema,
  IRemoteSelectOptions,
} from "./types";
interface FormContextType {
  //-
  formData: Record<string, FormValue>;
  errors: TErrorsType;
  touched: Record<string, boolean>;
  fieldStates: Record<string, IFieldState>;
  remoteOptions: Record<string, { label: string; value: string }[]>;
  setFormData: Dispatch<SetStateAction<Record<string, FormValue>>>;
  setErrors: Dispatch<SetStateAction<TErrorsType>>;
  setFieldStates: Dispatch<SetStateAction<Record<string, IFieldState>>>;
  setTouched: Dispatch<SetStateAction<Record<string, boolean>>>;
  setRemoteOptions: Dispatch<
    SetStateAction<Record<string, { label: string; value: string }[]>>
  >;

  // --
  handleChange: (
    fieldName: string,
    value: FormValue,
    sectionIndex: number,
    inArray?: boolean,
    arrayName?: string,
    indexArray?: number
  ) => void;
  handleOnBlur: (
    fieldName: string,
    inArray?: boolean,
    arrayName?: string,
    indexArray?: number
  ) => void;
  handleSubmit: (
    e: FormEvent,
    validateFields: "ALL" | "SECTION" | string[],
    sectionIndex?: number
  ) => void;
  // --
  isFieldRequired: (
    field: IField,
    formData: Record<string, unknown>,
    inArray?: boolean,
    arrayName?: string,
    indexArray?: number
  ) => boolean;
  // --
  checkFormState: () => "error" | "notFill" | "valid" | null;
  handleClearForm: (
    sectionIndex?: number,
    arrayName?: string,
    arrayIndex?: number
  ) => void;
  handleSelectOption: (conditions: IConditionProps) => boolean | undefined;
  UseGetRemoteOptions: ({
    endPointUrl,
    labelNameKey,
    valueNameKey,
    path,
  }: IRemoteSelectOptions & { fieldName: string }) => {
    fetchOptions: () => void;
  };
  // --
  formSchema: IFormSchema;
}

const FormContext = createContext<FormContextType | null>(null);

interface FormProviderProps {
  children: ReactNode;
  formSchema: IFormSchema;
  onSubmit: ({
    formData,
    sectionIndex,
  }: {
    formData: Record<string, FormValue>;
    sectionIndex?: number;
  }) => void;
}

const FormProvider = ({
  children,
  formSchema,
  onSubmit,
}: FormProviderProps) => {
  const formStates = useFormState();
  const {
    formData,
    fieldStates,
    setErrors,
    errors,
    setFormData,
    touched,
    setFieldStates,
    setTouched,
    remoteOptions,
    setRemoteOptions,
  } = formStates;

  const {
    checkFieldsState,
    validateSingleField,
    isFieldRequired,
    isValidForm,
    handleSelectOption,
  } = useValidation({
    errors,
    fieldStates,
    formData,
    formSchema,
    setErrors,
    setFieldStates,
    setFormData,
    setTouched,
  });

  const globalErrors = useGlobalErrors({
    errors,
    fieldStates,
    formData,
    formSchema,
    setErrors,
    setFieldStates,
    setFormData,
  });
  void globalErrors;

  const { handleResetForm } = useResetForm({
    formData,
    formSchema,
    setErrors,
  });

  const { UseGetRemoteOptions } = useServices({
    setFormData,
  });

  useEffect(() => {
    const newFieldStates = checkFieldsState(formData);
    // setFieldStates(newFieldStates);
    // validateGlobalErrors();
    // validateSectionsGlobalErrors();

    Object.keys(newFieldStates).forEach((fieldName) => {
      if (
        !newFieldStates[fieldName].isEnable &&
        getIn(formData, fieldName) &&
        (getFieldSchema(formSchema, fieldName)?.resetValueWhenDisable ??
          true)
      ) {
        setFormData((prev) => ({ ...prev, [fieldName]: "" }));
      }
    });
  }, [checkFieldsState, formData, formSchema, setFormData]);

  useEffect(() => {
    const applyDefaults = async () => {
      let remoteDefaults: Record<string, FormValue> | undefined;
      if (formSchema?.remoteDefaultValue?.endPointUrl) {
        try {
          const response = await fetch(formSchema.remoteDefaultValue.endPointUrl);
          const result = await response.json();
          const defaultValue = formSchema.remoteDefaultValue.path
            ? getIn(result, formSchema.remoteDefaultValue.path, result)
            : result;

          if (defaultValue && typeof defaultValue === "object") {
            remoteDefaults = defaultValue as Record<string, FormValue>;
          }
        } catch {
          // Keep local defaults if remote default loading fails.
        }
      }

      setFormData((prev) => ({
        ...prev,
        ...buildInitialFormData(formSchema, remoteDefaults),
      }));
    };

    void applyDefaults();
  }, [
    formSchema,
    setFormData,
  ]);

  const handleChange = (
    fieldName: string,
    value: FormValue,
    sectionIndex: number,
    inArray?: boolean,
    arrayName?: string,
    indexArray?: number
  ) => {
    if (inArray && arrayName) {
      const path = `${arrayName}.${indexArray}.${fieldName}`;
      setFormData((prev) => {
        const nextFormData = setIn(prev, path, value);

        if (touched[path]) {
          const rowContext =
            (getIn(nextFormData, `${arrayName}.${indexArray}`) as
              | Record<string, unknown>
              | undefined) ?? {};
          validateSingleField({
            fieldName,
            fieldValue: value,
            errorPath: path,
            validationContext: rowContext,
          });
        }

        return nextFormData;
      });
    } else {
      const fieldNames = handleResetForm({ sectionIndex, fieldName });
      setFormData((prev) => ({ ...prev, ...fieldNames, [fieldName]: value }));
      if (touched[fieldName]) {
        validateSingleField({ fieldName, fieldValue: value });
      }
    }
  };

  const handleOnBlur = (
    fieldName: string,
    inArray?: boolean,
    arrayName?: string,
    indexArray?: number
  ) => {
    const path = inArray && arrayName ? `${arrayName}.${indexArray}.${fieldName}` : fieldName;
    setTouched((prev) => ({
      ...prev,
      [path]: true,
    }));
    validateSingleField({
      fieldName,
      fieldValue: inArray && arrayName ? getIn(formData, path) : undefined,
      errorPath: inArray && arrayName ? path : undefined,
      validationContext:
        inArray && arrayName
          ? ((getIn(formData, `${arrayName}.${indexArray}`) as
              | Record<string, unknown>
              | undefined) ?? {})
          : undefined,
    });
  };

  const handleSubmit = (
    e: FormEvent,
    validateFields: "ALL" | "SECTION" | string[],
    sectionIndex?: number
  ) => {
    e.preventDefault();
    const button = e.currentTarget as HTMLElement;
    const rawArrayIndex = button.dataset?.arrayIndex;
    const arrayIndex =
      rawArrayIndex !== undefined ? Number(rawArrayIndex) : undefined;
    const arrayName = button.dataset?.arrayName;

    if (isValidForm(validateFields, sectionIndex, arrayIndex, arrayName)) {
      onSubmit({ formData, sectionIndex });
    }
  };

  const checkFormState = () => {
    const allFields = getAllFields(formSchema.sections);
    const requiredFields = Object.keys(allFields).filter((field) =>
      isFieldRequired(allFields[field], formData)
    );

    const isValid = requiredFields.every(
      (field) => getIn(formData, field) && !errors?.[field]?.length
    );
    const hasError = requiredFields.some((field) => errors?.[field]?.length);
    const notFill = requiredFields.some(
      (field) => !getIn(formData, field) && !errors?.[field]?.length
    );

    if (hasError) return "error";
    if (notFill) return "notFill";
    if (isValid) return "valid";
    return null;
  };

  const handleClearForm = (
    sectionIndex?: number,
    arrayName?: string,
    arrayIndex?: number
  ) => {
    if (sectionIndex === undefined) {
      setErrors({});
      setFormData(buildInitialFormData(formSchema));
      setFieldStates({});
      setTouched({});
      return;
    }
    const section = formSchema.sections[sectionIndex];
    const fieldNames = Object.keys(section.fields);

    if (section.isArray && section.arrayName) {
      const nextRow = buildEmptySectionData(section) as FormValue[];

      if (arrayName && arrayIndex !== undefined) {
        setFormData((prev) =>
          setIn(prev, `${arrayName}.${arrayIndex}`, nextRow[0] ?? {})
        );
        setErrors((prev) => {
          const nextErrors = fieldNames.reduce<Record<string, string[]>>(
            (result, fieldName) => {
              result[fieldName] = [];
              return result;
            },
            {}
          );
          return setIn(prev, `${arrayName}.${arrayIndex}`, nextErrors);
        });
        setTouched((prev) => {
          const nextTouched = fieldNames.reduce<Record<string, boolean>>(
            (result, fieldName) => {
              result[`${arrayName}.${arrayIndex}.${fieldName}`] = false;
              return result;
            },
            {}
          );
          return { ...prev, ...nextTouched };
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [section.arrayName!]: nextRow,
      }));
      setErrors((prev) => ({
        ...prev,
        [section.arrayName!]: [],
      }));
      return;
    }

    const nextFormData = fieldNames.reduce<Record<string, FormValue>>(
      (prev, cur) => ({ ...prev, [cur]: "" }),
      {}
    );
    const nextErrors = fieldNames.reduce(
      (prev, cur) => ({ ...prev, [cur]: [] }),
      {}
    );
    const nextTouched = fieldNames.reduce(
      (prev, cur) => ({ ...prev, [cur]: false }),
      {}
    );

    setFormData((prev) => ({ ...prev, ...nextFormData }));
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    setTouched((prev) => ({ ...prev, ...nextTouched }));
  };

  const contextValue: FormContextType = {
    ...formStates,
    handleChange,
    handleOnBlur,
    handleSubmit,
    isFieldRequired,
    checkFormState,
    formSchema,
    handleClearForm,
    handleSelectOption,
    UseGetRemoteOptions,
    remoteOptions,
    setRemoteOptions,
  };

  return createElement(FormContext.Provider, { value: contextValue }, children);
};

export const useForm = () => {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error("useFormContext must be used within a FormProvider");
  return formContext;
};

export default FormProvider;
