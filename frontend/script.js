const marginMap = {
    beauty: { label: '美妆护肤', margin: 0.35 },
    clothing: { label: '服饰箱包', margin: 0.30 },
    home: { label: '家居生活', margin: 0.28 },
    electronics: { label: '3C 数码', margin: 0.20 },
    pet: { label: '宠物用品', margin: 0.32 },
    sports: { label: '运动户外', margin: 0.27 },
    baby: { label: '母婴用品', margin: 0.26 },
    food: { label: '食品饮料', margin: 0.24 },
    jewelry: { label: '饰品配件', margin: 0.38 },
    auto: { label: '汽车用品', margin: 0.25 },
    tools: { label: '工具五金', margin: 0.22 },
    stationery: { label: '文具办公', margin: 0.29 },
    other: { label: '其他', margin: 0.25 }
};

const bProductMap = {
    parking_gate: { label: '停车场道闸', projectInquiryRate: 2.5, batchInquiryRate: 3.0, winRate: 0.20, orderRate: 0.16, grossMargin: 0.15 },
    guidance_system: { label: '车位引导系统', projectInquiryRate: 1.8, batchInquiryRate: 2.2, winRate: 0.18, orderRate: 0.14, grossMargin: 0.15 },
    lpr_camera: { label: '车牌识别摄像头', projectInquiryRate: 2.2, batchInquiryRate: 3.8, winRate: 0.25, orderRate: 0.22, grossMargin: 0.18 },
    ev_charger: { label: '充电桩配套', projectInquiryRate: 2.0, batchInquiryRate: 2.4, winRate: 0.15, orderRate: 0.12, grossMargin: 0.15 },
    packaging: { label: '包装材料', projectInquiryRate: 1.8, batchInquiryRate: 4.5, winRate: 0.22, orderRate: 0.28, grossMargin: 0.16 },
    cable: { label: '线缆', projectInquiryRate: 1.6, batchInquiryRate: 3.6, winRate: 0.20, orderRate: 0.24, grossMargin: 0.14 },
    transformer: { label: '互感器', projectInquiryRate: 1.5, batchInquiryRate: 2.4, winRate: 0.16, orderRate: 0.18, grossMargin: 0.18 },
    sensor: { label: '传感器', projectInquiryRate: 1.7, batchInquiryRate: 3.2, winRate: 0.18, orderRate: 0.22, grossMargin: 0.20 },
    industrial_parts: { label: '工业零部件', projectInquiryRate: 1.6, batchInquiryRate: 2.9, winRate: 0.17, orderRate: 0.20, grossMargin: 0.17 },
    machinery: { label: '机械设备', projectInquiryRate: 1.4, batchInquiryRate: 1.8, winRate: 0.14, orderRate: 0.10, grossMargin: 0.16 },
    solar_storage: { label: '光伏储能配套', projectInquiryRate: 1.7, batchInquiryRate: 2.1, winRate: 0.15, orderRate: 0.12, grossMargin: 0.15 },
    security: { label: '安防设备', projectInquiryRate: 1.9, batchInquiryRate: 3.3, winRate: 0.19, orderRate: 0.21, grossMargin: 0.18 },
    led_lighting: { label: 'LED 照明', projectInquiryRate: 2.0, batchInquiryRate: 4.0, winRate: 0.21, orderRate: 0.24, grossMargin: 0.17 },
    other: { label: '其他软硬件', projectInquiryRate: 1.8, batchInquiryRate: 3.0, winRate: 0.18, orderRate: 0.18, grossMargin: 0.16 }
};

const bModelTraffic = {
    project: { baseViews: 5000, videoBonus: 3000 },
    batch: { baseViews: 9000, videoBonus: 4500 }
};

