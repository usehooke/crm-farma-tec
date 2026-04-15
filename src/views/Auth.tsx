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
        } catch (err: unknown) {
            console.error("Auth error:", err);
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
                {/* Logo/Icon Neumórfico v2 */}
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-[var(--radius-corp)] bg-surface shadow-soft-out border border-white flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-brand-teal flex items-center justify-center text-white font-black text-2xl shadow-lg">
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
                                className="neo-input !pl-10"
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
                            className="neo-input !pl-10"
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
                            className="neo-input !pl-10"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 h-14 neo-button-primary !rounded-2xl"
                    >
                        {isLogin ? 'Entrar no Hub' : 'Criar Conta Grátis'}
                        <ArrowRight size={18} />
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
