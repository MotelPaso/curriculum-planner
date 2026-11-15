export function readMinorParam(searchParams) {
	const raw = Number(searchParams.get("minor"));
	return Number.isInteger(raw) && raw > 0 ? raw : 0;
}

export function minorQuery(minorId) {
	return minorId ? `?minor=${minorId}` : "";
}
