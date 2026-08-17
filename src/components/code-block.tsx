import { codeToHtml } from 'shiki';

interface CodeBlockProps {
	code: string;
	lang?: string;
	filename?: string;
}

export async function CodeBlock({ code, lang = 'ts', filename }: CodeBlockProps) {
	const html = await codeToHtml(code.trim(), {
		lang,
		themes: {
			light: 'github-light',
			dark: 'github-dark-dimmed',
		},
		defaultColor: false,
	});

	return (
		<div className="overflow-hidden rounded-lg border bg-card">
			{filename && (
				<div className="border-b bg-muted/50 px-4 py-2 font-mono text-xs text-muted-foreground">
					{filename}
				</div>
			)}
			<div
				className="overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:leading-relaxed"
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}
