import { z } from 'zod';

export const AccountId = z.string().uuid({ message: 'account id must be UUID v4' });

export const TransferType = z.enum(['1','2','3'])
  .or(z.coerce.number().int().min(1).max(3).transform(String))
  .transform(String);

export const MoneyCents = z.number()
  .int({ message: 'value must be integer (cents)' })
  .positive({ message: 'value must be > 0' })
  .max(1_000_000, { message: 'value exceeds max allowed (10000.00)' });

export const CreateTx = z.object({
  accountExternalIdDebit: AccountId,
  accountExternalIdCredit: AccountId,
  tranferTypeId: TransferType,
  value: MoneyCents
}).refine((d) => d.accountExternalIdDebit !== d.accountExternalIdCredit, {
  message: 'debit and credit accounts must be different',
  path: ['accountExternalIdCredit']
});

export type CreateTxInput = z.infer<typeof CreateTx>;
