import { useForm } from "../FormProvider";
import { IField, IOption } from "../types";
import { cn } from "../utils/cn";

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
  const hasError = inArray
    ? errors?.[arrayName!]?.[indexArray!]?.[fieldName!]?.length > 0
    : errors[fieldName]?.length > 0;
  const isRequired = isFieldRequired(fieldSchema, formData);

  if (!fieldState?.isVisible) {
    return null;
  }

  // Common props for input elements
  const commonPropsInputs = {
    id: fieldName,
    name: fieldName,
    placeholder: fieldSchema.placeholder,
    value: inArray
      ? formData[arrayName!]?.[indexArray!]?.[fieldName] || ""
      : formData[fieldName] || "",
    onChange: (e: any) =>
      handleChange(
        fieldName,
        e.target.value,
        sectionIndex,
        inArray,
        arrayName,
        indexArray
      ),
    onBlur: () => handleOnBlur(fieldName),
    disabled: !fieldState.isEnable,
    autoComplete: "off",
    className: cn(
      "w-full py-2.5 px-3 border rounded-lg outline-none",
      hasError ? "border-orange-500" : "border-[#6CA8A0]",
      !fieldState.isEnable
        ? "bg-gray-100 cursor-not-allowed disabled:text-gray-500 disabled:border-gray-100"
        : "bg-gray-100",
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
            `block w-1.5 h-1.5 bg-[#6CA8A0] rounded-full`,
            { "bg-red-500": hasError },
            { "bg-orange-400": isRequired },
            { "bg-gray-400": !fieldState.isEnable },
            { "bg-[#6CA8A0]!": isRequired && formData?.[fieldName] || formData[arrayName!]?.[indexArray!]?.[fieldName!] },
            { "bg-gray-400": fieldSchema.type === "readonly" }
          )}
        ></span>
        <label
          htmlFor={fieldName}
          className="text-right font-normal text-[#545A61] flex justify-center items-center"
        >
          <span
            className={cn(
              {
                "text-red-500": hasError,
                "text-[#545A61]": !hasError,
                "text-lg": fieldSchema.type === "readonly",
              },
              formSchema?.labelClassName,
              formSchema.sections[sectionIndex]?.labelClassName,
              formSchema.sections[sectionIndex].fields[fieldName].labelClassName
            )}
          >
            {fieldSchema.label}
          </span>

          {isRequired && <span className="text-red-500 pt-2.5 pr-1.5">*</span>}
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
          <p className="text-[#545A61] mt-1 text-lg">
            {formData?.[fieldName] || "-"}
          </p>
        ) : (
          <input type={fieldSchema.type || "text"} {...commonPropsInputs} />
        )}
      </div>

      {hasError && (
        <>
          <div className={`col-span-${fieldSchema.labelCols || 5}`}></div>
          <div className={`col-span-${fieldSchema.inputCols || 7}`}>
            {!inArray
              ? errors[fieldName].map((error, index) => (
                  <p className="text-red-500 text-xs mt-1" key={index}>
                    {error}
                  </p>
                ))
              : errors[arrayName][indexArray][fieldName].map((error, index) => (
                  <p className="text-red-500 text-xs mt-1" key={index}>
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
  commonPropsInputs: Record<string, any>;
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
