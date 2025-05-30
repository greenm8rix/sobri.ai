import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LegalDisclaimer from './LegalDisclaimer';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Before You Begin</h3>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              <p className="text-gray-600 mb-4">
                Soberi.ai is a supportive companion for your recovery journey. Please note:
              </p>

              <LegalDisclaimer type="full" onClose={onClose} />

              <div className="mt-4 text-xs text-gray-500">
                By clicking "I Understand", you confirm that you are at least 18 years old and agree to these terms.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;