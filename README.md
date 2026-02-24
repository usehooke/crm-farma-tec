# CRM Farma Tec 📊💊

**Um CRM "Mobile-First" hiper-veloz para Representantes Técnicos e Propagandistas Farmacêuticos.**

Desenvolvido para máxima produtividade na rua, este painel abdica de bancos de dados em nuvem em prol da velocidade absoluta, focando localmente (`LocalStorage`) e conectando-se assíncronamente ao ecossistema corporativo via Motores e Relatórios em Excel (`.xlsx`).

---

## 🚀 Principais Features

* **Privacidade Local**: Os dados da carteira médica não trafegam na internet. Toda a sua base de funil fica persistida na ponta do aparelho do usuário de forma criptografada pelo Native Browser Storage.
* **Inteligência de Excel (Upload/Merge)**: Importe milhares de contatos num piscar de olhos arrastando um `.xlsx` ou `.csv` pro app. Ele converte colunas, ignora duplicados da base e limpa strings sujas de telefones para formatos válidos de WhatsApp (ex: `11988887777`).
* **Relatório Diário de Bordo Corporativo**: Com 1 clique, o sistema varre a Timeline Histórica de dezenas de médicos e cospe um Excel linear por Data/Hora da Dúvida Técnica. Feito para os chefes que pedem relatórios mensais via corporativo.
* **Sistema de Tags VIP**: `High-Ticket`, `Difícil Acesso`, `Uso da Concorrência`. Classifique seus prospectos com flags vivas e coloridas e bata o olho em quem focar sua rota na semana.
* **Máquina de Flyers de Analytics (html2canvas)**: Gerador offline de infográficos instantâneos que captura os números internos (taxa de conversão, tamanho base) convertendo a UI crua de Frontend em um lindíssimo `PNG` limpo (com marca d'água técnica oculta) que cai direto nas suas galerias de fotos pra mandar no Zap para a diretoria.

---

## 🛠️ Stack Tecnológico
* **Core**: React 18, Vite, TypeScript.
* **Styling**: TailwindCSS v4.
* **Animações (UX Apple-like)**: Framer Motion.
* **Tratamento de Dados de Planilha**: `xlsx` SheetJS.
* **Exportação Visual**: `html2canvas`, Recharts.
* **Ícones responsivos**: Lucide React.

## 🏁 Como Rodar este Projeto em Desenvolvimento

1. **Instale as dependências** do Node.js:
   ```bash
   npm install
   ```
2. **Inicie o Motor Vite** de alta performance:
   ```bash
   npm run dev
   ```
3. Abra `http://localhost:5173` ou escaneie o Network QR-Code para simular a interface no seu próprio celular enquanto coda.

---

## 📦 Deploy e Setup Git

Este projeto está pronto para rodar em provedores estáticos sem backend (ex: **Vercel, Netlify, Cloudflare Pages, GitHub Pages**), bastando rodar `npm run build`.

### Guia Rápido para Enviar para seu GitHub
Se for a primeira vez sincronizando este código, basta rodar estas linhas no terminal da pasta raiz:

```bash
git init
git add .
git commit -m "🚀 Release Inicial CRM Farma Tec V4.0 - Mobile CRM, Analytics Excel, Tags Inteligentes"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/crm-farma-tec.git
git push -u origin main
```
