import { useForm } from "../FormProvider";

const FormDebug = () => {
  const { formData } = useForm();
  return (
    <div dir="ltr" className="rfb-debug w-96 max-w-full mx-auto mt-8 p-4 rounded-xl">
      {Object.entries(formData).map(([key, value]) => {
        if (typeof value === "object")
          return (
            <div key={key} className="flex justify-start items-center">
              <p className="rfb-debug__key font-semibold">{key}</p>
              <p className="rfb-debug__separator mx-1"> : </p>
              <p className="rfb-debug__value font-semibold">
                {JSON.stringify(value)}
              </p>
            </div>
          );
        return (
          <div key={key} className="flex justify-start items-center">
            <p className="rfb-debug__key font-semibold">{key}</p>
            <p className="rfb-debug__separator mx-1"> : </p>
            <p className="rfb-debug__value font-semibold">{String(value)}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FormDebug;
