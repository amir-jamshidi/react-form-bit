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
  handleClearForm: (sectionIndex?: number) => void;
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
      setFormData((prev) => setIn(prev, path, value));
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
    });
  };

  const handleSubmit = (
    e: FormEvent,
    validateFields: "ALL" | "SECTION" | string[],
    sectionIndex?: number
  ) => {
    e.preventDefault();

    const target = e.nativeEvent.target as HTMLElement;
    const arrayIndex = Number(target?.dataset?.arrayIndex);
    const arrayName = target?.dataset?.arrayName;
    // const action = target?.dataset?.action;
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

  const handleClearForm = (sectionIndex?: number) => {
    if (sectionIndex === undefined) {
      setErrors({});
      setFormData({});
      setFieldStates({});
      setTouched({});
      return;
    }
    const fieldNames = Object.keys(formSchema.sections[sectionIndex].fields);

    const formData = fieldNames.reduce<Record<string, FormValue>>(
      (prev, cur) => ({ ...prev, [cur]: "" }),
      {}
    );
    const errors = fieldNames.reduce(
      (prev, cur) => ({ ...prev, [cur]: [] }),
      {}
    );
    const touched = fieldNames.reduce(
      (prev, cur) => ({ ...prev, [cur]: false }),
      {}
    );

    setFormData((prev) => ({ ...prev, ...formData }));
    setErrors((prev) => ({ ...prev, ...errors }));
    setTouched((prev) => ({ ...prev, ...touched }));
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
