// API 基础地址（本地运行）
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const configuredApiBase = window.APP_CONFIG?.API_BASE;
const API_BASE = configuredApiBase || (isLocalHost ? 'http://localhost:3000/api' : '/api');

function showError(message) {
    alert(message);
}

function getJsonOrThrow(response) {
    return response.json().then(data => {
        if (!response.ok || data.error) {
            throw new Error(data.error || '请求失败');
        }
        return data;
    });
}

function getTrimmedValue(id) {
    return document.getElementById(id).value.trim();
}

function toggleConditionalField(selectId, groupId) {
    const shouldShow = document.getElementById(selectId).value === 'other';
    const group = document.getElementById(groupId);
    group.style.display = shouldShow ? 'block' : 'none';

    if (!shouldShow) {
        const input = group.querySelector('input');
        if (input) input.value = '';
    }
}

// 当前激活的模式
let currentMode = null;

// DOM 元素
const modeSelector = document.getElementById('modeSelector');
const cEndForm = document.getElementById('cEndForm');
const bEndForm = document.getElementById('bEndForm');

// ============ 界面切换 ============
function showModeSelector() {
    modeSelector.classList.add('active');
    cEndForm.classList.remove('active');
    bEndForm.classList.remove('active');
    currentMode = null;
}

function showCEndForm() {
    modeSelector.classList.remove('active');
    cEndForm.classList.add('active');
    bEndForm.classList.remove('active');
    currentMode = 'c';
    // 清空之前的结果
    document.getElementById('cResult').style.display = 'none';
}

function showBEndForm() {
    modeSelector.classList.remove('active');
    cEndForm.classList.remove('active');
    bEndForm.classList.add('active');
    currentMode = 'b';
    document.getElementById('bResult').style.display = 'none';
}

