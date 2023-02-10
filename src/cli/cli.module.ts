import {Module} from '@nestjs/common';
import {ConsoleModule} from 'nestjs-console';
import {OpenApiModule} from '@cli/modules/openapi/openapi.module';

@Module({
    imports: [ConsoleModule, OpenApiModule],
    providers: [],
})
export class CLIModule {}
