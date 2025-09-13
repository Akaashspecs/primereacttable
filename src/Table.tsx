import { Column } from "primereact/column";
import {
  DataTable,
  type DataTableSelectionMultipleChangeEvent,
} from "primereact/datatable";
import type { OverlayPanel } from "primereact/overlaypanel";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { tableResponse } from "./api/ApiServices";
import OverLayPanel from "./OverLayPanel";

interface TableDataType {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number;
  date_end: number;
}

interface ResponseType {
  pagination: {
    current_page: number;
    limit: number;
    next_url: string;
    offset: number;
    total: number;
    total_pages: number;
  };
  data: TableDataType[];
}

const Table: React.FC = () => {
  const [tableData, setTableData] = useState<TableDataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [first, setFirst] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<number>(12);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<TableDataType[]>([]);
  const [rowClick] = useState(true);
  const openPanel = useRef<OverlayPanel>(null);
  const [selectedRows, setSelectedRows] = useState<number>(0);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response: ResponseType = await tableResponse(page);

        setTableData(response.data);
        setTotalRecords(response.pagination.total);
        setLoading(false);

        if (selectedRows && selectedRows > 12) {
          const RequiredRows = selectedRows - rows * (page - 1);
          const storageData = localStorage.getItem("selectedRows");
          const parsedData: number[] = storageData
            ? JSON.parse(storageData)
            : [];

          const saveToStorage = (ids: number[]) => {
            const uniqueIds = Array.from(new Set([...parsedData, ...ids]));
            localStorage.setItem("selectedRows", JSON.stringify(uniqueIds));
          };

          const selectedIds = response.data.filter((item) =>
            parsedData.includes(item.id)
          );

          if (selectedIds.length > 0 && RequiredRows > 0) {
            setSelectedProducts(selectedIds);
            return;
          }

          if (selectedIds.length === 0 && RequiredRows > 0) {
            const newSelection = response.data.filter(
              (_, index) => index < RequiredRows
            );

            const newIds = newSelection.map((item) => item.id);
            saveToStorage(newIds);
            setSelectedProducts(newSelection);
            return;
          }

          if (selectedIds.length === 0) {
            // Case: Nothing matched, just try again with fresh filter
            const newSelection = response.data.filter((item) =>
              parsedData.includes(item.id)
            );
            const newIds = newSelection.map((item) => item.id);
            saveToStorage(newIds);
            setSelectedProducts(newSelection);
          }
        }
      } catch (error) {
        console.error("Error fetching table data:", error);
        setError("Some Technical Error Occured");
        setLoading(false);
      }
    };

    fetchData();
  }, [first, rows]);

  const onHandleSubmit = () => {
    if (openPanel.current) {
      openPanel.current.hide();
    }
    if (selectedRows !== null) {
      const seletedData = tableData.filter((_, index) => index < selectedRows);
      const selectedId = seletedData.map((item) => item.id);
      localStorage.setItem("selectedRows", JSON.stringify(selectedId));
      setSelectedProducts(seletedData);
    }
  };

  const handleSelectedProducts = (
    e: DataTableSelectionMultipleChangeEvent<TableDataType[]>
  ) => {
    const id = e.value.map((item) => item.id);
    const rows = localStorage.getItem("selectedRows");
    if (e.originalEvent && (e.originalEvent as any).checked === true) {
      if (rows) {
        const parseRow = JSON.parse(rows);
        const requiredId = id.filter((item) => !rows.includes(String(item)));

        parseRow.push(...requiredId);
        localStorage.setItem("selectedRows", JSON.stringify(parseRow));
      } else {
        localStorage.setItem("selectedRows", JSON.stringify(id));
      }
    }
    if (e.originalEvent && (e.originalEvent as any).checked === false) {
      if (rows) {
        const selectedIds = tableData.map((item) => item.id);

        const parseRow: number[] = JSON.parse(rows);
        const unSelelectedRows = selectedIds.filter(
          (item) => !id.includes(item)
        );

        const selectedData = parseRow.filter(
          (item) => !unSelelectedRows.includes(item)
        );
        localStorage.setItem("selectedRows", JSON.stringify(selectedData));
        setSelectedRows(selectedRows - 1);
      } else {
        // localStorage.setItem("selectedRows", JSON.stringify(id));
      }
    }

    setSelectedProducts(e.value);
  };

  const checkboxHeaderTemplate = () => (
    <div>
      <RiArrowDropDownLine
        className="text-3xl hover:cursor-pointer"
        onClick={(e) => openPanel.current?.toggle(e)}
      />
    </div>
  );

  if (error && error.length === 0) {
    return (
      <div className=" h-screen w-screen text-center flex items-center justify-center text-5xl font-stretch-90%">
        {error}
      </div>
    );
  }

  if (loading && tableData.length === 0) {
    return (
      <div className=" h-screen w-screen text-center flex items-center justify-center text-5xl font-stretch-90%">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <OverLayPanel
        selectedRows={selectedRows}
        openPanel={openPanel}
        setSelectedRows={setSelectedRows}
        onHandleSubmit={onHandleSubmit}
      />
      <DataTable
        value={tableData}
        lazy
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords} // 👈 dynamic from API
        loading={loading}
        selection={selectedProducts}
        onSelectionChange={(
          e: DataTableSelectionMultipleChangeEvent<TableDataType[]>
        ) => handleSelectedProducts(e)}
        dataKey="id"
        showGridlines
        tableStyle={{ minWidth: "50rem" }}
        selectionMode={rowClick ? null : "checkbox"}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
          setPage((e.page as number) + 1);
        }}
      >
        <Column selectionMode="multiple" header={checkboxHeaderTemplate} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place Of Origin" />
        <Column field="artist_display" header="Artist Display" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>
    </div>
  );
};

export default Table;
