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

// export const formSchema: IFormSchema = {
//   title: "تست فرم آرایه ای",
//   subTitle: "تست فرم آرایه ای",
//   formIndex: 1,
//   actionButtons: [
//     {
//       label: "ارسال",
//       submitterKey: "SUBMIT",
//       type: "submit",
//       validateFields: "ALL",
//       className: "bg-[#6CA8A0] text-white px-10 rounded py-2",
//     },
//   ],
//   defaultValue: {
//     fullname: "33",
//     FavoritesList: [
//       {
//         description: "1 تست",
//       },
//       {
//         description: "",
//       },
//       {
//         description: "تست 3",
//         test: "تست 3",
//       },
//     ],
//   },
//   sections: [
//     {
//       title: "فرم غیر آرایه ای",
//       subTitle: "ساب تایتل فرم غیر آرایه ای",
//       fields: {
//         fullname: {
//           label: "نام کامل شما",
//           type: "input",
//           placeholder: "نام کامل خود را وارد کنید",
//           cols: 12,
//           validations: [
//             {
//               required: true,
//               message: "لطفا نام کامل خود را وارد کنید",
//             },
//             {
//               when: {},
//             },
//           ],
//         },
//       },
//     },
//     {
//       isArray: true,
//       arrayName: "FavoritesList",
//       title: "علاقه مندی ها",
//       subTitle: "زیر عنوان علاقه مندی ها",
//       fields: {
//         description: {
//           label: "توضیحات علاقه مندی را وارد کنید",
//           type: "input",
//           cols: 12,
//           placeholder: "شرح علاقه مندی",
//           validations: [
//             {
//               required: true,
//               message: "لطفا شرح را وارد کنید",
//             },
//           ],
//         },
//         test: {
//           label: "لطفا متن تست را وارد کنید",
//           type: "input",
//           cols: 12,
//           placeholder: "متن تستی را وارد کنید",
//           validations: [
//             {
//               required: true,
//               message: "لطفا متن تستی را وارد کنید",
//             },
//           ],
//         },
//       },
//     },
//   ],
// };

// export const formSchema: IFormSchema = {
//   title: "سابقه ایثارگری، رزمندگی و عضویت خانواده شهدا",
//   subTitle:
//     "داوطلب گرامی، در صورتی که سابفه ایثارگری، رزمندگی، و یا عضو خانواده شهید هستید در فرم زیر وارد نمایید.",
//   formIndex: 1,
//   formPath: "",
//   remoteDefaultValue: {
//     endPointUrl: "http://localhost:3000/messages",
//     path: "response.defaultValue",
//   },
//   defaultValue: {
//     is_isar_ya_khanevade_shahid: "1",
//     is_janbaz: "1",
//     janbaz_percent: "40",
//     moadel_daneshgah_2: "18/5",
//   },
//   globalValidation: [
//     {
//       customValidate: (formData) => {
//         return formData.is_isar_ya_khanevade_shahid === "2" ? "اشتباه" : "";
//       },
//     },
//     {
//       message: "ddd",
//       when: {
//         field: "is_janbaz",
//         operator: "equals",
//         value: "2",
//       },
//     },
//   ],
//   sections: [
//     {
//       title: "سابقه ایثارگری و خانواده شهدا",
//       subTitle:
//         "داوطلب گرامی، لطفا اطلاعات سابقه ایثار، زمندگی، خانواده شهید خود را در بخش زیر تکمیل فرمایید.",
//       id: "issar",
//       globalValidation: [
//         {
//           message: "JJJJ",
//           when: {
//             field: "is_janbaz",
//             operator: "equals",
//             value: "1",
//           },
//         },
//         {
//           message: "111",
//           when: {
//             field: "is_janbaz",
//             operator: "equals",
//             value: "2",
//           },
//         },
//       ],
//       fields: {
//         is_isar_ya_khanevade_shahid: {
//           resetValueFields: "SECTION",
//           resetErrorFields: "SECTION",
//           label: "آیا شما دارای سوابق ایثارگری یا خانواده شهدا هستید؟",
//           type: "select",
//           cols: 12,
//           labelCols: 9,
//           inputCols: 3,
//           placeholder: "نسبت",
//           options: [
//             {
//               options: [{ value: "1", label: "نه" }],
//               when: {
//                 field: "is_shaid",
//                 operator: "equals",
//                 value: "2",
//               },
//             },
//             {
//               options: [{ value: "ss", label: "dd" }],
//               when: {
//                 field: "is_shaid",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//             // { value: "1", label: "بله" },
//             // { value: "2", label: "خیر" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین ایثار یا خانواده شهدا الزامی می باشد.",
//             },
//             {
//               hide: true,
//               when: {
//                 logic: "OR",
//                 conditions: [],
//               },
//             },
//             {
//               rules: [],
//             },
//           ],
//         },

