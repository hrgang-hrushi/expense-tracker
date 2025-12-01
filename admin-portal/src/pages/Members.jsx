function Members() {
  const members = [
    { id: 1, name: 'John Smith', email: 'john@email.com', joined: 'Jan 10, 2024', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', joined: 'Jan 8, 2024', status: 'Active' },
    { id: 3, name: 'Mike Davis', email: 'mike@email.com', joined: 'Jan 5, 2024', status: 'Active' },
    { id: 4, name: 'Emily Brown', email: 'emily@email.com', joined: 'Dec 28, 2023', status: 'Active' },
    { id: 5, name: 'Alex Martinez', email: 'alex@email.com', joined: 'Dec 20, 2023', status: 'Inactive' },
  ];

  return (
    <div>
      <div className="data-table">
        <div className="table-header">
          <h3>All Members</h3>
          <button className="btn-secondary">Add Member</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.joined}</td>
                <td>{member.status}</td>
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

export default Members;
