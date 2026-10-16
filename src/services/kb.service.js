import { MOCK_KB_ARTICLES, MOCK_FAQS, getSuggestedArticles } from '../data/mock/kb.mock.js';

let articles = [...MOCK_KB_ARTICLES];

export const kbService = {
  async getArticles() {
    return { data: articles, total: articles.length };
  },

  async getCategories() {
    const cats = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    return { data: ['All', ...cats] };
  },

  async getArticleById(id) {
    const found = articles.find((a) => a.id === id);
    if (!found) {
      // Fallback to first article if id not matched
      return { data: articles[0] };
    }
    return { data: found };
  },

  async searchArticles(query = '') {
    if (!query) {
      return { data: articles };
    }
    const filtered = getSuggestedArticles(query);
    return { data: filtered.length ? filtered : articles.slice(0, 4) };
  },

  async rateArticle(id, isHelpful) {
    const art = articles.find((a) => a.id === id);
    if (art) {
      art.helpfulCount = (art.helpfulCount || 10) + (isHelpful ? 1 : 0);
    }
    return { success: true };
  },

  async createArticle(articleData) {
    const newArt = {
      id: `KB-AFD-${Date.now().toString().slice(-4)}`,
      title: articleData.title,
      category: articleData.category || 'General',
      excerpt: articleData.excerpt || articleData.content?.slice(0, 100),
      content: articleData.content || '',
      tags: articleData.tags || ['AFD'],
      author: articleData.author || 'Helpdesk Admin',
      updatedAt: new Date().toISOString().split('T')[0],
      views: 0,
      helpfulCount: 0
    };
    articles.unshift(newArt);
    return { success: true, data: newArt };
  },

  async getFaqs() {
    return { data: MOCK_FAQS };
  }
};

export default kbService;
