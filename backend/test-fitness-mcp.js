/**
 * Quick test for Fitness MCP endpoint
 */
const axios = require('axios');

const testPayload = {
  text: "Had 2 dosa breakfast and did 30 min yoga",
  parsedActions: [
    {
      actionType: "meal",
      extractedData: {
        food: "dosa",
        quantity: 2,
        calories: 400
      }
    },
    {
      actionType: "workout",
      extractedData: {
        type: "yoga",
        duration: 30,
        intensity: "moderate"
      }
    }
  ],
  dashboard: {
    today: {
      fitnessScore: 65
    },
    progressTowardGoals: {
      calorieConsumption: {
        current: 800,
        goal: 2000,
        percentage: 40
      },
      workout: {
        current: 30,
        goal: 60,
        percentage: 50
      }
    },
    currentStreak: 3
  }
};

async function test() {
  try {
    console.log('\n🧪 Testing Fitness MCP Coach Endpoint\n');
    console.log('Request:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios.post('http://localhost:4000/api/mcp/fitness/generate', testPayload);
    
    console.log('\n✅ Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n📝 Coach Message:');
    console.log(response.data.data.coachMessage);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

test();
