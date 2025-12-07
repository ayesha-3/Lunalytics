import loginDetails from '../setup/fixtures/login.json';
import monitorDetails from '../setup/fixtures/monitor.json';

describe('Monitor HTTP - Advance', () => {
  const { email, password } = loginDetails.ownerUser;

  // Helper to login and visit home
  const loginAndVisitHome = () => {
    cy.clearCookies();
    cy.loginUser(email, password);
    cy.visit('/home');
    cy.get('[class="luna-button-content"]', { timeout: 15000 }).should('be.visible');
  };

  context('create a monitor with basic information', () => {
    beforeEach(() => {
      loginAndVisitHome();
    });

    it('should show errors for invalid values and create a monitor with valid values', () => {
      // Alias Add Monitor button
      cy.get('[class="luna-button primary flat"]', { timeout: 15000 })
        .should('be.visible')
        .as('addMonitorButton');

      cy.get('@addMonitorButton').click();

      // Optionally intercept monitor creation request
      cy.intercept('POST', '/api/monitors').as('createMonitor');

      cy.createMonitor(monitorDetails.http);

      // Wait for server response before proceeding
      cy.wait('@createMonitor');

      // Assert monitor is created
      cy.contains('.item.item-active div.content div div', monitorDetails.http.name.value, { timeout: 10000 })
        .should('be.visible');
    });
  });

  context('edit a monitor', () => {
    beforeEach(() => {
      loginAndVisitHome();
    });

    it('Edit monitor name', () => {
      cy.createMonitor(monitorDetails.http);
      cy.intercept('PUT', '/api/monitors/*').as('editMonitor');

      // Click the monitor by its visible name
      cy.contains('.item.item-active div.content div div', monitorDetails.http.name.value, { timeout: 10000 })
        .should('be.visible')
        .click();

      // Click Edit button
      cy.get('[id="monitor-edit-button"]')
        .should('be.visible')
        .as('editButton')
        .click({ force: true });

      // Append '-Edited' to the existing value safely
      cy.get(monitorDetails.http.name.id)
        .should('be.visible')
        .invoke('val')
        .then((currentValue) => {
          cy.get(monitorDetails.http.name.id)
            .clear()
            .type(`${currentValue}-Edited`, { parseSpecialCharSequences: false });
        });

      // Save the monitor
      cy.get('[class="luna-button green flat"]')
        .should('be.visible')
        .click();

      cy.wait('@editMonitor');

      // Assert the edited monitor name is visible
      cy.contains('.item.item-active div.content div div', `${monitorDetails.http.name.value}-Edited`, { timeout: 10000 })
        .should('be.visible');
    });
  });

  context('delete a monitor', () => {
    beforeEach(() => {
      loginAndVisitHome();
    });

    it('Delete monitor', () => {
      cy.intercept('DELETE', '/api/monitors/*').as('deleteMonitor');

      // Click the monitor by its visible name
      cy.contains('.item.item-active div.content div div', `${monitorDetails.http.name.value}-Edited`, { timeout: 10000 })
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

      cy.wait('@deleteMonitor');

      // Assert monitor is removed
      cy.contains('.item.item-active div.content div div', `${monitorDetails.http.name.value}-Edited`, { timeout: 10000 })
        .should('not.exist');
    });
  });
});
