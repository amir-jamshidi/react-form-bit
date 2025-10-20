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

    //* ---------------------------------------------------- Array Form ---------------------------------------------

    //! HELPER FN
    const getArrayFields = () => {
        const allFields = formSchema.sections.map(sec => sec.isArray ? sec.fields : {});
        return mergeArrayObjects(allFields);
    }

    const getSectionArrayFields = ({ sectionIndex }: { sectionIndex: number }) => {
        const allFields = [formSchema.sections[sectionIndex].fields];
        return mergeArrayObjects(allFields);
    }


    //* ---------------------------------------------------- Normal Form ---------------------------------------------

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

    //! HELPER FN => GET ONE FIELD SCHEMA
    const getOneFieldSchema = ({ fieldName }: { fieldName: string }) => {
        return getAllFields({})[fieldName]
    }

    //! HELPER FN => CALC ERRORS - SPLIT ARRAY AND NORMAL ERROR FIELDS
    const separateArrayErrors = ({
        fields,
        errors
    }: {
        fields: Record<string, IField>,
        errors: Record<string, string[]>
    }) => {
        const result: Record<string, any> = {};
        const arrayErrors: Record<string, Record<string, string[]>> = {};

        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const fieldErrors = errors[fieldName] || [];

            if (field.parentArrayName) {

                if (!arrayErrors[field.parentArrayName]) {
                    arrayErrors[field.parentArrayName] = {};
                }

                arrayErrors[field.parentArrayName][fieldName] = fieldErrors;
            } else {
                result[fieldName] = fieldErrors;
            }
        });

        Object.keys(arrayErrors).forEach(arrayName => {
            result[arrayName] = arrayErrors[arrayName];
        });
        console.log(result)
        return result;
    };

    //* -------------------------------------------------------------------------------------------------

    //! MAIN FUNCTION FOR VALIDATON => ENTRY POINT
    const isValidForm = (fieldsToValidate: string, sectionIndex?: number, arrayIndex?: number, arrayName?: string): boolean => {

        const hasArraySection = formSchema.sections.some(section => Boolean(section.isArray))

        // console.log(
        //     `fieldsToValidate=> ${fieldsToValidate} \n`,
        //     `sectionIndex=> ${sectionIndex} \n`,
        //     `arrayIndex=> ${arrayIndex} \n`,
        //     `arrayName=> ${arrayName} \n`
        // )

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
        const fieldsSchema = getArrayFields();
        const arrayNames = [...new Set(Object.values(fieldsSchema).map(schema => schema.parentArrayName))];
        const errors: Record<string, Record<string, any>[]> = {};

        arrayNames.forEach(arrayName => {
            if (!arrayName) throw new Error("ERROR TO READ ARRAY NAMES")
            errors[arrayName] = [];
            formData[arrayName]?.forEach((formObject: any, formIndex: number) => {
                errors[arrayName][formIndex] = errors[arrayName][formIndex] || {};

                Object.keys(formObject).forEach(fieldName => {
                    const fieldErrors = validateAndUpdateArrayForms({
                        fieldName,
                        fieldSchema: fieldsSchema[fieldName],
                        arrayName,
                        formIndex
                    });

                    if (fieldErrors) {
                        errors[arrayName][formIndex] = {
                            ...errors[arrayName][formIndex],
                            ...fieldErrors
                        };
                    }
                });
            });
        });

        console.log(errors)
        setErrors(errors as any);
        return Object.keys(errors).length === 0;
    };

    //! VALIDATE ONE INDEX OF ONE SECTION ARRAY FORM
    const ValidateArrayFormSection = ({ sectionIndex, arrayName, formIndex }: { sectionIndex: number, arrayName: string, formIndex: number }): boolean => {

        const fieldsSchema = getSectionArrayFields({ sectionIndex })
        const errors: Record<string, Record<string, any>[]> = {};
        let hasError = false
        errors[arrayName] = [];

        Object.keys(formData[arrayName][formIndex]).forEach(fieldName => {
            const fieldErrors = validateAndUpdateArrayForms({
                fieldName,
                fieldSchema: fieldsSchema[fieldName],
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
        const fieldsSchema = getAllFields({});
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (fieldError) {
                errors = { ...errors, ...fieldError }
            }
            touchedFields[fieldName] = true
        })
        setTouched(prevToucheds => ({ ...prevToucheds, ...touchedFields }))
        setErrors(prevErrors => ({ ...prevErrors, ...errors }))
        return Boolean(Object.keys(errors).length)
    }

    //! VALIDATE ONE FORM SECTION AND TRIGGER validateAndUpdateNormalForm()
    const ValidateSectionForm = ({ sectionIndex }: { sectionIndex: number }): boolean => {
        let touchedFields: Record<string, boolean> = {}
        let errors = {}
        const fieldsSchema = getAllFields({ sectionIndex });
        Object.entries(fieldsSchema).forEach(([fieldName, fieldSchema]) => {
            const fieldError = validateAndUpdateNormalForm({ fieldName, fieldSchema })
            if (Object.keys(fieldError).length > 0) {
                errors = { ...errors, ...fieldError }
            } else {
                errors = { ...errors, [fieldName]: [] }
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
    const validateSingleField = ({ fieldName, fieldValue: value }: { fieldName: string, fieldValue?: string }) => {
        const errors: Record<string, string[]> = {}
        const validations = getOneFieldSchema({ fieldName }).validations;
        const fieldValue = value != undefined ? value : formData[fieldName]
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
        console.log(errors, 'errors')
        setErrors(prev => ({ ...prev, ...errors }))
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

    //* CHECK VALIDATIONS FOR ARRAYS FROM AND RETURN ERRORS
    const validateAndUpdateArrayForms = ({ fieldSchema, fieldName, arrayName, formIndex }: { fieldSchema: any, fieldName: string, arrayName: string, formIndex: number }) => {
        const errors: Record<string, string[]> = {}
        const validations = fieldSchema.validations;
        const fieldValue = formData[arrayName][formIndex][fieldName] || ''
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
        validateSingleField,
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