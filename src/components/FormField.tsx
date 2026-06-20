import { useForm } from "../FormProvider";
import { IField, IOption } from "../types";
import { cn } from "../utils/cn";
import { getIn } from "../utils/formState";
import {
  Checkbox,
  FieldMessage,
  Input,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from "./ui";

interface IFormFieldProps {
  fieldName: string;
  sectionIndex: number;
  inArray?: boolean;
  arrayName?: string;
  indexArray?: number;
}

const FormField = ({
  fieldName,
  sectionIndex,
  inArray,
  arrayName,
  indexArray,
}: IFormFieldProps) => {
  const {
    handleChange,
    handleOnBlur,
    isFieldRequired,
    errors,
    formData,
    formSchema,
    fieldStates,
    isFormLoading,
    isSectionLoading,
  } = useForm();

  const sectionWithField = formSchema.sections.find(
    (sec) => sec.fields[fieldName]
  );
  if (!sectionWithField) return null;

  const fieldSchema = sectionWithField.fields[fieldName];
  const fieldState = fieldStates[fieldName] || {
    isVisible: true,
    isEnable: true,
  };
  const arrayErrors = arrayName !== undefined ? errors[arrayName] : undefined;
  const rowErrors =
    arrayName !== undefined &&
    indexArray !== undefined &&
    Array.isArray(arrayErrors)
      ? (arrayErrors[indexArray] as Record<string, string[]> | undefined)
      : undefined;

  const hasError =
    arrayName !== undefined &&
    indexArray !== undefined &&
    Array.isArray(arrayErrors)
      ? (arrayErrors as Record<string, string[]>[])?.[indexArray]?.[
          fieldName
        ]?.length > 0
      : (errors[fieldName] as string[])?.length > 0;
  const errorList =
    !inArray && Array.isArray(errors[fieldName])
      ? (errors[fieldName] as string[])
      : rowErrors && Array.isArray(rowErrors[fieldName])
        ? (rowErrors[fieldName] as string[])
        : [];
  const isRequired = isFieldRequired(fieldSchema, formData);

  if (!fieldState?.isVisible) {
    return null;
  }

  const fieldPath =
    inArray && arrayName !== undefined && indexArray !== undefined
      ? `${arrayName}.${indexArray}.${fieldName}`
      : fieldName;
  const fieldValue = getIn(formData, fieldPath);
  const fieldId = `${fieldName}${indexArray !== undefined ? indexArray : ""}`;
  const errorMessage = errorList[0];
  const isLoading =
    isFormLoading ||
    isSectionLoading(sectionIndex, inArray ? arrayName : undefined, indexArray);

  const handleValueChange = (value: string | boolean) =>
    handleChange(
      fieldName,
      value,
      sectionIndex,
      inArray,
      arrayName,
      indexArray
    );

  const commonPropsInputs = {
    id: fieldId,
    name: fieldName,
    placeholder: fieldSchema.placeholder,
    disabled: !fieldState.isEnable,
    autoComplete: "off",
    className: cn(
      "w-full",
      formSchema?.inputClassName,
      formSchema.sections[sectionIndex]?.inputClassName,
      formSchema.sections[sectionIndex].fields[fieldName].inputClassName
    ),
  };

  return (
    <div
      className={cn(
        `mt-4 col-span-${
          fieldSchema.cols || 6
        } gap-x-2 gap-y-2 grid grid-cols-12 content-start justify-start px-2`,
        formSchema?.inputWrapperClassName,
        formSchema.sections[sectionIndex]?.inputWrapperClassName,
        formSchema.sections[sectionIndex].fields[fieldName]
          .inputWrapperClassName
      )}
    >
      <div
        className={`col-span-${
          fieldSchema.labelCols || 5
        } flex justify-start items-center gap-x-1.5`}
      >
        <span
          className={cn(
            "rfb-label-dot block w-1.5 h-1.5 rounded-full",
            { "rfb-label-dot-required": isRequired },
            { "rfb-label-dot-error": hasError },
            { "rfb-label-dot-disabled": !fieldState.isEnable },
            {
              "rfb-label-dot-filled": Boolean(isRequired && fieldValue),
            },
            { "rfb-label-dot-disabled": fieldSchema.type === "readonly" }
          )}
        ></span>
        <label
          htmlFor={fieldId}
          className="rfb-label text-right font-normal flex justify-center items-center"
        >
          <span
            className={cn(
              {
                "rfb-label-error": hasError,
                "rfb-label-text": !hasError,
                "text-lg": fieldSchema.type === "readonly",
              },
              formSchema?.labelClassName,
              formSchema.sections[sectionIndex]?.labelClassName,
              formSchema.sections[sectionIndex].fields[fieldName].labelClassName
            )}
          >
            {fieldSchema.label}
          </span>

          {isRequired && (
            <span className="rfb-label-error pt-2.5 pr-1.5">*</span>
          )}
        </label>
      </div>

      <div className={`relative col-span-${fieldSchema.inputCols || 7} self-center`}>
        {fieldSchema.type === "readonly" ? (
          <p className="rfb-readonly mt-1 text-lg">
            {String(fieldValue ?? "-")}
          </p>
        ) : (
          <FieldControl
            fieldName={fieldName}
            fieldSchema={fieldSchema}
            commonPropsInputs={commonPropsInputs}
            fieldValue={fieldValue}
            errorMessage={errorMessage}
            isLoading={isLoading}
            onBlur={() => handleOnBlur(fieldName, inArray, arrayName, indexArray)}
            onValueChange={handleValueChange}
          />
        )}
      </div>

      <div className={`col-span-${fieldSchema.labelCols || 5}`}></div>
      <div className={`col-span-${fieldSchema.inputCols || 7} self-start`}>
        {fieldSchema.type === "readonly" ? null : (
          <FieldMessage
            id={`${fieldId}-message`}
            error={errorMessage}
          />
        )}
      </div>

    </div>
  );
};

export default FormField;

const FieldControl = ({
  fieldSchema,
  commonPropsInputs,
  fieldName,
  fieldValue,
  errorMessage,
  isLoading,
  onBlur,
  onValueChange,
}: {
  fieldSchema: IField;
  commonPropsInputs: Record<string, unknown>;
  fieldName: string;
  fieldValue: unknown;
  errorMessage?: string;
  isLoading: boolean;
  onBlur: () => void;
  onValueChange: (value: string | boolean) => void;
}) => {
  const { handleSelectOption, UseGetRemoteOptions, remoteOptions } = useForm();

  UseGetRemoteOptions({
    endPointUrl: fieldSchema.remoteOptions?.endPointUrl || "",
    labelNameKey: fieldSchema.remoteOptions?.labelNameKey || "",
    valueNameKey: fieldSchema.remoteOptions?.valueNameKey || "",
    path: fieldSchema.remoteOptions?.path,
    dependencies: fieldSchema.remoteOptions?.dependencies,
    sendMethod: fieldSchema.remoteOptions?.sendMethod,
    fieldName,
  });

  const options: IOption[] | null =
    fieldSchema.options &&
    Array.isArray(fieldSchema.options) &&
    fieldSchema.options[0] &&
    "when" in fieldSchema.options[0]
      ? fieldSchema.options.reduce<IOption[] | null>((prev, cur) => {
          if (prev) return prev;

          if ("when" in cur && handleSelectOption(cur.when)) {
            return cur.options;
          }

          return null;
        }, null)
      : (fieldSchema.options as IOption[]);

  const resolvedOptions =
    fieldSchema?.remoteOptions?.endPointUrl
      ? remoteOptions[fieldName] || []
      : options || [];

  const sharedProps = {
    id: commonPropsInputs.id as string,
    className: commonPropsInputs.className as string,
    disabled: (commonPropsInputs.disabled as boolean) || isLoading,
    validationState: errorMessage ? "error" : "default",
    error: errorMessage,
    loading: isLoading,
  } as const;

  switch (fieldSchema.type) {
    case "select":
      return (
        <Select
          {...sharedProps}
          name={commonPropsInputs.name as string}
          value={String(fieldValue ?? "")}
          placeholder={(commonPropsInputs.placeholder as string) || "انتخاب کنید"}
          options={resolvedOptions}
          showMessage={false}
          onValueChange={onValueChange}
          onBlur={onBlur}
        />
      );
    case "textarea":
      return (
        <Textarea
          {...sharedProps}
          name={commonPropsInputs.name as string}
          placeholder={commonPropsInputs.placeholder as string}
          value={String(fieldValue ?? "")}
          showMessage={false}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onValueChange(e.target.value)
          }
          onBlur={onBlur}
        />
      );
    case "checkbox":
      return (
        <Checkbox
          {...sharedProps}
          name={commonPropsInputs.name as string}
          checked={Boolean(fieldValue)}
          showMessage={false}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onValueChange(e.target.checked)
          }
          onBlur={onBlur}
        />
      );
    case "radio":
      return (
        <RadioGroup
          {...sharedProps}
          name={commonPropsInputs.name as string}
          value={String(fieldValue ?? "")}
          options={resolvedOptions}
          showMessage={false}
          onValueChange={onValueChange}
        />
      );
    case "switch":
      return (
        <Switch
          {...sharedProps}
          checked={Boolean(fieldValue)}
          showMessage={false}
          onCheckedChange={onValueChange}
        />
      );
    default:
      return (
        <Input
          {...sharedProps}
          name={commonPropsInputs.name as string}
          type={resolveInputType(fieldSchema.type)}
          placeholder={commonPropsInputs.placeholder as string}
          value={String(fieldValue ?? "")}
          showMessage={false}
          autoComplete={commonPropsInputs.autoComplete as string}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onValueChange(e.target.value)
          }
          onBlur={onBlur}
        />
      );
  }
};

const resolveInputType = (fieldType: string) => {
  if (!fieldType || fieldType === "input") return "text";
  if (
    ["text", "email", "password", "number", "tel", "url", "search"].includes(
      fieldType
    )
  ) {
    return fieldType;
  }

  return "text";
};
