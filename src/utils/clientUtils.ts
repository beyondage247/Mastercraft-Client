import type { ClientRecord } from "../services/portalApi";

export function staffAssignment(client: ClientRecord) {
  const partnerName = client.accountPartner?.name;
  const partnerEmail = client.accountPartner?.email;

  if (partnerName && partnerEmail) {
    return `${partnerName} (${partnerEmail})`;
  }

  if (partnerName || partnerEmail) {
    return partnerName || partnerEmail;
  }

  return "Unassigned";
}
