import axios from "axios";

export const tableResponse = async (page: number) => {
  const tableData = await axios.get(
    `https://api.artic.edu/api/v1/artworks?page=${page}`
  );

  console.log(tableData);
  return tableData.data;
};
