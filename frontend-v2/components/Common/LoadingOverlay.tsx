import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({
  isVisible,
  message = "Please wait, data is exporting. This may take a few minutes. Thanks for your patience!",
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block w-10 h-10 border-4 border-t-brand border-r-transparent rounded-full"
          />
          <motion.span
            className="mt-4 text-brand-dark text-lg font-medium max-w-md text-center px-4"
            animate={{
              y: [0, -10, 0],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}>
            {message}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
