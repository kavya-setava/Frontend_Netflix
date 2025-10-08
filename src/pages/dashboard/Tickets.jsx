import React, { useState, useEffect } from 'react';
import ReusableTable from '../../components/table/ReusableTable';
import ReusableModal from '../../components/Popup/ReusableModal';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import '../../style/Style.css';
import { Card } from 'react-bootstrap';
import { Download } from 'lucide-react';
import { space } from 'postcss/lib/list';

const Tickets = () => {
    const [role, setRole] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [assignedCount, setAssignedCount] = useState(0);
    const [closedCount, setClosedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));
    const email = localStorage.getItem('email');
    // const email = 'krajappa@netflixcontractors.com';
    const [paginationGroup, setPaginationGroup] = useState(0); // 0 = pages 1-5, 1 = pages 6-10, etc.
    const pagesPerGroup = 5;

    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedCM, setSelectedCM] = useState([]); // was null
    const [selectedTicketId, setSelectedTicketId] = useState([]); // was null

    const [allTicketsData, setAllTicketsData] = useState([]);
    const [cmOptions, setCmOptions] = useState([]);
    const [cmMasterList, setCmMasterList] = useState([]);
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
    const [taskOptions, setTaskOptions] = useState([]);
    const [taskDropdown, setTaskDropdown] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')); // stored after login
        if (userData?.role !== undefined) {
            setRole(userData.role);
        }
    }, []);

    //Fetching all the CM's
    useEffect(() => {
        const fetchCMs = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/getCMs`);
                const json = await res.json();
                if (json.success) {
                    setCmMasterList(json.data);
                }
            } catch (err) {
                console.error('Error fetching CM list:', err);
            }
        };

        fetchCMs();
    }, []);

    // notification start code
    useEffect(() => {
        // Function to show a desktop notification
        const showNotification = (msg) => {
            new Notification('New Message', {
                body: msg,
                icon: 'https://via.placeholder.com/128', // optional icon
            });
        };

        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications.');
            return;
        }

        // Connect to WebSocket server
        const socket = new WebSocket(`ws://localhost:5000/api/asapNotification?${encodeURIComponent(email)}`);

        // Handle incoming messages from server
        socket.onmessage = (event) => {
            try {
                // Parse incoming data (assuming JSON)
                const data = JSON.parse(event.data);

                // Example: data might look like { message: "Hello user!" }
                if (data.message) {
                    if (Notification.permission === 'granted') {
                        showNotification(data.message);
                    } else if (Notification.permission === 'default') {
                        Notification.requestPermission().then((permission) => {
                            if (permission === 'granted') {
                                showNotification(data.message);
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.onopen = () => {
            console.log('✅ WebSocket connected to server');
        };

        socket.onclose = () => {
            console.log('❌ WebSocket connection closed');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Cleanup on unmount
        return () => {
            socket.close();
        };
    }, []);
    // notification end cod

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
    const handleOpenModal = (row) => {
        setModalData({
            ticketKey: row.ticketKey,
            CM_name: row.CM_name || '—',
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalData(null);
    };

    const regionOptions = [
        { value: 'EMEA', label: 'EMEA' },
        { value: 'UCAN', label: 'UCAN' },
        { value: 'APAC', label: 'APAC' },
        { value: 'LATAM', label: 'LATAM' },
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
    }, [selectedRegions, selectedCM, selectedTicketId, startDate, endDate, page, selectedStatus]); // This hook reacts to all changes, ,assignedCount,totalCount,closedCount removed for correct count as per accuracy

    const fetchTickets = async () => {
        const cmRegionList = selectedRegions.map((r) => r.value).join(',');
        const cmNameList = selectedCM.map((c) => c.value).join(',');
        const ticketKeyList = selectedTicketId.map((t) => t.value).join(',');
        const createdFrom = startDate ? startDate.toISOString().split('T')[0] : '';
        const createdTo = endDate ? endDate.toISOString().split('T')[0] : '';

        try {
            const res = await fetch(
                `http://localhost:5000/api/getNetflixTickets?email=${email}&page=${page}&limit=25&cmRegionList=${cmRegionList}&cmNameList=${cmNameList}&ticketKeyList=${ticketKeyList}&createdFrom=${createdFrom}&createdTo=${createdTo}&status=${
                    selectedStatus || ' '
                }`
            );
            const json = await res.json();

            if (json.success) {
                setProjects(json.data);
                setTotalPages(json.totalPages);

                // ✅ Only update cmOptions when NO CM filter is applied
                //   if (!cmNameList) {
                //     const uniqueCMs = Array.from(new Set(json.data.map((d) => d.CM_name)));
                //     setCmOptions(uniqueCMs.map((cm) => ({ value: cm, label: cm })));
                //   }

                //   const uniqueTickets = Array.from(new Set(json.data.map((d) => d.ticketKey)));
                //   setTicketIdOptions(uniqueTickets.map((t) => ({ value: t, label: t })));

                setGlobalMetrics(
                    json.metrics || {
                        totalTickets: 0,
                        assignedTickets: 0,
                        closedTickets: 0,
                        startTickets: 0,
                        interimTickets: 0,
                        needMoreInfoTickets: 0,
                        sentToVaoTickets: 0,
                        solutionProvidedTickets: 0,
                    }
                );
            } else {
                setProjects([]);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    // useEffect(() => {
    //     const filteredByRegion = selectedRegions.length > 0 ? allTicketsData.filter((t) => selectedRegions.map((r) => r.value).includes(t.cm_region)) : allTicketsData;

    //     const uniqueCms = Array.from(new Set(filteredByRegion.map((t) => t.CM_name))).filter(Boolean);
    //     setCmOptions(uniqueCms.map((name) => ({ value: name, label: name })));

    //     const filteredByCm = selectedCM.length > 0 ? filteredByRegion.filter((t) => selectedCM.map((c) => c.value).includes(t.CM_name)) : filteredByRegion;

    //     const uniqueTickets = Array.from(new Set(filteredByCm.map((t) => t.ticketKey))).filter(Boolean);
    //     setTicketIdOptions(uniqueTickets.map((key) => ({ value: key, label: key })));
    // }, [selectedRegions, selectedCM, allTicketsData]);

    // useEffect(() => {
    //     if (!allTicketsData.length) return;

    //     let filtered = allTicketsData;

    //     if (selectedRegions.length) {
    //         const regionSet = new Set(selectedRegions.map((r) => r.value));
    //         filtered = filtered.filter((t) => regionSet.has(t.cm_region));
    //     }

    //     if (selectedCM.length) {
    //         const cmSet = new Set(selectedCM.map((c) => c.value));
    //         filtered = filtered.filter((t) => cmSet.has(t.CM_name));
    //     }

    //     if (selectedTicketId.length) {
    //         const ticketSet = new Set(selectedTicketId.map((t) => t.value));
    //         filtered = filtered.filter((t) => ticketSet.has(t.ticketKey));
    //     }

    //     if (selectedStatus) {
    //         filtered = filtered.filter((t) => t.status === selectedStatus);
    //     }

    //     const uniqueCMs = Array.from(new Set(filtered.map((d) => d.CM_name)));
    //     setCmOptions(uniqueCMs.map((cm) => ({ value: cm, label: cm })));

    //     const uniqueTickets = Array.from(new Set(filtered.map((d) => d.ticketKey)));
    //     setTicketIdOptions(uniqueTickets.map((t) => ({ value: t, label: t })));
    // }, [allTicketsData, selectedRegions, selectedCM, selectedStatus]);

    useEffect(() => {
        if (!allTicketsData.length) return;

        // Step 1: Apply region filter first (broad, progressive)
        const filteredByRegion = selectedRegions.length > 0 ? allTicketsData.filter((t) => selectedRegions.some((r) => r.value === t.cm_region)) : allTicketsData;

        // Step 2: Build CM options from region-filtered data
        const uniqueCMs = Array.from(new Set(filteredByRegion.map((t) => t.CM_name))).filter(Boolean);
        setCmOptions(uniqueCMs.map((cm) => ({ value: cm, label: cm })));

        // Step 3: Apply CM filter (progressive again, not too strict)
        const filteredByCM = selectedCM.length > 0 ? filteredByRegion.filter((t) => selectedCM.some((c) => c.value === t.CM_name)) : filteredByRegion;

        // Step 4: Apply stricter filters for tickets (status + ticketId)
        let finalFiltered = filteredByCM;
        if (selectedTicketId.length > 0) {
            const ticketSet = new Set(selectedTicketId.map((t) => t.value));
            finalFiltered = finalFiltered.filter((t) => ticketSet.has(t.ticketKey));
        }
        if (selectedStatus) {
            finalFiltered = finalFiltered.filter((t) => t.status === selectedStatus);
        }

        // Step 5: Ticket options come from the stricter dataset
        const uniqueTickets = Array.from(new Set(finalFiltered.map((t) => t.ticketKey))).filter(Boolean);
        setTicketIdOptions(uniqueTickets.map((key) => ({ value: key, label: key })));
    }, [allTicketsData, selectedRegions, selectedCM, selectedTicketId, selectedStatus]);

    const fetchAllTicketsForDropdowns = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/getNetflixTickets?email=${email}&page=1&limit=999999`);
            const json = await res.json();
            if (json.success) {
                setAllTicketsData(json.data);
            }
        } catch (err) {
            console.error('Failed to fetch all ticket data for dropdowns', err);
        }
    };
    useEffect(() => {
        fetchAllTicketsForDropdowns();
    }, []);

    const [timers, setTimers] = useState({});

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const newTimers = {};

    //         tickets.forEach((ticket) => {
    //             // Assuming you have a SLA start timestamp (example: ticket.createdAt)
    //             const slaStartTime = new Date(ticket.createdAt).getTime();

    //             // SLA limit in milliseconds (2 hours)
    //             const slaLimit = 2 * 60 * 60 * 1000;

    //             // Time left = SLA limit - time passed
    //             const timeLeft = slaLimit - (Date.now() - slaStartTime);

    //             const totalSeconds = Math.floor(timeLeft / 1000);
    //             const hrs = String(Math.floor(Math.abs(totalSeconds) / 3600)).padStart(2, '0');
    //             const mins = String(Math.floor((Math.abs(totalSeconds) % 3600) / 60)).padStart(2, '0');
    //             const secs = String(Math.abs(totalSeconds) % 60).padStart(2, '0');

    //             newTimers[ticket._id] = {
    //                 text: `${hrs}:${mins}:${secs}`,
    //                 expired: totalSeconds < 0, // expired means SLA passed
    //             };
    //         });

    //         setSlatimers(newTimers);
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, [projects]);

    useEffect(() => {
        setTotalCount(projects.length);
        setAssignedCount(projects.filter((item) => item.status === 'Assigned').length);
        setClosedCount(projects.filter((item) => item.status === 'Closed').length);
    }, [projects]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/dropdown');
                const json = await res.json();
                if (json.success) {
                    setDropdownData(json.data);
                }
            } catch (err) {
                console.error('Failed to fetch dropdown data', err);
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        async function loadTaskDropdown() {
            try {
                const res = await fetch('http://localhost:5000/api/tasks/TaskDropdown');
                const data = await res.json();
                // Add a unique taskId to each for API usage
                const dataWithIds = data.map((item, index) => ({
                    ...item,
                    taskId: `TSKID-${String(index + 1).padStart(7, '0')}`,
                }));
                setTaskDropdown(dataWithIds);
            } catch (err) {
                console.error('⛔ Error fetching TaskDropdown:', err);
            }
        }
        loadTaskDropdown();
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/tasks/TaskDropdown')
            .then((res) => res.json())
            .then((data) => {
                const uniqueTypes = [...new Set(data?.map((item) => item.taskType))].map((t) => ({
                    value: t,
                    label: t,
                }));
                setTaskOptions(uniqueTypes);
            })
            .catch((err) => console.error('❌ Failed to fetch task types:', err));
    }, []);

    function CountdownTimer({ timeRemaining }) {
        const parseTimeToSeconds = (timeStr) => {
            // Example: "-108:05:41" → negative
            const isNegative = timeStr.startsWith('-');
            const parts = timeStr.replace('-', '').split(':').map(Number);
            const totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
            return isNegative ? -totalSeconds : totalSeconds;
        };

        const [secondsRemaining, setSecondsRemaining] = useState(parseTimeToSeconds(timeRemaining));

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
            const hours = String(Math.floor(absSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((absSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(absSeconds % 60).padStart(2, '0');
            return `${isNegative ? '-' : ''}${hours}:${minutes}:${seconds}`;
        };

        return <span style={{ fontWeight: 'bold' }}>{formatTime(secondsRemaining)}</span>;
    }

    const LiveTimer = ({ initialTime }) => {
        const parseTimeToSeconds = (timeStr) => {
            const [h, m, s] = timeStr.split(':').map(Number);
            return h * 3600 + m * 60 + s;
        };

        const [utilizationSecondsElapsed, setUtilizationSecondsElapsed] = useState(parseTimeToSeconds(initialTime));

        useEffect(() => {
            setUtilizationSecondsElapsed(parseTimeToSeconds(initialTime));
        }, [initialTime]);

        useEffect(() => {
            const timerId = setInterval(() => {
                setUtilizationSecondsElapsed((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timerId);
        }, []);

        const formatTime = (totalSeconds) => {
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        };

        return <span style={{ fontWeight: 'bold' }}>{formatTime(utilizationSecondsElapsed)}</span>;
    };

    const [asapStates, setAsapStates] = React.useState({});

    useEffect(() => {
        if (!projects.length) return;

        setAsapStates((prev) => {
            const updatedStates = { ...prev };

            projects.forEach((row) => {
                // Initialize with backend value (row.asap), not hardcoded true
                if (!(row.ticketKey in updatedStates)) {
                    updatedStates[row.ticketKey] = !!row.asap;
                }
            });

            return updatedStates;
        });
    }, [projects]);

    useEffect(() => {
        if (role !== 1) return; // Only poll for CM

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/getNetflixTickets?email=${email}&role=${role}&page=${page}&limit=25&status=${selectedStatus || ' '}`);
                const data = await res.json();
                if (data.success) {
                    setProjects(data.data);
                }
                console.log(`Polling ${selectedStatus}`);
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval); // Cleanup
    }, [email, role, page, selectedStatus]);

    const columns = [
        // {
        //     label: 'S. No',
        //     key: 'sno',
        //     render: (_, index) => index + 1,
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

                const highlightStyle = Number(user?.role) === 1 && row.asap ? { backgroundColor: '#000000', border: '1px solid #ffeeba' } : {};

                return (
                    <a
                        href={`https://netflix.atlassian.net/browse/${row.ticketKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`badge ${badgeClass}`}
                        style={{
                            fontSize: '0.9rem',
                            textDecoration: 'underline',
                            whiteSpace: 'nowrap',
                            width: 'auto',
                            display: 'inline-block',
                            ...highlightStyle,
                            pointerEvents: row.enable || Number(user?.role) === 0 ? 'auto' : 'none',
                            opacity: row.enable || Number(user?.role) === 0 ? 1 : 0.5,
                        }}
                    >
                        {row.ticketKey}
                    </a>
                );
            },
        },
        {
            label: (
                <span style={{ whiteSpace: 'nowrap', width: 'auto', display: 'inline-block' }}>
                    Created <br /> Date & Time
                </span>
            ),
            key: 'created',
        },
        {
            label: (
                <span style={{ whiteSpace: 'nowrap', width: 'auto', display: 'inline-block' }}>
                    Last Updated <br /> Date & Time
                </span>
            ),
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
                const hh = String(dateObj.getHours()).padStart(2, '0'); // 24-hour
                const min = String(dateObj.getMinutes()).padStart(2, '0');
                const ss = String(dateObj.getSeconds()).padStart(2, '0');

                return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
            },
        },

        {
            label: (
                <div style={{ whiteSpace: 'nowrap', width: 'auto', display: 'inline-block' }}>
                    End Time <br />
                    <small style={{ fontWeight: 'normal' }}>
                        (As per SLA -<br /> Reverse Countdown)
                    </small>
                </div>
            ),
            key: 'SLA',
            render: (row) => {
                const timeStr = row?.slaData?.timeRemaining;

                // Handle missing SLA safely
                if (!row.slaData || !timeStr) {
                    return (
                        <span style={{ color: 'black' }}>
                            <strong>00:00:00</strong>
                        </span>
                    );
                }

                // SLA Not Applicable → show static
                if (row.slaData.deadline === 'N/A') {
                    return (
                        <span style={{ color: 'black' }}>
                            <strong>00:00:00</strong>
                        </span>
                    );
                }

                // Convert HH:MM:SS / -HH:MM:SS to seconds
                const parseToSeconds = (timeStr) => {
                    const isNegative = timeStr.startsWith('-');
                    const cleanTime = timeStr.replace('-', '');
                    const parts = cleanTime.split(':').map(Number);
                    if (parts.length !== 3) return 0;
                    const [hh, mm, ss] = parts;
                    const total = hh * 3600 + mm * 60 + ss;
                    return isNegative ? -total : total;
                };

                const totalSeconds = parseToSeconds(timeStr);

                let color = 'green';

                // Special statuses → show static SLA
                if (['Need More Information', 'Closed', 'Sent to VAO'].includes(row.status)) {
                    return (
                        <span style={{ color: 'green' }}>
                            <strong>{timeStr}</strong>
                        </span>
                    );
                }

                // SLA coloring rules
                if (totalSeconds < 0) {
                    color = 'red'; // overdue
                } else if (totalSeconds <= 1800) {
                    color = 'red'; // ≤ 30 min
                } else if (totalSeconds <= 2700) {
                    color = 'orange'; // 45–30 min
                }

                return (
                    <span style={{ color }}>
                        <CountdownTimer timeRemaining={timeStr} />
                    </span>
                );
            },
        },

        {
            label: 'Start Date',
            key: 'startDateTime',
        },

        {
            label: 'End Date',
            key: 'endDateTime',
        },

        ...(Number(user?.role) === 0
            ? [
                  {
                      label: 'Name of CM',
                      key: 'CM_name',
                      render: (row) =>
                          row.status !== 'Assigned' ? (
                              <span>{row.CM_name || '—'}</span>
                          ) : (
                              <Select
                                  options={cmMasterList.map((cm) => ({
                                      value: cm.userId,
                                      label: cm.name,
                                      email: cm.emailId,
                                  }))}
                                  value={
                                      row.CM_name
                                          ? {
                                                label: row.CM_name,
                                                value: cmMasterList.find((cm) => cm.name === row.CM_name)?.userId || row.CM_name,
                                            }
                                          : null
                                  }
                                  isClearable={false}
                                  classNamePrefix="react-select"
                                  styles={{
                                      container: (base) => ({
                                          ...base,
                                          minWidth: 200,
                                      }),
                                      menu: (provided) => ({
                                          ...provided,
                                          zIndex: 9999,
                                      }),
                                  }}
                                  onChange={async (selectedOption) => {
                                      if (selectedOption?.value) {
                                          const previousEmail = row.backupCM_email;
                                          console.log(selectedOption);
                                          try {
                                              // 1. Update CM in Database
                                              const dbResponse = await fetch('http://localhost:5000/api/updateBackupCM_DB', {
                                                  method: 'PUT',
                                                  headers: {
                                                      'Content-Type': 'application/json',
                                                  },
                                                  body: JSON.stringify({
                                                      ticketKey: row.ticketKey,
                                                      userId: selectedOption.value,
                                                  }),
                                              });

                                              const dbResult = await dbResponse.json();

                                              console.log('DB update result:', dbResult);

                                              // 2. Put data for fresh tickets
                                              const dbPayload = { asap: row.asap, backupEmail: selectedOption.email, previousEmail: previousEmail };

                                              const updateTicketPut = await fetch(`http://localhost:5000/api/updateTicketByKey_DB/${row.ticketKey}`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify(dbPayload),
                                              });

                                              const dbUpdateTicketResponse = await updateTicketPut.json();
                                              console.log(dbUpdateTicketResponse);

                                              // 3. Fetch fresh ticket data
                                              const refreshed = await fetch(`http://localhost:5000/api/getNetflixTickets?email=${email}&ticketKeyList=${row.ticketKey}`);
                                              const refreshedData = await refreshed.json();

                                              const updatedTicket = refreshedData.data.find((t) => t.ticketKey === row.ticketKey);

                                              if (updatedTicket) {
                                                  setProjects((prev) => prev.map((ticket) => (ticket.ticketKey === row.ticketKey ? updatedTicket : ticket)));
                                              }

                                              // 4. Update CM in Google Sheet
                                              const sheetResponse = await fetch('http://localhost:5000/api/updateBackupCM_Sheet', {
                                                  method: 'PUT',
                                                  headers: {
                                                      'Content-Type': 'application/json',
                                                  },
                                                  body: JSON.stringify({
                                                      ticketKey: row.ticketKey,
                                                      userId: selectedOption.value,
                                                  }),
                                              });

                                              const sheetResult = await sheetResponse.json();

                                              console.log('Sheet update result:', sheetResult);
                                          } catch (error) {
                                              console.error('Error updating CM:', error);
                                          }
                                      }
                                  }}
                              />
                          ),
                  },
              ]
            : [
                  {
                      label: 'Name of CM',
                      key: 'CM_name',
                      render: (row) => <span>{row.CM_name || '—'}</span>,
                  },
              ]),

        {
            label: <span style={{ whiteSpace: 'nowrap', width: 'auto', display: 'inline-block' }}>Name of AM</span>,
            key: 'AM_name',
        },

        {
            label: 'Task Type',
            key: 'taskType',
            render: (row, rowIndex) => {
                const selectedTask = taskDropdown.find((opt) => opt.taskType === row.taskType) || null;

                return (
                    <Select
                        options={taskDropdown}
                        getOptionLabel={(opt) => opt.taskType}
                        getOptionValue={(opt) => opt.taskId}
                        value={selectedTask}
                        placeholder="Select Task Type"
                        classNamePrefix="react-select"
                        isDisabled={!(row.enable || Number(user?.role) === 0)}
                        styles={{
                            container: (base) => ({ ...base, minWidth: 180 }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#000',
                            }),
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        onChange={async (selectedOption) => {
                            if (!selectedOption) return;

                            // Local patch
                            const newProjects = [...projects];
                            newProjects[rowIndex].taskType = selectedOption.taskType;
                            newProjects[rowIndex].subTaskType = null;
                            newProjects[rowIndex].taskId = selectedOption.taskId;
                            setProjects(newProjects);

                            const hasSubTasks = taskDropdown.some((item) => item.taskType === selectedOption.taskType && item.subTaskType);

                            if (!hasSubTasks) {
                                try {
                                    // 1. PUT request
                                    const body = {
                                        ticketKey: row.ticketKey,
                                        taskId: selectedOption.taskId,
                                        ticketId: row.ticketId,
                                    };

                                    await fetch(`http://localhost:5000/api/tasks/update-task`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(body),
                                    });

                                    // 2. Fetch refreshed tickets
                                    const refreshed = await fetch(`http://localhost:5000/api/getNetflixTickets?email=${email}&ticketKeyList=${row.ticketKey}`);
                                    const refreshedData = await refreshed.json();

                                    // 3. Find updated ticket
                                    const updatedTicket = refreshedData.data.find((t) => t.ticketKey === row.ticketKey);

                                    if (updatedTicket) {
                                        setProjects((prev) => prev.map((ticket) => (ticket.ticketKey === row.ticketKey ? updatedTicket : ticket)));
                                    }
                                } catch (err) {
                                    console.error('⛔ Error updating task type:', err);
                                }
                            }
                        }}
                    />
                );
            },
        },

        // Sub Task Type column
        {
            label: 'Sub Task Type',
            key: 'subTaskType',
            render: (row, rowIndex) => {
                const options = taskDropdown
                    .filter((item) => item.taskType === row.taskType && item.subTaskType)
                    .map((item) => ({
                        value: item.subTaskType,
                        label: item.subTaskType,
                    }));

                const uniqueOptions = Array.from(new Map(options.map((opt) => [opt.value, opt])).values());

                const selectedSubTask = row.subTaskType ? uniqueOptions.find((opt) => opt.value === row.subTaskType) || null : null;

                return (
                    <Select
                        options={uniqueOptions}
                        value={selectedSubTask}
                        placeholder={uniqueOptions.length > 0 ? 'Select Sub Task' : 'No Sub Task'}
                        isDisabled={uniqueOptions.length === 0 || !(row.enable || Number(user?.role) === 0)}
                        classNamePrefix="react-select"
                        styles={{
                            container: (base) => ({ ...base, minWidth: 180 }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#000',
                            }),
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        onChange={async (selectedOption) => {
                            const newProjects = [...projects];
                            newProjects[rowIndex].subTaskType = selectedOption?.value || null;
                            setProjects(newProjects);

                            try {
                                // 1. PUT request
                                const body = {
                                    ticketKey: row.ticketKey,
                                    taskId: row.taskId,
                                    ticketId: row.ticketId,
                                    subTaskType: selectedOption?.value || null,
                                };

                                await fetch(`http://localhost:5000/api/tasks/update-task`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(body),
                                });

                                // 2. Fetch refreshed tickets
                                const refreshed = await fetch(`http://localhost:5000/api/getNetflixTickets?email=${email}&ticketKeyList=${row.ticketKey}`);
                                const refreshedData = await refreshed.json();

                                // 3. Find updated ticket
                                const updatedTicket = refreshedData.data.find((t) => t.ticketKey === row.ticketKey);

                                if (updatedTicket) {
                                    setProjects((prev) => prev.map((ticket) => (ticket.ticketKey === row.ticketKey ? updatedTicket : ticket)));
                                }
                            } catch (err) {
                                console.error('⛔ Error updating sub task type:', err);
                            }
                        }}
                    />
                );
            },
        },

        {
            label: 'Region',
            key: 'cm_region',
        },

        ...(Number(user?.role) === 0
            ? [
                  {
                      label: <div style={{ whiteSpace: 'nowrap', width: 'auto', display: 'inline-block' }}>ASAP</div>,
                      key: 'asap',
                      render: (row) => {
                          const isChecked = asapStates[row.ticketKey] || false;

                          const handleToggle = async () => {
                              const newValue = !isChecked;

                              // Optimistic UI update
                              setAsapStates((prev) => ({
                                  ...prev,
                                  [row.ticketKey]: newValue,
                              }));

                              try {
                                  const response = await fetch(`http://localhost:5000/api/updateTicketByKey_DB/${row.ticketKey}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      // ✅ send boolean, not string
                                      body: JSON.stringify({ asap: newValue, backupEmail: row.backupCM_email }),
                                  });
                                  const result = await response.json();

                                  if (!result.success) {
                                      // rollback if update fails
                                      setAsapStates((prev) => ({
                                          ...prev,
                                          [row.ticketKey]: isChecked,
                                      }));
                                  }
                              } catch (err) {
                                  console.error('Error updating ASAP:', err);
                                  setAsapStates((prev) => ({
                                      ...prev,
                                      [row.ticketKey]: isChecked,
                                  }));
                              }
                          };

                          return (
                              <div className={`relative h-6 w-12 cursor-pointer ${isChecked ? 'shadow-lg bg-yellow-50 rounded-md' : ''}`}>
                                  <label className="relative h-6 w-12">
                                      <input type="checkbox" className="custom_switch peer absolute z-10 h-full w-full cursor-pointer opacity-0" checked={isChecked} onChange={handleToggle} />
                                      <span className="block h-full rounded-full bg-[#c1c1c1] before:absolute before:bottom-1 before:left-1 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark dark:before:bg-white-dark dark:peer-checked:before:bg-white"></span>
                                  </label>
                              </div>
                          );
                      },
                  },
              ]
            : []),

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
                            { value: 'Sent to VAO', label: 'Sent to VAO' },
                            { value: 'On Hold', label: 'On Hold' },
                            { value: 'Closed', label: 'Closed' },
                        ]}
                        value={row.status ? { label: row.status, value: row.status } : null}
                        // isClearable={Number(user?.role) === 1} // allow clearing only for CM
                        isDisabled={!(row.enable || Number(user?.role) === 0)}
                        // isDisabled={user?.role === 0} // disable for QM and others
                        classNamePrefix="react-select"
                        styles={{
                            container: (base) => ({
                                ...base,
                                minWidth: 180,
                            }),
                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        onChange={async (selectedOption) => {
                            if (!selectedOption?.value) return;

                            try {
                                const newStatus = selectedOption.value;

                                const dbPayload = { status: newStatus, backupEmail: row.backupCM_email };
                                const shouldUnsetAsap = newStatus !== 'Start';
                                if (shouldUnsetAsap) {
                                    dbPayload.asap = false;
                                }

                                // 1. Update status in backend DB
                                const dbResponse = await fetch(`http://localhost:5000/api/updateTicketByKey_DB/${row.ticketKey}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(dbPayload),
                                });

                                const dbResult = await dbResponse.json();

                                if (!dbResult.success) {
                                    console.error('DB Status update failed', dbResult.error);
                                    return;
                                }
                                console.log('✅ Status updated successfully in DB');
                                // console.log(row.backupCM_email);

                                if (shouldUnsetAsap) {
                                    setAsapStates((prev) => ({
                                        ...prev,
                                        [row.ticketKey]: false,
                                    }));
                                }

                                // 2. Update utilization timer for this ticket
                                const utilResponse = await fetch(`http://localhost:5000/api/ticketAction/${row.ticketKey}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        status: newStatus,
                                        timestamp: new Date().toISOString(),
                                        deadline: row?.slaData?.deadline || null,
                                    }),
                                });

                                const utilResult = await utilResponse.json();
                                if (!utilResult.success) {
                                    console.error('Utilization update failed', utilResult.error);
                                } else {
                                    console.log('✅ Utilization timer updated');
                                }

                                // 3. Refresh tickets list
                                const cmRegionList = selectedRegions.map((r) => r.value).join(',');
                                const cmNameList = selectedCM.map((c) => c.value).join(',');
                                const ticketKeyList = selectedTicketId.map((t) => t.value).join(',');
                                const createdFrom = startDate ? startDate.toISOString().split('T')[0] : '';
                                const createdTo = endDate ? endDate.toISOString().split('T')[0] : '';

                                const res = await fetch(
                                    `http://localhost:5000/api/getNetflixTickets?email=${email}&role=0&page=${page}&limit=25&cmRegionList=${cmRegionList}&cmNameList=${cmNameList}&ticketKeyList=${ticketKeyList}&createdFrom=${createdFrom}&createdTo=${createdTo}`
                                );
                                const data = await res.json();

                                if (data.success) {
                                    setProjects(data.data);
                                    setTotalPages(data.totalPages || 1);
                                    setGlobalMetrics(
                                        data.metrics || {
                                            totalTickets: 0,
                                            assignedTickets: 0,
                                            closedTickets: 0,
                                            startTickets: 0,
                                            interimTickets: 0,
                                            needmoreinformationTickets: 0,
                                            senttovaoTickets: 0,
                                            solutionprovidedTickets: 0,
                                        }
                                    );
                                } else {
                                    console.error('Failed to refresh ticket list');
                                }

                                // 4. Update Excel Sheet
                                const sheetResponse = await fetch(`http://localhost:5000/api/updateTicketByKey_Sheet/${row.ticketKey}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: newStatus }),
                                });

                                const sheetResult = await sheetResponse.json();
                                if (!sheetResult.success) {
                                    console.error('Sheet update failed', sheetResult.error);
                                } else {
                                    console.log('✅ Sheet updated successfully');
                                }
                            } catch (error) {
                                console.error('Error during status update process:', error);
                            }
                        }}
                    />
                );
            },
        },

        {
            label: <div style={{ whiteSpace: 'nowrap', width: 'auto', display: 'inline-block' }}>UT Timer</div>,
            key: 'utilization',
            render: (row) => {
                const util = row.utilization;
                if (!util) {
                    return (
                        <span style={{ color: 'black' }}>
                            <strong>00:00:00</strong>
                        </span>
                    );
                }

                if (util.status === 'Start') {
                    return (
                        <span style={{ color: 'red' }}>
                            <LiveTimer initialTime={util.utTimer}></LiveTimer>
                        </span>
                    );
                }

                return (
                    <span style={{ color: 'black' }}>
                        <strong>{util.utTimer}</strong>
                    </span>
                );
            },
        },

        // {
        //     label: (
        //         <span style={{ whiteSpace: 'nowrap', width: 'auto', display: 'inline-block' }}>
        //             Last Comment
        //             <br /> Added
        //         </span>
        //     ),
        //     key: 'lastComment',
        //     render: (row) => (
        //         <button
        //             onClick={() => handleOpenModal(row)}
        //             style={{
        //                 background: 'transparent',
        //                 border: 'none',
        //                 cursor: 'pointer',
        //             }}
        //             title="View details"
        //         >
        //             ℹ️
        //         </button>
        //     ),
        // },
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
            const cmRegionList = selectedRegions.map((r) => r.value).join(',');
            const cmNameList = selectedCM.map((c) => c.value).join(',');
            const ticketKeyList = selectedTicketId.map((t) => t.value).join(',');
            const createdFrom = startDate ? startDate.toISOString().split('T')[0] : '';
            const createdTo = endDate ? endDate.toISOString().split('T')[0] : '';

            const res = await fetch(
                `http://localhost:5000/api/getNetflixTickets?email=${email}&page=1&limit=999999&cmRegionList=${cmRegionList}&cmNameList=${cmNameList}&ticketKeyList=${ticketKeyList}&createdFrom=${createdFrom}&createdTo=${createdTo}`
            );
            const json = await res.json();

            if (!json.success || !json.data || json.data.length === 0) {
                alert('No data to download');
                return;
            }

            const allTickets = json.data;

            // Headers from columns
            const headers = columns.map((col) => (typeof col.label === 'string' ? col.label : col.label?.props?.children?.[0] || ''));

            // Rows
            const rows = allTickets.map((row) => {
                return columns
                    .map((col) => {
                        let val = '';

                        // Special handling for SLA column
                        // if (col.key === "SLA" && row.slaData?.timeRemaining != null) {
                        //   val = row.slaData.timeRemaining; // keep the negative if exists
                        // }
                        if (col.key === 'SLA' && row.SLA) {
                            val = row.SLA; // keep the negative if exists
                        }
                        // If column has a key and exists in row
                        else if (col.key && row[col.key] !== undefined) {
                            val = row[col.key];
                        }
                        // If column has a render function, use it for CSV too
                        else if (typeof col.render === 'function') {
                            const rendered = col.render(row);
                            // Extract text from JSX if needed
                            if (typeof rendered === 'string') {
                                val = rendered;
                            } else if (React.isValidElement(rendered)) {
                                val = rendered.props?.children ? (Array.isArray(rendered.props.children) ? rendered.props.children.join('') : rendered.props.children) : '';
                            } else {
                                val = rendered ?? '';
                            }
                        }

                        if (typeof val === 'object') val = JSON.stringify(val);
                        return `"${String(val).replace(/"/g, '""')}"`;
                    })
                    .join(',');
            });

            // CSV Content
            const csvContent = [headers.join(','), ...rows].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'tickets_report.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading CSV:', error);
            alert('Error generating report');
        }
    };

    return (
        <div className="p-4">
            <Card>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="fs-1 mb-0" style={{ fontSize: '16px' }}>
                        <strong>Tickets List</strong>
                    </h1>
                </div>

                <div className="d-flex gap-3 mt-4 flex-wrap align-items-center" style={{ display: 'flex' }}>
                    {Number(user?.role) === 0 && (
                        <>
                            <div style={{ minWidth: 200, marginBottom: '14px' }}>
                                <Select isMulti options={regionOptions} value={selectedRegions} onChange={handleRegionChange} placeholder="Select Region(s)" classNamePrefix="react-select" />
                            </div>
                        </>
                    )}
                </div>

                {/* Count Cards */}
                {/* <div className="d-flex flex-wrap gap-3 mb-4" style={{display:"flex"}}>
                  <div className="card text-white bg-warning p-3" style={{justifyContent:"center", minWidth:"150px", display:"flex" }}>
                    <h6>Total : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}> {globalMetrics.totalTickets}</h4>
                  </div>
                  <div className="card text-white bg-danger p-3" style={{justifyContent:"center",  minWidth:"150px", display:"flex" }}>
                    <h6>Assigned : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.assignedTickets}</h4>
                  </div>
                  <div className="card text-white bg-success p-3" style={{justifyContent:"center",  minWidth:"150px", display:"flex" }}>
                  <h6>Closed : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}> {globalMetrics.closedTickets}</h4>
                  </div>
                  <div className="card text-white bg-primary p-3" style={{justifyContent:"center", minWidth:"150px", display:"flex" }}>
                    <h6>Start : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.startTickets}</h4>
                  </div>
                  <div className="card text-white bg-secondary p-3" style={{justifyContent:"center", minWidth:"150px", display:"flex" }}>
                    <h6>Interim : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.interimTickets}</h4>
                  </div>
                  <div className="card text-white bg-info p-3" style={{ justifyContent:"center", minWidth:"150px", display:"flex" }}>
                    <h6>Need More Info : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.needMoreInfoTickets}</h4>
                  </div>
                  <div className="card text-white p-3" style={{ justifyContent:"center", backgroundColor: "#564d4d", minWidth:"150px", display:"flex" }}>
                    <h6>Sent to VAO : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.sentToVaoTickets}</h4>
                  </div>
                  <div className="card text-white bg-dark p-3" style={{ justifyContent:"center", minWidth:"150px", display:"flex" }}>
                    <h6>Solution Provided : </h6>
                    <h4 style={{fontWeight:"bold",fontSize:"1.2rem"}}>  {globalMetrics.solutionProvidedTickets}</h4>
                  </div>
                </div> */}

                {/* Single Line with scroller */}

                {/* <div
                      style={{
                        display: "flex",
                        flexDirection: "row",  
                        flexWrap: "nowrap",     
                        overflowX: "auto",      
                        gap: "1rem",
                        paddingBottom: "0.5rem",
                      }}
                    >
                      {[
                        { label: "Total", value: globalMetrics.totalTickets, color: "warning" },
                        { label: "Assigned", value: globalMetrics.assignedTickets, color: "danger" },
                        { label: "Closed", value: globalMetrics.closedTickets, color: "success" },
                        { label: "Start", value: globalMetrics.startTickets, color: "primary" },
                        { label: "Interim", value: globalMetrics.interimTickets, color: "secondary" },
                        { label: "Need More Info", value: globalMetrics.needMoreInfoTickets, color: "info" },
                        { label: "Sent to VAO", value: globalMetrics.sentToVaoTickets, color: "custom" },
                        { label: "Solution Provided", value: globalMetrics.solutionProvidedTickets, color: "dark" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`card text-white p-3 bg-${item.color !== "custom" ? item.color : ""}`}
                          style={{
                            flex: "0 0 180px",
                            textAlign: "center",
                            backgroundColor: item.color === "custom" ? "#564d4d" : undefined,
                          }}
                        >
                          <h6>{item.label} :</h6>
                          <h4 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{item.value}</h4>
                        </div>
                      ))}
                </div> */}

                {/* 4-4 div's in one row */}

                {/* "totalTickets": 7661,
        "assignedTickets": 2665,
        "closedTickets": 106,
        "startTickets": 5,
        "interimTickets": 7,
        "needmoreinformationTickets": 27,
        "senttovaoTickets": 12,
        "solutionprovidedTickets": 16 */}

                <div className="metrics-grid">
                    {[
                        { label: 'Total', value: globalMetrics.totalTickets, color: 'warning', selectedStatusKey: '' },
                        { label: 'Assigned', value: globalMetrics.assignedTickets, color: 'danger', selectedStatusKey: 'Assigned' },
                        { label: 'Closed', value: globalMetrics.closedTickets, color: 'success', selectedStatusKey: 'Closed' },
                        { label: 'Start', value: globalMetrics.startTickets, color: 'primary', selectedStatusKey: 'Start' },
                        { label: 'Interim', value: globalMetrics.interimTickets, color: 'secondary', selectedStatusKey: 'Interim' },
                        { label: 'Need More Info', value: globalMetrics.needmoreinformationTickets, color: 'info', selectedStatusKey: 'Need More Information' },
                        { label: 'Sent to VAO', value: globalMetrics.senttovaoTickets, color: 'custom', selectedStatusKey: 'Sent to VAO' },
                        { label: 'Solution Provided', value: globalMetrics.solutionprovidedTickets, color: 'dark', selectedStatusKey: 'Solution Provided' },
                    ].map((item, idx) => {
                        const isActive = selectedStatus === item.selectedStatusKey;
                        return (
                            <div
                                key={idx}
                                onClick={() => {
                                    setSelectedStatus(isActive ? null : item.selectedStatusKey);
                                    setPage(1);
                                }}
                                className={`card text-white p-3 bg-${item.color !== 'custom' ? item.color : ''}`}
                                style={{
                                    textAlign: 'center',
                                    backgroundColor: item.color === 'custom' ? '#564d4d' : undefined,
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease-in-out',
                                    transform: isActive ? 'translateY(-3px)' : 'translateY(0px)',
                                    boxShadow: isActive ? '0px 8px 15px rgba(0,0,0,0.6)' : '0px 2px 5px rgba(0,0,0,0)',
                                    textDecoration: isActive ? 'underline' : 'none',
                                    fontStyle: isActive ? 'italic' : 'normal',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0px 8px 15px rgba(0,0,0,0.6)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.transform = 'translateY(0px)';
                                        e.currentTarget.style.boxShadow = '0px 2px 5px rgba(0,0,0,0)';
                                    }
                                }}
                            >
                                <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: 0 }}>
                                    {item.label} : {item.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Filter Section */}
                <div className="d-flex gap-3 mt-4 flex-wrap align-items-center" style={{ display: 'flex' }}>
                    {Number(user?.role) === 0 && (
                        <>
                            {/* <div style={{ minWidth: 200 }}>
                                <Select isMulti options={regionOptions} value={selectedRegions} onChange={handleRegionChange} placeholder="Select Region(s)" classNamePrefix="react-select" />
                            </div> */}

                            <div style={{ minWidth: 200 }}>
                                <Select isClearable isMulti options={cmOptions} placeholder="Select CM" value={selectedCM} onChange={handleCmChange} />
                            </div>

                            <div style={{ minWidth: 200 }}>
                                <Select isClearable isMulti options={ticketIdOptions} placeholder="Select Ticket ID" value={selectedTicketId} onChange={handleTicketIdChange} />
                            </div>

                            <div className="form-group pe-3 flex" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <label htmlFor="fromDate" className="mb-1">
                                    <strong>From Date : </strong>
                                </label>
                                <input
                                    type="date"
                                    id="fromDate"
                                    className="form-control p-2 ms-1"
                                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleStartDateChange(e.target.value ? new Date(e.target.value) : null)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-group pe-3 flex" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <label htmlFor="toDate" className="mb-1">
                                    <strong>To Date : </strong>
                                </label>
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

                <div className="d-flex gap-2 mb-5 mt-3" style={{ justifyContent: 'flex-end', display: 'flex' }}>
                    <button
                        className="d-flex align-items-center gap-2"
                        style={{
                            background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            display: 'flex',
                        }}
                        onClick={downloadCSV}
                    >
                        <Download size={16} />
                        Download Report
                    </button>
                </div>

                {projects.length === 0 ? <div className="text-center text-muted py-4 fw-bold fs-5">No Data Available</div> : <ReusableTable columns={columns} data={projects} userRole={role} />}

                {/* Last Comment pop-up */}

                <ReusableModal isOpen={modalOpen} onClose={handleCloseModal} title="">
                    <p>
                        <strong>Ticket ID:</strong> {modalData?.ticketKey}
                    </p>
                    <p>
                        <strong>CM Name:</strong> {modalData?.CM_name}
                    </p>
                </ReusableModal>

                <div className="flex justify-content-center align-items-center mt-4 gap-2 flex-wrap" style={{ justifyContent: 'end' }}>
                    {getPageNumbers().map((p) => (
                        <button key={p} className={`btn ${page === p ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setPage(p)}>
                            {p}
                        </button>
                    ))}

                    {(paginationGroup + 1) * pagesPerGroup < totalPages && (
                        <button className="btn btn-outline-secondary" onClick={() => setPaginationGroup((g) => g + 1)}>
                            Next &rsaquo;
                        </button>
                    )}

                    {paginationGroup > 0 && (
                        <button className="btn btn-outline-secondary" onClick={() => setPaginationGroup((g) => g - 1)}>
                            &lsaquo; Prev
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Tickets;
