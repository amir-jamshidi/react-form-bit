import { useState } from "react";

interface IFieldState {
    isVisible: boolean;
    isEnable: boolean;
}

const useFormState = () => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [fieldStates, setFieldStates] = useState<Record<string, IFieldState>>({});
    const [remoteOptions, setRemoteOptions] = useState<Record<string, { label: string, value: any }[]>>({})

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