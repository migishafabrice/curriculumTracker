import React, {useState} from 'react';
import axios from 'axios';
export const useEducationTpes=() => {
    const [educationTypes, setEducationTypes] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
        const fetchEducationTypes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/department/education-types');
                if (response.data.educationTypes) {
                    setEducationTypes(response.data.educationTypes.map((type) => ({
                        value: type.code,
                        label: type.name,
                    })));
                }
               
            } catch (error) {
                console.error('Error fetching education types:', error);
                setNotification({ message: 'Failed to load education types', type: 'error' });
            }
        };
  return {educationTypes, notification, fetchEducationTypes};
}
export const useLevelTypes=(educationTypeId) => {  
    const [levelTypes, setLevelTypes] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
        const fetchLevelTypes = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/department/level-types?education_type_code=${educationTypeId}`);
                if (response.data.levelTypes) {
                    setLevelTypes(response.data.levelTypes.map((type) => ({
                        value: type.code,
                        label: type.name,
                    })));
                   
                }
               
            } catch (error) {
                console.error('Error fetching level types:', error);
                setNotification({ message: 'Failed to load level types', type: 'error' });
            }
        };
  return {levelTypes, notification, fetchLevelTypes};
}
export const useSectionTypes=(levelTypeId) => {  
    const [sectionTypes, setSectionTypes] = useState([]);
    const [classes, setClasses] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
        const fetchSectionTypes = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/department/section-types?level_type_code=${levelTypeId}`);
                if (response.data.sectionTypes) {
                    setSectionTypes(response.data.sectionTypes.map((type) => ({
                        value: type.code,
                        label: type.name,
                    })));
                    const allClasses = response.data.sectionTypes.flatMap(item => 
                        item.classes 
                          ? item.classes.split(',').map(c => c.trim())
                          : []
                      );
                    setClasses(allClasses.map((type) => ({
                        value: type,
                        label: type,
                    })));
                }
               
            } catch (error) {
                console.error('Error fetching section types:', error);
                setNotification({ message: 'Failed to load section types', type: 'error' });
            }
        };
  return {sectionTypes,classes, notification, fetchSectionTypes};
}
