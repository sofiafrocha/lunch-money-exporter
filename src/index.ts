import { parseArgs } from "node:util";

// Process the args that were passed
const { values } = parseArgs({
	args: Bun.argv,
	options: {
		apiKey: {
			type: "string",
		},
		startDate: {
			type: "string",
		},
		endDate: {
			type: "string",
		},
	},
	strict: true,
	allowPositionals: true,
});

const { apiKey, startDate } = values;
let { endDate } = values;

if (!apiKey) {
	throw new Error("API Key must be passed");
}
if (!startDate) {
	throw new Error("A start date must be passed");
}
if (!endDate) {
	endDate = new Date().toISOString().slice(0, 10);
}
