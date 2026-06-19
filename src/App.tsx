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

const App = () => {
  const [theme, setTheme] = useState<FormTheme>("modern");
  const [previewInput, setPreviewInput] = useState("");
  const [previewTextarea, setPreviewTextarea] = useState("");
  const [previewSelect, setPreviewSelect] = useState("");
  const [previewChecked, setPreviewChecked] = useState(true);
  const [previewSwitch, setPreviewSwitch] = useState(false);
  const [previewRadio, setPreviewRadio] = useState("starter");

  const handleSubmit = ({
    formData,
    sectionIndex,
  }: {
    formData: any;
    sectionIndex?: number;
  }) => {
    console.log("run ....", formData, sectionIndex);
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-[1000px] mx-auto mb-6 flex items-center justify-between gap-3 flex-wrap">
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
