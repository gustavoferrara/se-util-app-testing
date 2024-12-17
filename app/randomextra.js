
  // Click Consent Question Property "APPROVE - ALL FUTURE"
  await page.waitForFunction(() => {
    const buttons = Array.from(document.querySelectorAll('a[role="button"]'));
    const approveButton = buttons.find((el) => el.textContent.includes("APPROVE - ALL FUTURE"));
    if (approveButton) {
      approveButton.click();
      return true;
    }
    return false;
  });
    await setTimeout(100);

  // Existing yes inputs
  const yesSelectors = [
    'Is Structure Location Information Correct?',
    "Property Owner available to give consent?",
    "Structure Tag?",
    "Is Structure ID Correct?",
  ];

  for (const labelText of yesSelectors) {
    await page.waitForFunction(
      (text) => {
        const labels = Array.from(document.querySelectorAll("div")).filter((el) => el.textContent === text);
        if (labels.length > 0) {
          const container = labels[0].closest(".css-1mtbxkt");
          if (container) {
            const yesButton = container.querySelector('a[data-testid*="yes-button"]');
            if (yesButton) {
              yesButton.click();
              return true;
            }
          }
        }
        return false;
      },
      {},
      labelText
    );
      await setTimeout(100);
  }

  // No inputs
  const noSelectors = [
    'Is there "intended" vegetation for this property?',
    "Exception to Structure Clearance", 
    "Partial Clearance", 
    "Out of Scope Vegetation Found?",
  ];

  for (const labelText of noSelectors) {
    await page.waitForFunction(
      (text) => {
        const labels = Array.from(document.querySelectorAll("div")).filter((el) => el.textContent === text);
        if (labels.length > 0) {
          const container = labels[0].closest(".css-1mtbxkt");
          if (container) {
            const noButton = container.querySelector('a[data-testid*="no-button"]');
            if (noButton) {
              noButton.click();
              return true;
            }
          }
        }
        return false;
      },
      {},
      labelText
    );
      await setTimeout(100);
  }

  // Set Date Work Performed to same date as Date Visited
  
  await page.evaluate(() => {
    const dateInput = document.querySelector('[data-testid="element-date_work_performed"] input[type="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Set Date Work Performed to:', today);
    } else {
      console.log('Date Work Performed input not found');
    }
  });
    await setTimeout(100);
