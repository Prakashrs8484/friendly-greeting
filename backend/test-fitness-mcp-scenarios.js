/**
 * Test Fitness MCP with multiple scenarios
 */
const axios = require('axios');

const scenarios = [
  {
    name: "Simple meal",
    payload: {
      text: "Had dosa breakfast",
      parsedActions: [
        {
          actionType: "meal",
          extractedData: { food: "dosa", quantity: 1 }
        }
      ],
      dashboard: { progressTowardGoals: {} }
    }
  },
  {
    name: "Empty input",
    payload: {
      text: "blah blah",
      parsedActions: [],
      dashboard: { progressTowardGoals: {} }
    }
  },
  {
    name: "Multiple actions",
    payload: {
      text: "Had breakfast, did yoga, drank 2L water",
      parsedActions: [
        { actionType: "meal", extractedData: { food: "breakfast" } },
        { actionType: "workout", extractedData: { type: "yoga", duration: 45 } },
        { actionType: "hydration", extractedData: { volumeMl: 2000 } }
      ],
      dashboard: { progressTowardGoals: {} }
    }
  },
  {
    name: "Sleep and recovery",
    payload: {
      text: "Slept 8 hours, recovery is good",
      parsedActions: [
        { actionType: "sleep", extractedData: { duration: 8 } },
        { actionType: "recovery", extractedData: { recoveryQuality: 8 } }
      ],
      dashboard: { progressTowardGoals: {} }
    }
  }
];

async function runTests() {
  try {
    console.log('\n🧪 Testing Fitness MCP with Multiple Scenarios\n');
    
    for (const scenario of scenarios) {
      console.log(`📌 Scenario: ${scenario.name}`);
      const response = await axios.post('http://localhost:4000/api/mcp/fitness/generate', scenario.payload);
      console.log(`   Coach: ${response.data.data.coachMessage}\n`);
    }
    
    console.log('✅ All tests completed!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests();
