# lunch-money-exporter

Exports transactions from the [Lunch Money API](https://lunchmoney.dev/) to CSV files.

The actual exporter entry point is `src/index.ts`. The root `index.ts` is only the default Bun starter file.

## Requirements

- [Bun](https://bun.sh/)
- A Lunch Money API token

## Install

```bash
bun install
```

## Run

Create a `.env` file with your Lunch Money API token:

```bash
LUNCH_MONEY_API_KEY=YOUR_LUNCH_MONEY_API_TOKEN
```

```bash
mkdir -p exports
bun run src/index.ts --startDate 2024-01-01 --endDate 2024-12-31 --outFolder ./exports
```

Required arguments:

- `--startDate`: first transaction date to export, in `YYYY-MM-DD` format

Optional arguments:

- `--apiKey`: your Lunch Money API token. Defaults to `LUNCH_MONEY_API_KEY` from the environment.
- `--endDate`: last transaction date to export, in `YYYY-MM-DD` format. Defaults to today.
- `--outFolder`: existing folder where CSV files are written. Defaults to the current directory.

Example using defaults for `endDate` and `outFolder`:

```bash
bun run src/index.ts --startDate 2024-01-01
```

## Output

The script writes files named like:

```text
export-2024-01-01-2024-12-31.csv
```

If the requested date range spans multiple years, the script splits the export into one CSV per year.
