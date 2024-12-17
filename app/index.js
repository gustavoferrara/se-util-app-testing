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

const handlePhotoUploads = async (page) => {
  console.log('Starting photo uploads...');
  
  const photoFields = [
    'element-full_structure',
    'element-photo_facing_north',
    'element-photo_facing_south',
    'element-photo_facing_east',
    'element-photo_facing_west',
    'element-structure_tag_photo'
  ];
  
  try {
    for (const fieldId of photoFields) {
      console.log(`Processing upload for ${fieldId}...`);
      
      // Find the file input within this field
      const fileInputSelector = `[data-testid="${fieldId}"] input[type="file"]`;
      
      // Wait for the input to be present in DOM
      await page.waitForSelector(fileInputSelector);
      
      // Set up the file path - assuming DSCF0343.jpeg is in the same directory
      const filePath = require('path').join(__dirname, 'DSCF0343.jpeg');
      
      // Upload the file
      const input = await page.$(fileInputSelector);
      await input.uploadFile(filePath);
      
      // Wait a bit for the upload to process
      await setTimeout(500);
      
      console.log(`Completed upload for ${fieldId}`);
    }
    
    console.log('All photo uploads completed');
    
  } catch (error) {
    console.error('Error uploading photos:', error);
    throw error;
  }
};

const handleMultipleSaves = async (page, numberOfSaves = 5) => {
  console.log(`Starting multiple save sequence (${numberOfSaves} saves)...`);
  
  try {
    for (let i = 0; i < numberOfSaves; i++) {
      await setTimeout(500);
      const buttonId = i % 2; // Alternates between 0 and 1
      console.log(`Attempting save #${i + 1} with button-${buttonId}`);
      
      // Wait for the save button to be available
      await page.waitForSelector(`[data-testid="save-button-${buttonId}"]`, { 
        visible: true,
        timeout: 5000 
      });
      
      // Click the save button
      await page.evaluate((bid) => {
        const saveButton = document.querySelector(`[data-testid="save-button-${bid}"]`);
        if (saveButton) {
          console.log(`Found save-button-${bid}, clicking...`);
          saveButton.style.pointerEvents = 'auto';
          saveButton.click();
          return true;
        }
        console.log(`save-button-${bid} not found`);
        return false;
      }, buttonId);
      
      // Brief pause between saves
      await setTimeout(100);
      
      console.log(`Completed save #${i + 1}`);
    }
    
    console.log('All saves completed successfully');
    
  } catch (error) {
    console.error('Error during save sequence:', error);
    throw error;
  }
};

const handleOutOfScopeVegetation = async (page) => {
  console.log('Starting Out of Scope Vegetation handling...');
  
  try {
    // First wait for page to be stable
    await setTimeout(500);
    
    // Single attempt to find and click the button
    await page.evaluate(() => {
      console.log('Looking for Out of Scope Vegetation Found?...');
      
      // Find the label first
      const labels = Array.from(document.querySelectorAll('div'));
      const outOfScopeLabel = labels.find(el => el.textContent === "Out of Scope Vegetation Found?");
      
      if (outOfScopeLabel) {
        console.log('Label found, traversing up to find container...');
        
        // Try multiple container finding strategies
        let container = outOfScopeLabel.closest('.css-1mtbxkt');
        if (!container) {
          console.log('Standard container class not found, trying parent traversal...');
          container = outOfScopeLabel.parentElement;
          while (container && !container.querySelector('[data-testid="no-button"]')) {
            container = container.parentElement;
          }
        }
        
        if (container) {
          console.log('Container found, looking for NO button...');
          const noButton = container.querySelector('[data-testid="no-button"]');
          
          if (noButton) {
            console.log('NO button found, preparing to click...');
            
            // Ensure clickability
            container.style.pointerEvents = 'auto';
            noButton.style.pointerEvents = 'auto';
            
            // Attempt click
            noButton.click();
            console.log('Click attempted');
            return true;
          } else {
            console.log('NO button not found in container');
          }
        } else {
          console.log('No suitable container found');
        }
      } else {
        console.log('Out of Scope Vegetation label not found');
      }
      
      return false;
    });
    
    // Brief pause after click attempt
    await setTimeout(100);
    
  } catch (error) {
    console.error('Error handling Out of Scope Vegetation:', error);
    // Instead of throwing, we'll just log the error and continue
    console.log('Continuing despite Out of Scope Vegetation error...');
  }
  
  console.log('Completed Out of Scope Vegetation handling');
};

