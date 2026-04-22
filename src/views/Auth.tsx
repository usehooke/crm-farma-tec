import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../services/firebaseConfig';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification
} from 'firebase/auth';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estados de erro específicos por campo (Validação no Submit)
    const [errors, setErrors] = useState<{ email?: string; senha?: string; nome?: string }>({});

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setErrors({});
        
        let localErrors: { email?: string; senha?: string; nome?: string } = {};

        // Validação Manual antes do Submit
        if (!isLogin && nome.trim().length < 3) {
            localErrors.nome = 'Nome muito curto (mínimo 3 caracteres).';
        }
        
        if (senha.length < 6) {
            localErrors.senha = 'A senha deve ter pelo menos 6 caracteres.';
        }

        if (Object.keys(localErrors).length > 0) {
            setErrors(localErrors);
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, senha);
            } else {
                // [Operação Blindagem]: Whitelist de Domínios
                const domain = email.split('@')[1]?.toLowerCase();
                const allowedDomains = ['elmeco.com.br'];
                const allowedSpecialEmails = [
                    'nando@farmacliniq.com.br', 
                    'ariani.afonso@elmeco.com.br',
                    'ariani_vicente@yahoo.com.br',
                    'teste@farmacliniq.com.br'
                ]; // Liste suas exceções aqui

                if (!allowedDomains.includes(domain) && !allowedSpecialEmails.includes(email.toLowerCase())) {
                    setErro('Cadastro restrito a e-mails corporativos @elmeco.com.br.');
                    setLoading(false);
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
                
                // Enviar e-mail de verificação IMEDIATAMENTE após criar conta
                await sendEmailVerification(userCredential.user);
                
                await updateProfile(userCredential.user, { displayName: nome });
                localStorage.setItem('@FarmaClinIQ:user_nome', nome);
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            setErro('Falha na autenticação. Verifique os dados e a ligação.');
        } finally {
            setLoading(false);
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
                <div className="flex justify-center mb-10">
                    <div className="w-24 h-24 rounded-[32px] bg-surface shadow-soft-out border border-white flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-brand-teal-400 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                            IQ
                        </div>
                    </div>
                </div>

                <header className="text-center mb-8">
                    <h1 className="text-3xl font-black text-brand-dark tracking-tight">
                        {isLogin ? 'Bem-vinda de volta' : 'Criar Conta'}
                    </h1>
                    <p className="text-sm font-bold text-slate-500 mt-2">
                        {isLogin ? 'Acesse sua área de gestão' : 'Registre-se para começar a usar o FarmaClinIQ'}
                    </p>
                </header>

                {erro && (
                    <div className="mb-6 p-4 bg-red-100 text-red-600 text-xs font-black uppercase rounded-2xl text-center shadow-sm border border-red-200">
                        {erro}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <Input
                            label="Seu Nome"
                            placeholder="Ex: Ariani Afonso"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            leftIcon={User}
                            error={errors.nome}
                            required
                        />
                    )}

                    <Input
                        label="Email Corporativo"
                        type="email"
                        placeholder="nome@elmeco.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftIcon={Mail}
                        error={errors.email}
                        required
                    />

                    <Input
                        label="Senha"
                        type="password"
                        placeholder="******"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        leftIcon={Lock}
                        error={errors.senha}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full mt-6 h-14"
                        isLoading={loading}
                        rightIcon={ArrowRight}
                    >
                        {isLogin ? 'Entrar no Hub' : 'Criar Conta Grátis'}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setErro('');
                            setErrors({});
                        }}
                        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-teal-400 transition-colors"
                    >
                        {isLogin ? 'Ainda não tem conta? Registre-se.' : 'Já tem conta? Fazer Login.'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

