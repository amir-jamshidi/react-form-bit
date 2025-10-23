import { useForm } from "../FormProvider";
import { IFormSchema } from "../types";
import { cn } from "../utils/cn";
import ErrorMessage from "./ErrorMessage";
import FormDebug from "./FormDebug";
import FormHeader from "./FormHeader";
import FormSection from "./FormSection";

function Form() {
  const { handleSubmit, handleClearForm } = useForm();

  return (
    <div>
      <div className="max-w-[1000px] mx-auto mt-12">
        <ErrorMessage errorKey="form" />
      </div>
      <div className="max-w-[1000px] mx-auto bg-slate-900 border border-slate-700 rounded-2xl mt-2">
        <FormHeader formSchema={formSchema} />
        <form className="py-5 px-6">
          {formSchema.sections.map((section, i) => (
            <FormSection key={i} section={section} index={i} />
          ))}

          <div className="flex justify-center items-center mt-12 gap-x-2">
            {formSchema.actionButtons.map((actionBtn, idx) => (
              <button
                key={idx}
                onClick={(e) =>
                  actionBtn.type === "submit"
                    ? handleSubmit(e, actionBtn.validateFields || "ALL")
                    : handleClearForm()
                }
                type={actionBtn.type === "submit" ? "submit" : "button"}
                className={cn(actionBtn.className)}
              >
                {actionBtn.label}
              </button>
            ))}
          </div>
        </form>
      </div>
      <FormDebug />
    </div>
  );
}

export default Form;

export const formSchema: IFormSchema = {
  title: "فرم حساب های بانکی مشتری",
  subTitle: "لطفا اطلاعات حساب های بانکی خود را در فرم های زیر وارد کنید",
  sections: [
    {
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
          className:
            "bg-slate-700 w-52  text-white  cursor-pointer transition-all hover:bg-slate-800 rounded py-2",
        },
      ],
    },
    {
      arrayName: "accountBanksItems",
      // isArray: true,
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
          className:
            "bg-slate-700 w-52  text-white  cursor-pointer transition-all hover:bg-slate-800 rounded py-2",
        },
      ],
    },
    {
      arrayName: "usersList",
      isArray: true,
      title: "لیست حساب های بانکی",
      subTitle:
        "مشتری گرامی لطفا لیست حساب های بانکی خود را در فرم زیر وارد کنید",
      fields: {
        name: {
          parentArrayName: "usersList",
          label: "نام کاربر",
          placeholder: "نام کاربر",
          type: "text",
          validations: [
            {
              required: true,
              message: "وارد کردن نام اجباریه داداش",
            },
            {
              rules: [
                {
                  operator: "length",
                  value: 3,
                  message: "نام حداقل باید 3 کاراکتر باشه",
                },
              ],
            },
          ],
        },
        age: {
          parentArrayName: "usersList",
          label: "سن کاربر",
          placeholder: "سن کاربر",
          type: "text",
          validations: [
            {
              required: true,
              message: "وارد سن کاربر اجباریه داداش",
            },
          ],
        },
      },
      actionButtons: [
        {
          label: "اضافه کردن",
          submitterKey: "APPEND",
          type: "submit",
          validateFields: "SECTION",
          className:
            "bg-green-700 text-white w-52 cursor-pointer transition-all hover:bg-green-800 rounded py-2",
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
      className:
        "bg-slate-700 text-white w-52 cursor-pointer transition-all hover:bg-slate-800 rounded py-2",
    },
    {
      label: "پاک کردن فرم",
      submitterKey: "SUBMIT",
      type: "reset",
      className:
        "bg-rose-700 text-white w-52 cursor-pointer transition-all hover:bg-rose-800 rounded py-2",
    },
  ],
};
