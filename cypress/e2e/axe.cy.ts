import 'cypress-axe';

describe('aXe Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
    cy.get('.modal-close button').click();
    // Wait for the modal's exit transition to finish and fully unmount —
    // otherwise axe can catch it mid-close (e.g. its close button briefly
    // lacking an accessible name) and report false positives.
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should pass the homepage', () => {
    cy.injectAxe()
    cy.checkA11y()
  });

  it('should pass the settings page', () => {
    cy.get('button[aria-label="Settings"]').click();
    cy.injectAxe()
    cy.checkA11y()
  });

  it('should pass the help page', () => {
    cy.get('button[aria-label="Help"]').click();
    cy.injectAxe()
    cy.checkA11y()
  });
});