const setDateVisited = async (page, dateValue) => {
  console.log(`Starting setDateVisited with date: ${dateValue}`);
  
  try {
    // First, wait for page to be stable
    console.log('Waiting for page to stabilize...');
    await setTimeout(500);

    console.log('Looking for Date Visited label...');
    const labelExists = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('div'));
      const dateLabel = elements.find(el => el.textContent === 'Date Visited');
      console.log('Found label:', !!dateLabel);
      return !!dateLabel;
    });

    if (!labelExists) {
      console.error('Date Visited label not found');
      return;
    }

    // Set value and lock the field
    console.log('Setting date and locking field...');
    await page.evaluate((targetDate) => {
      const dateLabel = Array.from(document.querySelectorAll('div'))
        .find(el => el.textContent === 'Date Visited');
      let container = dateLabel.parentElement;
      while (container && !container.querySelector('input[type="date"]')) {
        container = container.parentElement;
      }
      const input = container?.querySelector('input[type="date"]');
      if (input) {
        // Set the value
        input.value = targetDate;
        
        // Lock the field
        input.setAttribute('readonly', 'false');
        input.setAttribute('disabled', 'false');
        
        // Trigger events
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Override value setter
        Object.defineProperty(input, 'value', {
          get: function() { return targetDate; },
          set: function() { return targetDate; },
          configurable: true
        });
        
        // Prevent any programmatic changes
        input.addEventListener('change', (e) => {
          if (e.target.value !== targetDate) {
            e.target.value = targetDate;
          }
        }, true);
      }
    }, dateValue);

    await setTimeout(100);
    
    // Verify the value
    const finalValue = await page.evaluate(() => {
      const dateLabel = Array.from(document.querySelectorAll('div'))
        .find(el => el.textContent === 'Date Visited');
      let container = dateLabel.parentElement;
      while (container && !container.querySelector('input[type="date"]')) {
        container = container.parentElement;
      }
      const input = container?.querySelector('input[type="date"]');
      return input?.value || 'no value';
    });

    console.log(`Final value: ${finalValue}`);
    
    if (finalValue !== dateValue) {
      console.log(`Warning: Value verification failed. Got ${finalValue}, expected ${dateValue}`);
    }

  } catch (error) {
    console.error('Error in setDateVisited:', error);
    console.log('Continuing despite date input error...');
  }
  
  await setTimeout(500);
  console.log('Completed setDateVisited function');
};

