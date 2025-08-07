import React from "react";

const ReusableTable = ({ columns, data }) => {
  return (
    <div className="table-responsive">
      <table className="table-striped table-hover">
        <thead>
          <tr>
            {columns?.map((col, index) => (
              <th key={index} className={col.className || "text-center"}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row, index) => (
            <tr key={row.id || index}>
              {columns?.map((col, colIndex) => (
                <td key={colIndex} className="text-center">
                  {col.render ? col.render(row, index) : row[col.key]} {/* Pass index here */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;