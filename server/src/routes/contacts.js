// server/src/routes/contacts.js
// CRUD operations for contacts with multi-tenant isolation

const express = require('express');
const { supabase } = require('../services/supabase');

const router = express.Router();

// Route 1: Get all contacts for the authenticated user's organization
router.get('/', async (req, res) => {
  try {
    console.log('Fetching contacts for organization:', req.user.organizationId);
    
    // Query contacts with RLS automatically filtering by organization
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', req.user.organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching contacts:', error);
      throw error;
    }
    
    console.log(`Found ${data.length} contacts for organization`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contacts',
      details: error.message
    });
  }
});

// Route 2: Get a specific contact by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching contact:', id, 'for organization:', req.user.organizationId);
    
    // Get specific contact with organization validation
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contact not found' });
      }
      throw error;
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contact',
      details: error.message
    });
  }
});

// Route 3: Create a new contact
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ 
        error: 'First name and last name are required' 
      });
    }
    
    console.log('Creating contact for organization:', req.user.organizationId);
    
    // Insert new contact with organization and user context
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        organization_id: req.user.organizationId,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating contact:', error);
      throw error;
    }
    
    console.log('Contact created successfully:', data.id);
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating contact:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Contact with this email already exists in your organization' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create contact',
      details: error.message
    });
  }
});

// Route 4: Update an existing contact
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ 
        error: 'First name and last name are required' 
      });
    }
    
    console.log('Updating contact:', id, 'for organization:', req.user.organizationId);
    
    // Update contact with organization validation
    const { data, error } = await supabase
      .from('contacts')
      .update({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contact not found' });
      }
      console.error('Database error updating contact:', error);
      throw error;
    }
    
    console.log('Contact updated successfully:', data.id);
    res.json(data);
  } catch (error) {
    console.error('Error updating contact:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Contact with this email already exists in your organization' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update contact',
      details: error.message
    });
  }
});

// Route 5: Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting contact:', id, 'for organization:', req.user.organizationId);
    
    // Delete contact with organization validation
    const { data, error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contact not found' });
      }
      console.error('Database error deleting contact:', error);
      throw error;
    }
    
    console.log('Contact deleted successfully:', data.id);
    res.json({ 
      success: true, 
      message: 'Contact deleted successfully',
      deletedContact: data
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      error: 'Failed to delete contact',
      details: error.message
    });
  }
});

// Route 6: Bulk delete contacts
router.delete('/bulk/:ids', async (req, res) => {
  try {
    const { ids } = req.params;
    const contactIds = ids.split(',').map(id => id.trim());
    
    if (contactIds.length === 0) {
      return res.status(400).json({ error: 'No contact IDs provided' });
    }
    
    console.log('Bulk deleting contacts:', contactIds, 'for organization:', req.user.organizationId);
    
    // Delete multiple contacts with organization validation
    const { data, error } = await supabase
      .from('contacts')
      .delete()
      .in('id', contactIds)
      .eq('organization_id', req.user.organizationId)
      .select();

    if (error) {
      console.error('Database error bulk deleting contacts:', error);
      throw error;
    }
    
    console.log(`Bulk deleted ${data.length} contacts successfully`);
    res.json({ 
      success: true, 
      message: `${data.length} contacts deleted successfully`,
      deletedContacts: data
    });
  } catch (error) {
    console.error('Error bulk deleting contacts:', error);
    res.status(500).json({ 
      error: 'Failed to bulk delete contacts',
      details: error.message
    });
  }
});

// Route 7: Search contacts by name or email
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }
    
    const searchTerm = `%${query.trim().toLowerCase()}%`;
    
    console.log('Searching contacts with query:', query, 'for organization:', req.user.organizationId);
    
    // Search contacts by name or email with organization filtering
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', req.user.organizationId)
      .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(50); // Limit search results

    if (error) {
      console.error('Database error searching contacts:', error);
      throw error;
    }
    
    console.log(`Found ${data.length} contacts matching search query`);
    res.json(data);
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({ 
      error: 'Failed to search contacts',
      details: error.message
    });
  }
});

// Route 8: Get contacts statistics for the organization
router.get('/stats/overview', async (req, res) => {
  try {
    console.log('Fetching contact statistics for organization:', req.user.organizationId);
    
    // Get contact count and recent activity
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('id, created_at, email')
      .eq('organization_id', req.user.organizationId);

    if (error) {
      console.error('Database error fetching contact stats:', error);
      throw error;
    }
    
    // Calculate statistics
    const totalContacts = contacts.length;
    const contactsWithEmail = contacts.filter(c => c.email).length;
    const recentContacts = contacts.filter(c => {
      const createdDate = new Date(c.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;
    
    const stats = {
      totalContacts,
      contactsWithEmail,
      contactsWithoutEmail: totalContacts - contactsWithEmail,
      recentContacts,
      emailPercentage: totalContacts > 0 ? Math.round((contactsWithEmail / totalContacts) * 100) : 0
    };
    
    console.log('Contact statistics calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching contact statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contact statistics',
      details: error.message
    });
  }
});

module.exports = router;