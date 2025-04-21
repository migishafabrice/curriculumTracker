import { jwtDecode } from 'jwt-decode';
export const getCurrentUser = () => {
    const token = localStorage.getItem('AuthToken');
    
    if (!token) return null;
  
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); 
      if (decoded.exp && decoded.exp < currentTime) {
       localStorage.removeItem('AuthToken'); 
       location.href = '/login';
       return null;
      }
      return {
        userid: decoded.userid,
        email: decoded.username,  
        firstname: decoded.firstname,
        lastname: decoded.lastname,  
        role: decoded.role,
        code:decoded.code,
        token: token,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };