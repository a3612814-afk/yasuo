// 数据存储管理模块
const Storage = {
    // 获取本地存储数据
    getData() {
        try {
            return JSON.parse(localStorage.getItem('imageCompressorData')) || this.getDefaultData();
        } catch (e) {
            return this.getDefaultData();
        }
    },
    
    // 保存数据
    setData(data) {
        localStorage.setItem('imageCompressorData', JSON.stringify(data));
    },
    
    // 默认数据
    getDefaultData() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        return {
            // 用户信息
            user: {
                username: 'admin',
                password: 'admin123',
                isLoggedIn: false
            },
            
            // 博客文章
            posts: [
                {
                    id: '1',
                    title: '如何压缩图片而不损失画质：完整指南',
                    excerpt: '了解JPG、PNG、WebP等格式的压缩原理，学习在不明显降低画质的前提下减小图片体积',
                    content: '这里是文章内容，支持Markdown...',
                    category: 'image-optimize',
                    tags: ['图片优化', '网站速度', 'SEO'],
                    status: 'published',
                    createdAt: now - 5 * oneDay,
                    updatedAt: now - 5 * oneDay
                },
                {
                    id: '2',
                    title: '网页性能优化：图片压缩的10个最佳实践',
                    excerpt: '从懒加载到CDN分发，本文介绍10种经过验证的图片优化技术',
                    content: '详细内容...',
                    category: 'frontend',
                    tags: ['前端优化', '用户体验', '性能'],
                    status: 'published',
                    createdAt: now - 4 * oneDay,
                    updatedAt: now - 4 * oneDay
                },
                {
                    id: '3',
                    title: 'WebP vs PNG vs JPG：哪种图片格式最适合你的网站',
                    excerpt: '深度对比三种主流图片格式的优缺点',
                    content: '对比分析...',
                    category: 'tech',
                    tags: ['图片格式', 'WebP', '技术对比'],
                    status: 'published',
                    createdAt: now - 3 * oneDay,
                    updatedAt: now - 3 * oneDay
                },
                {
                    id: '4',
                    title: 'Google PageSpeed Insights 图片优化建议解读',
                    excerpt: '详细解析PageSpeed Insights中与图片相关的评分因素',
                    content: '详细解析...',
                    category: 'seo',
                    tags: ['PageSpeed', 'Google SEO', '评分优化'],
                    status: 'published',
                    createdAt: now - 2 * oneDay,
                    updatedAt: now - 2 * oneDay
                },
                {
                    id: '5',
                    title: '电商网站图片优化策略（草稿）',
                    excerpt: '产品图片是电商转化的关键...',
                    content: '草稿内容...',
                    category: 'ecommerce',
                    tags: ['电商', '转化率', '产品图片'],
                    status: 'draft',
                    createdAt: now - 1 * oneDay,
                    updatedAt: now - 1 * oneDay
                }
            ],
            
            // 网站设置
            settings: {
                siteName: '图压缩',
                siteUrl: 'https://example.com',
                siteDesc: '免费在线图片压缩器，无需上传本地处理，保护隐私',
                features: {
                    comments: false,
                    analytics: true,
                    sitemap: true
                },
                friendLinks: [
                    { name: '图床服务', url: 'https://www.example.com' },
                    { name: '设计资源', url: 'https://www.example.com' },
                    { name: '前端工具', url: 'https://www.example.com' },
                    { name: '开发者社区', url: 'https://www.example.com' }
                ]
            },
            
            // 访问数据（模拟）
            analytics: {
                todayViews: 1284,
                todayVisitors: 326,
                avgTimeOnSite: '2:34',
                bounceRate: 32.8,
                recentDays: [
                    { date: '周一', views: 800 },
                    { date: '周二', views: 950 },
                    { date: '周三', views: 700 },
                    { date: '周四', views: 1100 },
                    { date: '周五', views: 900 },
                    { date: '周六', views: 1200 },
                    { date: '周日', views: 1400 }
                ]
            }
        };
    },
    
    // 初始化数据
    init() {
        if (!localStorage.getItem('imageCompressorData')) {
            this.setData(this.getDefaultData());
        }
    },
    
    // 用户相关
    login(username, password) {
        const data = this.getData();
        if (data.user.username === username && data.user.password === password) {
            data.user.isLoggedIn = true;
            this.setData(data);
            return true;
        }
        return false;
    },
    
    logout() {
        const data = this.getData();
        data.user.isLoggedIn = false;
        this.setData(data);
    },
    
    isLoggedIn() {
        const data = this.getData();
        return data.user.isLoggedIn;
    },
    
    // 博客文章
    getPosts(onlyPublished = false) {
        const data = this.getData();
        if (onlyPublished) {
            return data.posts.filter(p => p.status === 'published');
        }
        return data.posts;
    },
    
    getPost(id) {
        const data = this.getData();
        return data.posts.find(p => p.id === id);
    },
    
    savePost(post) {
        const data = this.getData();
        const existingIndex = data.posts.findIndex(p => p.id === post.id);
        if (existingIndex >= 0) {
            post.updatedAt = Date.now();
            data.posts[existingIndex] = post;
        } else {
            post.id = Date.now().toString();
            post.createdAt = Date.now();
            post.updatedAt = Date.now();
            data.posts.unshift(post);
        }
        this.setData(data);
        return post;
    },
    
    deletePost(id) {
        const data = this.getData();
        data.posts = data.posts.filter(p => p.id !== id);
        this.setData(data);
    },
    
    // 设置
    getSettings() {
        return this.getData().settings;
    },
    
    saveSettings(settings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...settings };
        this.setData(data);
    },
    
    // 分析数据
    getAnalytics() {
        return this.getData().analytics;
    }
};

// 工具函数
const Utils = {
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}年${month}月${day}日`;
    },
    
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    },
    
    getCategoryName(category) {
        const map = {
            'image-optimize': '图片优化',
            'frontend': '前端优化',
            'seo': 'SEO',
            'tech': '技术对比',
            'ecommerce': '电商'
        };
        return map[category] || category;
    }
};

// 初始化
Storage.init();
