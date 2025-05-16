"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";
import FinanceTips from "./FinanceTips";
import OTPInputForm from "./OTPInput";

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

const UserAuthForm = () => {
  const router = useRouter();
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({ resolver: zodResolver(signUpSchema) });

  const validateEmail = () => {
    try {
      signUpSchema.pick({ email: true }).parse(form.getValues());
      return true;
    } catch (error) {
      return false;
    }
  };

  async function handleSendOTP(e: any) {
    e.preventDefault();
    if (!validateEmail()) {
      form.setError("email", { message: "Please enter a valid email address" });
      return;
    }
    setSendingOTP(true);

    try {
      // await sendOTP(form.getValues("email"));
      setOtpSent(true);
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        form.setError("email", { message: error.response.data.message });
      }
    } finally {
      setSendingOTP(false);
    }
  }

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    if (!isEmailVerified) {
      toast.error("Please verify your email", { duration: 4000 });
      return;
    }

    try {
      /*
      const response: any = await signUp(data);

      setCookie("token", response.data.token, { maxAge: 30 * 24 * 60 * 60 });
      if (response.data.companyId) {
        setCookie("companyId", response.data.companyId, { maxAge: 30 * 24 * 60 * 60 });
        if (getCookie("errorId")) {
          router.push(`/alerts?errorId=${getCookie("errorId")}`);
          deleteCookie("errorId");
        } else if (getCookie("reportId")) {
          if (getCookie("showExcel")) {
            router.push(`/report/${getCookie("reportId")}?showExcel=true`);
          } else {
            router.push(`/report/${getCookie("reportId")}`);
          }
          deleteCookie("showExcel");
          deleteCookie("reportId");
        } else {
          router.push("/");
        }
      } else {
        router.push("/company/create");
      }
        */

      toast.success("Sign up successful");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        form.setError("email", { message: error.response.data.message });
      } else {
        toast.error(error.message);
      }
    }
  };
  return (
    <div className="flex flex-col gap-5 md:col-span-2 w-full max-w-3xl mx-auto px-8 items-center justify-center">
      <div className="flex flex-col items-center gap-1 mb-3">
        <h2 className="mt-4 text-2xl font-bold tracking-wide text-gray-900 text-center">
          Welcome to
          <br /> <span className="text-[#E9A319]">Wallet Tracker</span>
        </h2>
        {/* <p className="text-sm text-[#A86523] font-medium italic mt-1 animate-fade-in text-center relative">From Spending to Saving—Master It All.</p> */}
        <FinanceTips />
      </div>

      <Form {...form}>
        <form action="" className="flex flex-col gap-4 items-center w-full" onSubmit={form.handleSubmit(handleSignUp)}>
          <FormField
            control={form.control}
            name={"email"}
            render={({ field }) => (
              <FormItem className={cn("w-full  flex flex-col justify-between ")}>
                <div className="flex gap-2 justify-between">
                  <FormLabel className="text-sm font-medium text-black ">
                    {"Email"}
                    {<span className="text-destructive">*</span>}
                  </FormLabel>
                </div>
                <FormControl className="self-end">
                  <Input
                    type={"email"}
                    placeholder={"name@company.com"}
                    {...field}
                    value={field.value || ""}
                    className="text-sm border border-gray-300 placeholder:text-muted-foreground bg-white"
                    onChange={(e) => {
                      e.preventDefault();
                      // clear the email error message
                      form.clearErrors("email");
                      field.onChange(e.target.value);
                      setIsEmailVerified(false);
                      setOtpSent(false);

                      if (!(e.target.value.length > 0)) {
                        setShowPassword(false);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {otpSent && !isEmailVerified && (
            <OTPInputForm email={form.getValues("email")} isEmailVerified={isEmailVerified} setIsEmailVerified={setIsEmailVerified} />
          )}

          <Button
            onClick={handleSendOTP}
            className="cursor-pointer w-full bg-[#E9A319] text-white hover:bg-[#E9A319] hover:shadow-lg transition-all duration-300">
            {sendingOTP ? "Sending OTP..." : otpSent ? "Verify & Continue" : "Send OTP"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UserAuthForm;
