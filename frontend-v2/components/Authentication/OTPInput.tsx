import { cn } from "@/lib/utils";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import OtpInput from "react-otp-input";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import requestOTP from "@/config/api/axios/Auth/requestOTP";

const OTPInputForm = ({
  email,
  isEmailVerified,
  setIsEmailVerified,
}: {
  email: string;
  isEmailVerified: boolean;
  setIsEmailVerified: (value: boolean) => void;
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [enableResend, setEnableResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (!enableResend && resendTimer > 0) {
      setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setEnableResend(true);
    }
  }, [resendTimer, enableResend]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // await verifyEmail(email, code);
      toast.success("Email verified successfully");
      setLoading(false);
      setIsEmailVerified(true);
    } catch (error: any) {
      toast.error(error.response.data.message);
      setLoading(false);
    }
  };

  const handleResendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingResend(true);
    if (email === null) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const data = await requestOTP(email);

      setLoadingResend(false);
      setEnableResend(false);
      setResendTimer(30);
    } catch (error) {
      setLoadingResend(false);
    }
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 100,
        scale: 0.3,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{ opacity: 0 }}
      className="md:mx-auto w-full ">
      {/* <div className="flex flex-col items-center gap-0">
        <Image height={40} width={150} className="h-10 w-auto" src="/brand/logo-color.svg" alt="Your Company" />
        <h2 className="mt-4 text-lg font-bold tracking-wide text-gray-900 text-center">Check Your Email</h2>
        <p className="text-sm text-gray-500 text-center">Please enter the OTP sent to your email</p>
      </div> */}
      <div className="transition-all duration-500">
        <label htmlFor="OTP" className="text-sm font-medium">
          OTP {<span className="text-destructive">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          <div>
            <OtpInput
              value={code}
              onChange={setCode}
              numInputs={6}
              renderSeparator={<span style={{ width: "2px" }}></span>}
              renderInput={(props) => <Input {...props} />}
              inputStyle={{
                border: "1px solid #f1f5f9",
                borderRadius: "8px",
                width: "48px",
                height: "48px",
                fontSize: "16px",
                color: "#000",
                fontWeight: "400",
                caretColor: "blue",
              }}
              shouldAutoFocus={true}
            />

            <button type="button" className="text-sm text-primary cursor-pointer" onClick={handleResendOTP} disabled={!enableResend}>
              {/* {loadingResend ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                </>
              ) : (
                ""
              )} */}

              <p>
                {enableResend ? (
                  loadingResend ? (
                    <>
                      <span className="loading loading-spinner loading-sm">Sending OTP ...</span>
                    </>
                  ) : (
                    <span>Resend OTP</span>
                  )
                ) : (
                  <span className="flex gap-1 items-center ">
                    Resend OTP in{" "}
                    <motion.span
                      key={resendTimer}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block w-max text-center font-bold">
                      {resendTimer}
                    </motion.span>{" "}
                    <span className=" font-bold">seconds</span>
                  </span>
                )}
              </p>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OTPInputForm;
