import { signUp } from "./utils";

describe("Sign up", () => {
  const uuid = () => Cypress._.random(0, 1e6);

  beforeEach(() => {
    cy.visit("http://localhost:3000/auth/sign-up");
  });

  it("displays Sign up", () => {
    cy.contains("Sign up");
  });
  it("signs up", () => {
    // Generate unique email
    const email = `test${uuid()}@example.com`;
    signUp(email, "password");

    cy.url().should("include", "/admin/dashboard");
  });
});
