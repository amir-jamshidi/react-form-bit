import { useEffect } from "react";
import { useForm } from "../FormProvider";
import { IRemoteDefaultValue, IRemoteSelectOptions } from "../types";

interface IUseServicesProps {
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
}

interface IUseGetRemoteOptions extends IRemoteSelectOptions { fieldName: string }

const useServices = ({ setFormData }: IUseServicesProps) => {

    const getRemoteDefaultValue = async ({ endPointUrl, path }: IRemoteDefaultValue) => {
        try {
            const defaultValues = await fetch(endPointUrl);
            const result = await defaultValues.json();
            if (path) {
                const fianlValue = path.split('.').reduce((prev, cur) => prev[cur], result)
                setFormData(prev => ({ ...prev, ...fianlValue }))
                return
            }
            setFormData(prev => ({ ...prev, ...result }));
        } catch (error: any) {
            throw new Error(`Error getting form default value : ${error?.message}`)
        }
    }

    const UseGetRemoteOptions = ({ endPointUrl, labelNameKey, valueNameKey, path, dependencies, sendMethod, fieldName }: IUseGetRemoteOptions) => {

        const { formData, remoteOptions: options, setRemoteOptions: setOptions } = useForm()

        const fetchOptions = async () => {
            if (!endPointUrl) return
            if (dependencies && dependencies.length > 0) {
                const missingDependencies = dependencies.some(
                    dep => !formData[dep.field]
                );

                if (missingDependencies) {
                    setOptions(prev => ({ ...prev, [fieldName]: [] }));
                    return;
                }
            }

            try {
                const searchParams = new URLSearchParams();
                dependencies?.forEach(dep => searchParams.set(dep.key, formData[dep.field]))

                let finalEndPoint: string;
                const query = searchParams.toString();

                if (!query) {
                    finalEndPoint = endPointUrl;
                } else {
                    finalEndPoint = endPointUrl.includes('?') ? `${endPointUrl}&${query}` : `${endPointUrl}?${query}`
                }

                const response = await fetch(finalEndPoint);
                const result = await response.json();

                const finalOptions = path
                    ? path.split('.').reduce((prev, cur) => prev[cur], result)
                    : result;

                const processedOptions = finalOptions.map((option: Record<string, string>) => ({
                    value: option[valueNameKey],
                    label: option[labelNameKey]
                }));

                setOptions(prev => ({ ...prev, [fieldName]: processedOptions }));
            } catch (error) {
                console.error('Error fetching dependent options:', error);
                setOptions(prev => ({ ...prev, [fieldName]: [] }));
            } finally {
            }
        };

        useEffect(() => {
            fetchOptions();
        }, [...(dependencies || []).map(dep => formData[dep.field])])

        return { options, fetchOptions }
    }

    return { getRemoteDefaultValue, UseGetRemoteOptions }

}


export default useServices