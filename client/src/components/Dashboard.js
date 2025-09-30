// client/src/components/Dashboard.js
// Main dashboard component with contact management functionality

import React, { useState, useEffect } from 'react';
import { contactsAPI } from '../services/api';
import { logout, getUserData } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import UserManagement from './UserManagement';
import ContactList from './ContactList';
import ContactForm from './ContactForm';

const Dashboard = () => {

  // Component state management
  const navigate = useNavigate();
  const user = getUserData();

  console.log('Dashboard loaded for user:', user?.email);
  console.log('Dashboard user data:', user);
  console.log('=== DASHBOARD LOADED ===');
  console.log('User from storage:', user);
  console.log('======================');

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);

  // Load contacts and statistics on component mount
  useEffect(() => {
    loadContacts();
    loadStats();
  }, []);

  // Function to load all contacts for the organization
  const loadContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contactsAPI.getAll();
      setContacts(data);
    } catch (error) {
      setError('Failed to load contacts: ' + error.message);
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to load contact statistics
  const loadStats = async () => {
    try {
      const statsData = await contactsAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Function to handle user logout
  const handleLogout = async () => {
  const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    try {
      await logout();
      navigate('/login', { replace: true });  // Navigate instead of calling onLogout
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });  // Still navigate even if API fails
    }
  };

  // Function to open contact form for creating new contact
  const openCreateForm = () => {
    setEditingContact(null);
    setShowContactForm(true);
    clearMessages();
  };

  // Function to open contact form for editing existing contact
  const openEditForm = (contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
    clearMessages();
  };

  // Function to close contact form
  const closeContactForm = () => {
    setShowContactForm(false);
    setEditingContact(null);
  };

  // Function to handle contact save (create or update)
  const handleContactSave = async (contactData) => {
    try {
      setError('');
      
      if (editingContact) {
        // Update existing contact
        await contactsAPI.update(editingContact.id, contactData);
        setSuccess('Contact updated successfully');
      } else {
        // Create new contact
        await contactsAPI.create(contactData);
        setSuccess('Contact created successfully');
      }
      
      closeContactForm();
      loadContacts();
      loadStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to save contact: ' + error.message);
    }
  };

  // Function to handle contact deletion
  const handleContactDelete = async (contact) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${contact.first_name} ${contact.last_name}?`
    );
    
    if (!confirmDelete) return;

    try {
      setError('');
      await contactsAPI.delete(contact.id);
      setSuccess('Contact deleted successfully');
      loadContacts();
      loadStats();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete contact: ' + error.message);
    }
  };

  // Function to handle contact search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadContacts();
      return;
    }

    try {
      setLoading(true);
      setError('');
      const results = await contactsAPI.search(searchQuery);
      setContacts(results);
    } catch (error) {
      setError('Search failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear search and reload all contacts
  const clearSearch = () => {
    setSearchQuery('');
    loadContacts();
  };

  // Function to clear error and success messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-info">
            <h1>CRM Dashboard</h1>
            <p>Welcome back, {user?.firstName} {user?.lastName}!</p>
            <span className="organization-info">
              Organization: {user?.organizationName || 'Your Organization'}
            </span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {/* User Management Section */}
       <UserManagement currentUser={user} />
    
      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Contacts</h3>
              <div className="stat-number">{stats.totalContacts}</div>
            </div>
            <div className="stat-card">
              <h3>With Email</h3>
              <div className="stat-number">{stats.contactsWithEmail}</div>
              <div className="stat-percentage">{stats.emailPercentage}%</div>
            </div>
            <div className="stat-card">
              <h3>Recent Contacts</h3>
              <div className="stat-number">{stats.recentContacts}</div>
              <div className="stat-subtitle">Last 7 days</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Error and Success Messages */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearMessages} className="close-message">×</button>
          </div>
        )}
        {success && (
          <div className="success-message">
            {success}
            <button onClick={clearMessages} className="close-message">×</button>
          </div>
        )}

        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-section">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name or email..."
              className="search-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
            {searchQuery && (
              <button onClick={clearSearch} className="clear-search-button">
                Clear
              </button>
            )}
          </div>

          <button onClick={openCreateForm} className="create-button">
            + Add Contact
          </button>
        </div>

        {/* Contacts Section */}
        <div className="contacts-section">
          <div className="section-header">
            <h2>Contacts ({contacts.length})</h2>
          </div>

          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Loading contacts...</p>
            </div>
          ) : (
            <ContactList
              contacts={contacts}
              onEdit={openEditForm}
              onDelete={handleContactDelete}
            />
          )}
        </div>
      </main>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ContactForm
              contact={editingContact}
              onSave={handleContactSave}
              onCancel={closeContactForm}
              isEditing={!!editingContact}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;