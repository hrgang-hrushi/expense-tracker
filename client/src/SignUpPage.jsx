import React from 'react';
import SignUp from '../Auth/SignUp';
import './SignUpPage.css';

const SignUpPage = () => {
    return (
        <div className="signup-page">
            <div className="signup-page-header">
                <div className="mission-info">
                    <h1>🌙 Moonbase Alpha</h1>
                    <p>Mission Registration Portal</p>
                </div>
            </div>
            
            <div className="signup-page-content">
                <SignUp />
                
                <div className="mission-details">
                    <h3>🚀 Mission Details</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <strong>Mission Type:</strong>
                            <span>Lunar Research Expedition</span>
                        </div>
                        <div className="detail-item">
                            <strong>Duration:</strong>
                            <span>6 Months</span>
                        </div>
                        <div className="detail-item">
                            <strong>Launch Date:</strong>
                            <span>Q2 2024</span>
                        </div>
                        <div className="detail-item">
                            <strong>Base Location:</strong>
                            <span>Shackleton Crater</span>
                        </div>
                        <div className="detail-item">
                            <strong>Requirements:</strong>
                            <span>Space-certified personnel only</span>
                        </div>
                        <div className="detail-item">
                            <strong>Training:</strong>
                            <span>12-week intensive program</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="signup-page-footer">
                <p>© 2035 NASA Moonbase Alpha Program</p>
                <p>All rights reserved. Mission classified.</p>
            </div>
        </div>
    );
};

export default SignUpPage;
