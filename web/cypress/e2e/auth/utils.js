const signUp = (email, password) => {
  cy.visit("http://localhost:3000/auth/sign-up");
  cy.get("[name=\"name\"]").type("Test User");
  cy.get("[name=\"email\"]").type(email);
  cy.get("[name=\"password\"]").type(password);
  cy.get("[name=\"acceptedTerms\"]").check();
  cy.get("#create-account-submit").click();
};

const signIn = (email, password) => {
  cy.visit("http://localhost:3000/auth/sign-in");
  cy.get("[name=\"email\"]").type(email);
  cy.get("[name=\"password\"]").type(password);
  cy.get("#login-submit").click();
};

export {
  signUp,
  signIn
};
