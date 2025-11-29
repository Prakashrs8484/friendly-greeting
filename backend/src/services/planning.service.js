// Salary Projection + Investment Corpus Calculations

function salaryProjection(startingSalary, incrementPct = 0, years = 20) {
    let annual = startingSalary * 12;
    const table = [];
  
    for (let i = 1; i <= years; i++) {
      table.push({
        year: i,
        monthlySalary: +(annual / 12).toFixed(2),
        annualSalary: +annual.toFixed(2)
      });
  
      annual = annual * (1 + incrementPct / 100);
    }
  
    return { years: table };
  }
  
  function investmentCorpus(monthlyContribution, allocations, returns, months = 120) {
    const keys = Object.keys(allocations);
    let buckets = {};
    let history = [];
  
    keys.forEach(k => (buckets[k] = 0));
  
    for (let m = 1; m <= months; m++) {
      keys.forEach(k => {
        const r = returns[k] / 100 / 12;
        buckets[k] = buckets[k] * (1 + r);
        buckets[k] += monthlyContribution * (allocations[k] / 100);
      });  
  
      history.push({
        month: m,
        totalCorpus: keys.reduce((sum, k) => sum + buckets[k], 0),
        allocations: { ...buckets }
      });
    }
  
    return { months: history };
  }
  
  module.exports = { salaryProjection, investmentCorpus };
  