const fs = require("fs");

const cfgs = Array(15)
	.fill(0)
	.map(_ => {
		let tabs = Math.random() > 0.5;
		x = {
			printWidth: (Math.random() * 100 + 50) | 0,
			bracketSpacing: Math.random() > 0.3,
			jsxBracketSameLine: Math.random() < 0.3
		};
		if (tabs) {
			x.useTabs = true;
			x.tabWidth = 4;
		} else {
			x.useTabs = false;
			x.tabWidth = (Math.random() * 3 + 2) | 0;
		}
		return x;
	});

for (const [i, cfg] of cfgs.entries()) {
	fs.writeFileSync("rcs/prettierrc" + i, JSON.stringify(cfg, null, "\t"));
}
