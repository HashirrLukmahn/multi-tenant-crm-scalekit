// server/src/services/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client initialized');

// Find organization by Scalekit org ID or domain
const findOrganization = async (scalekitOrgId, domain) => {
  try {
    console.log('🔍 Finding org with:', { scalekitOrgId, domain });
    
    let query = supabase
      .from('organizations')
      .select('*');
    
    if (scalekitOrgId) {
      query = query.eq('scalekit_org_id', scalekitOrgId);
    } else if (domain) {
      query = query.eq('domain', domain);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Supabase error finding org:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in findOrganization:', error);
    return null;
  }
};

// Create new organization
const createOrganization = async (orgData) => {
  try {
    console.log('📝 Creating organization:', orgData);
    
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: orgData.name,
        domain: orgData.domain,
        scalekit_org_id: orgData.scalekit_org_id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating org:', error);
      throw error;
    }
    
    console.log('✅ Organization created:', data);
    return data;
  } catch (error) {
    console.error('Error in createOrganization:', error);
    throw error;
  }
};

// Find user by email
const findUser = async (email) => {
  try {
    console.log('🔍 Finding user:', email);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) {
      console.error('Supabase error finding user:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in findUser:', error);
    return null;
  }
};

// Create new user
const createUser = async (userData) => {
  try {
    console.log('📝 Creating user:', userData);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        organization_id: userData.organization_id,
        scalekit_user_id: userData.scalekit_user_id,
        role: userData.role || 'user'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating user:', error);
      throw error;
    }
    
    console.log('✅ User created:', data);
    return data;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};

// ✅ CRITICAL: Export all functions
module.exports = {
  supabase,
  findOrganization,
  createOrganization,
  findUser,
  createUser
};