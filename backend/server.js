const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    }
}));
app.use(express.json());

// ============ C端计算逻辑（品牌/卖家） ============
function calculateCEndRevenue(price, monthlySales, category) {
    // 品类利润率配置
    const marginMap = {
        'beauty': 0.35,      // 美妆护肤 35%
        'clothing': 0.30,    // 服饰箱包 30%
        'home': 0.28,        // 家居生活 28%
        'electronics': 0.20, // 3C数码 20%
        'other': 0.25        // 其他 25%
    };

    const margin = marginMap[category];
    const sales = price * monthlySales;
    const profit = sales * margin;

    // 播放收益估算（每1000播放$0.60，按销售额1:10估算播放量）
    const estimatedViews = sales * 10;
    const rpm = 0.60;
    const viewRevenue = (estimatedViews / 1000) * rpm;

    return {
        sales: Math.round(sales),
        profit: Math.round(profit),
        viewRevenue: Math.round(viewRevenue),
        total: Math.round(profit + viewRevenue),
        margin: Math.round(margin * 100)
    };
}

// ============ B端计算逻辑（工厂/项目方） ============
function calculateBEndRevenue(productType, priceRange, hasVideo) {
    // 产品类型配置
    const productMap = {
        'parking_gate': {
            name: '停车场道闸',
            avgProjectValue: 15000,
            winRate: 0.20,
            inquiryRate: 2.5
        },
        'guidance_system': {
            name: '车位引导系统',
            avgProjectValue: 25000,
            winRate: 0.18,
            inquiryRate: 1.8
        },
        'lpr_camera': {
            name: '车牌识别摄像头',
            avgProjectValue: 8000,
            winRate: 0.25,
            inquiryRate: 3.0
        },
        'ev_charger': {
            name: '充电桩配套',
            avgProjectValue: 20000,
            winRate: 0.15,
            inquiryRate: 2.0
        },
        'other': {
            name: '其他软硬件',
            avgProjectValue: 12000,
            winRate: 0.18,
            inquiryRate: 2.0
        }
    };

    // 价格范围配置
    const priceMap = {
        '5k-10k': 7500,
        '10k-30k': 20000,
        '30k-50k': 40000,
        '50k+': 75000
    };

    const config = productMap[productType];
    const avgProjectValue = priceMap[priceRange];

    // 基础播放量5000，有视频素材+3000
    const baseViews = 5000;
    const videoBonus = hasVideo ? 3000 : 0;
    const estimatedViews = baseViews + videoBonus;

    // 计算各项指标
    const estimatedInquiries = (estimatedViews / 10000) * config.inquiryRate;
    const estimatedDeals = estimatedInquiries * config.winRate;
    const estimatedRevenue = estimatedDeals * avgProjectValue;
    const estimatedProfit = estimatedRevenue * 0.15; // B端保守取15%毛利

    return {
        productName: config.name,
        estimatedViews: Math.round(estimatedViews),
        estimatedInquiries: estimatedInquiries.toFixed(1),
        estimatedDeals: estimatedDeals.toFixed(1),
        estimatedRevenue: Math.round(estimatedRevenue),
        estimatedProfit: Math.round(estimatedProfit),
        avgProjectValue: Math.round(avgProjectValue),
        winRate: Math.round(config.winRate * 100)
    };
}

const cCategories = new Set(['beauty', 'clothing', 'home', 'electronics', 'other']);
const bProductTypes = new Set(['parking_gate', 'guidance_system', 'lpr_camera', 'ev_charger', 'other']);
const bPriceRanges = new Set(['5k-10k', '10k-30k', '30k-50k', '50k+']);

function trimText(value) {
    return String(value || '').trim();
}

// ============ API 端点 ============

// C端计算接口
app.get('/api/calculate/c', (req, res) => {
    const { price, monthlySales, category } = req.query;
    const companyName = trimText(req.query.companyName);
    const otherCategory = trimText(req.query.otherCategory);

    if (!companyName || !price || !monthlySales || !category) {
        return res.status(400).json({ error: '缺少必要参数' });
    }

    const parsedPrice = Number(price);
    const parsedMonthlySales = Number(monthlySales);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ error: '产品客单价必须大于 0' });
    }

    if (!Number.isInteger(parsedMonthlySales) || parsedMonthlySales < 0) {
        return res.status(400).json({ error: '预估月销量必须是 0 或正整数' });
    }

    if (!cCategories.has(category)) {
        return res.status(400).json({ error: '产品品类无效' });
    }

    if (category === 'other' && !otherCategory) {
        return res.status(400).json({ error: '请输入其他产品类型' });
    }

    const result = calculateCEndRevenue(parsedPrice, parsedMonthlySales, category);

    res.json({
        ...result,
        lead: {
            companyName,
            category,
            otherCategory: category === 'other' ? otherCategory : ''
        }
    });
});

// B端计算接口
app.get('/api/calculate/b', (req, res) => {
    const { productType, priceRange, hasVideo } = req.query;
    const companyName = trimText(req.query.companyName);
    const otherProductType = trimText(req.query.otherProductType);

    if (!companyName || !productType || !priceRange) {
        return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!bProductTypes.has(productType)) {
        return res.status(400).json({ error: '产品类型无效' });
    }

    if (!bPriceRanges.has(priceRange)) {
        return res.status(400).json({ error: '项目金额范围无效' });
    }

    if (productType === 'other' && !otherProductType) {
        return res.status(400).json({ error: '请输入其他产品类型' });
    }

    const result = calculateBEndRevenue(
        productType,
        priceRange,
        hasVideo === 'true'
    );

    res.json({
        ...result,
        lead: {
            companyName,
            productType,
            otherProductType: productType === 'other' ? otherProductType : ''
        }
    });
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 服务器已启动: http://localhost:${PORT}`);
    console.log(`📊 C端计算接口: http://localhost:${PORT}/api/calculate/c?price=29.99&monthlySales=500&category=beauty`);
    console.log(`🏭 B端计算接口: http://localhost:${PORT}/api/calculate/b?productType=parking_gate&priceRange=10k-30k&hasVideo=true`);
});
