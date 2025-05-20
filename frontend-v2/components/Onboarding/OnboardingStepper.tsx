"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import onboardUser from "@/config/api/axios/Onboarding/onboard";
import { useRouter } from "next/navigation";

// Enum for currency options
export enum Currency {
  USD = "USD",
  EUR = "EUR",
  INR = "INR",
  GBP = "GBP",
  JPY = "JPY",
  AUD = "AUD",
  CAD = "CAD",
  CNY = "CNY",
}

type FormValues = {
  currency: Currency;
  bankName: string;
  balance: number;
};

const OnboardingStepper = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const form = useForm<FormValues>({
    defaultValues: {
      currency: undefined,
      bankName: "",
      balance: 0,
    },
  });

  const nextStep = () => {
    if (step === 1) {
      form.trigger("currency").then((valid) => {
        if (valid) {
          setStep(2);
        }
      });
    } else if (step === 2) {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: FormValues) => {
    console.log("Submitting onboarding data:", {
      ...data,
      type: "bank",
    });

    try {
      const res = await onboardUser({
        ...data,
        type: "bank",
      });
      console.log("Onboarding response:", res);
      // Redirect to dashboard or another page after successful onboarding
      router.push("/home");
    } catch (error) {
      console.error("Error during onboarding:", error);
    }
  };

  return (
    <>
      <div className="absolute top-2 left-2 h-[24px] flex items-center justify-center mt-2 bg-brand-light rounded-full text-brand-dark font-bold text-sm px-4 py-1">
        {step}/2
      </div>
      <div className="flex flex-col gap-6 w-full mx-auto px-4 sm:px-6 md:px-8 items-center justify-center">
        <div className="flex flex-col items-center gap-2 mb-4 text-center">
          <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-gray-900">
            {step === 1 ? "Select Currency" : "Account Details"}
          </h2>
          <p className="text-sm text-[#A86523] font-medium italic text-center">
            {step === 1
              ? "Choose your main transaction currency. This sets how balances and conversions are displayed in your wallet."
              : "Enter your bank name and account details to link where funds will be added and referenced."}
          </p>
        </div>

        <Form {...form}>
          <form className="min-w-[90%] mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
            {step === 1 && (
              <FormField
                control={form.control}
                name="currency"
                rules={{ required: "Currency is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Choose Currency <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="min-w-[300px]">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Currencies</SelectLabel>
                            {Object.values(Currency).map((curr) => (
                              <SelectItem key={curr} value={curr}>
                                {curr}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="bankName"
                  rules={{ required: "Bank Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="balance"
                  rules={{
                    required: "Balance is required",
                    min: { value: 1, message: "Balance must be positive" },
                  }}
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Balance</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <Button type="button" onClick={prevStep} className="bg-gray-300 text-gray-700 hover:bg-gray-400 cursor-pointer">
                  Previous
                </Button>
              )}
              <Button type="button" onClick={nextStep} className="bg-brand text-white">
                {step === 2 ? "Finish" : "Next"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default OnboardingStepper;
