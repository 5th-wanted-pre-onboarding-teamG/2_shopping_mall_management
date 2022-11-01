import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sessionConfig } from './auth/auth.session.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api');

  sessionConfig(app);

  await app.listen(3000);
}
bootstrap();
