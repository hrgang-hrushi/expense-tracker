import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SignUp.css'

export default function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState({})
    
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        return newErrors;
    }
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    }
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            console.log('Form submitted:', formData);
            alert('🚀 Mission Registration Successful! Welcome to Moonbase Alpha!');
            
            // Store user data (you can extend this for actual authentication)
            localStorage.setItem('moonbaseUser', JSON.stringify({
                name: formData.name,
                email: formData.email,
                signedUp: true
            }));
            
            // Redirect to dashboard after successful signup
            navigate('/dashboard');
        }
    };

    return (
        <div className="signup-container">
            <h2>🚀 Mission Registration</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Astronaut Name:</label>
                <input 
                    type="text" 
                    id="name"
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    placeholder="Enter your full name"
                />
                {errors.name && <span className="error">{errors.name}</span>}

                <label htmlFor="email">Mission Email:</label>
                <input 
                    type="email" 
                    id="email"
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    placeholder="your.email@nasa.gov"
                />
                {errors.email && <span className="error">{errors.email}</span>}

                <label htmlFor="password">Security Code:</label>
                <input 
                    type="password" 
                    id="password"
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange}
                    placeholder="Enter security code"
                />
                {errors.password && <span className="error">{errors.password}</span>}

                <button type="submit">🚀 Register for Mission</button>
            </form>
        </div>
    )
}
