import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../services/firebaseConfig';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Mail, RefreshCcw, LogOut, CheckCircle } from 'lucide-react';

export const EmailVerificationPending = () => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    
    const user = auth.currentUser;

    const handleResend = async () => {
        if (!user) return;
        setSending(true);
        try {
            await sendEmailVerification(user);
            setSent(true);
            setTimeout(() => setSent(false), 5000);
        } catch (error) {
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const handleCheckVerification = () => {
        // Recarrega o estado do usuário para checar se ele já clicou no link
        window.location.reload();
    };

    const handleLogout = () => {
        signOut(auth).then(() => {
            localStorage.clear();
            window.location.href = '/';
        });
    };

    return (
        <div className="min-h-screen bg-brand-white flex items-center justify-center px-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-surface p-10 rounded-[40px] shadow-soft-out border border-white text-center"
            >
                <div className="w-20 h-20 rounded-3xl bg-brand-teal/10 flex items-center justify-center mx-auto mb-8 text-brand-teal">
                    <Mail size={40} />
                </div>

                <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight">Verifique seu E-mail</h2>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Enviamos um link de confirmação para <strong className="text-brand-dark">{user?.email}</strong>. 
                    Por favor, verifique sua caixa de entrada (e spam) para ativar seu acesso.
                </p>

                <div className="space-y-4">
                    <button 
                        onClick={handleCheckVerification}
                        className="w-full py-4 bg-brand-teal text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-teal/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={16} /> Já verifiquei meu e-mail
                    </button>

                    <button 
                        onClick={handleResend}
                        disabled={sending || sent}
                        className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={16} className={sending ? 'animate-spin' : ''} />
                        {sent ? 'Link Enviado!' : 'Reenviar Link de Confirmação'}
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter hover:text-danger flex items-center justify-center gap-1"
                    >
                        <LogOut size={12} /> Usar outra conta
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
