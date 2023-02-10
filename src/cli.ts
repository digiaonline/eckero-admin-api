import {BootstrapConsole} from 'nestjs-console';
import {CLIModule} from '@cli/cli.module';

const bootstrap = new BootstrapConsole({
    module: CLIModule,
    useDecorators: true,
});

bootstrap.init()
  .then(async app => {
    try {
        await app.init();
        await bootstrap.boot();
        process.exit(0);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
  })
  .catch(e => console.log(e));
