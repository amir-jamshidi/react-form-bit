import { useForm } from "../FormProvider";
import { IFormSchema } from "../types";
import { cn } from "../utils/cn";

interface IFormHeaderProps {
  formSchema: IFormSchema;
}

const FormHeader = ({ formSchema }: IFormHeaderProps) => {
  const { checkFormState } = useForm();
  const formState = checkFormState();
  const hasIndexing = formSchema.hasIndexing !== false;
  return (
    <div className="rfb-header mx-8 py-5">
      <div className="flex gap-x-2">
        {hasIndexing ? (
          <span
            className={cn(
              "rfb-status text-sm pt-1 flex justify-center items-center w-7 h-7 rounded-full",
              {
                "rfb-status-valid": formState === "valid",
                "rfb-status-pending": formState === "notFill",
                "rfb-status-error": formState === "error",
              }
            )}
          >
            {Number(formSchema.formIndex).toLocaleString("fa")}
          </span>
        ) : null}
        <h2 className="rfb-title text-xl">{formSchema.title}</h2>
      </div>
      <p className="rfb-subtitle text-sm mr-8 mt-2">{formSchema.subTitle}</p>
    </div>
  );
};

export default FormHeader;
