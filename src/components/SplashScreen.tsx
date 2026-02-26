import { motion } from 'framer-motion';

export const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-brand-white flex items-center justify-center flex-col overflow-hidden"
        >
            {/* Background Decorative Element */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.03, 0.08, 0.03]
                }}
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                className="absolute w-[150%] h-[150%] bg-brand-teal rounded-full blur-[100px] -z-10"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.3, duration: 1 }}
                className="flex flex-col items-center justify-center p-12 rounded-[50px] bg-surface shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]"
            >
                <motion.div className="flex items-center gap-2">
                    {/* Logo Text */}
                    <h1 className="text-5xl font-black tracking-tighter">
                        <span className="text-brand-dark">Farma</span>
                        <span className="text-brand-teal">ClinIQ</span>
                    </h1>

                    {/* Plus Icon (Medical Cross) */}
                    <motion.div
                        initial={{ rotate: -180, opacity: 0, scale: 0 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                        <div className="w-10 h-10 bg-brand-teal rounded-2xl flex items-center justify-center shadow-lg shadow-brand-teal/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 flex items-center gap-3"
                >
                    <div className="w-2 h-2 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.4s' }} />
                </motion.div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1.2 }}
                className="absolute bottom-10 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-dark"
            >
                Powered by Elmeco
            </motion.p>
        </motion.div>
    );
};
