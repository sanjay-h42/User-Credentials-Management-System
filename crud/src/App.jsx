import React, { useState, useEffect } from 'react';
import "./App.css";
import { v4 as uuid } from "uuid";

const API_BASE = "http://localhost:3001/api";

const App = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null); // Auth state
  const [ButtonState, setButtonState] = useState("add");
  const [userInfo, setUserInfo] = useState({
    id: uuid(),
    name: "",
    age: "",
    email: "",
    phone: "",
  });

  // Fetch users from secure backend
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handlechange = (e) => {
    const { name, value } = e.target;
    setUserInfo((currInfo) => ({
      ...currInfo,
      [name]: value,
    }));
  };

  const addData = async () => {
    try {
      const newUser = { ...userInfo };
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        setUsers((currUsers) => [...currUsers, newUser]);
        setUserInfo({ id: uuid(), name: "", age: "", email: "", phone: "" });
      }
    } catch (err) {
      console.error("Failed to add user:", err);
    }
  };

  const DeleteData = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
      if (response.ok) {
        setUsers((currUsers) => currUsers.filter((u) => u.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const startEditing = (selectedUser) => {
    setUserInfo(selectedUser);
    setButtonState("Edit");
  };

  const UpdateData = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/${userInfo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfo),
      });
      if (response.ok) {
        setUsers((currUsers) =>
          currUsers.map((u) => (u.id === userInfo.id ? userInfo : u))
        );
        CancelEditing();
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const CancelEditing = () => {
    setUserInfo({ id: uuid(), name: "", age: "", email: "", phone: "" });
    setButtonState("add");
  };

  const handleLogin = async () => {
    // Simulated Google OAuth Flow
    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "mock-google-token" }),
      });
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error("OAuth failed:", err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsers([]);
  };

  if (!user) {
    return (
      <div className="app-wrapper">
        <div className="bg-animation"></div>
        <div className="container auth-container">
          <h1>Socio Admin</h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            Welcome back! Please sign in to manage users.
          </p>
          <button className="google-btn" onClick={handleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div className="bg-animation"></div>
      <div className="container">
        <div className="dashboard-header">
          <div className="user-profile">
            <div className="user-avatar-letter">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
          <button className="delete-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="form-section">
          <h2>Manage Members</h2>
          <input type="text" placeholder="Full Name" value={userInfo.name} name="name" onChange={handlechange} />
          <input type="number" placeholder="Age" value={userInfo.age} name="age" onChange={handlechange} />
          <input type="email" placeholder="Email Address" value={userInfo.email} name="email" onChange={handlechange} />
          <input type="text" placeholder="Phone Number" value={userInfo.phone} name="phone" onChange={handlechange} />

          {ButtonState === "add" ? (
            <button className="add-btn" onClick={addData}>Add Member</button>
          ) : (
            <div className="action-btns">
              <button onClick={UpdateData} style={{ flex: 1 }}>Update</button>
              <button onClick={CancelEditing} className="cancel-btn" style={{ flex: 1 }}>Cancel</button>
            </div>
          )}
        </div>

        <div className="dataTable">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.age}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td className="action-btns">
                    <button className="edit-btn" onClick={() => startEditing(u)}>Edit</button>
                    <button className="delete-btn" onClick={() => DeleteData(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
