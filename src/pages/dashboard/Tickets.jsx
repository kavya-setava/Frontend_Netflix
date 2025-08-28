import React, { useState, useEffect } from 'react';
import ReusableTable from '../../components/table/ReusableTable';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import "../../style/Style.css";
import { Card } from 'react-bootstrap';
import { Download } from 'lucide-react';

const Tickets = () => {
  const [role, setRole] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
    const [assignedCount, setAssignedCount] = useState(0);
const [closedCount, setClosedCount] = useState(0);
const [totalCount, setTotalCount] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));
  const email=localStorage.getItem("email")
  const [paginationGroup, setPaginationGroup] = useState(0); // 0 = pages 1-5, 1 = pages 6-10, etc.
const pagesPerGroup = 5;

const [selectedRegions, setSelectedRegions] = useState([]);
const [selectedCM, setSelectedCM] = useState([]); // was null
const [selectedTicketId, setSelectedTicketId] = useState([]); // was null

const [allTicketsData, setAllTicketsData] = useState([]);
const [cmOptions, setCmOptions] = useState([]);
const [ticketIdOptions, setTicketIdOptions] = useState([]);



  const [globalMetrics, setGlobalMetrics] = useState({
    totalTickets: 0,
    assignedTickets: 0,
    closedTickets: 0,
    startTickets: 0,
    interimTickets: 0,
    needMoreInfoTickets: 0,
    sentToVaoTickets: 0,
    solutionProvidedTickets: 0,
  });

  

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
const [dropdownData, setDropdownData] = useState([]);


useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("user")); // stored after login
  if (userData?.role !== undefined) {
    setRole(userData.role);
  }
}, []);

  
const handleRegionChange = (selectedOptions) => {
  setSelectedRegions(selectedOptions || []);
  setSelectedCM([]); // reset CM when region changes
  setSelectedTicketId([]); // reset ticket IDs too
  setPage(1);
  setPaginationGroup(0);
};

  const handleCmChange = (selectedOptions) => {
    setSelectedCM(selectedOptions || []);
     setSelectedTicketId([]);
    setPage(1);
    setPaginationGroup(0);
  };
  const handleTicketIdChange = (selectedOptions) => {
    setSelectedTicketId(selectedOptions || []);
    setPage(1); // Reset page to 1
    setPaginationGroup(0);
  };
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setPage(1); // Reset page to 1
    setPaginationGroup(0);
  };
  const handleEndDateChange = (date) => {
    setEndDate(date);
    setPage(1); // Reset page to 1
    setPaginationGroup(0);
  };


  const regionOptions = [
    { value: 'EMEA', label: 'EMEA' },
    { value: 'UCAN', label: 'UCAN' },
    { value: 'APAC', label: 'APAC' },
    { value: 'LATAM', label: 'LATAM' }
  ];





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
  }, [selectedRegions, selectedCM, selectedTicketId, startDate, endDate, page]); // This hook reacts to all changes, ,assignedCount,totalCount,closedCount removed for correct count as per accuracy

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
                setGlobalMetrics(json.metrics || { totalTickets: 0, assignedTickets: 0, closedTickets: 0, startTickets: 0, interimTickets: 0, needMoreInfoTickets: 0, sentToVaoTickets: 0, solutionProvidedTickets: 0 });
            }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    const fetchAllTicketsForDropdowns = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/getNetflixTickets?email=${email}&page=1&limit=999999`);
        const json = await res.json();
        if (json.success) {
          setAllTicketsData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch all ticket data for dropdowns", err);
      }
    };
    useEffect(() => {
      fetchAllTicketsForDropdowns();
    }, []);

  const [timers, setTimers] = useState({});
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
  
      tickets.forEach((ticket) => {
        // Assuming you have a SLA start timestamp (example: ticket.createdAt)
        const slaStartTime = new Date(ticket.createdAt).getTime();
  
        // SLA limit in milliseconds (2 hours)
        const slaLimit = 2 * 60 * 60 * 1000;
  
        // Time left = SLA limit - time passed
        const timeLeft = slaLimit - (Date.now() - slaStartTime);
  
        const totalSeconds = Math.floor(timeLeft / 1000);
        const hrs = String(Math.floor(Math.abs(totalSeconds) / 3600)).padStart(2, '0');
        const mins = String(Math.floor((Math.abs(totalSeconds) % 3600) / 60)).padStart(2, '0');
        const secs = String(Math.abs(totalSeconds) % 60).padStart(2, '0');
  
        newTimers[ticket._id] = {
          text: `${hrs}:${mins}:${secs}`,
          expired: totalSeconds < 0 // expired means SLA passed
        };
      });
  
      setSlaTimers(newTimers);
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

useEffect(() => {
  const filteredByRegion = selectedRegions.length > 0
    ? allTicketsData.filter(t => selectedRegions.map(r => r.value).includes(t.cm_region))
    : allTicketsData;

  const uniqueCms = Array.from(new Set(filteredByRegion.map(t => t.CM_name))).filter(Boolean);
  setCmOptions(uniqueCms.map(name => ({ value: name, label: name })));

  const filteredByCm = selectedCM.length > 0
    ? filteredByRegion.filter(t => selectedCM.map(c => c.value).includes(t.CM_name))
    : filteredByRegion;

  const uniqueTickets = Array.from(new Set(filteredByCm.map(t => t.ticketKey))).filter(Boolean);
  setTicketIdOptions(uniqueTickets.map(key => ({ value: key, label: key })));
}, [selectedRegions, selectedCM, allTicketsData]);





function CountdownTimer({ timeRemaining }) {

  const parseTimeToSeconds = (timeStr) => {
    // Example: "-108:05:41" → negative
    const isNegative = timeStr.startsWith("-");
    const parts = timeStr.replace("-", "").split(":").map(Number);
    const totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    return isNegative ? -totalSeconds : totalSeconds;
  };

  const [secondsRemaining, setSecondsRemaining] = useState(
    parseTimeToSeconds(timeRemaining)
  );

  useEffect(() => {
    // Sync with backend whenever timeRemaining prop changes (e.g., on refresh)
    setSecondsRemaining(parseTimeToSeconds(timeRemaining));
  }, [timeRemaining]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1); // always decrement by 1 sec
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

 const formatTime = (totalSeconds) => {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const hours = String(Math.floor(absSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((absSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(absSeconds % 60).padStart(2, "0");
    return `${isNegative ? "-" : ""}${hours}:${minutes}:${seconds}`;
  };


  return (
    <span style={{ fontWeight: "bold" }}>
      {formatTime(secondsRemaining)}
    </span>
  );
}
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
      label: 'Created Date & Time',
      key: 'created'
    },
{
  label: 'Last Updated Date & Time',
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
        //console.log(row.slaData.timeRemaining);
        // const timeStr = row.slaData.timeRemaining || '00:00:00';
        // const [h, m, s] = timeStr.split(':').map(Number);
        // const totalSeconds = h * 3600 + m * 60 + s;

        // let color = 'green';
        // if (totalSeconds <= 2700 && totalSeconds > 1800) color = 'orange';
        // if (totalSeconds <= 1800) color = 'red';
        // if(row.status == 'Need More Information' || row.status == 'Closed' || row.status == 'Sent to VAO'){
        //   color = 'green';
        //   return <span style={{ color, fontWeight: 'bold' }}>00:00:00</span>;
        // }else{
        //   //return <span style={{ color, fontWeight: 'bold' }}>{totalSeconds}</span>;
        //   return <span style={{ color, fontWeight: 'bold' }}><CountdownTimer initialSeconds={totalSeconds} /></span>;
        // }

       // Convert "HH:MM:SS" or "-HH:MM:SS" to total seconds
       const parseToSeconds = (timeStr) => {
        if (!timeStr) return 0;
        
        const isNegative = timeStr.startsWith("-");
        const cleanTime = timeStr.replace("-", "");
        
        const parts = cleanTime.split(":").map(Number);
        let total = 0;
        if (parts.length === 3) {
          const [hh, mm, ss] = parts;
          total = hh * 3600 + mm * 60 + ss;
        }
        return isNegative ? -total : total;
      };
      
      // const totalSeconds = parseToSeconds(row.slaData.timeRemaining);
      const totalSeconds = parseToSeconds(row.SLA);
      
      let color = "green";
      
      // Special statuses override everything
      if (
        row.status === "Need More Information" ||
        row.status === "Closed" ||
        row.status === "Sent to VAO"
      ) {
        color = "green";
        return (
          <span style={{ color }}>
            <span style={{ fontWeight: "bold" }}>
             {/* {row.slaData.timeRemaining} */}
               {row.SLA}
            </span>
          </span>
        );
      } else if (totalSeconds < 0) {
        color = "red"; // overdue
        return (
          <span style={{ color }}>
            {/* <CountdownTimer timeRemaining={row.slaData.timeRemaining} /> */}
            <CountdownTimer timeRemaining={row.SLA} />
          </span>
        );
      } else if (totalSeconds <= 1800) {
        color = "red"; // 30 min or less
        return (
          <span style={{ color }}>
            {/* <CountdownTimer timeRemaining={row.slaData.timeRemaining} /> */}
            <CountdownTimer timeRemaining={row.SLA} />
          </span>
        );
      } else if (totalSeconds <= 2700 && totalSeconds > 1800) {
        color = "orange"; // 45–30 min
        return (
          <span style={{ color }}>
            {/* <CountdownTimer timeRemaining={row.slaData.timeRemaining} /> */}
            <CountdownTimer timeRemaining={row.SLA} />
          </span>
        );
      }else{
        color = "green"; // 45–30 min
         //console.log(row);
        return (
          <span style={{ color }}>
            {/* <CountdownTimer timeRemaining={row.slaData.timeRemaining} /> */}
            <CountdownTimer timeRemaining={row.SLA} />
          </span>
        );
      }
      
      
      

      }
    },
    ...(Number(user?.role) !== 1  ? [{ label: 'Name of CM', key: 'CM_name' }] : []),
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
        isClearable={Number(user?.role) === 1} // allow clearing only for CM
        // isDisabled={user?.role === 0} // disable for QM and others
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
          `http://localhost:5000/api/getNetflixTickets?email=${email}&role=0&page=${page}&limit=25&cmRegionList=${cmRegionList}&cmNameList=${cmNameList}&ticketKeyList=${ticketKeyList}&createdFrom=${createdFrom}&createdTo=${createdTo}`
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
const downloadCSV = async () => {
  try {
    const cmRegionList = selectedRegions.map((r) => r.value).join(",");
    const cmNameList = selectedCM.map((c) => c.value).join(",");
    const ticketKeyList = selectedTicketId.map((t) => t.value).join(",");
    const createdFrom = startDate ? startDate.toISOString().split("T")[0] : "";
    const createdTo = endDate ? endDate.toISOString().split("T")[0] : "";

    const res = await fetch(
      `http://localhost:5000/api/getNetflixTickets?email=${email}&page=1&limit=999999&cmRegionList=${cmRegionList}&cmNameList=${cmNameList}&ticketKeyList=${ticketKeyList}&createdFrom=${createdFrom}&createdTo=${createdTo}`
    );
    const json = await res.json();

    if (!json.success || !json.data || json.data.length === 0) {
      alert("No data to download");
      return;
    }

    const allTickets = json.data;

    // Headers from columns
    const headers = columns.map((col) =>
      typeof col.label === "string"
        ? col.label
        : col.label?.props?.children?.[0] || ""
    );

    // Rows
    const rows = allTickets.map((row) => {
      return columns.map((col) => {
        let val = "";

        // Special handling for SLA column
        // if (col.key === "SLA" && row.slaData?.timeRemaining != null) {
        //   val = row.slaData.timeRemaining; // keep the negative if exists
        // }
         if (col.key === "SLA" && row.SLA) {
          val = row.SLA; // keep the negative if exists
        }
        // If column has a key and exists in row
        else if (col.key && row[col.key] !== undefined) {
          val = row[col.key];
        }
        // If column has a render function, use it for CSV too
        else if (typeof col.render === "function") {
          const rendered = col.render(row);
          // Extract text from JSX if needed
          if (typeof rendered === "string") {
            val = rendered;
          } else if (React.isValidElement(rendered)) {
            val = rendered.props?.children
              ? (Array.isArray(rendered.props.children)
                  ? rendered.props.children.join("")
                  : rendered.props.children)
              : "";
          } else {
            val = rendered ?? "";
          }
        }

        if (typeof val === "object") val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    });

    // CSV Content
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tickets_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    alert("Error generating report");
  }
};



  return (
    <div className="p-4">

      <Card>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="fs-1 mb-0" style={{ fontSize: "16px" }}>
            <strong>Tickets List</strong>
          </h1>

        </div>

        
        <div className="d-flex gap-3 mt-4 flex-wrap align-items-center" style={{display:"flex"}}>
        {Number(user?.role) === 0 && (
<>

<div style={{ minWidth: 200 , marginBottom: "14px" }}>
        <Select
          isMulti
          options={regionOptions}
          value={selectedRegions}
          onChange={handleRegionChange}
          placeholder="Select Region(s)"
          classNamePrefix="react-select"
        />
      </div>

</>
 )}
</div>       

        {/* Count Cards */}
        <div className="d-flex flex-wrap gap-3 mb-4" style={{display:"flex"}}>
          <div className="card text-white bg-warning p-3" style={{ display:"flex" }}>
            <h6>Total :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}> {globalMetrics.totalTickets}</h4>
          </div>
          <div className="card text-white bg-danger p-3" style={{ display:"flex" }}>
            <h6>Assigned :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.assignedTickets}</h4>
          </div>
          <div className="card text-white bg-success p-3" style={{ display:"flex" }}>
          <h6>Closed :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}> {globalMetrics.closedTickets}</h4>
          </div>
          <div className="card text-white bg-primary p-3" style={{ display:"flex" }}>
            <h6>Start :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.startTickets}</h4>
          </div>
          <div className="card text-white bg-secondary p-3" style={{ display:"flex" }}>
            <h6>interim :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.interimTickets}</h4>
          </div>
          <div className="card text-white bg-info p-3" style={{ display:"flex" }}>
            <h6>Need More Info :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.needMoreInfoTickets}</h4>
          </div>
          <div className="card text-white p-3" style={{ backgroundColor: "#564d4d", display:"flex" }}>
            <h6>Sent to VAO :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.sentToVaoTickets}</h4>
          </div>
          <div className="card text-white bg-dark p-3" style={{ display:"flex" }}>
            <h6>Solution Provided :</h6>
            <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.solutionProvidedTickets}</h4>
          </div>
        </div>

        {/* Filter Section */}
        <div className="d-flex gap-3 mt-4 flex-wrap align-items-center" style={{display:"flex"}}>
   {Number(user?.role) === 0 && (
    <>
      {/* <div style={{ minWidth: 200 }}>
        <Select
          isMulti
          options={regionOptions}
          value={selectedRegions}
          onChange={handleRegionChange}
          placeholder="Select Region(s)"
          classNamePrefix="react-select"
        />
      </div> */}

      <div style={{ minWidth: 200 }}>
        <Select
          isClearable
          isMulti
          options={cmOptions}
          placeholder="Select CM"
          value={selectedCM}
          onChange={handleCmChange}
        />
      </div>

      <div style={{ minWidth: 200 }}>
        <Select
          isClearable
          isMulti
          options={ticketIdOptions}
          placeholder="Select Ticket ID"
          value={selectedTicketId}
          onChange={handleTicketIdChange}
        />
      </div>

      <div className="form-group pe-3 flex">
        <label htmlFor="fromDate" className="mb-1"><strong>From Date : </strong></label>
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
        <label htmlFor="toDate" className="mb-1"><strong>To Date : </strong></label>
        <input
          type="date"
          id="toDate"
          className="form-control p-2 ms-1"
          min={startDate ? startDate.toISOString().split('T')[0] : ''}
         // max={new Date().toISOString().split('T')[0]}
          value={endDate ? endDate.toISOString().split('T')[0] : ''}
          onChange={(e) => handleEndDateChange(e.target.value ? new Date(e.target.value) : null)}
        />
      </div>

      <button className="btn btn-outline-secondary" onClick={resetFilters}>
        Reset Filters
      </button>
    </>
  )}
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
             onClick={downloadCSV}
          >
            <Download size={16}
          
            />
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