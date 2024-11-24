export const OrganizationWithMemberMaps: Record<string, string> = {
  ID: "c",
  Permission: "c",
  Status: "c",
  Inventory_ID: "c",
  Owner_ID: "c",
  Collaborator_ID: "c",
  CreatedAt: "c",
  ResolvedAt: "c",
};

export const CollaborationFields = [
  "ID",
  "Permission",
  "Status",
  "Inventory_ID",
  "Inventory_Name", //use join
  "Owner_ID",
  "Owner_Username", //use join
  "Collaborator_ID",
  "Collaborator_Username", //use join
  "CreatedAt",
  "ResolvedAt",
];
