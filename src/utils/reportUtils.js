// Utility to get the billing period for a given transaction date and start of month day.
export const getBillingPeriod = (dateStr, startDay) => {
  const date = new Date(dateStr);
  let startYear = date.getFullYear();
  let startMonth = date.getMonth(); // 0-indexed
  
  if (date.getDate() < startDay) {
    // Belongs to cycle starting in previous month
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }
  
  const startDate = new Date(startYear, startMonth, startDay);
  
  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 11) {
    endMonth = 0;
    endYear += 1;
  }
  const endDate = new Date(endYear, endMonth, startDay - 1);
  
  // Format period strings
  const startStr = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const endStr = endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  
  return {
    startDate,
    endDate,
    label: `${startStr} - ${endStr}`,
    id: `${startYear}-${String(startMonth + 1).padStart(2, '0')}`, // e.g. "2026-05"
    year: startYear
  };
};

// Check if a billing cycle is fully completed relative to today
export const isBillingCycleCompleted = (cycleId, startDay, today = new Date()) => {
  const [yearStr, monthStr] = cycleId.split('-');
  const startYear = parseInt(yearStr);
  const startMonth = parseInt(monthStr) - 1; // 0-indexed
  
  let endMonth = startMonth + 1;
  let endYear = startYear;
  if (endMonth > 11) {
    endMonth = 0;
    endYear += 1;
  }
  
  const endDate = new Date(endYear, endMonth, startDay - 1);
  endDate.setHours(23, 59, 59, 999);
  
  return today > endDate;
};

// Check if a billing year is fully completed relative to today
export const isBillingYearCompleted = (year, startDay, today = new Date()) => {
  const endDate = new Date(year + 1, 0, startDay - 1);
  endDate.setHours(23, 59, 59, 999);
  
  return today > endDate;
};

// A local rules-engine to perform financial diagnostics and produce dynamic smart suggestions for saving money
export const generateSavingsInsights = (expenses, totalSpent) => {
  if (expenses.length === 0 || totalSpent === 0) {
    return [
      "Strategic Tip: No outgoings tracked in this cycle yet. Track your daily spends to receive tailored saving suggestions!"
    ];
  }

  // 1. Calculate category expenditures
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Sort categories by expenditure
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalSpent) * 100).toFixed(0)
    }));

  const topCategory = sortedCategories[0];
  const insights = [];

  // Insight 1: General distribution
  insights.push(`Your top spending category is **${topCategory.category}**, accounting for **${topCategory.percentage}%** (₹${topCategory.amount.toLocaleString('en-IN')}) of your total outgoings.`);

  // Insight 2: Category-specific smart saving tips
  if (topCategory.category === 'Food') {
    const foodSubs = {};
    expenses.filter(e => e.category === 'Food').forEach(e => {
      foodSubs[e.subCategory || 'Other'] = (foodSubs[e.subCategory || 'Other'] || 0) + e.amount;
    });
    const topFoodSub = Object.entries(foodSubs).sort((a, b) => b[1] - a[1])[0];
    
    if (topFoodSub) {
      const subName = topFoodSub[0].toLowerCase();
      if (subName.includes('dining') || subName.includes('cafe') || subName.includes('restaurant') || subName.includes('outside')) {
        insights.push(`🍔 **Dining out / Cafe culture** was your primary driver in Food (₹${topFoodSub[1].toLocaleString('en-IN')}). Cooking meals at home just twice more a week or planning your social cafe trips can save you up to **₹1,500** next month!`);
      } else {
        insights.push(`🛒 **Groceries** formed the bulk of your Food spending (₹${topFoodSub[1].toLocaleString('en-IN')}). Try batch-cooking, preparing shopping lists, and buying pantry staples in bulk to cut your grocery bill by **10-15%**.`);
      }
    }
  } else if (topCategory.category === 'Vehicle' || topCategory.category === 'Travel') {
    insights.push(`🚗 **Transit & Fuel**: Your commute or travel expenses were ₹${topCategory.amount.toLocaleString('en-IN')}. Combining errands, using public transport, or carpooling can trim down your carbon footprint and save you up to **₹1,200** next month!`);
  } else if (topCategory.category === 'Entertainment' || topCategory.category === 'Shopping' || topCategory.category === 'Leisure') {
    insights.push(`🛍️ **Discretionary Spending**: You spent ₹${topCategory.amount.toLocaleString('en-IN')} on Shopping/Entertainment. Implementing a **24-hour cooling-off rule** before buying non-essential items is an excellent way to curb impulse buying and save money effortlessly.`);
  } else {
    insights.push(`💡 **Budget Optimizations**: Review your sub-categories under **${topCategory.category}**. Setting a strict spending limit on this category is a highly effective way to keep your budget perfectly on track.`);
  }

  // Insight 3: Transaction frequency and size checks
  const singleLargeSpends = expenses.filter(e => e.amount >= 2000);
  if (singleLargeSpends.length > 0) {
    insights.push(`⚠️ You had **${singleLargeSpends.length} large transaction(s)** of ₹2,000 or more. For major purchases, try spacing them out across billing cycles to prevent sudden cash-flow strains.`);
  }

  // Insight 4: General positive reinforcement / tip
  if (sortedCategories.length >= 2) {
    const secondCategory = sortedCategories[1];
    insights.push(`🎯 **Savings strategy**: Together, **${topCategory.category}** and **${secondCategory.category}** represent **${(parseFloat(topCategory.percentage) + parseFloat(secondCategory.percentage)).toFixed(0)}%** of all expenditures. Next month, focus on reducing just *one* of these two by 10% to build a solid wealth reserve!`);
  } else {
    insights.push(`📈 **Wealth tip**: Automate your savings! Try transferring 20% of your starting balance into a separate vault at the start of the billing month before recording any expenses.`);
  }

  return insights;
};
