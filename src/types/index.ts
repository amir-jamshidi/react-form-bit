import ValidatorEngine from "../utils/ValidatorEngine";


export interface IValidationRule {
    operator: keyof typeof ValidatorEngine.operators;
    value: any;
    message?: string;
    compareOperator?: string;
    offset?: number;
}

export interface IConditionProps {
    field?: string;
    operator?: keyof typeof ValidatorEngine.operators;
    value?: any;
    logic?: 'AND' | 'OR';
    conditions?: IConditionProps[];
}

export interface IOption {
    label: string;
    value: string;
}

export interface IConditionProps {
    field?: string;
    operator?: keyof typeof ValidatorEngine.operators;
    value?: any;
    logic?: 'AND' | 'OR';
    conditions?: IConditionProps[];
}

export interface IConditionOptions {
    when: IConditionProps;
    options: IOption[];
}

export type SelectOptions = IOption[] | IConditionOptions[];

export interface IField {
    options?: SelectOptions;
}
export interface ICustomValidate {
    (
        formData: Record<string, any>,
        setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>,
        errors: Record<string, string[]>,
        setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
        fieldStates: Record<string, IFieldState>,
        setFieldStates: React.Dispatch<React.SetStateAction<Record<string, IFieldState>>>
    ): string | null;
}

export interface IValidation {
    required?: boolean;
    message?: string;
    when?: IConditionProps;
    rules?: IValidationRule[];
    customValidate?: ICustomValidate;
    hide?: boolean;
}

export interface IFieldDisable {
    when?: {
        field?: string;
        operator?: keyof typeof ValidatorEngine.operators;
        value?: any;
        logic?: 'AND' | 'OR';
        conditions?: IConditionProps[];
    };
    customCondition?: (formData: Record<string, any>) => boolean;
    logic?: 'AND' | 'OR';
    conditions?: IConditionProps[];
}

export interface IRemoteSelectOptions {
    endPointUrl: string,
    valueNameKey: string,
    labelNameKey: string,
    dependencies?: {
        field: string,
        key: string
    }[],
    sendMethod?: 'SEARCHPARAMS' | 'BODYPARAMS'
    path?: string,
}

export interface IField {
    label: string;
    type: string;
    cols?: number;
    labelCols?: number;
    inputCols?: number;
    placeholder?: string;
    options?: SelectOptions;
    remoteOptions?: IRemoteSelectOptions
    validations?: IValidation[];
    isDisable?: boolean | IFieldDisable;
    resetErrorFields?: 'ALL' | 'SECTION' | string[];
    resetValueFields?: 'ALL' | 'SECTION' | string[];
    category?: string[];
    inputWrapperClassName?: string,
    inputClassName?: string,
    labelClassName?: string,
    resetValueWhenDisable?: boolean
}

interface IBaseSection {
    title: string;
    subTitle: string;
    id?: string;
    globalValidation?: Pick<IValidation, 'when' | 'message' | 'customValidate'>[]
    actionButtons?: ISectionActionButtons[],
    inputWrapperClassName?: string,
    inputClassName?: string,
    labelClassName?: string
}

interface INormalSection extends IBaseSection {
    isArray?: boolean;
    fields: Record<string, IField>;
    arrayName?: string;
    minItems?: number;
    maxItems?: number;
    defaultItems?: Array<Record<string, any>>;
}

// interface IArraySection extends IBaseSection {
//     isArray: true;
//     arrayName: string;
//     minItems?: number;
//     maxItems?: number;
//     defaultItems?: Array<Record<string, any>>;
//     fields: Record<string, IField>;
// }

export type ISection = INormalSection;

export interface IFormSchema {
    title: string;
    subTitle: string;
    formIndex: number;
    sections: ISection[];
    formPath?: string
    globalValidation?: Pick<IValidation, 'when' | 'message' | 'customValidate'>[]
    defaultValue?: Record<string, any>
    actionButtons: IActionButtons[],
    inputWrapperClassName?: string,
    inputClassName?: string,
    labelClassName?: string,
    remoteDefaultValue?: IRemoteDefaultValue

}

export interface IRemoteDefaultValue {
    endPointUrl: string
    path?: string
}

export interface IFieldState {
    isVisible: boolean;
    isEnable: boolean;
}

export interface IActionButtons {
    submitterKey: 'SUBMIT' | 'EDIT' | 'APPEND' | 'REMOVE' | (string & {});
    label: string,
    className?: string
    type: 'submit' | 'reset',
    validateFields?: 'ALL' | string[];
}
export interface ISectionActionButtons {
    submitterKey: 'SUBMIT' | 'EDIT' | 'APPEND' | 'REMOVE' | (string & {});
    label: string,
    className?: string
    type: 'submit' | 'reset',
    validateFields: 'ALL' | "SECTION" | string[];
}