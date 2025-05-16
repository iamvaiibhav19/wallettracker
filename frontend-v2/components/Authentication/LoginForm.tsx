"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";
import OTPInputForm from "./OTPInput";

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignUpForm = () => {
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
      form.setError("email", { message: "Invalid email address" });
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
        <h2 className="mt-4 text-2xl font-bold tracking-wide text-gray-900 text-center">Welcome to adaapt.ai</h2>
        <p className="text-sm text-gray-500 text-center relative">
          Begin your journey towards digital transformation and operational excellence with just a{" "}
          <span className="relative font-bold text-black">
            few clicks
            <Image height={80} width={350} className="absolute right-0 -bottom-3 h-4 w-44 " src="/assets/loginpage-arrow.svg" alt="underscore icon" />
          </span>
        </p>
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
                  {isEmailVerified ? (
                    <p className="flex gap-1 items-center text-sm text-green-500">
                      verified <CheckCircleIcon className="w-4 h-4" />
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={!validateEmail() || sendingOTP}
                      className="text-sm font-medium text-primary hover:underline hover:underline-offset-2 disabled:cursor-not-allowed"
                      onClick={handleSendOTP}>
                      {sendingOTP ? "Sending OTP..." : "Send OTP"}
                    </button>
                  )}
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

          <FormField
            control={form.control}
            name={"password"}
            render={({ field }) => (
              <FormItem className={cn("w-full  flex flex-col justify-between ")}>
                <div className="flex gap-2 justify-between">
                  <FormLabel className="text-sm font-medium text-black ">
                    {"Password"}
                    {<span className="text-destructive">*</span>}
                  </FormLabel>
                </div>
                <div className="relative">
                  <FormControl className="self-end ">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={"Enter password"}
                      {...field}
                      value={field.value || ""}
                      className="text-sm border border-gray-300 placeholder:text-muted-foreground bg-white"
                      onChange={(e) => {
                        e.preventDefault();
                        field.onChange(e.target.value);
                        form.trigger("password");

                        if (!(e.target.value.length > 0)) {
                          setShowPassword(false);
                        }
                      }}
                    />
                  </FormControl>
                  {form.getValues("password") ? (
                    showPassword ? (
                      <EyeSlashIcon
                        className="w-4 h-4 absolute right-3 top-2.5 text-muted-foreground disabled:cursor-not-allowed"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeIcon
                        className="w-4 h-4 absolute right-3 top-2.5 text-muted-foreground disabled:cursor-not-allowed"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  ) : null}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            Let&apos;s Start Growth🚀
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login">
          <Button variant="link" className="px-1 hover:underline hover:underline-offset-2 disabled:cursor-not-allowed">
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;