//         is_janbaz: {
//           label: "آیا جانباز هستید؟",
//           type: "select",
//           resetValueFields: "ALL",
//           remoteOptions: {
//             endPointUrl: "http://localhost:3000/messages",
//             path: "response.options",
//             labelNameKey: "onvan",
//             valueNameKey: "id",
//           },
//           options: [
//             { label: "بله", value: "1" },
//             { label: "خیر", value: "2" },
//           ],
//           validations: [
//             {},
//             {
//               required: true,
//               message: "تعیین وضعیت جانبازی الزامی می باشد.",
//               when: {
//                 field: "is_isar_ya_khanevade_shahid",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//         },
//         janbaz_percent: {
//           label: "درصد جانبازی",
//           type: "select",
//           options: [
//             { label: "10%", value: "10" },
//             { label: "20%", value: "20" },
//             { label: "30%", value: "30" },
//             { label: "40%", value: "40" },
//             { label: "50%", value: "50" },
//             { label: "60%", value: "60" },
//             { label: "70%", value: "70" },
//             { label: "80%", value: "80" },
//             { label: "90%", value: "90" },
//             { label: "100%", value: "100" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین درصد جانبازی الزامی می باشد.",
//               when: {
//                 field: "is_janbaz",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_janbaz",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_janbaz",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//         },

//         is_azade: {
//           label: "آیا آزاده هستید؟",
//           type: "select",
//           resetErrorFields: ["azade_modaat"],
//           options: [
//             { label: "بله", value: "1" },
//             { label: "خیر", value: "2" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین وضعیت آزاده الزامی می باشد.",
//               when: {
//                 field: "is_isar_ya_khanevade_shahid",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//         },
//         azade_modaat: {
//           label: "مدت استارت",
//           type: "select",
//           options: [
//             { label: "1 ماه", value: "1" },
//             { label: "2 ماه", value: "2" },
//             { label: "3 ماه", value: "3" },
//             { label: "4 ماه", value: "4" },
//             { label: "5 ماه", value: "5" },
//             { label: "6 ماه", value: "6" },
//             { label: "7 ماه", value: "7" },
//             { label: "8 ماه", value: "8" },
//             { label: "9 ماه", value: "9" },
//             { label: "10 ماه", value: "10" },
//             { label: "11 ماه", value: "11" },
//             { label: "12 ماه", value: "12" },
//           ],
//           remoteOptions: {
//             endPointUrl: "http://localhost:3000/messages?news=true",
//             path: "response.esarat",
//             labelNameKey: "onvan",
//             valueNameKey: "id",
//             dependencies: [
//               { field: "is_azade", key: "azade_vaziat" },
//               { field: "is_janbaz", key: "aya_janbaz_hastid" },
//             ],
//             sendMethod: "SEARCHPARAMS",
//           },
//           validations: [
//             {
//               required: true,
//               message: "تعیین مدت اسارت الزامی می باشد.",
//               when: {
//                 field: "is_azade",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//             {
//               hide: true,
//               when: {
//                 field: "is_razmande",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//             {
//               message: "خطااااا",
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_azade",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_azade",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//         },

//         is_razmande: {
//           label: "آیا رزمنده هستید؟",
//           type: "select",
//           options: [
//             { label: "بله", value: "1" },
//             { label: "خیر", value: "2" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین وضعیت رزمندگی الزامی می باشد.",
//               when: {
//                 field: "is_isar_ya_khanevade_shahid",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//           category: ["selects"],
//         },
//         razmande_modaat: {
//           label: "مدت خدمت",
//           type: "select",
//           resetValueWhenDisable: false,
//           options: [
//             { label: "1 ماه", value: "1" },
//             { label: "2 ماه", value: "2" },
//             { label: "3 ماه", value: "3" },
//             { label: "4 ماه", value: "4" },
//             { label: "5 ماه", value: "5" },
//             { label: "6 ماه", value: "6" },
//             { label: "7 ماه", value: "7" },
//             { label: "8 ماه", value: "8" },
//             { label: "9 ماه", value: "9" },
//             { label: "10 ماه", value: "10" },
//             { label: "11 ماه", value: "11" },
//             { label: "12 ماه", value: "12" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین مدت خدمت الزامی می باشد.",
//               when: {
//                 field: "is_razmande",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_razmande",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_razmande",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//           category: ["selects"],
//         },

