import { Buffer } from "node:buffer";
import { writeFile } from "node:fs";
import { parseArgs } from "node:util";
import { asString, generateCsv, mkConfig } from "export-to-csv";

import type { Transaction, TransactionsResponse } from "./types";
import { splitDateRangeByYears } from "./utils";

const csvConfig = mkConfig({ useKeysAsHeaders: true });

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

const dateRanges = splitDateRangeByYears(
	startDate as string,
	endDate as string,
);
console.log("Date ranges by year:", dateRanges);

async function getTransactions({
	startDate,
	endDate,
}: {
	startDate: string;
	endDate: string;
}) {
	const apiUrl = new URL("https://dev.lunchmoney.app/v1/transactions");
	apiUrl.searchParams.set("start_date", startDate);
	apiUrl.searchParams.set("end_date", endDate);
	let transactions: Transaction[] = [];
	let formatedTransactions = [];

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
		transactions = data.transactions || [];
		formatedTransactions = transactions.map((t) => ({
			...t,
			plaid_metadata: JSON.stringify(t.plaid_metadata),
			tags: t.tags?.join(","),
		}));

		console.log(`Found ${formatedTransactions.length} transactions`);
		// console.log(JSON.stringify(transactions, null, 2));
	} catch (error) {
		console.error("Error fetching transactions:", error);
		process.exit(1);
	}

	const csv = generateCsv(csvConfig)(formatedTransactions as any);
	const filename = `export-${startDate}-${endDate}.csv`;
	const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));

	writeFile(filename, csvBuffer, (err) => {
		if (err) throw err;
		console.log("file saved: ", filename);
	});
}
