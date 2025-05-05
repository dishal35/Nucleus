import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoCloseCircle } from "react-icons/io5";
import "../styles/Alert.css";

const Alert = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const alertStyles = {
    success: {
      icon: <IoCheckmarkCircle className="h-5 w-5" />,
      className: "alert-success",
    },
    error: {
      icon: <IoCloseCircle className="h-5 w-5" />,
      className: "alert-error",
    },
    warning: {
      icon: <IoWarning className="h-5 w-5" />,
      className: "alert-warning",
    },
    info: {
      icon: <IoInformationCircle className="h-5 w-5" />,
      className: "alert-info",
    },
  };

  const style = alertStyles[type] || alertStyles.info;

  return (
    <div
      role="alert"
      className={`alert-container ${style.className}`}
    >
      <div className="alert-content">
        <span className="alert-icon">{style.icon}</span>
        <p className="alert-message">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="alert-close-button"
      >
        <IoClose className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Alert;