import { IConditionProps, IField, IFieldState, IFormSchema, IValidation } from "../types";
import ValidatorEngine from "../utils/ValidatorEngine";



interface IuseValidation {
    formSchema: IFormSchema;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    formData: Record<string, any>;
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    errors: Record<string, string[]>;
    fieldStates: Record<string, IFieldState>;
    setFieldStates: React.Dispatch<React.SetStateAction<Record<string, IFieldState>>>;
    setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const useValidation = ({
    formSchema,
    errors,
    fieldStates,
    setErrors,
    setFieldStates,
    setFormData,
    setTouched,
    formData
}: IuseValidation) => {


    //! HELPER FN
    const mergeArrayObjects = <T extends Record<string, any>>(arr: T[]): T => {
        return arr.reduce((result, obj) => ({ ...result, ...obj }), {} as T);
    };

    //! HELPER FN
    const getAllFields = ({ sectionIndex }: { sectionIndex?: number }): Record<string, IField> => {
        if (sectionIndex !== undefined && sectionIndex >= 0) {
            return formSchema.sections[sectionIndex].fields;
        }
        const allFields = formSchema.sections.map(sec => sec.fields);
        return mergeArrayObjects(allFields);
    };

    //! HELPER FN
    const getSomeFields = ({ fieldsKey }: { fieldsKey: string[] }) => {
        return fieldsKey.reduce((accumulator: Record<string, any | undefined>, fieldKey: string) => {
            const fieldProperties = formSchema.sections.find(section =>
                section?.fields && section.fields[fieldKey]
            )?.fields?.[fieldKey];
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
    const isValidForm = (fieldsToValidate: string, sectionIndex?: number, arrayIndex?: number, arrayName?: string): boolean => {
        console.log(
            `FieldsToValidate => ${fieldsToValidate} \n`,
            `sectionIndex => ${sectionIndex} \n`,
            `arrayIndex => ${arrayIndex} \n`,
            `arrayName => ${arrayName} \n`,
        )
        setErrors({})

        if (fieldsToValidate === 'ALL') return ValidateAllForm();
        if (fieldsToValidate === "SECTION" && sectionIndex !== undefined && sectionIndex >= 0) return ValidateSectionForm({ sectionIndex })
        if (Array.isArray(fieldsToValidate)) ValidateSomeFields({ fieldsKey: fieldsToValidate })

        return true

    }

    //! VALIDATE ALL FORM FIELDS AND TRIGGER validateAndUpdateNormalForm()
    const ValidateAllForm = (): boolean => {
        let errors = {}
        const fieldsSchema = getAllFields({});
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (fieldError) {
                errors = { ...errors, ...fieldError }
            }
        })
        setErrors(prevErrors => ({ ...prevErrors, ...errors }))
        return Boolean(Object.keys(errors).length)
    }

    //! VALIDATE ONE FORM SECTION AND TRIGGER validateAndUpdateNormalForm()
    const ValidateSectionForm = ({ sectionIndex }: { sectionIndex: number }): boolean => {
        let errors = {}
        const fieldsSchema = getAllFields({ sectionIndex });
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (fieldError) {
                errors = { ...errors, ...fieldError }
            }
        })
        const outherFieldsErrorReset = getEmptyErrors({ skipFields: Object.keys(fieldsSchema) })
        setErrors(prevErrors => ({ ...prevErrors, ...errors, ...outherFieldsErrorReset, }))
        return Boolean(Object.keys(errors).length)
    }