const priceRangeOptions = {
    project: [
        { value: '', label: '请选择', amount: 0 },
        { value: '10k-30k', label: '$10,000 - $30,000', amount: 20000 },
        { value: '30k-50k', label: '$30,000 - $50,000', amount: 40000 },
        { value: '50k-100k', label: '$50,000 - $100,000', amount: 75000 },
        { value: '100k+', label: '$100,000 以上', amount: 150000 }
    ],
    batch: [
        { value: '', label: '请选择', amount: 0 },
        { value: '500-1k', label: '$500 - $1,000', amount: 750 },
        { value: '1k-3k', label: '$1,000 - $3,000', amount: 2000 },
        { value: '3k-5k', label: '$3,000 - $5,000', amount: 4000 },
        { value: '5k-10k', label: '$5,000 - $10,000', amount: 7500 }
    ]
};

let currentLead = null;

const modeSelector = document.getElementById('modeSelector');
const cEndForm = document.getElementById('cEndForm');
const bEndForm = document.getElementById('bEndForm');
const guideModal = document.getElementById('guideModal');
const guideContent = document.getElementById('guideContent');

function getValue(id) {
    return document.getElementById(id).value.trim();
}

function formatMoney(value) {
    return `$${Math.round(value).toLocaleString()}`;
}

function showError(message) {
    alert(message);
}

function showModeSelector() {
    modeSelector.classList.add('active');
    cEndForm.classList.remove('active');
    bEndForm.classList.remove('active');
}

function showCEndForm() {
    modeSelector.classList.remove('active');
    cEndForm.classList.add('active');
    bEndForm.classList.remove('active');
    document.getElementById('cResult').hidden = true;
}

function showBEndForm() {
    modeSelector.classList.remove('active');
    cEndForm.classList.remove('active');
    bEndForm.classList.add('active');
    document.getElementById('bResult').hidden = true;
}

function toggleConditionalField(selectId, groupId) {
    const shouldShow = document.getElementById(selectId).value === 'other';
    const group = document.getElementById(groupId);
    group.hidden = !shouldShow;

    if (!shouldShow) {
        const input = group.querySelector('input');
        if (input) input.value = '';
    }
}

