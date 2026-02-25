import { motion } from 'framer-motion';

export const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-brand-white flex items-center justify-center flex-col"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                className="flex items-center justify-center gap-1"
            >
                {/* Logo Text */}
                <h1 className="text-4xl font-extrabold tracking-tight">
                    <span className="text-brand-dark">Farma</span>
                    <span className="text-brand-teal">ClinIQ</span>
                </h1>

                {/* Plus Icon (Medical Cross) */}
                <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand-teal ml-1" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
