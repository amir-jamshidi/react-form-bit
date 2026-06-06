import { useState } from "react";
import type { FormErrorTree, FormValue } from "../utils/formState";

interface IFieldState {
    isVisible: boolean;
    isEnable: boolean;
}

export type TErrorsType = FormErrorTree;

const useFormState = () => {
    const [formData, setFormData] = useState<Record<string, FormValue>>({});
    const [errors, setErrors] = useState<TErrorsType>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [fieldStates, setFieldStates] = useState<Record<string, IFieldState>>({});
    const [remoteOptions, setRemoteOptions] = useState<Record<string, { label: string, value: string }[]>>({})

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        touched,
        setTouched,
        fieldStates,
        setFieldStates,
        remoteOptions,
        setRemoteOptions
    }
}

export default useFormState
