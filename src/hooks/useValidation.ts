import { IConditionProps, IField, IFieldState, IFormSchema, IValidation } from "../types";
import ValidatorEngine from "../utils/ValidatorEngine";
import { TErrorsType } from "./useFormState";
import { getAllFields, getFieldSchema, getIn } from "../utils/formState";


interface IuseValidation {
    formSchema: IFormSchema;
    setErrors: React.Dispatch<React.SetStateAction<TErrorsType>>;
    formData: Record<string, any>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    errors: TErrorsType
    fieldStates: Record<string, IFieldState>;
    setFieldStates: React.Dispatch<React.SetStateAction<Record<string, IFieldState>>>;
    setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const useValidation = ({
    formSchema,
    errors,
    setErrors,
    setTouched,
    formData
}: IuseValidation) => {

    //* ---------------------------------------------------- Array Form ---------------------------------------------

    //! HELPER FN
    const getArraySections = () => {
        return formSchema.sections.filter(
            (section) => section.isArray && section.arrayName
        );
    }

    const getSectionArrayFields = ({ sectionIndex }: { sectionIndex: number }) => {
        return { ...formSchema.sections[sectionIndex].fields };
    }


    //* ---------------------------------------------------- Normal Form ---------------------------------------------

    //! HELPER FN
    const getSomeFields = ({ fieldsKey }: { fieldsKey: string[] }) => {
        return fieldsKey.reduce((accumulator: Record<string, any | undefined>, fieldKey: string) => {
            const fieldProperties = getFieldSchema(formSchema, fieldKey);
            accumulator[fieldKey] = fieldProperties ? { ...fieldProperties } : undefined;
            return accumulator;
        }, {});
    }

    //! HELPER FN => RETURN EMPTY ERRORS FOR FIELDS WE NOT VALIDATION FOR IT
    const getEmptyErrors = ({ skipFields }: { skipFields: string[] }): Record<string, string[]> => {
        return Object.fromEntries(
            Object.entries(errors)
                .filter(([key]) => !skipFields.includes(key))
                .map(([key]) => [key, []])
        );
    }

    //* -------------------------------------------------------------------------------------------------

    //! MAIN FUNCTION FOR VALIDATON => ENTRY POINT
    const isValidForm = (fieldsToValidate: "ALL" | "SECTION" | string[], sectionIndex?: number, arrayIndex?: number, arrayName?: string): boolean => {

        const hasArraySection = formSchema.sections.some(section => Boolean(section.isArray))

        if (fieldsToValidate === 'SECTION' && sectionIndex !== undefined && sectionIndex >= 0 && arrayIndex !== undefined && arrayIndex >= 0 && arrayName) {
            return ValidateArrayFormSection({ arrayName, formIndex: arrayIndex, sectionIndex })
        }

        if (hasArraySection && fieldsToValidate === 'ALL') {
            ValidateArrayForm();
            ValidateAllForm();
        }

        if (fieldsToValidate === 'ALL') return ValidateAllForm();
        if (fieldsToValidate === "SECTION" && sectionIndex !== undefined && sectionIndex >= 0) return ValidateSectionForm({ sectionIndex })
        if (Array.isArray(fieldsToValidate)) return ValidateSomeFields({ fieldsKey: fieldsToValidate })

        return true
    }


    //* ---------------------- Array Validator ----------------------------

    //! VALIDATE ALL ARRAY FORMS
    const ValidateArrayForm = (): boolean => {
        const arraySections = getArraySections();
        const nextErrors: Record<string, Record<string, any>[]> = {};
        let hasError = false;

        arraySections.forEach(section => {
            const arrayName = section.arrayName!;
            nextErrors[arrayName] = [];

            const rows = formData[arrayName];
            if (!Array.isArray(rows)) return;

            rows.forEach((formObject: any, formIndex: number) => {
                nextErrors[arrayName][formIndex] = nextErrors[arrayName][formIndex] || {};

                Object.keys(section.fields).forEach(fieldName => {
                    const fieldSchema = section.fields[fieldName];
                    if (!fieldSchema) return;
                    const fieldErrors = validateAndUpdateArrayForms({
                        fieldName,
                        fieldSchema,
                        arrayName,
                        formIndex
                    });

                    if (fieldErrors) {
                        if ((fieldErrors[fieldName]?.length ?? 0) > 0) {
                            hasError = true;
                        }
                        nextErrors[arrayName][formIndex] = {
                            ...nextErrors[arrayName][formIndex],
                            ...fieldErrors
                        };
                    }
                });
            });
        });

        setErrors(prevErrors => ({ ...prevErrors, ...nextErrors } as any));
        return !hasError;
    };

    //! VALIDATE ONE INDEX OF ONE SECTION ARRAY FORM
    const ValidateArrayFormSection = ({ sectionIndex, arrayName, formIndex }: { sectionIndex: number, arrayName: string, formIndex: number }): boolean => {

        const fieldsSchema = getSectionArrayFields({ sectionIndex })
        const errors: Record<string, Record<string, any>[]> = {};
        let hasError = false
        errors[arrayName] = [];

        Object.keys(formData[arrayName][formIndex]).forEach(fieldName => {
            const fieldSchema = fieldsSchema[fieldName];
            if (!fieldSchema) return;
            const fieldErrors = validateAndUpdateArrayForms({
                fieldName,
                fieldSchema,
                arrayName,
                formIndex
            });

            if (fieldErrors) {
                if (fieldErrors[fieldName].length > 0) hasError = true
                errors[arrayName][formIndex] = {
                    ...errors[arrayName][formIndex],
                    ...fieldErrors
                };
            }
        });

        setErrors(errors as any);
        return !hasError
    }


    //* ---------------------- Normal Validator ----------------------------

    //! VALIDATE ALL FORM FIELDS AND TRIGGER validateAndUpdateNormalForm()
    const ValidateAllForm = (): boolean => {
        let touchedFields: Record<string, boolean> = {}
        let errors = {}
        const fieldsSchema = getAllFields(formSchema.sections);
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (fieldError) {
                errors = { ...errors, ...fieldError }
            }
            touchedFields[fieldName] = true
        })
        setTouched(prevToucheds => ({ ...prevToucheds, ...touchedFields }))
        setErrors(prevErrors => ({ ...prevErrors, ...errors }))
        return !Boolean(Object.keys(errors).length)
    }

    //! VALIDATE ONE FORM SECTION AND TRIGGER validateAndUpdateNormalForm()
    const ValidateSectionForm = ({ sectionIndex }: { sectionIndex: number }): boolean => {
        let touchedFields: Record<string, boolean> = {}
        let errors = {}
        const fieldsSchema = formSchema.sections[sectionIndex].fields;
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (Object.keys(fieldError).length > 0) {
                errors = { ...errors, ...fieldError }
            } else {
                errors = { ...errors }
            }
            touchedFields[fieldName] = true
        })
        const outherFieldsErrorReset = getEmptyErrors({ skipFields: Object.keys(fieldsSchema) })
        setTouched(prevToucheds => ({ ...prevToucheds, ...touchedFields }))
        setErrors(prevErrors => ({ ...prevErrors, ...errors, ...outherFieldsErrorReset, }))
        return !Boolean(Object.keys(errors).length > 0)
    }

    //! VALIDATE SOME FORM FIELDS AND TRIGGER validateAndUpdateNormalForm()
    const ValidateSomeFields = ({ fieldsKey }: { fieldsKey: string[] }): boolean => {
        let touchedFields: Record<string, boolean> = {}
        let errors = {}
        const fieldsSchema = getSomeFields({ fieldsKey })
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (fieldError) {
                errors = { ...errors, ...fieldError }
            }
            touchedFields[fieldName] = true
        })
        const outherFieldsErrorReset = getEmptyErrors({ skipFields: fieldsKey })
        setTouched(prevToucheds => ({ ...prevToucheds, ...touchedFields }))
        setErrors(prevErrors => ({ ...prevErrors, ...errors, ...outherFieldsErrorReset, }))
        return !Boolean(Object.keys(errors).length > 0)
    }

    //* CHECK VALIDATION ON BLUR
    const validateSingleField = ({ fieldName, fieldValue: value }: { fieldName: string, fieldValue?: unknown }) => {
        const errors: Record<string, string[]> = {}
        const validations = getFieldSchema(formSchema, fieldName)?.validations;
        const fieldValue = value !== undefined ? value : getIn(formData, fieldName)
        if (!validations) return

        errors[fieldName] = []
        validations?.forEach((validation: IValidation) => {
            const fieldErrors = ValidatorEngine.validate(validation, fieldValue, formData)
            if (fieldErrors) {
                errors[fieldName] = fieldErrors
            } else {
                errors[fieldName] = [...errors[fieldName]]
            }
        })
        setErrors(prev => ({ ...prev, ...errors }))
    }

    //* CHECK VALIDATIONS AND RETURN ERRORS
    const validateAndUpdateNormalForm = ({ fieldSchema, fieldName }: { fieldSchema: any, fieldName: string }) => {
        const errors: Record<string, string[]> = {}
        const validations = fieldSchema.validations;
        const fieldValue = getIn(formData, fieldName) || ''

        if (!validations) {
            return errors;
        }

        validations.forEach((validation: IValidation) => {
            const fieldErrors = ValidatorEngine.validate(validation, fieldValue, formData)
            if (fieldErrors) {
                errors[fieldName] = fieldErrors
            }
        })
        return errors
    }

    //* CHECK VALIDATIONS FOR ARRAYS FROM AND RETURN ERRORS
    const validateAndUpdateArrayForms = ({ fieldSchema, fieldName, arrayName, formIndex }: { fieldSchema: any, fieldName: string, arrayName: string, formIndex: number }) => {
        const errors: Record<string, string[]> = {}
        const validations = fieldSchema.validations;
        const fieldValue = getIn(formData, `${arrayName}.${formIndex}.${fieldName}`) || ''

        if (!validations) {
            errors[fieldName] = [];
            return errors;
        }
        validations.forEach((validation: IValidation) => {
            const fieldErrors = ValidatorEngine.validate(validation, fieldValue, formData)
            if (fieldErrors) {
                errors[fieldName] = fieldErrors
            }
        })

        if (!errors[fieldName]) {
            errors[fieldName] = []
        }

        return errors
    }



    const isFieldRequired = (
        fieldSchema: IField,
        currentFormData: Record<string, unknown>
    ): boolean => {

        if (!fieldSchema.validations) return false;

        return fieldSchema.validations.some(validate => {
            if (validate.required) {
                if (validate.when) {
                    return ValidatorEngine.evaluateCondition(
                        validate.when,
                        currentFormData
                    );
                }
                return true;
            }
            return false;
        });
    };

    const handleSelectOption = (conditions: IConditionProps) => {
        if (!conditions) return
        return ValidatorEngine.evaluateCondition(
            conditions,
            formData
        );
    }

    return {
        checkFieldsState,
        validateSingleField,
        isValidForm,
        isFieldRequired,
        handleSelectOption
    };
};

export default useValidation;


const checkFieldsState = (_currentFormData: Record<string, any>): Record<string, IFieldState> => {
    return {};
};
