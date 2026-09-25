import React from "react";
import { Control } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

import { Input } from "./ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "./ui/radio-group";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

/* =========================================================
   CUSTOM INPUT
========================================================= */

interface InputProps {
  type:
    | "input"
    | "select"
    | "checkbox"
    | "switch"
    | "radio"
    | "textarea";

  /*
   * Keep the reusable component boundary broad.
   *
   * The actual form remains strongly typed in the component
   * that calls CustomInput.
   */
  control: any,

  /*
   * FormField ultimately receives a string field name.
   * Using string here avoids the Control/Path generic variance
   * problem between this reusable component and FormField.
   */
  name: string;

  label?: string;
  placeholder?: string;

  inputType?: "text" | "email" | "password" | "date";

  selectList?: {
    label: string;
    value: string;
  }[];

  defaultValue?: string;
}

interface RenderInputProps {
  field: any;
  props: InputProps;
}

const RenderInput = ({
  field,
  props,
}: RenderInputProps) => {
  switch (props.type) {
    /* =====================================================
       TEXT / EMAIL / PASSWORD / DATE INPUT
    ===================================================== */

    case "input":
      return (
        <FormControl>
          <Input
            type={props.inputType}
            placeholder={props.placeholder}
            {...field}
          />
        </FormControl>
      );

    /* =====================================================
       SELECT
    ===================================================== */

    case "select":
      return (
        <Select
          items={props.selectList}
          onValueChange={field.onChange}
          value={field.value ?? ""}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue
                placeholder={props.placeholder}
              />
            </SelectTrigger>
          </FormControl>

          <SelectContent>
            {props.selectList?.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    /* =====================================================
       CHECKBOX
    ===================================================== */

    case "checkbox":
      return (
        <div className="items-top flex space-x-2">
          <Checkbox
            id={props.name}
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => {
              field.onChange(checked === true);
            }}
          />

          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor={props.name}
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {props.label}
            </label>

            {props.placeholder && (
              <p className="text-sm text-muted-foreground">
                {props.placeholder}
              </p>
            )}
          </div>
        </div>
      );

    /* =====================================================
       RADIO
    ===================================================== */

    case "radio":
      return (
        <div className="w-full">
          <FormLabel className="mb-3 block">
            {props.label}
          </FormLabel>

          <RadioGroup
            value={String(field.value ?? "")}
            onValueChange={field.onChange}
            className="flex w-full gap-4"
          >
            {props.selectList?.map((item) => {
              const isSelected =
                field.value === item.value;

              return (
                <div
                  key={item.value}
                  className="flex w-full"
                >
                  <RadioGroupItem
                    value={item.value}
                    id={`${props.name}-${item.value}`}
                    className="peer sr-only"
                  />

                  <Label
                    htmlFor={`${props.name}-${item.value}`}
                    className={`flex w-full cursor-pointer items-center justify-center rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 bg-white text-black hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      );

    /* =====================================================
       TEXTAREA
    ===================================================== */

    case "textarea":
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
          />
        </FormControl>
      );

    /* =====================================================
       SWITCH
    ===================================================== */

    case "switch":
      return (
        <FormControl>
          <Switch
            checked={Boolean(field.value)}
            onCheckedChange={(checked) => {
              field.onChange(checked);
            }}
          />
        </FormControl>
      );

    default:
      return null;
  }
};

/* =========================================================
   CUSTOM INPUT COMPONENT
========================================================= */

export const CustomInput = (
  props: InputProps
) => {
  const {
    name,
    label,
    control,
    type,
  } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {type !== "radio" &&
            type !== "checkbox" && (
              <FormLabel>{label}</FormLabel>
            )}

          <RenderInput
            field={field}
            props={props}
          />

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

/* =========================================================
   WORK SCHEDULE
========================================================= */

type Day = {
  day: string;
  start_time?: string;
  close_time?: string;
};

interface SwitchProps {
  data: {
    label: string;
    value: string;
  }[];

  setWorkSchedule: React.Dispatch<
    React.SetStateAction<Day[]>
  >;
}

export const SwitchInput = ({
  data,
  setWorkSchedule,
}: SwitchProps) => {
  const handleChange = (
    day: string,
    field: "working" | "start_time" | "close_time",
    value: string
  ) => {
    setWorkSchedule((prevDays) => {
      const dayExists = prevDays.find(
        (item) => item.day === day
      );

      /* Existing day */
      if (dayExists) {
        return prevDays.map((item) => {
          if (item.day !== day) {
            return item;
          }

          if (field === "working") {
            return {
              ...item,
              start_time: "09:00",
              close_time: "17:00",
            };
          }

          return {
            ...item,
            [field]: value,
          };
        });
      }

      /* New working day */
      if (field === "working") {
        return [
          ...prevDays,
          {
            day,
            start_time: "09:00",
            close_time: "17:00",
          },
        ];
      }

      /* New day/time entry */
      return [
        ...prevDays,
        {
          day,
          [field]: value,
        },
      ];
    });
  };

  const handleSwitchChange = (
    day: string,
    checked: boolean
  ) => {
    if (checked) {
      handleChange(
        day,
        "working",
        "true"
      );
    } else {
      setWorkSchedule((prevDays) =>
        prevDays.filter(
          (item) => item.day !== day
        )
      );
    }
  };

  return (
    <div>
      {data?.map((el) => (
        <div
          key={el.value}
          className="w-full flex items-center space-y-3 border-t border-t-gray-200 py-3"
        >
          <Switch
            id={el.value}
            className="data-[state=checked]:bg-blue-600 peer"
            onCheckedChange={(checked) =>
              handleSwitchChange(
                el.value,
                checked
              )
            }
          />

          <Label
            htmlFor={el.value}
            className="w-20 capitalize"
          >
            {el.value}
          </Label>

          <Label className="text-gray-400 font-normal italic peer-data-[state=checked]:hidden pl-10">
            Not working on this day
          </Label>

          <div className="hidden peer-data-[state=checked]:flex items-center gap-2 pl-6">
            <Input
              name={`${el.label}.start_time`}
              type="time"
              defaultValue="09:00"
              onChange={(e) =>
                handleChange(
                  el.value,
                  "start_time",
                  e.target.value
                )
              }
            />

            <Input
              name={`${el.label}.close_time`}
              type="time"
              defaultValue="17:00"
              onChange={(e) =>
                handleChange(
                  el.value,
                  "close_time",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};