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
import { BaseService } from '../shared/base.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../shared/cloudinary.service';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly roleService: RoleService,
    private readonly emailVerifyService: EmailVerifyService,
    private readonly dataSource: DataSource,
    i18n: I18nService,
    context: RequestContextService,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    super(i18n, context);
  }

  async register(data: RegisterDto): Promise<UserSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(User, {
        where: { username: data.username },
      });

      if (existing) {
        throw new BadRequestException(await this.t('user.username_existed'));
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
          await this.t('user.username_or_email_existed'),
        );
      }

      console.error('[Register Error]', error);
      throw new BadRequestException(await this.t('user.register_failed'));
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return await findOneByField(
        this.userRepo,
        'email',
        email,
        await this.t('user.user_not_found_by_email'),
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('user.fetch_failed'));
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      const user = await this.userRepo.findOne({
        where: { username },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundException(
          await this.t('user.user_not_found_by_username'),
        );
      }

      return user;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new BadRequestException(await this.t('user.fetch_failed'));
    }
  }

  async findById(id: number): Promise<User> {
    try {
      return await findOneByField(
        this.userRepo,
        'id',
        id,
        await this.t('user.user_not_found_by_id'),
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('user.fetch_failed'));
    }
  }

  async saveUser(user: User): Promise<User> {
    try {
      return await this.userRepo.save(user);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('user.save_failed'));
    }
  }

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ): Promise<UserSerializer> {
    try {
      const user = await this.findById(userId);
      
      if (dto.full_name) {
        user.full_name = dto.full_name;
      }

      if (file) {
        const avatarUrl = await this.cloudinaryService.uploadImage(file);
        user.avatar_url = avatarUrl;
      }

      const saved = await this.userRepo.save(user);
      return plainToInstance(UserSerializer, saved, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('user.update_failed'));
    }
  }

  async changePassword(
    userId: number,
    currentPwd: string,
    newPwd: string,
  ): Promise<string> {
    try {
      const user = await this.findById(userId);
      const match = await bcrypt.compare(currentPwd, user.password_hash);

      if (!match) {
        throw new BadRequestException(
          await this.t('user.invalid_current_password'),
        );
      }

      user.password_hash = await bcrypt.hash(newPwd, 10);
      await this.userRepo.save(user);

      return await this.t('user.change_password_success');
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(
        await this.t('user.change_password_failed'),
      );
    }
  }

  async getProfile(userId: number): Promise<UserSerializer> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['role'],
      });

      if (!user) {
        throw new NotFoundException(await this.t('user.user_not_found_by_id'));
      }

      return plainToInstance(UserSerializer, user, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('user.fetch_failed'));
    }
  }
  async getUsersList(): Promise<UserSerializer[]> {
    try {
      const users = await this.userRepo.find({
        where: {
          role: {
            name: 'user',
          },
        },
        relations: ['role'],
        order: { id: 'ASC' },
      });

      return plainToInstance(UserSerializer, users, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new BadRequestException(await this.t('user.fetch_failed'));
    }
  }

  async updateStatusStudent(
    userId: number,
    is_active: boolean,
  ): Promise<UserSerializer> {
    try {
      const user = await this.findById(userId);
      user.is_active = is_active;
      const updatedUser = await this.userRepo.save(user);

      return plainToInstance(UserSerializer, updatedUser, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(await this.t('user.update_status_failed'));
    }
  }
}
