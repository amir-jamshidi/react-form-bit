import FormProvider, { useForm } from "../FormProvider";
import { IFormSchema } from "../types";
import { cn } from "../utils/cn";
import ErrorMessage from "./ErrorMessage";
import FormDebug from "./FormDebug";
import FormHeader from "./FormHeader";
import FormSection from "./FormSection";
import type { MouseEvent } from "react";

interface IFormProps {
  formSchema: IFormSchema;
  onSubmit: ({ formData }: { formData: any; sectionIndex?: number }) => void;
}

export const Form = ({ formSchema, onSubmit }: IFormProps) => {
  return (
    <FormProvider onSubmit={onSubmit} formSchema={formSchema}>
      <FormGen formSchema={formSchema} />
    </FormProvider>
  );
};

function FormGen({ formSchema }: Pick<IFormProps, "formSchema">) {
  const { handleSubmit, handleClearForm } = useForm();

  return (
    <div>
      <div className="max-w-[1000px] mx-auto mt-12">
        <ErrorMessage errorKey="form" />
      </div>
      <div className="max-w-[1000px] mx-auto bg-slate-900 border border-slate-700 rounded-2xl mt-2">
        <FormHeader formSchema={formSchema} />
        <form className="py-5 px-6">
          {formSchema.sections.map((section, i) => (
            <FormSection key={i} section={section} index={i} />
          ))}

          <div className="flex justify-center items-center mt-12 gap-x-2">
            {formSchema.actionButtons.map((actionBtn, idx) => (
              <button
                key={idx}
                onClick={(e: MouseEvent<HTMLButtonElement>) =>
                  actionBtn.type === "submit"
                    ? handleSubmit(e, actionBtn.validateFields || "ALL")
                    : handleClearForm()
                }
                type={actionBtn.type === "submit" ? "submit" : "button"}
                className={cn(actionBtn.className)}
              >
                {actionBtn.label}
              </button>
            ))}
          </div>
        </form>
      </div>
      <FormDebug />
    </div>
  );
}

export default Form;
