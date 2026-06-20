import { useForm } from "../FormProvider";
import { ISection } from "../types";
import { cn } from "../utils/cn";
import { getIn } from "../utils/formState";
import ErrorMessage from "./ErrorMessage";
import FormField from "./FormField";
import { Button } from "./ui";
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
    isFormLoading,
    isSectionLoading,
  } = useForm();
  const showSectionHeader = section.showHeader !== false;
  const hasSectionBackground = section.hasBackground !== false;
  const hasIndexing = formSchema.hasIndexing !== false;

  const formFields = Object.keys(section.fields);

  const hasError = formFields.some(
    (field) => Array.isArray(errors[field]) && errors[field]!.length > 0,
  );

  const formNotFill = formFields.some((fieldName) => {
    const fieldSchema = section.fields[fieldName];
    return (
      isFieldRequired(fieldSchema, formData) && !getIn(formData, fieldName)
    );
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
            (field) => (rowErrors[field]?.length ?? 0) > 0,
          );
          const rowData = getIn(formData, `${arrayName}.${i}`) ?? formData;
          const formNotFill = formFields.some((fieldName) => {
            const fieldSchema = section.fields[fieldName];
            return (
              isFieldRequired(
                fieldSchema,
                rowData as Record<string, unknown>,
              ) && !getIn(formData, `${arrayName}.${i}.${fieldName}`)
            );
          });
          const isLoading =
            isFormLoading || isSectionLoading(index, arrayName, i);
          return (
            <div key={`${arrayName}-${i}`}>
              <ErrorMessage errorKey={`section.${index}`} />
              <div
                className="rfb-section grid grid-cols-12 gap-x-8 gap-y-4 px-3 pb-8 mb-4"
                data-has-background={hasSectionBackground}
                data-loading={isLoading}
              >
                {showSectionHeader ? (
                  <div className="rfb-section__intro mx-2 py-3 mt-1 px-2 col-span-12">
                    <div className="flex gap-x-2">
                      {hasIndexing ? (
                        <span
                          className={cn(
                            "rfb-section__badge pt-1 flex justify-center items-center w-7 h-7 rounded-full font-far2 text-xs",
                            { "rfb-status-valid": !hasError && !formNotFill },
                            { "rfb-status-pending": formNotFill },
                            { "rfb-status-error": hasError },
                          )}
                        >
                          {Number(formSchema.formIndex).toLocaleString("fa")}.
                          {Number(index + 1).toLocaleString("fa")}
                        </span>
                      ) : null}
                      <div className="flex justify-between items-center w-full">
                        <h2 className="rfb-section__title text-xl">
                          {section.title}
                        </h2>
                        <span className="rfb-pill text-sm flex justify-center items-center pt-0.5">
                          لیست
                        </span>
                      </div>
                    </div>
                    <p
                      className={cn("rfb-subtitle text-sm", {
                        "mr-8": hasIndexing,
                      })}
                    >
                      {section.subTitle}
                    </p>
                  </div>
                ) : null}

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
                      <Button
                        data-action={actionBtn.submitterKey}
                        data-array-index={i}
                        data-array-name={arrayName}
                        key={idx}
                        onClick={(e: MouseEvent<HTMLButtonElement>) =>
                          actionBtn.type === "submit"
                            ? handleSubmit(
                                e,
                                actionBtn.validateFields || "ALL",
                                index,
                              )
                            : handleClearForm(index, arrayName, i)
                        }
                        type={actionBtn.type === "submit" ? "submit" : "button"}
                        variant={
                          actionBtn.type === "reset" ? "secondary" : "primary"
                        }
                        loading={actionBtn.type === "submit" && isLoading}
                        disabled={isLoading}
                        className={cn("rfb-button", actionBtn.className)}
                      >
                        {actionBtn.type === "submit" && isLoading
                          ? actionBtn.loadingLabel || actionBtn.label
                          : actionBtn.label}
                      </Button>
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
  const isLoading = isFormLoading || isSectionLoading(index);
  return (
    <div>
      <ErrorMessage errorKey={`section.${index}`} />
      <div
        className="rfb-section grid grid-cols-12 gap-x-8 gap-y-4 px-3 pb-8 mb-4"
        data-has-background={hasSectionBackground}
        data-loading={isLoading}
      >
        {showSectionHeader ? (
          <div className="rfb-section__intro mx-2 py-3 mt-1 px-2 col-span-12">
            <div className="flex gap-x-2">
              {hasIndexing ? (
                <span
                  className={cn(
                    "rfb-section__badge pt-1 flex justify-center items-center w-7 h-7 rounded-full font-far2 text-xs",
                    { "rfb-status-valid": !hasError && !formNotFill },
                    { "rfb-status-pending": formNotFill },
                    { "rfb-status-error": hasError },
                  )}
                >
                  {Number(formSchema.formIndex).toLocaleString("fa")}.
                  {Number(index + 1).toLocaleString("fa")}
                </span>
              ) : null}
              <h2 className="rfb-section__title text-xl">{section.title}</h2>
            </div>
            <p
              className={cn("rfb-subtitle text-sm", {
                "mr-8": hasIndexing,
              })}
            >
              {section.subTitle}
            </p>
          </div>
        ) : null}

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
              <Button
                key={idx}
                onClick={(e: MouseEvent<HTMLButtonElement>) =>
                  actionBtn.type === "submit"
                    ? handleSubmit(e, actionBtn.validateFields || "ALL", index)
                    : handleClearForm(index)
                }
                type={actionBtn.type === "submit" ? "submit" : "button"}
                variant={actionBtn.type === "reset" ? "secondary" : "primary"}
                loading={actionBtn.type === "submit" && isLoading}
                disabled={isLoading}
                className={cn("rfb-button", actionBtn.className)}
              >
                {actionBtn.type === "submit" && isLoading
                  ? actionBtn.loadingLabel || actionBtn.label
                  : actionBtn.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSection;
