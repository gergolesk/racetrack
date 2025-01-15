import React from 'react';
import styles from './Button.module.css';


const Button = ({ children, disabled, onClick }) => {
    return (
        <button className={!disabled
            ? styles.btn
            : styles.disabled}
            onClick={!disabled ? onClick : undefined}>
            {children}
        </button>
    );
};

export default Button;