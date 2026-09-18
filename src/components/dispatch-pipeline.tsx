'use client';

import {
	CalendarClock,
	ChevronDown,
	ChevronRight,
	Inbox,
	Send,
	CheckCircle2,
	AlertCircle,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface QueueMetrics {
	waiting: number;
	active: number;
	completed: number;
	failed: number;
	delayed: number;
}

interface Stage {
	key: keyof QueueMetrics;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	tone: 'muted' | 'primary' | 'good' | 'critical';
}

const TONE_CLASSES: Record<Stage['tone'], { bg: string; text: string; border: string }> = {
	muted: { bg: 'bg-muted/60', text: 'text-muted-foreground', border: 'border-border' },
	primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/25' },
	good: { bg: 'bg-status-good/10', text: 'text-status-good', border: 'border-status-good/25' },
	critical: {
		bg: 'bg-status-critical/10',
		text: 'text-status-critical',
		border: 'border-status-critical/25',
	},
};

function StageNode({ stage, value }: { stage: Stage; value: number }) {
	const tone = TONE_CLASSES[stage.tone];
	return (
		<div
			className={cn(
				'flex min-w-[9rem] flex-1 flex-col items-center gap-1.5 rounded-2xl border px-4 py-3.5 text-center',
				tone.bg,
				tone.border,
			)}
		>
			<stage.icon className={cn('h-4 w-4', tone.text)} />
			<span className={cn('text-2xl font-semibold tabular-nums leading-none', tone.text)}>
				{value.toLocaleString('pt-BR')}
			</span>
			<span className={cn('text-[11px] font-medium uppercase tracking-wide', tone.text)}>
				{stage.label}
			</span>
		</div>
	);
}

// Conector entre estágios — linha + chevron, orientação trocada por breakpoint
// (não há detecção de JS: as duas variantes convivem e o CSS decide qual mostrar).
function Connector({ dashed = false }: { dashed?: boolean }) {
	const lineClass = dashed ? 'border-dashed' : 'border-solid';
	return (
		<div className="flex shrink-0 items-center justify-center text-muted-foreground/50 lg:w-8">
			<div className={cn('hidden h-px w-full border-t lg:block', lineClass)} />
			<ChevronRight className="hidden h-4 w-4 shrink-0 lg:block" />
			<div className={cn('block h-6 w-px border-l lg:hidden', lineClass)} />
			<ChevronDown className="block h-4 w-4 shrink-0 lg:hidden" />
		</div>
	);
}

// O elemento de assinatura do dashboard: em vez de 5 tiles desconexos, mostra
// o ciclo de vida real de um job na fila BullMQ como um fluxo — Agendado é um
// afluente (linha tracejada: ainda não está na fila de verdade), Em trânsito
// bifurca em dois desfechos possíveis (Entregue / Falhou).
export function DispatchPipeline({ queue }: { queue: QueueMetrics }) {
	const delayedStage: Stage = {
		key: 'delayed',
		label: 'Agendado',
		icon: CalendarClock,
		tone: 'muted',
	};
	const waitingStage: Stage = { key: 'waiting', label: 'Na fila', icon: Inbox, tone: 'muted' };
	const activeStage: Stage = { key: 'active', label: 'Em trânsito', icon: Send, tone: 'primary' };
	const completedStage: Stage = {
		key: 'completed',
		label: 'Entregue',
		icon: CheckCircle2,
		tone: 'good',
	};
	const failedStage: Stage = {
		key: 'failed',
		label: 'Falhou',
		icon: AlertCircle,
		tone: 'critical',
	};

	return (
		<div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
			<StageNode stage={delayedStage} value={queue.delayed} />
			<Connector dashed />
			<StageNode stage={waitingStage} value={queue.waiting} />
			<Connector />
			<StageNode stage={activeStage} value={queue.active} />
			<Connector />
			<div className="flex flex-1 flex-col gap-3 sm:flex-row">
				<StageNode stage={completedStage} value={queue.completed} />
				<StageNode stage={failedStage} value={queue.failed} />
			</div>
		</div>
	);
}
