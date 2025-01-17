import { EncryptionService } from './encryption.service';

export class EncryptedColumnTransformer {
  constructor(private encryptionService: EncryptionService) {}

  to(value: string): string {
    if (!value) return null;
    return this.encryptionService.encrypt(value);
  }

  from(value: string): string {
    if (!value) return null;
    return this.encryptionService.decrypt(value);
  }
}