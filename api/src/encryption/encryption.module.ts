import { Global, Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';

@Global()
@Module({
  providers: [
    EncryptionService,
    {
      provide: 'ENCRYPTION_SERVICE',
      useFactory: (encryptionService: EncryptionService) => {
        global.encryptionService = encryptionService;
        return encryptionService;
      },
      inject: [EncryptionService],
    },
  ],
  exports: [EncryptionService],
})
export class EncryptionModule {}
