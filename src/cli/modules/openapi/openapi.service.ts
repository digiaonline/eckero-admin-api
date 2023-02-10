import {writeFileSync} from 'fs';

import {NestFactory} from '@nestjs/core';
import {Injectable} from '@nestjs/common';
import {Console, Command} from 'nestjs-console';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {AppModule} from '@root/src/app.module';

@Console({
  command: 'openapi',
  description: 'OpenAPI console commands',
})
@Injectable()
export class OpenApiService {
    @Command({
      command: 'generate',
      description: 'A command to generate an OpenAPI specification file of the API',
    })
    async generate(): Promise<void> {
      const app = await NestFactory.create(AppModule);
      app.enableVersioning();

      const options = new DocumentBuilder()
        .setTitle('Eckerö Line Admin API')
        .setDescription('Eckerö Line Admin API')
        .setVersion('2.1.0')
        .build();

      const document = SwaggerModule.createDocument(app, options);
      
      writeFileSync('./docs/eckero-admin-api.swagger.json', JSON.stringify(document, null, 2));
    }
}
