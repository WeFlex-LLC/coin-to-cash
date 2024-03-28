import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminRole } from './enums/admin-role.enum';

const saltRounds = 10;

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    createAdminDto.password = await bcrypt.hash(
      createAdminDto.password,
      saltRounds,
    );

    try {
      const { password, ...res } =
        await this.adminsRepository.save(createAdminDto);

      return res;
    } catch (error) {
      if (error.errno == 1062)
        throw new ConflictException('Email is already exists');
      else throw new InternalServerErrorException('Internal server error');
    }
  }

  async findOne(email: string) {
    return this.adminsRepository.findOne({ where: { email } });
  }

  async findAll(id: number, filter?: { role?: string }) {
    const admins = await this.adminsRepository
      .createQueryBuilder('admin')
      .select(['admin.id', 'admin.email', 'admin.role'])
      .where(
        `id != :id AND role != :adminRole ${
          filter?.role ? 'AND role = :role' : ''
        }`,
      )
      .setParameters({
        id,
        adminRole: AdminRole.Admin,
        role: filter?.role || '',
      })
      .orderBy('"createdAt"', 'DESC')
      .getMany();

    return admins;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminsRepository.findOne({ where: { id } });

    if (!admin) throw new UnauthorizedException();

    const samePassword = await bcrypt.compare(
      updateAdminDto.old_password,
      admin?.password,
    );

    if (!samePassword) throw new ForbiddenException('Incorrect Password');

    admin.password = await bcrypt.hash(updateAdminDto.new_password, saltRounds);

    const { password, ...res } = await this.adminsRepository.save(admin);

    return res;
  }

  async delete(id: number) {
    const admin = await this.adminsRepository.findOne({ where: { id } });

    if (!admin) throw new NotFoundException('Admin Not Found');

    await this.adminsRepository.remove(admin);

    return {
      success: true,
    };
  }
}
