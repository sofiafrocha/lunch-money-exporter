export interface Transaction {
	id: number;
	date: string;
	payee: string;
	amount: string;
	currency: string;
	notes: string | null;
	category_id: number | null;
	asset_id: number | null;
	plaid_account_id: number | null;
	plaid_metadata: string;
	status: string;
	is_group: boolean;
	group_id: string | null;
	parent_id: number | null;
	external_id: string | null;
	original_name: string | null;
	type: string | null;
	subtype: string | null;
	fees: number | null;
	price: number | null;
	quantity: number | null;
	recurring_id: number | null;
	tags: Array<{ id: number; name: string }> | null;
}

export interface TransactionsResponse {
	transactions: Transaction[];
}
