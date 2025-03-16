import { ConceptRelationship } from '../../../../../shared/types';
import { DeepSeekService } from '../llm/DeepSeekService';

/**
 * Service responsible for extracting key concepts from user messages and content
 * and analyzing concept relationships, hierarchies, and misconceptions
 */
export class ConceptExtractor {
  private deepSeekService: DeepSeekService;
  // Common concept categories for tech education
  private conceptCategories = [
    'programming_fundamentals',
    'web_development',
    'data_science',
    'machine_learning',
    'software_engineering',
    'computer_science',
    'cloud_computing',
    'databases',
    'dev_ops',
    'mobile_development',
    'security'
  ];

  constructor(deepSeekService: DeepSeekService) {
    this.deepSeekService = deepSeekService;
  }

  /**
   * Extract key concepts from a user message
   * @param message The user's message
   * @returns Array of extracted concepts
   */
  async extractConcepts(message: string): Promise<string[]> {
    try {
      console.log('Extracting concepts from message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
      
      const prompt = this.buildConceptExtractionPrompt(message);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseConceptsFromResponse(response);
    } catch (error) {
      console.error('Error extracting concepts:', error);
      return this.fallbackConceptExtraction(message);
    }
  }
  
  /**
   * Extract key concepts with their categories and importance
   * @param message The user's message
   * @returns Structured concept information
   */
  async extractStructuredConcepts(message: string): Promise<Array<{
    concept: string;
    category: string;
    importance: number;
  }>> {
    try {
      const prompt = this.buildStructuredConceptPrompt(message);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseStructuredConceptsFromResponse(response);
    } catch (error) {
      console.error('Error extracting structured concepts:', error);
      // Fall back to basic concept extraction and add default values
      const concepts = await this.extractConcepts(message);
      return concepts.map(concept => ({
        concept,
        category: this.guessConceptCategory(concept),
        importance: 0.7
      }));
    }
  }

  /**
   * Identify misconceptions in the user's message
   * @param message The user's message
   * @param relatedConcepts Concepts that are relevant to the discussion
   * @returns Array of potential misconceptions with corrections
   */
  async identifyMisconceptions(message: string, relatedConcepts: string[] = []): Promise<Array<{
    misconception: string;
    correction: string;
    confidenceLevel: number;
  }>> {
    try {
      const conceptList = relatedConcepts.length > 0 
        ? relatedConcepts.join(', ') 
        : (await this.extractConcepts(message)).join(', ');
      
      const prompt = this.buildMisconceptionPrompt(message, conceptList);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseMisconceptionsFromResponse(response);
    } catch (error) {
      console.error('Error identifying misconceptions:', error);
      return [];
    }
  }

  /**
   * Identify concepts that the user may be struggling with based on their question
   * @param message The user's message
   * @returns Array of concepts the user may be struggling with
   */
  async identifyStruggleAreas(message: string): Promise<string[]> {
    try {
      const prompt = this.buildStruggleAreaPrompt(message);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseConceptsFromResponse(response);
    } catch (error) {
      console.error('Error identifying struggle areas:', error);
      return [];
    }
  }

  /**
   * Analyze the relevance of concepts to the current discussion
   * @param message The user's message
   * @param allConcepts All concepts that have been identified
   * @returns Map of concepts to their relevance scores (0-1)
   */
  async analyzeConceptRelevance(
    message: string,
    allConcepts: string[]
  ): Promise<Map<string, number>> {
    try {
      const relevanceMap = new Map<string, number>();
      
      if (allConcepts.length === 0) {
        return relevanceMap;
      }
      
      const prompt = this.buildRelevanceAnalysisPrompt(message, allConcepts);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseRelevanceScores(response, allConcepts);
    } catch (error) {
      console.error('Error analyzing concept relevance:', error);
      
      // Default to medium relevance for all concepts in case of error
      const relevanceMap = new Map<string, number>();
      allConcepts.forEach(concept => relevanceMap.set(concept, 0.5));
      return relevanceMap;
    }
  }
  
  /**
   * Organize concepts into a hierarchical structure
   * @param concepts List of concepts to organize
   * @returns Hierarchical structure of concepts
   */
  async organizeConceptHierarchy(concepts: string[]): Promise<{
    root: string;
    hierarchy: Record<string, string[]>;
  }> {
    try {
      if (concepts.length <= 1) {
        return { root: concepts[0] || '', hierarchy: {} };
      }
      
      const prompt = this.buildHierarchyPrompt(concepts);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseHierarchyFromResponse(response, concepts);
    } catch (error) {
      console.error('Error organizing concept hierarchy:', error);
      // Return a flat hierarchy with the first concept as root
      const hierarchy: Record<string, string[]> = {};
      const root = concepts[0] || '';
      
      hierarchy[root] = concepts.slice(1);
      return { root, hierarchy };
    }
  }

  /**
   * Map a concept to prerequisite concepts the user should understand
   * @param concept The main concept
   * @returns Array of prerequisite concepts
   */
  async identifyPrerequisiteConcepts(concept: string): Promise<string[]> {
    try {
      const prompt = this.buildPrerequisitePrompt(concept);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseConceptsFromResponse(response);
    } catch (error) {
      console.error('Error identifying prerequisite concepts:', error);
      return [];
    }
  }

  /**
   * Build a prompt for concept extraction
   */
  private buildConceptExtractionPrompt(message: string): string {
    return `
Extract the key technical concepts or topics from the following message. 
Return ONLY a JSON array of strings, with each string being a concept.
Focus on AI, programming, and tech education concepts. Normalize concept names to their standard form.
Be specific and precise - extract both high-level concepts and specific sub-concepts.

User message:
${message}

Format your response exactly like this: ["concept1", "concept2", "concept3"]
`;
  }
  
  /**
   * Build a prompt for structured concept extraction
   */
  private buildStructuredConceptPrompt(message: string): string {
    return `
Extract the key technical concepts from the following message with their categories and importance.
Focus on AI, programming, and tech education concepts.

User message:
${message}

For each concept:
1. Extract the standard form of the concept
2. Categorize it (e.g., programming_fundamentals, web_development, machine_learning, etc.)
3. Assign an importance value from 0 to 1 based on how central it is to the user's question

Format your response as a JSON array of objects with the following structure:
[
  {
    "concept": "string",
    "category": "string",
    "importance": number
  }
]
`;
  }
  
  /**
   * Build a prompt for misconception identification
   */
  private buildMisconceptionPrompt(message: string, conceptList: string): string {
    return `
Analyze the following user message for potential misconceptions about these concepts: ${conceptList}

User message:
${message}

Identify any misconceptions, misunderstandings, or incorrect assumptions the user might have.
For each one, provide:
1. The specific misconception
2. The correct understanding
3. A confidence level (0-1) of how certain you are this is a misconception

Format your response as a JSON array of objects:
[
  {
    "misconception": "string describing the misconception",
    "correction": "string describing the correct understanding",
    "confidenceLevel": number between 0 and 1
  }
]

If no clear misconceptions are present, return an empty array: []
`;
  }

  /**
   * Build a prompt for identifying struggle areas
   */
  private buildStruggleAreaPrompt(message: string): string {
    return `
Based on the following user message, identify technical concepts or topics the user appears to be struggling with or confused about.
Return ONLY a JSON array of strings, with each string being a concept the user is likely struggling with.

User message:
${message}

Format your response exactly like this: ["concept1", "concept2", "concept3"]
`;
  }

  /**
   * Build a prompt for relevance analysis
   */
  private buildRelevanceAnalysisPrompt(message: string, concepts: string[]): string {
    return `
Analyze the relevance of the following concepts to this user message:
User message: ${message}

Concepts: ${concepts.join(", ")}

For each concept, assign a relevance score between 0 and 1, where:
- 0 means completely irrelevant to the discussion
- 1 means highly relevant and central to the discussion

Return your response as a JSON object with concepts as keys and scores as values.
Format your response exactly like this: {"concept1": 0.8, "concept2": 0.3, "concept3": 0.9}
`;
  }
  
  /**
   * Build a prompt for concept hierarchy organization
   */
  private buildHierarchyPrompt(concepts: string[]): string {
    return `
Organize the following concepts into a hierarchical structure:
${concepts.join(", ")}

Determine which concept is the most general or foundational, and show how the other concepts relate to it.
For each concept, list the concepts that are direct children or subtopics of it.

Format your response as a JSON object with:
1. "root" - the most general/foundational concept
2. "hierarchy" - an object where keys are concepts and values are arrays of direct child concepts

Example format:
{
  "root": "most general concept",
  "hierarchy": {
    "concept1": ["child1", "child2"],
    "child1": ["grandchild1"]
  }
}
`;
  }
  
  /**
   * Build a prompt for prerequisite concept identification
   */
  private buildPrerequisitePrompt(concept: string): string {
    return `
Identify the prerequisite concepts that someone should understand before learning about:
${concept}

List the key concepts that form the foundation for understanding ${concept}, ordered from most basic to most advanced.
These should be concepts that directly support understanding ${concept}.

Format your response as a JSON array of strings: ["prerequisite1", "prerequisite2", "prerequisite3"]
`;
  }

  /**
   * Parse concepts from the LLM response
   */
  private parseConceptsFromResponse(response: string): string[] {
    try {
      // Clean the response to ensure it's valid JSON
      const jsonStr = response.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the JSON array
      const concepts = JSON.parse(jsonStr);
      
      // Verify it's an array and filter out any non-string values
      if (Array.isArray(concepts)) {
        return concepts
          .filter(concept => typeof concept === 'string')
          .map(concept => concept.trim().toLowerCase())
          .filter(concept => concept.length > 0);
      }
      
      throw new Error('Response was not a valid array');
    } catch (error) {
      console.error('Error parsing concepts from response:', error);
      
      // Try a more aggressive approach to extract concepts
      const matches = response.match(/["']([^"']+)["']/g);
      if (matches) {
        return matches
          .map(match => match.replace(/["']/g, '').trim().toLowerCase())
          .filter(concept => concept.length > 0);
      }
      
      return [];
    }
  }
  
  /**
   * Parse structured concepts from the LLM response
   */
  private parseStructuredConceptsFromResponse(response: string): Array<{
    concept: string;
    category: string;
    importance: number;
  }> {
    try {
      // Clean the response to ensure it's valid JSON
      const jsonStr = response.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the JSON array
      const parsedResponse = JSON.parse(jsonStr);
      
      // Verify it's an array
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response was not a valid array');
      }
      
      // Process each concept object
      return parsedResponse
        .filter(item => 
          typeof item === 'object' && 
          typeof item.concept === 'string' && 
          item.concept.trim().length > 0
        )
        .map(item => ({
          concept: item.concept.trim().toLowerCase(),
          category: typeof item.category === 'string' 
            ? item.category.trim().toLowerCase() 
            : this.guessConceptCategory(item.concept),
          importance: typeof item.importance === 'number' 
            ? Math.max(0, Math.min(1, item.importance)) 
            : 0.7
        }));
    } catch (error) {
      console.error('Error parsing structured concepts from response:', error);
      return [];
    }
  }
  
  /**
   * Parse misconceptions from the LLM response
   */
  private parseMisconceptionsFromResponse(response: string): Array<{
    misconception: string;
    correction: string;
    confidenceLevel: number;
  }> {
    try {
      // Clean the response to ensure it's valid JSON
      const jsonStr = response.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the JSON array
      const parsedResponse = JSON.parse(jsonStr);
      
      // Verify it's an array
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response was not a valid array');
      }
      
      // Process each misconception object
      return parsedResponse
        .filter(item => 
          typeof item === 'object' && 
          typeof item.misconception === 'string' && 
          typeof item.correction === 'string' &&
          item.misconception.trim().length > 0 &&
          item.correction.trim().length > 0
        )
        .map(item => ({
          misconception: item.misconception.trim(),
          correction: item.correction.trim(),
          confidenceLevel: typeof item.confidenceLevel === 'number' 
            ? Math.max(0, Math.min(1, item.confidenceLevel)) 
            : 0.5
        }));
    } catch (error) {
      console.error('Error parsing misconceptions from response:', error);
      return [];
    }
  }

  /**
   * Parse relevance scores from the LLM response
   */
  private parseRelevanceScores(response: string, concepts: string[]): Map<string, number> {
    const relevanceMap = new Map<string, number>();
    
    try {
      // Clean the response to ensure it's valid JSON
      const jsonStr = response.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the JSON object
      const scores = JSON.parse(jsonStr);
      
      // Process each concept
      for (const concept of concepts) {
        const normalizedConcept = concept.trim().toLowerCase();
        
        // Check if concept exists in the response
        if (scores[concept] !== undefined) {
          // Ensure the score is a number between 0 and 1
          let score = parseFloat(scores[concept]);
          score = isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
          relevanceMap.set(normalizedConcept, score);
        } else {
          // Default to medium relevance if not found
          relevanceMap.set(normalizedConcept, 0.5);
        }
      }
    } catch (error) {
      console.error('Error parsing relevance scores:', error);
      
      // Default to medium relevance for all concepts
      concepts.forEach(concept => {
        relevanceMap.set(concept.trim().toLowerCase(), 0.5);
      });
    }
    
    return relevanceMap;
  }
  
  /**
   * Parse hierarchy from the LLM response
   */
  private parseHierarchyFromResponse(
    response: string, 
    concepts: string[]
  ): { root: string; hierarchy: Record<string, string[]> } {
    try {
      // Clean the response to ensure it's valid JSON
      const jsonStr = response.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the JSON object
      const parsedResponse = JSON.parse(jsonStr);
      
      // Verify structure
      if (typeof parsedResponse !== 'object' || 
          typeof parsedResponse.root !== 'string' || 
          typeof parsedResponse.hierarchy !== 'object') {
        throw new Error('Response was not in the expected format');
      }
      
      return {
        root: parsedResponse.root.trim().toLowerCase(),
        hierarchy: Object.fromEntries(
          Object.entries(parsedResponse.hierarchy).map(([key, value]) => [
            key.trim().toLowerCase(),
            Array.isArray(value) 
              ? value.map((v: any) => typeof v === 'string' ? v.trim().toLowerCase() : '')
                .filter((v: string) => v.length > 0)
              : []
          ])
        )
      };
    } catch (error) {
      console.error('Error parsing hierarchy from response:', error);
      
      // Return a flat hierarchy with the first concept as root
      const hierarchy: Record<string, string[]> = {};
      const root = concepts[0] || '';
      
      hierarchy[root] = concepts.slice(1);
      return { root, hierarchy };
    }
  }

  /**
   * Fallback method for concept extraction in case the LLM fails
   */
  private fallbackConceptExtraction(message: string): string[] {
    // Simple keyword matching
    const keywords = [
      'neural network', 'deep learning', 'machine learning', 'ai', 'artificial intelligence',
      'nlp', 'natural language processing', 'computer vision', 'reinforcement learning',
      'supervised learning', 'unsupervised learning', 'dataset', 'training', 'model',
      'algorithm', 'python', 'tensorflow', 'pytorch', 'keras', 'javascript', 'react',
      'node.js', 'express', 'database', 'api', 'programming', 'coding', 'function',
      'variable', 'class', 'object', 'framework', 'library', 'frontend', 'backend',
      'fullstack', 'development', 'software', 'application', 'web', 'mobile'
    ];
    
    const normalizedMessage = message.toLowerCase();
    
    return keywords.filter(keyword => normalizedMessage.includes(keyword.toLowerCase()));
  }
  
  /**
   * Guess a category for a concept based on keywords
   */
  private guessConceptCategory(concept: string): string {
    const conceptLower = concept.toLowerCase();
    
    const categoryKeywords: Record<string, string[]> = {
      'programming_fundamentals': ['variable', 'function', 'loop', 'conditional', 'algorithm', 'data type', 'class', 'object'],
      'web_development': ['html', 'css', 'javascript', 'dom', 'http', 'react', 'angular', 'vue', 'frontend', 'backend'],
      'data_science': ['data', 'statistics', 'visualization', 'pandas', 'numpy', 'r', 'tableau', 'analysis'],
      'machine_learning': ['neural', 'ai', 'deep learning', 'model', 'training', 'reinforcement', 'supervised', 'unsupervised'],
      'software_engineering': ['architecture', 'design pattern', 'testing', 'agile', 'scrum', 'ci/cd', 'version control', 'git'],
      'computer_science': ['algorithm', 'data structure', 'complexity', 'compiler', 'operating system', 'memory', 'theory'],
      'cloud_computing': ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'container', 'docker', 'kubernetes'],
      'databases': ['sql', 'nosql', 'query', 'index', 'schema', 'mongodb', 'postgres', 'mysql', 'database'],
      'dev_ops': ['ci/cd', 'deployment', 'pipeline', 'jenkins', 'ansible', 'terraform', 'infrastructure'],
      'mobile_development': ['android', 'ios', 'swift', 'kotlin', 'flutter', 'react native', 'mobile'],
      'security': ['authentication', 'authorization', 'encryption', 'security', 'vulnerability', 'hashing']
    };
    
    // Check each category's keywords
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => conceptLower.includes(keyword))) {
        return category;
      }
    }
    
    // Default to programming fundamentals if no match
    return 'programming_fundamentals';
  }

  /**
   * Retrieves related concepts for a given concept
   */
  async getRelatedConcepts(
    conceptId: string,
    relationshipTypes: ('prerequisite' | 'related' | 'builds-on' | 'example-of')[] = ['related']
  ): Promise<string[]> {
    try {
      // TODO: Implement database interaction to retrieve concept relationships
      // For now, return mock data
      
      // Sample concept relationships
      const mockRelationships: Record<string, string[]> = {
        'neural networks': ['deep learning', 'artificial intelligence', 'supervised learning'],
        'backpropagation': ['gradient descent', 'neural networks', 'loss function'],
        'gradient descent': ['optimization', 'loss function', 'learning rate'],
        'computer vision': ['convolutional neural networks', 'object detection', 'image classification'],
        'natural language processing': ['transformers', 'word embeddings', 'attention mechanism']
      };
      
      return mockRelationships[conceptId.toLowerCase()] || await this.generateRelatedConcepts(conceptId);
    } catch (error) {
      console.error('Error retrieving related concepts:', error);
      return [];
    }
  }
  
  /**
   * Generate related concepts using LLM when not found in database
   */
  private async generateRelatedConcepts(concept: string): Promise<string[]> {
    try {
      const prompt = `
Generate a list of concepts closely related to: ${concept}
Return only a JSON array of strings with related concepts.
Format your response exactly like this: ["related1", "related2", "related3"]
`;
      
      const response = await this.deepSeekService.generateResponse(prompt);
      return this.parseConceptsFromResponse(response);
    } catch (error) {
      console.error('Error generating related concepts:', error);
      return [];
    }
  }

  /**
   * Retrieves the relationships for a given concept
   */
  async getConceptRelationships(conceptId: string): Promise<ConceptRelationship[]> {
    try {
      // TODO: Implement database interaction to retrieve concept relationships
      // For now, generate using LLM
      
      return this.generateConceptRelationships(conceptId);
    } catch (error) {
      console.error('Error retrieving concept relationships:', error);
      return [];
    }
  }
  
  /**
   * Generate concept relationships using LLM
   */
  private async generateConceptRelationships(concept: string): Promise<ConceptRelationship[]> {
    try {
      const prompt = `
Identify key relationships between "${concept}" and other concepts.
For each relationship, specify:
1. The related concept
2. The relationship type (prerequisite, related, builds-on, example-of)
3. A brief description of the relationship

Return your response as a JSON array of relationship objects.
`;
      
      const response = await this.deepSeekService.generateResponse(prompt);
      
      try {
        // Parse the response
        const jsonStr = response.trim()
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        const relationships = JSON.parse(jsonStr);
        
        if (Array.isArray(relationships)) {
          return relationships
            .filter(r => 
              typeof r === 'object' && 
              typeof r.relatedConcept === 'string' && 
              typeof r.relationshipType === 'string'
            )
            .map(r => ({
              sourceConcept: concept.toLowerCase(),
              targetConcept: r.relatedConcept.toLowerCase(),
              relationshipType: r.relationshipType.toLowerCase(),
              description: r.description || ''
            }));
        }
      } catch (parseError) {
        console.error('Error parsing concept relationships:', parseError);
      }
      
      return [];
    } catch (error) {
      console.error('Error generating concept relationships:', error);
      return [];
    }
  }

  /**
   * Adds a new concept relationship to the knowledge base
   */
  async addConceptRelationship(relationship: ConceptRelationship): Promise<void> {
    try {
      // TODO: Implement database interaction to add concept relationship
      console.log('Added concept relationship:', relationship);
    } catch (error) {
      console.error('Error adding concept relationship:', error);
      throw new Error('Failed to add concept relationship');
    }
  }

  /**
   * Generate an embedding vector for a concept
   */
  async generateConceptEmbedding(concept: string): Promise<number[]> {
    try {
      // TODO: Implement proper embedding generation
      // For now, just use a mock implementation
      return Array(128).fill(0).map(() => Math.random());
    } catch (error) {
      console.error('Error generating concept embedding:', error);
      return Array(128).fill(0);
    }
  }

  /**
   * Maps a user query to relevant concepts
   */
  async mapQueryToConcepts(query: string): Promise<Array<{ concept: string, relevance: number }>> {
    try {
      // Extract concepts from the query
      const concepts = await this.extractConcepts(query);
      
      // For each concept, assign a relevance score
      const structuredConcepts = await this.extractStructuredConcepts(query);
      
      // Combine results, preferring structured concepts when available
      const structuredMap = new Map(structuredConcepts.map(c => [c.concept, c.importance]));
      
      return concepts.map(concept => ({
        concept,
        relevance: structuredMap.has(concept) ? structuredMap.get(concept)! : 0.7
      }));
    } catch (error) {
      console.error('Error mapping query to concepts:', error);
      return [];
    }
  }
} 