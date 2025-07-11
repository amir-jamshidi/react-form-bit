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
    <div className="mx-8 py-5 border-b border-b-gray-200">
      <div className="flex gap-x-2">
        <span
          className={cn(
            `text-white text-sm pt-1 flex justify-center items-center w-6 h-6 rounded-full`,
            {
              "bg-[#6CA8A0]": formState === "valid",
              "bg-orange-500": formState === "notFill",
              "bg-red-500": formState === "error",
            }
          )}
        >
          {formSchema.formIndex}
        </span>
        <h2 className="text-xl text-[#343434]">{formSchema.title}</h2>
      </div>
      <p className="text-sm text-[#78808B] mr-8">{formSchema.subTitle}</p>
    </div>
  );
};

export default FormHeader;
