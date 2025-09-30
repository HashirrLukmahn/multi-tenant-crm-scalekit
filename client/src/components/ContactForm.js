// client/src/components/ContactForm.js
// Form component for creating and editing contacts

import React, { useState, useEffect } from 'react';

const ContactForm = ({ contact, onSave, onCancel, isEditing }) => {
  
  // Form state management
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form data when contact prop changes
  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        address: contact.address || ''
      });
    } else {
      // Reset form for new contact
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: ''
      });
    }
    setErrors({});
  }, [contact]);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Function to validate form data
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // Email validation (if provided)
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (if provided) - basic validation for numbers and common characters
    if (formData.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Check for minimum length requirements
    if (formData.first_name.trim() && formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }
    if (formData.last_name.trim() && formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Clean up form data before sending
      const cleanedData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null
      };

      // Call parent save handler
      await onSave(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: 'Failed to save contact. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form cancellation
  const handleCancel = () => {
    onCancel();
  };

  return (
    <div style={styles.contactForm}>
      {/* Form Header */}
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>
          {isEditing ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <button 
          onClick={handleCancel} 
          style={styles.closeButton} 
          title="Close"
          type="button"
        >
          ×
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} style={styles.formContent}>
        
        {/* General Error Message */}
        {errors.general && (
          <div style={styles.generalError}>
            {errors.general}
          </div>
        )}

        {/* First Name Field */}
        <div style={styles.formGroup}>
          <label htmlFor="first_name" style={styles.formLabel}>
            First Name *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            style={{
              ...styles.formInput,
              ...(errors.first_name ? styles.inputError : {})
            }}
            placeholder="Enter first name"
            disabled={loading}
            maxLength="50"
          />
          {errors.first_name && (
            <span style={styles.errorText}>{errors.first_name}</span>
          )}
        </div>

        {/* Last Name Field */}
        <div style={styles.formGroup}>
          <label htmlFor="last_name" style={styles.formLabel}>
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            style={{
              ...styles.formInput,
              ...(errors.last_name ? styles.inputError : {})
            }}
            placeholder="Enter last name"
            disabled={loading}
            maxLength="50"
          />
          {errors.last_name && (
            <span style={styles.errorText}>{errors.last_name}</span>
          )}
        </div>

        {/* Email Field */}
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.formLabel}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={{
              ...styles.formInput,
              ...(errors.email ? styles.inputError : {})
            }}
            placeholder="Enter email address"
            disabled={loading}
            maxLength="100"
          />
          {errors.email && (
            <span style={styles.errorText}>{errors.email}</span>
          )}
        </div>

        {/* Phone Field */}
        <div style={styles.formGroup}>
          <label htmlFor="phone" style={styles.formLabel}>
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            style={{
              ...styles.formInput,
              ...(errors.phone ? styles.inputError : {})
            }}
            placeholder="Enter phone number"
            disabled={loading}
            maxLength="20"
          />
          {errors.phone && (
            <span style={styles.errorText}>{errors.phone}</span>
          )}
        </div>

        {/* Address Field */}
        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.formLabel}>
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            style={{...styles.formInput, ...styles.addressInput}}
            placeholder="Enter address"
            disabled={loading}
            rows="3"
            maxLength="200"
          />
        </div>

        {/* Form Actions */}
        <div style={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingContent}>
                <span style={styles.loadingSpinner}></span>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              isEditing ? 'Update Contact' : 'Create Contact'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Inline styles for the component
const styles = {
  contactForm: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    maxWidth: '500px',
    width: '100%',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#f8f9fa',
  },
  formTitle: {
    color: '#333',
    fontSize: '1.5rem',
    margin: 0,
    fontWeight: '600',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    padding: '20px',
  },
  generalError: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  formInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    backgroundColor: '#fafafa',
    transition: 'border-color 0.3s ease, background-color 0.3s ease',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  addressInput: {
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  errorText: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '4px',
    display: 'block',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    color: '#666',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  saveButton: {
    flex: 2,
    padding: '12px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loadingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add hover effects and animations
const addStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .contact-form input:focus,
    .contact-form textarea:focus {
      outline: none;
      border-color: #007bff !important;
      background-color: #ffffff !important;
    }
    
    .cancel-button:hover:not(:disabled) {
      background-color: #f8f9fa !important;
      border-color: #999 !important;
    }
    
    .save-button:hover:not(:disabled) {
      background-color: #0056b3 !important;
    }
    
    .save-button:disabled {
      opacity: 0.6 !important;
      cursor: not-allowed !important;
    }
    
    .close-button:hover {
      background-color: #e9ecef !important;
    }
  `;
  document.head.appendChild(style);
};

// Add styles when component loads
if (typeof window !== 'undefined') {
  addStyles();
}

export default ContactForm;