// ============ C端计算 ============
async function calculateCEnd() {
    const companyName = getTrimmedValue('cCompanyName');
    const priceInput = document.getElementById('cPrice').value.trim();
    const monthlySalesInput = document.getElementById('cMonthlySales').value.trim();
    const price = Number(priceInput);
    const monthlySales = Number(monthlySalesInput);
    const category = document.getElementById('cCategory').value;
    const otherCategory = getTrimmedValue('cOtherCategory');

    // 验证输入
    if (!companyName) {
        showError('请输入公司名称');
        return;
    }

    if (!priceInput || !Number.isFinite(price) || price <= 0) {
        showError('请输入大于 0 的产品客单价');
        return;
    }

    if (!monthlySalesInput || !Number.isInteger(monthlySales) || monthlySales < 0) {
        showError('请输入 0 或正整数的月销量');
        return;
    }

    if (!category) {
        showError('请选择产品品类');
        return;
    }

    if (category === 'other' && !otherCategory) {
        showError('请输入其他产品类型');
        return;
    }

    const btn = document.getElementById('cCalculateBtn');
    const resultDiv = document.getElementById('cResult');

    btn.disabled = true;
    btn.textContent = '计算中...';

    try {
        const params = new URLSearchParams({ companyName, price, monthlySales, category, otherCategory });
        const response = await fetch(`${API_BASE}/calculate/c?${params}`);
        const data = await getJsonOrThrow(response);

        // 显示结果
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="result-item">
                <span class="result-label">预估月销售额</span>
                <span class="result-value">$${data.sales.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">预估月利润（毛利率 ${data.margin}%）</span>
                <span class="result-value highlight">$${data.profit.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">+ 播放分成收益</span>
                <span class="result-value">$${data.viewRevenue.toLocaleString()}</span>
            </div>
            <div class="result-item" style="border-top: 2px solid #e8ecff; margin-top: 8px; padding-top: 12px;">
                <span class="result-label" style="font-weight: 600;">合计月收益</span>
                <span class="result-value large">$${data.total.toLocaleString()}</span>
            </div>
            <button class="cta-btn" onclick="alert('请填写表单，销售顾问会联系您')">获取详细方案 → 现场顾问对接</button>
            <div class="note-text">* 以上基于同类账号数据模型估算，实际收益受内容质量影响</div>
        `;

    } catch (error) {
        console.error('计算失败:', error);
        showError(error.message || '计算失败，请稍后重试');
    } finally {
        btn.disabled = false;
        btn.textContent = '测算收益';
    }
}

// ============ B端计算 ============
async function calculateBEnd() {
    const companyName = getTrimmedValue('bCompanyName');
    const productType = document.getElementById('bProductType').value;
    const priceRange = document.getElementById('bPriceRange').value;
    const hasVideo = document.getElementById('bHasVideo').value;
    const otherProductType = getTrimmedValue('bOtherProductType');

    if (!companyName) {
        showError('请输入公司名称');
        return;
    }

    if (!productType || !priceRange) {
        showError('请选择产品类型和项目金额范围');
        return;
    }

    if (productType === 'other' && !otherProductType) {
        showError('请输入其他产品类型');
        return;
    }

    const btn = document.getElementById('bCalculateBtn');
    const resultDiv = document.getElementById('bResult');

    btn.disabled = true;
    btn.textContent = '计算中...';

    try {
        const params = new URLSearchParams({ companyName, productType, otherProductType, priceRange, hasVideo });
        const response = await fetch(`${API_BASE}/calculate/b?${params}`);
        const data = await getJsonOrThrow(response);

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="result-item">
                <span class="result-label">预估月播放量</span>
                <span class="result-value">${data.estimatedViews.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">预估月询盘数</span>
                <span class="result-value">${data.estimatedInquiries}个</span>
            </div>
            <div class="result-item">
                <span class="result-label">预估月成交项目数（成交率 ${data.winRate}%）</span>
                <span class="result-value highlight">${data.estimatedDeals}个</span>
            </div>
            <div class="result-item" style="border-top: 2px solid #e8ecff; margin-top: 8px; padding-top: 12px;">
                <span class="result-label" style="font-weight: 600;">期望月成交额</span>
                <span class="result-value large">$${data.estimatedRevenue.toLocaleString()}</span>
            </div>
            <div class="result-item">
                <span class="result-label">期望月利润（按15%毛利）</span>
                <span class="result-value">$${data.estimatedProfit.toLocaleString()}</span>
            </div>
            <button class="cta-btn" onclick="alert('请填写表单，项目顾问会联系您')">获取详细方案 → 现场顾问对接</button>
            <div class="note-text">* 基于真实B2B账号数据模型估算，含视频素材可提升30-50%播放量</div>
        `;

    } catch (error) {
        console.error('计算失败:', error);
        showError(error.message || '计算失败，请稍后重试');
    } finally {
        btn.disabled = false;
        btn.textContent = '测算收益';
    }
}

// ============ 事件绑定 ============
// 模式选择
document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        if (mode === 'c') {
            showCEndForm();
        } else if (mode === 'b') {
            showBEndForm();
        }
    });
});

// 返回按钮
document.querySelectorAll('[data-back="mode"]').forEach(btn => {
    btn.addEventListener('click', showModeSelector);
});

// C端计算按钮
document.getElementById('cCalculateBtn').addEventListener('click', calculateCEnd);

// B端计算按钮
document.getElementById('bCalculateBtn').addEventListener('click', calculateBEnd);

document.getElementById('cCategory').addEventListener('change', () => {
    toggleConditionalField('cCategory', 'cOtherCategoryGroup');
});

document.getElementById('bProductType').addEventListener('change', () => {
    toggleConditionalField('bProductType', 'bOtherProductTypeGroup');
});

// B端视频素材切换按钮
document.querySelectorAll('.toggle-btn[data-video]').forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.video === 'true';
        document.getElementById('bHasVideo').value = value;

        // 更新按钮样式
        document.querySelectorAll('.toggle-btn[data-video]').forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');
    });
});

// 输入框回车支持
document.getElementById('cPrice')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateCEnd();
});
document.getElementById('cMonthlySales')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateCEnd();
});
document.getElementById('cCompanyName')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateCEnd();
});
document.getElementById('cOtherCategory')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateCEnd();
});
document.getElementById('bCompanyName')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateBEnd();
});
document.getElementById('bOtherProductType')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') calculateBEnd();
});
