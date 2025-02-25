import { Injectable } from '@nestjs/common';
import { Org } from '../orgs/org.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class GitlabService {
  constructor(
    @InjectRepository(Org)
    private readonly orgRepository: Repository<Org>,
    private readonly encryptionService: EncryptionService,
  ) {}

  async setToken(orgId: string, token: string) {
    const org = await this.orgRepository.findOneByOrFail({ id: orgId });
    org.gitlabToken = this.encryptionService.encrypt(token);
    await this.orgRepository.save(org);
  }
}
