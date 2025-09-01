import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import 'dotenv'

import { Logger, ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

export async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const logger = new Logger()
  const PORT = process.env.PORT ?? 3000

  app.enableCors()

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  )

  const config = new DocumentBuilder()
    .setTitle('Tasks Manager API')
    .setDescription('Tasks Manager API')
    .setVersion('0.1')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(PORT)
  logger.log(`App running on port ${PORT}`)
}
bootstrap()
