import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastMessage = ({ message, type }) => {
    // Use useEffect to trigger the toast when `message` or `type` changes
    useEffect(() => {
        if (message && type) {
            if (type === 'success') {
                toast.success(message, {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                    style: { backgroundColor: '#4CAF50', color: 'white' },
                });
            } else if (type === 'error') {
                toast.error(message, {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: 'colored',
                    style: { backgroundColor: '#F44336', color: 'white' },
                });
            }
        }
    }, [message, type]); // Trigger only when `message` or `type` changes

    return <ToastContainer />; // Render the ToastContainer
};

export default ToastMessage;