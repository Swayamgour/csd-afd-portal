/**
 * Eligibility Verification Service
 * Simulates backend validation for CSD AFD entitlements based on defence service records,
 * pay level ceilings, and purchase frequency restrictions.
 */

export const eligibilityService = {
  /**
   * Validate if beneficiary is entitled to procure the selected item
   * @param {Object} user - Authenticated beneficiary profile
   * @param {Object} product - Selected product
   * @param {Object} options - Selected variant, dealer, depot, etc.
   * @returns {Promise<{ eligible: boolean, reason?: string, type?: 'SERVICE_PERIOD' | 'PRICE_CEILING' | 'INTERVAL_RESTRICTION' }>}
   */
  async validateEligibility(user, product, options = {}) {
    // Simulate async API turnaround
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (!user) {
      return {
        eligible: false,
        reason: 'User session not found. Please log in with registered defence credentials.',
        type: 'AUTH_REQUIRED'
      };
    }

    const category = product?.category?.toLowerCase() || 'car';
    const price = product?.lo || options.price || 600000;

    // 1. Service Period Check (5 Years minimum for 4-Wheeler Car)
    if (category === 'car' || category === '4-wheelers' || category === '4 wheelers') {
      const enrollmentDate = user.dateOfEnrollment || user.dateOfCommissioning || '2015-11-23';
      const enrollmentYear = new Date(enrollmentDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsOfService = currentYear - enrollmentYear;

      if (yearsOfService < 5) {
        return {
          eligible: false,
          reason: 'You are not entitled to purchase a car as you have not completed five years of service.',
          type: 'SERVICE_PERIOD',
          details: {
            requiredYears: 5,
            completedYears: yearsOfService,
            enrollmentDate
          }
        };
      }
    }

    // 2. Pay Level / Entitlement Category Price Cap Check
    const payLevel = user.payLevel || 'Level 8';
    const isOfficer = payLevel.includes('10') || payLevel.includes('11') || payLevel.includes('12') || payLevel.includes('13') || payLevel.includes('14') || payLevel.includes('15') || payLevel.includes('16') || payLevel.includes('17') || payLevel.includes('18') || user.entitlementCategory?.includes('Officer');
    const isJCO = payLevel.includes('7') || payLevel.includes('8') || payLevel.includes('9') || user.entitlementCategory?.includes('JCO');

    // Caps according to CSD guidelines:
    // Officers: up to 25 Lakhs
    // JCO: up to 10 Lakhs (ex-showroom)
    // OR: up to 8 Lakhs (ex-showroom)
    let ceiling = 800000;
    if (isOfficer) ceiling = 2500000;
    else if (isJCO) ceiling = 1000000;

    if (category === 'car' && price > ceiling) {
      return {
        eligible: false,
        reason: 'You are not entitled to purchase the selected car.',
        type: 'PRICE_CEILING',
        details: {
          ceiling,
          productPrice: price,
          entitlementCategory: isOfficer ? 'Officers (Pay Level 10-18)' : isJCO ? 'JCO (Pay Level 7-9)' : 'OR (Pay Level 3A-6)'
        }
      };
    }

    // 3. Purchase Frequency Interval Check (e.g. 5-8 years for car)
    if (user.lastFourWheelerPurchase && category === 'car') {
      const lastPurchaseYear = new Date(user.lastFourWheelerPurchase).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearsSinceLast = currentYear - lastPurchaseYear;
      const requiredGap = isOfficer ? 5 : 8;

      if (yearsSinceLast < requiredGap) {
        return {
          eligible: false,
          reason: `You have already purchased a four-wheeler in ${lastPurchaseYear}. You can procure your next four-wheeler after ${requiredGap} years.`,
          type: 'INTERVAL_RESTRICTION',
          details: {
            lastPurchaseYear,
            eligibleFromYear: lastPurchaseYear + requiredGap
          }
        };
      }
    }

    return {
      eligible: true,
      reason: 'Eligible for concessional procurement under Ministry of Defence AFD rules.',
      details: {
        payLevel,
        entitlementCategory: isOfficer ? 'Officers (Pay Level 10-18)' : isJCO ? 'JCO (Pay level 7-9)' : 'OR (Pay Level 3A-6)',
        ceiling
      }
    };
  }
};
