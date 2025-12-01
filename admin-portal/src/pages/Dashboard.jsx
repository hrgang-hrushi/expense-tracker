function Dashboard() {
  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Total Members</h3>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="stat-card-value">1,247</div>
          <div className="stat-card-change positive">+12% from last month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Active Events</h3>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-card-value">24</div>
          <div className="stat-card-change positive">+3 new this week</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Newsletter Subscribers</h3>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="stat-card-value">3,891</div>
          <div className="stat-card-change positive">+156 this week</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Engagement Rate</h3>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="stat-card-value">68%</div>
          <div className="stat-card-change positive">+5% from last week</div>
        </div>
      </div>

      <div className="data-table">
        <div className="table-header">
          <h3>Recent Activity</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>User</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Jan 15, 2024</td>
              <td>New member registration</td>
              <td>John Smith</td>
              <td>Completed</td>
            </tr>
            <tr>
              <td>Jan 15, 2024</td>
              <td>Event RSVP</td>
              <td>Sarah Johnson</td>
              <td>Completed</td>
            </tr>
            <tr>
              <td>Jan 14, 2024</td>
              <td>Newsletter sent</td>
              <td>Admin</td>
              <td>Delivered</td>
            </tr>
            <tr>
              <td>Jan 14, 2024</td>
              <td>New event created</td>
              <td>Admin</td>
              <td>Published</td>
            </tr>
            <tr>
              <td>Jan 13, 2024</td>
              <td>Member update</td>
              <td>Mike Davis</td>
              <td>Completed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
