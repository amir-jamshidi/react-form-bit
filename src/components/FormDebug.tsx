import { useForm } from "../FormProvider";

const FormDebug = () => {
  const { formData } = useForm();
  return (
    <div dir="ltr" className="w-96 mx-auto bg-gray-800 mt-8 p-4 rounded-xl">
      {Object.entries(formData).map(([key, value]) => {
        if (typeof value === "object")
          return (
            <div key={key} className="flex justify-start items-center">
              <p className="text-orange-600 font-semibold">{key}</p>
              <p className="text-white mx-1"> : </p>
              <p className="text-white font-semibold">
                {JSON.stringify(value)}
              </p>
            </div>
          );
        return (
          <div key={key} className="flex justify-start items-center">
            <p className="text-orange-600 font-semibold">{key}</p>
            <p className="text-white mx-1"> : </p>
            <p className="text-white font-semibold">{String(value)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FormDebug;
