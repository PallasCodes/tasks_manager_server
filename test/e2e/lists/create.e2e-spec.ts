import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import * as request from 'supertest'
import { Repository } from 'typeorm'

import { AppModule } from '../../../src/app.module'
import { User } from '../../../src/auth/entities/user.entity'
import { List } from '../../../src/lists/entities/list.entity'

const testingUser = {
  email: 'testing.user@google.com',
  password: 'Abc12345',
  username: 'Testing user'
}

describe('AuthModule Private (e2e)', () => {
  let app: INestApplication
  let userRepository: Repository<User>
  let listsRepository: Repository<List>

  let token: string

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
    listsRepository = app.get<Repository<List>>(getRepositoryToken(List))
    await userRepository.delete({ email: testingUser.email })

    const responseUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser)

    token = responseUser.body.token
  })

  afterAll(async () => {
    await userRepository.delete({ email: testingUser.email })
    await app.close()
  })

  it('should return 401 - user is not logged in', async () => {
    const response = await request(app.getHttpServer()).post('/lists').send({})

    expect(response.status).toBe(401)
  })

  it('should return 400 - title is required', async () => {
    const response = await request(app.getHttpServer())
      .post('/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    const errorMessages = [
      'title must be shorter than or equal to 100 characters',
      'title must be longer than or equal to 1 characters',
      'title must be a string'
    ]

    expect(response.status).toBe(400)
    errorMessages.forEach((message) => {
      expect(response.body.message).toContain(message)
    })
  })

  it('should return 201 - list created succesfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'new list' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      title: 'new list',
      id: expect.any(String),
      user: {
        email: testingUser.email,
        id: expect.any(String),
        isActive: true,
        roles: ['user'],
        username: testingUser.username
      }
    })

    await listsRepository.deleteAll()
  })
})
