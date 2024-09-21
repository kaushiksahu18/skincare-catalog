"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Plus, Trash2, Filter, EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ColumnType = "text" | "number";

interface Column {
  name: string;
  type: ColumnType;
}

interface Row {
  id: string;
  [key: string]: string | number;
}

export default function SkincareCatalog() {
  const [columns, setColumns] = useState<Column[]>([
    { name: "PRODUCT_LINK", type: "text" },
    { name: "NAME", type: "text" },
    { name: "INGREDIENTS", type: "text" },
    { name: "PRICE", type: "number" },
  ]);
  const [rows, setRows] = useState<Row[]>([]);
  const [filters, setFilters] = useState<{
    [key: string]: { value: string; operation: string };
  }>({});
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState<ColumnType>("text");
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null);
  const filterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(filterRefs.current).forEach(([columnName, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          setFilters((prev) => ({
            ...prev,
            [columnName]: { ...prev[columnName], isOpen: false },
          }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addRow = () => {
    const newRow: Row = { id: Date.now().toString() };
    columns.forEach((col) => {
      newRow[col.name] = col.type === "number" ? 0 : "";
    });
    setRows([...rows, newRow]);
    console.log("Row added:", newRow);
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
    setDeleteRowId(null);
    console.log("Row deleted:", id);
  };

  const addColumn = () => {
    if (newColumnName && !columns.some((col) => col.name === newColumnName)) {
      const newColumn = { name: newColumnName, type: newColumnType };
      setColumns([...columns, newColumn]);
      setRows(
        rows.map((row) => ({
          ...row,
          [newColumnName]: newColumnType === "number" ? 0 : "",
        }))
      );
      setNewColumnName("");
      setIsAddColumnOpen(false);
      console.log("Column added:", newColumn);
    }
  };

  const updateColumn = (column: Column) => {
    if (newColumnName.trim().length > 0 && newColumnType) {
      const index = columns.findIndex((col) => col.name === column.name);
      columns[index].name = newColumnName;
      columns[index].type = newColumnType;
      setColumns([...columns]);
      setNewColumnName("");
      setNewColumnType("text");
      console.log("Column updated:", column);
    }
  };

  const deleteColumn = (column: Column) => {
    const index = columns.findIndex((col) => col.name === column.name);
    const deletedColumn = columns[index];
    columns.splice(index, 1);
    setColumns([...columns]);
    console.log("Column deleted:", deletedColumn);
  };

  const updateCellValue = (
    rowId: string,
    columnName: string,
    value: string | number
  ) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          return { ...row, [columnName]: value };
        }
        return row;
      })
    );
  };

  const applyFilter = (
    columnName: string,
    value: string,
    operation: string
  ) => {
    setFilters({ ...filters, [columnName]: { value, operation } });
  };

  const resetFilters = () => {
    setFilters({});
  };

  const filteredRows = rows.filter((row) => {
    return Object.entries(filters).every(([columnName, filter]) => {
      const cellValue = row[columnName];
      const filterValue = filter?.value?.toLowerCase();
      const column = columns.find((col) => col.name === columnName);

      if (column?.type === "number") {
        const numericValue = Number(cellValue);
        const numericFilterValue = Number(filterValue);
        switch (filter.operation) {
          case "greaterThan":
            return numericValue > numericFilterValue;
          case "lessThan":
            return numericValue < numericFilterValue;
          case "equalTo":
            return numericValue === numericFilterValue;
          default:
            return true;
        }
      } else {
        switch (filter.operation) {
          case "contains":
            return cellValue.toString().toLowerCase().includes(filterValue);
          case "notContains":
            return !cellValue.toString().toLowerCase().includes(filterValue);
          case "equals":
            return cellValue.toString().toLowerCase() === filterValue;
          default:
            return true;
        }
      }
    });
  });

  return (
    <div className="w-full mx-auto p-4 space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">Skincare Catalog</h1>
          <Button onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" /> Add Row
          </Button>
        </div>
      </Suspense>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.name} className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{column.name}</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80"
                        ref={(el) => {
                          filterRefs.current[column.name] = el;
                        }}
                      >
                        <div className="space-y-4">
                          <h4 className="font-medium leading-none">
                            Filter {column.name}
                          </h4>
                          <Select
                            value={filters[column.name]?.operation || ""}
                            onValueChange={(value) =>
                              applyFilter(
                                column.name,
                                filters[column.name]?.value || "",
                                value
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select operation" />
                            </SelectTrigger>
                            <SelectContent>
                              {column.type === "text" ? (
                                <>
                                  <SelectItem value="contains">
                                    Contains
                                  </SelectItem>
                                  <SelectItem value="notContains">
                                    Does Not Contain
                                  </SelectItem>
                                  <SelectItem value="equals">Equals</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="greaterThan">
                                    Greater Than
                                  </SelectItem>
                                  <SelectItem value="lessThan">
                                    Less Than
                                  </SelectItem>
                                  <SelectItem value="equalTo">
                                    Equal To
                                  </SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder={`Filter ${column.name}...`}
                            value={filters[column.name]?.value || ""}
                            onChange={(e) =>
                              applyFilter(
                                column.name,
                                e.target.value,
                                filters[column.name]?.operation || ""
                              )
                            }
                          />
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="flex flex-col"
                        ref={(el) => {
                          filterRefs.current[column.name] = el;
                        }}
                      >
                        <div className="flex flex-col gap-4">
                        <h4 className="font-medium leading-none">
                          Update {column.name}
                        </h4>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="name" className="text-right">
                              Update Name
                            </Label>
                            <Input
                              id="name"
                              value={newColumnName}
                              onChange={(e) => setNewColumnName(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="type" className="text-right">
                              Update Type
                            </Label>
                            <Select
                              value={newColumnType}
                              onValueChange={(value: ColumnType) =>
                                setNewColumnType(value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end items-center mt-2">
                          <Button
                            className="mx-1"
                            onClick={() => updateColumn(column)}
                          >
                            Update
                          </Button>
                          <Button
                            className="mx-1"
                            variant="destructive"
                            onClick={() => deleteColumn(column)}
                          >
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              ))}
              <TableHead>
                <Dialog
                  open={isAddColumnOpen}
                  onOpenChange={setIsAddColumnOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add New Column
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Column</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Field Name
                        </Label>
                        <Input
                          id="name"
                          value={newColumnName}
                          onChange={(e) => setNewColumnName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          Field Type
                        </Label>
                        <Select
                          value={newColumnType}
                          onValueChange={(value: ColumnType) =>
                            setNewColumnType(value)
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addColumn}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <Suspense fallback={<div>Loading Data...</div>}>
              {filteredRows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.name}`}>
                      <Input
                        type={column.type === "number" ? "number" : "text"}
                        value={row[column.name]}
                        onChange={(e) =>
                          updateCellValue(
                            row.id,
                            column.name,
                            column.type === "number"
                              ? Number(e.target.value)
                              : e.target.value
                          )
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteRowId(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Delete</DialogTitle>
                        </DialogHeader>
                        <p>
                          Are you sure you want to delete this row? This action
                          cannot be undone.
                        </p>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteRowId(null)}
                          >
                            No
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => deleteRow(row.id)}
                          >
                            Yes, Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </Suspense>
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={resetFilters}>
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}
