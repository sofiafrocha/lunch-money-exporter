import { parseArgs } from "node:util";
import type { TransactionsResponse } from "./types";

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

// Get all transactions from those two dates
const apiUrl = new URL("https://dev.lunchmoney.app/v1/transactions");
apiUrl.searchParams.set("start_date", startDate);
apiUrl.searchParams.set("end_date", endDate);

try {
	const response = await fetch(apiUrl.toString(), {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Failed to fetch transactions: ${response.status} ${response.statusText}\n${errorText}`,
		);
	}

	const data = (await response.json()) as TransactionsResponse;
	const transactions = data.transactions || [];

	console.log(`Found ${transactions.length} transactions`);
	console.log(JSON.stringify(transactions, null, 2));
} catch (error) {
	console.error("Error fetching transactions:", error);
	process.exit(1);
}