function saveLeadSnapshot(lead) {
    currentLead = {
        ...lead,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('latestTikTokCalculatorLead', JSON.stringify(currentLead));
}

function calculateCEndRevenue(price, monthlySales, category) {
    const config = marginMap[category];
    const sales = price * monthlySales;
    const profit = sales * config.margin;
    const estimatedViews = sales * 10;
    const viewRevenue = (estimatedViews / 1000) * 0.6;

    return {
        sales: Math.round(sales),
        profit: Math.round(profit),
        viewRevenue: Math.round(viewRevenue),
        total: Math.round(profit + viewRevenue),
        margin: Math.round(config.margin * 100),
        categoryLabel: config.label
    };
}

function getPriceRangeAmount(model, value) {
    return priceRangeOptions[model].find(option => option.value === value)?.amount || 0;
}

function calculateBEndRevenue(productType, priceRange, hasVideo, selectedModel) {
    const config = bProductMap[productType];
    const trafficConfig = bModelTraffic[selectedModel];
    const avgProjectValue = getPriceRangeAmount(selectedModel, priceRange);
    const estimatedViews = trafficConfig.baseViews + (hasVideo ? trafficConfig.videoBonus : 0);
    const estimatedInquiries = hasVideo ? 57 : 26;
    const conversionRate = selectedModel === 'project' ? config.winRate : config.orderRate;
    const estimatedDeals = estimatedInquiries * conversionRate;
    const estimatedRevenue = estimatedDeals * avgProjectValue;

    return {
        productLabel: config.label,
        dealModel: selectedModel,
        estimatedViews: Math.round(estimatedViews),
        estimatedInquiries: estimatedInquiries.toFixed(0),
        estimatedDeals: estimatedDeals.toFixed(1),
        estimatedRevenue: Math.round(estimatedRevenue),
        estimatedProfit: Math.round(estimatedRevenue * config.grossMargin),
        avgProjectValue: Math.round(avgProjectValue),
        conversionRate: Math.round(conversionRate * 100),
        grossMargin: Math.round(config.grossMargin * 100)
    };
}

function renderResult(container, rows, mode) {
    container.hidden = false;
    container.innerHTML = `
        ${rows.map(row => `
            <div class="result-item ${row.large ? 'result-total' : ''}">
                <span class="result-label">${row.label}</span>
                <span class="result-value ${row.highlight ? 'highlight' : ''} ${row.large ? 'large' : ''}">${row.value}</span>
            </div>
        `).join('')}
        <button class="cta-btn" type="button" data-guide="${mode}">查看避坑指南</button>
        <div class="note-text">* 以上为前端模型估算，适合做方案初筛；真实结果会受内容质量、投放节奏和供应链履约影响。</div>
    `;
}

function renderBPriceRangeOptions(model) {
    const priceRangeSelect = document.getElementById('bPriceRange');
    priceRangeSelect.innerHTML = priceRangeOptions[model]
        .map(option => `<option value="${option.value}">${option.label}</option>`)
        .join('');
}

function calculateCEnd() {
    const companyName = getValue('cCompanyName');
    const priceInput = getValue('cPrice');
    const monthlySalesInput = getValue('cMonthlySales');
    const price = Number(priceInput);
    const monthlySales = Number(monthlySalesInput);
    const category = document.getElementById('cCategory').value;
    const otherCategory = getValue('cOtherCategory');

    if (!companyName) return showError('请输入公司名称');
    if (!priceInput || !Number.isFinite(price) || price <= 0) return showError('请输入大于 0 的产品客单价');
    if (!monthlySalesInput || !Number.isInteger(monthlySales) || monthlySales < 0) return showError('请输入 0 或正整数的月销量');
    if (!category) return showError('请选择产品品类');
    if (category === 'other' && !otherCategory) return showError('请输入其他产品类型');

    const data = calculateCEndRevenue(price, monthlySales, category);
    const lead = {
        mode: 'c',
        companyName,
        price,
        monthlySales,
        category,
        productTypeText: category === 'other' ? otherCategory : data.categoryLabel,
        result: data
    };
    saveLeadSnapshot(lead);

    renderResult(document.getElementById('cResult'), [
        { label: '预估月销售额', value: formatMoney(data.sales) },
        { label: `预估月利润（毛利率 ${data.margin}%）`, value: formatMoney(data.profit), highlight: true },
        { label: '播放分成收益', value: formatMoney(data.viewRevenue) },
        { label: '合计月收益', value: formatMoney(data.total), large: true }
    ], 'c');
}

function calculateBEnd() {
    const companyName = getValue('bCompanyName');
    const productType = document.getElementById('bProductType').value;
    const priceRange = document.getElementById('bPriceRange').value;
    const selectedDealModel = document.getElementById('bDealModel').value;
    const hasVideo = document.getElementById('bHasVideo').value === 'true';
    const otherProductType = getValue('bOtherProductType');

    if (!companyName) return showError('请输入公司名称');
    if (!productType || !priceRange) return showError('请选择产品类型和项目金额范围');
    if (productType === 'other' && !otherProductType) return showError('请输入其他产品类型');

    const data = calculateBEndRevenue(productType, priceRange, hasVideo, selectedDealModel);
    const lead = {
        mode: 'b',
        companyName,
        productType,
        productTypeText: productType === 'other' ? otherProductType : data.productLabel,
        dealModel: data.dealModel,
        priceRange,
        hasVideo,
        result: data
    };
    saveLeadSnapshot(lead);

    const modelLabel = data.dealModel === 'project' ? '项目单' : '批量订单';
    const dealCountLabel = data.dealModel === 'project' ? '预估月成交项目数' : '预估月批量订单数';
    const revenueLabel = data.dealModel === 'project' ? '期望月项目成交额' : '期望月订单成交额';

    renderResult(document.getElementById('bResult'), [
        { label: '当前估算模型', value: modelLabel },
        { label: '预估月播放量', value: data.estimatedViews.toLocaleString() },
        { label: '预估月询盘数', value: `${data.estimatedInquiries} 个` },
        { label: `${dealCountLabel}（转化率 ${data.conversionRate}%）`, value: `${data.estimatedDeals} 个`, highlight: true },
        { label: revenueLabel, value: formatMoney(data.estimatedRevenue), large: true },
        { label: `期望月利润（按 ${data.grossMargin}% 毛利）`, value: formatMoney(data.estimatedProfit) }
    ], 'b');
}

function guideItems(mode) {
    if (mode === 'b') {
        return [
            '不要只看播放量，B 端要区分项目询盘、样品单、小批量订单和经销采购。',
            '包装材料、线缆、传感器等品类要把 MOQ、打样费、运费和复购周期提前讲清楚。',
            '项目型产品要展示真实安装、使用场景和交付能力，避免只放产品特写。',
            '高客单项目不要急着成交，先用案例、参数表、认证资料建立信任。',
            '询盘表单尽量收集国家、采购数量、预算、采购时间和应用场景，方便销售分层跟进。'
        ];
    }

    return [
        '不要只按销售额判断利润，样品、达人佣金、退货、平台费都要提前纳入模型。',
        '首批达人不要只找大号，先用小批量达人测试内容角度和转化率。',
        '美妆、食品、电子类产品要优先核查当地合规、功效宣称和认证要求。',
        '不要一开始就压大库存，先用内容测试和小批量备货验证动销。',
        '广告投放前要确认落地页、价格、物流时效和客服响应，否则播放量会被浪费。'
    ];
}

function openGuide(mode) {
    const lead = currentLead || JSON.parse(localStorage.getItem('latestTikTokCalculatorLead') || 'null');
    const productText = lead?.productTypeText ? `（${lead.productTypeText}）` : '';
    const title = mode === 'b' ? `B 端项目避坑指南${productText}` : `卖家出海避坑指南${productText}`;

    guideContent.innerHTML = `
        <p class="guide-lead">${lead?.companyName ? `${lead.companyName} 的测算已记录在本地浏览器。` : '建议先完成一次测算，再查看更贴合的指南。'}</p>
        <ol>
            ${guideItems(mode).map(item => `<li>${item}</li>`).join('')}
        </ol>
    `;
    document.getElementById('guideTitle').textContent = title;
    guideModal.hidden = false;
}

function closeGuide() {
    guideModal.hidden = true;
}

document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
        if (card.dataset.mode === 'c') showCEndForm();
        if (card.dataset.mode === 'b') showBEndForm();
    });
});