const setDateWorkPerformed = async (page, dateValue) => {
  console.log(`Starting setDateWorkPerformed with date: ${dateValue}`);
  
  try {
    // First, wait for page to be stable
    console.log('Waiting for page to stabilize...');
    await setTimeout(1000);

    // Strategy 1: Direct value with events
    console.log('Trying direct value with events...');
    await page.evaluate((targetDate) => {
      const dateLabel = Array.from(document.querySelectorAll('div'))
        .find(el => el.textContent === 'Date Work Performed');
      if (!dateLabel) return false;
      
      let container = dateLabel.parentElement;
      while (container && !container.querySelector('input[type="date"]')) {
        container = container.parentElement;
      }
      
      const input = container?.querySelector('input[type="date"]');
      if (!input) return false;
      
      input.value = targetDate;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    }, dateValue);
    await setTimeout(500);
    await handleMultipleSaves(page, 2);
    await setTimeout(1000);

    // Strategy 2: React state update
    console.log('Trying React state update...');
    await page.evaluate((targetDate) => {
      const dateLabel = Array.from(document.querySelectorAll('div'))
        .find(el => el.textContent === 'Date Work Performed');
      if (!dateLabel) return false;
      
      let container = dateLabel.parentElement;
      while (container && !container.querySelector('input[type="date"]')) {
        container = container.parentElement;
      }
      
      const input = container?.querySelector('input[type="date"]');
      if (!input) return false;
      
      input.value = targetDate;
      input.defaultValue = targetDate;
      
      ['input', 'change', 'blur'].forEach(eventType => {
        const event = new Event(eventType, { bubbles: true });
        input.dispatchEvent(event);
      });
      
      return true;
    }, dateValue);
    await setTimeout(500);
    await handleMultipleSaves(page, 2);
    await setTimeout(1000);

    // Strategy 3: Multiple events chain
    console.log('Trying multiple events chain...');
    await page.evaluate((targetDate) => {
      const dateLabel = Array.from(document.querySelectorAll('div'))
        .find(el => el.textContent === 'Date Work Performed');
      if (!dateLabel) return false;
      
      let container = dateLabel.parentElement;
      while (container && !container.querySelector('input[type="date"]')) {
        container = container.parentElement;
      }
      
      const input = container?.querySelector('input[type="date"]');
      if (!input) return false;
      
      input.focus();
      input.value = targetDate;
      input.dispatchEvent(new Event('focus', { bubbles: true }));
      input.dispatchEvent(new Event('click', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      input.blur();
      
      return true;
    }, dateValue);
    await setTimeout(500);
    await handleMultipleSaves(page, 2);

    // Verify final value
    const finalValue = await page.evaluate(() => {
      const dateLabel = Array.from(document.querySelectorAll('div'))
        .find(el => el.textContent === 'Date Work Performed');
      let container = dateLabel?.parentElement;
      while (container && !container.querySelector('input[type="date"]')) {
        container = container.parentElement;
      }
      const input = container?.querySelector('input[type="date"]');
      return input?.value || 'no value';
    });

    console.log(`Final value: ${finalValue}`);
    
    if (finalValue !== dateValue) {
      console.log(`Warning: Value verification failed. Got ${finalValue}, expected ${dateValue}`);
    }

  } catch (error) {
    console.error('Error in setDateWorkPerformed:', error);
    console.log('Continuing despite date input error...');
  }
  
  console.log('Completed setDateWorkPerformed function');
};

// const setDateWorkPerformed = async (page, dateValue) => {
//   console.log(`Starting setDateWorkPerformed with date: ${dateValue}`);
  
//   try {
//     // First, wait for page to be stable
//     console.log('Waiting for page to stabilize...');
//     await setTimeout(1000);

//     console.log('Looking for Date Work Performed label...');
//     const labelExists = await page.evaluate(() => {
//       const elements = Array.from(document.querySelectorAll('div'));
//       const dateLabel = elements.find(el => el.textContent === 'Date Work Performed');
//       console.log('Found label:', !!dateLabel);
//       return !!dateLabel;
//     });

//     if (!labelExists) {
//       console.error('Date Work Performed label not found');
//       return;
//     }

//     // Set value and lock the field
//     console.log('Setting date and locking field...');
//     await page.evaluate((targetDate) => {
//       const dateLabel = Array.from(document.querySelectorAll('div'))
//         .find(el => el.textContent === 'Date Work Performed');
//       let container = dateLabel.parentElement;
//       while (container && !container.querySelector('input[type="date"]')) {
//         container = container.parentElement;
//       }
//       const input = container?.querySelector('input[type="date"]');
//       if (input) {
//         // Set the value
//         input.value = targetDate;
        
//         // Lock the field
//         input.setAttribute('readonly', 'false');
//         input.setAttribute('disabled', 'false');
        
//         // Trigger events
//         input.dispatchEvent(new Event('input', { bubbles: true }));
//         input.dispatchEvent(new Event('change', { bubbles: true }));
        
//         // Override value setter
//         Object.defineProperty(input, 'value', {
//           get: function() { return targetDate; },
//           set: function() { return targetDate; },
//           configurable: true
//         });
        
//         // Prevent any programmatic changes
//         input.addEventListener('change', (e) => {
//           if (e.target.value !== targetDate) {
//             e.target.value = targetDate;
//           }
//         }, true);
//       }
//     }, dateValue);

//     await setTimeout(100);
    
//     // Verify the value
//     const finalValue = await page.evaluate(() => {
//       const dateLabel = Array.from(document.querySelectorAll('div'))
//         .find(el => el.textContent === 'Date Work Performed');
//       let container = dateLabel.parentElement;
//       while (container && !container.querySelector('input[type="date"]')) {
//         container = container.parentElement;
//       }
//       const input = container?.querySelector('input[type="date"]');
//       return input?.value || 'no value';
//     });

//     console.log(`Final value: ${finalValue}`);
    
//     if (finalValue !== dateValue) {
//       console.log(`Warning: Value verification failed. Got ${finalValue}, expected ${dateValue}`);
//     }

//   } catch (error) {
//     console.error('Error in setDateWorkPerformed:', error);
//     console.log('Continuing despite date input error...');
//   }
  
//   await setTimeout(100);
//   console.log('Completed setDateWorkPerformed function');
// };




const switchToSandbox = async (page) => {
  try {
    console.log("Starting organization switch...");

    await page.waitForSelector('span[role="button"]', { visible: true });
    console.log("Found menu button");
    await page.click('span[role="button"]');
    console.log("Clicked menu button");

      await setTimeout(100);

    await page.waitForFunction(
      () => {
        const links = Array.from(document.querySelectorAll("a"));
        return links.some((link) => link.textContent.includes("SCE Sandbox"));
      },
      { timeout: 1000 }
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

  await setTimeout(100);
  console.log("Property view opened");
};

const clickEditButton = async (page) => {
  console.log("Looking for edit button...");

  await page.waitForSelector('div[title="Edit"]', { visible: true });
  await page.click('div[title="Edit"]');

    await setTimeout(100);
  console.log("Clicked edit button");
};

const clickMenuButton = async (page) => {
  console.log("Looking for menu button...");

  await page.waitForSelector('div[title="Menu"]', { visible: true });
  await page.click('div[title="Menu"]');

    await setTimeout(100);
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

  await setTimeout(100);
  console.log("Clicked Visit button");
};

const clickVisitMenuButton = async (page) => {
  console.log("Looking for Visit section menu button...");

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
    await setTimeout(100);

    // Click Access to Structure YES
await page.evaluate(() => {
  const before = document.querySelector('input[type="date"]')?.value;
  console.log('Date value before clicking Access:', before);
  
  const labels = Array.from(document.querySelectorAll("div")).filter((el) => el.textContent === "Access to Structure");
  if (labels.length > 0) {
    const container = labels[0].closest(".css-1mtbxkt");
    if (container) {
      const yesButton = container.querySelector('a[data-testid*="yes-button"]');
      if (yesButton) {
        yesButton.click();
      }
    }
  }
  
  const after = document.querySelector('input[type="date"]')?.value;
  console.log('Date value after clicking Access:', after);
  
  return true;
});
    await setTimeout(200);

        // In your fillVisitForm function, replace the date handling section with:
    // To this:
    const todayDate = new Date().toISOString().split('T')[0];
    console.log(`Setting dates to: ${todayDate}`);
    await setDateVisited(page, todayDate);


        await setTimeout(100);
 

 
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
    await setTimeout(100);

  // Specific handling for Structure Tag with more detailed logging
  await page.evaluate(() => {
    console.log('Searching for Structure Tag label');
    const labels = Array.from(document.querySelectorAll('div'));
    const structureTagLabel = labels.find(el => el.textContent === "Structure Tag?");
    
    if (structureTagLabel) {
      console.log('Structure Tag label found');
      let container = structureTagLabel.closest('.css-1mtbxkt');
      
      if (container) {
        console.log('Container found for Structure Tag');
        const yesButton = container.querySelector('a[data-testid*="yes-button"]');
        
        if (yesButton) {
          console.log('Yes button found for Structure Tag');
          yesButton.click();
        } else {
          console.log('No yes button found for Structure Tag');
        }
      } else {
        console.log('No container found for Structure Tag');
      }
    } else {
      console.log('No Structure Tag label found');
    }
  });
    await setTimeout(100);


  // Specific handling for Is Structure ID Correct with detailed logging
  await page.evaluate(() => {
    console.log('Searching for Is Structure ID Correct label');
    const labels = Array.from(document.querySelectorAll('div'));
    const structureIDLabel = labels.find(el => el.textContent === "Is Structure ID Correct?");
    
    if (structureIDLabel) {
      console.log('Is Structure ID Correct label found');
      let container = structureIDLabel.closest('.css-1mtbxkt');
      
      if (container) {
        console.log('Container found for Is Structure ID Correct');
        const yesButton = container.querySelector('a[data-testid*="yes-button"]');
        
        if (yesButton) {
          console.log('Yes button found for Is Structure ID Correct');
          yesButton.click();
        } else {
          console.log('No yes button found for Is Structure ID Correct');
        }
      } else {
        console.log('No container found for Is Structure ID Correct');
      }
    } else {
      console.log('No Is Structure ID Correct label found');
    }
  });
    await setTimeout(100);

  await page.evaluate(() => {
    console.log('Searching for Exception to Structure Clearance label');
    const labels = Array.from(document.querySelectorAll('div'));
    const exceptionLabel = labels.find(el => el.textContent === "Exception to Structure Clearance");
    
    if (exceptionLabel) {
      console.log('Exception to Structure Clearance label found');
      let container = exceptionLabel.closest('.css-1mtbxkt');
      
      if (container) {
        console.log('Container found for Exception to Structure Clearance');
        const noButton = container.querySelector('a[data-testid*="no-button"]');
        
        if (noButton) {
          console.log('No button found for Exception to Structure Clearance');
          noButton.click();
        } else {
          console.log('No no button found for Exception to Structure Clearance');
        }
      } else {
        console.log('No container found for Exception to Structure Clearance');
      }
    } else {
      console.log('No Exception to Structure Clearance label found');
    }
  });
    await setTimeout(100);


    await page.evaluate(() => {
      console.log('Starting Partial Clearance evaluation...');
    
      // Find container
      const partialClearanceContainer = document.querySelector('[data-testid="element-partial_clearance"]');
      console.log('Container found:', {
        exists: !!partialClearanceContainer,
        testId: partialClearanceContainer?.getAttribute('data-testid'),
        classes: partialClearanceContainer?.className,
        style: partialClearanceContainer?.style?.cssText
      });
    
      if (partialClearanceContainer) {
        // Log all buttons in container
        const allButtons = partialClearanceContainer.querySelectorAll('a[role="button"]');
        console.log('All buttons found:', Array.from(allButtons).map(btn => ({
          text: btn.textContent,
          testId: btn.getAttribute('data-testid'),
          classes: btn.className,
          style: btn.style.cssText,
          pointerEvents: window.getComputedStyle(btn).pointerEvents
        })));
    
        // Find specifically the No button
        const noButton = partialClearanceContainer.querySelector('[data-testid="no-button"]');
        console.log('No button details:', {
          exists: !!noButton,
          testId: noButton?.getAttribute('data-testid'),
          classes: noButton?.className,
          style: noButton?.style?.cssText,
          pointerEvents: noButton ? window.getComputedStyle(noButton).pointerEvents : null
        });
    
        if (noButton) {
          // Try to recursively log parent elements to find pointer-events blocking
          let currentElement = noButton;
          const parentChain = [];
          while (currentElement && currentElement !== document.body) {
            parentChain.push({
              tagName: currentElement.tagName,
              classes: currentElement.className,
              pointerEvents: window.getComputedStyle(currentElement).pointerEvents,
              style: currentElement.style.cssText
            });
            currentElement = currentElement.parentElement;
          }
          console.log('Parent chain of No button:', parentChain);
    
          try {
            // Force pointer-events on everything in chain
            parentChain.forEach((_el, i) => {
              const el = noButton;
              for (let j = 0; j < i; j++) {
                el = el.parentElement;
              }
              el.style.pointerEvents = 'auto';
            });
            
            // Try click
            noButton.click();
            console.log('Click attempted');
            return true;
          } catch (e) {
            console.log('Click failed:', e);
          }
        }
      }
      return false;
    });

    await setTimeout(100);

   



    



    await handleOutOfScopeVegetation(page);
 
  
  console.log("Visit form fields filled");
  await handlePhotoUploads(page);

  await setTimeout(1000);

  await setDateWorkPerformed(page, todayDate);

  await handleMultipleSaves(page, 5); 



  
};

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
      slowMo: 10,
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
    await clickVisitMenuButton(page);
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
