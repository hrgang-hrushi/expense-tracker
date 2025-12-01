function Events() {
  const events = [
    { id: 1, title: 'Startup Pitch Night', date: 'Jan 25, 2024', location: 'Virtual', attendees: 45 },
    { id: 2, title: 'Business Workshop', date: 'Jan 30, 2024', location: 'New York', attendees: 32 },
    { id: 3, title: 'Networking Mixer', date: 'Feb 5, 2024', location: 'San Francisco', attendees: 67 },
    { id: 4, title: 'Leadership Panel', date: 'Feb 12, 2024', location: 'Virtual', attendees: 89 },
    { id: 5, title: 'Innovation Summit', date: 'Feb 20, 2024', location: 'Los Angeles', attendees: 120 },
  ];

  return (
    <div>
      <div className="data-table">
        <div className="table-header">
          <h3>All Events</h3>
          <button className="btn-secondary">Create Event</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Attendees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.location}</td>
                <td>{event.attendees}</td>
                <td>
                  <button className="btn-secondary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Events;
