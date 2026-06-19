import { useForm } from "../FormProvider";
import { IField, IOption } from "../types";
import { cn } from "../utils/cn";
import { getIn } from "../utils/formState";

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
  const arrayErrors =
    arrayName !== undefined ? errors[arrayName] : undefined;
  const rowErrors =
    arrayName !== undefined && indexArray !== undefined && Array.isArray(arrayErrors)
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

  const commonPropsInputs = {
    id: `${fieldName}${indexArray !== undefined ? indexArray : ""}`,
    name: fieldName,
    placeholder: fieldSchema.placeholder,
    value: String(fieldValue ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      handleChange(
        fieldName,
        e.target.value,
        sectionIndex,
        inArray,
        arrayName,
        indexArray
      ),
    onBlur: () => handleOnBlur(fieldName, inArray, arrayName, indexArray),
    disabled: !fieldState.isEnable,
    autoComplete: "off",
    className: cn(
      "rfb-control w-full py-2.5 px-3 border rounded outline-none",
      hasError ? "rfb-control-error" : "",
      !fieldState.isEnable
        ? "rfb-control-disabled cursor-not-allowed"
        : "transition-colors",
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
        } gap-x-2 grid grid-cols-12 content-start justify-start items-center px-2`,
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
          htmlFor={`${fieldName}${indexArray !== undefined ? indexArray : ""}`}
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

          {isRequired && <span className="rfb-label-error pt-2.5 pr-1.5">*</span>}
        </label>
      </div>

      <div className={`relative col-span-${fieldSchema.inputCols || 7}`}>
        {fieldSchema.type === "select" ? (
          <Select
            fieldName={fieldName}
            fieldSchema={fieldSchema}
            commonPropsInputs={commonPropsInputs}
          />
        ) : fieldSchema.type === "readonly" ? (
          <p className="rfb-readonly mt-1 text-lg">
            {String(fieldValue ?? "-")}
          </p>
        ) : (
          <input type={fieldSchema.type || "text"} {...commonPropsInputs} />
        )}
      </div>

      {hasError && (
        <>
          <div className={`col-span-${fieldSchema.labelCols || 5}`}></div>
          <div className={`col-span-${fieldSchema.inputCols || 7}`}>
            {errorList.map((error, index) => (
              <p className="rfb-field-error text-xs mt-1" key={index}>
                {error}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FormField;

const Select = ({
  fieldSchema,
  commonPropsInputs,
  fieldName,
}: {
  fieldSchema: IField;
  commonPropsInputs: Record<string, unknown>;
  fieldName: string;
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

  return (
    <select {...commonPropsInputs}>
      <option value="">انتخاب کنید</option>
      {fieldSchema?.remoteOptions?.endPointUrl ? (
        <>
          {remoteOptions[fieldName]?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </>
      ) : (
        <>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </>
      )}
    </select>
  );
};
