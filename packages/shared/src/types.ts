export type UUID = string;
export type TransactionStatusName = 'pending' | 'approved' | 'rejected';
export interface CreateTransactionDTO {
  accountExternalIdDebit: UUID;
  accountExternalIdCredit: UUID;
  tranferTypeId: number;
  value: number;
}
export interface TransactionView {
  transactionExternalId: UUID;
  transactionType: { name: string };
  transactionStatus: { name: TransactionStatusName };
  value: number;
  createdAt: string;
}
