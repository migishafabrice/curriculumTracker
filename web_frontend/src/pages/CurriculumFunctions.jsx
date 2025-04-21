import React from 'react';
import axios from 'axios';
import { getCurrentUser } from './AuthUser';
const user = getCurrentUser();    
export const fetchEducationTypes = async (school) => {
    try {
      
      const { data } = await axios.post(
        "http://localhost:5000/department/education-types",
        { school_code: school},  // Send empty string if `school` is falsy
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (data.type === "error") {
        throw new Error(data.message);
      }
      const formattedTypes = data.educationTypes;
      return formattedTypes;
    } catch (error) {
      console.error("Error fetching education types:", error);
      // Consider adding error state handling here if needed
    } 
  };
export const fetchLevelTypes = async (education_type_code,school) => {
    try {
        const { data } = await axios.post(`http://localhost:5000/department/level-types`,
            {
              education_type_code:education_type_code,
              school_code: school
            },
            { 
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

        );
        
        if (data.type === "error") {
            throw new Error(data.message);
        }
        const formattedTypes = data.levelTypes;
        return formattedTypes;
    } catch (error) {
        console.error("Error fetching level types:", error);
          } 
}
export const fetchSectionTypes = async (level_type_code) => {
    try {
        const { data } = await axios.get(`http://localhost:5000/department/section-types?level_type_code=${level_type_code}`,
            { 
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
        );
        if (data.type === "error") {
            throw new Error(data.message);
        }
        const formattedTypes = data.sectionTypes.map(({ code, name }) => ({
            value: code,
            label: name
        }));
        return formattedTypes;
    } catch (error) {
        console.error("Error fetching section types:", error);
          } 
}