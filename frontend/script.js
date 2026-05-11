const marginMap = {
    beauty: { label: '美妆护肤', margin: 0.35 },
    clothing: { label: '服饰箱包', margin: 0.30 },
    home: { label: '家居生活', margin: 0.28 },
    electronics: { label: '3C 数码', margin: 0.20 },
    other: { label: '其他', margin: 0.25 }
};

const bProductMap = {
    parking_gate: { label: '停车场道闸', inquiryRate: 2.5, winRate: 0.20 },
    guidance_system: { label: '车位引导系统', inquiryRate: 1.8, winRate: 0.18 },
    lpr_camera: { label: '车牌识别摄像头', inquiryRate: 3.0, winRate: 0.25 },
    ev_charger: { label: '充电桩配套', inquiryRate: 2.0, winRate: 0.15 },
    other: { label: '其他软硬件', inquiryRate: 2.0, winRate: 0.18 }
};

const priceRangeMap = {
    '5k-10k': 7500,
    '10k-30k': 20000,
    '30k-50k': 40000,
    '50k+': 75000
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

function calculateBEndRevenue(productType, priceRange, hasVideo) {
    const config = bProductMap[productType];
    const avgProjectValue = priceRangeMap[priceRange];
    const estimatedViews = 5000 + (hasVideo ? 3000 : 0);
    const estimatedInquiries = (estimatedViews / 10000) * config.inquiryRate;
    const estimatedDeals = estimatedInquiries * config.winRate;
    const estimatedRevenue = estimatedDeals * avgProjectValue;

    return {
        productLabel: config.label,
        estimatedViews: Math.round(estimatedViews),
        estimatedInquiries: estimatedInquiries.toFixed(1),
        estimatedDeals: estimatedDeals.toFixed(1),
        estimatedRevenue: Math.round(estimatedRevenue),
        estimatedProfit: Math.round(estimatedRevenue * 0.15),
        avgProjectValue: Math.round(avgProjectValue),
        winRate: Math.round(config.winRate * 100)
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
    const hasVideo = document.getElementById('bHasVideo').value === 'true';
    const otherProductType = getValue('bOtherProductType');

    if (!companyName) return showError('请输入公司名称');
    if (!productType || !priceRange) return showError('请选择产品类型和项目金额范围');
    if (productType === 'other' && !otherProductType) return showError('请输入其他产品类型');

    const data = calculateBEndRevenue(productType, priceRange, hasVideo);
    const lead = {
        mode: 'b',
        companyName,
        productType,
        productTypeText: productType === 'other' ? otherProductType : data.productLabel,
        priceRange,
        hasVideo,
        result: data
    };
    saveLeadSnapshot(lead);

    renderResult(document.getElementById('bResult'), [
        { label: '预估月播放量', value: data.estimatedViews.toLocaleString() },
        { label: '预估月询盘数', value: `${data.estimatedInquiries} 个` },
        { label: `预估月成交项目数（成交率 ${data.winRate}%）`, value: `${data.estimatedDeals} 个`, highlight: true },
        { label: '期望月成交额', value: formatMoney(data.estimatedRevenue), large: true },
        { label: '期望月利润（按 15% 毛利）', value: formatMoney(data.estimatedProfit) }
    ], 'b');
}

function guideItems(mode) {
    if (mode === 'b') {
        return [
            '不要只看播放量，B 端更要跟踪询盘质量、采购角色和项目周期。',
            '视频素材要展示真实安装、使用场景和交付能力，避免只放产品特写。',
            '海外项目报价要提前算进物流、安装、售后、备件和认证成本。',
            '高客单项目不要急着成交，先用案例、参数表、认证资料建立信任。',
            '询盘表单尽量收集国家、预算、采购时间和项目规模，方便销售分层跟进。'
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
