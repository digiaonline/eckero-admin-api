import {Module} from '@nestjs/common';
import {OpenApiService} from '@cli/modules/openapi/openapi.service';

@Module({
  imports: [],
  providers: [OpenApiService],
  exports: [OpenApiService],
})
export class OpenApiModule {}
