import { orgUsers } from '@/data/reference/users';
import { OrgUser } from '@/types';

export { orgUsers };

const LOB_ENUM = ['WPB', 'RB', 'CMB'];

// Find an org directory user by their name (case-insensitive).
export function lookupUserByName(name: string): OrgUser | undefined {
  if (!name) return undefined;
  const target = name.trim().toLowerCase();
  return orgUsers.find(u => u.name.trim().toLowerCase() === target);
}

// Derive the set of campaign field values implied by selecting an org user.
// Only enum-valid values are emitted (e.g. line_of_business is skipped for
// C-suite "Corporate" rows that don't map to WPB/RB/CMB).
export function deriveFieldsFromUser(user: OrgUser): Record<string, string> {
  const fields: Record<string, string> = {
    group_member: user.entity,
    country_code: user.market,
    service_line: user.serviceLine,
    message_owner: user.messageOwner || user.name,
    depart_head: user.departHead,
    team_head: user.teamHead,
    business_line_1st_level: user.businessLine1stLevel,
    business_line_2nd_level: user.businessLine2ndLevel,
    business_team: user.businessTeam,
    business_contact: user.businessContact,
    // Cost owner defaults to the department head (matches reference data).
    cost_owner: user.departHead,
  };

  if (LOB_ENUM.includes(user.lineOfBusiness)) {
    fields.line_of_business = user.lineOfBusiness;
  }

  // Drop empty values so we never overwrite with blanks.
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== '')
  );
}

// Given a message owner name, return the derived ownership-hierarchy fields
// (depart_head, team_head, business lines, business team/contact, cost_owner).
export function lookupOwnerHierarchy(messageOwner: string): Record<string, string> {
  const user = lookupUserByName(messageOwner);
  if (!user) return {};
  const derived = deriveFieldsFromUser(user);
  // message_owner is already known; return the rest of the hierarchy.
  const { ...rest } = derived;
  return rest;
}

// Compact directory summary for use in AI system prompts.
export function getOrgDirectorySummary(): string {
  return orgUsers
    .map(u => `- ${u.name} (${u.grade}${u.title ? ', ' + u.title : ''}) | LOB: ${u.lineOfBusiness} | Depart Head: ${u.departHead} | Team Head: ${u.teamHead} | Contact: ${u.businessContact}`)
    .join('\n');
}
