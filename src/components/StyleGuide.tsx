import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Type, Box, Smartphone, CheckCircle2 } from 'lucide-react';

/**
 * StyleGuide Component (@Agent-UX)
 * Página de referência interna para garantir consistência visual.
 */
export const StyleGuide: React.FC = () => {
    const colors = [
        { name: 'Teal 400 (Primary)', token: '--color-brand-teal-400', hex: '#2dd4bf' },
        { name: 'Teal 600 (Dark)', token: '--color-brand-teal-600', hex: '#0d9488' },
        { name: 'Brand Dark', token: '--color-brand-dark', hex: '#1e293b' },
        { name: 'Slate 500 (Text)', token: '--color-slate-500', hex: '#64748b' },
        { name: 'Slate 300 (Subtle)', token: '--color-slate-300', hex: '#cbd5e1' },
    ];

    const typography = [
        { label: 'H1 / Page Title', class: 'text-2xl font-black tracking-tight' },
        { label: 'H2 / Card Title', class: 'text-xl font-bold' },
        { label: 'Body Text', class: 'text-base font-medium' },
        { label: 'Small / Support', class: 'text-sm font-bold' },
        { label: 'Label / Micro', class: 'text-xs font-black uppercase tracking-widest' },
    ];

    return (
        <div className="flex-1 bg-brand-white dark:bg-slate-900 p-8 pb-32 overflow-y-auto">
            <header className="mb-12">
                <h1 className="text-3xl font-black text-brand-dark dark:text-white">Design System Hub</h1>
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-2">v0.1 / Sprint 0 — Fundamentos</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Cores */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-brand-teal">
                        <Palette size={20} />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em]">Cromatologia Acessível</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {colors.map((color) => (
                            <div key={color.token} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-soft-out border border-slate-50 dark:border-slate-700">
                                <div className="w-12 h-12 rounded-xl shadow-inner border border-white/20" style={{ backgroundColor: color.hex }} />
                                <div>
                                    <p className="text-sm font-black text-brand-dark dark:text-white">{color.name}</p>
                                    <code className="text-[10px] text-slate-400">{color.token}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tipografia */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-brand-teal">
                        <Type size={20} />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em]">Escala Tipográfica</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft-out space-y-8">
                        {typography.map((type) => (
                            <div key={type.label} className="border-b border-slate-50 dark:border-slate-700 pb-4 last:border-0">
                                <p className="text-[10px] text-slate-400 font-bold mb-2">{type.label}</p>
                                <p className={`${type.class} text-brand-dark dark:text-white`}>FarmaClinIQ Elite CRM</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Componentes Básicos */}
                <section className="space-y-6 lg:col-span-2">
                    <div className="flex items-center gap-3 text-brand-teal">
                        <Box size={20} />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em]">Atomic Components</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Botões */}
                        <div className="space-y-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Botões & Estados</p>
                            <button className="w-full h-14 neo-button-primary">Primary Action</button>
                            <button className="w-full h-14 bg-surface rounded-xl shadow-soft-out text-slate-600 font-bold text-sm">Secondary</button>
                            <button className="w-full h-14 bg-surface rounded-xl shadow-soft-in text-brand-teal font-black text-xs uppercase tracking-widest">Active State</button>
                        </div>
                        
                        {/* Inputs */}
                        <div className="space-y-4">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Formulários</p>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 dark:text-slate-400 ml-2">Label Acessível</label>
                                <input type="text" placeholder="Input Placeholder" className="neo-input" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-red-500 ml-2">Estado de Erro</label>
                                <input type="text" value="Valor Inválido" className="neo-input border-red-200 bg-red-50/10 text-red-600" />
                            </div>
                        </div>

                        {/* Mobile Specs */}
                        <div className="bg-brand-teal/5 border-2 border-brand-teal/20 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center gap-2 text-brand-teal">
                                <Smartphone size={16} />
                                <span className="text-[10px] font-black uppercase">Mobile Ergonomics</span>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 size={14} className="text-green-500" /> Hitbox Min: 44px
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 size={14} className="text-green-500" /> Text Min: 12px
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 size={14} className="text-green-500" /> Gap Standard: 24px
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
