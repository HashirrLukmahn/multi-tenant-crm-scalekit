// client/src/components/ContactList.js
// Component to display list of contacts with edit and delete actions

import React from 'react';

const ContactList = ({ contacts, onEdit, onDelete }) => {
  
  // Function to format contact display name
  const getContactName = (contact) => {
    return `${contact.first_name} ${contact.last_name}`;
  };

  // Function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to get initials for avatar
  const getInitials = (contact) => {
    const firstInitial = contact.first_name ? contact.first_name.charAt(0).toUpperCase() : '';
    const lastInitial = contact.last_name ? contact.last_name.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  // Function to handle edit button click
  const handleEdit = (contact) => {
    onEdit(contact);
  };

  // Function to handle delete button click
  const handleDelete = (contact) => {
    onDelete(contact);
  };

  // Render empty state when no contacts
  if (contacts.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>📝</div>
        <h3 style={styles.emptyTitle}>No contacts yet</h3>
        <p style={styles.emptyText}>Add your first contact to get started with your CRM</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.contactGrid}>
        {contacts.map((contact) => (
          <div key={contact.id} style={styles.contactCard}>
            
            {/* Contact Header with Avatar and Name */}
            <div style={styles.contactHeader}>
              <div style={styles.contactAvatar}>
                {getInitials(contact)}
              </div>
              <div style={styles.contactName}>
                <h3 style={styles.nameText}>{getContactName(contact)}</h3>
                <span style={styles.contactId}>ID: {contact.id.slice(0, 8)}...</span>
              </div>
            </div>

            {/* Contact Details */}
            <div style={styles.contactDetails}>
              {contact.email && (
                <div style={styles.contactDetail}>
                  <span style={styles.detailIcon}>✉</span>
                  <span style={styles.detailValue}>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div style={styles.contactDetail}>
                  <span style={styles.detailIcon}>📞</span>
                  <span style={styles.detailValue}>{contact.phone}</span>
                </div>
              )}
              {contact.address && (
                <div style={styles.contactDetail}>
                  <span style={styles.detailIcon}>📍</span>
                  <span style={styles.detailValue}>{contact.address}</span>
                </div>
              )}
            </div>

            {/* Contact Metadata */}
            <div style={styles.contactMeta}>
              <span style={styles.metaDate}>
                Created: {formatDate(contact.created_at)}
              </span>
              {contact.updated_at !== contact.created_at && (
                <span style={styles.metaDate}>
                  Updated: {formatDate(contact.updated_at)}
                </span>
              )}
            </div>

            {/* Contact Actions */}
            <div style={styles.contactActions}>
              <button
                onClick={() => handleEdit(contact)}
                style={{...styles.actionButton, ...styles.editButton}}
                title="Edit contact"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(contact)}
                style={{...styles.actionButton, ...styles.deleteButton}}
                title="Delete contact"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline styles for the component
const styles = {
  container: {
    padding: '20px',
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    marginBottom: '12px',
    color: '#333',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#666',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  contactCard: {
    border: '1px solid #eee',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#fafafa',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  contactHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  contactAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    marginRight: '16px',
    fontSize: '18px',
  },
  contactName: {
    flex: 1,
  },
  nameText: {
    fontSize: '1.2rem',
    color: '#333',
    marginBottom: '4px',
    fontWeight: '600',
  },
  contactId: {
    color: '#888',
    fontSize: '0.8rem',
  },
  contactDetails: {
    marginBottom: '16px',
  },
  contactDetail: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    color: '#555',
  },
  detailIcon: {
    marginRight: '8px',
    width: '20px',
    textAlign: 'center',
  },
  detailValue: {
    wordBreak: 'break-word',
    fontSize: '0.9rem',
  },
  contactMeta: {
    marginBottom: '16px',
    fontSize: '0.85rem',
    color: '#888',
  },
  metaDate: {
    display: 'block',
    marginBottom: '4px',
  },
  contactActions: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    flex: 1,
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  editButton: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
};

// Add hover effects programmatically since we can't use CSS :hover in inline styles
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    .contact-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .edit-button:hover {
      background-color: #1e7e34 !important;
    }
    .delete-button:hover {
      background-color: #c82333 !important;
    }
  `;
  document.head.appendChild(style);
};

// Add hover effects when component mounts
if (typeof window !== 'undefined') {
  addHoverEffects();
}

export default ContactList;