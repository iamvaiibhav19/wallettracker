import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const FinanceTips = () => {
  const tips = [
    "A budget is telling your money where to go instead of wondering where it went.",
    "Small savings today lead to big dreams tomorrow.",
    "Track every penny—your wallet will thank you.",
    "Don’t just save what's left after spending—spend what’s left after saving.",
    "Your future self will thank you for the choices you make today.",
    "Money grows when you watch where it goes.",
    "Know your numbers. Control your future.",
    "Turn your expenses into insights.",
    "A little planning goes a long way toward financial freedom.",
    "Master your money, master your life.",
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 5000); // Change tip every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[24px] flex items-center justify-center mt-2">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentTipIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4 }}
          className="text-sm text-[#A86523] font-medium italic text-center">
          {tips[currentTipIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default FinanceTips;
