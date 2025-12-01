import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Radio, Droplet, Zap, Thermometer, Shield, Activity, Wifi, Globe, Users, MessageSquare, Map, FileText, Brain, Camera, Settings, LogOut, User } from 'lucide-react';
import './App.css';
import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:4000';
const MoonbaseDashboard = () => {
    // Authentication & View State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showSignUp, setShowSignUp] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [formErrors, setFormErrors] = useState({});

    // Existing state
    const [systems, setSystems] = useState(null);
    const [facilities, setFacilities] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [emergencyActive, setEmergencyActive] = useState(false);
    const [time, setTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('connected');
    const [wsConnection, setWsConnection] = useState(null);
    const [activeView, setActiveView] = useState('systems');
    const [crewMembers, setCrewMembers] = useState([]);
    const [aiMessages, setAiMessages] = useState([]);
    const [aiInput, setAiInput] = useState('');
    const [aiThinking, setAiThinking] = useState(false);
    const [selectedModule, setSelectedModule] = useState(null);
    const wsRef = useRef(null);
    const alarmRef = useRef(null);

    useEffect(() => {
        alarmRef.current = new Audio('/alarm.mp3');
        alarmRef.current.loop = true; // Loop the alarm sound
        return () => {
            if (alarmRef.current) {
                alarmRef.current.pause();
                alarmRef.current = null;
            }
        };
    }, []);

    // Check for existing user session on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('moonbaseUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setIsAuthenticated(true);
        }
    }, []);

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        return newErrors;
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: '' });
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/accounts`, {
                fullName: formData.name,
                email: formData.email,
                securityCode: formData.password,
            });

            console.log("✅ Account created:", response.data);

            const newUser = {
                id: response.data.account._id,
                name: response.data.account.fullName,
                email: response.data.account.email,
                signedUp: true,
                joinDate: response.data.account.createdAt
            };

            localStorage.setItem('moonbaseUser', JSON.stringify(newUser));
            setCurrentUser(newUser);
            setIsAuthenticated(true);
            setShowSignUp(false);

            // Fetch crew data and switch to crew view
            await fetchCrewData();
            setActiveView('crew');  // ⭐ ADD THIS LINE

            addAlert(`🚀 Welcome aboard, ${newUser.name}! Mission registration successful.`);

        } catch (error) {
            console.error("❌ Error creating account:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Failed to create account";
            setFormErrors({
                ...formErrors,
                submit: `Registration failed: ${errorMessage}`
            });
            addAlert(`⚠️ Registration Error: ${errorMessage}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('moonbaseUser');
        setCurrentUser(null);
        setIsAuthenticated(false);
        setFormData({ name: '', email: '', password: '' });
        addAlert('👋 Mission crew member logged out');
    };

    // Safe pressure display logic
    let displayPressure = 'N/A';
    if (systems?.systems?.environmental_control?.cabin_pressure_psi) {
        const ec = systems.systems.environmental_control;
        const safePressure = parseFloat(ec.cabin_pressure_psi);
        displayPressure = isNaN(safePressure) ? 'N/A' : `${safePressure.toFixed(2)} PSI`;
    }

    // WebSocket setup
    useEffect(() => {
        if (!isAuthenticated) return; // Only connect if authenticated
        if (wsRef.current) return;

        const WS_URL =
            window.__MOONBASE_WS_URL__ ||
            `ws://${window.location.hostname}:${process.env.REACT_APP_WS_PORT || 4000}`;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Connected to emergency system');
            setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'emergency_triggered') {
                    setEmergencyActive(true);
                    addAlert(`🔴 EMERGENCY PROTOCOL ACTIVATED BY ${data.user || 'ANOTHER USER'}`);
                    setTimeout(() => setEmergencyActive(false), 8000);
                } else if (data.type === 'emergency_cleared') {
                    setEmergencyActive(false);
                    addAlert('🟢 Emergency protocol cleared');
                }
            } catch (err) {
                console.error('Invalid WS message', err);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error', err);
            setConnectionStatus('disconnected');
            addAlert('ERROR: Emergency system connection failed');
        };

        ws.onclose = () => {
            console.log('WebSocket closed');
            setConnectionStatus('disconnected');
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
            wsRef.current = null;
        };
    }, [isAuthenticated]);

    // Generates system data
    const generateSystemData = () => {
        const volatility = (base, range) => base + (Math.random() - 0.5) * range;
        return {
            timestamp: new Date().toISOString(),
            station_id: "ALPHA-01",
            systems: {
                environmental_control: {
                    oxygen_percentage: volatility(21.0, 1.5),
                    co2_level_ppm: volatility(400, 150),
                    cabin_pressure_psi: volatility(14.7, 0.8),
                    cabin_temperature_c: volatility(21.5, 3.0),
                    humidity_percentage: volatility(45, 20),
                    status: Math.random() > 0.85 ? "caution" : "nominal"
                },
                electrical_power: {
                    solar_array_output_kw: volatility(84, 30),
                    battery_charge_percentage: volatility(85, 15),
                    total_power_available_kw: 120,
                    current_consumption_kw: volatility(75, 25),
                    status: Math.random() > 0.9 ? "caution" : "nominal"
                },
                communications: {
                    ku_band_signal_strength: volatility(85, 25),
                    s_band_signal_strength: volatility(90, 20),
                    uhf_signal_strength: volatility(88, 22),
                    ground_contact: Math.random() > 0.1,
                    next_contact_minutes: Math.floor(Math.random() * 60 + 20),
                    status: "nominal"
                },
                radiation_monitoring: {
                    current_level_msv_per_day: volatility(0.5, 0.6),
                    daily_average_msv: volatility(0.6, 0.3),
                    threshold_msv_per_day: 1.0,
                    shielding_effectiveness: volatility(92, 5),
                    status: Math.random() > 0.75 ? "caution" : "nominal"
                },
                water_management: {
                    potable_water_liters: volatility(450, 100),
                    wastewater_processing_rate: volatility(98, 8),
                    water_quality_index: volatility(95, 5),
                    reserves_percentage: volatility(88, 15),
                    status: Math.random() > 0.85 ? "caution" : "nominal"
                },
                attitude_control: {
                    pitch_degrees: volatility(0, 3),
                    roll_degrees: volatility(0, 3),
                    yaw_degrees: volatility(0, 3),
                    control_moment_gyros: 4,
                    status: "nominal"
                }
            },
            location: {
                latitude: volatility(0, 80),
                longitude: volatility(0, 360),
                altitude_km: volatility(408, 5),
                velocity_kmh: 27600
            }
        };
    };

    const generateFacilityData = () => {
        const volatility = (base, range) => base + (Math.random() - 0.5) * range;
        return {
            central_hub: { name: "Central Hub", pressure_psi: volatility(14.7, 0.5), temperature_c: volatility(21.5, 2), occupancy: Math.floor(Math.random() * 5) + 1, status: Math.random() > 0.9 ? "caution" : "operational" },
            hab_module_a: { name: "Habitat Module A", pressure_psi: volatility(14.7, 0.5), temperature_c: volatility(20.5, 2), occupancy: Math.floor(Math.random() * 3) + 1, status: Math.random() > 0.92 ? "caution" : "operational" },
            hab_module_b: { name: "Habitat Module B", pressure_psi: volatility(14.7, 0.5), temperature_c: volatility(21.0, 2), occupancy: Math.floor(Math.random() * 3) + 1, status: Math.random() > 0.92 ? "caution" : "operational" },
            power_station: { name: "Power Station", pressure_psi: volatility(12.0, 1), temperature_c: volatility(25.0, 3), occupancy: 0, status: Math.random() > 0.88 ? "caution" : "operational" },
            life_support: { name: "Life Support Center", pressure_psi: volatility(14.7, 0.5), temperature_c: volatility(19.5, 2), occupancy: Math.floor(Math.random() * 2), status: Math.random() > 0.85 ? "caution" : "operational" },
            research_lab: { name: "Research Lab", pressure_psi: volatility(14.7, 0.3), temperature_c: volatility(20.0, 1), occupancy: Math.floor(Math.random() * 4) + 1, status: Math.random() > 0.9 ? "caution" : "operational" },
            medical_bay: { name: "Medical Bay", pressure_psi: volatility(14.7, 0.2), temperature_c: volatility(21.5, 1), occupancy: Math.floor(Math.random() * 2), status: Math.random() > 0.95 ? "caution" : "operational" }
        };
    };

    const fetchSystemData = async () => {
        try {
            const mockData = generateSystemData();
            setSystems(mockData);
            setLoading(false);
            setConnectionStatus('connected');
        } catch (error) {
            console.error('Failed to fetch system data:', error);
            setConnectionStatus('disconnected');
        }
    };

    const fetchFacilityData = async () => {
        try {
            const mockFacilityData = generateFacilityData();
            setFacilities(mockFacilityData);
        } catch (error) {
            console.error('Failed to fetch facility data:', error);
        }
    };

    const fetchCrewData = async () => {
        try {
            // Fetch real crew members from backend
            const response = await axios.get(`${API_BASE_URL}/api/accounts`);
            const accounts = response.data;

            // Transform accounts into crew member format
            const crew = accounts.map(acc => ({
                id: acc._id,
                name: acc.fullName,
                email: acc.email,
                role: 'Crew Member', // You can add role field to accounts if needed
                status: acc.status || 'active',
                location: acc.location || 'Command Center',
                joinDate: acc.createdAt
            }));

            setCrewMembers(crew);
        } catch (error) {
            console.error('Failed to fetch crew data:', error);
            // Fallback to empty array if backend is unavailable
            setCrewMembers([]);
        }
    };

    const sendAiMessage = async () => {
        if (!aiInput.trim()) return;
        const userMessage = { role: 'user', content: aiInput, timestamp: new Date() };
        setAiMessages(prev => [...prev, userMessage]);
        setAiInput('');
        setAiThinking(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/ai/chat`, {
                message: userMessage,
                systems,
                facilities,
                crew: crewMembers,
                timestamp: new Date().toISOString()
            });
            setAiMessages(prev => [...prev, response.data]);
        } catch (err) {
            console.error('AI Chat Error:', err);
        } finally {
            setAiThinking(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchSystemData();
        fetchFacilityData();
        fetchCrewData();
        const dataInterval = setInterval(() => {
            fetchSystemData();
            fetchFacilityData();
            fetchCrewData();
        }, 5000);
        const timeInterval = setInterval(() => setTime(new Date()), 1000);
        return () => {
            clearInterval(dataInterval);
            clearInterval(timeInterval);
        };
    }, [isAuthenticated]);

    const addAlert = (message) => {
        setAlerts(prev => {
            const newAlert = { id: Date.now(), message, time: new Date() };
            return [...prev, newAlert].slice(-8);
        });
    };

    const triggerEmergency = async () => {
        setEmergencyActive(true);

        // Play alarm sound
        if (alarmRef.current) {
            alarmRef.current.currentTime = 0;
            alarmRef.current.play().catch(err => console.error('Audio play failed:', err));
        }

        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'emergency_trigger',
                timestamp: new Date().toISOString(),
                user: currentUser?.name || 'Commander Alpha'
            }));
        }

        setTimeout(() => {
            setEmergencyActive(false);
            // Stop alarm sound
            if (alarmRef.current) {
                alarmRef.current.pause();
                alarmRef.current.currentTime = 0;
            }
        }, 8000);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'critical': return '#ef4444';
            case 'warning': return '#f59e0b';
            case 'caution': return '#3b82f6';
            case 'nominal': return '#22c55e';
            case 'operational': return '#22c55e';
            default: return '#6b7280';
        }
    };

    const SystemPanel = ({ icon: Icon, title, metrics, status }) => (
        <div className={`system-panel ${status}`} style={{ borderColor: getStatusColor(status), boxShadow: `0 0 20px ${getStatusColor(status)}40` }}>
            <div className="panel-header">
                <Icon size={24} color={getStatusColor(status)} />
                <h3>{title}</h3>
            </div>
            <div className="panel-metrics">
                {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="metric-row">
                        <span className="metric-label">{key.replace(/_/g, ' ')}:</span>
                        <span className="metric-value">{value}</span>
                    </div>
                ))}
            </div>
            <div className="panel-status" style={{ background: `${getStatusColor(status)}20`, color: getStatusColor(status) }}>
                {status || 'Unknown'}
            </div>
        </div>
    );

    // SIGN UP VIEW
    if (!isAuthenticated) {
        return (
            <div className="auth-container">
                <div className="signup-form">
                    <h2>🚀 Mission Registration</h2>
                    <p className="signup-subtitle">Join Moonbase Alpha Crew</p>
                    <form onSubmit={handleSignUp}>
                        <label htmlFor="name">Astronaut Name:</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter your full name" />
                        {formErrors.name && <span className="error">{formErrors.name}</span>}

                        <label htmlFor="email">Mission Email:</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="your.email@nasa.gov" />
                        {formErrors.email && <span className="error">{formErrors.email}</span>}

                        <label htmlFor="password">Security Code:</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleFormChange} placeholder="Enter security code" />
                        {formErrors.password && <span className="error">{formErrors.password}</span>}

                        <button type="submit">🚀 Register for Mission</button>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="loading-screen"><div>Loading telemetry data...</div></div>;
    }

    return (
        <div className={`dashboard ${emergencyActive ? 'emergency-active' : ''}`}>
            {emergencyActive && <div className="flash-overlay"></div>}

            <header className="header">
                <div className="header-title">
                    <h1>🌙 MOONBASE ALPHA</h1>
                    <div className={`connection-status ${connectionStatus}`}>
                        <Wifi size={20} />
                        <span>{connectionStatus.toUpperCase()}</span>
                    </div>
                </div>
                <div className="header-info">
                    <div>Mission Sol: {Math.floor((Date.now() - new Date('2024-01-15').getTime()) / (1000 * 60 * 60 * 24))}</div>
                    <div>Lunar Time: {time.toISOString().substring(11, 19)}</div>
                    <div>Base ID: {systems?.station_id || 'ALPHA-01'}</div>
                </div>
                {systems?.location && (
                    <div className="location-info">
                        <Globe size={14} />
                        Shackleton Crater Region • Earth Distance: 384,400 km
                    </div>
                )}
                {currentUser && (
                    <div className="user-info">
                        <User size={16} />
                        <span>{currentUser.name}</span>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                )}
            </header>

            <div className="nav-tabs">
                <button className={activeView === 'systems' ? 'active' : ''} onClick={() => setActiveView('systems')}>
                    <Activity size={18} /> Systems
                </button>
                <button className={activeView === 'mission' ? 'active' : ''} onClick={() => setActiveView('mission')}>
                    <FileText size={18} /> Mission Info
                </button>
                <button className={activeView === 'map' ? 'active' : ''} onClick={() => setActiveView('map')}>
                    <Map size={18} /> Base Map
                </button>
                <button className={activeView === 'crew' ? 'active' : ''} onClick={() => setActiveView('crew')}>
                    <Users size={18} /> Crew
                </button>
                <button className={activeView === 'ai' ? 'active' : ''} onClick={() => setActiveView('ai')}>
                    <Brain size={18} /> AI Assistant
                </button>
            </div>

            {emergencyActive && <div className="emergency-banner">🚨 EMERGENCY PROTOCOL ACTIVE 🚨</div>}

            {/* MISSION INFO VIEW */}
            {activeView === 'mission' && (
                <div className="mission-container">
                    <h2><FileText size={24} /> Mission Information</h2>
                    <div className="mission-grid">
                        <div className="mission-card">
                            <h3>👤 Crew Member Profile</h3>
                            <div className="mission-details">
                                <p><strong>Name:</strong> {currentUser.name}</p>
                                <p><strong>Email:</strong> {currentUser.email}</p>
                                <p><strong>Joined:</strong> {new Date(currentUser.joinDate).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> <span style={{ color: '#22c55e' }}>Active</span></p>
                            </div>
                        </div>
                        <div className="mission-card">
                            <h3>🎯 Mission Objectives</h3>
                            <ul className="mission-list">
                                <li>✅ Maintain life support systems</li>
                                <li>✅ Monitor environmental conditions</li>
                                <li>🔄 Conduct lunar surface research</li>
                                <li>🔄 Establish sustainable habitation</li>
                                <li>⏳ Prepare for Mars mission protocols</li>
                            </ul>
                        </div>
                        <div className="mission-card">
                            <h3>📊 Mission Statistics</h3>
                            <div className="mission-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Days on Moon:</span>
                                    <span className="stat-value">{Math.floor((Date.now() - new Date(currentUser.joinDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Systems Monitored:</span>
                                    <span className="stat-value">6</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Crew Members:</span>
                                    <span className="stat-value">{crewMembers.length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Base Modules:</span>
                                    <span className="stat-value">7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Systems View */}
            {activeView === 'systems' && systems?.systems && (
                <>
                    <div className="systems-grid">
                        <SystemPanel icon={Activity} title="Environmental Control" metrics={{ 'O₂ Level': `${systems.systems.environmental_control.oxygen_percentage.toFixed(1)}%`, 'CO₂': `${systems.systems.environmental_control.co2_level_ppm.toFixed(0)} ppm`, 'Pressure': displayPressure, 'Temperature': `${systems.systems.environmental_control.cabin_temperature_c.toFixed(1)}°C`, 'Humidity': `${systems.systems.environmental_control.humidity_percentage.toFixed(0)}%` }} status={systems.systems.environmental_control.status} />
                        <SystemPanel icon={Zap} title="Electrical Power" metrics={{ 'Solar Output': `${systems.systems.electrical_power.solar_array_output_kw.toFixed(1)} kW`, 'Battery': `${systems.systems.electrical_power.battery_charge_percentage.toFixed(0)}%`, 'Consumption': `${systems.systems.electrical_power.current_consumption_kw.toFixed(1)} kW` }} status={systems.systems.electrical_power.status} />
                        <SystemPanel icon={Radio} title="Communications" metrics={{ 'Ku-Band': `${systems.systems.communications.ku_band_signal_strength.toFixed(0)}%`, 'S-Band': `${systems.systems.communications.s_band_signal_strength.toFixed(0)}%`, 'Ground Contact': systems.systems.communications.ground_contact ? 'Active' : 'Lost' }} status={systems.systems.communications.status} />
                        <SystemPanel icon={Shield} title="Radiation Monitor" metrics={{ 'Current': `${systems.systems.radiation_monitoring.current_level_msv_per_day.toFixed(2)} mSv/day`, 'Shielding': `${systems.systems.radiation_monitoring.shielding_effectiveness.toFixed(0)}%` }} status={systems.systems.radiation_monitoring.status} />
                        <SystemPanel icon={Droplet} title="Water Management" metrics={{ 'Potable': `${systems.systems.water_management.potable_water_liters.toFixed(0)} L`, 'Quality': `${systems.systems.water_management.water_quality_index.toFixed(0)}%` }} status={systems.systems.water_management.status} />
                        <SystemPanel icon={Globe} title="Attitude Control" metrics={{ 'Pitch': `${systems.systems.attitude_control.pitch_degrees.toFixed(2)}°`, 'Roll': `${systems.systems.attitude_control.roll_degrees.toFixed(2)}°` }} status={systems.systems.attitude_control.status} />
                    </div>
                    <div className="alerts-panel">
                        <h3><AlertTriangle size={20} /> System Alerts</h3>
                        <div className="alerts-list">
                            {alerts.length === 0 ? <p className="no-alerts">No alerts - All systems nominal</p> : alerts.map(alert => (
                                <div key={alert.id} className="alert-item">
                                    <span className="alert-time">[{alert.time.toLocaleTimeString()}]</span>
                                    {alert.message}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Interactive Map View */}
            {activeView === 'map' && (
                <div className="map-container">
                    <h2><Map size={24} /> Moonbase Layout</h2>
                    <div className="moonbase-map">

                        <svg viewBox="0 0 800 600" className="base-svg">
                            {/* Central Hub */}
                            <g onClick={() => setSelectedModule('hub')} style={{ cursor: 'pointer' }}>
                                <circle cx="400" cy="300" r="60" fill="#1e293b" stroke="#60a5fa" strokeWidth="3" />
                                <text x="400" y="305" textAnchor="middle" fill="white" fontSize="14">Central Hub</text>
                            </g>

                            {/* Hab Modules */}
                            <g onClick={() => setSelectedModule('hab1')} style={{ cursor: 'pointer' }}>
                                <rect x="250" y="150" width="80" height="60" rx="10" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
                                <text x="290" y="185" textAnchor="middle" fill="white" fontSize="12">Hab-A</text>
                            </g>

                            <g onClick={() => setSelectedModule('hab2')} style={{ cursor: 'pointer' }}>
                                <rect x="470" y="150" width="80" height="60" rx="10" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
                                <text x="510" y="185" textAnchor="middle" fill="white" fontSize="12">Hab-B</text>
                            </g>

                            {/* Power Module */}
                            <g onClick={() => setSelectedModule('power')} style={{ cursor: 'pointer' }}>
                                <rect x="250" y="390" width="80" height="60" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                                <text x="290" y="425" textAnchor="middle" fill="white" fontSize="12">Power</text>
                            </g>

                            {/* Life Support */}
                            <g onClick={() => setSelectedModule('life')} style={{ cursor: 'pointer' }}>
                                <rect x="470" y="390" width="80" height="60" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                                <text x="510" y="425" textAnchor="middle" fill="white" fontSize="12">Life Support</text>
                            </g>

                            {/* Research Lab */}
                            <g onClick={() => setSelectedModule('lab')} style={{ cursor: 'pointer' }}>
                                <rect x="150" y="265" width="80" height="60" rx="10" fill="#1e293b" stroke="#a78bfa" strokeWidth="2" />
                                <text x="190" y="300" textAnchor="middle" fill="white" fontSize="12">Lab</text>
                            </g>

                            {/* Medical */}
                            <g onClick={() => setSelectedModule('medical')} style={{ cursor: 'pointer' }}>
                                <rect x="570" y="265" width="80" height="60" rx="10" fill="#1e293b" stroke="#ef4444" strokeWidth="2" />
                                <text x="610" y="300" textAnchor="middle" fill="white" fontSize="12">Medical</text>
                            </g>

                            {/* Connecting corridors */}
                            <line x1="340" y1="240" x2="290" y2="210" stroke="#64748b" strokeWidth="2" />
                            <line x1="460" y1="240" x2="510" y2="210" stroke="#64748b" strokeWidth="2" />
                            <line x1="340" y1="360" x2="290" y2="390" stroke="#64748b" strokeWidth="2" />
                            <line x1="460" y1="360" x2="510" y2="390" stroke="#64748b" strokeWidth="2" />
                            <line x1="340" y1="300" x2="230" y2="295" stroke="#64748b" strokeWidth="2" />
                            <line x1="460" y1="300" x2="570" y2="295" stroke="#64748b" strokeWidth="2" />
                        </svg>

                        {selectedModule && facilities && (
                            <div className="module-info">
                                <h3>
                                    {selectedModule === 'hub' && facilities.central_hub.name}
                                    {selectedModule === 'hab1' && facilities.hab_module_a.name}
                                    {selectedModule === 'hab2' && facilities.hab_module_b.name}
                                    {selectedModule === 'power' && facilities.power_station.name}
                                    {selectedModule === 'life' && facilities.life_support.name}
                                    {selectedModule === 'lab' && facilities.research_lab.name}
                                    {selectedModule === 'medical' && facilities.medical_bay.name}
                                </h3>
                                <p>
                                    Status: <span style={{
                                        color: getStatusColor(
                                            selectedModule === 'hub' ? facilities.central_hub.status :
                                                selectedModule === 'hab1' ? facilities.hab_module_a.status :
                                                    selectedModule === 'hab2' ? facilities.hab_module_b.status :
                                                        selectedModule === 'power' ? facilities.power_station.status :
                                                            selectedModule === 'life' ? facilities.life_support.status :
                                                                selectedModule === 'lab' ? facilities.research_lab.status :
                                                                    selectedModule === 'medical' ? facilities.medical_bay.status : 'unknown'
                                        )
                                    }}>
                                        {selectedModule === 'hub' && facilities.central_hub.status}
                                        {selectedModule === 'hab1' && facilities.hab_module_a.status}
                                        {selectedModule === 'hab2' && facilities.hab_module_b.status}
                                        {selectedModule === 'power' && facilities.power_station.status}
                                        {selectedModule === 'life' && facilities.life_support.status}
                                        {selectedModule === 'lab' && facilities.research_lab.status}
                                        {selectedModule === 'medical' && facilities.medical_bay.status}
                                    </span>
                                </p>
                                <p>
                                    Pressure: <span style={{ color: '#60a5fa' }}>
                                        {selectedModule === 'hub' && facilities.central_hub.pressure_psi.toFixed(2)}
                                        {selectedModule === 'hab1' && facilities.hab_module_a.pressure_psi.toFixed(2)}
                                        {selectedModule === 'hab2' && facilities.hab_module_b.pressure_psi.toFixed(2)}
                                        {selectedModule === 'power' && facilities.power_station.pressure_psi.toFixed(2)}
                                        {selectedModule === 'life' && facilities.life_support.pressure_psi.toFixed(2)}
                                        {selectedModule === 'lab' && facilities.research_lab.pressure_psi.toFixed(2)}
                                        {selectedModule === 'medical' && facilities.medical_bay.pressure_psi.toFixed(2)}
                                    </span> PSI
                                </p>
                                <p>
                                    Temperature: <span style={{ color: '#f59e0b' }}>
                                        {selectedModule === 'hub' && facilities.central_hub.temperature_c.toFixed(1)}
                                        {selectedModule === 'hab1' && facilities.hab_module_a.temperature_c.toFixed(1)}
                                        {selectedModule === 'hab2' && facilities.hab_module_b.temperature_c.toFixed(1)}
                                        {selectedModule === 'power' && facilities.power_station.temperature_c.toFixed(1)}
                                        {selectedModule === 'life' && facilities.life_support.temperature_c.toFixed(1)}
                                        {selectedModule === 'lab' && facilities.research_lab.temperature_c.toFixed(1)}
                                        {selectedModule === 'medical' && facilities.medical_bay.temperature_c.toFixed(1)}
                                    </span> °C
                                </p>
                                <p>
                                    Occupancy: <span style={{ color: '#a78bfa' }}>
                                        {selectedModule === 'hub' && facilities.central_hub.occupancy}
                                        {selectedModule === 'hab1' && facilities.hab_module_a.occupancy}
                                        {selectedModule === 'hab2' && facilities.hab_module_b.occupancy}
                                        {selectedModule === 'power' && facilities.power_station.occupancy}
                                        {selectedModule === 'life' && facilities.life_support.occupancy}
                                        {selectedModule === 'lab' && facilities.research_lab.occupancy}
                                        {selectedModule === 'medical' && facilities.medical_bay.occupancy}
                                    </span> person(s)
                                </p>
                                <button onClick={() => setSelectedModule(null)}>Close</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Crew View */}
            {activeView === 'crew' && (
                <div className="crew-container">
                    <h2><Users size={24} /> Crew Roster</h2>
                    <div className="crew-grid">
                        {crewMembers.map(crew => (
                            <div key={crew.id} className="crew-card">
                                <h3>{crew.name}</h3>
                                <p className="crew-role">{crew.role}</p>
                                <div className="crew-details">
                                    <span className={`crew-status ${crew.status}`}>
                                        {crew.status === 'active' ? '🟢' : crew.status === 'resting' ? '🟡' : '🔵'} {crew.status}
                                    </span>
                                    <span className="crew-location">📍 {crew.location}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Assistant */}
            {activeView === 'ai' && (
                <div className="ai-container">
                    <h2><Brain size={24} /> AI Mission Assistant</h2>
                    <div className="ai-chat">
                        <div className="ai-messages">
                            {aiMessages.length === 0 ? (
                                <div className="ai-welcome">
                                    <Brain size={48} color="#60a5fa" />
                                    <h3>Hello! I'm your AI mission assistant.</h3>
                                    <p>I can help you analyze systems, monitor crew, check facilities, and provide recommendations based on current telemetry.</p>
                                    <p>Try asking: "What's the current status?" or "How are radiation levels?" or "Check facility conditions"</p>
                                </div>
                            ) : (
                                aiMessages.map((msg, idx) => (
                                    <div key={idx} className={`ai-message ${msg.role}`}>
                                        <div className="message-avatar">
                                            {msg.role === 'user' ? '👤' : '🤖'}
                                        </div>
                                        <div className="message-content">
                                            <p>{msg.content}</p>
                                            <span className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            {aiThinking && (
                                <div className="ai-message assistant">
                                    <div className="message-avatar">🤖</div>
                                    <div className="message-content">
                                        <p className="thinking">Analyzing data...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="ai-input-container">
                            <input
                                type="text"
                                placeholder="Ask about systems, crew, facilities, or request analysis..."
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
                                disabled={aiThinking}
                            />
                            <button onClick={sendAiMessage} disabled={aiThinking || !aiInput.trim()}>
                                <MessageSquare size={20} /> Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="emergency-controls">
                <button onClick={triggerEmergency} disabled={emergencyActive} className={`emergency-btn ${emergencyActive ? 'active' : ''}`}>
                    🔴 {emergencyActive ? 'PROTOCOL ACTIVE' : 'TRIGGER EMERGENCY PROTOCOL'}
                </button>
            </div>
        </div>
    );
};

export default MoonbaseDashboard;