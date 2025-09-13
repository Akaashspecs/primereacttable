import { OverlayPanel } from "primereact/overlaypanel";
import React from "react";

interface OverrLaysProps {
  selectedRows: number;
  openPanel: React.RefObject<OverlayPanel | null>;
  setSelectedRows: React.Dispatch<React.SetStateAction<number>>;
  onHandleSubmit: () => void;
}

const OverLayPanel: React.FC<OverrLaysProps> = ({
  selectedRows,
  openPanel,
  setSelectedRows,
  onHandleSubmit,
}) => {
  return (
    <OverlayPanel className="mt-44 flex flex-col" ref={openPanel}>
      <div
        className="flex gap-3 
           flex-col  items-center"
      >
        <input
          type="number"
          className="border  rounded-xl h-12 no-spinner p-2"
          placeholder="Enter number of rows"
          value={selectedRows}
          onChange={(e) => setSelectedRows(Number(e.target.value))}
        />
        <button
          onClick={() => onHandleSubmit()}
          className="px-3 py-2 border mt-3 w-min rounded-xl bg-black text-white hover:cursor-pointer"
        >
          Submit
        </button>
      </div>
    </OverlayPanel>
  );
};

export default OverLayPanel;
