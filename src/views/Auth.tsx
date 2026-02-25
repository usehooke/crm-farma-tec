import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../services/firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [erro, setErro] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, senha);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
                // Atualiza o perfil no Firebase com o nome fornecido
                await updateProfile(userCredential.user, { displayName: nome });
                // Guarda também no LocalStorage para manter a lógica offline-first sincronizada
                localStorage.setItem('@FarmaClinIQ:user_nome', nome);
            }
        } catch (err: any) {
            setErro('Falha na autenticação. Verifique os dados e a ligação.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-white flex flex-col justify-center px-8 pb-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm mx-auto"
            >
                {/* Logo/Icon Neumórfico */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-3xl bg-surface shadow-[8px_8px_16px_#e5e5e5,-8px_-8px_16px_#ffffff] flex items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-brand-teal flex items-center justify-center text-white font-black text-2xl shadow-inner">
                            IQ
                        </div>
                    </div>
                </div>

                <header className="text-center mb-8">
                    <h1 className="text-3xl font-black text-brand-dark tracking-tight">
                        {isLogin ? 'Bem-vinda de volta' : 'Criar Conta'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        {isLogin ? 'Aceda à sua área de gestão' : 'Registe-se para começar a usar o FarmaClinIQ'}
                    </p>
                </header>

                {erro && (
                    <div className="mb-6 p-3 bg-red-100 text-red-600 text-sm font-bold rounded-xl text-center shadow-sm">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Seu Nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required={!isLogin}
                                className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border-none outline-none focus:ring-2 focus:ring-primary shadow-inner text-sm font-medium text-brand-dark placeholder-slate-400 transition-all"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email Corporativo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border-none outline-none focus:ring-2 focus:ring-primary shadow-inner text-sm font-medium text-brand-dark placeholder-slate-400 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="password"
                            placeholder="Senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border-none outline-none focus:ring-2 focus:ring-primary shadow-inner text-sm font-medium text-brand-dark placeholder-slate-400 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-[4px_4px_10px_rgba(30,95,175,0.4),-4px_-4px_10px_rgba(255,255,255,0.8)] flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        {isLogin ? 'Entrar no Hub' : 'Criar Conta Grátis'}
                        <ArrowRight size={16} />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setErro('');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                    >
                        {isLogin ? 'Ainda não tem conta? Registe-se.' : 'Já tem conta? Fazer Login.'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