    //! VALIDATE SOME FORM FIELDS AND TRIGGER validateAndUpdateNormalForm()
    const ValidateSomeFields = ({ fieldsKey }: { fieldsKey: string[] }): boolean => {
        const fieldsSchema = getSomeFields({ fieldsKey })
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (fieldError) {
                errors = { ...errors, ...fieldError }
            }
        })
        const outherFieldsErrorReset = getEmptyErrors({ skipFields: fieldsKey })
        setErrors(prevErrors => ({ ...prevErrors, ...errors, ...outherFieldsErrorReset, }))
        return Boolean(Object.keys(errors).length)
    }


    //* CHECK VALIDATIONS AND RETURN ERRORS
    const validateAndUpdateNormalForm = ({ fieldSchema, fieldName }: { fieldSchema: any, fieldName: string }) => {
        const errors: Record<string, string[]> = {}
        const validations = fieldSchema.validations;
        const fieldValue = formData[fieldName] || ''

        validations.forEach((validation: IValidation) => {
            const fieldErrors = ValidatorEngine.validate(validation, fieldValue, formData)
            if (fieldErrors) {
                errors[fieldName] = fieldErrors
            }
        })
        return errors
    }
























    const validationAndUpdateErrors = () => {
        // WE HAVE REFACTOR THIS FN FOR TOUCHED EVENT AND TRIGGER ERRORS IN FORM PROVIDER
    }



    // const validationAndUpdateErrors = (
    //     fieldName: string,
    //     value: any,
    //     currentFormData: Record<string, any>,
    //     inArray?: boolean,
    //     arrayName?: string,
    //     indexArray?: number,
    //     targetIndexArray?: number
    // ): boolean => {

    //     const fields = getAllFields();
    //     const fieldSchema = fields[fieldName];
    //     const validations = fieldSchema.validations || [];

    //     if (inArray && arrayName) {
    //         if (targetIndexArray !== undefined && targetIndexArray !== indexArray) return true;
    //         let fieldErrors: string[] = [];
    //         validations.forEach(validate => {
    //             const error = ValidatorEngine.validate(validate, value, currentFormData?.[arrayName!]?.[indexArray!]);
    //             if (error) {
    //                 fieldErrors = fieldErrors.concat(error);
    //             }

    //             if (validate.customValidate) {
    //                 const res = validate.customValidate(
    //                     currentFormData,
    //                     setFormData,
    //                     errors,
    //                     setErrors,
    //                     fieldStates,
    //                     setFieldStates
    //                 );
    //                 if (res) fieldErrors.push(res);
    //             }
    //         });

    //         setErrors(prev => {
    //             const arrayErrors = prev?.[arrayName] ? [...prev[arrayName]] : []
    //             arrayErrors[indexArray] ||= {};
    //             arrayErrors[indexArray][fieldName] = fieldErrors;
    //             return {
    //                 ...prev,
    //                 [arrayName]: arrayErrors
    //             }
    //         });

    //         return fieldErrors.length === 0;
    //     };

    //     let fieldErrors: string[] = [];

    //     validations.forEach(validate => {
    //         const error = ValidatorEngine.validate(validate, value, currentFormData);
    //         if (error) {
    //             fieldErrors = fieldErrors.concat(error);
    //         }

    //         if (validate.customValidate) {
    //             const res = validate.customValidate(
    //                 currentFormData,
    //                 setFormData,
    //                 errors,
    //                 setErrors,
    //                 fieldStates,
    //                 setFieldStates
    //             );
    //             if (res) fieldErrors.push(res);
    //         }
    //     });

    //     setErrors(prev => ({
    //         ...prev,
    //         [fieldName]: fieldErrors,
    //     }));

    //     return fieldErrors.length === 0;
    // };


    const isFieldRequired = (
        fieldSchema: IField,
        currentFormData: Record<string, any>,
        inArray?: boolean,
        arrayName?: string,
        indexArray?: number
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
        // validationAndUpdateErrors,
        isValidForm,
        isFieldRequired,
        handleSelectOption
    };
};

export default useValidation;





// const isValidForm = (fieldsToValidate: 'ALL' | "SECTION" | string[], sectionIndex?: number, arrayIndex?: number, arrayName?: string): boolean => {
//     let isValid = true;
//     const newTouched: Record<string, boolean> = {};
//     const allFields = getAllFields();

//     let fields = {};

//     if (fieldsToValidate === 'ALL') {
//         fields = getAllFieldsWidthStruct();
//         console.log('eeeeee')
//     }

