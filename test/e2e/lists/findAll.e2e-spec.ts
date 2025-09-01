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
const testingUser2 = {
  email: 'testing2.user@google.com',
  password: 'Abc12345',
  username: 'Testing user 2'
}

describe('ListsModule findAll (e2e)', () => {
  let app: INestApplication
  let userRepository: Repository<User>
  let listsRepository: Repository<List>

  let token: string
  let userId: string
  let userId2: string

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
    const responseUser2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testingUser2)

    token = responseUser.body.token
    userId = responseUser.body.user.id
    userId2 = responseUser2.body.user.id
  })

  beforeEach(async () => {
    await listsRepository.deleteAll()
  })

  afterAll(async () => {
    await listsRepository.deleteAll()
    await userRepository.deleteAll()
    await app.close()
  })

  it('should return 401 - user is not logged in', async () => {
    const response = await request(app.getHttpServer()).get('/lists')

    expect(response.status).toBe(401)
  })

  it('should return only the lists created by the logged in user', async () => {
    const list1 = await listsRepository.save({
      title: 'list1',
      user: { id: userId },
      order: 0
    })
    const list2 = await listsRepository.save({
      title: 'list2',
      user: { id: userId },
      order: 1
    })

    await listsRepository.save({
      title: 'list 3',
      user: { id: userId2 },
      order: 0
    })

    const response = await request(app.getHttpServer())
      .get('/lists')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.length).toBe(2)
    expect(response.body).toEqual([
      {
        ...list1,
        tasks: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        user: userId
      },
      {
        ...list2,
        tasks: [],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        user: userId
      }
    ])
  })
})
