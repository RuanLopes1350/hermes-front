"use client";

import { 
    Save, 
    Play, 
    ArrowLeft, 
    Smartphone, 
    Monitor, 
    Eye, 
    Code,
    RefreshCw,
    Send,
    AlertCircle,
    Info,
    Loader2
} from "lucide-react";
import Button from "@/src/components/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/src/lib/api";

export default function TemplateEditorPage() {
    const { id } = useParams();
    const isNew = id === 'new';
    
    const [mjml, setMjml] = useState(`<mjml>
  <mj-body bg-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding-bottom="0">
      <mj-column>
        <mj-image width="100px" src="/hermes-icon.svg" />
        <mj-divider border-color="#3B82F6"></mj-divider>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff">
      <mj-column>
        <mj-text font-size="20px" color="#1E293B" font-family="helvetica" font-weight="bold">
          Olá, {{nome}}!
        </mj-text>
        <mj-text font-size="16px" color="#64748B" font-family="helvetica">
          Este é um template dinâmico gerado pelo Hermes Engine usando MJML e Handlebars.
        </mj-text>
        <mj-button background-color="#3B82F6" href="#">
          CONFIRMAR ACESSO
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`);

    const [variables, setVariables] = useState(`{
  "nome": "Desenvolvedor"
}`);

    const [renderedHtml, setRenderedHtml] = useState("");
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeTab, setActiveTab] = useState<'code' | 'vars'>('code');

    const handleRefreshPreview = async () => {
        setLoading(true);
        try {
            const varsJson = JSON.parse(variables);
            
            // Usando o utilitário centralizado apiFetch
            // Ele resolve a URL via variável de ambiente e anexa as credenciais
            const response = await apiFetch(`/api/services/default/templates/preview`, {
                method: 'POST',
                body: JSON.stringify({ mjml, variables: varsJson })
            });

            if (response.ok) {
                const data = await response.json();
                setRenderedHtml(data.html);
            } else {
                console.error("Erro na resposta da API:", response.status);
            }
        } catch (err) {
            console.error("Erro ao gerar preview:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleRefreshPreview();
    }, []);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
            {/* Header / ActionBar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                    <Link href="/system/templates">
                        <button className="p-2 hover:bg-white/5 rounded-xl text-text-secondary transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight uppercase italic">{isNew ? 'Novo Template' : 'Editar Template'}</h2>
                        <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">{isNew ? 'Rascunho' : id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors border border-border-subtle rounded-xl">
                        <Send size={14} /> Enviar Teste
                    </button>
                    <Button 
                        label="Salvar Alterações" 
                        variant="primary" 
                        labelIcon={<Save size={18} />} 
                    />
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                
                {/* Left Side: Code Editor */}
                <div className="w-1/2 flex flex-col bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
                    <div className="flex border-b border-border-subtle bg-background/30 p-2">
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                                activeTab === 'code' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            MJML Code
                        </button>
                        <button 
                            onClick={() => setActiveTab('vars')}
                            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                                activeTab === 'vars' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            Variables (JSON)
                        </button>
                    </div>

                    <div className="flex-1 relative group">
                        {activeTab === 'code' ? (
                            <textarea 
                                value={mjml}
                                onChange={(e) => setMjml(e.target.value)}
                                className="w-full h-full bg-transparent p-8 font-mono text-sm text-primary/80 focus:outline-none resize-none scrollbar-hide leading-relaxed"
                                spellCheck={false}
                            />
                        ) : (
                            <textarea 
                                value={variables}
                                onChange={(e) => setVariables(e.target.value)}
                                className="w-full h-full bg-transparent p-8 font-mono text-sm text-success/80 focus:outline-none resize-none scrollbar-hide leading-relaxed"
                                spellCheck={false}
                            />
                        )}
                        <button 
                            onClick={handleRefreshPreview}
                            className="absolute bottom-6 right-6 p-4 bg-primary text-white rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all group-hover:opacity-100 opacity-80"
                            title="Atualizar Preview"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                        </button>
                    </div>
                </div>

                {/* Right Side: Visual Preview */}
                <div className="w-1/2 flex flex-col bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between border-b border-border-subtle bg-background/30 p-3 px-6">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Preview Real-time</span>
                        </div>
                        <div className="flex bg-background/50 p-1 rounded-xl border border-border-subtle">
                            <button 
                                onClick={() => setViewMode('desktop')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                <Monitor size={16} />
                            </button>
                            <button 
                                onClick={() => setViewMode('mobile')}
                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                <Smartphone size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-[#f4f4f4] relative flex items-center justify-center p-8 overflow-hidden">
                        {loading && (
                            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={40} />
                            </div>
                        )}
                        <div className={`h-full bg-white shadow-2xl transition-all duration-500 overflow-hidden rounded-lg ${
                            viewMode === 'desktop' ? 'w-full' : 'w-[375px]'
                        }`}>
                            <iframe 
                                srcDoc={renderedHtml}
                                title="MJML Preview"
                                className="w-full h-full border-none"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Hint Box */}
            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                <Info size={18} className="text-primary" />
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    Dica: Use <span className="text-text-primary">{"{{variavel}}"}</span> para injetar dados dinâmicos do seu JSON no template.
                </p>
            </div>
        </div>
    );
}