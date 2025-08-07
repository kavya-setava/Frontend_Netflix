import React, { useState, useEffect } from 'react';
import ReusableTable from '../../components/table/ReusableTable';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import "../../style/Style.css";
import { Card } from 'react-bootstrap';
import { Download } from 'lucide-react';

const Tickets = () => {
  const [showDateRange, setShowDateRange] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
    const [assignedCount, setAssignedCount] = useState(0);
const [closedCount, setClosedCount] = useState(0);
const [totalCount, setTotalCount] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));
  const email=localStorage.getItem("email")
  const [paginationGroup, setPaginationGroup] = useState(0); // 0 = pages 1-5, 1 = pages 6-10, etc.
const pagesPerGroup = 5;




  const [globalMetrics, setGlobalMetrics] = useState({
    totalTickets: 0,
    assignedTickets: 0,
    closedTickets: 0,
  });


  
  const handleRegionChange = (selectedOptions) => {
    setSelectedRegions(selectedOptions || []);
    setPage(1); // Reset page to 1
  };
  const handleCmChange = (selectedOptions) => {
    setSelectedCM(selectedOptions || []);
    setPage(1); // Reset page to 1
  };
  const handleTicketIdChange = (selectedOptions) => {
    setSelectedTicketId(selectedOptions || []);
    setPage(1); // Reset page to 1
  };
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setPage(1); // Reset page to 1
  };
  const handleEndDateChange = (date) => {
    setEndDate(date);
    setPage(1); // Reset page to 1
  };


  const regionOptions = [
    { value: 'EMEA', label: 'EMEA' },
    { value: 'UCAN', label: 'UCAN' },
    { value: 'APAC', label: 'APAC' },
    { value: 'LATAM', label: 'LATAM' }
  ];


  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCM, setSelectedCM] = useState([]); // was null
const [selectedTicketId, setSelectedTicketId] = useState([]); // was null


  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


