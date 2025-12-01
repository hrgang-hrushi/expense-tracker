// src/MoonbaseDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Radio,
  Droplet,
  Zap,
  Shield,
  Activity,
  Wifi,
  Globe
} from 'lucide-react';
import './App.css';

const MoonbaseDashboard = () => {
  const [systems, setSystems] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const wsRef = useRef(null);

  // 🧩 Safe pressure display logic
  let displayPressure = 'N/A';
  if (systems?.systems?.environmental_control?.cabin_pressure_psi) {
    const ec = systems.systems.environmental_control;
    const safePressure = parseFloat(ec.cabin_pressure_psi);
    displayPressure = isNaN(safePressure)
      ? 'N/A'
      : `${safePressure.toFixed(2)} PSI`;
  }

  // 🛰️ WebSocket setup
  useEffect(() => {
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
          addAlert(
            `🔴 EMERGENCY PROTOCOL ACTIVATED BY ${data.user || 'ANOTHER USER'}`
          );
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
  }, []);

  // 📡 Telemetry data fetcher
  const fetchSystemData = async () => {
    try {
      const lat = 31.418;
      const lon = 73.079;

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl`
      );
      const weatherJson = await weatherRes.json();
      const cw = weatherJson.current_weather;
      const humidity = weatherJson.hourly?.relativehumidity_2m?.[0] ?? 50;
      const pressure = weatherJson.hourly?.pressure_msl?.[0] ?? 1013;

      // ✅ Use HTTPS for ISS API (HTTP blocks in browsers)
      const issRes = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      const issJson = await issRes.json();
      const issPos = {
        latitude: issJson.latitude,
        longitude: issJson.longitude
      };

      const co2 = 400 + Math.random() * 50;
      const rad = 0.5 + Math.random() * 0.3;

      const realData = {
        timestamp: new Date().toISOString(),
        station_id: 'ALPHA-01',
        systems: {
          environmental_control: {
            oxygen_percentage: 21.0,
            co2_level_ppm: co2,
            cabin_pressure_psi: cw?.pressure
              ? (pressure / 68.9476).toFixed(2)
              : (14.7 + (Math.random() - 0.5) * 0.2).toFixed(2),
            cabin_temperature_c: cw?.temperature ?? 22,
            humidity_percentage: humidity,
            status: 'nominal'
          },
          electrical_power: {
            solar_array_output_kw: 84 + Math.random() * 16,
            battery_charge_percentage: 90 + Math.random() * 10,
            total_power_available_kw: 120,
            current_consumption_kw: 75 + Math.random() * 10,
            status: 'nominal'
          },
          communications: {
            ku_band_signal_strength: 85 + Math.random() * 15,
            s_band_signal_strength: 90 + Math.random() * 10,
            uhf_signal_strength: 88 + Math.random() * 12,
            ground_contact: true,
            next_contact_minutes: 45,
            status: 'nominal'
          },
          radiation_monitoring: {
            current_level_msv_per_day: rad,
            daily_average_msv: rad + 0.1,
            threshold_msv_per_day: 1.0,
            shielding_effectiveness: 90,
            status: rad > 0.8 ? 'caution' : 'nominal'
          },
          water_management: {
            potable_water_liters: 450 + Math.random() * 50,
            wastewater_processing_rate: 98,
            water_quality_index: 95,
            reserves_percentage: 88 + Math.random() * 10,
            status: 'nominal'
          },
          attitude_control: {
            pitch_degrees: (Math.random() - 0.5) * 2,
            roll_degrees: (Math.random() - 0.5) * 2,
            yaw_degrees: (Math.random() - 0.5) * 2,
            control_moment_gyros: 4,
            status: 'nominal'
          }
        },
        location: {
          latitude: parseFloat(issPos.latitude),
          longitude: parseFloat(issPos.longitude),
          altitude_km: 408 + Math.random() * 2,
          velocity_kmh: 27600
        }
      };

      setSystems(realData);
      setLoading(false);
      setConnectionStatus('connected');

      if (rad > 0.8) addAlert('CAUTION: Elevated radiation levels detected');
      if (co2 > 450) addAlert('WARNING: CO2 levels above normal range');
    } catch (error) {
      console.error('Failed to fetch real data:', error);
      setConnectionStatus('disconnected');
      addAlert('ERROR: Lost connection to telemetry server');
    }
  };

  useEffect(() => {
    fetchSystemData();
    const dataInterval = setInterval(fetchSystemData, 5000);
    const timeInterval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const addAlert = (message) => {
    setAlerts((prev) => {
      const newAlert = { id: Date.now(), message, time: new Date() };
      return [...prev, newAlert].slice(-8);
    });
  };

  const triggerEmergency = async () => {
    setEmergencyActive(true);
    const ws = wsRef.current;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'emergency_trigger',
          timestamp: new Date().toISOString(),
          user: 'Commander Alpha'
        })
      );
    } else {
      console.warn('WebSocket is not open — cannot broadcast emergency');
    }

    setTimeout(() => setEmergencyActive(false), 8000);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'caution':
        return '#3b82f6';
      case 'nominal':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const SystemPanel = ({ icon: Icon, title, metrics, status }) => (
    <div
      className={`system-panel ${status}`}
      style={{
        borderColor: getStatusColor(status),
        boxShadow: `0 0 20px ${getStatusColor(status)}40`
      }}
    >
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
      <div
        className="panel-status"
        style={{
          background: `${getStatusColor(status)}20`,
          color: getStatusColor(status)
        }}
      >
        {status || 'Unknown'}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div>Loading telemetry data...</div>
      </div>
    );
  }

  return (
    <div className={`dashboard ${emergencyActive ? 'emergency-active' : ''}`}>
      {emergencyActive && (
        <div
          className="flash-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(220, 38, 38, 0.7)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        ></div>
      )}

      <header className="header">
        <div className="header-title">
          <h1>🌙 MOONBASE ALPHA</h1>
          <div className={`connection-status ${connectionStatus}`}>
            <Wifi size={20} />
            <span>{connectionStatus.toUpperCase()}</span>
          </div>
        </div>
        <div className="header-info">
          <div>
            Mission Sol:{' '}
            {Math.floor(
              (Date.now() - new Date('2024-01-15').getTime()) /
                (1000 * 60 * 60 * 24)
            )}
          </div>
          <div>Lunar Time: {time.toISOString().substring(11, 19)}</div>
          <div>Base ID: {systems?.station_id || 'ALPHA-01'}</div>
        </div>
        {systems?.location && (
          <div className="location-info">
            <Globe size={14} /> Shackleton Crater Region • Earth Distance:
            384,400 km • Surface Temperature: -173°C
          </div>
        )}
      </header>

      {emergencyActive && (
        <div className="emergency-banner">🚨 EMERGENCY PROTOCOL ACTIVE 🚨</div>
      )}

      {systems?.systems && (
        <div className="systems-grid">
          <SystemPanel
            icon={Activity}
            title="Environmental Control"
            metrics={{
              'O₂ Level': `${systems.systems.environmental_control.oxygen_percentage.toFixed(
                1
              )}%`,
              'CO₂': `${systems.systems.environmental_control.co2_level_ppm.toFixed(
                0
              )} ppm`,
              'Pressure': displayPressure,
              'Temperature': `${systems.systems.environmental_control.cabin_temperature_c.toFixed(
                1
              )}°C`,
              'Humidity': `${systems.systems.environmental_control.humidity_percentage.toFixed(
                0
              )}%`
            }}
            status={systems.systems.environmental_control.status}
          />

                    <SystemPanel
                        icon={Zap}
                        title="Electrical Power"
                        metrics={{
                            'Solar Output': `${systems.systems.electrical_power.solar_array_output_kw.toFixed(1)} kW`,
                            'Battery': `${systems.systems.electrical_power.battery_charge_percentage.toFixed(0)}%`,
                            'Consumption': `${systems.systems.electrical_power.current_consumption_kw.toFixed(1)} kW`,
                            'Available': `${systems.systems.electrical_power.total_power_available_kw} kW`
                        }}
                        status={systems.systems.electrical_power.status}
                    />
                    <SystemPanel
                        icon={Radio}
                        title="Communications"
                        metrics={{
                            'Ku-Band': `${systems.systems.communications.ku_band_signal_strength.toFixed(0)}%`,
                            'S-Band': `${systems.systems.communications.s_band_signal_strength.toFixed(0)}%`,
                            'UHF': `${systems.systems.communications.uhf_signal_strength.toFixed(0)}%`,
                            'Ground Contact': systems.systems.communications.ground_contact ? 'Active' : 'Lost',
                            'Next Pass': `${systems.systems.communications.next_contact_minutes} min`
                        }}
                        status={systems.systems.communications.status}
                    />
                    <SystemPanel
                        icon={Shield}
                        title="Radiation Monitor"
                        metrics={{
                            'Current': `${systems.systems.radiation_monitoring.current_level_msv_per_day.toFixed(2)} mSv/day`,
                            'Daily Avg': `${systems.systems.radiation_monitoring.daily_average_msv.toFixed(2)} mSv`,
                            'Threshold': `${systems.systems.radiation_monitoring.threshold_msv_per_day.toFixed(1)} mSv/day`,
                            'Shielding': `${systems.systems.radiation_monitoring.shielding_effectiveness}%`
                        }}
                        status={systems.systems.radiation_monitoring.status}
                    />
                    <SystemPanel
                        icon={Droplet}
                        title="Water Management"
                        metrics={{
                            'Potable': `${systems.systems.water_management.potable_water_liters.toFixed(0)} L`,
                            'Processing': `${systems.systems.water_management.wastewater_processing_rate}%`,
                            'Quality': `${systems.systems.water_management.water_quality_index}%`,
                            'Reserves': `${systems.systems.water_management.reserves_percentage.toFixed(0)}%`
                        }}
                        status={systems.systems.water_management.status}
                    />
                    <SystemPanel
                        icon={Globe}
                        title="Attitude Control"
                        metrics={{
                            'Pitch': `${systems.systems.attitude_control.pitch_degrees.toFixed(2)}°`,
                            'Roll': `${systems.systems.attitude_control.roll_degrees.toFixed(2)}°`,
                            'Yaw': `${systems.systems.attitude_control.yaw_degrees.toFixed(2)}°`,
                            'CMGs Active': `${systems.systems.attitude_control.control_moment_gyros}/4`
                        }}
                        status={systems.systems.attitude_control.status}
                    />
                </div>
            )}

            <div className="alerts-panel">
                <h3>
                    <AlertTriangle size={20} />
                    System Alerts & Notifications
                </h3>
                <div className="alerts-list">
                    {alerts.length === 0 ? (
                        <p className="no-alerts">No alerts - All systems nominal</p>
                    ) : (
                        alerts.map(alert => (
                            <div key={alert.id} className="alert-item">
                                <span className="alert-time">[{alert.time.toLocaleTimeString()}]</span>
                                {alert.message}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="emergency-controls">
                <button
                    onClick={triggerEmergency}
                    disabled={emergencyActive}
                    className={`emergency-btn ${emergencyActive ? 'active' : ''}`}
                >
                    🔴 {emergencyActive ? 'PROTOCOL ACTIVE' : 'TRIGGER EMERGENCY PROTOCOL'}
                </button>
            </div>
        </div>
    );
};

export default MoonbaseDashboard;