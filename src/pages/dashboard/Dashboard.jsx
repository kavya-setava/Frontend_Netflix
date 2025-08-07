import React,{useState,useEffect}from "react";
import { Link,useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser,selectCurrentToken, selectAuthStatus } from "../../store/userProfile/UserProfileSlice";
import { selectAuditorsCount } from "../../store/count/CountSlice";
import ReactApexChart from 'react-apexcharts';
import useApiCaller from "../../utils/hooks/useApiCaller";
const Dashboard = () =>
{

  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const status = useSelector(selectAuthStatus);
  const [projectsCount,setProjectsCount] = useState(0)
  const [practiceHeadsCount,setPracticeHeadsCount] = useState(0)
  const [teamLeadsCount,setTeamLeadsCount] = useState(0)
  const [auditorsCount,setAuditorsCount] = useState(0)
  const [asssignProjectscount,setAssignedProjectsCount] = useState(0)
  const [auditedProjectsCount,setAuditedProjectsCount] = useState(0)
  const { fetchData } = useApiCaller();




  const isDark = useSelector((state) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
  const [loading] = useState(false);

    const navigate = useNavigate()
    useEffect(()=>
    {
        getAllProjects();
        getAllAssignedProjects();
        getAllAuditors();
        getAllTeamLeads();
        getAllPractiseHeads();
        getAuditedProjects ();
    },[])
    const projects = [
        { title: "All Projects", count:`${projectsCount}`, color: "bg-blue-500", link: "/all-Projects" },
        { title: "Assign Projects", count: `${asssignProjectscount}`, color: "bg-green-500", link: "/assigned-projects" },
        { title: "Practice Heads", count: `${practiceHeadsCount}`, color: "bg-purple-500",link: "/practice-heads"  },
        { title: "Team Leads", count:`${teamLeadsCount}`, color: "bg-orange-500",link: "/team-leads" },
        { title: "Auditors", count: `${auditorsCount}`, color: "bg-indigo-500", link: "/auditors" },
        { title: "Audited Projects", count: `${auditedProjectsCount}`, color: "bg-teal-500 ", link: "/audited-projects" },
        
      ];

      const salesByCategory = {
        series: [985, 737, 270],
        options: {
            chart: {
                type: 'donut',
                height: 460,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 25,
                colors: isDark ? '#0e1726' : '#fff',
            },
            colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                height: 50,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '29px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '26px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: function(val) {
                                    return val;
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '29px',
                                formatter: function(w) {
                                    return w.globals.seriesTotals.reduce(function(a, b) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Assigned', 'Un-Assigned', 'Pending'],
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
        },
    };
    const getAllProjects = async () => {
      try {
        const response = await fetchData('GET', 'get-project');
        
        if (response?.message === "Projects fetched successfully") {
          setProjectsCount(response?.totalProjects || 0);
        } else {
          throw new Error(response?.message || 'Invalid response from server');
        }
      } catch (error) {
        console.log("An unexpected error occurred", error);

       
      }
    };

    const getAllAuditors = async () => {
      try {
        const response = await fetchData('GET', 'get-auditor');
        
        if (response?.message === "Auditors fetched successfully.") {
          setAuditorsCount(response?.totalItems || 0);
        } else {
throw new Error(response?.message || 'Invalid response from server');
        }
      } catch (error) {
        console.log("An unexpected error occurred", error);
      }
    };

    const getAllPractiseHeads = async () => {
      try {
        const response = await fetchData('GET', 'get-practiceheads');
        
        if (response?.message === "Practice Heads fetched successfully.") {
          setPracticeHeadsCount(response?.totalItems || 0);
        } else {
          throw new Error(response?.message || 'Invalid response from server');
        }
      } catch (error) {
        console.log("An unexpected error occurred", error);
      }
    };

    const getAllTeamLeads = async () => {
      try {
        const response = await fetchData('GET', 'get-teamlead');
        
        if (response?.message === "Team Leads fetched successfully.") {
          setTeamLeadsCount(response?.totalItems || 0);
        } else {
          throw new Error(response?.message || 'Invalid response from server');
        }
      } catch (error) {
        console.log("An unexpected error occurred", error);
 
      }
    };

    const getAllAssignedProjects = async () => {
      try {
        const response = await fetchData('GET', 'get-all-assigned-project');
        
        if (response?.message === "Assigned projects fetched successfully.") {
          setAssignedProjectsCount(response?.totalProjects || 0);
        } else {
          throw new Error(response?.message || 'Invalid response from server');
        }
      } catch (error) {
        console.log("An unexpected error occurred", error);
      }
    };


      const getAuditedProjects = async () => {
        try {
          let url = `get-final-status-projects`;
          
       
          
          const response = await fetchData('GET', url);
        
          if (response?.status) {
           setAuditedProjectsCount(response?.totalProjects || 0);
          } 
        } catch (error) {
          console.log("An unexpected error occurred", error);
          
        }
      };
    

    return(
      <div>
   
     hhhh
      </div>
    
    )
}
export default Dashboard