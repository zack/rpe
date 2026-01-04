import 'cypress';

describe('RPE Calculator App E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
    cy.get('.modal-close button').click();
  });

  it('should render the app correctly', () => {
    cy.get('h1').contains('RPE Calculator');
  });

  describe.only('RPE Calculations and Results', () => {
    it('should calculate E1RM and target weight correctly', () => {
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().type('234.5');
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().type('6');
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().type('8.3');
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().type('7');
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().type('9.9');

      cy.get('.results .target').should('contain', '240.00');
      cy.get('input#bar-weight').should('have.value', '240.00')

      // Set rounding to 0.01
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.press(Cypress.Keyboard.Keys.DOWN);
      cy.press(Cypress.Keyboard.Keys.DOWN);
      cy.press(Cypress.Keyboard.Keys.DOWN);

      cy.get('.results .target').should('contain', '242.47');
      cy.get('input#bar-weight').should('have.value', '242.47')
      cy.get('.e1rm').should('contain', '294.58');

      // E1RM Percentage
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.focused().type('77');

      cy.get('.e1rm').should('contain', '226.83');
      cy.get('input#bar-weight').should('have.value', '226.83')

      // Bar loader
      cy.get('.bar-loader .plates .plate.l55').should('exist');
      cy.get('.bar-loader .plates .plate.l35').should('exist');
      cy.get('.bar-loader .plates .plate.l0p5').should('exist');

      // Change to "no collars"
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.press(Cypress.Keyboard.Keys.LEFT);

      cy.get('.bar-loader .plates .plate.l55').should('exist');
      cy.get('.bar-loader .plates .plate.l25').should('exist');
      cy.get('.bar-loader .plates .plate.l5').should('exist');

      // Change to "kilos"
      cy.press(Cypress.Keyboard.Keys.TAB);
      cy.press(Cypress.Keyboard.Keys.LEFT);
      cy.get('.bar-loader .plates .plate.k25').should('exist');
      cy.get('.bar-loader .plates .plate.k0p5').should('exist');
      cy.get('.bar-loader .plates .plate.k0p25').should('exist');
    });
  });
});
