const puppeteer = require("puppeteer");
const { setTimeout } = require("node:timers/promises");

const loginFulcrum = async (page, password) => {
  console.log("Navigating to login page...");
  await page.goto("https://web.fulcrumapp.com/users/sign_in");
  await page.waitForSelector("#user_email", { visible: true });

  console.log("Logging in...");
  await page.type("#user_email", "sce@fulcrumapp.com");
  await page.type("#user_password", password);
  await page.click('input[type="submit"]');

  await page.waitForSelector('span[role="button"]', { visible: true });
  console.log("Login successful");
};

const switchToSandbox = async (page) => {
  try {
    console.log("Starting organization switch...");

    await page.waitForSelector('span[role="button"]', { visible: true });
    console.log("Found menu button");
    await page.click('span[role="button"]');
    console.log("Clicked menu button");

    await setTimeout(500);

    await page.waitForFunction(
      () => {
        const links = Array.from(document.querySelectorAll("a"));
        return links.some((link) => link.textContent.includes("SCE Sandbox"));
      },
      { timeout: 5000 }
    );

    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      const sandboxLink = links.find((link) => link.textContent.includes("SCE Sandbox"));
      if (sandboxLink) {
        sandboxLink.click();
      } else {
        throw new Error("Could not find SCE Sandbox link");
      }
    });

    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log("Successfully switched to SCE Sandbox");
  } catch (error) {
    console.error("Error switching to Sandbox organization:", error);
    throw error;
  }
};

const navigateToRecord = async (page, recordId) => {
  console.log(`Navigating to record ${recordId}...`);
  await page.goto(`https://web.fulcrumapp.com/records/${recordId}`);

  console.log("Waiting for confirmation modal...");
  await page.waitForSelector('[data-testid="yes-button"]', { visible: true });
  console.log("Found confirmation modal, clicking Yes...");
  await page.click('[data-testid="yes-button"]');
  console.log("Clicked Yes on confirmation modal");

  await setTimeout(1000);
  console.log("Record page loaded");
};

const openPropertyView = async (page) => {
  console.log("Looking for Property link...");

  await page.waitForFunction(
    () => {
      const elements = Array.from(document.querySelectorAll("span"));
      return elements.some((el) => el.textContent === "Property");
    },
    { timeout: 10000 }
  );

  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("span"));
    const propertyElement = elements.find((el) => el.textContent === "Property");
    if (propertyElement) {
      propertyElement.click();
    }
  });

  await setTimeout(1000);
  console.log("Property view opened");
};

const clickEditButton = async (page) => {
  console.log("Looking for edit button...");

  await page.waitForSelector('div[title="Edit"]', { visible: true });
  await page.click('div[title="Edit"]');

  await setTimeout(500);
  console.log("Clicked edit button");
};

const clickMenuButton = async (page) => {
  console.log("Looking for menu button...");

  await page.waitForSelector('div[title="Menu"]', { visible: true });
  await page.click('div[title="Menu"]');

  await setTimeout(500);
  console.log("Clicked menu button");
};

const clickVisitButton = async (page) => {
  console.log("Looking for Visit button...");

  await page.waitForFunction(
    () => {
      const elements = Array.from(document.querySelectorAll("span"));
      return elements.some((el) => el.textContent === "Visit");
    },
    { timeout: 10000 }
  );

  await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("span"));
    const visitElement = elements.find((el) => el.textContent === "Visit");
    if (visitElement) {
      visitElement.click();
    } else {
      throw new Error("Could not find Visit button");
    }
  });

  await setTimeout(1000);
  console.log("Clicked Visit button");
};

const clickVisitMenuButton = async (page) => {
  console.log("Looking for Visit section menu button...");

  // Wait for and find the Visit container that has '0 Items'
  await page.waitForFunction(
    () => {
      const containers = Array.from(document.querySelectorAll("div"));
      return containers.some((container) => {
        const hasVisit = Array.from(container.querySelectorAll("span")).some((span) => span.textContent === "Visit");
        const hasZeroItems = Array.from(container.querySelectorAll("span")).some((span) => span.textContent === "0 Items");
        const hasMenu = container.querySelector('div[title="Menu"]');
        return hasVisit && hasZeroItems && hasMenu;
      });
    },
    { timeout: 10000 }
  );

  // Click the Menu button inside that container
  await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll("div"));
    const visitContainer = containers.find((container) => {
      const hasVisit = Array.from(container.querySelectorAll("span")).some((span) => span.textContent === "Visit");
      const hasZeroItems = Array.from(container.querySelectorAll("span")).some((span) => span.textContent === "0 Items");
      const hasMenu = container.querySelector('div[title="Menu"]');
      return hasVisit && hasZeroItems && hasMenu;
    });

    if (visitContainer) {
      const menuButton = visitContainer.querySelector('div[title="Menu"]');
      if (menuButton) {
        menuButton.click();
      } else {
        throw new Error("Could not find Menu button in Visit container");
      }
    } else {
      throw new Error("Could not find Visit container with Menu button");
    }
  });

  await setTimeout(1000);
  console.log("Clicked Visit section menu button");
};

