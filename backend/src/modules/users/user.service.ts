import { Injectable, BadRequestException } from '@nestjs/common';
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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly roleService: RoleService,
    private readonly emailVerifyService: EmailVerifyService,
    private readonly dataSource: DataSource,
  ) {}

  async register(data: RegisterDto): Promise<UserSerializer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(User, {
        where: { username: data.username },
      });
      if (existing) {
        throw new BadRequestException('Tên đăng nhập đã tồn tại');
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
        throw new BadRequestException('Tên đăng nhập hoặc email đã tồn tại');
      }

      console.error('[Register Error]', error);
      throw new BadRequestException('Đăng ký người dùng thất bại');
    } finally {
      await queryRunner.release();
    }
  }

  async findByEmail(email: string): Promise<User> {
    return findOneByField(
      this.userRepo,
      'email',
      email,
      'Không tìm thấy người dùng theo email',
    );
  }

  async findByUsername(username: string): Promise<User> {
    return findOneByField(
      this.userRepo,
      'username',
      username,
      'Không tìm thấy người dùng theo tên đăng nhập',
    );
  }

  async findById(id: number): Promise<User> {
    return findOneByField(
      this.userRepo,
      'id',
      id,
      'Không tìm thấy người dùng theo ID',
    );
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepo.save(user);
  }
}

