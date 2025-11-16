export function splitDateRangeByYears(
	startDate: string,
	endDate: string,
): string[][] {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const startYear = start.getFullYear();
	const endYear = end.getFullYear();

	const dateRanges: string[][] = [];

	// If same year, return single range
	if (startYear === endYear) {
		return [[startDate, endDate]];
	}

	// First year: startDate to end of year
	const firstYearEnd = `${startYear}-12-31`;
	dateRanges.push([startDate, firstYearEnd]);

	// Middle years: full year ranges
	for (let year = startYear + 1; year < endYear; year++) {
		dateRanges.push([`${year}-01-01`, `${year}-12-31`]);
	}

	// Last year: start of year to endDate
	const lastYearStart = `${endYear}-01-01`;
	dateRanges.push([lastYearStart, endDate]);

	return dateRanges;
}
