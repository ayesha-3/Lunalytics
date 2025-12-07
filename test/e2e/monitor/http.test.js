import loginDetails from '../setup/fixtures/login.json';
import monitorDetails from '../setup/fixtures/monitor.json';

describe('Monitor HTTP - Advance', () => {
  const { email, password } = loginDetails.ownerUser;

  // Helper to login and visit home
  const loginAndVisitHome = () => {
    cy.clearCookies();
    cy.loginUser(email, password);
    cy.visit('/home');
    cy.get('[class="luna-button-content"]', { timeout: 10000 }).should('be.visible');
  };

  context('create a monitor with basic information', () => {
    beforeEach(() => {
      loginAndVisitHome();
    });

    it('should show errors for invalid values and create a monitor with valid values', () => {
      // Alias button for stability
      cy.get('[class="luna-button primary flat"]', { timeout: 10000 }).as('addMonitorButton');

      cy.get('@addMonitorButton').should('be.visible');
      cy.createMonitor(monitorDetails.http);
    });
  });

  context('edit a monitor', () => {
    beforeEach(() => {
      loginAndVisitHome();
    });

    it('Edit monitor name', () => {
      cy.createMonitor(monitorDetails.http);

      // Click the monitor by its visible name
      cy.contains('.item.item-active div.content div div', monitorDetails.http.name.value)
        .first()
        .as('monitorItem')
        .should('be.visible')
        .click();

      cy.get('[id="monitor-edit-button"]').as('editButton').should('be.visible').click({ force: true });

      // Append '-Edited' to the existing value
      cy.get(monitorDetails.http.name.id)
        .as('nameInput')
        .should('be.visible')
        .invoke('val')
        .then((currentValue) => {
          cy.typeText('@nameInput' in cy ? '@nameInput' : monitorDetails.http.name.id, `${currentValue}-Edited`);
        });

      // Save the monitor
      cy.get('[class="luna-button green flat"]')
        .as('saveButton')
        .should('be.visible')
        .click();

      // Assert the edited monitor name is visible
      cy.contains(
        '.item.item-active div.content div div',
        `${monitorDetails.http.name.value}-Edited`,
        { timeout: 10000 }
      ).should('be.visible');
    });
  });

  context('delete a monitor', () => {
    beforeEach(() => {
      loginAndVisitHome();
    });

    it('Delete monitor', () => {
      // Click the monitor by its visible name
      cy.contains(
        '.item.item-active div.content div div',
        `${monitorDetails.http.name.value}-Edited`
      )
        .first()
        .as('monitorItem')
        .should('be.visible')
        .click();

      // Click delete
      cy.get('[id="monitor-delete-button"]').as('deleteButton').should('be.visible').click({ force: true });

      // Confirm deletion
      cy.get('[id="monitor-delete-confirm-button"]')
        .as('confirmDelete')
        .should('be.visible')
        .click({ force: true });

      // Assert monitor is removed
      cy.contains(
        '.item.item-active div.content div div',
        `${monitorDetails.http.name.value}-Edited`,
        { timeout: 10000 }
      ).should('not.exist');
    });
  });
});
