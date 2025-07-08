import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { RoleService } from '../roles/role.service';
import { plainToInstance } from 'class-transformer';
import { UserSerializer } from './serializers/user.serializer';
import { EmailVerifyService } from '../email_verification_tokens/email_verify.service';
import { generateToken } from '../../common/utils/token.util';
import { findOneByField } from '../../common/utils/repository.util';
import { I18nService } from 'nestjs-i18n';
import { RequestContextService } from '@/modules/shared/request-context.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly roleService: RoleService,
    private readonly emailVerifyService: EmailVerifyService,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
    private readonly context: RequestContextService,
  ) {}

  private getLang() {
    return this.context.getLang() || 'vi';
  }

  async register(data: RegisterDto): Promise<UserSerializer> {
    const lang = this.getLang();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(User, {
        where: { username: data.username },
      });

      if (existing) {
        throw new BadRequestException(
          await this.i18n.translate('user.username_existed', { lang }),
        );
      }

      const role = await this.roleService.findByName('user');
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = this.userRepo.create({
        ...data,
        password_hash: hashedPassword,
        role_id: role.id,
      });

      const savedUser = await queryRunner.manager.save(User, user);

      const token = generateToken();
      await this.emailVerifyService.createVerificationToken(
        savedUser.id,
        token,
        queryRunner,
      );
      await this.emailVerifyService.sendVerificationEmail(
        savedUser.email,
        token,
      );

      await queryRunner.commitTransaction();

      return plainToInstance(UserSerializer, savedUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          await this.i18n.translate('user.username_or_email_existed', {
            lang,
          }),
        );
      }

      console.error('[Register Error]', error);
      throw new BadRequestException(
        await this.i18n.translate('user.register_failed', { lang }),
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string): Promise<User> {
    return findOneByField(
      this.userRepo,
      'email',
      email,
      await this.i18n.translate('user.user_not_found_by_email', {
        lang: this.getLang(),
      }),
    );
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(
        await this.i18n.translate('user.user_not_found_by_username', {
          lang: this.getLang(),
        }),
      );
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    return findOneByField(
      this.userRepo,
      'id',
      id,
      await this.i18n.translate('user.user_not_found_by_id', {
        lang: this.getLang(),
      }),
    );
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
}
