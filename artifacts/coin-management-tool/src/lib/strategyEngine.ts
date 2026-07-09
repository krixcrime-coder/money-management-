export function calculateDailyStrategy(currentCoins: number, currentDay: number, isRecovery: boolean) {
  const targetCoins = 10000;
  const totalDays = 30;
  const daysRemaining = totalDays - currentDay + 1;
  
  if (daysRemaining <= 0) {
    return {
      targetBalance: currentCoins,
      stopLossBalance: currentCoins,
      targetProfit: 0,
      maxLoss: 0,
      growthRate: 0,
    };
  }
  
  // Required multiplier for remaining days
  const requiredMultiplier = targetCoins / currentCoins;
  const dailyGrowthNeeded = Math.pow(requiredMultiplier, 1 / daysRemaining) - 1;
  
  // Cap growth rate: min 10%, max 25% per day
  const growthRate = isRecovery 
    ? Math.max(0.10, Math.min(0.15, dailyGrowthNeeded))
    : Math.max(0.12, Math.min(0.22, dailyGrowthNeeded));
  
  const stopLossRate = isRecovery ? 0.08 : 0.10;
  
  const targetBalance = Math.ceil(currentCoins * (1 + growthRate));
  const stopLossBalance = Math.floor(currentCoins * (1 - stopLossRate));
  const targetProfit = targetBalance - currentCoins;
  const maxLoss = currentCoins - stopLossBalance;
  
  return { targetBalance, stopLossBalance, targetProfit, maxLoss, growthRate };
}
