# React Bit Form

> An ultra-powerful, zero-dependency form generator for building dynamic and complex forms in React

## Overview

**React Bit Form** is a lightweight yet incredibly powerful form generation library built with pure React—no external dependencies for validation or form management. Whether you're building simple contact forms or managing enterprise-level multi-section forms with complex interdependencies, React Bit Form handles it all with elegance and efficiency.

## Why React Bit Form?

Most form libraries force you to choose between simplicity and power. React Bit Form gives you both. Built from the ground up to handle the most complex form scenarios while remaining intuitive for everyday use cases.

### The Power of Pure React

- **Zero Dependencies**: Built entirely with vanilla React—no bloated validation libraries or form management packages
- **Lightweight**: Minimal bundle size without compromising on features
- **Framework Agnostic Styling**: Use Tailwind, CSS-in-JS, or any styling solution you prefer

## Key Features

### 🎯 Intelligent Validation Engine

At the heart of React Bit Form is the **validatorEngine**—a sophisticated internal engine that handles professional-grade validations without writing a single line of validation code. Set up complex validation rules declaratively and let the engine do the heavy lifting.

### 🔗 Advanced Field Relationships

Create complex interdependencies between fields with ease:

- **Conditional Resets**: Automatically reset field values or errors based on other field changes
- **Dynamic Visibility**: Show/hide fields based on form state
- **Conditional Enabling**: Enable/disable fields dynamically
- **Cross-Field Validation**: Validate fields based on relationships with other fields

### 📋 Multi-Section Forms

Build complex forms with multiple sections, each with its own logic:

- Independent section validation
- Section-specific submit buttons
- Section-level error handling
- Granular control over which fields to validate on submission

### 🎨 Complete Styling Freedom

No opinionated styles—bring your own design:

- Full control over form appearance
- Seamless Tailwind CSS integration
- Custom component rendering
- Responsive design support

### ⚙️ Dynamic Data Management

- **Default Values**: Pre-populate forms with initial data
- **Auto-Fetch**: Configure forms to automatically fetch initial values from API endpoints
- **Conditional Options**: Dynamically populate select/dropdown options based on other field values
- **API-Driven Options**: Fetch field options from endpoints with dynamic query parameters
- **Option Filtering**: Filter available options based on form state

### 🎯 Flexible Validation Control

Fine-grained control over what gets validated and when:

- Choose which fields to validate on submission
- Skip validation for specific fields
- Set errors on forms, sections, or individual fields
- Global error handling

### 🚀 Zero-Code Form Building

The ultimate developer experience:

- **JSON-Driven**: Entire forms defined by JSON configuration
- **Backend-Ready**: JSON can come from anywhere—API, database, config files
- **Visual Builder**: Includes a drag-and-drop UI builder for creating forms without writing JSON
- **Rapid Development**: Build complex forms in minutes, not hours

## Perfect For

- Multi-step wizards with complex validation
- Admin panels with dynamic form requirements
- Enterprise applications with intricate business logic
- Forms that need to adapt based on user input
- Any scenario where form fields have complex relationships

## Quick Example

```javascript
// Coming soon in the next section
```

---

**Ready to revolutionize your form development?** Let's get started with installation and basic usage.

# Schema Documentation

