describe('empty spec', () => {
  it('passes', () => {
    cy.visit('cypress/fixtures/index.html')
    cy.get('[data-cy="google-login"]').click()
    cy.origin('https://accounts.google.com', () => {
      Cypress.on('uncaught:exception', (err) => !err.message.includes('ResizeObserver loop limit exceeded'));

      cy.get('input[type="email"]').type('bill@cypress.io', {
        log: false,
      });
      cy.contains('Next').click().wait(4000);
    });;
    cy.origin('https://cypress-io.okta.com', () => {
      cy.get('#okta-signin-username').type('test');
    });
  })
})