import ValidatorEngine from "../utils/ValidatorEngine";

// Validation rule interface
export interface IValidationRule {
    operator: keyof typeof ValidatorEngine.operators;
    value: any;
    message?: string;
    compareOperator?: string;
    offset?: number;
}

// Condition properties for validation or disabling
export interface IConditionProps {
    field?: string;
    operator?: keyof typeof ValidatorEngine.operators;
    value?: any;
    logic?: 'AND' | 'OR';
    conditions?: IConditionProps[];
}

// Select option interface
export interface IOption {
    label: string;
    value: string;
}

// Conditional select options
export interface IConditionOptions {
    when: IConditionProps;
    options: IOption[];
}

export type SelectOptions = IOption[] | IConditionOptions[];

// Custom validation function
export interface ICustomValidate {
    (
        formData: Record<string, any> | Record<string, any[]>, // Support nested array data
        setFormData: React.Dispatch<React.SetStateAction<Record<string, any> | Record<string, any[]>>>,
        errors: Record<string, string[] | Record<string, string[] | Record<string, string[]>>>, // Support nested errors
        setErrors: React.Dispatch<React.SetStateAction<Record<string, string[] | Record<string, string[] | Record<string, string[]>>>>>,
        fieldStates: Record<string, IFieldState>,
        setFieldStates: React.Dispatch<React.SetStateAction<Record<string, IFieldState>>>
    ): string | null;
}

// Validation interface
export interface IValidation {
    required?: boolean;
    message?: string;
    when?: IConditionProps;
    rules?: IValidationRule[];
    customValidate?: ICustomValidate;
    hide?: boolean;
}

// Field disable condition
export interface IFieldDisable {
    when?: IConditionProps;
    customCondition?: (formData: Record<string, any> | Record<string, any[]>) => boolean;
    logic?: 'AND' | 'OR';
    conditions?: IConditionProps[];
}

// Remote select options
export interface IRemoteSelectOptions {
    endPointUrl: string;
    valueNameKey: string;
    labelNameKey: string;
    dependencies?: {
        field: string;
        key: string;
    }[];
    sendMethod?: 'SEARCHPARAMS' | 'BODYPARAMS';
    path?: string;
}

// Field interface
export interface IField {
    label: string;
    type: string;
    cols?: number;
    labelCols?: number;
    inputCols?: number;
    placeholder?: string;
    options?: SelectOptions;
    remoteOptions?: IRemoteSelectOptions;
    validations?: IValidation[];
    isDisable?: boolean | IFieldDisable;
    resetErrorFields?: 'ALL' | 'SECTION' | string[];
    resetValueFields?: 'ALL' | 'SECTION' | string[];
    category?: string[];
    inputWrapperClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    resetValueWhenDisable?: boolean;
}

// Section interface (supports both normal and array sections)
export interface ISection {
    title: string;
    subTitle: string;
    id?: string;
    globalValidation?: Pick<IValidation, 'when' | 'message' | 'customValidate'>[];
    actionButtons?: ISectionActionButtons[];
    inputWrapperClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    isArray?: boolean;
    arrayName?: string;
    minItems?: number;
    maxItems?: number;
    defaultItems?: Array<Record<string, any>>;
    fields: Record<string, IField>;
}

// Form schema interface
export interface IFormSchema {
    title: string;
    subTitle: string;
    formIndex: number;
    sections: ISection[];
    formPath?: string;
    globalValidation?: Pick<IValidation, 'when' | 'message' | 'customValidate'>[];
    defaultValue?: Record<string, any> | Record<string, any[]>;
    actionButtons: IActionButtons[];
    inputWrapperClassName?: string;
    inputClassName?: string;
    labelClassName?: string;
    remoteDefaultValue?: IRemoteDefaultValue;
}

// Remote default value interface
export interface IRemoteDefaultValue {
    endPointUrl: string;
    path?: string;
}

// Field state interface
export interface IFieldState {
    isVisible: boolean;
    isEnable: boolean;
}

// Action button interface
export interface IActionButtons {
    submitterKey: 'SUBMIT' | 'EDIT' | 'APPEND' | 'REMOVE' | (string & {});
    label: string;
    className?: string;
    type: 'submit' | 'reset';
    validateFields?: 'ALL' | string[];
}

// Section action button interface
export interface ISectionActionButtons {
    submitterKey: 'SUBMIT' | 'EDIT' | 'APPEND' | 'REMOVE' | (string & {});
    label: string;
    className?: string;
    type: 'submit' | 'reset';
    validateFields: 'ALL' | 'SECTION' | string[];
}