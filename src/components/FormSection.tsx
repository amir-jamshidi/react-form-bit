import { useForm } from "../FormProvider";
import { ISection } from "../types";
import { cn } from "../utils/cn";
import ErrorMessage from "./ErrorMessage";
import FormField from "./FormField";

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

  const hasError = formFields.some((field) => errors[field]?.length > 0);

  const formNotFill = formFields.some((fieldName) => {
    const fieldSchema = section.fields[fieldName];
    return isFieldRequired(fieldSchema, formData) && !formData[fieldName];
  });

  if (section.isArray && section.arrayName) {
    //console.log(formFields, " =>formFields");
    const arrayList = formSchema.defaultValue?.[section.arrayName];
    return (
      <>
        {arrayList?.map((fields, i) => {
          const hasError = formFields.some(
            (field) => errors?.[section.arrayName]?.[i]?.[field]?.length > 0
          );
          const formNotFill = formFields.some((fieldName) => {
            const fieldSchema = section.fields[fieldName];
            return (
              isFieldRequired(
                fieldSchema,
                formData?.[section?.arrayName]?.[i]
              ) && !formData[section.arrayName]?.[i]?.[fieldName]
            );
          });
          return (
            <div>
              <ErrorMessage errorKey={`section.${index}`} />
              <div className="grid grid-cols-12 gap-x-8 gap-y-4 border border-gray-200 rounded-2xl px-3 pb-8 mb-4">
                <div className="mx-2 py-3 mt-1 px-2 border-dashed border-b border-b-gray-300 col-span-12">
                  <div className="flex gap-x-2">
                    <span
                      className={cn(
                        `text-white pt-1 flex justify-center items-center w-6 h-6 rounded-full font-far2 text-xs`,
                        { "bg-[#6CA8A0]": !hasError },
                        { "bg-orange-500": formNotFill },
                        { "bg-red-500": hasError }
                      )}
                    >
                      {formSchema.formIndex}.{index + 1}
                    </span>
                    <h2 className="text-xl text-[#343434]">{section.title}</h2>
                  </div>
                  <p className="text-sm text-[#78808B] mr-8">
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
      <div className="grid grid-cols-12 gap-x-8 gap-y-4 border border-gray-200 rounded-2xl px-3 pb-8 mb-4">
        <div className="mx-2 py-3 mt-1 px-2 border-dashed border-b border-b-gray-300 col-span-12">
          <div className="flex gap-x-2">
            <span
              className={cn(
                `text-white pt-1 flex justify-center items-center w-6 h-6 rounded-full font-far2 text-xs`,
                { "bg-[#6CA8A0]": !hasError },
                { "bg-orange-500": formNotFill },
                { "bg-red-500": hasError }
              )}
            >
              {formSchema.formIndex}.{index + 1}
            </span>
            <h2 className="text-xl text-[#343434]">{section.title}</h2>
          </div>
          <p className="text-sm text-[#78808B] mr-8">{section.subTitle}</p>
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
                onClick={(e) =>
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
