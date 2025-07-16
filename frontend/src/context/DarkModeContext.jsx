import React, { createContext, useState, useEffect } from 'react';

export const DarkModeContext = createContext(null);

const DarkModeContextProvider = (props) => {
    // Get the initial state from localStorage or default to light mode
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true';
    });

    // Update localStorage and apply/remove dark mode class when the state changes
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    // Toggle function to switch between dark and light mode
    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    const contextValue = {
        darkMode,
        toggleDarkMode
    };

    return (
        <DarkModeContext.Provider value={contextValue}>
            {props.children}
        </DarkModeContext.Provider>
    );
};

export default DarkModeContextProvider;

