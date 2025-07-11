interface IOperator {
    (a: any, b: any): boolean;
}

interface ICustomValidator {
    (value: string, options?: any, formData?: Record<string, any>): string | null;
}

interface IConditionProps {
    field?: string;
    operator?: keyof typeof ValidatorEngine.operators;
    value?: any;
    logic?: 'AND' | 'OR';
    conditions?: IConditionProps[];
}

interface IValidationRule {
    operator: keyof typeof ValidatorEngine.operators;
    value: any;
    message?: string;
    compareOperator?: string;
    offset?: number;
}

interface IDependencyRule {
    field: string;
    rules: IValidationRule[];
}

interface ICustomValidation {
    validator: string;
    options?: any;
    message?: string;
}

interface IValidationProps {
    required?: boolean;
    message?: string;
    when?: IConditionProps;
    rules?: IValidationRule[];
    custom?: ICustomValidation | ICustomValidation[];
    dependencies?: IDependencyRule[];
}

class ValidatorEngine {
    static operators: Record<string, IOperator> = {
        "isNumber": (num: unknown): boolean => !isNaN(Number(num)),
        length: (value: string, length: number): boolean => value?.length === length,
        equals: (a: unknown, b: unknown): boolean => a === b,
        notEquals: (a: unknown, b: unknown): boolean => a !== b,
        contains: (a: string, b: string): boolean => a?.includes(b),
        notContains: (a: string, b: string): boolean => !a?.includes(b),
        startsWith: (a: string, b: string): boolean => a?.startsWith(b),
        endsWith: (a: string, b: string): boolean => a?.endsWith(b),
        greaterThan: (a: unknown, b: unknown): boolean => Number(a) > Number(b),
        lessThan: (a: unknown, b: unknown): boolean => Number(a) < Number(b),
        greaterThanOrEqual: (a: unknown, b: unknown): boolean => Number(a) >= Number(b),
        lessThanOrEqual: (a: unknown, b: unknown): boolean => Number(a) <= Number(b),
        between: (a: unknown, [min, max]: [number, number]): boolean =>
            Number(a) >= Number(min) && Number(a) <= Number(max),
        regex: (a: string, pattern: RegExp): boolean => new RegExp(pattern, 'i').test(a),
        minLength: (a: string, min: number): boolean => a?.length >= min,
        maxLength: (a: string, max: number): boolean => a?.length <= max,
        isEmpty: (a: string | unknown[]): boolean => !a || a.length === 0,
        isNotEmpty: (a: string | unknown[]): boolean => Boolean(a && a.length > 0),
        isInteger: (a: unknown): boolean => Number.isInteger(Number(a)),
        isFloat: (a: unknown): boolean => !Number.isInteger(Number(a)) && !isNaN(Number(a)),
        isAlpha: (a: string): boolean => /^[a-zA-Z]+$/.test(a),
        isAlphanumeric: (a: string): boolean => /^[a-zA-Z0-9]+$/.test(a),
        isEmail: (a: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a),
        isFalsy: (a: string): boolean => !Boolean(a),
        isURL: (a: string): boolean => {
            try {
                new URL(a);
                return true;
            } catch {
                return false;
            }
        },
        isDate: (a: string): boolean => !isNaN(Date.parse(a)),
        compareWithOffset: (
            a: unknown,
            params: { operator: string; value: unknown; offset: number }
        ): boolean => {
            const numA = Number(a);
            const numValue = Number(params.value);
            const numOffset = Number(params.offset);

            switch (params.operator) {
                case 'greaterThan':
                    return numA > (numValue + numOffset);
                case 'lessThan':
                    return numA < (numValue + numOffset);
                case 'equals':
                    return numA === (numValue + numOffset);
                case 'greaterThanOrEqual':
                    return numA >= (numValue + numOffset);
                case 'lessThanOrEqual':
                    return numA <= (numValue + numOffset);
                case 'difference':
                    return Math.abs(numA - numValue) === numOffset;
                case 'minimumDifference':
                    return (numA - numValue) < 0
                        ? Math.abs((numA - numValue)) >= numOffset
                        : (numA - numValue) >= numOffset;
                case 'maximumDifference':
                    return (numA - numValue) <= numOffset;
                default:
                    return false;
            }
        },
    };

    static customValidators: Record<string, ICustomValidator> = {
        phoneNumber: (value: string): string | null => {
            const phoneRegex = /^(\+98|0)?9\d{9}$/;
            return phoneRegex.test(value) ? null : 'شماره تلفن درست نیست';
        }
    };

    static evaluateCondition(
        condition: IConditionProps,
        formData: Record<string, any>
    ): boolean {
        if (!condition) return true;
        const { field, conditions, logic, operator, value } = condition;

        if (logic && conditions) {
            const results = conditions.map(cond => this.evaluateCondition(cond, formData));
            return logic === 'AND'
                ? results.every(Boolean)
                : results.some(Boolean);
        }

        if (field && operator) {
            const fieldValue = formData[field];
            const operatorFn = this.operators[operator];
            return operatorFn?.(fieldValue, value) ?? false;
        }

        return true;
    }

    static validate(
        rule: IValidationProps,
        value: any,
        formData: Record<string, any>
    ): string[] | null {
        if (!this.evaluateCondition(rule.when!, formData)) return null;

        if (rule.required && !value) {
            return [rule.message || "این فیلد الزامیه"];
        }

        if (!value && !rule.required) {
            return null;
        }


        const errors: string[] = [];

        if (rule.rules) {
            for (const validation of rule.rules) {
                const { operator, value: compareValue, message } = validation;

                const operatorFn = this.operators[operator];
                if (operatorFn && !operatorFn(value, compareValue)) {
                    errors.push(message || `مقدار وارد شده معتبر نیست ${operator}`);
                }
            }
        }

        if (rule.custom) {
            const customValidation = Array.isArray(rule.custom) ? rule.custom : [rule.custom];
            for (const validation of customValidation) {
                const validator = this.customValidators[validation.validator];
                if (validator) {
                    const error = validator(value, validation.options, formData);
                    if (error) {
                        errors.push(validation.message || error);
                    }
                }
            }
        }

        if (rule.dependencies) {
            for (const dep of rule.dependencies) {
                const { field, rules } = dep;
                const dependentValue = formData[field];

                for (const depRule of rules) {
                    const { operator, value: compareValue, offset, message } = depRule;
                    if (operator === 'compareWithOffset') {
                        const operatorFunc = this.operators[operator];
                        if (!operatorFunc(value, {
                            operator: depRule.compareOperator!,
                            value: dependentValue,
                            offset: offset!
                        })) {
                            errors.push(message || `مقدار وارد شده با ${field} مطابقت ندارد`);
                        }
                    } else {
                        const operatorFunc = this.operators[operator];
                        if (operatorFunc && !operatorFunc(value, dependentValue)) {
                            errors.push(message || `مقدار وارد شده با ${field} مطابقت ندارد`);
                        }
                    }
                }
            }
        }

        return errors.length ? errors : null;
    }

    static addOperator(name: string, operator: IOperator): void {
        this.operators[name] = operator;
    }

    static addCustomValidator(name: string, validator: ICustomValidator): void {
        this.customValidators[name] = validator;
    }
}

export default ValidatorEngine;