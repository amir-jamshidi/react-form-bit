import { createContext, ReactNode, useContext, useEffect } from "react";
import { formSchema } from "./components/Form";
import useFormState, { TErrorsType } from "./hooks/useFormState";
import useGlobalErrors from "./hooks/useGlobalErrors";
import useResetForm from "./hooks/useResetForm";
import useServices from "./hooks/useServices";
import useValidation from "./hooks/useValidation";
import {
  IConditionProps,
  IField,
  IFieldState,
  IFormSchema,
  IRemoteSelectOptions,
  ISection,
} from "./types";
interface FormContextType {
  //-
  formData: Record<string, any>;
  errors: TErrorsType;
  touched: Record<string, boolean>;
  fieldStates: Record<string, IFieldState>;
  remoteOptions: Record<string, { label: string; value: any }[]>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setErrors: React.Dispatch<React.SetStateAction<TErrorsType>>;
  setFieldStates: React.Dispatch<
    React.SetStateAction<Record<string, IFieldState>>
  >;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setRemoteOptions: React.Dispatch<
    React.SetStateAction<Record<string, { label: string; value: any }[]>>
  >;

  // --
  handleChange: (
    fieldName: string,
    value: any,
    sectionIndex: number,
    inArray?: boolean,
    arrayName?: string,
    indexArray?: number
  ) => void;
  handleOnBlur: (fieldName: string) => void;
  handleSubmit: (
    e: React.FormEvent,
    validateFields: "ALL" | "SECTION" | string[],
    sectionIndex?: number
  ) => void;
  // --
  isFieldRequired: (
    field: IField,
    formData: Record<string, any>,
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
}

const getAllFields = (sections: ISection[]): Record<string, IField> => {
  return sections.reduce((prev, cur) => ({ ...prev, ...cur.fields }), {});
};

const FormProvider = ({ children }: FormProviderProps) => {
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

  const { validateGlobalErrors, validateSectionsGlobalErrors } =
    useGlobalErrors({
      errors,
      fieldStates,
      formData,
      formSchema,
      setErrors,
      setFieldStates,
      setFormData,
    });

  const { handleResetForm } = useResetForm({
    formData,
    formSchema,
    setErrors,
  });

  const { getRemoteDefaultValue, UseGetRemoteOptions } = useServices({
    setFormData,
  });

  useEffect(() => {
    const newFieldStates = checkFieldsState(formData);
    setFieldStates(newFieldStates);
    validateGlobalErrors();
    validateSectionsGlobalErrors();

    Object.keys(newFieldStates).forEach((fieldName) => {
      if (
        !newFieldStates[fieldName].isEnable &&
        formData[fieldName] &&
        (getAllFields(formSchema.sections)[fieldName].resetValueWhenDisable ??
          true)
      ) {
        setFormData((prev) => ({ ...prev, [fieldName]: "" }));
      }
    });
  }, [formStates.formData]);

  useEffect(() => {
    if (formSchema?.remoteDefaultValue?.endPointUrl) {
      getRemoteDefaultValue({
        endPointUrl: formSchema.remoteDefaultValue.endPointUrl,
        path: formSchema.remoteDefaultValue.path,
      });
    }

    const defaultValues: Record<string, any> = formSchema.defaultValue || {};
    const initialFormData = { ...formData };

    formSchema.sections.forEach((section) => {
      if (section.isArray && section.arrayName) {
        const emptyItems = Object.keys(section.fields).reduce(
          (acc, cur) => ({ ...acc, [cur]: "" }),
          {}
        );
        defaultValues[section.arrayName] = [{ ...emptyItems }];
        console.log(defaultValues);
        if (!initialFormData[section.arrayName] && section.defaultItems) {
          initialFormData[section.arrayName] = [...section.defaultItems];
        }
      }
    });
    //! RESET ARRAY FORMS - PROBLEM
    setFormData({ ...formData, ...initialFormData, ...defaultValues });
  }, []);

  const handleChange = (
    fieldName: string,
    value: any,
    sectionIndex: number,
    inArray?: boolean,
    arrayName?: string,
    indexArray?: number
  ) => {
    if (inArray && arrayName) {
      const arrayList = [...formData[arrayName]];
      arrayList[indexArray!][fieldName] = value;
      const newFormData = { ...formData, [arrayName]: arrayList };
      setFormData(newFormData);
      if (true) {
        console.log("run ....");
        // validationAndUpdateErrors(
        //   fieldName,
        //   value,
        //   newFormData,
        //   inArray,
        //   arrayName,
        //   indexArray
        // );
      }
    } else {
      const fieldNames = handleResetForm({ sectionIndex, fieldName });
      const newFormData = { ...formData, ...fieldNames, [fieldName]: value };
      setFormData(newFormData);
      if (touched[fieldName]) {
        validateSingleField({ fieldName, fieldValue: value });
      }
    }
  };

  const handleOnBlur = (fieldName: string) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    validateSingleField({ fieldName });
  };

  const handleSubmit = (
    e: React.FormEvent,
    validateFields: "ALL" | "SECTION" | string[],
    sectionIndex?: number
  ) => {
    e.preventDefault();

    const target = e.nativeEvent.target as HTMLElement;
    const arrayIndex = Number(target?.dataset?.arrayIndex);
    const arrayName = target?.dataset?.arrayName;
    // const action = target?.dataset?.action;

    if (isValidForm(validateFields, sectionIndex, arrayIndex, arrayName)) {
      console.log(`Call Submit Fn ... \n `, formData);
    }
  };

  const checkFormState = () => {
    const allFields = getAllFields(formSchema.sections);
    const requiredFields = Object.keys(allFields).filter((field) =>
      isFieldRequired(allFields[field], formData)
    );

    const isValid = requiredFields.every(
      (field) => formData?.[field] && !errors?.[field]?.length
    );
    const hasError = requiredFields.some((field) => errors?.[field]?.length);
    const notFill = requiredFields.some(
      (field) => !formData[field] && !errors?.[field]?.length
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

    const formData = fieldNames.reduce(
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

  return (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );
};

export const useForm = () => {
  const formContext = useContext(FormContext);
  if (!formContext)
    throw new Error("useFormContext must be used within a FormProvider");
  return formContext;
};

export default FormProvider;
