import { useState } from "react";
import Form from "./components/Form";
import { FormTheme, IFormSchema } from "./types";
import {
  Button,
  Checkbox,
  Input,
  RadioGroup,
  Select,
  Switch,
  Textarea,
} from "./components/ui";

const themeOptions: { value: FormTheme; label: string }[] = [
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "forest", label: "Forest" },
  { value: "rose", label: "Rose" },
  { value: "midnight", label: "Midnight" },
  { value: "headless", label: "Headless" },
];

interface ISubmitLog {
  id: string;
  scope: string;
  status: "pending" | "resolved";
  startedAt: string;
  finishedAt?: string;
}

const App = () => {
  const [theme, setTheme] = useState<FormTheme>("modern");
  const [previewInput, setPreviewInput] = useState("");
  const [previewTextarea, setPreviewTextarea] = useState("");
  const [previewSelect, setPreviewSelect] = useState("");
  const [previewChecked, setPreviewChecked] = useState(true);
  const [previewSwitch, setPreviewSwitch] = useState(false);
  const [previewRadio, setPreviewRadio] = useState("starter");
  const [submitLogs, setSubmitLogs] = useState<ISubmitLog[]>([]);

  const handleSubmit = async ({
    formData,
    sectionIndex,
    arrayIndex,
    arrayName,
  }: {
    formData: any;
    sectionIndex?: number;
    arrayIndex?: number;
    arrayName?: string;
  }) => {
    const scope =
      sectionIndex === undefined
        ? "Full form submit"
        : arrayName !== undefined && arrayIndex !== undefined
          ? `Array section submit (${arrayName}[${arrayIndex}])`
          : `Section submit (${sectionIndex})`;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = new Date().toLocaleTimeString();

    setSubmitLogs((prev) => [
      {
        id,
        scope,
        status: "pending",
        startedAt,
      },
      ...prev,
    ]);

    await fakeApiCall({
      delay:
        sectionIndex === undefined
          ? 2600
          : arrayName !== undefined && arrayIndex !== undefined
            ? 2200
            : 1800,
      payload: {
        formData,
        sectionIndex,
        arrayIndex,
        arrayName,
      },
    });

    setSubmitLogs((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              status: "resolved",
              finishedAt: new Date().toLocaleTimeString(),
            }
          : entry,
      ),
    );
  };

  return (
    <div className="min-h-screen px-4 py-8">
      {/* <div className="max-w-[1000px] mx-auto mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            React Form Bit
          </p>
          <h1 className="text-3xl text-slate-900 font-semibold">
            Theme Showcase
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-[1.75rem] border border-slate-300 bg-white/80 p-1 shadow-sm flex-wrap">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              onClick={() => setTheme(option.value)}
              size="sm"
              variant={theme === option.value ? "primary" : "ghost"}
              className="rounded-full min-w-0"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="max-w-[1000px] mx-auto mb-8 grid gap-4 md:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Async Submit Scenario
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Manual loading-state test
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              1. Submit the first section and verify only that section becomes
              disabled.
            </p>
            <p>
              2. Submit a bank row and verify only that array row becomes
              disabled.
            </p>
            <p>
              3. Submit the full form and verify every field and button becomes
              disabled until the request resolves.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Request Log
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                Async calls
              </h3>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
              {submitLogs.length}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {submitLogs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                No submit requests yet.
              </p>
            ) : (
              submitLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{log.scope}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        log.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Started: {log.startedAt}
                    {log.finishedAt ? ` | Finished: ${log.finishedAt}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div> */}
  
      <Form onSubmit={handleSubmit} formSchema={formSchema} theme={theme} />
    </div>
  );
};

export default App;

