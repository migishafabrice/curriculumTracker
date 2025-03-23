import { useState } from 'react';
import axios from 'axios';

const useLoadSchools = () => {
  const [schools, setSchools] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const loadSchools = async () => {
    try {
      const response = await axios.get('http://localhost:5000/school/allSchools');
      if (response.data.schools) {
        setSchools(response.data.schools);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
      setNotification({ message: 'Failed to load schools', type: 'error' });
    }
  };

  return { schools, notification, loadSchools };
};

export default useLoadSchools;