import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
// import { API_URL } from '../../config';
import { selectCurrentToken } from '../../store/userProfile/UserProfileSlice';

const useApiCaller = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const  token  = useSelector((state) => state?.userprofileReducer?.token);
  //  const token = useSelector(selectCurrentToken);
  const token = localStorage.getItem("authToken");
console.log(token);

    const fetchData = async (method = "get", endpoint, body = {}) => {
let BASE_URL = "http://localhost:5000/api/"
    
        try {
            setIsLoading(true);
            const resp = await axios({
                method: method,
                url: BASE_URL + endpoint,
                // headers: {
                //      'authorization': Bearer token,
                //     'Content-Type': 'application/json',
                // },
                headers: {
                   'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
                data: body
            });
            const data = await resp?.data;
            setIsLoading(false);
            return data;
        } catch (error) {
            setIsLoading(false);
            return error?.response?.data;
        }
    };

  const fetchDataFromUrl = async (method = 'get', url, body = {}, sendToken = true) => {
    try {
      setIsLoading(true);
      let config = {
        method: method,
        url,
        data: body,
      };
      if (sendToken) {
        config = {
          ...config,
          headers: {
            //  authorization: token,
            'Content-Type': 'application/json',
          },
        };
      }
      const resp = await axios(config);
      const data = await resp?.data;
      setIsLoading(false);
      return data;
    } catch (error) {
      setIsLoading(false);
    
    }
  };
  return { isLoading, fetchData, fetchDataFromUrl };
};

export default useApiCaller;
