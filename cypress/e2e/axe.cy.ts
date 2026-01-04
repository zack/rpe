import 'cypress-axe';

describe('aXe Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
    cy.get('.modal-close button').click();
  });

  it('should pass the homepage', () => {
    cy.injectAxe()
  });

  it('should pass the settings page', () => {
    cy.get('button[aria-label="Settings"]').click();
    cy.injectAxe()
  });

  it('should pass the help page', () => {
    cy.get('button[aria-label="Help"]').click();
    cy.injectAxe()
  });
});
