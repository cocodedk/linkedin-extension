/**
 * Extract company data (size, industry, tech stack) from company about page
 * Self-contained for executeScript injection
 */

export function extractCompanyDataScript() {
  try {
    const extractByXPath = (xpath) => {
      const element = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      return element ? element.textContent.trim() : '';
    };

    const extractByMultipleSelectors = (selectors) => {
      for (const selector of selectors) {
        try {
          const result = extractByXPath(selector);
          if (result && result.length > 0) {
            return result;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      console.warn('[Company Data Extraction] All selectors failed for field');
      return '';
    };

    // Extract company size - try multiple strategies
    const companySizeSelectors = [
      '//dt[contains(text(),"Company size")]/following-sibling::dd[1]',
      '//dt[contains(text(),"Size")]/following-sibling::dd[1]',
      '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[3]'
    ];
    const companySize = extractByMultipleSelectors(companySizeSelectors);

    // Extract industry - try multiple strategies
    const industrySelectors = [
      '//dt[contains(text(),"Industry")]/following-sibling::dd[1]',
      '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[2]'
    ];
    const companyIndustry = extractByMultipleSelectors(industrySelectors);

    // Extract tech stack - try multiple strategies
    const techStackSelectors = [
      '//dt[contains(text(),"Technologies")]/following-sibling::dd[1]',
      '//dt[contains(text(),"Tech")]/following-sibling::dd[1]',
      '/html/body/div[5]/div[3]/div/div[2]/div/div[2]/main/div[2]/div/div/div/div[1]/section/dl/dd[5]'
    ];
    const companyTechStack = extractByMultipleSelectors(techStackSelectors);

    console.log('[Company Data Extraction]', {
      companySize,
      companyIndustry,
      companyTechStack
    });

    return {
      companySize,
      companyIndustry,
      companyTechStack
    };
  } catch (error) {
    console.error('Error extracting company data:', error);
    return {
      companySize: '',
      companyIndustry: '',
      companyTechStack: ''
    };
  }
}
