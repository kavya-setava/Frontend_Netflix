// import React from "react";

// const ReusableTable = ({ columns, data }) => {
//    const myDivStyle = {
//     minHeight: '100vh'
//   };
//   return (
//     <div className="table-responsive" style={myDivStyle}>
//       <table className="table-striped table-hover">
//         <thead>
//           <tr>
//             {columns?.map((col, index) => (
//               <th key={index} className={col.className || "text-center"}>
//                 {col.label}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {data?.map((row, index) => (
//             <tr key={row.id || index}>
//               {columns?.map((col, colIndex) => (
//                 <td key={colIndex} className="text-center">
//                   {col.render ? col.render(row, index) : row[col.key]} {/* Pass index here */}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ReusableTable;

import React, { useRef, useEffect, useState } from "react";

const ReusableTable = ({ columns, data }) => {
  const tableRef = useRef(null);
  const scrollbarRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState("100%");

  useEffect(() => {
    const tableDiv = tableRef.current;
    const scrollbarDiv = scrollbarRef.current;

    if (!tableDiv || !scrollbarDiv) return;

    // Handlers
    const handleTableScroll = () => {
      scrollbarDiv.scrollLeft = tableDiv.scrollLeft;
    };
    const handleScrollbarScroll = () => {
      tableDiv.scrollLeft = scrollbarDiv.scrollLeft;
    };

    tableDiv.addEventListener("scroll", handleTableScroll);
    scrollbarDiv.addEventListener("scroll", handleScrollbarScroll);

    // Match scrollbar width to table scrollable area
    setScrollWidth(tableDiv.scrollWidth);

    return () => {
      tableDiv.removeEventListener("scroll", handleTableScroll);
      scrollbarDiv.removeEventListener("scroll", handleScrollbarScroll);
    };
  }, [data, columns]);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Main table container - horizontal scrollbar hidden */}
      <div
        ref={tableRef}
        style={{
          overflowX: "scroll",
          overflowY: "auto", // vertical scrolling still works
          maxHeight: "calc(100vh - 20px)", // reserve space for fake scrollbar
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
        className="hide-scrollbar"
      >
        <style>
          
        </style>

        <table className="table table-striped table-hover">
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
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sticky horizontal scrollbar (only one visible at screen bottom) */}
      <div
        ref={scrollbarRef}
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          height: "16px",
          overflowX: "auto",
          background: "#f1f1f1",
          zIndex: 3,
        }}
      >
        <div style={{ width: scrollWidth, height: "1px" }} />
      </div>
    </div>
  );
};

export default ReusableTable;
