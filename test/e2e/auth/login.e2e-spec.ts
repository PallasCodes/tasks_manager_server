import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Repository } from 'typeorm'
import * as request from 'supertest'

import { AppModule } from '../../../src/app.module'
import { User } from '../../../src/auth/entities/user.entity'

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  username: 'Testing User'
}

const testingAdminUser = {
  email: 'testing.admin@google.com',
  password: 'Abc12345',
  username: 'Testing Admin'
}

describe('Auth - Login', () => {
  let app: INestApplication
  let userRepository: Repository<User>

  beforeAll(async () => {
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

    userRepository.delete({ email: testingUser.email })
    userRepository.delete({ email: testingAdminUser.email })

    await request(app.getHttpServer()).post('/auth/register').send(testingUser)

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingAdminUser)

    await userRepository.update(
      { email: testingAdminUser.email },
      { roles: ['admin'] }
    )
  })

  afterAll(async () => {
    await app.close()
  })

  it('/auth/login (POST) - should throw 400 if no body', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login')

    const errorMessages = [
      'email must be an email',
      'email must be a string',
      'password must be shorter than or equal to 24 characters',
      'password must be longer than or equal to 8 characters',
      'password must be a string'
    ]

    expect(response.status).toBe(400)

    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message)
    })
  })

  it('/auth/login (POST) - wrong credentials - email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'testingUser.email@google.com',
        password: testingUser.password
      })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'Credentials are not valid',
      error: 'Unauthorized',
      statusCode: 401
    })
  })

  it('/auth/login (POST) - wrong credentials - password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testingUser.email, password: 'Abc123456788' })

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      message: 'Credentials are not valid',
      error: 'Unauthorized',
      statusCode: 401
    })
  })

  it('/auth/login (POST) - valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testingUser.email, password: testingUser.password })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        email: 'testing.user@google.com',
        username: 'Testing User',
        isActive: true,
        roles: ['user']
      },
      token: expect.any(String)
    })
  })
})
