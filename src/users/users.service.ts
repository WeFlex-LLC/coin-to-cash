import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Lang } from './enums/lang.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async addUser(createUserDto: CreateUserDto){
        const user = await this.userRepository.save(createUserDto);

        return user;
    }

    async getUserByTelegramId(telegramId: number): Promise<User | null>{
        return await this.userRepository.findOne({ where: { telegramId } });
    }

    async changeLang(telegramId: number, lang: Lang){
        await this.userRepository.update({ telegramId }, { lang });

        return { success: true };
    }
}
