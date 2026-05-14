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
    
    // 默认数据（干净状态）
    getDefaultData() {
        const now = Date.now();
        
        return {
            // 用户信息
            user: {
                username: 'admin',
                password: 'admin123',
                isLoggedIn: false
            },
            
            // 博客文章
            posts: [],
            
            // 网站设置
            settings: {
                siteName: 'Image Compressor',
                siteUrl: 'https://example.com',
                siteDesc: 'Free online image compressor, no upload required, privacy protected',
                features: {
                    comments: false,
                    analytics: true,
                    sitemap: true
                },
                friendLinks: []
            },
            
            // 访问统计数据
            analytics: {
                // 总访问数据
                totalViews: 0,
                totalVisitors: 0,
                totalCompressions: 0,
                totalBytesSaved: 0,
                totalOriginalBytes: 0,
                
                // 今日数据
                todayViews: 0,
                todayVisitors: 0,
                todayCompressions: 0,
                todayBytesSaved: 0,
                todayOriginalBytes: 0,
                
                // 平均数据
                avgCompressionRate: 0,
                avgTimeOnPage: 0,
                
                // 最近30天的数据趋势
                recentDays: [],
                
                // 最后访问日期（用于判断新的一天）
                lastVisitDate: null,
                
                // 今日访客记录（避免重复计数）
                todayVisitorsList: [],
                
                // 页面访问统计
                pageStats: {
                    'index.html': { views: 0, visitors: 0 },
                    'blog.html': { views: 0, visitors: 0 },
                    'blog-detail.html': { views: 0, visitors: 0 },
                    'help.html': { views: 0, visitors: 0 }
                },
                
                // 压缩格式统计
                compressionFormats: {
                    'jpeg': { count: 0, totalBytes: 0 },
                    'png': { count: 0, totalBytes: 0 },
                    'webp': { count: 0, totalBytes: 0 }
                },
                
                // 实时在线访客
                onlineVisitors: 0,
                onlineVisitorsList: [],
                
                // 热门文章
                popularPosts: [],
                
                // 来源统计
                sources: {
                    direct: 0,
                    search: 0,
                    social: 0,
                    referral: 0
                }
            }
        };
    },
    
    // 重置数据
    resetData() {
        localStorage.removeItem('imageCompressorData');
        this.setData(this.getDefaultData());
    },
    
    // 初始化数据
    init() {
        if (!localStorage.getItem('imageCompressorData')) {
            this.setData(this.getDefaultData());
        } else {
            // 检查数据是否需要更新
            const data = this.getData();
            if (!data.analytics) {
                this.resetData();
            }
        }
        // 检查是否需要重置日期统计
        this.checkNewDay();
    },
    
    // 检查是否是新的一天，重置每日统计
    checkNewDay() {
        const data = this.getData();
        const today = new Date().toDateString();
        
        if (data.analytics.lastVisitDate !== today) {
            // 新的一天，移动今日数据到历史
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dayName = yesterday.toLocaleDateString('en', { weekday: 'short' });
            
            // 移除最早的一天，添加昨天的数据
            if (data.analytics.recentDays.length >= 30) {
                data.analytics.recentDays.shift();
            }
            data.analytics.recentDays.push({
                date: dayName,
                fullDate: yesterday.toISOString().split('T')[0],
                views: data.analytics.todayViews,
                visitors: data.analytics.todayVisitors,
                compressions: data.analytics.todayCompressions,
                bytesSaved: data.analytics.todayBytesSaved
            });
            
            // 重置今日数据
            data.analytics.todayViews = 0;
            data.analytics.todayVisitors = 0;
            data.analytics.todayCompressions = 0;
            data.analytics.todayBytesSaved = 0;
            data.analytics.todayOriginalBytes = 0;
            data.analytics.todayVisitorsList = [];
            data.analytics.lastVisitDate = today;
            
            this.setData(data);
        }
    },
    
    // 记录页面访问
    recordPageView(page = 'index.html') {
        const data = this.getData();
        const visitorId = this.getVisitorId();
        const now = Date.now();
        
        // 初始化 analytics 对象
        if (!data.analytics) data.analytics = {};
        if (!data.analytics.pageStats) data.analytics.pageStats = {};
        if (!data.analytics.todayVisitorsList) data.analytics.todayVisitorsList = [];
        if (!data.analytics.onlineVisitorsList) data.analytics.onlineVisitorsList = [];
        
        // 初始化数值字段
        if (data.analytics.totalViews === undefined) data.analytics.totalViews = 0;
        if (data.analytics.todayViews === undefined) data.analytics.todayViews = 0;
        if (data.analytics.todayVisitors === undefined) data.analytics.todayVisitors = 0;
        if (data.analytics.totalVisitors === undefined) data.analytics.totalVisitors = 0;
        
        // 增加总访问和今日访问
        data.analytics.totalViews++;
        data.analytics.todayViews++;
        
        // 统计页面访问
        if (!data.analytics.pageStats[page]) {
            data.analytics.pageStats[page] = { views: 0, visitors: 0 };
        }
        data.analytics.pageStats[page].views++;
        
        // 检查是否是新访客
        if (!data.analytics.todayVisitorsList.includes(visitorId)) {
            data.analytics.todayVisitors++;
            data.analytics.totalVisitors++;
            data.analytics.todayVisitorsList.push(visitorId);
            
            // 页面新访客
            if (!data.analytics.pageStats[page].visitors) {
                data.analytics.pageStats[page].visitors = 0;
            }
            data.analytics.pageStats[page].visitors++;
        }
        
        // 更新在线访客
        this.updateOnlineVisitors();
        
        this.setData(data);
        return data.analytics;
    },
    
    // 更新在线访客
    updateOnlineVisitors() {
        const data = this.getData();
        const visitorId = this.getVisitorId();
        const now = Date.now();
        
        // 初始化
        if (!data.analytics.onlineVisitorsList) data.analytics.onlineVisitorsList = [];
        
        // 清理超时的访客（超过5分钟）
        data.analytics.onlineVisitorsList = data.analytics.onlineVisitorsList.filter(v => 
            now - v.lastActive < 5 * 60 * 1000
        );
        
        // 更新当前访客或添加
        const existingVisitor = data.analytics.onlineVisitorsList.find(v => v.id === visitorId);
        if (existingVisitor) {
            existingVisitor.lastActive = now;
        } else {
            data.analytics.onlineVisitorsList.push({
                id: visitorId,
                lastActive: now
            });
        }
        
        data.analytics.onlineVisitors = data.analytics.onlineVisitorsList.length;
        this.setData(data);
    },
    
    // 获取或创建访客ID
    getVisitorId() {
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
            visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitorId', visitorId);
        }
        return visitorId;
    },
    
    // 记录图片压缩
    recordCompression(originalSize, compressedSize, format = 'jpeg') {
        const data = this.getData();
        const bytesSaved = originalSize - compressedSize;
        
        data.analytics.totalCompressions++;
        data.analytics.todayCompressions++;
        data.analytics.totalBytesSaved += bytesSaved;
        data.analytics.todayBytesSaved += bytesSaved;
        data.analytics.totalOriginalBytes += originalSize;
        data.analytics.todayOriginalBytes += originalSize;
        
        // 统计压缩格式
        if (!data.analytics.compressionFormats[format]) {
            data.analytics.compressionFormats[format] = { count: 0, totalBytes: 0 };
        }
        data.analytics.compressionFormats[format].count++;
        data.analytics.compressionFormats[format].totalBytes += compressedSize;
        
        // 计算平均压缩率
        if (data.analytics.totalOriginalBytes > 0) {
            data.analytics.avgCompressionRate = Math.round(
                (data.analytics.totalBytesSaved / data.analytics.totalOriginalBytes) * 100
            );
        }
        
        this.setData(data);
        return bytesSaved;
    },
    
    // 按日期获取统计数据
    getStatsByDate(dateStr) {
        const data = this.getData();
        const analytics = data.analytics;
        
        const today = new Date().toISOString().split('T')[0];
        
        if (dateStr === today) {
            return {
                date: dateStr,
                views: analytics.todayViews,
                visitors: analytics.todayVisitors,
                compressions: analytics.todayCompressions,
                bytesSaved: analytics.todayBytesSaved,
                isToday: true
            };
        }
        
        const historicalData = analytics.recentDays.find(d => d.fullDate === dateStr);
        if (historicalData) {
            return {
                ...historicalData,
                isToday: false
            };
        }
        
        return {
            date: dateStr,
            views: 0,
            visitors: 0,
            compressions: 0,
            bytesSaved: 0,
            isToday: false,
            noData: true
        };
    },
    
    // 获取日期范围内的统计数据
    getStatsByDateRange(startDate, endDate) {
        const data = this.getData();
        const analytics = data.analytics;
        const today = new Date().toISOString().split('T')[0];
        
        const result = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);
        
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            if (dateStr === today) {
                result.push({
                    date: dateStr,
                    dayName: currentDate.toLocaleDateString('zh-CN', { weekday: 'short' }),
                    views: analytics.todayViews,
                    visitors: analytics.todayVisitors,
                    compressions: analytics.todayCompressions,
                    bytesSaved: analytics.todayBytesSaved
                });
            } else {
                const historicalData = analytics.recentDays.find(d => d.fullDate === dateStr);
                result.push({
                    date: dateStr,
                    dayName: currentDate.toLocaleDateString('zh-CN', { weekday: 'short' }),
                    views: historicalData?.views || 0,
                    visitors: historicalData?.visitors || 0,
                    compressions: historicalData?.compressions || 0,
                    bytesSaved: historicalData?.bytesSaved || 0
                });
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return result;
    },
    
    // 获取周汇总
    getWeeklySummary() {
        const data = this.getData();
        const analytics = data.analytics;
        
        const thisWeek = analytics.recentDays.slice(-7);
        const thisWeekViews = thisWeek.reduce((sum, day) => sum + (day.views || 0), 0);
        const thisWeekVisitors = thisWeek.reduce((sum, day) => sum + (day.visitors || 0), 0);
        const thisWeekCompressions = thisWeek.reduce((sum, day) => sum + (day.compressions || 0), 0);
        const thisWeekBytesSaved = thisWeek.reduce((sum, day) => sum + (day.bytesSaved || 0), 0);
        
        const lastWeek = analytics.recentDays.slice(-14, -7);
        const lastWeekViews = lastWeek.reduce((sum, day) => sum + (day.views || 0), 0);
        const lastWeekVisitors = lastWeek.reduce((sum, day) => sum + (day.visitors || 0), 0);
        
        const weekGrowth = lastWeekViews > 0 
            ? Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100) 
            : 0;
        
        return {
            thisWeek: { views: thisWeekViews, visitors: thisWeekVisitors, compressions: thisWeekCompressions, bytesSaved: thisWeekBytesSaved },
            lastWeek: { views: lastWeekViews, visitors: lastWeekVisitors },
            growth: weekGrowth
        };
    },
    
    // 获取月汇总
    getMonthlySummary() {
        const data = this.getData();
        const analytics = data.analytics;
        
        const thisMonth = analytics.recentDays.slice(-30);
        const thisMonthViews = thisMonth.reduce((sum, day) => sum + (day.views || 0), 0);
        const thisMonthVisitors = thisMonth.reduce((sum, day) => sum + (day.visitors || 0), 0);
        const thisMonthCompressions = thisMonth.reduce((sum, day) => sum + (day.compressions || 0), 0);
        const thisMonthBytesSaved = thisMonth.reduce((sum, day) => sum + (day.bytesSaved || 0), 0);
        
        const lastMonth = analytics.recentDays.slice(-60, -30);
        const lastMonthViews = lastMonth.reduce((sum, day) => sum + (day.views || 0), 0);
        const lastMonthVisitors = lastMonth.reduce((sum, day) => sum + (day.visitors || 0), 0);
        
        const monthGrowth = lastMonthViews > 0 
            ? Math.round(((thisMonthViews - lastMonthViews) / lastMonthViews) * 100) 
            : 0;
        
        return {
            thisMonth: { views: thisMonthViews, visitors: thisMonthVisitors, compressions: thisMonthCompressions, bytesSaved: thisMonthBytesSaved },
            lastMonth: { views: lastMonthViews, visitors: lastMonthVisitors },
            growth: monthGrowth
        };
    },
    
    // 获取详细统计数据
    getDetailedAnalytics() {
        const data = this.getData();
        const analytics = data.analytics;
        
        const last7Days = analytics.recentDays.slice(-7);
        const weekViews = last7Days.reduce((sum, day) => sum + (day.views || 0), 0);
        const weekVisitors = last7Days.reduce((sum, day) => sum + (day.visitors || 0), 0);
        const weekCompressions = last7Days.reduce((sum, day) => sum + (day.compressions || 0), 0);
        const weekBytesSaved = last7Days.reduce((sum, day) => sum + (day.bytesSaved || 0), 0);
        
        const topPages = Object.entries(analytics.pageStats)
            .sort((a, b) => b[1].views - a[1].views)
            .slice(0, 5)
            .map(([page, stats]) => ({ page, ...stats }));
        
        const topFormats = Object.entries(analytics.compressionFormats)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([format, data]) => ({ format, ...data }));
        
        const yesterday = analytics.recentDays[analytics.recentDays.length - 1] || { views: 0, visitors: 0, compressions: 0 };
        const trends = {
            views: analytics.todayViews - (yesterday.views || 0),
            visitors: analytics.todayVisitors - (yesterday.visitors || 0),
            compressions: analytics.todayCompressions - (yesterday.compressions || 0)
        };
        
        return {
            ...analytics,
            weekViews,
            weekVisitors,
            weekCompressions,
            weekBytesSaved,
            topPages,
            topFormats,
            trends,
            weeklySummary: this.getWeeklySummary(),
            monthlySummary: this.getMonthlySummary()
        };
    },
    
    // 获取统计数据
    getAnalytics() {
        return this.getData().analytics;
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
    
    // Convert blog post from bilingual JSON format to UI format
    _convertPost(post, lang) {
        const isZh = lang === 'zh';
        const title = typeof post.title === 'object' ? (isZh ? post.title.zh : post.title.en) : post.title;
        const excerpt = typeof post.excerpt === 'object' ? (isZh ? post.excerpt.zh : post.excerpt.en) : post.excerpt;
        const content = typeof post.content === 'object' ? (isZh ? post.content.zh : post.content.en) : post.content;
        const tags = Array.isArray(post.tags) ? post.tags : 
                     (typeof post.tags === 'object' ? (isZh ? post.tags.zh : post.tags.en) : []);
        
        // Normalize createdAt - might be ISO string or timestamp
        let createdAt = post.createdAt;
        if (typeof createdAt === 'string' && !isNaN(Date.parse(createdAt))) {
            createdAt = new Date(createdAt).getTime();
        }
        
        return {
            id: post.id,
            title: title || '',
            excerpt: excerpt || '',
            content: content || '',
            tags: tags || [],
            category: post.category || 'seo',
            status: post.status || 'published',
            createdAt: createdAt || Date.now()
        };
    },
    
    // Load blog posts from blogs.json (bilingual SEO articles)
    async loadBlogPosts() {
        try {
            const response = await fetch('blogs.json');
            if (!response.ok) return [];
            const data = await response.json();
            const posts = data.posts || [];
            const lang = localStorage.getItem('language') || 'en';
            return posts.map(p => this._convertPost(p, lang));
        } catch (e) {
            return [];
        }
    },
    
    // 博客文章
    async getPosts(onlyPublished = false) {
        // First try to load from blogs.json (bilingual SEO articles)
        const blogPosts = await this.loadBlogPosts();
        if (blogPosts.length > 0) {
            const published = blogPosts.filter(p => p.status === 'published');
            return onlyPublished ? published : blogPosts;
        }
        
        // Fallback to localStorage
        const data = this.getData();
        const posts = data.posts || [];
        if (onlyPublished) {
            return posts.filter(p => p.status === 'published');
        }
        return posts;
    },
    
    getPost(id) {
        const data = this.getData();
        const found = data.posts.find(p => p.id === id);
        if (found) return found;
        // Also search in blogs.json (sync - check cache if available)
        try {
            const cached = localStorage.getItem('blogPostsCache');
            if (cached) {
                const posts = JSON.parse(cached);
                return posts.find(p => p.id === id);
            }
        } catch(e) {}
        return null;
    },
    
    savePost(post) {
        const data = this.getData();
        if (!data.posts) data.posts = [];
        
        const existingIndex = data.posts.findIndex(p => p.id === post.id);
        if (existingIndex >= 0) {
            post.updatedAt = Date.now();
            data.posts[existingIndex] = post;
        } else {
            post.id = Date.now().toString();
            post.createdAt = Date.now();
            post.updatedAt = Date.now();
            if (!post.status) post.status = 'draft';
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
    }
};

// 工具函数
const Utils = {
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    },
    
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },
    
    formatPercent(num) {
        return num.toFixed(1) + '%';
    },
    
    formatTrend(num) {
        if (num > 0) return '+' + num;
        return num.toString();
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
