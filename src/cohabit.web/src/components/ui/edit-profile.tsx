import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil } from 'lucide-react';

export interface ProfileData {
    fullName: string;
    email: string;
    cellphone: string;
    dateOfBirth: string;
    gender: string;
    title: string;
    avatarUrl: string;
}

interface EditProfileProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: ProfileData;
    onSave: (data: ProfileData) => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({
    isOpen,
    onClose,
    initialData,
    onSave
}) => {
    const [formData, setFormData] = useState<ProfileData>(initialData);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 backdrop-blur-[1px] bg-black/20 dark:bg-black/60"
                    />

                    <div className="relative w-full max-w-180 z-101 my-auto pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300, mass: 0.8 }}
                            className="pointer-events-auto w-full rounded-3xl shadow-[0_8px_10px_rgb(0,0,0,0.04)] border overflow-hidden 
                                     bg-[#F5F5F7] border-[#f0f0f0] 
                                     dark:bg-[#1C1C1E] dark:border-[#2C2C2E]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-4 md:px-8">
                                <h2 className="text-[18px] font-semibold text-[#010101] dark:text-white">Edit your profile</h2>
                                <button title='close' onClick={onClose} className="text-[#a0a0a0] hover:text-gray-400 transition-colors p-1">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="border-t-[1.6px] border-b-[1.6px] rounded-[18px] 
                                          border-[#EAE9F2] bg-white 
                                          dark:border-[#3A3A3C] dark:bg-[#2C2C2E]">

                                {/* Form Section */}
                                <div className="flex-1 p-4 md:p-6 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-medium text-[#706f6f] dark:text-[#A1A1A6]">Full name</label>
                                        <input title='fullName'
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-[14px] border-[1.5px] outline-none transition-all text-[15px] font-semibold
                                                     bg-white border-[#DFDDE6] text-[#131313] focus:border-black
                                                     dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white dark:focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-medium text-[#706f6f] dark:text-[#A1A1A6]">Email</label>
                                        <input title='email'
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-[14px] border-[1.5px] outline-none font-semibold transition-all text-[15px]
                                                     bg-white border-[#DFDDE6] text-[#131313] focus:border-black
                                                     dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white dark:focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-medium text-[#706f6f] dark:text-[#A1A1A6]">Cellphone</label>
                                        <input title='cellphone'
                                            name="cellphone"
                                            value={formData.cellphone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-[14px] border-[1.5px] outline-none font-semibold transition-all text-[15px]
                                                     bg-white border-[#DFDDE6] text-[#131313] focus:border-black
                                                     dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white dark:focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-medium text-[#706f6f] dark:text-[#A1A1A6]">Date of birth</label>
                                        <input title='dateOfBirth'
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-[14px] border-[1.5px] outline-none text-[15px] font-semibold
                                                     bg-white border-[#DFDDE6] text-[#131313] focus:border-black
                                                     dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white dark:focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-medium text-[#706f6f] dark:text-[#A1A1A6]">Gender</label>
                                        <div className="relative">
                                            <select title='gender'
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 rounded-[14px] border appearance-none outline-none text-[15px] font-semibold
                                                         bg-white border-[#DFDDE6] text-[#131313] focus:border-black
                                                         dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white dark:focus:border-blue-500"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-medium text-[#706f6f] dark:text-[#A1A1A6]">Bio</label>
                                        <textarea title='title'
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-[14px] border outline-none transition-all text-[14px] font-semibold resize-none
                                                     bg-white border-[#DFDDE6] text-[#131313] focus:border-black
                                                     dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white dark:focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[14px] font-medium text-[#706f6f] dark:text-[#A1A1A6]">Avatar URL</label>
                                        <input title='avatarUrl'
                                            name="avatarUrl"
                                            value={formData.avatarUrl}
                                            onChange={handleChange}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2.5 rounded-[14px] border-[1.5px] outline-none transition-all text-[15px] font-semibold
                                                     bg-white border-[#DFDDE6] text-[#131313] focus:border-black
                                                     dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white dark:focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-5 md:px-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 bg-[#F5F5F7] dark:bg-[#1C1C1E]">
                                <span className="text-[13px] text-[#767578]">
                                    Personal details
                                </span>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 sm:flex-none px-5 py-2 rounded-full text-[14px] border-[1.6px] font-bold transition-colors
                                                 bg-[#f3f4f6] border-[#E2E2E6] text-[#0F0F0F]
                                                 dark:bg-[#3A3A3C] dark:border-[#48484A] dark:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => onSave(formData)}
                                        className="flex-1 sm:flex-none px-5 py-2 rounded-full text-[13px] font-bold transition-colors shadow-lg shadow-black/10
                                                 bg-[#0F0F0F] text-white hover:bg-[#222]
                                                 dark:bg-white dark:text-black dark:hover:bg-[#E5E5E7]"
                                    >
                                        Save changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};
