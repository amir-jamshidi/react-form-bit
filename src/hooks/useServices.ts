import { useCallback, useEffect } from "react";
import { useForm } from "../FormProvider";
import { IRemoteDefaultValue, IRemoteSelectOptions } from "../types";
import { getIn, type FormValue } from "../utils/formState";

interface IUseServicesProps {
    setFormData: React.Dispatch<React.SetStateAction<Record<string, FormValue>>>,
}

interface IUseGetRemoteOptions extends IRemoteSelectOptions { fieldName: string }

const useServices = ({ setFormData }: IUseServicesProps) => {

    const getRemoteDefaultValue = async ({ endPointUrl, path }: IRemoteDefaultValue) => {
        try {
            const defaultValues = await fetch(endPointUrl);
            const result = await defaultValues.json();
            if (path) {
                const finalValue = getIn(result, path, result);
                if (finalValue && typeof finalValue === "object") {
                    setFormData(prev => ({ ...prev, ...(finalValue as Record<string, FormValue>) }))
                }
                return
            }
            setFormData(prev => ({ ...prev, ...result }));
        } catch (error: any) {
            throw new Error(`Error getting form default value : ${error?.message}`)
        }
    }

    const UseGetRemoteOptions = ({ endPointUrl, labelNameKey, valueNameKey, path, dependencies, sendMethod: _sendMethod, fieldName }: IUseGetRemoteOptions) => {

        const { formData, remoteOptions: options, setRemoteOptions: setOptions } = useForm()

        const fetchOptions = useCallback(async () => {
            if (!endPointUrl) return;
            if (dependencies && dependencies.length > 0) {
                const missingDependencies = dependencies.some(
                    (dep) => !getIn(formData, dep.field)
                );

                if (missingDependencies) {
                    setOptions((prev) => ({ ...prev, [fieldName]: [] }));
                    return;
                }
            }

            try {
                const searchParams = new URLSearchParams();
                dependencies?.forEach((dep) =>
                    searchParams.set(dep.key, String(getIn(formData, dep.field) ?? ""))
                );

                let finalEndPoint: string;
                const query = searchParams.toString();

                if (!query) {
                    finalEndPoint = endPointUrl;
                } else {
                    finalEndPoint = endPointUrl.includes("?")
                        ? `${endPointUrl}&${query}`
                        : `${endPointUrl}?${query}`;
                }

                const response = await fetch(finalEndPoint);
                const result = await response.json();

                const finalOptions = path ? getIn(result, path, result) : result;

                const processedOptions = Array.isArray(finalOptions)
                    ? finalOptions.map((option) => ({
                        value: String((option as Record<string, unknown>)[valueNameKey]),
                        label: String((option as Record<string, unknown>)[labelNameKey]),
                    }))
                    : [];

                setOptions((prev) => ({ ...prev, [fieldName]: processedOptions }));
            } catch (error) {
                console.error("Error fetching dependent options:", error);
                setOptions((prev) => ({ ...prev, [fieldName]: [] }));
            }
        }, [dependencies, endPointUrl, fieldName, formData, labelNameKey, path, setOptions, valueNameKey]);

        useEffect(() => {
            fetchOptions();
        }, [fetchOptions]);

        return { options, fetchOptions }
    }

    return { getRemoteDefaultValue, UseGetRemoteOptions }

}


export default useServices