export const formSchema: IFormSchema = {
  theme: "modern",
  title: "فرم حساب های بانکی مشتری",
  hasBackground:false ,
  hasIndexing:false ,
  showHeader:false ,
  subTitle: "لطفا اطلاعات حساب های بانکی خود را در فرم های زیر وارد کنید",
  sections: [
    {
      hasBackground:true ,
      showHeader:true,
      title: "مشخصات فردی",
      subTitle: "مشتری گرامی لطفا مشخصات فردی خود را در فرم زیر وارد نمایید.",
      fields: {
        firstname: {
          resetValueFields: "SECTION",
          resetErrorFields: "SECTION",
          label: "نام شما",
          type: "input",
          placeholder: "لطفا نام خود را وارد کنید",
          validations: [
            {
              required: true,
              message: "وارد کردن نام الزامی است.",
            },
            {
              rules: [
                {
                  operator: "minLength",
                  value: 3,
                  message: "نام حداقل باید 3 کاراکتر باشد.",
                },
              ],
            },
          ],
        },
        lastname: {
          label: "نام خانوادگی شما",
          type: "input",
          placeholder: "لطفا نام خانوادگی خود را وارد کنید",
          validations: [
            {
              required: true,
              message: "وارد کردن نام خانوادگی الزامی است.",
            },
            {
              rules: [
                {
                  operator: "minLength",
                  value: 3,
                  message: "نام خانوادگی حداقل باید 3 کاراکتر باشد.",
                },
              ],
            },
          ],
        },
        nationalId: {
          label: "شماره ملی شما",
          type: "input",
          placeholder: "لطفا شماره ملی خود را وارد کنید",
          validations: [
            {
              required: true,
              message: "وارد کردن شماره ملی الزامی است.",
            },
            {
              rules: [
                {
                  operator: "regex",
                  value: "\\d{10}",
                  message: "لطفا شماره ملی را به درستی وارد کنید",
                },
              ],
            },
          ],
        },
      },
      actionButtons: [
        {
          label: "ارسال فرم",
          loadingLabel: "در حال ارسال...",
          submitterKey: "SUBMIT",
          type: "submit",
          validateFields: "SECTION",
          className: "w-52",
        },
      ],
    },
    {
        hasBackground:true ,
      showHeader:true,
      arrayName: "accountBanksItems",
      isArray: true,
      title: "لیست حساب های بانکی",
      subTitle:
        "مشتری گرامی لطفا لیست حساب های بانکی خود را در فرم زیر وارد کنید",
      fields: {
        bank_id: {
          // resetErrorFields: ["account_type", "account_number", "iban_number"],
          // resetValueFields: ["account_type", "account_number", "iban_number"],
          label: "نام بانک",
          type: "select",
          options: [
            { label: "بانک ملی", value: "1" },
            { label: "بانک ملت", value: "2" },
            { label: "بانک سامان", value: "3" },
            { label: "بانک رسالت", value: "4" },
            { label: "بانک آگاه", value: "5" },
          ],
          validations: [
            {
              required: true,
              message: "وارد کردن نام بانک الزامی است.",
            },
          ],
        },
        account_type: {
          label: "نوع حساب را مشخص کنید",
          type: "select",
          options: [
            { label: "جاری", value: "1" },
            { label: "قرض الحسنه", value: "2" },
          ],
          validations: [
            {
              required: true,
              message: "وارد کردن نوع حساب الزامی است.",
            },
          ],
        },
        account_number: {
          label: "شماره حساب را وارد کنید",
          type: "input",
          placeholder: "لطفا شماره حساب را وارد کنید",
          validations: [
            {
              required: true,
              message: "وارد کردن شماره حساب الزامی است.",
            },
            {
              rules: [
                {
                  operator: "length",
                  value: 12,
                  message: "شماره حساب وارد شده صحیح نیست.",
                },
              ],
            },
          ],
        },
        iban_number: {
          label: "شماره شبای حساب خود را وارد کنید",
          type: "input",
          cols: 12,
          labelCols: 6,
          inputCols: 6,
          placeholder: "لطفا شماره شبای حساب خود را وارد کنید",
          validations: [
            {
              required: true,
              message: "وارد کردن شماره شبا الزامی است.",
            },
            {
              rules: [
                {
                  operator: "regex",
                  value: "^IR\\d{24}$",
                  message: "فرمت شما شبا صحیح نمی باشد.",
                },
              ],
            },
          ],
        },
      },
      actionButtons: [
        {
          label: "ارسال فرم",
          loadingLabel: "در حال ارسال...",
          submitterKey: "SUBMIT",
          type: "submit",
          validateFields: "SECTION",
          className: "w-52",
        },
      ],
    },
  ],
  formPath: "",
  formIndex: 1,
  globalValidation: [],
  actionButtons: [
    {
      label: "تایید و مرحله بعد",
      loadingLabel: "در حال ثبت فرم...",
      submitterKey: "SUBMIT",
      type: "submit",
      validateFields: "ALL",
      className: "w-52",
    },
    {
      label: "پاک کردن فرم",
      submitterKey: "SUBMIT",
      type: "reset",
      className: "w-52",
    },
  ],
};

const fakeApiCall = async ({
  delay,
  payload,
}: {
  delay: number;
  payload: unknown;
}) => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });

  return {
    ok: true,
    payload,
  };
};
