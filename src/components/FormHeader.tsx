import { useForm } from "../FormProvider";
import { IFormSchema } from "../types";
import { cn } from "../utils/cn";

interface IFormHeaderProps {
  formSchema: IFormSchema;
}

const FormHeader = ({ formSchema }: IFormHeaderProps) => {
  const { checkFormState } = useForm();
  const formState = checkFormState();
  return (
    <div className="mx-8 py-5 border-bs border-sb -slate-800">
      <div className="flex gap-x-2">
        <span
          className={cn(
            `text-white text-sm pt-1 flex justify-center items-center w-6 h-6 rounded-full`,
            {
              "bg-emerald-600": formState === "valid",
              "bg-zinc-500": formState === "notFill",
              "bg-rose-600": formState === "error",
            }
          )}
        >
          {Number(formSchema.formIndex).toLocaleString("fa")}
        </span>
        <h2 className="text-xl text-white">{formSchema.title}</h2>
      </div>
      <p className="text-sm text-slate-300 mr-8">{formSchema.subTitle}</p>
    </div>
  );
};

export default FormHeader;
