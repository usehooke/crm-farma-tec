import { motion } from 'framer-motion';
import { useFollowUp } from '../hooks/useFollowUp';
import type { Medico } from '../hooks/useMedicos';
import { MessageCircleWarning, Phone } from 'lucide-react';
import { toast } from 'sonner';

export const CardAlerta = ({ medicos }: { medicos: Medico[] }) => {
    const { alertas, total } = useFollowUp(medicos);

    if (total === 0) return null; // Espaço em branco mantido se não houver alertas

    const topAlerta = alertas && alertas.length > 0 ? alertas[0] : null;

    if (!topAlerta) return null;

    const numeroLimpo = (topAlerta.telefone || '').replace(/\D/g, '');
    const temTelefone = numeroLimpo.length >= 10;
    const linkWhats = `https://api.whatsapp.com/send?phone=55${numeroLimpo}&text=Doutor(a)%20${topAlerta.nome},%20bom%20dia!`;

    const handleWhatsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!temTelefone) {
            e.preventDefault();
            toast.error('Telefone não cadastrado para este médico.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`m-4 mt-0 p-5 rounded-[20px] transition-colors flex items-center justify-between
                bg-brand-white shadow-[6px_6px_15px_#f2f2f2,-6px_-6px_15px_#ffffff]
                dark:bg-slate-800 dark:shadow-[6px_6px_15px_#0f172a,-6px_-6px_15px_#334155]
            `}
        >
            <div className="flex flex-col gap-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-wider">
                    <MessageCircleWarning size={16} />
                    <span>Atenção Necessária</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[13px] leading-relaxed">
                    <strong className="text-slate-900 dark:text-white">{total || 0} médicos</strong> estão esfriando. <br />
                    <span className="font-semibold">{topAlerta?.nome || 'Médico'}</span> está há <span className="text-orange-600 font-bold">{topAlerta?.diasInativo || 0} dias</span> sem visita.
                </p>
            </div>

            <a
                href={temTelefone ? linkWhats : '#'}
                target={temTelefone ? "_blank" : undefined}
                rel="noreferrer"
                title="Falar no WhatsApp"
                onClick={handleWhatsClick}
                className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full text-white transition-all
                    ${temTelefone
                        ? 'bg-green-500 shadow-lg shadow-green-200 dark:shadow-none active:scale-95'
                        : 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed opacity-80'
                    }
                `}
            >
                <Phone size={20} className="fill-current" />
            </a>
        </motion.div>
    );
};
