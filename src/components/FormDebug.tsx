import { useForm } from "../FormProvider";

const FormDebug = () => {
  const { formData } = useForm();
  const entries = Object.entries(formData);

  return (
    <div
      dir="ltr"
      className="rfb-debug w-full max-w-[1000px] mx-auto mt-8 p-5 rounded-xl"
    >
      <div className="rfb-debug__header">
        <div>
          <p className="rfb-debug__eyebrow">Debug Panel</p>
          <h3 className="rfb-debug__title">Live Form State</h3>
        </div>
        <span className="rfb-debug__count">
          {entries.length} {entries.length === 1 ? "field" : "fields"}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="rfb-debug__empty">
          <p className="rfb-debug__empty-title">No values yet</p>
          <p className="rfb-debug__empty-text">
            Start typing in the form to inspect the live state here.
          </p>
        </div>
      ) : (
        <div className="rfb-debug__grid">
          {entries.map(([key, value]) => (
            <div key={key} className="rfb-debug__item">
              <div className="rfb-debug__item-header">
                <p className="rfb-debug__key">{key}</p>
                <span className="rfb-debug__type">{getValueType(value)}</span>
              </div>

              {isStructuredValue(value) ? (
                <pre className="rfb-debug__pre">
                  <code className="rfb-debug__value">
                    {JSON.stringify(value, null, 2)}
                  </code>
                </pre>
              ) : (
                <p className="rfb-debug__value">{formatPrimitive(value)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormDebug;

const isStructuredValue = (value: unknown) =>
  typeof value === "object" && value !== null;

const getValueType = (value: unknown) => {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
};

const formatPrimitive = (value: unknown) => {
  if (value === undefined || value === "") return "empty";
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
};
