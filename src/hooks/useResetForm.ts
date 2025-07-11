import { IField, IFormSchema } from "../types";

interface IUseResetForm {
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
    formSchema: IFormSchema;
    formData: Record<string, any>;
}

type ResetTarget = 'ALL' | 'SECTION' | string[];

const useResetForm = ({ setErrors, formSchema, formData }: IUseResetForm) => {


    const getAllCategoryFields = (): Record<string, IField> => {
        return formSchema.sections.reduce((prev, cur) => ({ ...prev, ...cur.fields }), {});
    };

    const getFieldsToReset = (
        resetTarget: ResetTarget | undefined,
        sectionIndex: number
    ): string[] => {
        if (!resetTarget) return [];

        if (resetTarget === 'ALL') {
            return Object.keys(formData);
        }

        if (resetTarget === 'SECTION') {
            return Object.keys(formSchema.sections[sectionIndex].fields);
        }

        if (Array.isArray(resetTarget)) {
            const sectionFields = getSectionFields(resetTarget);
            const directFields = getDirectFields(resetTarget);
            const categoryFields = getCategoryFields(resetTarget);

            return [...sectionFields, ...directFields, ...categoryFields];
        }

        return [];
    };

    const getSectionFields = (resetTargets: string[]): string[] => {
        const sectionIDs = resetTargets.filter(id => id.startsWith('#'));
        const sections = formSchema.sections.filter(section =>
            sectionIDs.includes(`#${section?.id || ''}`));
        return sections.flatMap(section => Object.keys(section.fields));
    };

    const getDirectFields = (resetTargets: string[]): string[] => {
        return resetTargets.filter(field => !field.startsWith("#") && !field.startsWith("$"));
    };

    const getCategoryFields = (resetTargets: string[]): string[] => {
        const categoryIDs = resetTargets.filter(id => id.startsWith('$'));
        const allCategoryFields = getAllCategoryFields();

        return Object.keys(allCategoryFields).filter(field =>
            allCategoryFields[field]?.category?.some(category =>
                categoryIDs.includes(`$${category}`)
            )
        );
    };

    const createEmptyValues = (fieldNames: string[]): Record<string, string | string[]> => {
        return fieldNames.reduce((prev, cur) => ({ ...prev, [cur]: '' }), {});
    };

    const handleResetForm = ({
        sectionIndex,
        fieldName
    }: {
        sectionIndex: number,
        fieldName: string
    }): Record<string, string> => {
        const field = formSchema.sections[sectionIndex].fields[fieldName];
        const resetError = field.resetErrorFields;
        const resetValue = field.resetValueFields;

        if (resetError) {
            const errorFieldsToReset = getFieldsToReset(resetError, sectionIndex);
            const emptyErrors = createEmptyValues(errorFieldsToReset) as Record<string, string[]>;
            setErrors(prev => ({ ...prev, ...emptyErrors }));
        }

        if (resetValue) {
            const valueFieldsToReset = getFieldsToReset(resetValue, sectionIndex);
            return createEmptyValues(valueFieldsToReset) as Record<string, string>;
        }

        return {};
    };

    return { handleResetForm };
};

export default useResetForm;