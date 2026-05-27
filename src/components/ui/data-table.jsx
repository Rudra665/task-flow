import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table.jsx";

function DataTable({
	columns,
	data,
	getRowKey,
	emptyState,
	tableClassName = "",
}) {
	if (!data.length) {
		return emptyState ?? null;
	}

	return (
		<div className="overflow-hidden rounded-3xl border border-(--border-color) bg-(--surface) shadow-sm">
			<Table className={tableClassName}>
				<TableHeader>
					<TableRow className="bg-(--surface-2) hover:bg-(--surface-2)">
						{columns.map((column) => (
							<TableHead
								key={column.key}
								className={column.headerClassName}
							>
								{column.header}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>

				<TableBody>
					{data.map((row, rowIndex) => (
						<TableRow key={getRowKey(row, rowIndex)}>
							{columns.map((column) => (
								<TableCell
									key={column.key}
									className={column.cellClassName}
								>
									{column.cell(row, rowIndex)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export { DataTable };
