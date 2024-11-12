import { signIn, signUp } from "./utils";

describe("Sign in", () => {
  const uuid = () => Cypress._.random(0, 1e6);
  const email = `test${uuid()}@example.com`;
  const password = `password${uuid()}`;

  beforeEach(() => {
    signUp(email, password);
    cy.visit("http://localhost:3000/auth/sign-in");
  });

  it("displays Sign in", () => {
    cy.contains("Sign in");
  });

  it("signs in", () => {
    signIn(email, password);
    cy.url().should("include", "/admin/dashboard");
  });
});
