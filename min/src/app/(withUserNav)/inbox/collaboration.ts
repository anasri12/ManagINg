export function Collaboration_Receiver(
  Inventory_Name: string,
  Sender: string,
  Permission: string
) {
  return `${Sender} want to invite you to join ${Inventory_Name} inventory with "${Permission} Permission".`;
}

export function Collaboration_Sender(
  Inventory_Name: string,
  Receiver: string,
  Permission: string
) {
  return `You have invited ${Receiver} to join ${Inventory_Name} inventory with "${Permission} Permission".`;
}
