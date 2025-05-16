"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import requestOTP from "@/config/api/axios/Auth/requestOTP";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import OtpInput from "react-otp-input";
import { toast } from "sonner";
import { z } from "zod";
import FinanceTips from "./FinanceTips";
import verifyEmail from "@/config/api/axios/Auth/verifyEmail";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "Please enter a valid 6-digit OTP"),
});

const UserAuthForm = () => {
  const router = useRouter();
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [enableResend, setEnableResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [loadingResend, setLoadingResend] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
  });

  const validateEmail = () => {
    try {
      signUpSchema.pick({ email: true }).parse(form.getValues());
      return true;
    } catch {
      return false;
    }
  };

  async function handleSendOTP(e: any) {
    // clear the existing code
    form.setValue("code", "");
    e.preventDefault();
    if (!validateEmail()) {
      form.setError("email", {
        message: "Please enter a valid email address",
      });
      return;
    }

    setSendingOTP(true);
    try {
      await requestOTP(form.getValues("email"));
      setOtpSent(true);
      setEnableResend(false);
      setResendTimer(30);
    } catch (error: any) {
      if (error.response?.status === 400) {
        form.setError("email", { message: error.response.data.message });
      }
    } finally {
      setSendingOTP(false);
    }
  }

  useEffect(() => {
    if (otpSent && !enableResend && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setEnableResend(true);
    }
  }, [resendTimer, otpSent, enableResend]);

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    setSendingOTP(true);
    try {
      const res = (await verifyEmail({
        email: data.email,
        code: data.code,
      })) as {
        onboardingRequired: boolean;
      };

      if (res?.onboardingRequired) {
        toast.success("Email verified successfully");
        router.push("/onboarding");
      } else {
        toast.success("Email verified successfully");
        router.push("/dashboard");
      }
      setSendingOTP(false);
    } catch (error: any) {
      console.error(error, "Error in email verification");
      setSendingOTP(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full mx-auto px-4 sm:px-6 md:px-8 items-center justify-center">
      <div className="flex flex-col items-center gap-2 mb-4 text-center">
        <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-gray-900">
          Welcome to
          <br />
          <span className="text-brand">Wallet Tracker</span>
        </h2>
        <FinanceTips />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="flex flex-col gap-4 items-center w-full">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Email<span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@company.com"
                    className="text-sm"
                    onChange={(e) => {
                      form.clearErrors("email");
                      field.onChange(e.target.value);
                      setOtpSent(false);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* OTP Field */}
          {otpSent && (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    OTP<span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <OtpInput
                        renderSeparator={<span style={{ width: "2px" }}></span>}
                        value={field.value || ""}
                        onChange={(val) => {
                          form.clearErrors("code");
                          field.onChange(val);
                        }}
                        numInputs={6}
                        shouldAutoFocus
                        inputStyle={{
                          border: "1px solid #f1f5f9",
                          borderRadius: "8px",
                          width: "40px",
                          height: "40px",
                          fontSize: "16px",
                          color: "#000",
                          fontWeight: "400",
                          caretColor: "blue",
                        }}
                        renderInput={(props) => <input {...props} />}
                      />
                    </div>
                  </FormControl>

                  <button
                    type="button"
                    className="text-sm text-primary cursor-pointer ml-auto mt-2 w-max"
                    onClick={handleSendOTP}
                    disabled={!enableResend}>
                    <p>
                      {enableResend ? (
                        loadingResend ? (
                          <span className="loading loading-spinner loading-sm">Sending OTP ...</span>
                        ) : (
                          <span>Resend OTP</span>
                        )
                      ) : (
                        <span className="flex gap-1 items-center">
                          Resend OTP in{" "}
                          <motion.span
                            key={resendTimer}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.2 }}
                            className="inline-block text-center font-bold">
                            {resendTimer}
                          </motion.span>{" "}
                          <span className="font-bold">seconds</span>
                        </span>
                      )}
                    </p>
                  </button>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Submit Button */}
          <Button
            onClick={(e) => {
              if (!otpSent) {
                handleSendOTP(e);
              } else {
                form.handleSubmit(handleSignUp)(e);
              }
              console.log(form.getValues());
              console.log(form.formState.errors);
            }}
            type="button"
            disabled={sendingOTP || (otpSent && form.getValues("code").length < 6)}
            className="w-full bg-brand text-white hover:shadow-lg cursor-pointer transition-all duration-200 ease-in-out">
            {sendingOTP ? "Sending OTP..." : otpSent ? "Verify & Continue" : "Send OTP"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UserAuthForm;
