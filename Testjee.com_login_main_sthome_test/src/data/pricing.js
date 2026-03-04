// Pricing logic for Testjee exams - Opening Launch Offer 🎉
// MRP: ₹70/exam | Offer: ₹50/exam (flat for all packages)

const MRP_PRICE = 70;    // Original price per exam
const OFFER_PRICE = 50;  // Launch offer price per exam (same for all)

export const EXAM_PRICE_TIERS = [
    { min: 1, max: 999, pricePerExam: OFFER_PRICE, tag: 'Launch Offer', tagColor: 'orange' }
];

/**
 * Calculates pricing details for a given number of exams
 * @param {number} count - Number of exams chosen
 * @returns {Object} Pricing details
 */
export function getPriceDetails(count) {
    const numExams = Math.max(1, parseInt(count) || 1);

    const pricePerExam = OFFER_PRICE;
    const totalPrice = pricePerExam * numExams;
    const originalPrice = MRP_PRICE * numExams;
    const savingsAmount = originalPrice - totalPrice;
    const discountPercent = Math.round((savingsAmount / originalPrice) * 100);

    return {
        count: numExams,
        pricePerExam,
        totalPrice,
        originalPrice,
        savingsAmount,
        discountPercent,
        tag: 'Launch Offer',
        tagColor: 'orange'
    };
}

/**
 * Common preset packages to show in the UI
 */
export const PRESET_PACKAGES = [1, 3, 5, 10, 15, 20];