document.querySelectorAll('[data-back="mode"]').forEach(button => {
    button.addEventListener('click', showModeSelector);
});

document.getElementById('cCalculateBtn').addEventListener('click', calculateCEnd);
document.getElementById('bCalculateBtn').addEventListener('click', calculateBEnd);

document.getElementById('cCategory').addEventListener('change', () => {
    toggleConditionalField('cCategory', 'cOtherCategoryGroup');
});

document.getElementById('bProductType').addEventListener('change', () => {
    toggleConditionalField('bProductType', 'bOtherProductTypeGroup');
});

document.querySelectorAll('.segment-btn[data-b-model]').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('bDealModel').value = button.dataset.bModel;
        document.querySelectorAll('.segment-btn[data-b-model]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        renderBPriceRangeOptions(button.dataset.bModel);
    });
});

document.querySelectorAll('.toggle-btn[data-video]').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('bHasVideo').value = button.dataset.video;
        document.querySelectorAll('.toggle-btn[data-video]').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
    });
});

document.addEventListener('click', event => {
    const guideButton = event.target.closest('[data-guide]');
    if (guideButton) openGuide(guideButton.dataset.guide);
});

document.getElementById('guideCloseBtn').addEventListener('click', closeGuide);
guideModal.addEventListener('click', event => {
    if (event.target === guideModal) closeGuide();
});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeGuide();
});

['cCompanyName', 'cPrice', 'cMonthlySales', 'cOtherCategory'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', event => {
        if (event.key === 'Enter') calculateCEnd();
    });
});

['bCompanyName', 'bOtherProductType'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', event => {
        if (event.key === 'Enter') calculateBEnd();
    });
});

document.querySelector('[data-b-model="project"]').classList.add('active');
renderBPriceRangeOptions('project');
