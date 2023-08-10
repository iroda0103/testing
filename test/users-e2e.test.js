const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");
let item_token;

describe("Users E2E", () => {
  let token;
  beforeAll(async () => {
    await db.connect();
    return db.clean();
  });

  afterAll(() => {
    return db.disconnect();
  });

  describe("POST /users/register", () => {
    it('"first_name" yuborilmasa xatolik qaytaradi.', (done) => {
      request(app)
        .post("/users/register/")
        .set("Accept", "application/json")
        .send({
          last_name: "Bar",
          username: "foobar",
          password: "1234",
        })
        .expect("Content-Type", /json/)
        .expect(400, done);
    });

    it('"last_name" yuborilmasa xatolik qaytaradi.', (done) => {
      request(app)
        .post("/users/register/")
        .set("Accept", "application/json")
        .send({
          first_name: "Foo",
          username: "foobar",
          password: "1234",
        })
        .expect("Content-Type", /json/)
        .expect(400, done);
    });

    it('"username" yuborilmasa xatolik qaytaradi.', (done) => {
      request(app)
        .post("/users/register/")
        .set("Accept", "application/json")
        .send({
          first_name: "Foo",
          last_name: "Bar",
          password: "1234",
        })
        .expect("Content-Type", /json/)
        .expect(400, done);
    });

    it('"password" yuborilmasa xatolik qaytaradi.', (done) => {
      request(app)
        .post("/users/register/")
        .set("Accept", "application/json")
        .send({
          first_name: "Foo",
          last_name: "Bar",
          username: "foobar",
        })
        .expect("Content-Type", /json/)
        .expect(400, done);
    });

    it("foydalanuvchini ro'yxatdan o'tkazishi kerak.", (done) => {
      request(app)
        .post("/users/register/")
        .set("Accept", "application/json")
        .send({
          first_name: "Foo",
          last_name: "Bar",
          username: "foo_bar",
          password: "1234",
        })
        .expect("Content-Type", /json/)
        .expect(201, done);
    });
  });

  describe("POST /users/login", () => {
    it('"username" yuborilmasa xatolik qaytaradi.', (done) => {
      request(app)
        .post("/users/login/")
        .set("Accept", "application/json")
        .send({
          password: "1234",
        })
        .expect("Content-Type", /json/)
        .expect(400, done);
    });

    it('"password" yuborilmasa xatolik qaytaradi.', (done) => {
      request(app)
        .post("/users/login/")
        .set("Accept", "application/json")
        .send({
          username: "foo_bar",
        })
        .expect("Content-Type", /json/)
        .expect(400, done);
    });

    it("foydalanuvchi topilmasa xatolik qaytarishi kerak.", (done) => {
      request(app)
        .post("/users/login/")
        .set("Accept", "application/json")
        .send({
          username: "user_404",
          password: "1234",
        })
        .expect("Content-Type", /json/)
        .expect(401, done);
    });

    it("parol noto'g'ri bo'lsa xatolik qaytarishi kerak.", (done) => {
      request(app)
        .post("/users/login/")
        .set("Accept", "application/json")
        .send({
          username: "foo_bar",
          password: "1234_xato",
        })
        .expect("Content-Type", /json/)
        .expect(401, done);
    });

    it("login & parol to'g'ri bo'lsa token qaytarishi kerak.", async () => {
      const response = await request(app)
        .post("/users/login/")
        .set("Accept", "application/json")
        .send({
          username: "foo_bar",
          password: "1234",
        });

      expect(response.body.data).toBeDefined();
      expect(response.status).toBe(200);
      token = response.body.data;
      item_token = token;
      console.log(token, item_token);
    });
  });
});

exports.token = item_token;
