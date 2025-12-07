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
      // Ensure the Add Monitor button is visible before interacting
      cy.get('[class="luna-button primary flat"]', { timeout: 10000 })
        .should('be.visible')
        .as('addMonitorButton');

      cy.get('@addMonitorButton').click();
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
        .should('be.visible')
        .click();

      // Click Edit button
      cy.get('[id="monitor-edit-button"]')
        .should('be.visible')
        .click({ force: true });

      // Append '-Edited' to the existing value safely
      cy.get(monitorDetails.http.name.id)
        .should('be.visible')
        .invoke('val')
        .then((currentValue) => {
          cy.get(monitorDetails.http.name.id).clear().type(`${currentValue}-Edited`, { parseSpecialCharSequences: false });
        });

      // Save the monitor
      cy.get('[class="luna-button green flat"]')
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
        .should('be.visible')
        .click();

      // Click delete
      cy.get('[id="monitor-delete-button"]')
        .should('be.visible')
        .click({ force: true });

      // Confirm deletion
      cy.get('[id="monitor-delete-confirm-button"]')
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
