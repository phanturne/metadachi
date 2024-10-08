// Source: https://github.com/vercel/ai-chatbot/blob/main/components/stocks/message.tsx#L6
// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Markdown/CodeBlock.tsx

"use client";

import { type FC, memo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { Button } from "@/components/ui/button";
import { IconCheck, IconCopy, IconDownload } from "@/components/ui/icons";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Props {
	language: string;
	value: string;
}

interface languageMap {
	[key: string]: string | undefined;
}

export const programmingLanguages: languageMap = {
	javascript: ".js",
	python: ".py",
	java: ".java",
	c: ".c",
	cpp: ".cpp",
	"c++": ".cpp",
	"c#": ".cs",
	ruby: ".rb",
	php: ".php",
	swift: ".swift",
	"objective-c": ".m",
	kotlin: ".kt",
	typescript: ".ts",
	go: ".go",
	perl: ".pl",
	rust: ".rs",
	scala: ".scala",
	haskell: ".hs",
	lua: ".lua",
	shell: ".sh",
	sql: ".sql",
	html: ".html",
	css: ".css",
	// add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
};

export const generateRandomString = (length: number, lowercase = false) => {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXY3456789"; // excluding similar looking characters like Z, 2, I, 1, O, 0
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return lowercase ? result.toLowerCase() : result;
};

const CodeBlock: FC<Props> = memo(({ language, value }) => {
	const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

	const downloadAsFile = () => {
		if (typeof window === "undefined") {
			return;
		}
		const fileExtension = programmingLanguages[language] || ".file";
		const suggestedFileName = `file-${generateRandomString(
			3,
			true,
		)}${fileExtension}`;
		const fileName = window.prompt("Enter file name" || "", suggestedFileName);

		if (!fileName) {
			// User pressed cancel on prompt.
			return;
		}

		const blob = new Blob([value], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = fileName;
		link.href = url;
		link.style.display = "none";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const onCopy = () => {
		if (isCopied) return;
		copyToClipboard(value);
	};

	return (
		<div className="codeblock relative w-full overflow-hidden rounded-lg p-0.5 font-sans shadow-lg">
			<div className="rounded-[7px] bg-zinc-950">
				<div className="flex w-full items-center justify-between rounded-t-[7px] bg-zinc-800 px-4 py-1 text-zinc-100">
					<div className="flex items-center space-x-2">
						<span className="font-medium text-sm">{language}</span>
					</div>
					<div className="flex items-center space-x-2">
						<Button
							variant="ghost"
							className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 focus:ring-2 focus:ring-purple-500"
							onClick={downloadAsFile}
							size="sm"
						>
							<IconDownload className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100 focus:ring-2 focus:ring-purple-500"
							onClick={onCopy}
						>
							{isCopied ? (
								<IconCheck className="h-4 w-4" />
							) : (
								<IconCopy className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
				<div className="rounde-t-none overflow-auto rounded border">
					<SyntaxHighlighter
						language={language}
						style={atomDark}
						showLineNumbers
						customStyle={{
							margin: 0,
							width: "100%",
							background: "transparent",
							padding: "1rem",
						}}
						lineNumberStyle={{
							userSelect: "none",
							opacity: 0.5,
							paddingRight: "1rem",
							borderRight: "1px solid #ffffff20",
						}}
						codeTagProps={{
							style: {
								fontSize: "0.9rem",
								fontFamily: "var(--font-mono)",
							},
						}}
					>
						{value}
					</SyntaxHighlighter>
				</div>
			</div>
		</div>
	);
});
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
