'use client';

import React, { useState } from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type Transition,
} from 'motion/react';
import { X, MapPin } from 'lucide-react';

export interface FamilyReceiveComponentProps {
  triggerLabel?: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  icon?: React.ReactNode;
  /** Open the dialog immediately instead of showing the trigger button first. */
  defaultOpen?: boolean;
}

const springTransition: Transition = {
  type: 'spring',
  bounce: 0,
  duration: 0.4,
};

export const FamilyReceiveComponent: React.FC<FamilyReceiveComponentProps> = ({
  triggerLabel = 'Receive',
  title = 'Confirm',
  description = 'Are you sure you want to receive hell load of money?',
  confirmLabel = 'Receive',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  icon,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="relative flex h-[400px] w-[360px] max-w-full items-center justify-center md:w-[720px]">
      <LayoutGroup>
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              key="trigger"
              layoutId="action-button"
              onClick={() => setIsOpen(true)}
              className="relative h-12 w-64 cursor-pointer rounded-full bg-[#00A6F4] text-lg font-medium text-white shadow-lg md:h-14 md:w-96 md:text-xl"
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
            >
              {triggerLabel}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center px-4"
            >
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.98 }}
                transition={springTransition}
                className="relative w-[340px] max-w-full overflow-hidden rounded-3xl border border-white/40 bg-white/55 p-6 text-zinc-900 shadow-2xl ring-1 ring-white/30 backdrop-blur-2xl md:w-[560px] md:p-8 dark:border-white/10 dark:bg-white/5 dark:text-white dark:ring-white/10"
              >
                {/* subtle accent glow at the top */}
                <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-56 -translate-x-1/2 rounded-full bg-[#00A6F4]/25 blur-3xl" />

                {/* glassy top sheen */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent dark:from-white/10" />

                <button
                  onClick={() => {
                    setIsOpen(false);
                    onCancel?.();
                  }}
                  className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <div className="relative flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A6F4]/10 ring-1 ring-[#00A6F4]/20">
                    {icon ?? <MapPin size={26} className="text-[#00A6F4]" />}
                  </div>

                  <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
                    {title}
                  </h2>

                  <p className="mt-2 max-w-sm text-base leading-relaxed text-zinc-500 md:text-lg dark:text-zinc-400">
                    {description}
                  </p>
                </div>

                <div className="mt-7 flex gap-3 md:mt-8">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onCancel?.();
                    }}
                    className="h-12 flex-1 rounded-xl bg-zinc-100 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 md:text-base dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                  >
                    {cancelLabel}
                  </button>

                  <motion.button
                    layoutId="action-button"
                    onClick={() => {
                      onConfirm?.();
                      setIsOpen(false);
                    }}
                    className="h-12 flex-1 cursor-pointer rounded-xl bg-[#00A6F4] text-sm font-semibold text-white shadow-lg shadow-[#00A6F4]/25 transition-colors hover:bg-[#0095db] md:text-base"
                    transition={springTransition}
                  >
                    {confirmLabel}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
};
