/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

"use strict";

import * as vscode from "vscode";
import { spawn, ChildProcess } from "child_process";
import * as readline from "readline";
import { Readable } from "stream";

class LineReader {
	private reader: readline.ReadLine;
	private _res: (p: string) => void;
	private _prom: Promise<string>;
	constructor(readable: Readable) {
		this.reader = readline.createInterface(proc.stdout);
		this.genProm();
		this.reader.on("line", line => this._res(line));
	}
	next(): Promise<string> {
		return this._prom;
	}
	private genProm() {
		this._prom = new Promise<string>(res => (this._res = res)).then(res => {
			this.genProm();
			return res;
		});
	}
}
type deepConf = {
	n: number;
	mode: 0 | 1 | 2;
	prime: string;
};
type deepRes = {
	result: string;
};
type deepConfP = Pick<deepConf, "n" | "mode">;

type deepArg = "line" | "eof" | { chars: number };

let proc: ChildProcess;
export function activate(context: vscode.ExtensionContext) {
	console.log("starting external");
	proc = spawn("python", ["-u", "sample-stdin.py", "--save_dir", "save-aug-seq1000/"], {
		env: { ...process.env, CUDA_VISIBLE_DEVICES: "" },
		cwd: "/home/tehdog/pkg/char-rnn-tensorflow",
		stdio: ["pipe", "pipe", "pipe"]
	});
	proc.stderr.on("data", chunk => console.error("E:", chunk.toString()));
	proc.stdout.on("data", chunk => console.log("O:", chunk.toString()));
	async function sendCommand(p: deepConf): Promise<deepRes> {
		if (p.prime === "") p.prime = "e";
		const i = JSON.stringify(p) + "\n";
		console.log("I", i);
		proc.stdin.write(i, err => err && console.error("WRI", err));
		return JSON.parse(await reader.next());
	}
	const reader = new LineReader(proc.stdout);
	// The most simple completion item provider which
	// * registers for text files (`'plaintext'`), and
	// * return the 'Hello World' and
	//   a snippet-based completion item.
	vscode.languages.registerCompletionItemProvider(["typescript", "typescriptreact"], {
		provideCompletionItems(
			document: vscode.TextDocument,
			position: vscode.Position,
			token: vscode.CancellationToken,
			context: vscode.CompletionContext
		) {
			let a = new vscode.CompletionItem(
				"¯\\_(ツ)_/¯ Deep complete (1000 chars)",
				vscode.CompletionItemKind.Snippet
			);
			a.filterText = "idk";
			a.commitCharacters;
			a.command = {
				title: "deep complete",
				command: "deep.complete",
				arguments: [{ chars: 1000 }]
			};
			a.insertText = "";
			a.sortText = "ZZ";

			let b = new vscode.CompletionItem("¯\\_(ツ)_/¯ Deep complete line", vscode.CompletionItemKind.Snippet);
			b.filterText = "uhhh";
			b.command = {
				title: "deep complete",
				command: "deep.complete",
				arguments: ["line"]
			};
			b.insertText = "";

			let c = new vscode.CompletionItem(
				"¯\\_(ツ)_/¯ Deep complete (the rest of the file)",
				vscode.CompletionItemKind.Snippet
			);
			c.filterText = "TODO";
			c.command = {
				title: "deep complete",
				command: "deep.complete",
				arguments: ["eof"]
			};
			c.insertText = "";
			return [a, b, c];
		}
		/*async resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken) {
			//console.log(item.insertText, item);
			if (item.insertText === "[processing]") {
				proc.stdin.write(JSON.stringify({ n: 100, prime: "hello", mode: 1 }) + "\n", (err, res) => {
					if (err) console.error("WRI", err);
				});
				const line = JSON.parse(await reader.next());
				console.log("GOT", line);
				const c = new vscode.CompletionItem(item.label);
				c.insertText = line.result || "EMPTY";
				return c;
			} else {
				console.log("HEW");
				const document = (item as any)._doc as vscode.TextDocument;
				const position = (item as any)._pos as vscode.Position;
				console.log("RANG", document.getText(document.getWordRangeAtPosition(position)));
				return new vscode.CompletionItem(item.label + "[]" + Math.random());
			}
			//console.log(select);
			//return Promise.resolve(new vscode.CompletionItem("YNOOOO"));
		}*/
	});
	async function doThing(d: deepArg) {
		try {
			let editor = vscode.window.activeTextEditor;
			const pos = editor.selection.active;
			console.log("RUN");
			const prime = editor.document
				.getText(new vscode.Range(new vscode.Position(Math.max(pos.line - 20, 0), 0), pos))
				.slice(-1000);

			const primeLength = prime.length;
			let resText: string;
			if (d === "line") {
				const res = await sendCommand({ prime, mode: 2, n: 200 });
				resText = (res.result || "[EMTPYRES]").slice(primeLength);
				resText = resText.slice(0, resText.indexOf("\n"));
			} else if (d === "eof") {
				for (let i = 0; i < 20; i++) {
					await doThing({ chars: 80 });
					await new Promise(res => setTimeout(res, 100));
				}
				return;
				/*const res = await sendCommand({ prime, mode: 2, n: 5000 });
				resText = (res.result || "[EMTPYRES]").slice(primeLength);
				resText = resText.slice(0, resText.indexOf("// [EOF]"));*/
			} else {
				const res = await sendCommand({ prime, mode: 2, n: d.chars });
				resText = (res.result || "[EMTPYRES]").slice(primeLength);
				resText = resText.slice(0, d.chars);
			}
			console.log("RESTE", resText);
			editor = vscode.window.activeTextEditor;
			editor.edit(e => {
				e.insert(editor.selection.active, resText);
			});
		} catch (e) {
			console.error("CMOP", e);
		}
	}
	vscode.commands.registerCommand("deep.complete", doThing);
}
export function deactivate() {
	console.log("killing external");
	proc.kill();
}
