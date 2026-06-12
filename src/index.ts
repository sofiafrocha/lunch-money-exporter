import { Buffer } from "node:buffer";
import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { asString, generateCsv, mkConfig } from "export-to-csv";

import type { Transaction, TransactionsResponse } from "./types";
import { splitDateRangeByYears } from "./utils";

type CsvValue = string | number | boolean | null | undefined;

const csvHeaders = [
	"id",
	"date",
	"amount",
	"currency",
	"to_base",
	"payee",
	"category_id",
	"category_name",
	"category_group_id",
	"category_group_name",
	"is_income",
	"exclude_from_budget",
	"exclude_from_totals",
	"created_at",
	"updated_at",
	"status",
	"is_pending",
	"notes",
	"original_name",
	"recurring_id",
	"recurring_payee",
	"recurring_description",
	"recurring_cadence",
	"recurring_granularity",
	"recurring_quantity",
	"recurring_type",
	"recurring_amount",
	"recurring_currency",
	"parent_id",
	"has_children",
	"group_id",
	"is_group",
	"asset_id",
	"asset_institution_name",
	"asset_name",
	"asset_display_name",
	"asset_status",
	"plaid_account_id",
	"plaid_account_name",
	"plaid_account_mask",
	"institution_name",
	"plaid_account_display_name",
	"plaid_metadata",
	"source",
	"display_name",
	"display_notes",
	"account_display_name",
	"tags",
	"external_id",
];

const csvConfig = mkConfig({ columnHeaders: csvHeaders });

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
		outFolder: {
			type: "string",
		},
	},
	strict: true,
	allowPositionals: true,
});

const apiKey = values.apiKey ?? Bun.env.LUNCH_MONEY_API_KEY;
const { startDate } = values;
let { endDate, outFolder } = values;

if (!apiKey) {
	throw new Error(
		"API key must be passed with --apiKey or set as LUNCH_MONEY_API_KEY",
	);
}
if (!startDate) {
	throw new Error("A start date must be passed");
}
if (!endDate) {
	endDate = new Date().toISOString().slice(0, 10);
}
if (!outFolder) {
	outFolder = ".";
}

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
	let formatedTransactions: Record<string, CsvValue>[] = [];

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

		console.log(
			`Found ${formatedTransactions.length} transactions between ${startDate} to ${endDate}`,
		);
		// console.log(JSON.stringify(transactions, null, 2));
	} catch (error) {
		console.error("Error fetching transactions:", error);
		process.exit(1);
	}

	const csv = generateCsv(csvConfig)(formatedTransactions);
	const filename = `${outFolder}/export-${startDate}-${endDate}.csv`;
	const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));

	await writeFile(filename, csvBuffer);
	console.log("file saved: ", filename);
}

const dateRanges = splitDateRangeByYears(
	startDate as string,
	endDate as string,
);

const transactionPromises = dateRanges.map((range) => {
	const [startDate, endDate] = range as [string, string];
	return getTransactions({ startDate, endDate });
});

Promise.all(transactionPromises)
	.then(() => {
		console.log("All transactions fetched successfully.");
	})
	.catch((error) => {
		console.error("Error fetching transactions:", error);
	});
