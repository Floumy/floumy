import { EncryptionService } from './encryption.service';
import { setupTestingModule } from '../../test/test.utils';

describe('EncryptionService', () => {
  let service: EncryptionService;

  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const { module, cleanup: dbCleanup } = await setupTestingModule(
      [],
      [EncryptionService],
    );
    cleanup = dbCleanup;
    service = module.get<EncryptionService>(EncryptionService);
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('when encrypting a string', () => {
    it('should encrypt the string', async () => {
      const encryptedString = service.encrypt('test');
      expect(encryptedString).not.toEqual('test');
    });
  });

  describe('when decrypting a string', () => {
    it('should decrypt the string', async () => {
      const encryptedString = service.encrypt('test');
      const decryptedString = service.decrypt(encryptedString);
      expect(decryptedString).toEqual('test');
    });
  });
});
