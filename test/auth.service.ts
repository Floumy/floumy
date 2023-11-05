import * as request from "supertest";
import { HttpStatus, INestApplication } from "@nestjs/common";

export async function signIn(app: INestApplication, email: string, password: string): Promise<request.Test> {
  return request(app.getHttpServer())
    .post("/auth/sign-in")
    .send({
      email,
      password
    })
    .expect(HttpStatus.OK)
    .expect(({ body }) => {
      expect(body.accessToken).toBeDefined();
    });
}

export async function signUp(app: INestApplication, name: string, email: string, password: string): Promise<request.Test> {
  return request(app.getHttpServer())
    .post("/auth/sign-up")
    .send({
      name,
      email,
      password
    })
    .expect(HttpStatus.CREATED)
    .expect(({ body }) => {
      expect(body.accessToken).toBeDefined();
    });
}

export async function signUpAndSignIn(app: INestApplication, name: string, email: string, password: string): Promise<request.Test> {
  await signUp(app, name, email, password);
  return signIn(app, email, password);
}