//         is_khanevade_shahid: {
//           label: "آیا خانواده شهید هستید؟",
//           type: "select",
//           options: [
//             { label: "بله", value: "1" },
//             { label: "خیر", value: "2" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین وضعیت خانواده شهید الزامی می باشد.",
//               when: {
//                 field: "is_isar_ya_khanevade_shahid",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_isar_ya_khanevade_shahid",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//           category: ["selects"],
//         },
//         khanevade_shahid_nesbat: {
//           label: "نسبت با شهید",
//           type: "select",
//           options: [
//             { label: "پدر", value: "1" },
//             { label: "مادر", value: "2" },
//             { label: "همسر", value: "3" },
//             { label: "خواهر", value: "4" },
//             { label: "برادر", value: "5" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین نسبت با شهید الزامی می باشد.",
//               when: {
//                 field: "is_khanevade_shahid",
//                 operator: "equals",
//                 value: "1",
//               },
//             },
//           ],
//           isDisable: {
//             when: {
//               logic: "OR",
//               conditions: [
//                 {
//                   field: "is_khanevade_shahid",
//                   operator: "equals",
//                   value: "2",
//                 },
//                 {
//                   field: "is_khanevade_shahid",
//                   operator: "isFalsy",
//                 },
//               ],
//             },
//           },
//           category: ["selects"],
//         },
//         moadel_daneshgah: {
//           cols: 4,
//           labelCols: 12,
//           inputCols: 12,
//           type: "readonly",
//           label: "معدل دانشگاهی",
//         },
//         moadel_daneshgah_1: {
//           cols: 4,
//           labelCols: 12,
//           inputCols: 12,
//           type: "readonly",
//           label: "معدل دانشگاهی",
//         },
//         moadel_daneshgah_2: {
//           cols: 4,
//           labelCols: 12,
//           inputCols: 12,
//           type: "readonly",
//           label: "معدل دانشگاهی",
//         },
//       },
//       actionButtons: [
//         {
//           submitterKey: "SEND",
//           label: "استعلام",
//           type: "submit",
//           className:
//             "cursor-pointer rounded-lg disabled:bg-gray-400 font-bold text-lg border-2 border-[#B6D4CF] bg-[#6CA8A0] h-[40px] text-white w-[220px]",
//           validateFields: "SECTION",
//         },
//         {
//           submitterKey: "SEND",
//           label: "ریست فرم",
//           type: "reset",
//           className:
//             "cursor-pointer rounded-lg disabled:bg-gray-400 font-bold text-lg border-2 border-orange-300 bg-orange-600 h-[40px] text-white w-[220px]",
//           validateFields: "SECTION",
//         },
//       ],
//     },
//     {
//       id: "test2",
//       subTitle: "test",
//       title: "test",
//       globalValidation: [
//         {
//           message: "خطااا",
//           when: {
//             field: "is_shaid",
//             operator: "equals",
//             value: "2",
//           },
//         },
//       ],
//       fields: {
//         ["is_shaid"]: {
//           resetValueFields: ["$selects", "is_isar_ya_khanevade_shahid"],
//           resetErrorFields: ["$selects", "is_isar_ya_khanevade_shahid"],
//           label: "آیا دارای سوابق ایثارگری یا خانواده شهدا هستید؟",
//           type: "select",
//           cols: 12,
//           labelCols: 9,
//           inputCols: 3,
//           placeholder: "نسبت",
//           options: [
//             { value: "1", label: "بله" },
//             { value: "2", label: "خیر" },
//           ],
//           validations: [
//             {
//               required: true,
//               message: "تعیین ایثار یا خانواده شهدا الزامی می باشد.",
//             },
//           ],
//         },
//       },
//     },
//     {
//       title: "آرایه",
//       subTitle: "تست ارایه شدن فرم",
//       id: "arraySection",
//       isArray: true,
//       defaultItems: [
//         {
//           fullName: "امیر",
//         },
//         {
//           fullName: "امیر 1",
//         },
//         {
//           fullName: "امیر 2",
//         },
//       ],
//       arrayName: "personNamesDTO",
//       fields: {
//         fullName: {
//           label: "نام کامل",
//           type: "input",
//           placeholder: "نام کامل",
//         },
//       },
//     },
//   ],
//   actionButtons: [
//     {
//       label: "مرحله بعد",
//       className:
//         "cursor-pointer rounded-lg disabled:bg-gray-400 font-bold text-lg border-2 border-[#B6D4CF] bg-[#6CA8A0] h-[40px] text-white w-[220px]",
//       type: "submit",
//       validateFields: "ALL",
//       submitterKey: "RESET",
//     },
//     {
//       label: "ریست فرم",
//       className:
//         "cursor-pointer rounded-lg disabled:bg-gray-400 font-bold text-lg border-2 border-red-300 bg-red-600 h-[40px] text-white w-[220px]",
//       type: "reset",
//       validateFields: "ALL",
//       submitterKey: "SUBMIT",
//     },
//   ],
// };
