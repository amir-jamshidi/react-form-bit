import { IFieldState, IFormSchema, ISection, IValidation } from "../types";
import ValidatorEngine from "../utils/ValidatorEngine";

interface IuseGlobalErrors {
    formSchema: IFormSchema,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
    formData: Record<string, any>,
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
    errors: Record<string, string[]>,
    fieldStates: Record<string, IFieldState>,
    setFieldStates: React.Dispatch<React.SetStateAction<Record<string, IFieldState>>>
}

const useGlobalErrors = (
    { formSchema,
        formData,
        setErrors,
        errors,
        fieldStates,
        setFieldStates,
        setFormData
    }: IuseGlobalErrors) => {


    const validateRule = (validate: IValidation): string | undefined => {
        if (validate.customValidate) {
            const result = validate.customValidate(
                formData,
                setFormData,
                errors,
                setErrors,
                fieldStates,
                setFieldStates
            );
            if (result) return result;
        }

        if (validate.when && validate.message) {
            const hasError = ValidatorEngine.evaluateCondition(validate.when, formData);
            if (hasError) return validate.message;
        }

        return undefined;
    };

    const validateGlobalErrors = () => {
        const validations = formSchema?.globalValidation || [];
        const formErrors: string[] = [];

        validations.forEach((validate) => {
            const error = validateRule(validate);
            if (error) formErrors.push(error);
        });

        setErrors(prev => ({ ...prev, form: formErrors }));
    };

    const validateSectionsGlobalErrors = () => {
        const sections = formSchema.sections;
        const sectionsErrors: Record<string, string[]> = {};

        sections.forEach((_, i) => {
            sectionsErrors[`section.${i}`] = [];
        });

        sections.forEach((section: ISection, i) => {
            if (!section.globalValidation) return;

            for (const validate of section.globalValidation) {
                const error = validateRule(validate);
                if (error) {
                    sectionsErrors[`section.${i}`] = [error];
                    break;
                }
            }
        });

        setErrors(prev => ({ ...prev, ...sectionsErrors }));
    };

    return { validateGlobalErrors, validateSectionsGlobalErrors };

}

export default useGlobalErrors