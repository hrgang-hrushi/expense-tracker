function Settings() {
  return (
    <div>
      <div className="data-table">
        <div className="table-header">
          <h3>General Settings</h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div className="form-group">
            <label htmlFor="siteName">Site Name</label>
            <input type="text" id="siteName" defaultValue="Teen Business Network" />
          </div>

          <div className="form-group">
            <label htmlFor="siteEmail">Contact Email</label>
            <input type="email" id="siteEmail" defaultValue="contact@tbn.com" />
          </div>

          <div className="form-group">
            <label htmlFor="siteDescription">Site Description</label>
            <textarea 
              id="siteDescription" 
              rows="4"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              defaultValue="A youth-led platform for teen entrepreneurs"
            />
          </div>

          <button className="btn-primary" style={{ width: 'auto', paddingLeft: '32px', paddingRight: '32px' }}>
            Save Changes
          </button>
        </div>
      </div>

      <div className="data-table" style={{ marginTop: '32px' }}>
        <div className="table-header">
          <h3>Admin Account</h3>
        </div>
        <div style={{ padding: '24px' }}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input type="password" id="currentPassword" />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input type="password" id="newPassword" />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input type="password" id="confirmPassword" />
          </div>

          <button className="btn-primary" style={{ width: 'auto', paddingLeft: '32px', paddingRight: '32px' }}>
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
