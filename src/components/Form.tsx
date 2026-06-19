import FormProvider, { useForm } from "../FormProvider";
import { FormTheme, IFormSchema } from "../types";
import { cn } from "../utils/cn";
import ErrorMessage from "./ErrorMessage";
import FormDebug from "./FormDebug";
import FormHeader from "./FormHeader";
import FormSection from "./FormSection";
import { Button } from "./ui";
import type { MouseEvent } from "react";

interface IFormProps {
  formSchema: IFormSchema;
  onSubmit: ({ formData }: { formData: any; sectionIndex?: number }) => void;
  theme?: FormTheme;
}

export const Form = ({ formSchema, onSubmit, theme }: IFormProps) => {
  const resolvedTheme = theme || formSchema.theme || "modern";

  return (
    <FormProvider onSubmit={onSubmit} formSchema={formSchema}>
      <FormGen formSchema={formSchema} theme={resolvedTheme} />
    </FormProvider>
  );
};

function FormGen({
  formSchema,
  theme,
}: Pick<IFormProps, "formSchema" | "theme">) {
  const { handleSubmit, handleClearForm } = useForm();
  const showHeader = formSchema.showHeader !== false;
  const hasBackground = formSchema.hasBackground !== false;

  return (
    <div data-theme={theme} className="rfb-theme rfb-page-shell">
      <div className="max-w-[1000px] mx-auto mt-12">
        <ErrorMessage errorKey="form" />
      </div>
      <div className="rfb-form max-w-[1000px] mx-auto mt-2">
        {showHeader ? <FormHeader formSchema={formSchema} /> : null}
        <form
          className="rfb-card py-5 px-6"
          data-has-background={hasBackground}
        >
          {formSchema.sections.map((section, i) => (
            <FormSection key={i} section={section} index={i} />
          ))}

          <div className="flex justify-center items-center mt-12 gap-x-2">
            {formSchema.actionButtons.map((actionBtn, idx) => (
              <Button
                key={idx}
                onClick={(e: MouseEvent<HTMLButtonElement>) =>
                  actionBtn.type === "submit"
                    ? handleSubmit(e, actionBtn.validateFields || "ALL")
                    : handleClearForm()
                }
                type={actionBtn.type === "submit" ? "submit" : "button"}
                variant={actionBtn.type === "reset" ? "secondary" : "primary"}
                className={cn("rfb-button", actionBtn.className)}
              >
                {actionBtn.label}
              </Button>
            ))}
          </div>
        </form>
      </div>
      <FormDebug />
    </div>
  );
}

export default Form;
