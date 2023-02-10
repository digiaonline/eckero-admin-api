import {Controller, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {RedisCacheService} from './redis-cache.service';

@ApiTags('Cache')
@Controller({
    path: 'cache',
    version: '1',
})
export class RedisCacheController {

    constructor(private readonly redisCacheService: RedisCacheService) {}

    @Post('clear')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiResponse({status: HttpStatus.NO_CONTENT, description: 'Cache cleared', type: Promise<void>})
    clearCache(): Promise<void> {
        return this.redisCacheService.clearCache(); 
    }
}
