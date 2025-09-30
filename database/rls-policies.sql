-- RLS Policies
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "users_can_view_own_organization" ON organizations
FOR SELECT USING (
  id = get_current_user_org_id()
);

-- Users: Can see users in same organization
CREATE POLICY "users_can_view_same_org_users" ON users
FOR SELECT USING (
  organization_id = get_current_user_org_id()
);

-- Contacts: Organization-scoped with role-based access
CREATE POLICY "contacts_org_isolation" ON contacts
FOR SELECT USING (
  organization_id = get_current_user_org_id()
);

CREATE POLICY "users_can_create_contacts" ON contacts
FOR INSERT WITH CHECK (
  organization_id = get_current_user_org_id() AND
  created_by = auth.uid()
);

CREATE POLICY "users_can_update_own_contacts_or_admin" ON contacts
FOR UPDATE USING (
  organization_id = get_current_user_org_id() AND
  (created_by = auth.uid() OR get_current_user_role() = 'admin')
);

CREATE POLICY "users_can_delete_own_contacts_or_admin" ON contacts
FOR DELETE USING (
  organization_id = get_current_user_org_id() AND
  (created_by = auth.uid() OR get_current_user_role() = 'admin')
);

-- User invitations: Organization-scoped
CREATE POLICY "invitations_org_isolation" ON user_invitations
FOR ALL USING (
  organization_id = get_current_user_org_id()
);