const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/index'); // Import the Express app
const User = require('../src/modules/system/models/User');
const AgentPage = require('../src/modules/agentPages/models/agentPage.model');
const Agent = require('../src/modules/agentPages/models/agent.model');

// Mock the agent execution service to avoid real LLM calls
jest.mock('../src/modules/agentPages/services/agentExecution.service', () => ({
  executeAgent: jest.fn((agent, input) => {
    return Promise.resolve({
      response: `Mock response for input: ${input}`,
      metadata: {
        agentId: agent._id,
        executionTime: 100,
        tokensUsed: 50
      }
    });
  })
}));

describe('Agent Pages API Tests', () => {
  let testUser;
  let testToken;
  let testPageId;
  let testAgentId;

  // Setup: Connect to test database and create test user
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/neuradesk_test';
    await mongoose.connect(mongoUri);

    // Create a test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword' // In real scenario, hash properly
    });
    await testUser.save();

    // Generate JWT token for test user
    testToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'testsecret');
  });

  // Cleanup: Clear all collections before each test
  beforeEach(async () => {
    await AgentPage.deleteMany({});
    await Agent.deleteMany({});
  });

  // Teardown: Close database connection
  afterAll(async () => {
    await User.deleteMany({}); // Clean up test user
    await mongoose.connection.close();
  });

  describe('POST /api/agent-pages - Create Agent Page', () => {
    it('should create a new agent page successfully', async () => {
      const pageData = {
        name: 'Test Agent Page',
        description: 'A page for testing agents',
        icon: '🤖',
        pageConfig: { theme: 'dark' }
      };

      const response = await request(app)
        .post('/api/agent-pages')
        .set('Authorization', `Bearer ${testToken}`)
        .send(pageData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(pageData.name);
      expect(response.body.description).toBe(pageData.description);
      expect(response.body.ownerId.toString()).toBe(testUser._id.toString());

      testPageId = response.body._id; // Save for other tests
    });

    it('should return 401 without authentication', async () => {
      const pageData = {
        name: 'Test Page',
        description: 'Test description'
      };

      await request(app)
        .post('/api/agent-pages')
        .send(pageData)
        .expect(401);
    });
  });

  describe('GET /api/agent-pages - List Agent Pages', () => {
    beforeEach(async () => {
      // Create a test page for listing
      const page = new AgentPage({
        ownerId: testUser._id,
        name: 'List Test Page',
        description: 'For listing test'
      });
      await page.save();
      testPageId = page._id;
    });

    it('should list agent pages for authenticated user', async () => {
      const response = await request(app)
        .get('/api/agent-pages')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('List Test Page');
    });
  });

  describe('POST /api/agent-pages/:pageId/agents - Create Agent', () => {
    beforeEach(async () => {
      // Create a test page first
      const page = new AgentPage({
        ownerId: testUser._id,
        name: 'Page for Agent',
        description: 'Test page'
      });
      await page.save();
      testPageId = page._id;
    });

    it('should create an agent in the page', async () => {
      const agentData = {
        name: 'Test Agent',
        role: 'Assistant',
        tone: 'professional',
        creativity: 0.7,
        verbosity: 0.5,
        toolsEnabled: ['search'],
        memoryEnabled: true
      };

      const response = await request(app)
        .post(`/api/agent-pages/${testPageId}/agents`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(agentData)
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(agentData.name);
      expect(response.body.pageId.toString()).toBe(testPageId.toString());

      testAgentId = response.body._id; // Save for execution test
    });

    it('should return 404 for non-existent page', async () => {
      const fakePageId = new mongoose.Types.ObjectId();
      const agentData = {
        name: 'Test Agent',
        role: 'Assistant'
      };

      await request(app)
        .post(`/api/agent-pages/${fakePageId}/agents`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(agentData)
        .expect(404);
    });
  });

  describe('POST /api/agent-pages/:pageId/agents/:agentId/execute - Execute Agent', () => {
    beforeEach(async () => {
      // Create test page and agent
      const page = new AgentPage({
        ownerId: testUser._id,
        name: 'Execution Test Page',
        description: 'For execution test'
      });
      await page.save();
      testPageId = page._id;

      const agent = new Agent({
        pageId: testPageId,
        name: 'Execution Test Agent',
        role: 'Assistant'
      });
      await agent.save();
      testAgentId = agent._id;
    });

    it('should execute agent and return mock response', async () => {
      const executionData = {
        input: 'Hello, test message',
        context: { userId: 'test', sessionId: 'session1' }
      };

      const response = await request(app)
        .post(`/api/agent-pages/${testPageId}/agents/${testAgentId}/execute`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(executionData)
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.response).toContain('Mock response for input: Hello, test message');
      expect(response.body.metadata.agentId.toString()).toBe(testAgentId.toString());
    });

    it('should return 404 for non-existent agent', async () => {
      const fakeAgentId = new mongoose.Types.ObjectId();
      const executionData = {
        input: 'Test input'
      };

      await request(app)
        .post(`/api/agent-pages/${testPageId}/agents/${fakeAgentId}/execute`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(executionData)
        .expect(404);
    });
  });

  describe('GET /api/agent-pages/:pageId - Get Single Page', () => {
    beforeEach(async () => {
      const page = new AgentPage({
        ownerId: testUser._id,
        name: 'Single Page Test',
        description: 'For single page retrieval'
      });
      await page.save();
      testPageId = page._id;
    });

    it('should retrieve a single agent page with populated agents', async () => {
      const response = await request(app)
        .get(`/api/agent-pages/${testPageId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body._id.toString()).toBe(testPageId.toString());
      expect(response.body.name).toBe('Single Page Test');
      expect(Array.isArray(response.body.agents)).toBe(true);
    });
  });
});