const fillVisitForm = async (page) => {
  console.log("Filling Visit form fields...");
  await setTimeout(2000);

  // Handle all date inputs first
  await page.waitForSelector('input[type="date"]', { visible: true });
  await page.evaluate(() => {
    document.querySelectorAll('input[type="date"]').forEach((input) => {
      input.focus();
      input.value = "2024-12-11";
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("blur"));
    });
  });
  await setTimeout(1000);

  // Handle Structure Location Information Correct
  await page.waitForFunction(() => {
    const labels = Array.from(document.querySelectorAll("div")).filter((el) => el.textContent === "Is Structure Location Information Correct?");
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
  });
  await setTimeout(500);

  // Click Access to Structure YES
  await page.waitForFunction(() => {
    const labels = Array.from(document.querySelectorAll("div")).filter((el) => el.textContent === "Access to Structure");
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
  });
  await setTimeout(500);

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
  await setTimeout(500);

  // Handle yes/no buttons for specific text labels
  const yesSelectors = [
    'Is there "intended" vegetation for this property?',
    "Property Owner available to give consent?",
    "Structure Tag?",
    "Is Structure ID Correct?",
    'Was the "intended" vegetation removed for this property?',
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
    await setTimeout(500);
  }

  // Handle no buttons for specific fields
  const noSelectors = ["Exception to Structure Clearance", "Partial Clearance", "Out of Scope Vegetation Found?"];

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
    await setTimeout(500);
  }

  // Click SELECT SIGNATURE button
  await page.waitForFunction(() => {
    const buttons = Array.from(document.querySelectorAll('a[role="button"]'));
    const signatureButton = buttons.find((el) => el.textContent.includes("SELECT SIGNATURE"));
    if (signatureButton) {
      signatureButton.click();
      return true;
    }
    return false;
  });
  await setTimeout(500);

  // Fill in text fields
  const textFields = [
    { label: "Property Owner Consent Signature Name", value: "tes test" },
    { label: "Property Owner Consent Phone", value: "0000000000" },
    { label: "Property Owner Email", value: "email@gmail.com" },
  ];

  for (const field of textFields) {
    await page.waitForFunction(
      ({ label, value }) => {
        const textareas = Array.from(document.querySelectorAll("textarea"));
        const targetField = textareas.find((el) => {
          const container = el.closest(".css-1mtbxkt");
          return container && container.textContent.includes(label);
        });
        if (targetField) {
          targetField.value = value;
          return true;
        }
        return false;
      },
      {},
      field
    );
    await setTimeout(300);
  }

  await setTimeout(1000);
  console.log("Visit form fields filled");
};

// Main execution
// Main execution
(async () => {
  let browser;
  let page;

  try {
    const password = process.argv[2];
    if (!password) {
      console.error("Please provide a password as a command-line argument.");
      process.exit(1);
    }

    browser = await puppeteer.launch({
      headless: false,
      slowMo: 20, // Reduced from 50 to 20
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: null,
    });

    page = await browser.newPage();
    page.on("console", (msg) => console.log("Browser console:", msg.text()));

    await loginFulcrum(page, password);
    await switchToSandbox(page);
    await setTimeout(1000);

    const recordId = "624dbdf1-05f7-4a25-99d4-461a6c4122b0";
    await navigateToRecord(page, recordId);
    await openPropertyView(page);
    await clickEditButton(page);
    await clickMenuButton(page);
    await clickVisitButton(page);
    await clickVisitMenuButton(page); // Add this line
    await fillVisitForm(page);
  } catch (error) {
    console.error("An error occurred:", error);

    if (page) {
      const errorScreenshot = `error-${Date.now()}.png`;
      await page.screenshot({ path: errorScreenshot });
      console.log(`Error screenshot saved as ${errorScreenshot}`);
    }

    if (browser) {
      await browser.close();
    }

    process.exit(1);
  }
})();
