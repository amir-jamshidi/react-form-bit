import { IConditionProps, IField, IFieldState, IFormSchema } from "../types";
import ValidatorEngine from "../utils/ValidatorEngine";

const mergeArrayObjects = <T extends Record<string, any>>(arr: T[]): T => {
    return arr.reduce((result, obj) => ({ ...result, ...obj }), {} as T);
};

const getAllFields = (schema: IFormSchema): Record<string, IField> => {
    const allFields = schema.sections.map((sec) => sec.fields);
    return mergeArrayObjects(allFields);
};

const getFieldsWithArrayStructure = (
    schema: IFormSchema,
    arrayName?: string
): Record<string, IField | IField[]> => {
    if (arrayName) {
        const section = schema.sections.find((sec) => sec.arrayName === arrayName);
        if (!section) return {};
        const fields = section.fields;
        return { [arrayName]: Array.isArray(fields) ? fields : [fields] };
    }

    const allFields = schema.sections.map((sec) =>
        sec.isArray && sec.arrayName ? { [sec.arrayName]: [sec.fields] } : sec.fields
    );
    return mergeArrayObjects(allFields);
};

// Helper function to validate a single field
const validateField = (
    fieldName: string,
    value: any,
    formData: Record<string, any>,
    fieldSchema: IField
): string[] => {
    const errors: string[] = [];
    const validations = fieldSchema.validations || [];

    validations.forEach((validate) => {
        const error = ValidatorEngine.validate(validate, value, formData);
        if (error) {
            errors.push(...error);
        }

        if (validate.customValidate) {
            const customError = validate.customValidate(
                formData,
                (data) => data, // Placeholder for setFormData
                { [fieldName]: errors },
                (newErrors) => newErrors, // Placeholder for setErrors
                {}, // Placeholder for fieldStates
                () => { } // Placeholder for setFieldStates
            );
            if (customError) {
                errors.push(customError);
            }
        }
    });

    return errors;
};

// Main validation hook
const useValidation = ({
    formSchema,
    errors,
    fieldStates,
    setErrors,
    setFormData,
    setTouched,
    formData,
}: {
    formSchema: IFormSchema;
    errors: Record<string, string[]>;
    fieldStates: Record<string, IFieldState>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    formData: Record<string, any>;
}) => {
    const checkFieldsState = (currentFormData: Record<string, any>): Record<string, IFieldState> => {
        // TODO: Implement field state logic if needed
        return {};
    };

    const validationAndUpdateErrors = (
        fieldName: string,
        value: any,
        currentFormData: Record<string, any>,
        inArray?: boolean,
        arrayName?: string,
        indexArray?: number
    ): boolean => {
        const allFields = getAllFields(formSchema);
        const fieldSchema = allFields[fieldName];
        if (!fieldSchema) return true;

        if (inArray && arrayName && indexArray !== undefined) {
            const fieldErrors = validateField(fieldName, value, currentFormData[arrayName][indexArray], fieldSchema);

            setErrors((prev) => {
                const arrayErrors = prev[arrayName] ? [...prev[arrayName]] : [];
                arrayErrors[indexArray] = { ...arrayErrors[indexArray], [fieldName]: fieldErrors };
                return { ...prev, [arrayName]: arrayErrors };
            });

            return fieldErrors.length === 0;
        }

        const fieldErrors = validateField(fieldName, value, currentFormData, fieldSchema);
        setErrors((prev) => ({ ...prev, [fieldName]: fieldErrors }));

        return fieldErrors.length === 0;
    };

    const isValidForm = (
        fieldsToValidate: "ALL" | "SECTION" | string[],
        sectionIndex?: number,
        arrayIndex?: number,
        arrayName?: string
    ): boolean => {
        let isValid = true;
        const newTouched: Record<string, boolean> = {};
        let fields: Record<string, IField | IField[]> = {};

        if (fieldsToValidate === "ALL") {
            fields = getFieldsWithArrayStructure(formSchema);
        } else if (fieldsToValidate === "SECTION" && sectionIndex !== undefined) {
            fields = arrayName
                ? getFieldsWithArrayStructure(formSchema, arrayName)
                : formSchema.sections[sectionIndex].fields;
        } else if (Array.isArray(fieldsToValidate)) {
            const allFields = getAllFields(formSchema);
            fields = Object.fromEntries(fieldsToValidate.map((key) => [key, allFields[key]]).filter(([_, v]) => v));
        }

        setErrors((prev) =>
            Object.fromEntries(Object.entries(prev).filter(([key]) => key.startsWith("form") || key.startsWith("section.")))
        );

        Object.entries(fields).forEach(([fieldName, fieldValue]) => {
            if (Array.isArray(fieldValue)) {
                fieldValue.forEach((field, i) => {
                    Object.keys(field).forEach((nestedFieldName) => {
                        if (arrayName && i !== arrayIndex) return;
                        const isFieldValid = validationAndUpdateErrors(
                            nestedFieldName,
                            formData[arrayName || fieldName][i][nestedFieldName],
                            formData,
                            true,
                            arrayName || fieldName,
                            i
                        );
                        if (!isFieldValid) isValid = false;
                        newTouched[nestedFieldName] = true;
                    });
                });
            } else {
                const isFieldValid = validationAndUpdateErrors(fieldName, formData[fieldName], formData);
                if (!isFieldValid) isValid = false;
                newTouched[fieldName] = true;
            }
        });

        setTouched((prev) => ({ ...prev, ...newTouched }));
        return isValid;
    };

    // Check if a field is required
    const isFieldRequired = (
        fieldSchema: IField,
        currentFormData: Record<string, any>
    ): boolean => {
        if (!fieldSchema.validations) return false;

        return fieldSchema.validations.some((validate) => {
            if (validate.required) {
                if (validate.when) {
                    return ValidatorEngine.evaluateCondition(validate.when, currentFormData);
                }
                return true;
            }
            return false;
        });
    };

    // Handle select option visibility
    const handleSelectOption = (conditions?: IConditionProps): boolean | undefined => {
        if (!conditions) return undefined;
        return ValidatorEngine.evaluateCondition(conditions, formData);
    };

    return {
        checkFieldsState,
        validationAndUpdateErrors,
        isValidForm,
        isFieldRequired,
        handleSelectOption,
    };
};

export default useValidation;