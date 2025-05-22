"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface NetWorthSummaryCardProps {
  income: number;
  expense: number;
  saving: number;
  incomeChange: number;
  expenseChange: number;
  savingChange: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
};

const NetWorthSummaryCard = ({ income, expense, saving, incomeChange, expenseChange, savingChange }: NetWorthSummaryCardProps) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-xl font-bold mb-4">Net Worth Summary</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Income</p>
            <p className="text-2xl font-bold">
              $<AnimatedNumber value={income} />
            </p>
            <p className={incomeChange >= 0 ? "text-green-500" : "text-red-500"}>{incomeChange >= 0 ? `+${incomeChange}%` : `${incomeChange}%`}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Expenses</p>
            <p className="text-2xl font-bold">
              $<AnimatedNumber value={expense} />
            </p>
            <p className={expenseChange >= 0 ? "text-green-500" : "text-red-500"}>
              {expenseChange >= 0 ? `+${expenseChange}%` : `${expenseChange}%`}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Savings</p>
            <p className="text-2xl font-bold">
              $<AnimatedNumber value={saving} />
            </p>
            <p className={savingChange >= 0 ? "text-green-500" : "text-red-500"}>{savingChange >= 0 ? `+${savingChange}%` : `${savingChange}%`}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4 ml-auto">
          <button className="border border-blue-500 hover:bg-blue-600 hover:text-white cursor-pointer text-blue-500 text-sm px-4 py-2 rounded">
            View Transactions
          </button>
          <button className="border border-indigo-500 hover:bg-indigo-600 hover:text-white text-indigo-600 cursor-pointer text-sm px-4 py-2 rounded">
            Budget Planning
          </button>
          <button className="border border-green-500 hover:bg-green-600 hover:text-white text-green-500 cursor-pointer text-sm px-4 py-2 rounded">
            Manage My Savings
          </button>
        </div>
      </div>

      {/* Alert Message */}
      <div className="mt-auto bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded">
        <p className="text-sm">
          ⚠️ Alert: You are spending <strong>12% more on dining</strong> than usual. Please set a budget.
        </p>
      </div>
    </div>
  );
};

export default NetWorthSummaryCard;
