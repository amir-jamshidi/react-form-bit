import { useForm } from "../FormProvider";
import { ISection } from "../types";
import { cn } from "../utils/cn";
import { getIn } from "../utils/formState";
import ErrorMessage from "./ErrorMessage";
import FormField from "./FormField";
import type { MouseEvent } from "react";

interface IFormSectionProps {
  section: ISection;
  index: number;
}

const FormSection = ({ section, index }: IFormSectionProps) => {
  const {
    isFieldRequired,
    handleSubmit,
    formSchema,
    formData,
    errors,
    handleClearForm,
  } = useForm();

  const formFields = Object.keys(section.fields);

  const hasError = formFields.some(
    (field) => Array.isArray(errors[field]) && errors[field]!.length > 0
  );

  const formNotFill = formFields.some((fieldName) => {
    const fieldSchema = section.fields[fieldName];
    return isFieldRequired(fieldSchema, formData) && !getIn(formData, fieldName);
  });

  if (section.isArray && section.arrayName) {
    const arrayName = section.arrayName;
    const arrayList = getIn(formData, arrayName) as
      | Record<string, unknown>[]
      | undefined;
    const arrayErrors = errors[arrayName] as
      | Record<string, string[]>[]
      | undefined;

    return (
      <>
        {arrayList?.map((_item, i) => {
          const rowErrors = arrayErrors?.[i] ?? {};
          const hasError = formFields.some(
            (field) => (rowErrors[field]?.length ?? 0) > 0
          );
          const rowData = getIn(formData, `${arrayName}.${i}`) ?? formData;
          const formNotFill = formFields.some((fieldName) => {
            const fieldSchema = section.fields[fieldName];
            return (
              isFieldRequired(fieldSchema, rowData as Record<string, unknown>) &&
              !getIn(formData, `${arrayName}.${i}.${fieldName}`)
            );
          });
          return (
            <div key={`${arrayName}-${i}`}>
              <ErrorMessage errorKey={`section.${index}`} />
              <div className="bg-slate-900 grid grid-cols-12 gap-x-8 gap-y-4 border border-slate-700 rounded-2xl px-3 pb-8 mb-4">
                <div className="mx-2 py-3 mt-1 px-2 border-dashed border-b border-b-slate-800 col-span-12">
                  <div className="flex gap-x-2">
                    <span
                      className={cn(
                        `text-white pt-1 flex justify-center items-center w-6 h-6 rounded-full font-far2 text-xs`,
                        { "bg-emerald-600": !hasError },
                        { "bg-zinc-600": formNotFill },
                        { "bg-rose-600": hasError }
                      )}
                    >
                      {Number(formSchema.formIndex).toLocaleString("fa")}.
                      {Number(index + 1).toLocaleString("fa")}
                    </span>
                    <div className="flex justify-between items-center w-full">
                      <h2 className="text-xl text-slate-100">
                        {section.title}
                      </h2>
                      <span className="bg-blue-800 text-white rounded px-2 text-sm flex justify-center items-center pt-0.5">
                        لیست
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mr-8">
                    {section.subTitle}
                  </p>
                </div>

                {Object.keys(section.fields).map((fieldName) => (
                  <FormField
                    inArray
                    arrayName={section.arrayName}
                    indexArray={i}
                    key={fieldName}
                    fieldName={fieldName}
                    sectionIndex={index}
                  />
                ))}

                {section.actionButtons?.length! > 0 && (
                  <div className="flex justify-center items-center mt-12 col-span-12 gap-x-2">
                    {section.actionButtons?.map((actionBtn, idx) => (
                    <button
                      data-action={actionBtn.submitterKey}
                      data-array-index={i}
                      data-array-name={arrayName}
                      key={idx}
                      onClick={(e: MouseEvent<HTMLButtonElement>) =>
                          actionBtn.type === "submit"
                            ? handleSubmit(
                                e,
                                actionBtn.validateFields || "ALL",
                                index
                              )
                            : handleClearForm(index)
                        }
                        type={actionBtn.type === "submit" ? "submit" : "button"}
                        className={cn(actionBtn.className)}
                      >
                        {actionBtn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </>
    );
  }
  return (
    <div>
      <ErrorMessage errorKey={`section.${index}`} />
      <div className="bg-slate-900 grid grid-cols-12 gap-x-8 gap-y-4 border border-slate-700 rounded-2xl px-3 pb-8 mb-4">
        <div className="mx-2 py-3 mt-1 px-2 border-dashed border-b border-b-slate-800 col-span-12">
          <div className="flex gap-x-2">
            <span
              className={cn(
                `text-white pt-1 flex justify-center items-center w-6 h-6 rounded-full font-far2 text-xs`,
                { "bg-emerald-600": !hasError },
                { "bg-zinc-600": formNotFill },
                { "bg-rose-600": hasError }
              )}
            >
              {Number(formSchema.formIndex).toLocaleString("fa")}.
              {Number(index + 1).toLocaleString("fa")}
            </span>
            <h2 className="text-xl text-slate-100">{section.title}</h2>
          </div>
          <p className="text-sm text-slate-300 mr-8">{section.subTitle}</p>
        </div>

        {Object.keys(section.fields).map((fieldName) => (
          <FormField
            key={fieldName}
            fieldName={fieldName}
            sectionIndex={index}
          />
        ))}
        {section.actionButtons?.length! > 0 && (
          <div className="flex justify-center items-center mt-12 col-span-12 gap-x-2">
            {section.actionButtons?.map((actionBtn, idx) => (
                <button
                key={idx}
                onClick={(e: MouseEvent<HTMLButtonElement>) =>
                  actionBtn.type === "submit"
                    ? handleSubmit(e, actionBtn.validateFields || "ALL", index)
                    : handleClearForm(index)
                }
                type={actionBtn.type === "submit" ? "submit" : "button"}
                className={cn(actionBtn.className)}
              >
                {actionBtn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSection;
