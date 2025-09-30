// server/src/routes/users.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../services/supabase');
const scalekit = require('../services/scalekit');

const router = express.Router();

// Get all users in organization
router.get('/organization', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('organization_id', req.user.organizationId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Found users:', data?.length || 0);
    
    // Return the array directly, not wrapped
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Invite user to organization (Admin only)
router.post('/invite', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can invite users' });
    }

    const { email, role = 'user' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('organization_id', req.user.organizationId)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists in organization' });
    }

    // Create invitation using Scalekit (optional - if you want email invitations)
    // For now, just create a pending user record
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        organization_id: req.user.organizationId,
        role,
        first_name: email.split('@')[0],
        last_name: ''
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send invitation email via Scalekit
    // This would require setting up Scalekit's invitation API

    res.json({
      success: true,
      message: 'User invited successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role (Admin only)
router.patch('/:userId/role', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change roles' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Don't allow users to change their own role
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .eq('organization_id', req.user.organizationId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Role updated successfully',
      user: data
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user from organization (Admin only)
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete users' });
    }

    const { userId } = req.params;

    // Don't allow users to delete themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .eq('organization_id', req.user.organizationId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;