//     if (fieldsToValidate === 'SECTION' && sectionIndex !== undefined && !arrayName) {
//         fields = formSchema.sections[sectionIndex].fields;
//     }

//     if (fieldsToValidate === 'SECTION' && sectionIndex !== undefined && arrayIndex !== undefined && arrayName) {
//         fields = getAllFieldsWidthStruct(arrayName);
//     }

//     if (Array.isArray(fieldsToValidate)) {
//         fields = Object.entries(allFields).reduce((prev, [key, value]) => fieldsToValidate.includes(key) ? ({ ...prev, [key]: value }) : prev, {})
//     }

//     setErrors(prevState => {
//         const fields = Object.entries(prevState).reduce((prev, [key, value]) => (key.startsWith('form') || key.startsWith(`section.`)) ? { ...prev, [key]: value } : { ...prev, [key]: [] }, {})
//         return fields
//     });

//     let isFieldValid: boolean = true;
//     Object.entries(fields).forEach(([fieldName, value], i) => {
//         if (Array.isArray(value)) {
//             value.forEach((fieldValue, i) => {
//                 const fieldNameArray = Object.keys(fieldValue)
//                 fieldNameArray.forEach((nestedFieldName) => {
//                     isFieldValid = validationAndUpdateErrors(
//                         nestedFieldName,
//                         formData[fieldName][i][nestedFieldName],
//                         formData,
//                         true,
//                         fieldName,
//                         i,
//                         arrayName ? arrayIndex : undefined
//                     );
//                     if (!isFieldValid) isValid = false
//                     console.log(isFieldValid)
//                 })
//             })
//             return
//         } else {
//             console.log('not array')
//         }

//         newTouched[fieldName] = true;
//         isFieldValid = validationAndUpdateErrors(
//             fieldName,
//             formData[fieldName],
//             formData,
//         );

//         if (!isFieldValid) {
//             isValid = false;
//         }
//     });
//     setTouched(prev => ({ ...prev, ...newTouched }));
//     return isValid;
// };


const checkFieldsState = (currentFormData: Record<string, any>): Record<string, IFieldState> => {
    // const newFieldStates: Record<string, IFieldState> = {};
    // const fields = getAllFields();

    // Object.entries(fields).forEach(([fieldName, field]) => {
    //     let isVisible = true;
    //     let isEnable = true;

    //     if (field.isDisable === true) {
    //         isEnable = false;
    //     } else if (typeof field.isDisable === 'object') {
    //         if ('customCondition' in field.isDisable && field.isDisable.customCondition) {
    //             isEnable = !field.isDisable.customCondition(currentFormData);
    //         }

    //         if ('when' in field.isDisable && field.isDisable.when) {
    //             const disableCondition = ValidatorEngine.evaluateCondition(
    //                 field.isDisable.when,
    //                 currentFormData
    //             );
    //             if (disableCondition) isEnable = false;
    //         }

    //         else if (
    //             'logic' in field.isDisable &&
    //             'conditions' in field.isDisable &&
    //             field.isDisable.conditions
    //         ) {
    //             const results = field.isDisable.conditions.map(cond =>
    //                 ValidatorEngine.evaluateCondition(cond, currentFormData)
    //             );

    //             const shouldDisable = field.isDisable.logic === "AND"
    //                 ? results.every(Boolean)
    //                 : results.some(Boolean);

    //             if (shouldDisable) isEnable = false;
    //         }
    //     }

    //     const validations = field.validations || [];
    //     validations.forEach(validate => {
    //         if (validate.when) {
    //             const condition = ValidatorEngine.evaluateCondition(
    //                 validate.when,
    //                 currentFormData
    //             );

    //             if (
    //                 condition &&
    //                 validate?.rules?.some(rule => rule.operator === "isEmpty")
    //             ) {
    //                 isEnable = false;
    //             }

    //             if (validate.hide && condition) {
    //                 isVisible = false;
    //             }
    //         }
    //     });

    //     newFieldStates[fieldName] = { isVisible, isEnable };
    // });
    // console.log(fieldStates,'fields state')
    // return newFieldStates;
    return {};
};