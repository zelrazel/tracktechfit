import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleGlobalSignOut } from '../utils/auth';
import '../styles/Signout.css';

function SignOut() {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsLoading(true);
    await handleGlobalSignOut(navigate);
    setIsLoading(false);
  };

  return (
    <div className="signout-container">
      {!showConfirmation ? (
        <>
          <h2 className="signout-title">Sign Out</h2>
          <p className="signout-message">Are you sure you want to sign out?</p>
          <button 
            className="signout-button"
            onClick={() => setShowConfirmation(true)}
            disabled={isLoading}
          >
            Sign Out
          </button>
        </>
      ) : (
        <div className="confirmation-dialog">
          <h2 className="signout-title">Confirm Sign Out</h2>
          <p className="signout-message">Are you sure you want to sign out?</p>
          <div className="button-group">
            <button 
              className="cancel-button"
              onClick={() => setShowConfirmation(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              className="confirm-button"
              onClick={handleConfirmSignOut}
              disabled={isLoading}
            >
              {isLoading ? 'Signing Out...' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignOut;
