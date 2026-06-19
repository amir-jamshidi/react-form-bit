import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import type { IOption } from "../../types";
import FieldMessage from "./FieldMessage";
import Spinner from "./Spinner";
import type { UIControlBaseProps } from "./types";

type SelectChangeEvent = {
  target: {
    name?: string;
    value: string;
  };
};

export interface SelectProps extends UIControlBaseProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  emptyMessage?: ReactNode;
  options?: IOption[];
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onChange?: (event: SelectChangeEvent) => void;
  onValueChange?: (value: string) => void;
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 20 20"
    fill="none"
    className={cn("rfb-ui-select__icon", open && "is-open")}
  >
    <path
      d="m5 7.5 5 5 5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Select = ({
  className,
  size = "md",
  variant = "default",
  validationState = "default",
  error,
  hint,
  loading,
  disabled,
  options = [],
  placeholder = "Select an option",
  emptyMessage = "No options available",
  id,
  name,
  value,
  defaultValue = "",
  required,
  onBlur,
  onChange,
  onValueChange,
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const messageId = `${selectId}-message`;
  const listboxId = `${selectId}-listbox`;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const state =
    error && validationState === "default" ? "error" : validationState;

  const selectedValue = isControlled ? value : internalValue;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue]
  );

  const enabledOptions = options;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const selectedIndex = enabledOptions.findIndex(
      (option) => option.value === selectedValue
    );
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [enabledOptions, open, selectedValue]);

  const emitChange = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    });
  };

  const commitSelection = (nextValue: string) => {
    emitChange(nextValue);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const moveActive = (direction: 1 | -1) => {
    if (enabledOptions.length === 0) return;

    setActiveIndex((prev) => {
      const baseIndex = prev < 0 ? 0 : prev;
      return (baseIndex + direction + enabledOptions.length) % enabledOptions.length;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          moveActive(1);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          moveActive(-1);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (activeIndex >= 0 && enabledOptions[activeIndex]) {
          commitSelection(enabledOptions[activeIndex].value);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn("rfb-ui-field", className)}>
      <input
        type="hidden"
        name={name}
        value={selectedValue || ""}
        required={required}
      />

      <div className="rfb-ui-select-root">
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-activedescendant={
            open && activeIndex >= 0 ? `${selectId}-option-${activeIndex}` : undefined
          }
          aria-invalid={state === "error" || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            "rfb-ui-control-shell rfb-ui-select-trigger",
            `rfb-ui-control-shell--${size}`,
            `rfb-ui-control-shell--${variant}`,
            `is-${state}`,
            open && "is-open",
            (disabled || loading) && "is-disabled"
          )}
          disabled={disabled || loading}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
        >
          <span
            className={cn(
              "rfb-ui-select__value",
              !selectedOption && "is-placeholder"
            )}
          >
            {selectedOption?.label || placeholder}
          </span>
          <span className="rfb-ui-control__adornment">
            {loading ? <Spinner /> : <Chevron open={open} />}
          </span>
        </button>

        {open && (
          <div className="rfb-ui-select-menu-wrap">
            <div
              id={listboxId}
              role="listbox"
              aria-labelledby={selectId}
              className="rfb-ui-select-menu"
            >
              {enabledOptions.length === 0 ? (
                <div className="rfb-ui-select-menu__empty">{emptyMessage}</div>
              ) : (
                enabledOptions.map((option, index) => {
                  const isSelected = option.value === selectedValue;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={option.value}
                      id={`${selectId}-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "rfb-ui-select-option",
                        isActive && "is-active",
                        isSelected && "is-selected"
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commitSelection(option.value)}
                    >
                      <span className="rfb-ui-select-option__label">
                        {option.label}
                      </span>
                      {isSelected && (
                        <span
                          aria-hidden="true"
                          className="rfb-ui-select-option__check"
                        >
                          <svg viewBox="0 0 16 16" fill="none">
                            <path
                              d="M3 8.5 6.2 11.5 13 4.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
};

export default Select;
