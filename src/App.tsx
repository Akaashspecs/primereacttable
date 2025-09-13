import { PrimeReactProvider } from "primereact/api";
import Table from "./Table";

function App() {
  return (
    <>
      <div className="">
        <PrimeReactProvider>
          <Table />
        </PrimeReactProvider>
      </div>
    </>
  );
}

export default App;