const getPageNumbers = () => {
  const startPage = paginationGroup * pagesPerGroup + 1;
  const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
};
useEffect(() => {
  setPaginationGroup(0);
}, [selectedRegions, selectedCM, selectedTicketId, startDate, endDate]);

  
  useEffect(() => {
 

    fetchTickets();
  }, [selectedRegions, selectedCM, selectedTicketId, startDate, endDate, page,assignedCount,totalCount,closedCount]); // This hook reacts to all changes

   const fetchTickets = async () => {
      const cmRegionList = selectedRegions.map((r) => r.value).join(',');
      const cmNameList = selectedCM.map((c) => c.value).join(',');
      const ticketKeyList = selectedTicketId.map((t) => t.value).join(',');
      const createdFrom = startDate ? startDate.toISOString().split('T')[0] : '';
      const createdTo = endDate ? endDate.toISOString().split('T')[0] : '';

      try {
        const res = await fetch(
          `http://localhost:5000/api/getNetflixTickets?email=${email}&page=${page}&limit=25&cmRegionList=${cmRegionList}&cmNameList=${cmNameList}&ticketKeyList=${ticketKeyList}&createdFrom=${createdFrom}&createdTo=${createdTo}`
        );
        const json = await res.json();
        if (json.success) {
            setProjects(json.data);
            setTotalPages(json.totalPages);
            
            // Set the global metrics ONLY if it's the first page and no other filters are active.
            const isFirstLoad = page === 1 && !cmRegionList && !cmNameList && !ticketKeyList && !createdFrom && !createdTo;
            if (isFirstLoad) {
                setGlobalMetrics(json.metrics || { totalTickets: 0, assignedTickets: 0, closedTickets: 0 });
            }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

  const [timers, setTimers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};

      projects.forEach((proj) => {
        const diff = proj.endTimestamp - Date.now();
        const totalSeconds = Math.max(0, Math.floor(diff / 1000));
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');

        newTimers[proj.ticketKey] = `${hrs}:${mins}:${secs}`;
      });

      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [projects]);




const [metrics, setMetrics] = useState({
  totalTickets: 0,
  assignedTickets: 0,
  closedTickets: 0
});



useEffect(() => {
  setTotalCount(projects.length);
  setAssignedCount(projects.filter(item => item.status === "Assigned").length);
  setClosedCount(projects.filter(item => item.status === "Closed").length);
}, [projects]);

const [dropdownData, setDropdownData] = useState([]);
useEffect(() => {
  const fetchDropdownData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dropdown");
      const json = await res.json();
      if (json.success) {
        setDropdownData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
    }
  };

  fetchDropdownData();
}, []);

  const columns = [
    // {
    //   label: 'S. No',
    //   key: 'sno',
    //   render: (_, index) => index + 1
    // },
{
  label: 'Ticket ID',
  key: 'ticketKey',
  render: (row) => {
    const timeStr = timers[row.id] || '00:00:00';
    const [h, m, s] = timeStr.split(':').map(Number);
    const totalSeconds = h * 3600 + m * 60 + s;

    let badgeClass = 'bg-success';
    if (totalSeconds <= 1800 && totalSeconds > 600) badgeClass = 'bg-warning text-dark';
    if (totalSeconds <= 600) badgeClass = 'bg-danger';

    return (
      <a
        href={`https://netflix.atlassian.net/browse/${row.ticketKey}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`badge ${badgeClass}`}
        style={{
          fontSize: '0.9rem',
          textDecoration: 'underline'
        }}
      >
        {row.ticketKey}
      </a>
    );
  }
}
,

    {
      label: 'Assigned Date & Time',
      key: 'created'
    },
{
  label: 'Updated Date & Time',
  key: 'updated',
  render: (row) => {
    if (!row.updated) return '-';

    // Convert "YYYY-MM-DD HH:mm:ss" to ISO string for parsing
    const isoString = row.updated.replace(' ', 'T');

    const dateObj = new Date(isoString);

    if (isNaN(dateObj.getTime())) {
      return row.updated; // fallback raw string if invalid date
    }

    // Extract parts to format as YYYY-MM-DD HH:mm:ss
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const hh = String(dateObj.getHours()).padStart(2, '0');      // 24-hour
    const min = String(dateObj.getMinutes()).padStart(2, '0');
    const ss = String(dateObj.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }
}

,
    {
      label: (
        <div>
          End Time <br />
          <small style={{ fontWeight: 'normal' }}>(As per SLA - Reverse Countdown)</small>
        </div>
      ),
      key: 'SLA',
      render: (row) => {
        const timeStr = timers[row.ticketKey] || '00:00:00';
        const [h, m, s] = timeStr.split(':').map(Number);
        const totalSeconds = h * 3600 + m * 60 + s;

        let color = 'green';
        if (totalSeconds <= 2700 && totalSeconds > 1800) color = 'orange';
        if (totalSeconds <= 1800) color = 'red';


        return <span style={{ color, fontWeight: 'bold' }}>{timeStr}</span>;
      }
    },
    ...(user?.role !== 'cm' ? [{ label: 'Name of CM', key: 'CM_name' }] : []),
    {
      label: 'Name of AM',
      key: 'AM_name'
    },
    {
      label: 'Region',
      key: 'cm_region'
    },
    

    {
  label: 'Status',
  key: 'status',
  render: (row) => {
    return (
      <Select
        options={[
          { value: 'Start', label: 'Start' },
          { value: 'Interim', label: 'Interim' },
          { value: 'Solution Provided', label: 'Solution Provided' },
          { value: 'Need More Information', label: 'Need More Information' },
          { value: 'Closed', label: 'Closed' },
          { value: 'Sent to VAO', label: 'Sent to VAO' }
        ]}
        value={row.status ? { label: row.status, value: row.status } : null}
        isClearable
        classNamePrefix="react-select"
        styles={{
          container: (base) => ({
            ...base,
            minWidth: 180
          }),
          menu: (provided) => ({ ...provided, zIndex: 9999 })
        }}
  
 onChange={async (selectedOption) => {
  if (selectedOption?.value) {
    try {
      // 1. Update status in backend
      const response = await fetch(
        `http://localhost:5000/api/updateTicketByKey/${row.ticketKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: selectedOption.value })
        }
      );

      const updateResult = await response.json();

      if (updateResult.success) {
        console.log('✅ Status updated successfully');

        // 2. Now fetch the fresh ticket list with your filters and page
        const cmRegionList = selectedRegions.map(r => r.value).join(',');
        const cmNameList = selectedCM.map(c => c.value).join(',');
        const ticketKeyList = selectedTicketId.map(t => t.value).join(',');
        const createdFrom = startDate ? startDate.toISOString().split('T')[0] : '';
        const createdTo = endDate ? endDate.toISOString().split('T')[0] : '';

        const res = await fetch(
          `http://localhost:5000/api/getNetflixTickets?email=djavvaji@netflixcontractors.com&role=0&page=${page}&limit=25&cmRegionList=${cmRegionList}&cmNameList=${cmNameList}&ticketKeyList=${ticketKeyList}&createdFrom=${createdFrom}&createdTo=${createdTo}`
        );

        const data = await res.json();

        if (data.success) {
          setProjects(data.data);  // Update the tickets list state
          setTotalPages(data.totalPages || 1);  // Update pagination if needed
          // You can also update any metrics here if returned
        } else {
          console.error('❌ Failed to refresh ticket list');
        }
      } else {
        console.error('❌ Status update failed', updateResult.error);
      }
    } catch (error) {
      console.error('⛔ Error during status update or fetching tickets:', error);
    }
  }
}}


      />
    );
  }
}

    

  ];
  const resetFilters = () => {
  setSelectedRegions([]);
  setSelectedCM([]);
  setSelectedTicketId([]);
  setStartDate(null);
  setEndDate(null);
  setPage(1); // Optional: Reset to first page
  setPaginationGroup(0);
  fetchTickets();
   // Optional: Reset to first pagination group
};


  return (
    <div className="p-4">
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="fs-1 mb-0" style={{ fontSize: "16px" }}>
            <strong>Tickets List</strong>
          </h1>

        </div>

        {/* Count Cards */}
        <div className="d-flex flex-wrap gap-3 mb-4" style={{display:"flex"}}>
          <div className="card text-white bg-warning p-3" style={{ minWidth: 180,display:"flex" }}>
            <h6>Total Tickets :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}> {globalMetrics.totalTickets}</h4>
          </div>
          <div className="card text-white bg-danger p-3" style={{ minWidth: 180,display:"flex" }}>
            <h6>Assigned Tickets :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.assignedTickets}</h4>
          </div>
          <div className="card text-white bg-success p-3" style={{ minWidth: 180,display:"flex" }}>
          <h6>Closed Tickets :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}> {globalMetrics.closedTickets}</h4>
          </div>
        </div>

        {/* Filter Section */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-3 gap-2">
          <div className="d-flex gap-3 mt-4 flex-wrap align-items-center" style={{display:"flex"}}>
          {user?.role !== 'cm' && (
            <div style={{ minWidth: 200 }}>
              <Select
                isMulti 
                options={regionOptions}
                value={selectedRegions}
                onChange={handleRegionChange}
                placeholder="Select Region(s)"
                classNamePrefix="react-select"
              />
              
            </div>
              )}
            {user?.role !== "cm" && (
              <>
                <div style={{ minWidth: 200 }}>
                  <Select
                    isClearable
                    isMulti
                    options={Array.from(
                      new Set(dropdownData.map(item => item.ticketname))
                    ).map(name => ({ value: name, label: name }))}
                    placeholder="Select CM"
                    value={selectedCM}
                    onChange={handleCmChange}
                  />
                </div>

                <div style={{ minWidth: 200 }}>
                  <Select
                    isClearable
                    isMulti
                    options={dropdownData.map(item => ({
                      value: item.ticketkey,
                      label: item.ticketkey
                    }))}
                    placeholder="Select Ticket ID"
                    value={selectedTicketId}
                    onChange={handleTicketIdChange}
                  />
                </div>
                  <div className="form-group pe-3 flex">
              <label htmlFor="fromDate" className="mb-1 " style={{display:"flex",alignItems:"center"}}><strong>From Date : </strong></label>
              <input
                type="date"
                id="fromDate"
                className="form-control p-2 ms-1"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                 onChange={(e) => handleStartDateChange(e.target.value ? new Date(e.target.value) : null)}
                max={new Date().toISOString().split('T')[0]}

                
              />
            </div>
            <div className="form-group pe-3 flex">
              <label htmlFor="toDate" className="mb-1" style={{display:"flex",alignItems:"center"}}><strong>To Date : </strong></label>
              <input
                type="date"
                id="toDate"
                className="form-control p-2 ms-1"
                min={startDate ? startDate.toISOString().split('T')[0] : ''}
                max={new Date().toISOString().split('T')[0]}
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleEndDateChange(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            
  <button
    className="btn btn-outline-secondary"
    onClick={resetFilters}
  >
    Reset Filters
  </button>
              </>
            )}
          </div>

          {/* Date Range Filters */}
          <div className="flex gap-4 py-3 px-2">
          
          </div>
        </div>

        {/* Download Button */}
        <div className="d-flex gap-2 mb-5 mt-3" style={{ justifyContent: "flex-end",display:"flex" }}>
          <button
            className="d-flex align-items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              display:"flex"
            }}
          >
            <Download size={16} />
            Download Report
          </button>
        </div>

     {projects.length === 0 ? (
  <div className="text-center text-muted py-4 fw-bold fs-5">
    No Data Available
  </div>
) : (
  <ReusableTable columns={columns} data={projects} />
)}

<div className="flex justify-content-center align-items-center mt-4 gap-2 flex-wrap" style={{justifyContent:"end"}}>
  {getPageNumbers().map((p) => (
    <button
      key={p}
      className={`btn ${page === p ? 'btn-primary' : 'btn-outline-primary'}`}
      onClick={() => setPage(p)}
    >
      {p}
    </button>
  ))}

  {(paginationGroup + 1) * pagesPerGroup < totalPages && (
    <button
      className="btn btn-outline-secondary"
      onClick={() => setPaginationGroup((g) => g + 1)}
    >
      Next &rsaquo;
    </button>
  )}

  {paginationGroup > 0 && (
    <button
      className="btn btn-outline-secondary"
      onClick={() => setPaginationGroup((g) => g - 1)}
    >
      &lsaquo; Prev
    </button>
  )}
</div>


      </Card> 
    </div>
  );
};

export default Tickets;