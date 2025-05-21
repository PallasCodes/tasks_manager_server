import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import * as request from 'supertest'
import { Repository } from 'typeorm'

import { AppModule } from '../../../src/app.module'
import { User } from '../../../src/auth/entities/user.entity'

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  username: 'Testing user'
}

describe('AuthModule Register (e2e)', () => {
  let app: INestApplication
  let userRepository: Repository<User>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
      })
    )
    await app.init()
    userRepository = app.get<Repository<User>>(getRepositoryToken(User))
  })

  afterEach(async () => {
    await userRepository.delete({ email: testingUser.email })
    await app.close()
  })

  it('/auth/register (POST) - no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/register')

    const errorMessages = [
      'username must be shorter than or equal to 20 characters',
      'username must be longer than or equal to 1 characters',
      'username must be a string',
      'email must be an email',
      'email must be a string',
      'password must have a lowercase and uppercase letter, a number and must have 8 words minimum and 32 maximum',
      'password must be shorter than or equal to 32 characters',
      'password must be longer than or equal to 8 characters',
      'password must be a string'
    ]

    expect(response.status).toBe(400)

    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message)
    })
  })

  it('/auth/register (POST) - same email', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(testingUser)

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      message: `Key (email)=(${testingUser.email}) already exists.`,
      error: 'Bad Request',
      statusCode: 400
    })
  })

  it('/auth/register (POST) - unsafe password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...testingUser,
        password: 'abc123'
      })

    const errorMessages = [
      'password must have a lowercase and uppercase letter, a number and must have 8 words minimum and 32 maximum'
    ]

    expect(response.status).toBe(400)
    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message)
    })
  })

  it('/auth/register (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser)

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      user: {
        email: 'testing.user@google.com',
        username: 'Testing user',
        id: expect.any(String),
        isActive: true,
        roles: ['user']
      },
      token: expect.any(String)
    })
  })
})
