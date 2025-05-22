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

describe('ListsModule update (e2e)', () => {
  let app: INestApplication
  let userRepository: Repository<User>
  let listsRepository: Repository<List>

  let token: string
  let loggedUserId: string

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
    loggedUserId = responseUser.body.user.id
  })

  beforeEach(async () => {
    await listsRepository.deleteAll()
  })

  afterAll(async () => {
    await userRepository.delete({ email: testingUser.email })
    await listsRepository.deleteAll()
    await app.close()
  })

  it('should return 401 - user is not logged in', async () => {
    const response = await request(app.getHttpServer()).patch('/lists/123')

    expect(response.status).toBe(401)
  })

  it('should return a 404 error - not found', async () => {
    const list = await listsRepository.save({
      title: 'new list',
      user: { id: loggedUserId }
    })

    const response = await request(app.getHttpServer())
      .patch(`/lists/${list.id}123`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'new title' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      statusCode: 404,
      message: `List with id ${list.id}123 not found`
    })
  })

  it('should return a 400 error - wrong data', async () => {
    const list = await listsRepository.save({
      title: 'new list',
      user: { id: loggedUserId }
    })

    const response = await request(app.getHttpServer())
      .patch(`/lists/${list.id}`)
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

  it('should found and return a list created by the logged user', async () => {
    const list = await listsRepository.save({
      title: 'new list',
      user: { id: loggedUserId }
    })

    const newTitle = 'new title'

    const response = await request(app.getHttpServer())
      .patch(`/lists/${list.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: newTitle })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: expect.any(String), title: newTitle })
  })
})