React Bit Form uses a powerful JSON-based schema system to define your forms. This declarative approach means you can build complex, dynamic forms without writing any form logic code.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Schema Structure Overview](#schema-structure-overview)
3. [Form Level Properties](#form-level-properties)
4. [Section Configuration](#section-configuration)
5. [Field Configuration](#field-configuration)
6. [Validation System](#validation-system)
7. [Conditional Logic](#conditional-logic)
8. [Field Relationships](#field-relationships)
9. [Remote Data Fetching](#remote-data-fetching)
10. [Action Buttons](#action-buttons)

---

## Basic Usage

```tsx
import { Form } from 'react-bit-form';

const MyForm = () => {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <Form 
      formSchema={formSchema} 
      onSubmit={handleSubmit}
    />
  );
};
```

---

## Schema Structure Overview

Every form schema follows this basic structure:

```typescript
{
  title: string;              // Form title
  subTitle?: string;          // Form subtitle
  formIndex: number;          // Form identifier
  formPath: string;           // Form path (can be empty)
  defaultValue?: object;      // Default values for fields
  remoteDefaultValue?: {      // Fetch default values from API
    endPointUrl: string;
    path: string;
  };
  globalValidation?: array;   // Form-level validations
  sections: array;            // Form sections (required)
  actionButtons?: array;      // Form-level action buttons
}
```

---

## Form Level Properties

### Basic Information

```typescript
{
  title: "Customer Registration Form",
  subTitle: "Please fill in your information below",
  formIndex: 1,
  formPath: ""
}
```

### Default Values

You can provide default values in two ways:

**Static Default Values:**
```typescript
{
  defaultValue: {
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com"
  }
}
```

**Remote Default Values (Auto-fetch from API):**
```typescript
{
  remoteDefaultValue: {
    endPointUrl: "https://api.example.com/user/123",
    path: "response.data"  // JSONPath to extract data
  }
}
```

### Global Validation

Apply validations across the entire form:

```typescript
{
  globalValidation: [
    {
      message: "Error message here",
      when: {
        field: "fieldName",
        operator: "equals",
        value: "someValue"
      }
    },
    {
      customValidate: (formData) => {
        // Custom validation logic
        return formData.age < 18 ? "Must be 18 or older" : "";
      }
    }
  ]
}
```

---

## Section Configuration

Forms are divided into sections. Each section can have its own fields, validation logic, and submit buttons.

### Basic Section Structure

```typescript
{
  sections: [
    {
      title: "Personal Information",
      subTitle: "Enter your personal details",
      id?: "personal_info",           // Optional section ID
      globalValidation?: array,        // Section-level validations
      fields: {},                      // Section fields (required)
      actionButtons?: array            // Section-level buttons
    }
  ]
}
```

### Section-Level Global Validation

```typescript
{
  sections: [
    {
      title: "Account Setup",
      globalValidation: [
        {
          message: "Passwords must match",
          when: {
            field: "confirm_password",
            operator: "notEquals",
            value: "@password"  // Reference another field with @
          }
        }
      ],
      fields: { /* ... */ }
    }
  ]
}
```

---

## Field Configuration

Fields are the building blocks of your form. Each field has extensive configuration options.

### Basic Field Structure

```typescript
{
  fields: {
    fieldName: {
      label: string;              // Field label
      type: string;               // Field type (input, select, textarea, etc.)
      placeholder?: string;       // Placeholder text
      cols?: number;              // Column width (1-12, default: 12)
      labelCols?: number;         // Label column width
      inputCols?: number;         // Input column width
      options?: array;            // For select/radio/checkbox fields
      validations?: array;        // Field validations
      resetValueFields?: string | array;  // Fields to reset on change
      resetErrorFields?: string | array;  // Fields to clear errors on change
      isDisable?: object;         // Conditional disable logic
      remoteOptions?: object;     // Fetch options from API
      resetValueWhenDisable?: boolean;  // Reset value when disabled
      category?: array;           // Field categories for grouping
    }
  }
}
```

### Field Types

Supported field types:
- `input` - Text input
- `select` - Dropdown select
- `textarea` - Multi-line text
- `checkbox` - Checkbox
- `radio` - Radio buttons
- `readonly` - Read-only display field
- `date` - Date picker
- `number` - Number input
- And more...

### Basic Field Example

```typescript
{
  firstname: {
    label: "First Name",
    type: "input",
    placeholder: "Enter your first name",
    cols: 6,  // Takes 6 out of 12 columns (half width)
    validations: [
      {
        required: true,
        message: "First name is required"
      }
    ]
  }
}
```

### Select Field with Options

```typescript
{
  country: {
    label: "Country",
    type: "select",
    options: [
      { label: "United States", value: "US" },
      { label: "Canada", value: "CA" },
      { label: "United Kingdom", value: "UK" }
    ],
    validations: [
      {
        required: true,
        message: "Please select a country"
      }
    ]
  }
}
```

### Conditional Options

Options can change based on other field values:

```typescript
{
  state: {
    label: "State/Province",
    type: "select",
    options: [
      {
        options: [
          { label: "California", value: "CA" },
          { label: "New York", value: "NY" }
        ],
        when: {
          field: "country",
          operator: "equals",
          value: "US"
        }
      },
      {
        options: [
          { label: "Ontario", value: "ON" },
          { label: "Quebec", value: "QC" }
        ],
        when: {
          field: "country",
          operator: "equals",
          value: "CA"
        }
      }
    ]
  }
}
```

### Layout Control

Control field layout with responsive columns:

```typescript
{
  email: {
    label: "Email Address",
    type: "input",
    cols: 12,        // Full width on mobile
    labelCols: 3,    // Label takes 3 columns
    inputCols: 9     // Input takes 9 columns
  }
}
```

---

## Validation System

React Bit Form comes with a powerful validation engine that supports a wide range of built-in operators.

### Validation Structure

```typescript
{
  validations: [
    {
      required?: boolean;
      message: string;
      when?: object;          // Conditional validation
      hide?: boolean;         // Hide field when condition met
      rules?: array;          // Validation rules
      customValidate?: function;  // Custom validation function
    }
  ]
}
```

### Required Field Validation

```typescript
{
  email: {
    label: "Email",
    type: "input",
    validations: [
      {
        required: true,
        message: "Email is required"
      }
    ]
  }
}
```

### Rule-Based Validation

Use powerful operators to validate field values:

```typescript
{
  password: {
    label: "Password",
    type: "input",
    validations: [
      {
        required: true,
        message: "Password is required"
      },
      {
        rules: [
          {
            operator: "minLength",
            value: 8,
            message: "Password must be at least 8 characters"
          },
          {
            operator: "regex",
            value: "^(?=.*[A-Z])(?=.*[0-9])",
            message: "Password must contain uppercase and number"
          }
        ]
      }
    ]
  }
}
```

### Available Validation Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `isNumber` | Check if value is a number | `{ operator: "isNumber" }` |
| `length` | Exact length match | `{ operator: "length", value: 10 }` |
| `equals` | Value equals specified value | `{ operator: "equals", value: "admin" }` |
| `notEquals` | Value not equals | `{ operator: "notEquals", value: "guest" }` |
| `contains` | String contains substring | `{ operator: "contains", value: "@" }` |
| `notContains` | String doesn't contain | `{ operator: "notContains", value: "test" }` |
| `startsWith` | String starts with | `{ operator: "startsWith", value: "https://" }` |
| `endsWith` | String ends with | `{ operator: "endsWith", value: ".com" }` |
| `greaterThan` | Numeric greater than | `{ operator: "greaterThan", value: 18 }` |
| `lessThan` | Numeric less than | `{ operator: "lessThan", value: 100 }` |
| `greaterThanOrEqual` | Greater than or equal | `{ operator: "greaterThanOrEqual", value: 0 }` |
| `lessThanOrEqual` | Less than or equal | `{ operator: "lessThanOrEqual", value: 150 }` |
| `between` | Value between range | `{ operator: "between", value: [18, 65] }` |
| `regex` | Regular expression match | `{ operator: "regex", value: "^[A-Z]" }` |
| `minLength` | Minimum string length | `{ operator: "minLength", value: 3 }` |
| `maxLength` | Maximum string length | `{ operator: "maxLength", value: 50 }` |
| `isEmpty` | Check if empty | `{ operator: "isEmpty" }` |
| `isNotEmpty` | Check if not empty | `{ operator: "isNotEmpty" }` |
| `isInteger` | Check if integer | `{ operator: "isInteger" }` |
| `isFloat` | Check if float | `{ operator: "isFloat" }` |
| `isAlpha` | Only letters | `{ operator: "isAlpha" }` |
| `isAlphanumeric` | Letters and numbers only | `{ operator: "isAlphanumeric" }` |
| `isEmail` | Valid email format | `{ operator: "isEmail" }` |
| `isFalsy` | Check if falsy | `{ operator: "isFalsy" }` |
| `isURL` | Valid URL format | `{ operator: "isURL" }` |
| `isDate` | Valid date | `{ operator: "isDate" }` |
| `compareWithOffset` | Compare with offset | See advanced section |

### Advanced: Compare With Offset

For complex numeric comparisons with offsets:

```typescript
{
  rules: [
    {
      operator: "compareWithOffset",
      value: {
        operator: "minimumDifference",
        value: "@age",  // Reference another field
        offset: 5
      },
      message: "Must be at least 5 years older"
    }
  ]
}
```

Supported offset operators:
- `greaterThan`
- `lessThan`
- `equals`
- `greaterThanOrEqual`
- `lessThanOrEqual`
- `difference` - Exact difference
- `minimumDifference` - Minimum absolute difference
- `maximumDifference` - Maximum difference

### Custom Validation

Write your own validation logic:

```typescript
{
  validations: [
    {
      customValidate: (value, formData) => {
        if (formData.type === 'premium' && value < 100) {
          return "Premium users must enter at least 100";
        }
        return ""; // Empty string means valid
      }
    }
  ]
}
```

### Conditional Validation

Apply validations only when certain conditions are met:

```typescript
{
  company: {
    label: "Company Name",
    type: "input",
    validations: [
      {
        required: true,
        message: "Company name is required for business accounts",
        when: {
          field: "accountType",
          operator: "equals",
          value: "business"
        }
      }
    ]
  }
}
```

### Hide Field Based on Condition

```typescript
{
  validations: [
    {
      hide: true,
      when: {
        field: "userType",
        operator: "equals",
        value: "guest"
      }
    }
  ]
}
```

---

## Conditional Logic

React Bit Form provides powerful conditional logic capabilities for dynamic form behavior.

### When Condition Structure

```typescript
{
  when: {
    field: string;           // Field to check
    operator: string;        // Comparison operator
    value: any;             // Value to compare
    logic?: "AND" | "OR";   // For multiple conditions
    conditions?: array;      // Multiple conditions
  }
}
```

### Simple Condition

```typescript
{
  when: {
    field: "hasAccount",
    operator: "equals",
    value: "yes"
  }
}
```

### Multiple Conditions with OR Logic

```typescript
{
  isDisable: {
    when: {
      logic: "OR",
      conditions: [
        {
          field: "userType",
          operator: "equals",
          value: "guest"
        },
        {
          field: "isActive",
          operator: "isFalsy"
        }
      ]
    }
  }
}
```

### Multiple Conditions with AND Logic

```typescript
{
  when: {
    logic: "AND",
    conditions: [
      {
        field: "age",
        operator: "greaterThanOrEqual",
        value: 18
      },
      {
        field: "hasLicense",
        operator: "equals",
        value: "yes"
      }
    ]
  }
}
```

### Conditional Field Disable

Disable a field based on conditions:

```typescript
{
  discount: {
    label: "Discount Code",
    type: "input",
    isDisable: {
      when: {
        field: "membershipType",
        operator: "equals",
        value: "free"
      }
    },
    resetValueWhenDisable: true  // Clear value when disabled
  }
}
```

---

## Field Relationships

Define how fields interact and affect each other.

### Reset Value Fields

When a field changes, reset the value of other fields:

```typescript
{
  country: {
    label: "Country",
    type: "select",
    resetValueFields: ["state", "city"],  // Reset these fields
    options: [/* ... */]
  }
}
```

**Reset entire section:**
```typescript
{
  accountType: {
    label: "Account Type",
    type: "select",
    resetValueFields: "SECTION",  // Reset all fields in section
    options: [/* ... */]
  }
}
```

**Reset all form fields:**
```typescript
{
  startOver: {
    type: "checkbox",
    resetValueFields: "ALL"  // Reset entire form
  }
}
```

### Reset Error Fields

Clear validation errors when a field changes:

```typescript
{
  password: {
    label: "Password",
    type: "input",
    resetErrorFields: ["confirmPassword"]  // Clear errors from this field
  }
}
```

Options:
- Array of field names: `["field1", "field2"]`
- `"SECTION"` - Reset all errors in current section
- `"ALL"` - Reset all form errors

### Combined Reset Example

```typescript
{
  country: {
    label: "Select Country",
    type: "select",
    resetValueFields: ["state", "city", "zipCode"],
    resetErrorFields: ["state", "city"],
    options: [/* ... */]
  }
}
```

---

## Remote Data Fetching

Fetch options or default values from APIs dynamically.

### Remote Options

Fetch select options from an API:

```typescript
{
  category: {
    label: "Category",
    type: "select",
    remoteOptions: {
      endPointUrl: "https://api.example.com/categories",
      path: "data.categories",      // JSONPath to options array
      labelNameKey: "name",          // Field to use as label
      valueNameKey: "id"             // Field to use as value
    }
  }
}
```

### Remote Options with Dependencies

Options can depend on other field values:

```typescript
{
  city: {
    label: "City",
    type: "select",
    remoteOptions: {
      endPointUrl: "https://api.example.com/cities",
      path: "response.cities",
      labelNameKey: "cityName",
      valueNameKey: "cityId",
      dependencies: [
        { 
          field: "country",           // Watch this field
          key: "countryId"            // Send as this query param
        },
        { 
          field: "state", 
          key: "stateId" 
        }
      ],
      sendMethod: "SEARCHPARAMS"      // or "BODY" for POST
    }
  }
}
```

This will fetch: `https://api.example.com/cities?countryId=US&stateId=CA`

### Send Method Options

- `"SEARCHPARAMS"` - Send as URL query parameters (GET)
- `"BODY"` - Send as request body (POST)

---

## Action Buttons

Define submit, reset, and custom action buttons for forms and sections.

### Button Structure

```typescript
{
  actionButtons: [
    {
      label: string;              // Button text
      submitterKey: string;       // Unique identifier
      type: "submit" | "reset";   // Button type
      validateFields?: "ALL" | "SECTION" | array;  // What to validate
      className?: string;         // Button styling
    }
  ]
}
```

### Form-Level Buttons

Buttons at form level operate on entire form:

```typescript
{
  actionButtons: [
    {
      label: "Submit Form",
      submitterKey: "SUBMIT",
      type: "submit",
      validateFields: "ALL",  // Validate entire form
      className: "bg-blue-500 text-white px-4 py-2 rounded"
    },
    {
      label: "Clear Form",
      submitterKey: "RESET",
      type: "reset",
      className: "bg-gray-500 text-white px-4 py-2 rounded"
    }
  ]
}
```

### Section-Level Buttons

Buttons at section level operate only on that section:

```typescript
{
  sections: [
    {
      title: "Personal Info",
      fields: {/* ... */},
      actionButtons: [
        {
          label: "Save Section",
          submitterKey: "SAVE_PERSONAL",
          type: "submit",
          validateFields: "SECTION",  // Only validate this section
          className: "bg-green-500 text-white px-4 py-2 rounded"
        }
      ]
    }
  ]
}
```

### Selective Field Validation

Validate only specific fields on submit:

```typescript
{
  actionButtons: [
    {
      label: "Quick Save",
      submitterKey: "QUICK_SAVE",
      type: "submit",
      validateFields: ["email", "phone"],  // Only validate these
      className: "bg-yellow-500 text-white px-4 py-2 rounded"
    }
  ]
}
```

### Multiple Submit Buttons

You can have multiple submit buttons with different behaviors:

```typescript
{
  actionButtons: [
    {
      label: "Save Draft",
      submitterKey: "DRAFT",
      type: "submit",
      validateFields: [],  // No validation
      className: "bg-gray-500 text-white px-4 py-2 rounded"
    },
    {
      label: "Submit for Review",
      submitterKey: "REVIEW",
      type: "submit",
      validateFields: ["title", "description"],  // Partial validation
      className: "bg-blue-500 text-white px-4 py-2 rounded"
    },
    {
      label: "Publish",
      submitterKey: "PUBLISH",
      type: "submit",
      validateFields: "ALL",  // Full validation
      className: "bg-green-500 text-white px-4 py-2 rounded"
    }
  ]
}
```

### Handling Different Submitters

```tsx
const handleSubmit = (data, submitterKey) => {
  switch(submitterKey) {
    case 'DRAFT':
      saveDraft(data);
      break;
    case 'REVIEW':
      submitForReview(data);
      break;
    case 'PUBLISH':
      publishForm(data);
      break;
  }
};

<Form 
  formSchema={formSchema} 
  onSubmit={handleSubmit}
/>
```

---

## Complete Example

Here's a complete form schema showcasing various features:

```typescript
const registrationSchema = {
  title: "User Registration",
  subTitle: "Create your account",
  formIndex: 1,
  formPath: "",
  defaultValue: {
    accountType: "personal"
  },
  sections: [
    {
      title: "Account Information",
      fields: {
        accountType: {
          label: "Account Type",
          type: "select",
          resetValueFields: "SECTION",
          resetErrorFields: "SECTION",
          options: [
            { label: "Personal", value: "personal" },
            { label: "Business", value: "business" }
          ],
          validations: [
            {
              required: true,
              message: "Please select account type"
            }
          ]
        },
        email: {
          label: "Email Address",
          type: "input",
          placeholder: "john@example.com",
          validations: [
            {
              required: true,
              message: "Email is required"
            },
            {
              rules: [
                {
                  operator: "isEmail",
                  message: "Please enter a valid email"
                }
              ]
            }
          ]
        },
        companyName: {
          label: "Company Name",
          type: "input",
          placeholder: "Your company name",
          validations: [
            {
              required: true,
              message: "Company name is required for business accounts",
              when: {
                field: "accountType",
                operator: "equals",
                value: "business"
              }
            }
          ],
          isDisable: {
            when: {
              field: "accountType",
              operator: "equals",
              value: "personal"
            }
          }
        }
      },
      actionButtons: [
        {
          label: "Continue",
          submitterKey: "CONTINUE",
          type: "submit",
          validateFields: "SECTION",
          className: "bg-blue-500 text-white px-6 py-2 rounded"
        }
      ]
    },
    {
      title: "Personal Details",
      fields: {
        firstName: {
          label: "First Name",
          type: "input",
          cols: 6,
          validations: [
            {
              required: true,
              message: "First name is required"
            },
            {
              rules: [
                {
                  operator: "minLength",
                  value: 2,
                  message: "Name must be at least 2 characters"
                }
              ]
            }
          ]
        },
        lastName: {
          label: "Last Name",
          type: "input",
          cols: 6,
          validations: [
            {
              required: true,
              message: "Last name is required"
            }
          ]
        },
        country: {
          label: "Country",
          type: "select",
          resetValueFields: ["state", "city"],
          remoteOptions: {
            endPointUrl: "https://api.example.com/countries",
            path: "data",
            labelNameKey: "name",
            valueNameKey: "code"
          },
          validations: [
            {
              required: true,
              message: "Please select a country"
            }
          ]
        },
        state: {
          label: "State",
          type: "select",
          remoteOptions: {
            endPointUrl: "https://api.example.com/states",
            path: "data",
            labelNameKey: "name",
            valueNameKey: "code",
            dependencies: [
              { field: "country", key: "countryCode" }
            ],
            sendMethod: "SEARCHPARAMS"
          },
          validations: [
            {
              required: true,
              message: "Please select a state"
            }
          ],
          isDisable: {
            when: {
              field: "country",
              operator: "isFalsy"
            }
          }
        }
      ]
    }
  ],
  actionButtons: [
    {
      label: "Register",
      submitterKey: "SUBMIT",
      type: "submit",
      validateFields: "ALL",
      className: "bg-green-500 text-white px-6 py-2 rounded"
    },
    {
      label: "Reset Form",
      submitterKey: "RESET",
      type: "reset",
      className: "bg-red-500 text-white px-6 py-2 rounded"
    }
  ]
};
```

---

## Next Steps

Now that you understand the schema structure, you're ready to:

- Build your first form with React Bit Form
- Explore advanced features like dynamic form arrays
- Add custom validation operators
- Integrate with your backend APIs
- Use the visual form builder for rapid development

For more examples and advanced use cases, check out our [Examples](#) section.