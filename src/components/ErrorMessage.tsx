import { useForm } from "../FormProvider";

interface IErrorMessageProps {
  errorKey: string;
}

const ErrorMessage = ({ errorKey }: IErrorMessageProps) => {
  const { errors } = useForm();

  if (!errors?.[errorKey]?.length) return null;

  return (
    <div className="w-full border mb-2 border-gray-200 rounded-2xl flex gap-x-2.5 overflow-hidden">
      <div className="min-h-14 bg-red-500 min-w-16 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="#fff"
          className="size-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <div className="flex flex-col justify-center py-3">
        {errors[errorKey]?.map((error, i) => (
          <div key={i} className="flex items-center text-red-500 gap-x-1">
            <span className="w-1.5 h-1.5 block bg-red-500 rounded-full"></span>
            <p className="text-base text-red-500">{error as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ErrorMessage;
