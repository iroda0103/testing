const request = require("supertest");
const app = require("../src/app");
const db = require("../src/db");

let item_token;
let lists;
let todos;

describe("Todo E2E", () => {
  beforeAll(async () => {
    await db.connect();
    return db.clean();
  });

  afterAll(() => {
    return db.disconnect();
  });

  describe("Tokenni olish", () => {
    it("foydalanuvchini ro'yxatdan o'tkazishi kerak.", (done) => {
      request(app)
        .post("/users/register/")
        .set("Accept", "application/json")
        .send({
          first_name: "Foo",
          last_name: "Bar",
          username: "foo_bar2",
          password: "1234",
        })
        .expect("Content-Type", /json/)
        .expect(201, done);
    });

    it("login & parol to'g'ri bo'lsa token qaytarishi kerak.", async () => {
      const response = await request(app)
        .post("/users/login/")
        .set("Accept", "application/json")
        .send({
          username: "foo_bar2",
          password: "1234",
        });

      expect(response.body.data).toBeDefined();
      expect(response.status).toBe(200);
      token = response.body.data;
      item_token = token;
    });
  });

  describe("POST /lists", () => {
    it("Todolar uchun list qo'shish", async () => {
      const response = await request(app)
        .post("/lists")
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .send({
          name: "LIST 3",
        });

      expect(response.body.data).toBeDefined();
      lists = response.body.data;
    });
  });

  describe("POST /todos", () => {
    it("token kelmasa xatolik beradi", (done) => {
      request(app)
        .post("/todos")
        .set("Authorization", null)
        .set("Accept", "application/json")
        .expect(401, done);
    });

    it("text kelmasa xatolik beradi", (done) => {
      request(app)
        .post("/todos")
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .expect(400, done);
    });

    it("list kelmasa xatolik beradi", (done) => {
      request(app)
        .post("/todos")
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .send({
          text: "Todo 3",
        })
        .expect(400, done);
    });

    it("listni topa olmasa xatolik beradi", (done) => {
      request(app)
        .post("/todos")
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .send({
          text: "Todo 3",
          list: "64bfe6b22a378dfb481a933b",
        })
        .expect(404, done);
    });

    it("Yangi Todo qo'shadi", async () => {
      const response = await request(app)
        .post("/todos")
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .send({
          text: "Todo 3",
          list: lists._id,
        });

      expect(response.body.data).toBeDefined();
      todos = response.body.data;
    });
  });

  describe("GET /todos", () => {
    it("token kelmasa xatolik beradi", (done) => {
      request(app)
        .get("/todos")
        .set("Authorization", null)
        .set("Accept", "application/json")
        .expect(401, done);
    });

    it("Todolar keladi", (done) => {
      request(app)
        .get("/todos")
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .expect(200, done);
    });
  });

  describe("GET /todos/:id", () => {
    it("token kelmasa xatolik beradi", (done) => {
      request(app)
        .get("/todos/")
        .set("Authorization", null)
        .set("Accept", "application/json")
        .expect(401, done);
    });

    it("Todo keladi", (done) => {
      request(app)
        .get(`/todos/${todos._id}`)
        .set("Authorization", item_token)
        .expect(200, done);
    });
  });

  describe("PATCH /todos/:id", () => {
    it("token kelmasa xatolik beradi", (done) => {
      request(app)
        .patch(`/todos/${todos._id}`)
        .set("Authorization", null)
        .set("Accept", "application/json")
        .expect(401, done);
    });

    it("Todo topilmasa xatolik beradi", (done) => {
      request(app)
        .patch(`/todos/64bfe6b22a378dfb481a933b`)
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .expect(404, done);
    });

    it("Todo edit bo'ldi", (done) => {
      request(app)
        .patch(`/todos/${todos._id}`)
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .set("Content-Type", "application/json")
        .send({
          text: "New Todo3",
        })
        .expect(200, done);
    });
  });

  describe("DELETE /todos/:id", () => {
    it("token kelmasa xatolik beradi", (done) => {
      request(app)
        .delete(`/todos/${todos._id}`)
        .set("Authorization", null)
        .set("Accept", "application/json")
        .expect(401, done);
    });

    it("Todo topilmasa xatolik beradi", (done) => {
      request(app)
        .delete(`/todos/64bfe6b22a378dfb481a933b`)
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .expect(404, done);
    });

    it("Todo o'chiriladi", (done) => {
      request(app)
        .delete(`/todos/${todos._id}`)
        .set("Authorization", item_token)
        .set("Accept", "application/json")
        .expect(200, done);
    });
  });
});
