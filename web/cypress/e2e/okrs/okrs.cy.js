import { signIn, signUp } from "../auth/utils";

describe("OKRs", () => {


  beforeEach(() => {
    // Generate unique email
    const unixTimestamp = Date.now();
    const email = `test${unixTimestamp}@example.com`;
    signUp(email, "password1");
    signIn(email, "password1");
    cy.visit("http://localhost:3000/admin/okrs/new");
    cy.get(".backdrop").then(($el) => {
      if ($el.is(":visible")) {
        cy.get(".backdrop").click();
      }
    });
  });

  const addObjective = (objective) => {
    cy.get("#objective").type(objective);
    cy.get("#save-objective").click();
  };

  it("displays New OKR", () => {
    cy.contains("New OKR");
    cy.get("#objective").should("be.visible");
    cy.get("#save-objective").should("be.visible");
  });

  it("adds an objective", () => {
    addObjective("Test Objective");
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.contains("Test Objective");
  });

  it("edits an objective", () => {
    addObjective("Test Objective");
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.get(".edit-okr").click();
    cy.get("#objective").should("have.value", "Test Objective");
    cy.get("#objective").clear().type("Test Objective Updated");
    cy.get("#save-objective").click();
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.contains("Test Objective Updated");
  });

  it("deletes an objective", () => {
    addObjective("Test Objective");
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.get(".edit-okr").click();
    cy.get("#delete-objective").click();
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.contains("Test Objective").should("not.exist");
  });

  it("adds key results to an objective", () => {
    addObjective("Test Objective");
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.get(".edit-okr").click();
    cy.get("#key-result-0").type("Key Result 1");
    cy.get("#key-result-1").type("Key Result 2");
    cy.get("#key-result-2").type("Key Result 3");
    // Empty field 1
    cy.get("#key-result-1").clear();
    // Send backspace
    cy.get("#key-result-1").type("{backspace}");
    cy.get("#save-objective").click();
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.contains("Test Objective");
    cy.get(".edit-okr").click();
    cy.get("#key-result-0").should("have.value", "Key Result 1");
    cy.get("#key-result-1").should("have.value", "Key Result 3");
  });

  it("edits key results to an objective", () => {
    addObjective("Test Objective");
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.get(".edit-okr").click();
    cy.get("#key-result-0").type("Key Result 1");
    cy.get("#key-result-1").type("Key Result 2");
    cy.get("#key-result-2").type("Key Result 3");
    cy.get("#save-objective").click();
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.contains("Test Objective");
    cy.get(".edit-okr").click();
    cy.get("#key-result-0").clear().type("Key Result Changed");
    // Empty field 1
    cy.get("#key-result-1").clear();
    // Send backspace
    cy.get("#key-result-1").type("{backspace}");
    cy.get("#save-objective").click();
    cy.url().should("match", /.*\/admin\/okrs$/);
    cy.get("#OKRs").should("be.visible");
    cy.get(".edit-okr").click();
    cy.get("#key-result-0").should("have.value", "Key Result Changed");
    cy.get("#key-result-1").should("have.value", "Key Result 3");
  });
});
