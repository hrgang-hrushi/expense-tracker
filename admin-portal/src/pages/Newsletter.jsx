function Newsletter() {
  const subscribers = [
    { id: 1, email: 'subscriber1@email.com', subscribed: 'Jan 12, 2024', status: 'Active' },
    { id: 2, email: 'subscriber2@email.com', subscribed: 'Jan 10, 2024', status: 'Active' },
    { id: 3, email: 'subscriber3@email.com', subscribed: 'Jan 8, 2024', status: 'Active' },
    { id: 4, email: 'subscriber4@email.com', subscribed: 'Jan 5, 2024', status: 'Active' },
    { id: 5, email: 'subscriber5@email.com', subscribed: 'Dec 30, 2023', status: 'Unsubscribed' },
  ];

  return (
    <div>
      <div className="data-table">
        <div className="table-header">
          <h3>Newsletter Subscribers</h3>
          <button className="btn-secondary">Send Newsletter</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map(subscriber => (
              <tr key={subscriber.id}>
                <td>{subscriber.email}</td>
                <td>{subscriber.subscribed}</td>
                <td>{subscriber.status}</td>
                <td>
                  <button className="btn-secondary">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Newsletter;
